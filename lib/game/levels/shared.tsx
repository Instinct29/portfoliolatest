"use client";

import {
  useCallback,
  useEffect,
  useRef,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";

/* ── Layout ─────────────────────────────────────────────────────────── */

export function PuzzleRoot({
  children,
  className = "",
  onBackgroundClick,
}: {
  children: ReactNode;
  className?: string;
  onBackgroundClick?: () => void;
}) {
  return (
    <div
      className={`relative flex min-h-[12rem] flex-col gap-6  py-8 ${className}`}
      onClick={(e) => {
        if (e.target === e.currentTarget) onBackgroundClick?.();
      }}
    >
      {children}
    </div>
  );
}

export function Prompt({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <p
      className={`max-w-md text-center text-base leading-relaxed text-foreground md:text-lg ${className}`}
    >
      {children}
    </p>
  );
}

export function PromptWord({
  children,
  onClick,
  className = "",
  ariaLabel,
}: {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  ariaLabel?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className={`inline cursor-pointer border-0 bg-transparent p-0 font-inherit text-inherit underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border ${className}`}
    >
      {children}
    </button>
  );
}

/* ── Choices ────────────────────────────────────────────────────────── */

export function ChoiceRow({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`flex flex-wrap items-center justify-center gap-3 ${className}`}
    >
      {children}
    </div>
  );
}

export function ChoiceButton({
  children,
  onClick,
  className = "",
  style,
  disabled,
}: {
  children: ReactNode;
  onClick: () => void;
  className?: string;
  style?: CSSProperties;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      style={style}
      className={`min-h-11 min-w-11 rounded-md border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border disabled:opacity-50 ${className}`}
    >
      {children}
    </button>
  );
}

export function NumberChoice({
  value,
  fontSize,
  onClick,
}: {
  value: number;
  fontSize: number;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{ fontSize }}
      className="min-h-11 min-w-11 rounded-md border border-border bg-card px-3 py-2 font-semibold tabular-nums text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border"
    >
      {value}
    </button>
  );
}

/* ── Drag helpers ───────────────────────────────────────────────────── */

type DragPos = { x: number; y: number };

export function DraggableWord({
  children,
  onDrop,
  onCancel,
  onDragStart,
  className = "",
  color,
  dragThreshold = 6,
  neutralCursor = false,
}: {
  children: ReactNode;
  onDrop?: (pos: DragPos) => void;
  onCancel?: () => void;
  /** Fires once when a drag exceeds the movement threshold. */
  onDragStart?: () => void;
  className?: string;
  color?: string;
  dragThreshold?: number;
  /** Hide grab cursor until the player actually starts dragging (L98). */
  neutralCursor?: boolean;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const origin = useRef<DragPos>({ x: 0, y: 0 });
  const last = useRef<DragPos>({ x: 0, y: 0 });
  const dragging = useRef(false);
  const moved = useRef(false);
  const dragStarted = useRef(false);
  const onDragStartRef = useRef(onDragStart);
  onDragStartRef.current = onDragStart;

  const resetVisual = () => {
    if (ref.current) ref.current.style.transform = "";
  };

  const onPointerDown = (e: ReactPointerEvent) => {
    e.preventDefault();
    dragging.current = true;
    moved.current = false;
    dragStarted.current = false;
    origin.current = { x: e.clientX, y: e.clientY };
    last.current = { x: e.clientX, y: e.clientY };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: ReactPointerEvent) => {
    if (!dragging.current || !ref.current) return;
    last.current = { x: e.clientX, y: e.clientY };
    const dx = e.clientX - origin.current.x;
    const dy = e.clientY - origin.current.y;
    if (Math.hypot(dx, dy) > dragThreshold) {
      if (!moved.current) {
        moved.current = true;
        if (!dragStarted.current) {
          dragStarted.current = true;
          onDragStartRef.current?.();
        }
      }
    }
    ref.current.style.transform = `translate(${dx}px, ${dy}px)`;
  };

  const onPointerUp = (e: ReactPointerEvent) => {
    if (!dragging.current) return;
    dragging.current = false;
    last.current = { x: e.clientX, y: e.clientY };
    resetVisual();
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      /* already released */
    }
    if (moved.current) {
      onDrop?.({ x: last.current.x, y: last.current.y });
    }
  };

  const onPointerCancel = () => {
    if (!dragging.current) return;
    dragging.current = false;
    moved.current = false;
    resetVisual();
    onCancel?.();
  };

  const cursorClass = neutralCursor
    ? "cursor-inherit active:cursor-grabbing"
    : "cursor-grab active:cursor-grabbing";

  return (
    <span
      ref={ref}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerCancel}
      style={{ color, touchAction: "none" }}
      className={`inline-block select-none ${cursorClass} ${className}`}
    >
      {children}
    </span>
  );
}

