import type { LeaderboardEntry } from "../types";
import { calculateScore } from "../scoring";
import { TOTAL_LEVELS } from "../constants";
import {
  computeNextLevel,
  type GameRunRecord,
  type LeaderboardStore,
  type ProgressEvent,
} from "./store";

type PgClient = {
  query: (
    sql: string,
    params?: unknown[]
  ) => Promise<{ rows: Record<string, unknown>[] }>;
  release: () => void;
};

type PgPool = {
  connect: () => Promise<PgClient>;
  end: () => Promise<void>;
};

async function loadPgPool(connectionString: string): Promise<PgPool> {
  const pg = await import("pg");
  const Pool = pg.Pool as unknown as new (opts: {
    connectionString: string;
    ssl?: { rejectUnauthorized: boolean };
  }) => PgPool;
  return new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });
}

function mapRun(r: Record<string, unknown>): GameRunRecord {
  return {
    runId: String(r.run_id),
    seed: String(r.seed),
    startedAt: Number(r.started_at),
    completedAt: r.completed_at != null ? Number(r.completed_at) : undefined,
    level: Number(r.level),
    secretsFound: Number(r.secrets_found ?? 0),
    hintsUsed: Number(r.hints_used ?? 0),
    skipsUsed: Number(r.skips_used ?? 0),
    ranked: Boolean(r.ranked),
    submitted: Boolean(r.submitted),
    clientSequence: Number(r.client_sequence ?? 0),
  };
}

export class PostgresLeaderboardStore implements LeaderboardStore {
  private url: string;

  constructor(url: string) {
    this.url = url;
  }

  isConfigured() {
    return Boolean(this.url);
  }

  private async withClient<T>(fn: (client: PgClient) => Promise<T>): Promise<T> {
    const pool = await loadPgPool(this.url);
    const client = await pool.connect();
    try {
      return await fn(client);
    } finally {
      client.release();
      await pool.end();
    }
  }

  async createRun(seed: string) {
    const runId = crypto.randomUUID();
    const startedAt = Date.now();
    await this.withClient((client) =>
      client.query(
        `INSERT INTO game_runs
          (run_id, seed, started_at, level, secrets_found, hints_used, skips_used, ranked, submitted, client_sequence, updated_at)
         VALUES ($1,$2,$3,1,0,0,0,true,false,0,$3)`,
        [runId, seed, startedAt]
      )
    );
    return { runId, seed, startedAt };
  }

  async getRun(runId: string) {
    const rows = await this.withClient((client) =>
      client.query(`SELECT * FROM game_runs WHERE run_id = $1`, [runId])
    );
    const r = rows.rows[0];
    if (!r) return null;
    return mapRun(r);
  }

  async applyProgress(
    runId: string,
    event: ProgressEvent,
    clientLevel: number,
    patch?: Partial<
      Pick<GameRunRecord, "secretsFound" | "hintsUsed" | "skipsUsed" | "ranked">
    >
  ) {
    return this.withClient(async (client) => {
      await client.query("BEGIN");
      try {
        const res = await client.query(
          `SELECT * FROM game_runs WHERE run_id = $1 FOR UPDATE`,
          [runId]
        );
        const row = res.rows[0];
        if (!row) {
          await client.query("ROLLBACK");
          return { ok: false as const, error: "Run not found." };
        }
        const run = mapRun(row);
        if (run.submitted) {
          await client.query("ROLLBACK");
          return { ok: false as const, error: "Already finished." };
        }
        if (clientLevel !== run.level) {
          await client.query("ROLLBACK");
          return { ok: false as const, error: "Level mismatch." };
        }
        const next = computeNextLevel(run.level, event);
        let ranked = run.ranked;
        if (patch?.ranked === false) ranked = false;
        const hintsUsed = Math.max(run.hintsUsed, patch?.hintsUsed ?? 0);
        const skipsUsed = Math.max(run.skipsUsed, patch?.skipsUsed ?? 0);
        if (hintsUsed > 0 || skipsUsed > 0) ranked = false;
        const secretsFound = Math.max(
          run.secretsFound,
          patch?.secretsFound ?? 0
        );
        const now = Date.now();
        await client.query(
          `UPDATE game_runs SET
            level = $2,
            secrets_found = $3,
            hints_used = $4,
            skips_used = $5,
            ranked = $6,
            client_sequence = client_sequence + 1,
            updated_at = $7,
            completed_at = CASE WHEN $2::int >= $8::int THEN COALESCE(completed_at, $7) ELSE completed_at END
           WHERE run_id = $1`,
          [
            runId,
            next,
            secretsFound,
            hintsUsed,
            skipsUsed,
            ranked,
            now,
            TOTAL_LEVELS,
          ]
        );
        await client.query("COMMIT");
        return { ok: true as const, level: next };
      } catch (e) {
        await client.query("ROLLBACK");
        throw e;
      }
    });
  }

