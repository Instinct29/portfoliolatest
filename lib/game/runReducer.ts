import {
  ABANDON_RANKED_HOURS,
  MAX_HINTS_PER_RUN,
  MAX_LEVEL_FAILURES_BEFORE_ROLLBACK,
  MAX_SKIPS_PER_RUN,
  RETRY_FAILURE_MESSAGES,
  ROLLBACK_FAILURE_MESSAGE,
  SUCCESS_MESSAGES,
  TOTAL_LEVELS,
} from "./constants";
import { memoryAfterRollback, rollbackLevel } from "./memoryOwnership";
import { createFreshRun } from "./persistence";
import type { GameRun, RunMemory, RunMode } from "./types";

export type StagePhase =
  | "entering"
  | "active"
  | "resolving-success"
  | "resolving-fail"
  | "exiting"
  | "rollback-transition"
  | "cinematic"
  | "locked";

export type GameAction =
  | { type: "HYDRATE"; run: GameRun }
  | {
      type: "ACTIVATE";
      mode: GameRun["runMode"];
      serverStartedAt?: number;
      runId?: string;
    }
  | { type: "SUCCEED" }
  | { type: "FAIL"; message?: string }
  | { type: "UPDATE_MEMORY"; memory: Partial<RunMemory> }
  | { type: "COLLECT_SECRET"; id: number }
  | { type: "GRANT_LIFE" }
  | { type: "USE_HINT" }
  | { type: "USE_SKIP" }
  | { type: "FAIL_TRANSITION_DONE" }
  | { type: "EXIT_TRANSITION_DONE" }
  | { type: "COMPLETE" }
  | { type: "NEW_RUN"; seed?: string; debug?: boolean }
  | { type: "MARK_LEVEL1_COMPLETE" }
  | { type: "SET_LEVEL"; level: number; debug?: boolean }
  | { type: "SUBMITTED" }
  | { type: "SET_PHASE"; phase: StagePhase }
  | { type: "ADD_ACTIVE_MS"; ms: number };

export type GameState = {
  run: GameRun;
  /**
   * The level whose component is actually mounted on screen. `run.level`
   * is the authoritative/logical level and can change the instant a
   * success or rollback resolves (scoring, server calls, memory scrub all
   * need that immediately). `displayedLevel` deliberately lags behind it
   * during "exiting"/"resolving-fail" so the level that just finished
   * stays visible — and animates out — instead of the next level's
   * content flashing in before its own enter animation has even started.
   * It only catches up to `run.level` once EXIT_TRANSITION_DONE /
   * FAIL_TRANSITION_DONE fires, right as "entering" begins.
   */
  displayedLevel: number;
  failureMessage: string | null;
  failureKey: number;
  /** Invisible chances used at the current level: 0, 1 or 2. Never shown/scored. */
  levelFailCount: number;
  /** Whether the pending "resolving-fail" beat ends in a same-level retry or a rollback. */
  pendingFailKind: "retry" | "rollback" | null;
  successMessage: string | null;
  successKey: number;
  showHintOffer: boolean;
  phase: StagePhase;
  /** Target level while resolving a fail (same level for retry, rollback target otherwise). */
  pendingRollback: number | null;
};

export function initialGameState(run?: GameRun | null): GameState {
  const resolvedRun = run ?? createFreshRun();
  return {
    run: resolvedRun,
    displayedLevel: resolvedRun.level,
    failureMessage: null,
    failureKey: 0,
    levelFailCount: 0,
    pendingFailKind: null,
    successMessage: null,
    successKey: 0,
    showHintOffer: false,
    phase: "active",
    pendingRollback: null,
  };
}

function retryFailureText(attempt: number, custom?: string): string {
  if (custom) return custom;
  const idx = Math.min(Math.max(0, attempt - 1), RETRY_FAILURE_MESSAGES.length - 1);
  return RETRY_FAILURE_MESSAGES[idx]!;
}

function successText(level: number): string {
  return SUCCESS_MESSAGES[level % SUCCESS_MESSAGES.length]!;
}

