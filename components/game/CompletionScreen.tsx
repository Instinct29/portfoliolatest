"use client";

import { useState } from "react";
import Link from "next/link";
import { track } from "@vercel/analytics";
import type { GameRun } from "@/lib/game/types";
import { paranoiaPercent } from "@/lib/game/scoring";
import { validateDisplayName } from "@/lib/game/validation";
import { BETA_LABEL } from "@/lib/game/constants";

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
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(run.submitted);
  const allSecrets = run.secrets.length >= 7;
  const assisted =
    run.runMode === "assisted" ||
    run.runMode === "debug" ||
    run.hintsUsed > 0 ||
    run.skipsUsed > 0;

  const submit = async () => {
    const v = validateDisplayName(name);
    if (!v.ok) {
      setError(v.error ?? "Invalid name.");
      return;
    }
    setSubmitting(true);
    setError(null);
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
        setError(data.error ?? "Submission failed.");
        return;
      }
      track("score_submitted");
      setDone(true);
      onSubmitted();
    } catch {
      setError("Leaderboard unavailable.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <p className="text-2xs font-medium uppercase tracking-label text-muted-foreground">
          Definitely Possible{" "}
          <span className="ml-1 rounded-sm border border-border px-1 py-0.5 text-2xs">
            {BETA_LABEL}
          </span>
        </p>
        <p className="mt-2 text-2xl font-semibold text-foreground">
          {run.secrets.length < 7 ? "100 / 100" : "YOU FINISHED EVERYTHING."}
        </p>
      </div>

      <dl className="grid gap-2 font-mono text-sm tabular-nums">
        <div className="flex justify-between gap-4">
          <dt className="text-muted-foreground">TIME</dt>
          <dd className="text-foreground">{elapsed}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-muted-foreground">SECRETS</dt>
          <dd className="text-foreground">{run.secrets.length} / 7</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-muted-foreground">SCORE</dt>
          <dd className="text-foreground">{score.toLocaleString()}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-muted-foreground">Paranoia</dt>
          <dd className="text-foreground">
            {paranoiaPercent(run.failCount)}%
          </dd>
        </div>
      </dl>

      <p className="max-w-md text-sm text-muted-foreground">
        You spent{" "}
        {elapsed.split(":")[0] === "00"
          ? "a few minutes"
          : `${elapsed.split(":")[0]} minutes`}{" "}
        learning not to trust buttons.
        <br />
        This achievement has no professional value.
      </p>

      {assisted && (
        <p className="text-sm text-muted-foreground">
          Completed — unranked (assisted)
        </p>
      )}

      {!assisted && !rankedEligible && (
        <p className="text-sm text-muted-foreground">
          Global leaderboard unavailable. Your completion still counts locally.
        </p>
      )}

      {rankedEligible && !done && (
        <div className="space-y-3">
          <label className="block text-sm text-muted-foreground">
            Display name
            <input
              type="text"
              value={name}
              maxLength={18}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full max-w-xs rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground"
              placeholder="Your name"
            />
          </label>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <button
            type="button"
            disabled={submitting}
            onClick={submit}
            className="rounded-md border border-border-strong px-4 py-2 text-sm font-medium text-foreground hover:bg-elevated disabled:opacity-50"
          >
            {submitting ? "Submitting…" : "SUBMIT SCORE"}
          </button>
        </div>
      )}

      {done && rankedEligible && (
        <p className="text-sm text-muted-foreground">Score submitted.</p>
      )}

      {!rankedEligible && error && (
        <p className="text-sm text-muted-foreground">{error}</p>
      )}

      <button
        type="button"
        onClick={onPlayAgain}
        className="block text-sm font-medium text-foreground underline underline-offset-4"
      >
        PLAY AGAIN
      </button>

      {allSecrets && (
        <Link
          href="/after-hours"
          className="block text-sm font-medium text-foreground underline underline-offset-4"
        >
          OPEN THE DOOR →
        </Link>
      )}

      <Link
        href="/"
        className="block text-sm text-muted-foreground underline underline-offset-4"
      >
        ← Back to Manthan
      </Link>

      <div className="border-t border-border pt-8">
        <p className="text-sm text-muted-foreground">Since you&apos;re still here…</p>
        <Link
          href="/#experience"
          className="mt-2 inline-block text-sm font-medium text-foreground underline underline-offset-4"
        >
          See what I actually build →
        </Link>
      </div>
    </div>
  );
}
