"use client";

import type { ReactNode } from "react";

/**
 * Lightweight visual shell around level content.
 * Maps controller phases to enter / exit / fail feedback without
 * adding a second conflicting state machine.
 */
export default function LevelTransition({
  phase,
  failureKey,
  children,
}: {
  phase: string;
  failureKey: number;
  children: ReactNode;
}) {
  const locked =
    phase === "exiting" ||
    phase === "resolving-success" ||
    phase === "rollback-transition" ||
    phase === "locked" ||
    phase === "cinematic";

  const failing = phase === "resolving-fail";
  const entering = phase === "entering";

  let anim = "game-level-hold";
  if (entering) anim = "game-level-enter";
  else if (phase === "exiting" || phase === "resolving-success")
    anim = "game-level-exit";
  else if (failing || phase === "rollback-transition") anim = "game-level-fail";

  return (
    <div
      key={failureKey}
      className={`game-level-stage ${anim} ${locked || failing ? "pointer-events-none" : ""}`}
      aria-busy={locked || failing || entering}
    >
      {children}
    </div>
  );
}
