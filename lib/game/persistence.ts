import {
  GAME_SCHEMA_VERSION,
  SECRET_IDS,
  STORAGE_KEY_BEST,
  STORAGE_KEY_RUN_LEGACY,
  TOTAL_LEVELS,
} from "./constants";
import { createRunSeed } from "./random";
import { SCORING_VERSION } from "./scoring";
import type { GameRun, PersonalBest, RunMemory, RunMode } from "./types";

export function createFreshRun(seed?: string): GameRun {
  return {
    schemaVersion: GAME_SCHEMA_VERSION,
    runId: createRunSeed(),
    seed: seed ?? createRunSeed(),
    startedAt: null,
    serverStartedAt: null,
    level: 1,
    hintsUsed: 0,
    skipsUsed: 0,
    failCount: 0,
    secrets: [],
    memory: {},
    runMode: "pending",
    ranked: false,
    completed: false,
    completedAt: null,
    level1Complete: false,
    levelAttempts: {},
    submitted: false,
    activePlayMs: 0,
    scoringVersion: SCORING_VERSION,
  };
}

function isRunMode(v: unknown): v is RunMode {
  return (
    v === "pending" ||
    v === "ranked" ||
    v === "local" ||
    v === "assisted" ||
    v === "debug" ||
    v === "completed"
  );
}

function sanitizeMemory(raw: unknown): RunMemory {
  if (!raw || typeof raw !== "object") return {};
  const m = raw as Record<string, unknown>;
  const out: RunMemory = {};
  if (
    m.chosenDoor === "A" ||
    m.chosenDoor === "B" ||
    m.chosenDoor === "C" ||
    m.chosenDoor === "D"
  ) {
    out.chosenDoor = m.chosenDoor;
  }
  if (typeof m.chosenColor === "string") out.chosenColor = m.chosenColor;
  if (typeof m.chosenNumber === "number") out.chosenNumber = m.chosenNumber;
  if (typeof m.forgottenPhrase === "string")
    out.forgottenPhrase = m.forgottenPhrase;
  if (typeof m.forgottenAdjective === "string")
    out.forgottenAdjective = m.forgottenAdjective;
  if (typeof m.forgottenNoun === "string") out.forgottenNoun = m.forgottenNoun;
  if (typeof m.forgottenNumber === "number")
    out.forgottenNumber = m.forgottenNumber;
  if (
    Array.isArray(m.sequence51) &&
    m.sequence51.every((x) => typeof x === "string")
  )
    out.sequence51 = m.sequence51 as string[];
  if (
    Array.isArray(m.sequence53) &&
    m.sequence53.every((x) => typeof x === "string")
  )
    out.sequence53 = m.sequence53 as string[];
  if (typeof m.animal56 === "string") out.animal56 = m.animal56;
  if (typeof m.animalNumber56 === "number")
    out.animalNumber56 = m.animalNumber56;
  if (typeof m.flashedSymbol41 === "string")
    out.flashedSymbol41 = m.flashedSymbol41;
  if (
    m.currentSafeRule === "RED" ||
    m.currentSafeRule === "GREEN" ||
    m.currentSafeRule === "BLUE" ||
    m.currentSafeRule === "NONE"
  ) {
    out.currentSafeRule = m.currentSafeRule;
  }
  if (m.level16Answer === "YES" || m.level16Answer === "NO")
    out.level16Answer = m.level16Answer;
  if (m.level45First === "YES" || m.level45First === "NO")
    out.level45First = m.level45First;
  if (typeof m.livesAt50 === "number") out.livesAt50 = m.livesAt50;
  return out;
}

/** Unfinished runs are never restored. Legacy keys are wiped. */
export function clearUnfinishedRunStorage(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(STORAGE_KEY_RUN_LEGACY);
    window.localStorage.removeItem("mg-definitely-possible-run-v2");
  } catch {
    /* private mode */
  }
}

export function loadRun(): GameRun | null {
  // One-session game: never restore unfinished progress.
  clearUnfinishedRunStorage();
  return null;
}

export function saveRun(run: GameRun): void {
  // Only completed runs contribute to durable personal best (via mergePersonalBest).
  void run;
  clearUnfinishedRunStorage();
}

export function parseStoredRun(_raw: unknown): GameRun | null {
  // Schema v2: unfinished runs are not durable.
  return null;
}

export function loadPersonalBest(): PersonalBest | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY_BEST);
    if (!raw) return null;
    const o = JSON.parse(raw) as Record<string, unknown>;
    if (typeof o.bestTimeSeconds !== "number") return null;
    return {
      bestTimeSeconds: o.bestTimeSeconds,
      secretsFound: typeof o.secretsFound === "number" ? o.secretsFound : 0,
      completedRuns: typeof o.completedRuns === "number" ? o.completedRuns : 1,
      score: typeof o.score === "number" ? o.score : undefined,
    };
  } catch {
    return null;
  }
}

export function mergePersonalBest(
  run: GameRun,
  elapsedSeconds: number,
  score?: number
): PersonalBest {
  const prev = loadPersonalBest();
  const next: PersonalBest = {
    bestTimeSeconds: prev
      ? Math.min(prev.bestTimeSeconds, elapsedSeconds)
      : elapsedSeconds,
    secretsFound: Math.max(prev?.secretsFound ?? 0, run.secrets.length),
    completedRuns: (prev?.completedRuns ?? 0) + 1,
    score:
      score !== undefined
        ? Math.max(prev?.score ?? 0, score)
        : prev?.score,
  };
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(STORAGE_KEY_BEST, JSON.stringify(next));
    } catch {
      /* */
    }
  }
  return next;
}

export function secretsValid(ids: number[]): boolean {
  return ids.every((id) => (SECRET_IDS as readonly number[]).includes(id));
}

export { sanitizeMemory, TOTAL_LEVELS, GAME_SCHEMA_VERSION };
