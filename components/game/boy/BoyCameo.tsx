"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";
import Boy from "./Boy";
import BoyStage from "./BoyStage";
import type { BoyEdge, BoyPose, BubbleSide } from "./types";

/** Minimum on-screen time for tip / cameo appearances. */
export const BOY_CAMEO_DWELL_MS = 5000;

/**
 * Boy presence that starts with the level (mount), not after a click.
 * Tip cameos dwell ~5s then exit. Pass `persist` when he stays for the
 * whole puzzle (walking, trolling, coaching).
 */
export default function BoyCameo({
  say,
  pose = "idle",
  edge = "bottom-right",
  bubbleSide = "auto",
  dwellMs = BOY_CAMEO_DWELL_MS,
  persist = false,
  scale,
  facing,
  flip,
  x,
  y,
  className = "",
  showTools,
  tool,
}: {
  say?: string;
  pose?: BoyPose;
  edge?: BoyEdge;
  bubbleSide?: BubbleSide;
  dwellMs?: number;
  persist?: boolean;
  scale?: number;
  facing?: "left" | "right";
  flip?: boolean;
  x?: number;
  y?: number;
  className?: string;
  showTools?: boolean;
  tool?: "wrench" | "screwdriver" | "cloth" | "toolbox" | "none";
}) {
  const reduce = useReducedMotion();
  const [phase, setPhase] = useState<"enter" | "hold" | "exit" | "gone">(
    reduce ? "hold" : "enter"
  );

  useEffect(() => {
    if (persist) {
      setPhase(reduce ? "hold" : "enter");
      if (reduce) return;
      const t = window.setTimeout(() => setPhase("hold"), 240);
      return () => window.clearTimeout(t);
    }

    setPhase(reduce ? "hold" : "enter");
    const enterMs = reduce ? 0 : 240;
    const tEnter = window.setTimeout(() => setPhase("hold"), enterMs);
    const tExit = window.setTimeout(() => setPhase("exit"), dwellMs);
    const tGone = window.setTimeout(
      () => setPhase("gone"),
      dwellMs + (reduce ? 0 : 200)
    );
    return () => {
      window.clearTimeout(tEnter);
      window.clearTimeout(tExit);
      window.clearTimeout(tGone);
    };
  }, [persist, dwellMs, reduce]);

  if (phase === "gone") return null;

  return (
    <BoyStage edge={edge} x={x} y={y} className={className}>
      <div
        className={
          phase === "enter"
            ? "boy-cameo boy-cameo-enter"
            : phase === "exit"
              ? "boy-cameo boy-cameo-exit"
              : "boy-cameo"
        }
      >
        <Boy
          pose={pose}
          say={say}
          bubbleSide={bubbleSide}
          scale={scale}
          facing={facing}
          flip={flip}
          showTools={showTools}
          tool={tool}
        />
      </div>
    </BoyStage>
  );
}

/**
 * After the player commits an answer, delay succeed so the boy has been
 * on screen for at least `dwellMs` since level mount (min 900ms after pick).
 */
export function useBoySuccessGate(
  succeed: () => void,
  armed: boolean,
  dwellMs: number = BOY_CAMEO_DWELL_MS
) {
  const mountedAt = useRef(Date.now());

  useEffect(() => {
    mountedAt.current = Date.now();
  }, []);

  useEffect(() => {
    if (!armed) return;
    const elapsed = Date.now() - mountedAt.current;
    const wait = Math.max(900, dwellMs - elapsed);
    const t = window.setTimeout(succeed, wait);
    return () => window.clearTimeout(t);
  }, [armed, succeed, dwellMs]);
}
