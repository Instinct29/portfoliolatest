"use client";

import { useEffect, useState } from "react";
import type { LeaderboardEntry } from "@/lib/game/types";
import { formatElapsed } from "@/lib/game/scoring";

export default function LeaderboardPanel() {
  const [entries, setEntries] = useState<LeaderboardEntry[] | null>(null);
  const [unavailable, setUnavailable] = useState(false);

  useEffect(() => {
    fetch("/api/game/leaderboard")
      .then((r) => {
        if (!r.ok) throw new Error("unavailable");
        return r.json();
      })
      .then((data) => {
        if (data.configured === false) {
          setUnavailable(true);
          return;
        }
        setEntries(data.entries ?? []);
      })
      .catch(() => setUnavailable(true));
  }, []);

  if (unavailable) {
    return (
      <p className="text-sm text-muted-foreground">Leaderboard unavailable.</p>
    );
  }

  if (!entries) {
    return <p className="text-sm text-muted-foreground">Loading scores…</p>;
  }

  if (entries.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No ranked completions yet. Yours could be first.
      </p>
    );
  }

  return (
    <div>
      <h3 className="text-xs font-medium uppercase tracking-label text-muted-foreground">
        Fastest completions
      </h3>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[22rem] text-left text-sm">
          <thead>
            <tr className="border-b border-border text-2xs uppercase tracking-label text-muted-foreground">
              <th className="py-2 pr-4">Rank</th>
              <th className="py-2 pr-4">Name</th>
              <th className="py-2 pr-4">Time</th>
              <th className="py-2">Secrets</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((e) => (
              <tr key={`${e.rank}-${e.displayName}`} className="border-b border-border/50">
                <td className="py-2 pr-4 tabular-nums">{e.rank}</td>
                <td className="py-2 pr-4">{e.displayName}</td>
                <td className="py-2 pr-4 tabular-nums">
                  {formatElapsed(e.elapsedSeconds)}
                </td>
                <td className="py-2 tabular-nums">{e.secretsFound}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
