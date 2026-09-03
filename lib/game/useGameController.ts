"use client";

import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import { track } from "@vercel/analytics";
import {
  gameReducer,
  initialGameState,
  elapsedSeconds,
  isRunAbandoned,
} from "./runReducer";
import {
  loadRun,
  saveRun,
  createFreshRun,
  mergePersonalBest,
  clearUnfinishedRunStorage,
} from "./persistence";
import { calculateScore, formatElapsed } from "./scoring";
import { isRankedEligible } from "./logic";
import {
  LEVEL_ENTER_MS,
  LEVEL_FAIL_RETRY_MS,
  LEVEL_FAIL_ROLLBACK_MS,
  LEVEL_SUCCESS_HOLD_MS,
  TOTAL_LEVELS,
} from "./constants";
import { hintForLevel } from "./hints";
import type { RunMemory } from "./types";

export function useGameController(options?: { teaser?: boolean }) {
  const [state, dispatch] = useReducer(gameReducer, undefined, () =>
    initialGameState(null)
  );
  const [hydrated, setHydrated] = useState(false);
  const [hintText, setHintText] = useState<string | null>(null);
  const [rollbackNotice, setRollbackNotice] = useState(false);
  const [tick, setTick] = useState(0);

  const progressClickEnabled = useRef(false);
  const progressHundredEnabled = useRef(false);
  /**
   * A level with its own internal sub-rounds (L96's exam) can register a
   * local success handler here so clicking the header's level number
   * resolves THAT round instead of unconditionally completing the whole
   * outer level — which is what plain `succeed()` would do.
   */
  const progressLevelSuccessOverride = useRef<(() => void) | null>(null);
  const activating = useRef(false);
  const startPromise = useRef<Promise<void> | null>(null);
  const runRef = useRef(state.run);
  const phaseRef = useRef(state.phase);
  const progressQueue = useRef<
    { event: "success" | "failure"; level: number }[]
  >([]);
  const activeSliceStart = useRef<number | null>(null);

  runRef.current = state.run;
  phaseRef.current = state.phase;

  useEffect(() => {
    clearUnfinishedRunStorage();
    loadRun(); // always null — one-session
    dispatch({ type: "HYDRATE", run: createFreshRun() });
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    saveRun(state.run);
  }, [state.run, hydrated]);

  useEffect(() => {
    progressClickEnabled.current = false;
    progressHundredEnabled.current = false;
    setHintText(null);
  }, [state.run.level]);

  // Success holds long enough to read ("CORRECT."/"NICE.") while the level
  // that just finished plays its exit animation — displayedLevel only
  // catches up to run.level once that hold ends, so the next level's
  // content never flashes in before its own enter animation starts.
  // Entering (after that catch-up, or after a retry/rollback) is just the
  // level's mount animation, so it stays quick.
  useEffect(() => {
    if (state.phase === "exiting") {
      const t = setTimeout(() => {
        dispatch({ type: "EXIT_TRANSITION_DONE" });
      }, LEVEL_SUCCESS_HOLD_MS);
      return () => clearTimeout(t);
    }
    if (state.phase === "entering") {
      const t = setTimeout(() => {
        dispatch({ type: "SET_PHASE", phase: "active" });
      }, LEVEL_ENTER_MS);
      return () => clearTimeout(t);
    }
  }, [state.displayedLevel, state.phase]);

  const flushProgress = useCallback(
    async (event: "success" | "failure", level: number) => {
      const run = runRef.current;
      if (!run.runId || run.runMode === "pending") {
        progressQueue.current.push({ event, level });
        return;
      }
      try {
        await fetch("/api/game/progress", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            runId: run.runId,
            event,
            level,
            secretsFound: run.secrets.length,
            hintsUsed: run.hintsUsed,
            skipsUsed: run.skipsUsed,
            ranked: isRankedEligible(run) && !isRunAbandoned(run),
          }),
        });
      } catch {
        /* offline */
      }
    },
    []
  );

  // Fail #1/#2 → brief "NOPE." beat → same-level retry, no server call.
  // Fail #3 → longer "THAT'S THREE." / BACK 5 beat → authoritative rollback.
  useEffect(() => {
    if (state.phase !== "resolving-fail") {
      setRollbackNotice(false);
      return;
    }
    const isRollback = state.pendingFailKind === "rollback";
    setRollbackNotice(isRollback);
    const failedLevel = runRef.current.level;
    const delay = isRollback ? LEVEL_FAIL_ROLLBACK_MS : LEVEL_FAIL_RETRY_MS;
    const t = setTimeout(() => {
      dispatch({ type: "FAIL_TRANSITION_DONE" });
      setRollbackNotice(false);
      if (isRollback) {
        void flushProgress("failure", failedLevel);
      }
    }, delay);
    return () => clearTimeout(t);
  }, [
    state.phase,
    state.failureKey,
    state.pendingRollback,
    state.pendingFailKind,
    flushProgress,
  ]);

  // Active-play timer — keeps running while tab exists; refresh abandons run
  useEffect(() => {
    if (
      !hydrated ||
      state.run.runMode === "pending" ||
      state.run.completed ||
      options?.teaser
    ) {
      activeSliceStart.current = null;
      return;
    }

    // Beta policy: timer keeps running while the tab/process exists.
    // Refresh or close abandons the unfinished run entirely.
    activeSliceStart.current = Date.now();
    const id = setInterval(() => {
      const start = activeSliceStart.current;
      if (start == null) {
        activeSliceStart.current = Date.now();
        return;
      }
      const now = Date.now();
      const delta = now - start;
      activeSliceStart.current = now;
      if (delta > 0 && delta < 10_000) {
        dispatch({ type: "ADD_ACTIVE_MS", ms: delta });
      }
      setTick((t) => t + 1);
    }, 1000);

    return () => {
      clearInterval(id);
      const start = activeSliceStart.current;
      if (start != null) {
        const delta = Date.now() - start;
        if (delta > 0 && delta < 10_000) {
          dispatch({ type: "ADD_ACTIVE_MS", ms: delta });
        }
      }
      activeSliceStart.current = null;
    };
  }, [hydrated, state.run.runMode, state.run.completed, options?.teaser]);

  const activate = useCallback(async () => {
    if (runRef.current.runMode !== "pending" || activating.current) {
      return startPromise.current ?? Promise.resolve();
    }
    activating.current = true;
    const seed = runRef.current.seed;
    startPromise.current = (async () => {
      let activatedRunId: string | undefined;
      let activatedMode: "ranked" | "local" = "local";
      try {
        const res = await fetch("/api/game/start", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ seed }),
        });
        if (res.ok) {
          const data = (await res.json()) as {
            runId: string;
            startedAt: number;
            ranked: boolean;
          };
          activatedRunId = data.runId;
          activatedMode = data.ranked ? "ranked" : "local";
          dispatch({
            type: "ACTIVATE",
            mode: activatedMode,
            serverStartedAt: data.startedAt,
            runId: activatedRunId,
          });
          track("game_started");
        } else {
          dispatch({ type: "ACTIVATE", mode: "local" });
          track("game_started");
        }
      } catch {
        dispatch({ type: "ACTIVATE", mode: "local" });
        track("game_started");
      } finally {
        activating.current = false;
        // React re-renders asynchronously, so runRef.current still reflects
        // the pre-ACTIVATE state here. Patch it synchronously before flushing
        // the queue, otherwise flushProgress re-queues every item because it
        // sees runMode:"pending" and the events are never sent to the server.
        runRef.current = {
          ...runRef.current,
          runMode: activatedMode,
          ranked: activatedMode === "ranked",
          runId: activatedRunId ?? runRef.current.runId,
        };
        const queued = [...progressQueue.current];
        progressQueue.current = [];
        for (const item of queued) {
          void flushProgress(item.event, item.level);
        }
      }
    })();
    return startPromise.current;
  }, [flushProgress]);

  const succeed = useCallback(() => {
    const phase = phaseRef.current;
    if (
      phase === "rollback-transition" ||
      phase === "locked" ||
      phase === "resolving-fail" ||
      phase === "exiting" ||
      phase === "cinematic"
    ) {
      return;
    }
    const level = runRef.current.level;
    const nextCompleted = level >= TOTAL_LEVELS;
    dispatch({ type: "SUCCEED" });
    if (level === 25) track("game_level_25");
    if (level === 50) track("game_level_50");
    if (level === 75) track("game_level_75");
    if (nextCompleted) {
      track("game_completed");
      const run = runRef.current;
      const elapsed = elapsedSeconds({
        ...run,
        completed: true,
        completedAt: Date.now(),
      });
      mergePersonalBest(
        { ...run, completed: true, completedAt: Date.now() },
        elapsed,
        calculateScore({
          elapsedSeconds: elapsed,
          secretsFound: run.secrets.length,
        })
      );
      void flushProgress("success", 100);
    } else {
      void flushProgress("success", level);
    }
  }, [flushProgress]);

  const fail = useCallback((message?: string) => {
    const phase = phaseRef.current;
    if (
      phase === "rollback-transition" ||
      phase === "locked" ||
      phase === "resolving-fail" ||
      phase === "exiting" ||
      phase === "resolving-success" ||
      phase === "cinematic"
    ) {
      return;
    }
    dispatch({ type: "FAIL", message });
  }, []);

  const grantLife = useCallback(() => {
    dispatch({ type: "GRANT_LIFE" });
  }, []);

  const updateMemory = useCallback((memory: Partial<RunMemory>) => {
    dispatch({ type: "UPDATE_MEMORY", memory });
  }, []);

  const collectSecret = useCallback((id: number) => {
    dispatch({ type: "COLLECT_SECRET", id });
  }, []);

  const onProgressLevelClick = useCallback(() => {
    progressClickEnabled.current = true;
  }, []);

  const onProgressHundredClick = useCallback(() => {
    progressHundredEnabled.current = true;
  }, []);

  const registerProgressLevelSuccess = useCallback(
    (fn: (() => void) | null) => {
      progressLevelSuccessOverride.current = fn;
    },
    []
  );

  const handleProgressNumberClick = useCallback(() => {
    if (progressHundredEnabled.current) return;
    if (!progressClickEnabled.current) return;
    void activate();
    const override = progressLevelSuccessOverride.current;
    if (override) override();
    else succeed();
    progressClickEnabled.current = false;
  }, [activate, succeed]);

  const handleProgressHundredClick = useCallback(() => {
    if (!progressHundredEnabled.current) return;
    void activate();
    succeed();
    progressHundredEnabled.current = false;
  }, [activate, succeed]);

  const useHint = useCallback(() => {
    if (runRef.current.hintsUsed >= 1) return;
    dispatch({ type: "USE_HINT" });
    setHintText(hintForLevel(runRef.current.level));
  }, []);

  const useSkip = useCallback(() => {
    // Retired in beta
  }, []);

  const startNewRun = useCallback((debug?: boolean) => {
    dispatch({ type: "NEW_RUN", debug });
  }, []);

  const interactive =
    state.phase === "active" || state.phase === "entering";

  const rankedEligible =
    isRankedEligible(state.run) && !isRunAbandoned(state.run);

  const elapsedSec = elapsedSeconds(state.run);
  void tick;

  return {
    state,
    dispatch,
    hydrated,
    hintText,
    rollbackNotice,
    /** @deprecated alias for rollbackNotice during cutover */
    checkpointNotice: rollbackNotice,
    rankedEligible,
    interactive,
    activate,
    succeed,
    fail,
    grantLife,
    updateMemory,
    collectSecret,
    onProgressLevelClick,
    onProgressHundredClick,
    registerProgressLevelSuccess,
    handleProgressNumberClick,
    handleProgressHundredClick,
    useHint,
    useSkip,
    startNewRun,
    elapsed: formatElapsed(elapsedSec),
    elapsedSeconds: elapsedSec,
    score: calculateScore({
      elapsedSeconds: elapsedSec,
      secretsFound: state.run.secrets.length,
    }),
    teaser: options?.teaser ?? false,
  };
}

export type GameController = ReturnType<typeof useGameController>;