  async finishRun(
    runId: string,
    data: {
      displayName: string;
      secretsFound: number;
      hintsUsed: number;
      skipsUsed: number;
      ranked: boolean;
    }
  ) {
    return this.withClient(async (client) => {
      await client.query("BEGIN");
      try {
        const res = await client.query(
          `SELECT * FROM game_runs WHERE run_id = $1 FOR UPDATE`,
          [runId]
        );
        const row = res.rows[0];
        if (!row) {
          await client.query("ROLLBACK");
          return null;
        }
        const run = mapRun(row);
        if (run.submitted) {
          const existing = await client.query(
            `SELECT elapsed_seconds, score FROM game_scores WHERE run_id = $1`,
            [runId]
          );
          await client.query("COMMIT");
          const e = existing.rows[0];
          if (e) {
            return {
              score: Number(e.score ?? 0),
              elapsedSeconds: Number(e.elapsed_seconds),
            };
          }
          return null;
        }
        if (run.level < TOTAL_LEVELS) {
          await client.query("ROLLBACK");
          return null;
        }

        const completedAt = run.completedAt ?? Date.now();
        const elapsedSeconds = Math.max(
          0,
          Math.floor((completedAt - run.startedAt) / 1000)
        );
        if (elapsedSeconds < 60) {
          await client.query("ROLLBACK");
          return null;
        }

        const ranked =
          data.ranked &&
          run.ranked &&
          data.hintsUsed === 0 &&
          data.skipsUsed === 0 &&
          run.hintsUsed === 0 &&
          run.skipsUsed === 0;

        const secretsFound = Math.max(data.secretsFound, run.secretsFound);
        const score = calculateScore({ elapsedSeconds, secretsFound });

        await client.query(
          `UPDATE game_runs SET submitted = true, ranked = $2, secrets_found = $3, completed_at = COALESCE(completed_at, $4), updated_at = $4
           WHERE run_id = $1`,
          [runId, ranked, secretsFound, completedAt]
        );

        if (ranked) {
          await client.query(
            `INSERT INTO game_scores (run_id, display_name, elapsed_seconds, secrets_found, score, ranked, completed_at)
             VALUES ($1,$2,$3,$4,$5,true,$6)
             ON CONFLICT (run_id) DO NOTHING`,
            [
              runId,
              data.displayName,
              elapsedSeconds,
              secretsFound,
              score,
              completedAt,
            ]
          );
        }

        await client.query("COMMIT");
        return { score, elapsedSeconds };
      } catch (e) {
        await client.query("ROLLBACK");
        throw e;
      }
    });
  }

  async topEntries(limit = 10) {
    const rows = await this.withClient((client) =>
      client.query(
        `SELECT display_name, elapsed_seconds, secrets_found, score, completed_at
         FROM game_scores
         WHERE ranked = true
         ORDER BY elapsed_seconds ASC, secrets_found DESC, completed_at ASC
         LIMIT $1`,
        [limit]
      )
    );
    return rows.rows.map((r, i) => ({
      rank: i + 1,
      displayName: String(r.display_name),
      elapsedSeconds: Number(r.elapsed_seconds),
      secretsFound: Number(r.secrets_found),
      completedAt: new Date(Number(r.completed_at)).toISOString(),
      score: r.score != null ? Number(r.score) : undefined,
    })) satisfies LeaderboardEntry[];
  }

  async stats() {
    const rows = await this.withClient((client) =>
      client.query(
        `SELECT COUNT(*)::int AS n, MIN(elapsed_seconds) AS best
         FROM game_scores WHERE ranked = true`
      )
    );
    const r = rows.rows[0];
    return {
      bestTime: r?.best != null ? Number(r.best) : null,
      completions: Number(r?.n ?? 0),
    };
  }
}