export function DraggableMarker({
  children,
  onMove,
  onRelease,
  onCancel,
  className = "",
  style,
}: {
  children: ReactNode;
  onMove?: (pos: DragPos) => void;
  onRelease?: (pos: DragPos) => void;
  onCancel?: () => void;
  className?: string;
  style?: CSSProperties;
}) {
  const dragging = useRef(false);
  const offset = useRef<DragPos>({ x: 0, y: 0 });
  const pos = useRef<DragPos | null>(null);

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    dragging.current = true;
    const rect = e.currentTarget.getBoundingClientRect();
    offset.current = {
      x: e.clientX - rect.left - rect.width / 2,
      y: e.clientY - rect.top - rect.height / 2,
    };
    pos.current = { x: e.clientX, y: e.clientY };
    onMove?.(pos.current);
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragging.current) return;
    pos.current = { x: e.clientX, y: e.clientY };
    onMove?.(pos.current);
  };

  const onPointerUp = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragging.current) return;
    dragging.current = false;
    pos.current = { x: e.clientX, y: e.clientY };
    onRelease?.(pos.current);
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      /* already released */
    }
  };

  const onPointerCancel = () => {
    if (!dragging.current) return;
    dragging.current = false;
    pos.current = null;
    onCancel?.();
  };

  return (
    <div
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerCancel}
      style={{ touchAction: "none", ...style }}
      className={`absolute cursor-grab select-none active:cursor-grabbing ${className}`}
    >
      {children}
    </div>
  );
}

/**
 * Measures a DOM node's live bounding rect on demand (L32/L33's
 * prompt-word drop targets). Re-measures on resize so a rotated phone
 * or a reflowed prompt never leaves a stale target behind.
 */
