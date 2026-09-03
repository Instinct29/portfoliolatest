"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useReducedMotion } from "motion/react";
import { useSearchParams } from "next/navigation";
import Container from "@/components/layout/Container";
import { useGameController } from "@/lib/game/useGameController";
import { isDevGameToolsEnabled, devMemoryForLevel } from "@/lib/game/dev";
import { TOTAL_LEVELS } from "@/lib/game/constants";
import { GameHeader } from "./GameShell";
import LevelRenderer from "./LevelRenderer";
import LevelTransition from "./LevelTransition";
import CompletionScreen from "./CompletionScreen";

const LeaderboardPanel = dynamic(() => import("./LeaderboardPanel"), {
  ssr: false,
  loading: () => (
    <p className="text-sm text-muted-foreground">Loading scores…</p>
  ),
});

const OutroCinematic = dynamic(
  () => import("./boy/OutroCinematic").then((m) => m.default),
  { ssr: false }
);

const OUTRO_KEY = (runId: string) => `dp-outro-done:${runId}`;

export default function GamePlay() {
  const ctrl = useGameController();
  const reducedMotion = useReducedMotion() ?? false;
  const searchParams = useSearchParams();
  const [tick, setTick] = useState(0);
  const [outroDone, setOutroDone] = useState(false);
  const {
    state,
    hydrated,
    activate,
    succeed,
    fail,
    grantLife,
    onProgressLevelClick,
    registerProgressLevelSuccess,
    handleProgressNumberClick,
    onProgressHundredClick,
    handleProgressHundredClick,
    useHint,
    hintText,
    checkpointNotice,
    rankedEligible,
    elapsed,
    score,
    dispatch,
  } = ctrl;
  const run = state.run;

  useEffect(() => {
    if (!hydrated || !isDevGameToolsEnabled()) return;
    const lvl = Number(searchParams.get("level"));
    if (lvl >= 1 && lvl <= TOTAL_LEVELS) {
      dispatch({ type: "SET_LEVEL", level: lvl, debug: true });
      dispatch({
        type: "UPDATE_MEMORY",
        memory: devMemoryForLevel(lvl),
      });
    }
  }, [hydrated, searchParams, dispatch]);

  useEffect(() => {
    if (run.runMode === "pending" || run.completed) return;
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, [run.runMode, run.completed, tick]);

  useEffect(() => {
    if (!run.completed || !run.runId) return;
    try {
      if (sessionStorage.getItem(OUTRO_KEY(run.runId)) === "1") {
        setOutroDone(true);
      }
    } catch {
      /* private mode */
    }
  }, [run.completed, run.runId]);

  const markOutroDone = useCallback(() => {
    setOutroDone(true);
    try {
      sessionStorage.setItem(OUTRO_KEY(run.runId), "1");
    } catch {
      /* private mode */
    }
  }, [run.runId]);

  const onActivate = useCallback(() => {
    void activate();
  }, [activate]);

  const displayedLevel = state.displayedLevel;

  const levelProps = useMemo(
    () => ({
      seed: run.seed,
      memory: run.memory,
      stats: {
        hintsUsed: run.hintsUsed,
        skipsUsed: run.skipsUsed,
        levelAttempts: run.levelAttempts,
        failCount: run.failCount,
      },
      // The level actually mounted/visible, not the (possibly already
      // advanced) logical run.level — see GameState.displayedLevel.
      level: displayedLevel,
      lives: 0,
      reducedMotion,
      variant: "full" as const,
      onActivate,
      succeed,
      fail,
      updateMemory: (m: Partial<typeof run.memory>) =>
        dispatch({ type: "UPDATE_MEMORY", memory: m }),
      collectSecret: (id: number) => {
        dispatch({ type: "COLLECT_SECRET", id });
      },
      onProgressLevelClick,
      onProgressHundredClick,
      registerProgressLevelSuccess,
      grantLife,
    }),
    [
      run,
      displayedLevel,
      reducedMotion,
      onActivate,
      succeed,
      fail,
      dispatch,
      onProgressLevelClick,
      onProgressHundredClick,
      registerProgressLevelSuccess,
      grantLife,
    ]
  );

  if (!hydrated) {
    return (
      <Container width="reading" className="py-8 md:py-12">
        <p className="text-sm text-muted-foreground">Loading run…</p>
      </Container>
    );
  }

  if (run.completed) {
    const showOutro = run.level >= TOTAL_LEVELS && !outroDone;

    if (showOutro) {
      return <OutroCinematic onFinished={markOutroDone} />;
    }

    return (
      <Container width="reading" className="py-8 md:py-12">
        <CompletionScreen
          run={run}
          elapsed={elapsed}
          score={score}
          rankedEligible={rankedEligible}
          onSubmitted={() => dispatch({ type: "SUBMITTED" })}
          onPlayAgain={() => ctrl.startNewRun()}
        />
        <div className="mt-12">
          <LeaderboardPanel />
        </div>
      </Container>
    );
  }

  const minimal = displayedLevel === 100;
  const showFooter = !minimal;
  const hundredOnly = displayedLevel === 99;

  return (
    <Container width="reading" className="py-8 md:py-12">
      <GameHeader
        level={displayedLevel}
        elapsed={elapsed}
        onExit={() => {}}
        onLevelClick={handleProgressNumberClick}
        onHundredClick={handleProgressHundredClick}
        hundredOnly={hundredOnly}
        minimal={minimal}
      />

      <div className="mt-8">
        <LevelTransition phase={state.phase} failureKey={state.failureKey}>
          <LevelRenderer
            key={`${displayedLevel}-${state.failureKey}`}
            level={displayedLevel}
            props={levelProps}
          />
        </LevelTransition>
      </div>

      {state.failureMessage && (
        <p
          key={state.failureKey}
          className="mt-4 text-center text-sm text-muted-foreground"
          role="status"
        >
          {state.failureMessage}
        </p>
      )}

      {!state.failureMessage && state.phase === "exiting" && state.successMessage && (
        <p
          key={state.successKey}
          className="mt-4 text-center text-sm text-muted-foreground"
          role="status"
        >
          {state.successMessage}
        </p>
      )}

      {checkpointNotice && (
        <div className="mt-4 text-center text-sm text-foreground">
          <p>BACK 5.</p>
        </div>
      )}

      {hintText && (
        <p className="mt-4 text-center text-sm text-muted-foreground">{hintText}</p>
      )}

      {showFooter && (
        <footer className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-6 text-sm text-muted-foreground">
          <span className="font-mono tabular-nums text-2xs">
            {run.secrets.length > 0 ? `Secrets ${run.secrets.length}/7` : ""}
          </span>
          <div className="flex items-center gap-4">
            {state.showHintOffer && (
              <button
                type="button"
                onClick={useHint}
                className="underline underline-offset-4 hover:text-foreground"
              >
                Need a nudge?
              </button>
            )}
          </div>
        </footer>
      )}
    </Container>
  );
}
