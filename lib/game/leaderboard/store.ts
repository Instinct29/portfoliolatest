import type { LeaderboardEntry } from "../types";
import { calculateScore } from "../scoring";
import { rollbackLevel } from "../memoryOwnership";
import { TOTAL_LEVELS } from "../constants";

export type GameRunRecord = {
  runId: string;
  seed: string;
  startedAt: number;
  completedAt?: number;
  level: number;
  secretsFound: number;
  hintsUsed: number;
  skipsUsed: number;
  ranked: boolean;
  submitted: boolean;
  clientSequence: number;
};

export type ProgressEvent = "success" | "failure";

export interface LeaderboardStore {
  isConfigured(): boolean;
  createRun(seed: string): Promise<{
    runId: string;
    seed: string;
    startedAt: number;
  }>;
  getRun(runId: string): Promise<GameRunRecord | null>;
  applyProgress(
    runId: string,
    event: ProgressEvent,
    clientLevel: number,
    patch?: Partial<
      Pick<GameRunRecord, "secretsFound" | "hintsUsed" | "skipsUsed" | "ranked">
    >
  ): Promise<{ ok: true; level: number } | { ok: false; error: string }>;
  finishRun(
    runId: string,
    data: {
      displayName: string;
      secretsFound: number;
      hintsUsed: number;
      skipsUsed: number;
      ranked: boolean;
    }
  ): Promise<{ score: number; elapsedSeconds: number } | null>;
  topEntries(limit?: number): Promise<LeaderboardEntry[]>;
  stats(): Promise<{ bestTime: number | null; completions: number }>;
}

const runs = new Map<string, GameRunRecord>();

export function computeNextLevel(
  current: number,
  event: ProgressEvent
): number {
  if (event === "success") {
    return Math.min(TOTAL_LEVELS, current + 1);
  }
  return rollbackLevel(current);
}

export class MemoryLeaderboardStore implements LeaderboardStore {
  isConfigured() {
    return false;
  }

  async createRun(seed: string) {
    const runId = crypto.randomUUID();
    const startedAt = Date.now();
    runs.set(runId, {
      runId,
      seed,
      startedAt,
      level: 1,
      secretsFound: 0,
      hintsUsed: 0,
      skipsUsed: 0,
      ranked: true,
      submitted: false,
      clientSequence: 0,
    });
    return { runId, seed, startedAt };
  }

  async getRun(runId: string) {
    return runs.get(runId) ?? null;
  }

  async applyProgress(
    runId: string,
    event: ProgressEvent,
    clientLevel: number,
    patch?: Partial<GameRunRecord>
  ) {
    const r = runs.get(runId);
    if (!r) return { ok: false as const, error: "Run not found." };
    if (r.submitted) return { ok: false as const, error: "Already finished." };
    // Client sends the level being resolved (= current server level).
    if (clientLevel !== r.level) {
      return { ok: false as const, error: "Level mismatch." };
    }
    const next = computeNextLevel(r.level, event);
    let ranked = r.ranked;
    if (patch?.ranked === false) ranked = false;
    if ((patch?.hintsUsed ?? 0) > 0 || r.hintsUsed > 0) ranked = false;
    if ((patch?.skipsUsed ?? 0) > 0 || r.skipsUsed > 0) ranked = false;
    runs.set(runId, {
      ...r,
      level: next,
      secretsFound: Math.max(r.secretsFound, patch?.secretsFound ?? 0),
      hintsUsed: Math.max(r.hintsUsed, patch?.hintsUsed ?? 0),
      skipsUsed: Math.max(r.skipsUsed, patch?.skipsUsed ?? 0),
      ranked,
      clientSequence: r.clientSequence + 1,
    });
    return { ok: true as const, level: next };
  }

  async finishRun() {
    return null;
  }

  async topEntries() {
    return [];
  }

  async stats() {
    return { bestTime: null, completions: 0 };
  }
}

let store: LeaderboardStore | null = null;
let storePromise: Promise<LeaderboardStore> | null = null;

export async function getLeaderboardStore(): Promise<LeaderboardStore> {
  if (store) return store;
  if (!storePromise) {
    storePromise = (async () => {
      const url = process.env.DATABASE_URL || process.env.POSTGRES_URL;
      if (url) {
        try {
          const { PostgresLeaderboardStore } = await import("./store-postgres");
          store = new PostgresLeaderboardStore(url);
          return store;
        } catch {
          store = new MemoryLeaderboardStore();
          return store;
        }
      }
      store = new MemoryLeaderboardStore();
      return store;
    })();
  }
  return storePromise;
}

export { calculateScore };