export function useMeasuredTarget<T extends HTMLElement = HTMLElement>() {
  const ref = useRef<T>(null);
  const rectRef = useRef<DOMRect | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => {
      rectRef.current = el.getBoundingClientRect();
    };
    measure();
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(measure) : null;
    ro?.observe(el);
    window.addEventListener("resize", measure);
    return () => {
      ro?.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  const getRect = useCallback(() => {
    if (ref.current) rectRef.current = ref.current.getBoundingClientRect();
    return rectRef.current;
  }, []);

  return { ref, getRect };
}

export function pointInRect(
  x: number,
  y: number,
  rect: DOMRect | null,
  padding = 0
): boolean {
  if (!rect) return false;
  return (
    x >= rect.left - padding &&
    x <= rect.right + padding &&
    y >= rect.top - padding &&
    y <= rect.bottom + padding
  );
}

/** Overlap area as a fraction of the smaller rect — forgiving box-around-word collision. */
export function rectOverlapRatio(a: DOMRect, b: DOMRect): number {
  const left = Math.max(a.left, b.left);
  const right = Math.min(a.right, b.right);
  const top = Math.max(a.top, b.top);
  const bottom = Math.min(a.bottom, b.bottom);
  const w = Math.max(0, right - left);
  const h = Math.max(0, bottom - top);
  const overlapArea = w * h;
  const smaller = Math.min(a.width * a.height, b.width * b.height);
  if (smaller <= 0) return 0;
  return overlapArea / smaller;
}

/**
 * Press-and-hold shake gesture (L38): counts direction reversals past a
 * travel threshold while the pointer stays down, ignoring jitter.
 */
export function useShakeHold(
  targetRef: React.RefObject<HTMLElement | null>,
  options: {
    onShakeComplete: () => void;
    reversalsNeeded?: number;
    travelThresholdPx?: number;
  }
) {
  const { onShakeComplete, reversalsNeeded = 5, travelThresholdPx = 16 } = options;
  const onCompleteRef = useRef(onShakeComplete);
  onCompleteRef.current = onShakeComplete;

  const holding = useRef(false);
  const done = useRef(false);
  const legStartX = useRef(0);
  const lastX = useRef(0);
  const direction = useRef<1 | -1 | 0>(0);
  const reversals = useRef(0);

  const reset = useCallback(() => {
    holding.current = false;
    legStartX.current = 0;
    lastX.current = 0;
    direction.current = 0;
    reversals.current = 0;
  }, []);

  const onPointerDown = useCallback((e: ReactPointerEvent) => {
    if (done.current) return;
    holding.current = true;
    legStartX.current = e.clientX;
    lastX.current = e.clientX;
    direction.current = 0;
    reversals.current = 0;
    try {
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    } catch {
      /* unsupported */
    }
  }, []);

  const onPointerMove = useCallback(
    (e: ReactPointerEvent) => {
      if (!holding.current || done.current) return;
      lastX.current = e.clientX;
      const travel = e.clientX - legStartX.current;
      if (Math.abs(travel) < travelThresholdPx) return;
      const dir: 1 | -1 = travel > 0 ? 1 : -1;
      if (direction.current === 0) {
        // First meaningful movement just establishes the initial leg —
        // it isn't a reversal yet, but it DOES start a new leg, so the
        // next threshold is measured from here, not from pointerdown.
        direction.current = dir;
        legStartX.current = e.clientX;
        return;
      }
      if (dir !== direction.current) {
        reversals.current += 1;
        legStartX.current = e.clientX;
        direction.current = dir;
        if (reversals.current >= reversalsNeeded) {
          done.current = true;
          holding.current = false;
          onCompleteRef.current();
        }
      }
    },
    [reversalsNeeded, travelThresholdPx]
  );

  const onPointerUp = useCallback(
    (e: ReactPointerEvent) => {
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {
        /* already released */
      }
      reset();
    },
    [reset]
  );

  const onPointerCancel = useCallback(
    (e: ReactPointerEvent) => {
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {
        /* already released */
      }
      reset();
    },
    [reset]
  );

  useEffect(() => {
    void targetRef;
    // React 18 dev Strict Mode mounts, cleans up, then remounts once on
    // initial mount — reusing these same refs. Without this reset, the
    // cleanup's done=true below would leak past that cycle and silently
    // disable every gesture on an otherwise freshly "mounted" level.
    done.current = false;
    holding.current = false;
    return () => {
      done.current = true;
      holding.current = false;
    };
  }, [targetRef]);

  return { onPointerDown, onPointerMove, onPointerUp, onPointerCancel };
}

export function hitTest(
  clientX: number,
  clientY: number,
  el: HTMLElement | null,
  padding = 8
): boolean {
  if (!el) return false;
  const r = el.getBoundingClientRect();
  return (
    clientX >= r.left - padding &&
    clientX <= r.right + padding &&
    clientY >= r.top - padding &&
    clientY <= r.bottom + padding
  );
}

/* ── Secrets & progress ─────────────────────────────────────────────── */

export function SecretMG({
  onCollect,
  className = "",
  style,
  label = "Collect secret",
}: {
  onCollect: () => void;
  className?: string;
  style?: CSSProperties;
  label?: string;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={(e) => {
        e.stopPropagation();
        onCollect();
      }}
      style={style}
      className={`absolute z-10 flex h-11 w-11 min-h-11 min-w-11 items-center justify-center bg-transparent p-0 opacity-50 transition-opacity hover:opacity-80 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-border ${className}`}
    >
      <span className="flex h-5 w-5 items-center justify-center rounded-sm border border-border/40 bg-muted/30 text-2xs font-medium text-muted-foreground">
        MG
      </span>
    </button>
  );
}

/** Call on mount to tell GameShell the progress level number should succeed. */
export function useProgressClickEnable(onProgressLevelClick?: () => void) {
  useEffect(() => {
    onProgressLevelClick?.();
  }, [onProgressLevelClick]);
}

export function ProgressClickable({
  level,
  onClick,
}: {
  level: number;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="min-h-11 min-w-11 rounded-md border border-dashed border-border bg-transparent px-2 py-1 text-sm tabular-nums text-muted-foreground underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border"
      aria-label={`Level ${level}`}
    >
      {String(level).padStart(2, "0")}
    </button>
  );
}

/* ── Activation helper ────────────────────────────────────────────────── */

export function useActivate(onActivate: () => void) {
  const activated = useRef(false);
  return useCallback(() => {
    if (!activated.current) {
      activated.current = true;
      onActivate();
    }
  }, [onActivate]);
}

/* ── Scoped puzzle-area listeners ───────────────────────────────────── */

export function useScopedFail(
  puzzleRef: React.RefObject<HTMLElement | null>,
  options: {
    onFail: () => void;
    enabled?: boolean;
    movementThreshold?: number;
    armingMs?: number;
  }
) {
  const { onFail, enabled = true, movementThreshold = 12, armingMs = 0 } =
    options;
  const armed = useRef(false);
  const origin = useRef<DragPos | null>(null);
  const onFailRef = useRef(onFail);
  onFailRef.current = onFail;

  useEffect(() => {
    if (!enabled) return;
    const root = puzzleRef.current;
    if (!root) return;

    let armTimer: ReturnType<typeof setTimeout> | undefined;
    if (armingMs > 0) {
      armTimer = setTimeout(() => {
        armed.current = true;
      }, armingMs);
    } else {
      armed.current = true;
    }

    const failIfInside = (clientX: number, clientY: number) => {
      if (!armed.current) return;
      const r = root.getBoundingClientRect();
      if (
        clientX >= r.left &&
        clientX <= r.right &&
        clientY >= r.top &&
        clientY <= r.bottom
      ) {
        onFailRef.current();
      }
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!armed.current) return;
      if (!origin.current) {
        origin.current = { x: e.clientX, y: e.clientY };
        return;
      }
      const dx = e.clientX - origin.current.x;
      const dy = e.clientY - origin.current.y;
      if (Math.hypot(dx, dy) > movementThreshold) {
        failIfInside(e.clientX, e.clientY);
      }
    };

    const onPointerDown = (e: PointerEvent) => {
      if (!armed.current) return;
      const r = root.getBoundingClientRect();
      if (
        e.clientX >= r.left &&
        e.clientX <= r.right &&
        e.clientY >= r.top &&
        e.clientY <= r.bottom
      ) {
        onFailRef.current();
      }
    };

    root.addEventListener("pointermove", onPointerMove);
    root.addEventListener("pointerdown", onPointerDown);

    return () => {
      if (armTimer) clearTimeout(armTimer);
      armed.current = false;
      origin.current = null;
      root.removeEventListener("pointermove", onPointerMove);
      root.removeEventListener("pointerdown", onPointerDown);
    };
  }, [enabled, armingMs, movementThreshold, puzzleRef]);
}

