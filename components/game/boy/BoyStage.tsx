"use client";

import type { CSSProperties, ReactNode } from "react";
import type { BoyEdge } from "./types";

const EDGE_STYLE: Record<BoyEdge, CSSProperties> = {
  left: { left: "4%", bottom: "8%" },
  right: { right: "4%", bottom: "8%" },
  "bottom-left": { left: "6%", bottom: "4%" },
  "bottom-right": { right: "6%", bottom: "4%" },
  "bottom-center": { left: "50%", bottom: "4%", transform: "translateX(-50%)" },
  "top-left": { left: "6%", top: "8%" },
  "top-right": { right: "6%", top: "8%" },
};

/**
 * Positions the boy inside a relative parent without covering the center
 * puzzle targets. Pass `x` (0–100 percent from left) or an `edge` preset.
 */
export default function BoyStage({
  children,
  x,
  edge = "bottom-right",
  y,
  className = "",
  style,
}: {
  children: ReactNode;
  /** Horizontal position as percent of parent width (0–100). */
  x?: number;
  edge?: BoyEdge;
  /** Vertical offset from bottom as percent (overrides edge vertical). */
  y?: number;
  className?: string;
  style?: CSSProperties;
}) {
  const pos: CSSProperties =
    typeof x === "number"
      ? {
          left: `${Math.max(2, Math.min(98, x))}%`,
          bottom: typeof y === "number" ? `${y}%` : "6%",
          transform: "translateX(-50%)",
        }
      : {
          ...EDGE_STYLE[edge],
          ...(typeof y === "number" ? { bottom: `${y}%`, top: "auto" } : null),
        };

  return (
    <div
      className={`pointer-events-none absolute z-10 ${className}`}
      style={{ ...pos, ...style }}
      aria-hidden
    >
      {children}
    </div>
  );
}
