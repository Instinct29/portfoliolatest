"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { track } from "@vercel/analytics";
import type { GameRun } from "@/lib/game/types";
import type { LeaderboardEntry } from "@/lib/game/types";
import { formatElapsed } from "@/lib/game/scoring";
import { validateDisplayName } from "@/lib/game/validation";
import { BETA_LABEL } from "@/lib/game/constants";

type SubmitResult = { score: number; elapsedSeconds: number };
type LBState = "idle" | "loading" | "loaded" | "error";

export default function CompletionScreen({
  run,
  elapsed,
  score,
  rankedEligible,
  onSubmitted,
  onPlayAgain,
}: {
  run: GameRun;
  elapsed: string;
  score: number;
  rankedEligible: boolean;
  onSubmitted: () => void;
  onPlayAgain: () => void;
}) {
  const [name, setName] = useState("");
  const [nameError, setNameError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitResult, setSubmitResult] = useState<SubmitResult | null>(null);
  const [lbState, setLbState] = useState<LBState>("idle");
  const [lbEntries, setLbEntries] = useState<LeaderboardEntry[]>([]);

  const assisted =
    run.runMode === "assisted" ||
    run.runMode === "debug" ||
    run.hintsUsed > 0 ||
    run.skipsUsed > 0;

  const submitted = run.submitted || submitResult !== null;

  // When the run was already submitted (e.g. idempotent re-open), load the leaderboard straight away.
  useEffect(() => {
    if (run.submitted && lbState === "idle") {
      loadLeaderboard();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [run.submitted]);

  async function loadLeaderboard() {
    setLbState("loading");
    try {
      const res = await fetch("/api/game/leaderboard");
      if (!res.ok) throw new Error("unavailable");
      const data = (await res.json()) as {
        configured: boolean;
        entries: LeaderboardEntry[];
      };
      if (!data.configured) {
        setLbState("error");
        return;
      }
      setLbEntries(data.entries ?? []);
      setLbState("loaded");
    } catch {
      setLbState("error");
    }
  }

  const submit = async () => {
    const v = validateDisplayName(name);
    if (!v.ok) {
      setNameError(v.error ?? "Invalid name.");
      return;
    }
    setNameError(null);
    setSubmitError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/game/finish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          runId: run.runId,
          displayName: v.value,
          secretsFound: run.secrets.length,
          hintsUsed: run.hintsUsed,
          skipsUsed: run.skipsUsed,
          level: 100,
          ranked: rankedEligible,
        }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        setSubmitError(data.error ?? "Submission failed. Try again.");
        return;
      }
      const data = (await res.json()) as SubmitResult;
      track("score_submitted");
      setSubmitResult(data);
      onSubmitted();
      void loadLeaderboard();
    } catch {
      setSubmitError("Leaderboard unavailable. Check your connection.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-10">
      {/* Header */}
      <div>
        <p className="text-2xs font-medium uppercase tracking-label text-muted-foreground">
          Definitely Possible{" "}
          <span className="ml-1 rounded-sm border border-border px-1 py-0.5 text-2xs">
            {BETA_LABEL}
          </span>
        </p>
        <p className="mt-3 text-2xl font-semibold tracking-tight text-foreground">
          YOU FINISHED IT.
        </p>
      </div>

      {/* Stats */}
      <dl className="grid gap-2 font-mono text-sm tabular-nums">
        <div className="flex justify-between gap-4">
          <dt className="text-muted-foreground">LEVEL</dt>
          <dd className="text-foreground">100 / 100</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-muted-foreground">TIME</dt>
          <dd className="text-foreground">{elapsed}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-muted-foreground">SECRETS</dt>
          <dd className="text-foreground">{run.secrets.length} / 7</dd>
        </div>
        {!rankedEligible && !assisted && (
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">SCORE</dt>
            <dd className="text-foreground">{score.toLocaleString()}</dd>
          </div>
        )}
      </dl>

      {/* Unranked message */}
      {assisted && (
        <p className="text-sm text-muted-foreground">
          Completed — unranked (assisted run).
        </p>
      )}
      {!assisted && !rankedEligible && !submitted && (
        <p className="text-sm text-muted-foreground">
          Global leaderboard unavailable. Your completion still counts locally.
        </p>
      )}

      {/* Submission form */}
      {rankedEligible && !submitted && (
        <div className="space-y-4 border-t border-border pt-8">
          <p className="text-xs font-medium uppercase tracking-label text-muted-foreground">
            Name for the leaderboard
          </p>
          <div className="space-y-3">
            <input
              type="text"
              value={name}
              maxLength={18}
              autoComplete="off"
              spellCheck={false}
              onChange={(e) => {
                setName(e.target.value);
                if (nameError) setNameError(null);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") void submit();
              }}
              className="w-full max-w-xs rounded-md border border-border bg-card px-3 py-2 font-mono text-sm text-foreground placeholder:text-muted-foreground focus:border-border-strong focus:outline-none"
              placeholder="your name"
            />
            {nameError && (
              <p className="text-sm text-destructive">{nameError}</p>
            )}
            {submitError && (
              <p className="text-sm text-destructive">{submitError}</p>
            )}
            <button
              type="button"
              disabled={submitting}
              onClick={() => void submit()}
              className="rounded-md border border-border-strong px-4 py-2 text-sm font-medium text-foreground hover:bg-elevated disabled:cursor-not-allowed disabled:opacity-40"
            >
              {submitting ? "Submitting…" : "SUBMIT SCORE"}
            </button>
          </div>
        </div>
      )}

      {/* Post-submission result + leaderboard */}
      {submitted && (
        <div className="space-y-8 border-t border-border pt-8">
          {submitResult && (
            <div>
              <p className="text-xs font-medium uppercase tracking-label text-muted-foreground">
                Your result
              </p>
              <dl className="mt-3 grid gap-2 font-mono text-sm tabular-nums">
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">TIME</dt>
                  <dd className="text-foreground">
                    {formatElapsed(submitResult.elapsedSeconds)}
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">SECRETS</dt>
                  <dd className="text-foreground">{run.secrets.length} / 7</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">SCORE</dt>
                  <dd className="text-foreground">
                    {submitResult.score.toLocaleString()}
                  </dd>
                </div>
              </dl>
            </div>
          )}

          {/* Leaderboard */}
          <div>
            <p className="text-xs font-medium uppercase tracking-label text-muted-foreground">
              Global leaderboard
            </p>
            {lbState === "loading" && (
              <p className="mt-3 text-sm text-muted-foreground">
                Loading scores…
              </p>
            )}
            {lbState === "error" && (
              <p className="mt-3 text-sm text-muted-foreground">
                Leaderboard unavailable.
              </p>
            )}
            {lbState === "loaded" && lbEntries.length === 0 && (
              <p className="mt-3 text-sm text-muted-foreground">
                No ranked completions yet — yours may be first.
              </p>
            )}
            {lbState === "loaded" && lbEntries.length > 0 && (
              <div className="mt-3 overflow-x-auto">
                <table className="w-full min-w-[22rem] text-left text-sm">
                  <thead>
                    <tr className="border-b border-border text-2xs uppercase tracking-label text-muted-foreground">
                      <th className="py-2 pr-4">#</th>
                      <th className="py-2 pr-4">Player</th>
                      <th className="py-2 pr-4">Time</th>
                      <th className="py-2">Secrets</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lbEntries.map((e) => (
                      <tr
                        key={`${e.rank}-${e.displayName}`}
                        className="border-b border-border/50 tabular-nums"
                      >
                        <td className="py-2 pr-4 font-mono">{e.rank}</td>
                        <td className="py-2 pr-4">{e.displayName}</td>
                        <td className="py-2 pr-4 font-mono">
                          {formatElapsed(e.elapsedSeconds)}
                        </td>
                        <td className="py-2 font-mono">{e.secretsFound}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex flex-wrap items-center gap-4 border-t border-border pt-8">
        <button
          type="button"
          onClick={onPlayAgain}
          className="text-sm font-medium text-foreground underline underline-offset-4 hover:no-underline"
        >
          PLAY AGAIN
        </button>
        <Link
          href="/"
          className="text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground hover:no-underline"
        >
          ← Back to portfolio
        </Link>
      </div>

      {run.secrets.length >= 7 && (
        <Link
          href="/after-hours"
          className="block text-sm font-medium text-foreground underline underline-offset-4"
        >
          OPEN THE DOOR →
        </Link>
      )}
    </div>
  );
}
