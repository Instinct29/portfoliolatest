"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useReducedMotion } from "motion/react";
import { track } from "@vercel/analytics";
import Container from "@/components/layout/Container";
import { useGameController } from "@/lib/game/useGameController";
import { BETA_LABEL, TOTAL_LEVELS } from "@/lib/game/constants";
import { formatElapsed } from "@/lib/game/scoring";
import { elapsedSeconds } from "@/lib/game/runReducer";
import LevelRenderer from "./LevelRenderer";

export default function GameTeaser() {
  const ctrl = useGameController({ teaser: true });
  const reducedMotion = useReducedMotion() ?? false;
  const [teaserSolved, setTeaserSolved] = useState(false);
  const { state, hydrated, activate, succeed, fail, dispatch } = ctrl;
  const run = state.run;

  const onActivate = useCallback(() => {
    track("game_teaser_interaction");
    void activate();
  }, [activate]);

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
      level: run.level,
      lives: 0,
      reducedMotion,
      variant: "teaser" as const,
      onActivate,
      succeed: () => {
        if (run.level === 1 && !run.level1Complete) {
          void activate();
          dispatch({ type: "MARK_LEVEL1_COMPLETE" });
          dispatch({ type: "SUCCEED" });
          setTeaserSolved(true);
        } else {
          succeed();
        }
      },
      fail,
      updateMemory: (m: Partial<typeof run.memory>) =>
        dispatch({ type: "UPDATE_MEMORY", memory: m }),
      collectSecret: (id: number) => dispatch({ type: "COLLECT_SECRET", id }),
      grantLife: () => dispatch({ type: "GRANT_LIFE" }),
    }),
    [run, reducedMotion, onActivate, succeed, fail, dispatch]
  );

  if (!hydrated) return null;

  const completed = run.completed;
  const allSecrets = run.secrets.length >= 7;

  return (
    <section
      className="border-t border-border py-10 md:py-12"
      aria-label="Definitely Possible teaser"
    >
      <Container width="reading">
        <p className="text-2xs font-medium uppercase tracking-label text-muted-foreground">
          A small distraction
        </p>
        <h2 className="mt-2 text-xl font-semibold tracking-tight text-foreground">
          Definitely Possible{" "}
          <span className="align-middle text-2xs font-medium tracking-label text-muted-foreground">
            {BETA_LABEL}
          </span>
        </h2>
        <p className="mt-1 max-w-md text-sm text-muted-foreground">
          100 perfectly reasonable levels.
          <br />
          How hard could it be?
        </p>

        {completed ? (
          <div className="mt-6 space-y-3">
            <p className="text-sm font-medium text-foreground">
              {allSecrets
                ? "YOU FINISHED EVERYTHING."
                : "YOU ACTUALLY FINISHED IT."}
            </p>
            <p className="font-mono text-sm tabular-nums text-muted-foreground">
              {TOTAL_LEVELS} / {TOTAL_LEVELS}
              <br />
              {formatElapsed(elapsedSeconds(run))}
              <br />
              Secrets {run.secrets.length} / 7
            </p>
            {allSecrets && (
              <Link
                href="/after-hours"
                className="inline-block text-sm font-medium text-foreground underline underline-offset-4"
              >
                OPEN THE DOOR →
              </Link>
            )}
            <div>
              <button
                type="button"
                onClick={() => ctrl.startNewRun()}
                className="text-sm font-medium text-foreground underline underline-offset-4"
              >
                Play again →
              </button>
            </div>
          </div>
        ) : teaserSolved || run.level1Complete ? (
          <div className="mt-6 space-y-3">
            <p className="text-sm text-muted-foreground">Fine.</p>
            <Link
              href="/play"
              className="inline-block text-sm font-medium text-foreground underline underline-offset-4"
            >
              Continue playing →
            </Link>
          </div>
        ) : (
          <div className="mt-6">
            <LevelRenderer
              key={`teaser-${state.failureKey}`}
              level={1}
              props={levelProps}
            />
            {state.failureMessage && (
              <p
                key={state.failureKey}
                className="mt-3 text-center text-sm text-muted-foreground"
                role="status"
              >
                {state.failureMessage}
              </p>
            )}
          </div>
        )}

        <GlobalTeaserLine />
      </Container>
    </section>
  );
}

function GlobalTeaserLine() {
  const [line, setLine] = useState<string | null>(null);
  useEffect(() => {
    fetch("/api/game/leaderboard")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.stats?.bestTime != null && data.stats.completions > 0) {
          setLine(
            `Global best ${formatElapsed(data.stats.bestTime)} · ${data.stats.completions.toLocaleString()} completed`
          );
        }
      })
      .catch(() => {});
  }, []);
  if (!line) return null;
  return <p className="mt-6 text-2xs text-muted-foreground">{line}</p>;
}
