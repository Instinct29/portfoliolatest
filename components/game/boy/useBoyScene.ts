"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { BoySceneBeat } from "./types";

/**
 * Phase-driven boy choreography. Advances only after each beat's minMs,
 * with full cleanup on unmount / reset. Dialogue is bound to the active beat.
 */
export function useBoyScene(
  beats: BoySceneBeat[],
  options?: {
    reducedMotion?: boolean;
    loop?: boolean;
    onComplete?: () => void;
    paused?: boolean;
  }
) {
  const [index, setIndex] = useState(0);
  const doneRef = useRef(false);
  const onCompleteRef = useRef(options?.onComplete);
  onCompleteRef.current = options?.onComplete;

  const reduced = options?.reducedMotion ?? false;
  const loop = options?.loop ?? false;
  const paused = options?.paused ?? false;

  const reset = useCallback(() => {
    doneRef.current = false;
    setIndex(0);
  }, []);

  useEffect(() => {
    if (!beats.length || paused || doneRef.current) return;
    const beat = beats[index];
    if (!beat) return;

    const hold = reduced ? Math.min(beat.minMs, 900) : beat.minMs;
    const t = window.setTimeout(() => {
      if (index + 1 >= beats.length) {
        if (loop) {
          setIndex(0);
          return;
        }
        doneRef.current = true;
        onCompleteRef.current?.();
        return;
      }
      setIndex((i) => i + 1);
    }, hold);

    return () => window.clearTimeout(t);
  }, [beats, index, loop, paused, reduced]);

  const beat = beats[Math.min(index, Math.max(0, beats.length - 1))] ?? null;

  return {
    index,
    beat,
    pose: beat?.pose ?? "idle",
    say: beat?.say,
    flip: beat?.flip,
    facing: beat?.facing,
    showTools: beat?.showTools,
    tool: beat?.tool,
    done: doneRef.current || (beats.length > 0 && index >= beats.length - 1 && doneRef.current),
    reset,
  };
}
