"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { loadRun } from "@/lib/game/persistence";

export default function AfterHoursClient() {
  const [unlocked, setUnlocked] = useState<boolean | null>(null);

  useEffect(() => {
    const run = loadRun();
    setUnlocked(Boolean(run && run.secrets.length >= 7));
  }, []);

  if (unlocked === null) {
    return <p className="text-sm text-muted-foreground">Loading…</p>;
  }

  if (!unlocked) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          You haven&apos;t earned this page yet.
        </p>
        <Link href="/play" className="text-sm underline underline-offset-4">
          Back to the game
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">
        AFTER HOURS
      </h1>
      <p className="max-w-md text-muted-foreground">
        You found the part of my portfolio
        <br />
        that wasn&apos;t meant to be useful.
      </p>
      <p className="text-muted-foreground">Nice work.</p>
      <p className="text-sm text-muted-foreground">— Manthan</p>
      <Link href="/" className="inline-block text-sm underline underline-offset-4">
        ← Back to portfolio
      </Link>
    </div>
  );
}
