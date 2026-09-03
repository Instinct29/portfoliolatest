"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { BubbleSide } from "./types";

/**
 * Speech bubble with a real tail toward the boy. Clamps horizontally inside
 * the nearest positioned ancestor so it does not clip off-screen.
 */
export default function SpeechBubble({
  text,
  side = "auto",
  className = "",
}: {
  text: string;
  side?: BubbleSide;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [shift, setShift] = useState(0);

  const resolved =
    side === "auto" ? "right" : side === "left" ? "left" : "right";

  useEffect(() => {
    setVisible(false);
    const id = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(id);
  }, [text]);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const parent = el.offsetParent as HTMLElement | null;
    if (!parent) return;
    const pr = parent.getBoundingClientRect();
    const er = el.getBoundingClientRect();
    let dx = 0;
    const pad = 8;
    if (er.left < pr.left + pad) dx = pr.left + pad - er.left;
    if (er.right > pr.right - pad) dx = pr.right - pad - er.right;
    setShift(dx);
  }, [text, resolved, visible]);

  return (
    <div
      ref={ref}
      role="status"
      aria-live="polite"
      style={{ transform: shift ? `translateX(${shift}px)` : undefined }}
      className={`pointer-events-none absolute bottom-full z-20 mb-2 max-w-[11.5rem] whitespace-normal rounded-md border border-border bg-card px-2.5 py-1.5 text-2xs leading-snug text-foreground shadow-sm transition-opacity duration-[var(--duration-base)] ease-[var(--ease-out)] ${
        resolved === "left" ? "right-0" : "left-0"
      } ${visible ? "opacity-100" : "opacity-0"} ${className}`}
    >
      {text}
      <span
        aria-hidden
        className={`absolute top-full block h-0 w-0 border-x-[6px] border-t-[7px] border-x-transparent border-t-border ${
          resolved === "left" ? "right-3" : "left-3"
        }`}
      />
      <span
        aria-hidden
        className={`absolute top-full -mt-px block h-0 w-0 border-x-[5px] border-t-[6px] border-x-transparent border-t-card ${
          resolved === "left" ? "right-[13px]" : "left-[13px]"
        }`}
      />
    </div>
  );
}