function isInteractive(phase: StagePhase): boolean {
  return phase === "active" || phase === "entering";
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "HYDRATE":
      return {
        ...state,
        run: action.run,
        displayedLevel: action.run.level,
        phase: action.run.completed ? "locked" : "active",
        pendingRollback: null,
        pendingFailKind: null,
      };

    case "NEW_RUN": {
      const run = createFreshRun(action.seed);
      if (action.debug) {
        run.runMode = "debug";
        run.ranked = false;
      }
      return { ...initialGameState(run) };
    }

    case "SET_LEVEL": {
      const run = { ...state.run, level: action.level };
      if (action.debug) {
        run.runMode = "debug";
        run.ranked = false;
        if (!run.startedAt) run.startedAt = Date.now();
      }
      return {
        ...state,
        run,
        displayedLevel: action.level,
        levelFailCount: 0,
        pendingFailKind: null,
        showHintOffer: false,
        phase: "active",
        pendingRollback: null,
        failureMessage: null,
        successMessage: null,
      };
    }

    case "ACTIVATE": {
      if (state.run.runMode !== "pending") return state;
      const now = Date.now();
      return {
        ...state,
        run: {
          ...state.run,
          runMode: action.mode,
          ranked: action.mode === "ranked",
          startedAt: now,
          serverStartedAt: action.serverStartedAt ?? now,
          runId: action.runId ?? state.run.runId,
          activePlayMs: state.run.activePlayMs ?? 0,
        },
      };
    }

    case "MARK_LEVEL1_COMPLETE":
      return {
        ...state,
        run: { ...state.run, level1Complete: true },
      };

    case "UPDATE_MEMORY": {
      const next = { ...state.run.memory };
      let changed = false;
      for (const [k, v] of Object.entries(action.memory)) {
        const key = k as keyof RunMemory;
        if (next[key] !== v) {
          (next as Record<string, unknown>)[key] = v;
          changed = true;
        }
      }
      if (!changed) return state;
      return {
        ...state,
        run: { ...state.run, memory: next },
      };
    }

    case "COLLECT_SECRET": {
      if (state.run.secrets.includes(action.id)) return state;
      return {
        ...state,
        run: {
          ...state.run,
          secrets: [...state.run.secrets, action.id].sort((a, b) => a - b),
        },
      };
    }

    case "GRANT_LIFE":
      // Lives retired — no-op for any residual level calls.
      return state;

    case "SUCCEED": {
      if (state.run.completed) return state;
      if (
        !isInteractive(state.phase) &&
        state.phase !== "resolving-success"
      ) {
        return state;
      }
      if (
        state.phase === "rollback-transition" ||
        state.phase === "locked" ||
        state.phase === "resolving-fail"
      ) {
        return state;
      }
      const fromLevel = state.run.level;
      const nextLevel = fromLevel + 1;
      if (nextLevel > TOTAL_LEVELS) {
        return {
          ...state,
          phase: "locked",
          run: {
            ...state.run,
            completed: true,
            completedAt: Date.now(),
            runMode: "completed",
          },
          levelFailCount: 0,
          pendingFailKind: null,
          showHintOffer: false,
          failureMessage: null,
          successMessage: null,
        };
      }
      return {
        ...state,
        phase: "exiting",
        run: { ...state.run, level: nextLevel },
        // displayedLevel intentionally NOT updated here — the level that
        // just succeeded stays on screen through its exit animation.
        // EXIT_TRANSITION_DONE catches it up once that beat finishes.
        levelFailCount: 0,
        pendingFailKind: null,
        showHintOffer: false,
        failureMessage: null,
        successMessage: successText(fromLevel),
        successKey: state.successKey + 1,
      };
    }

    case "FAIL": {
      if (
        state.phase === "rollback-transition" ||
        state.phase === "locked" ||
        state.phase === "resolving-fail" ||
        state.phase === "exiting" ||
        state.phase === "resolving-success" ||
        state.phase === "cinematic"
      ) {
        return state;
      }

      const fromLevel = state.run.level;
      const attempts = state.levelFailCount + 1;
      const levelAttempts = {
        ...state.run.levelAttempts,
        [fromLevel]: (state.run.levelAttempts[fromLevel] ?? 0) + 1,
      };

      // Invisible chances #1 and #2: same-level retry, no rollback, no server call.
      if (attempts < MAX_LEVEL_FAILURES_BEFORE_ROLLBACK) {
        return {
          ...state,
          phase: "resolving-fail",
          pendingRollback: fromLevel,
          pendingFailKind: "retry",
          run: {
            ...state.run,
            failCount: state.run.failCount + 1,
            levelAttempts,
          },
          levelFailCount: attempts,
          failureMessage: retryFailureText(attempts, action.message),
          failureKey: state.failureKey + 1,
          showHintOffer: false,
        };
      }

      // Invisible chance #3: authoritative BACK 5 rollback. Count resets now.
      const target = rollbackLevel(fromLevel);
      return {
        ...state,
        phase: "resolving-fail",
        pendingRollback: target,
        pendingFailKind: "rollback",
        run: {
          ...state.run,
          failCount: state.run.failCount + 1,
          levelAttempts,
          memory: memoryAfterRollback(state.run.memory, target),
          // Level jumps after FAIL_TRANSITION_DONE so UI can show BACK 5.
        },
        levelFailCount: 0,
        failureMessage: action.message ?? ROLLBACK_FAILURE_MESSAGE,
        failureKey: state.failureKey + 1,
        showHintOffer: false,
      };
    }

    case "FAIL_TRANSITION_DONE": {
      if (
        state.phase !== "resolving-fail" &&
        state.phase !== "rollback-transition"
      ) {
        return state;
      }
      const target = state.pendingRollback ?? state.run.level;
      return {
        ...state,
        phase: "entering",
        displayedLevel: target,
        pendingRollback: null,
        pendingFailKind: null,
        run: {
          ...state.run,
          level: target,
          memory: memoryAfterRollback(state.run.memory, target),
        },
        // levelFailCount is NOT reset here: FAIL already set the right value
        // for both outcomes (attempt count for a retry, 0 for a rollback).
        showHintOffer: false,
        failureMessage: null,
        failureKey: state.failureKey + 1,
      };
    }

    case "EXIT_TRANSITION_DONE": {
      if (state.phase !== "exiting") return state;
      return {
        ...state,
        phase: "entering",
        displayedLevel: state.run.level,
      };
    }

    case "USE_HINT": {
      if (state.run.hintsUsed >= MAX_HINTS_PER_RUN) return state;
      return {
        ...state,
        run: {
          ...state.run,
          hintsUsed: state.run.hintsUsed + 1,
          ranked: false,
          runMode:
            state.run.runMode === "debug" ? "debug" : ("assisted" as RunMode),
        },
        showHintOffer: false,
      };
    }

    case "USE_SKIP": {
      // Skips retired in beta.
      if (MAX_SKIPS_PER_RUN <= 0) return state;
      if (state.run.skipsUsed >= MAX_SKIPS_PER_RUN) return state;
      return state;
    }

    case "COMPLETE":
      return {
        ...state,
        phase: "locked",
        run: {
          ...state.run,
          completed: true,
          completedAt: Date.now(),
          runMode: "completed",
        },
      };

    case "SUBMITTED":
      return {
        ...state,
        run: { ...state.run, submitted: true },
      };

    case "SET_PHASE":
      return { ...state, phase: action.phase };

    case "ADD_ACTIVE_MS":
      return {
        ...state,
        run: {
          ...state.run,
          activePlayMs: (state.run.activePlayMs ?? 0) + Math.max(0, action.ms),
        },
      };

    default:
      return state;
  }
}

export function isRunAbandoned(run: GameRun): boolean {
  if (!run.startedAt) return false;
  const hours = (Date.now() - run.startedAt) / (1000 * 60 * 60);
  return hours > ABANDON_RANKED_HOURS;
}

export function elapsedSeconds(run: GameRun): number {
  if (typeof run.activePlayMs === "number" && run.activePlayMs > 0) {
    return Math.max(0, Math.floor(run.activePlayMs / 1000));
  }
  if (!run.startedAt) return 0;
  const end = run.completedAt ?? Date.now();
  return Math.max(0, Math.floor((end - run.startedAt) / 1000));
}