export function useNoInputSuccess(
  puzzleRef: React.RefObject<HTMLElement | null>,
  ms: number,
  onSuccess: () => void,
  onActivate: () => void,
  options?: {
    failOnInteraction?: boolean;
    onFail?: () => void;
    armingMs?: number;
  }
) {
  const activated = useRef(false);
  const done = useRef(false);
  const onSuccessRef = useRef(onSuccess);
  const onActivateRef = useRef(onActivate);
  const onFailRef = useRef(options?.onFail);
  onSuccessRef.current = onSuccess;
  onActivateRef.current = onActivate;
  onFailRef.current = options?.onFail;

  const failOnInteraction = options?.failOnInteraction ?? false;
  const armingMs = options?.armingMs ?? 0;

  useEffect(() => {
    done.current = false;
    activated.current = false;
    const timer = setTimeout(() => {
      if (!done.current) {
        done.current = true;
        onSuccessRef.current();
      }
    }, ms);
    return () => clearTimeout(timer);
  }, [ms]);

  useEffect(() => {
    const root = puzzleRef.current;
    if (!root || !failOnInteraction) return;

    let armed = armingMs <= 0;
    const armTimer =
      armingMs > 0
        ? setTimeout(() => {
            armed = true;
          }, armingMs)
        : undefined;

    const fail = () => {
      if (!armed || done.current) return;
      done.current = true;
      if (!activated.current) {
        activated.current = true;
        onActivateRef.current();
      }
      onFailRef.current?.();
    };

    // Any interaction inside the puzzle region — including blank root.
    const onPointerDown = (e: PointerEvent) => {
      if (root === e.target || root.contains(e.target as Node)) fail();
    };

    root.addEventListener("pointerdown", onPointerDown);
    return () => {
      if (armTimer) clearTimeout(armTimer);
      root.removeEventListener("pointerdown", onPointerDown);
    };
  }, [puzzleRef, failOnInteraction, armingMs]);
}

export function countLetters(text: string): number {
  return (text.match(/[a-zA-Z]/g) ?? []).length;
}

export function reverseWord(word: string): string {
  return word.split("").reverse().join("");
}

/* ── Maze helpers ───────────────────────────────────────────────────── */

/** Safe stroke/fill for maze walls — never raw var(--border). */
export const MAZE_WALL_FILL = "hsl(var(--border))";

export function clientToCell(
  clientX: number,
  clientY: number,
  rect: DOMRect,
  cell: number
): { row: number; col: number } {
  return {
    col: Math.floor((clientX - rect.left) / cell),
    row: Math.floor((clientY - rect.top) / cell),
  };
}

/** Sample points along a segment for continuous wall collision. */
export function sampleSegment(
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  stepPx = 4
): { x: number; y: number }[] {
  const dist = Math.hypot(x1 - x0, y1 - y0);
  const n = Math.max(1, Math.ceil(dist / stepPx));
  const pts: { x: number; y: number }[] = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    pts.push({ x: x0 + (x1 - x0) * t, y: y0 + (y1 - y0) * t });
  }
  return pts;
}

export function cellBlocked(
  maze: number[][],
  row: number,
  col: number,
  blockedValues: number[] = [1, 2]
): boolean {
  const v = maze[row]?.[col];
  if (v === undefined) return true;
  return blockedValues.includes(v);
}

/** True if the straight path between two client points crosses a blocked cell. */
export function pathHitsWall(
  maze: number[][],
  rect: DOMRect,
  cell: number,
  from: { x: number; y: number },
  to: { x: number; y: number },
  blockedValues: number[] = [1, 2]
): boolean {
  for (const p of sampleSegment(from.x, from.y, to.x, to.y)) {
    const { row, col } = clientToCell(p.x, p.y, rect, cell);
    if (cellBlocked(maze, row, col, blockedValues)) return true;
  }
  return false;
}
