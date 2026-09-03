"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import type { LevelProps } from "../types";
import {
  ADJECTIVES,
  COLORS,
  EDIBLE,
  FALSE_EQUATIONS,
  NON_EDIBLE,
  NOUNS,
  SYMBOLS,
} from "../banks";
import { pickInt, pickOne, randomFor, shuffle } from "../random";
import {
  ChoiceButton,
  ChoiceRow,
  DraggableMarker,
  DraggableWord,
  Prompt,
  PromptWord,
  PuzzleRoot,
  SecretMG,
  hitTest,
  pointInRect,
  rectOverlapRatio,
  useActivate,
  useMeasuredTarget,
  useScopedFail,
  useShakeHold,
} from "./shared";
import { BoyCameo } from "@/components/game/boy";

type L = LevelProps;

/** Original 200ms tick was unreadably fast; ~30% slower keeps it tense but fair. */
const LEVEL27_TICK_MS = 260;
const LEVEL28_TICK_MS = 260;

/* ── Level 26 — Really green ────────────────────────────────────────── */

export function Level26({ seed, onActivate, succeed, fail, reducedMotion }: L) {
  const activate = useActivate(onActivate);
  const words = useMemo(() => {
    const rng = randomFor(seed, 26, "cycle");
    const labels = ["RED", "GREEN", "BLUE", "GREY"] as const;
    const frames: { text: string; color: string; id: string }[] = [];
    // Build a readable cycle with guaranteed GREEN+green windows.
    for (let i = 0; i < 10; i++) {
      if (i === 3 || i === 7) {
        const green = COLORS.find((c) => c.label === "GREEN")!;
        frames.push({ text: "GREEN", color: green.hex, id: "GREEN" });
        continue;
      }
      const text = labels[pickInt(rng, 0, labels.length - 1)]!;
      const colorEntry = COLORS[pickInt(rng, 0, COLORS.length - 1)]!;
      // Avoid accidental correct states outside the guaranteed slots.
      if (text === "GREEN" && colorEntry.label === "GREEN") {
        const other = COLORS.find((c) => c.label !== "GREEN")!;
        frames.push({ text, color: other.hex, id: other.label });
      } else {
        frames.push({ text, color: colorEntry.hex, id: colorEntry.label });
      }
    }
    return frames;
  }, [seed]);

  const [idx, setIdx] = useState(0);
  const dwellMs = reducedMotion ? 2600 : 1800;
  const matchDwellMs = reducedMotion ? 3600 : 2800;

  useEffect(() => {
    const current = words[idx]!;
    const match = current.text === "GREEN" && current.id === "GREEN";
    const ms = match ? matchDwellMs : dwellMs;
    const t = setTimeout(() => setIdx((i) => (i + 1) % words.length), ms);
    return () => clearTimeout(t);
  }, [idx, words, dwellMs, matchDwellMs]);

  const current = words[idx]!;

  return (
    <PuzzleRoot>
      <Prompt>Click when GREEN is green.</Prompt>
      <button
        type="button"
        style={{ color: current.color }}
        onClick={() => {
          activate();
          current.text === "GREEN" && current.id === "GREEN"
            ? succeed()
            : fail();
        }}
        className="min-h-12 min-w-[7rem] rounded-md border border-border bg-card px-6 py-3 text-lg font-semibold tracking-wide transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border"
        aria-label={current.text}
      >
        {current.text}
      </button>
    </PuzzleRoot>
  );
}

/* ── Level 27 — Stop at X ─────────────────────────────────────────────── */

export function Level27({ seed, onActivate, succeed, fail }: L) {
  const activate = useActivate(onActivate);
  const target = useMemo(
    () => pickInt(randomFor(seed, 27, "target"), 2, 8),
    [seed]
  );
  const [count, setCount] = useState(1);

  useEffect(() => {
    const t = setInterval(
      () => setCount((c) => (c >= 9 ? 1 : c + 1)),
      LEVEL27_TICK_MS
    );
    return () => clearInterval(t);
  }, []);

  return (
    <PuzzleRoot>
      <Prompt>STOP AT {target}</Prompt>
      <p className="text-4xl font-semibold tabular-nums text-foreground">{count}</p>
      <ChoiceButton
        onClick={() => {
          activate();
          count === target ? succeed() : fail();
        }}
      >
        STOP
      </ChoiceButton>
    </PuzzleRoot>
  );
}

/* ── Level 28 — Stop again (X in prompt) ──────────────────────────────── */

export function Level28({ seed, onActivate, succeed, fail }: L) {
  const activate = useActivate(onActivate);
  const target = useMemo(
    () => pickInt(randomFor(seed, 28, "target"), 2, 8),
    [seed]
  );
  const [count, setCount] = useState(1);

  useEffect(() => {
    const t = setInterval(() => {
      setCount((c) => {
        let next = c >= 9 ? 1 : c + 1;
        while (next === target) {
          next = next >= 9 ? 1 : next + 1;
        }
        return next;
      });
    }, LEVEL28_TICK_MS);
    return () => clearInterval(t);
  }, [target]);

  return (
    <PuzzleRoot>
      <Prompt>
        STOP AT{" "}
        <PromptWord
          onClick={() => {
            activate();
            succeed();
          }}
        >
          {target}
        </PromptWord>
      </Prompt>
      <p className="text-4xl font-semibold tabular-nums text-foreground">{count}</p>
      <ChoiceButton
        onClick={() => {
          activate();
          fail();
        }}
      >
        STOP
      </ChoiceButton>
    </PuzzleRoot>
  );
}

/* ── Level 29 — Your color ────────────────────────────────────────────── */

export function Level29({ memory, seed, onActivate, succeed, fail }: L) {
  const activate = useActivate(onActivate);
  const chosen = memory.chosenColor ?? "RED";
  const options = useMemo(() => {
    const rng = randomFor(seed, 29, "opts");
    const colors = shuffle(rng, [...COLORS]);
    const ink = shuffle(rng, [...COLORS]);
    return colors.map((c, i) => ({ ...c, ink: ink[i]!.hex }));
  }, [seed]);

  return (
    <PuzzleRoot>
      <Prompt>Which color did you choose?</Prompt>
      <ChoiceRow>
        {options.map((c) => (
          <ChoiceButton
            key={c.id}
            style={{ color: c.ink }}
            onClick={() => {
              activate();
              c.label === chosen ? succeed() : fail();
            }}
          >
            {c.label}
          </ChoiceButton>
        ))}
      </ChoiceRow>
    </PuzzleRoot>
  );
}

/* ── Level 30 — Forget this + secret #2 ───────────────────────────────── */

export function Level30({
  seed,
  onActivate,
  succeed,
  collectSecret,
  updateMemory,
  reducedMotion,
}: L) {
  const activate = useActivate(onActivate);
  const phrase = useMemo(() => {
    const rng = randomFor(seed, 30, "phrase");
    const adj = pickOne(rng, ADJECTIVES);
    const noun = pickOne(rng, NOUNS);
    const num = pickInt(rng, 100, 999);
    return { adj, noun, num, full: `${adj} ${noun} ${num}` };
  }, [seed]);

  const [phase, setPhase] = useState<"flash" | "forget" | "done">("flash");
  const [showSecret, setShowSecret] = useState(false);
  const flashMs = reducedMotion ? 1800 : 1200;
  const secretMs = reducedMotion ? 900 : 650;

  useEffect(() => {
    const t1 = setTimeout(() => {
      setPhase("forget");
      setShowSecret(true);
    }, flashMs);
    const t2 = setTimeout(() => setShowSecret(false), flashMs + secretMs);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [flashMs, secretMs]);

  const onContinue = () => {
    activate();
    updateMemory({
      forgottenAdjective: phrase.adj,
      forgottenNoun: phrase.noun,
      forgottenNumber: phrase.num,
      forgottenPhrase: phrase.full,
    });
    succeed();
  };

  if (phase === "flash") {
    return (
      <PuzzleRoot>
        <p className="text-xl font-semibold tracking-tight text-foreground">
          {phrase.full}
        </p>
      </PuzzleRoot>
    );
  }

  return (
    <PuzzleRoot>
      {showSecret && (
        <SecretMG
          style={{ top: "20%", left: "50%", transform: "translateX(-50%)" }}
          onCollect={() => {
            activate();
            collectSecret(2);
          }}
        />
      )}
      <Prompt>Forget that.</Prompt>
      <ChoiceButton onClick={onContinue}>CONTINUE</ChoiceButton>
      <BoyCameo
        edge="bottom-left"
        pose="lean"
        say="I'd remember that. Just saying."
        bubbleSide="right"
      />
    </PuzzleRoot>
  );
}

/* ── Level 31 — Dot in box ────────────────────────────────────────────── */

export function Level31({ onActivate, succeed, fail }: L) {
  const activate = useActivate(onActivate);
  const areaRef = useRef<HTMLDivElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const START = { x: 210, y: 150 };
  const [dot, setDot] = useState(START);

  const clientToLocal = (clientX: number, clientY: number) => {
    const area = areaRef.current;
    if (!area) return START;
    const r = area.getBoundingClientRect();
    return {
      x: Math.max(0, Math.min(r.width - 24, clientX - r.left - 12)),
      y: Math.max(0, Math.min(r.height - 24, clientY - r.top - 12)),
    };
  };

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    dragging.current = true;
    activate();
    setDot(clientToLocal(e.clientX, e.clientY));
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragging.current) return;
    setDot(clientToLocal(e.clientX, e.clientY));
  };

  const onPointerUp = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragging.current) return;
    dragging.current = false;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      /* released */
    }

    const box = boxRef.current;
    if (!box) {
      fail();
      setDot(START);
      return;
    }
    const r = box.getBoundingClientRect();
    const cx = e.clientX;
    const cy = e.clientY;
    const inside =
      cx >= r.left && cx <= r.right && cy >= r.top && cy <= r.bottom;
    if (inside) {
      succeed();
    } else {
      fail();
      setDot(START);
    }
  };

  return (
    <PuzzleRoot className="min-h-[18rem]">
      <Prompt>Put the dot inside the box.</Prompt>
      <div
        ref={areaRef}
        className="relative w-full max-w-sm select-none rounded-md border border-border-strong bg-muted/30"
        style={{ height: 220, touchAction: "none" }}
      >
        {/* Explicit pixel box — unmistakable square target */}
        <div
          ref={boxRef}
          aria-label="Target box"
          className="absolute flex items-center justify-center rounded-sm bg-transparent"
          style={{
            left: 16,
            top: 16,
            width: 112,
            height: 112,
            border: "2px solid hsl(var(--foreground))",
            boxSizing: "border-box",
          }}
        >
          <span className="pointer-events-none text-2xs uppercase tracking-label text-muted-foreground">
            box
          </span>
        </div>

        <div
          role="button"
          aria-label="Drag the ball into the box"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          className="absolute z-10 cursor-grab active:cursor-grabbing"
          style={{
            left: dot.x,
            top: dot.y,
            width: 24,
            height: 24,
            touchAction: "none",
          }}
        >
          <span
            className="block rounded-full bg-foreground shadow-sm"
            style={{ width: 24, height: 24 }}
          />
        </div>
      </div>
    </PuzzleRoot>
  );
}

/* ── Level 32 — Box around the word "dot" ─────────────────────────────── */

const LEVEL32_BOX_SIZE = 72;
/** Forgiving collision: box need only cover this fraction of the word's area. */
const LEVEL32_OVERLAP_THRESHOLD = 0.6;

export function Level32({ onActivate, succeed, fail }: L) {
  const activate = useActivate(onActivate);
  const areaRef = useRef<HTMLDivElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const { ref: dotWordRef, getRect: getDotWordRect } =
    useMeasuredTarget<HTMLSpanElement>();
  const START = { x: 16, y: 132 };
  const [box, setBox] = useState(START);

  const toLocal = (clientX: number, clientY: number) => {
    const area = areaRef.current;
    if (!area) return START;
    const r = area.getBoundingClientRect();
    return {
      x: Math.max(0, Math.min(r.width - LEVEL32_BOX_SIZE, clientX - r.left - LEVEL32_BOX_SIZE / 2)),
      y: Math.max(0, Math.min(r.height - LEVEL32_BOX_SIZE, clientY - r.top - LEVEL32_BOX_SIZE / 2)),
    };
  };

  return (
    <PuzzleRoot className="min-h-[16rem]">
      <div
        ref={areaRef}
        className="relative w-full max-w-sm select-none rounded-md border border-border-strong bg-muted/30"
        style={{ height: 220, touchAction: "none" }}
      >
        <p className="absolute left-4 right-4 top-4 max-w-[85%] text-sm leading-relaxed text-foreground">
          Put the box around the{" "}
          <span ref={dotWordRef} className="font-semibold">
            dot
          </span>
          .
        </p>
        <DraggableMarker
          style={{
            left: box.x,
            top: box.y,
            width: LEVEL32_BOX_SIZE,
            height: LEVEL32_BOX_SIZE,
          }}
          onMove={(pos) => {
            activate();
            setBox(toLocal(pos.x, pos.y));
          }}
          onRelease={() => {
            const el = boxRef.current;
            const wordRect = getDotWordRect();
            if (!el || !wordRect) {
              fail();
              setBox(START);
              return;
            }
            const boxRect = el.getBoundingClientRect();
            if (rectOverlapRatio(boxRect, wordRect) >= LEVEL32_OVERLAP_THRESHOLD) {
              succeed();
            } else {
              fail();
              setBox(START);
            }
          }}
          onCancel={() => setBox(START)}
        >
          <div
            ref={boxRef}
            className="h-full w-full rounded-sm border-2 border-foreground bg-transparent"
          />
        </DraggableMarker>
      </div>
    </PuzzleRoot>
  );
}

/* ── Level 33 — Feed the word "feed" ───────────────────────────────────── */

export function Level33({ seed, onActivate, succeed, fail }: L) {
  const activate = useActivate(onActivate);
  const items = useMemo(() => {
    const rng = randomFor(seed, 33, "items");
    const ed = shuffle(rng, [...EDIBLE]).slice(0, 3);
    const non = shuffle(rng, [...NON_EDIBLE]).slice(0, 2);
    return shuffle(rng, [...ed, ...non]);
  }, [seed]);

  const { ref: feedWordRef, getRect: getFeedWordRect } =
    useMeasuredTarget<HTMLSpanElement>();
  const [fed, setFed] = useState<Set<string>>(new Set());
  const edibleSet = useMemo(
    () => new Set(items.filter((i) => (EDIBLE as readonly string[]).includes(i))),
    [items]
  );

  const onDrop = (word: string, pos: { x: number; y: number }) => {
    activate();
    if (!(EDIBLE as readonly string[]).includes(word)) {
      fail();
      return;
    }
    // Missing the word entirely is not a failure — just try again.
    if (!pointInRect(pos.x, pos.y, getFeedWordRect(), 20)) return;
    const next = new Set(fed);
    next.add(word);
    setFed(next);
    if (next.size === edibleSet.size) succeed();
  };

  return (
    <PuzzleRoot>
      <Prompt>
        Drag something you would actually{" "}
        <span ref={feedWordRef} className="font-semibold">
          feed
        </span>{" "}
        someone.
      </Prompt>
      <ChoiceRow>
        {items.map((word) =>
          fed.has(word) ? null : (
            <DraggableWord key={word} onDrop={(pos) => onDrop(word, pos)}>
              <span className="rounded-md border border-border bg-card px-3 py-2 text-sm">
                {word}
              </span>
            </DraggableWord>
          )
        )}
      </ChoiceRow>
    </PuzzleRoot>
  );
}

/* ── Level 34 — Turn it off ───────────────────────────────────────────── */

export function Level34({ onActivate, succeed, fail }: L) {
  const activate = useActivate(onActivate);
  const lightRef = useRef<HTMLDivElement>(null);
  const [on, setOn] = useState(true);

  return (
    <PuzzleRoot>
      <Prompt>
        Turn the light{" "}
        <DraggableWord
          onDrop={(pos) => {
            activate();
            if (hitTest(pos.x, pos.y, lightRef.current, 20)) {
              setOn(false);
              succeed();
            } else fail();
          }}
        >
          <span className="font-semibold">OFF</span>
        </DraggableWord>
        .
      </Prompt>
      <div
        ref={lightRef}
        className="h-16 w-16 rounded-full transition-opacity"
        style={{
          backgroundColor: on ? "#fbbf24" : "var(--muted)",
          boxShadow: on ? "0 0 24px #fbbf2480" : "none",
          opacity: on ? 1 : 0.3,
        }}
      />
      <ChoiceButton
        onClick={() => {
          activate();
          fail();
        }}
      >
        Switch
      </ChoiceButton>
    </PuzzleRoot>
  );
}

/* ── Level 35 — Make THIS true ────────────────────────────────────────── */

/** Beat before advancing once "true" is typed, so the swap reads as a moment. */
const LEVEL35_SUCCESS_DELAY_MS = 260;

export function Level35({ seed, onActivate, succeed }: L) {
  const activate = useActivate(onActivate);
  // Deliberate misdirection: a false equation shown below, never checked.
  const eq = useMemo(
    () => pickOne(randomFor(seed, 35, "eq"), FALSE_EQUATIONS),
    [seed]
  );
  const inputRef = useRef<HTMLInputElement>(null);
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState("");
  const resolved = useRef(false);

  useEffect(() => {
    // Intentionally reads inputRef.current live at unmount time, not a
    // captured snapshot — the <input> only mounts later, once editing
    // starts, so there is nothing meaningful to capture here at mount.
    return () => {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      inputRef.current?.blur();
    };
  }, []);

  const openEditor = () => {
    activate();
    if (resolved.current) return;
    setEditing(true);
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  const onChange = (raw: string) => {
    if (resolved.current) return;
    setValue(raw);
    // Partial typing never fails — only a full case-insensitive "true" resolves it.
    if (raw.trim().toLowerCase() === "true") {
      resolved.current = true;
      window.setTimeout(() => {
        inputRef.current?.blur();
        succeed();
      }, LEVEL35_SUCCESS_DELAY_MS);
    }
  };

  return (
    <PuzzleRoot>
      <div className="flex items-center gap-2 text-2xl font-semibold tracking-tight text-foreground">
        <span>MAKE</span>
        {editing ? (
          <input
            ref={inputRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onBlur={() => {
              if (!resolved.current) setEditing(false);
            }}
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            aria-label="Replace THIS"
            className="w-24 border-b-2 border-foreground bg-transparent text-center text-2xl font-semibold text-foreground outline-none"
            style={{ caretColor: "transparent" }}
          />
        ) : (
          <button
            type="button"
            onClick={openEditor}
            className="min-h-11 border-b-2 border-dashed border-border-strong px-1 font-semibold text-foreground"
          >
            THIS
          </button>
        )}
        <span>TRUE</span>
      </div>
      <p className="text-sm text-muted-foreground" aria-hidden>
        {eq.left} = {eq.right}
      </p>
    </PuzzleRoot>
  );
}

/* ── Level 36 — Bigger dot ────────────────────────────────────────────── */

export function Level36({ onActivate, succeed, fail }: L) {
  const activate = useActivate(onActivate);
  const dotRef = useRef<HTMLSpanElement>(null);
  const [big, setBig] = useState(false);

  return (
    <PuzzleRoot>
      <Prompt>
        Make the dot{" "}
        <DraggableWord
          onDrop={(pos) => {
            activate();
            if (hitTest(pos.x, pos.y, dotRef.current, 16)) {
              setBig(true);
              succeed();
            } else fail();
          }}
        >
          <span className="font-semibold">bigger</span>
        </DraggableWord>
        .
      </Prompt>
      <span
        ref={dotRef}
        className="block rounded-full bg-foreground transition-all"
        style={{
          width: big ? 48 : 16,
          height: big ? 48 : 16,
        }}
      />
    </PuzzleRoot>
  );
}

/* ── Level 37 — Smaller dot ───────────────────────────────────────────── */

export function Level37({ onActivate, succeed, fail }: L) {
  const activate = useActivate(onActivate);
  const [size, setSize] = useState(48);
  const sizeRef = useRef(48);
  const resizing = useRef(false);
  const resizeStart = useRef({ x: 0, start: 48 });

  const onHandlePointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    activate();
    resizing.current = true;
    resizeStart.current = { x: e.clientX, start: sizeRef.current };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onHandlePointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!resizing.current) return;
    const ns = Math.max(
      8,
      Math.min(48, resizeStart.current.start + (e.clientX - resizeStart.current.x) * 0.5)
    );
    sizeRef.current = ns;
    setSize(ns);
  };

  const onHandlePointerUp = () => {
    if (!resizing.current) return;
    resizing.current = false;
    sizeRef.current <= 20 ? succeed() : fail();
  };

  return (
    <PuzzleRoot>
      <Prompt>Make the dot smaller.</Prompt>
      <div className="relative inline-block">
        <span
          className="block rounded-full bg-foreground"
          style={{ width: size, height: size }}
        />
        <div
          role="slider"
          aria-label="Resize dot"
          className="absolute -bottom-3 -right-3 h-11 w-11 min-h-11 min-w-11 cursor-se-resize rounded-sm border border-border bg-card"
          onPointerDown={onHandlePointerDown}
          onPointerMove={onHandlePointerMove}
          onPointerUp={onHandlePointerUp}
          onPointerCancel={onHandlePointerUp}
        />
      </div>
      <DraggableWord onDrop={() => { activate(); fail(); }}>
        <span className="text-sm text-muted-foreground">smaller</span>
      </DraggableWord>
    </PuzzleRoot>
  );
}

/* ── Level 38 — Shake the grass + secret #3 ───────────────────────────── */

const LEVEL38_REVERSALS_NEEDED = 5;
const LEVEL38_TRAVEL_PX = 16;

export function Level38({ onActivate, succeed, collectSecret }: L) {
  const activate = useActivate(onActivate);
  const grassRef = useRef<HTMLDivElement>(null);
  const [revealed, setRevealed] = useState(false);
  const [offsetX, setOffsetX] = useState(0);
  const dragStartX = useRef<number | null>(null);

  const shake = useShakeHold(grassRef, {
    reversalsNeeded: LEVEL38_REVERSALS_NEEDED,
    travelThresholdPx: LEVEL38_TRAVEL_PX,
    onShakeComplete: () => {
      activate();
      setOffsetX(0);
      dragStartX.current = null;
      setRevealed(true);
    },
  });

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    activate();
    dragStartX.current = e.clientX;
    shake.onPointerDown(e);
  };

  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (dragStartX.current != null) {
      setOffsetX(
        Math.max(-14, Math.min(14, (e.clientX - dragStartX.current) * 0.4))
      );
    }
    shake.onPointerMove(e);
  };

  const endGesture = (e: ReactPointerEvent<HTMLDivElement>) => {
    dragStartX.current = null;
    setOffsetX(0);
    shake.onPointerUp(e);
  };

  const cancelGesture = (e: ReactPointerEvent<HTMLDivElement>) => {
    dragStartX.current = null;
    setOffsetX(0);
    shake.onPointerCancel(e);
  };

  return (
    <PuzzleRoot>
      <Prompt>Hold the grass. Shake it.</Prompt>
      <div className="relative flex h-28 w-40 items-center justify-center">
        {!revealed ? (
          <div
            ref={grassRef}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={endGesture}
            onPointerCancel={cancelGesture}
            role="button"
            aria-label="Grass — hold and shake"
            className="flex h-20 w-20 cursor-grab select-none items-center justify-center text-2xl font-bold text-foreground/40 active:cursor-grabbing"
            style={{
              touchAction: "none",
              transform: `translateX(${offsetX}px) rotate(${offsetX * 0.4}deg)`,
            }}
          >
            GRASS
          </div>
        ) : (
          <>
            <SecretMG
              style={{ bottom: 0, left: 0 }}
              onCollect={() => {
                activate();
                collectSecret(3);
              }}
            />
            <button
              type="button"
              aria-label="Key"
              onClick={() => {
                activate();
                succeed();
              }}
              className="text-2xl"
            >
              KEY
            </button>
          </>
        )}
      </div>
    </PuzzleRoot>
  );
}

/* ── Level 39 — Unlock ────────────────────────────────────────────────── */

export function Level39({ onActivate, succeed, fail }: L) {
  const activate = useActivate(onActivate);
  const lockRef = useRef<HTMLDivElement>(null);
  const [flipped, setFlipped] = useState(false);
  const flippedRef = useRef(false);
  const [msg, setMsg] = useState<string | null>(null);
  const down = useRef<{ x: number; y: number } | null>(null);
  const dragged = useRef(false);
  const resolved = useRef(false);

  const onKeyPointerDown = (e: ReactPointerEvent<HTMLButtonElement>) => {
    if (resolved.current) return;
    down.current = { x: e.clientX, y: e.clientY };
    dragged.current = false;
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onKeyPointerMove = (e: ReactPointerEvent<HTMLButtonElement>) => {
    if (!down.current || resolved.current) return;
    if (
      Math.hypot(e.clientX - down.current.x, e.clientY - down.current.y) > 10
    ) {
      dragged.current = true;
      const mirror = flippedRef.current ? " scaleX(-1)" : "";
      e.currentTarget.style.transform = `translate(${e.clientX - down.current.x}px, ${e.clientY - down.current.y}px)${mirror}`;
    }
  };

  const onKeyPointerUp = (e: ReactPointerEvent<HTMLButtonElement>) => {
    if (!down.current || resolved.current) return;
    const wasDrag = dragged.current;
    const clientX = e.clientX;
    const clientY = e.clientY;
    down.current = null;
    e.currentTarget.style.transform = flippedRef.current ? "scaleX(-1)" : "";
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      /* */
    }

    // Click = flip only. Never treat a click as a failed drop.
    if (!wasDrag) {
      if (!flippedRef.current) {
        flippedRef.current = true;
        setFlipped(true);
        setMsg(null);
      }
      return;
    }

    activate();
    if (!flippedRef.current) {
      setMsg("Doesn't fit.");
      fail("Doesn't fit.");
      return;
    }
    if (hitTest(clientX, clientY, lockRef.current, 28)) {
      resolved.current = true;
      succeed();
    } else fail();
  };

  const onKeyPointerCancel = (e: ReactPointerEvent<HTMLButtonElement>) => {
    down.current = null;
    dragged.current = false;
    e.currentTarget.style.transform = flippedRef.current ? "scaleX(-1)" : "";
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      /* */
    }
  };

  return (
    <PuzzleRoot>
      <Prompt>Unlock the lock.</Prompt>
      <div className="flex items-center gap-10">
        <button
          type="button"
          onPointerDown={onKeyPointerDown}
          onPointerMove={onKeyPointerMove}
          onPointerUp={onKeyPointerUp}
          onPointerCancel={onKeyPointerCancel}
          className={`min-h-11 min-w-11 rounded-md border border-border bg-card px-3 py-2 text-sm font-medium select-none ${
            flipped ? "cursor-grab active:cursor-grabbing" : "cursor-pointer"
          }`}
          style={{
            transform: flipped ? "scaleX(-1)" : undefined,
            touchAction: "none",
          }}
          aria-label="Key"
        >
          KEY
        </button>
        <div
          ref={lockRef}
          className="flex h-16 w-12 items-center justify-center rounded-sm border-2 border-border-strong text-sm"
        >
          LOCK
        </div>
      </div>
      {msg && <p className="text-2xs text-muted-foreground">{msg}</p>}
    </PuzzleRoot>
  );
}

/* ── Level 40 — Leave ─────────────────────────────────────────────────── */

export function Level40({ onActivate, succeed, fail }: L) {
  const activate = useActivate(onActivate);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setReady(true), 3000);
    return () => clearTimeout(t);
  }, []);

  return (
    <PuzzleRoot>
      <Prompt>{ready ? "Okay. Now." : "Don't leave yet."}</Prompt>
      <ChoiceButton
        onClick={() => {
          activate();
          ready ? succeed() : fail();
        }}
        className="px-6"
      >
        Door →
      </ChoiceButton>
    </PuzzleRoot>
  );
}

/* ── Level 41 — Flash symbol ──────────────────────────────────────────── */

/** Readable hold for a single flashed symbol (L41). */
const LEVEL41_FLASH_HOLD_MS = 1100;
const LEVEL41_KNOWN_HOLD_MS = 400;

export function Level41({
  seed,
  memory,
  onActivate,
  succeed,
  updateMemory,
}: L) {
  const activate = useActivate(onActivate);
  const symbol = useMemo(() => {
    if (memory.flashedSymbol41) return memory.flashedSymbol41;
    return pickOne(randomFor(seed, 41, "symbol"), SYMBOLS);
  }, [seed, memory.flashedSymbol41]);

  // Captured once at first render — whether the symbol was already known
  // (e.g. a dev-tool jump) picks the timing branch. The advance timer
  // below must NOT depend on the live memory prop: writing the symbol to
  // memory changes that same prop moments after mount, which would tear
  // down and reschedule the timer on every settle instead of letting the
  // original one fire.
  const alreadyKnown = useRef(memory.flashedSymbol41 != null);
  const stored = useRef(false);
  const advanced = useRef(false);

  useEffect(() => {
    if (!stored.current) {
      stored.current = true;
      updateMemory({ flashedSymbol41: symbol });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [symbol]);

  useEffect(() => {
    activate();
    const advanceMs = alreadyKnown.current
      ? LEVEL41_KNOWN_HOLD_MS
      : LEVEL41_FLASH_HOLD_MS;
    const t = setTimeout(() => {
      if (advanced.current) return;
      advanced.current = true;
      succeed();
    }, advanceMs);
    return () => clearTimeout(t);
    // Intentionally runs once per mount only — see note above.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <PuzzleRoot>
      <p className="text-5xl text-foreground" aria-hidden>
        {symbol}
      </p>
    </PuzzleRoot>
  );
}

/* ── Level 42 — Blue (honest) ─────────────────────────────────────────── */

export function Level42({ onActivate, succeed, fail }: L) {
  const activate = useActivate(onActivate);
  return (
    <PuzzleRoot>
      <Prompt>Everything is normal. Click blue.</Prompt>
      <ChoiceRow>
        {COLORS.map((c) => (
          <ChoiceButton
            key={c.id}
            style={{ color: c.hex }}
            onClick={() => {
              activate();
              c.id === "blue" ? succeed() : fail();
            }}
          >
            {c.label}
          </ChoiceButton>
        ))}
      </ChoiceRow>
    </PuzzleRoot>
  );
}

/* ── Level 43 — Don't ─────────────────────────────────────────────────── */

export function Level43({ onActivate, succeed, fail }: L) {
  const activate = useActivate(onActivate);
  return (
    <PuzzleRoot>
      <Prompt>Click the button I didn&apos;t tell you not to click.</Prompt>
      <ChoiceRow>
        {[0, 1, 2].map((i) => (
          <ChoiceButton
            key={i}
            onClick={() => {
              activate();
              fail();
            }}
          >
            DON&apos;T CLICK ME
          </ChoiceButton>
        ))}
        <ChoiceButton
          onClick={() => {
            activate();
            succeed();
          }}
        >
          CLICK ME
        </ChoiceButton>
      </ChoiceRow>
    </PuzzleRoot>
  );
}

/* ── Level 44 — Definitely ────────────────────────────────────────────── */

export function Level44({ onActivate, succeed }: L) {
  const activate = useActivate(onActivate);
  const [hint, setHint] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setHint(true), 10000);
    return () => clearTimeout(t);
  }, []);

  return (
    <PuzzleRoot>
      <Prompt>Definitely don&apos;t click here.</Prompt>
      {hint && (
        <p className="text-sm text-muted-foreground">
          You&apos;re overthinking this.
        </p>
      )}
      <ChoiceButton
        className="px-10 py-6 text-lg"
        onClick={() => {
          activate();
          succeed();
        }}
      >
        HERE
      </ChoiceButton>
    </PuzzleRoot>
  );
}

/* ── Level 45 — Sure? ─────────────────────────────────────────────────── */

export function Level45({ onActivate, succeed, fail, updateMemory }: L) {
  const activate = useActivate(onActivate);
  const [phase, setPhase] = useState<"first" | "second">("first");
  const [firstChoice, setFirstChoice] = useState<"YES" | "NO" | null>(null);

  const onFirst = (choice: "YES" | "NO") => {
    activate();
    setFirstChoice(choice);
    updateMemory({ level45First: choice });
    setPhase("second");
  };

  const onSecond = (choice: "YES" | "NO") => {
    activate();
    if (!firstChoice) return;
    const correct = firstChoice === "YES" ? "NO" : "YES";
    choice === correct ? succeed() : fail();
  };

  if (phase === "first") {
    return (
      <PuzzleRoot>
        <Prompt>Are you sure?</Prompt>
        <ChoiceRow>
          {(["YES", "NO"] as const).map((o) => (
            <ChoiceButton key={o} onClick={() => onFirst(o)}>
              {o}
            </ChoiceButton>
          ))}
        </ChoiceRow>
      </PuzzleRoot>
    );
  }

  return (
    <PuzzleRoot>
      <Prompt>Are you sure you&apos;re sure?</Prompt>
      <ChoiceRow>
        {(["YES", "NO"] as const).map((o) => (
          <ChoiceButton key={o} onClick={() => onSecond(o)}>
            {o}
          </ChoiceButton>
        ))}
      </ChoiceRow>
    </PuzzleRoot>
  );
}

/* ── Level 46 — Flashback ─────────────────────────────────────────────── */

export function Level46({ memory, seed, onActivate, succeed, fail }: L) {
  const activate = useActivate(onActivate);
  const safe = memory.flashedSymbol41 ?? "★";
  const options = useMemo(() => {
    const rng = randomFor(seed, 46, "symbols");
    const set = new Set([safe]);
    while (set.size < 4) set.add(pickOne(rng, SYMBOLS));
    return shuffle(rng, Array.from(set));
  }, [seed, safe]);

  return (
    <PuzzleRoot>
      <Prompt>Which symbol is safe?</Prompt>
      <ChoiceRow>
        {options.map((s) => (
          <ChoiceButton
            key={s}
            className="text-xl"
            onClick={() => {
              activate();
              s === safe ? succeed() : fail();
            }}
          >
            {s}
          </ChoiceButton>
        ))}
      </ChoiceRow>
    </PuzzleRoot>
  );
}

/* ── Level 47 — Inspect ───────────────────────────────────────────────── */

export function Level47({ seed, onActivate, succeed, fail }: L) {
  const activate = useActivate(onActivate);
  const safeIdx = useMemo(
    () => pickInt(randomFor(seed, 47, "safe"), 0, 3),
    [seed]
  );
  const [revealed, setRevealed] = useState<number | null>(null);
  const holdTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const heldThisGesture = useRef(false);
  const blockClick = useRef(false);

  const onPointerDown = (idx: number) => (e: ReactPointerEvent) => {
    activate();
    e.preventDefault();
    heldThisGesture.current = false;
    holdTimer.current = setTimeout(() => {
      heldThisGesture.current = true;
      blockClick.current = true;
      setRevealed(idx);
    }, 500);
  };

  const onPointerUp = () => {
    if (holdTimer.current) clearTimeout(holdTimer.current);
    holdTimer.current = null;
    // Keep SAFE/NOPE briefly, but never treat this release as a selection.
    if (heldThisGesture.current) {
      setTimeout(() => setRevealed(null), 200);
    } else {
      setRevealed(null);
    }
  };

  const onTap = (idx: number) => {
    if (blockClick.current || heldThisGesture.current) {
      blockClick.current = false;
      heldThisGesture.current = false;
      return;
    }
    activate();
    idx === safeIdx ? succeed() : fail();
  };

  return (
    <PuzzleRoot>
      <Prompt>Hold to inspect. Tap to choose.</Prompt>
      <ChoiceRow>
        {[0, 1, 2, 3].map((idx) => (
          <button
            key={idx}
            type="button"
            onPointerDown={onPointerDown(idx)}
            onPointerUp={onPointerUp}
            onPointerLeave={onPointerUp}
            onPointerCancel={onPointerUp}
            onClick={() => onTap(idx)}
            className="relative min-h-11 min-w-11 rounded-md border border-border bg-card px-4 py-3 text-sm select-none touch-none"
            style={{ touchAction: "none" }}
          >
            {revealed === idx ? (idx === safeIdx ? "SAFE" : "NOPE") : "?"}
          </button>
        ))}
      </ChoiceRow>
    </PuzzleRoot>
  );
}

/* ── Level 48 — Freeze ────────────────────────────────────────────────── */

export function Level48({ onActivate, succeed, fail }: L) {
  const activate = useActivate(onActivate);
  const puzzleRef = useRef<HTMLDivElement>(null);
  const done = useRef(false);

  const handleFail = () => {
    if (done.current) return;
    done.current = true;
    activate();
    fail();
  };

  useScopedFail(puzzleRef, {
    onFail: handleFail,
    enabled: true,
    armingMs: 1000,
    movementThreshold: 10,
  });

  useEffect(() => {
    // ~1s arming grace, then ~4s stillness
    const t = setTimeout(() => {
      if (done.current) return;
      done.current = true;
      activate();
      succeed();
    }, 1000 + 4000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <PuzzleRoot>
      <div ref={puzzleRef} className="flex w-full flex-col items-center gap-6">
        <Prompt>DON&apos;T MOVE.</Prompt>
        <p className="text-2xs text-muted-foreground">Stay still for 4 seconds.</p>
      </div>
    </PuzzleRoot>
  );
}

/* ── Level 49 — Keep moving ───────────────────────────────────────────── */

export function Level49({ onActivate, succeed, fail }: L) {
  const activate = useActivate(onActivate);
  const puzzleRef = useRef<HTMLDivElement>(null);
  const lastMove = useRef(0);
  const done = useRef(false);
  const armed = useRef(false);
  const armStarted = useRef(0);

  useEffect(() => {
    const root = puzzleRef.current;
    if (!root) return;
    root.style.touchAction = "none";

    const arm = (now: number) => {
      if (armed.current) return;
      armed.current = true;
      armStarted.current = now;
      lastMove.current = now;
      activate();
    };

    // Grace: auto-arm after 1.2s even without movement
    const grace = setTimeout(() => arm(Date.now()), 1200);

    const onMove = (e: PointerEvent | TouchEvent) => {
      void e;
      const now = Date.now();
      if (!armed.current) {
        // First meaningful movement arms the challenge
        arm(now);
        return;
      }
      lastMove.current = now;
    };

    root.addEventListener("pointermove", onMove);
    root.addEventListener("touchmove", onMove, { passive: true });

    const check = setInterval(() => {
      if (done.current || !armed.current) return;
      if (Date.now() - lastMove.current > 550) {
        done.current = true;
        fail();
        return;
      }
      if (Date.now() - armStarted.current >= 5000) {
        done.current = true;
        succeed();
      }
    }, 80);

    return () => {
      clearTimeout(grace);
      root.style.touchAction = "";
      root.removeEventListener("pointermove", onMove);
      root.removeEventListener("touchmove", onMove);
      clearInterval(check);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <PuzzleRoot>
      <div
        ref={puzzleRef}
        className="flex min-h-[10rem] w-full flex-col items-center justify-center gap-4"
      >
        <Prompt>DON&apos;T STOP MOVING.</Prompt>
        <p className="text-2xs text-muted-foreground">
          Keep your pointer moving for 5 seconds.
        </p>
      </div>
    </PuzzleRoot>
  );
}

/* ── Level 50 — Break ─────────────────────────────────────────────────── */

export function Level50({
  onActivate,
  succeed,
  fail,
  updateMemory,
}: L) {
  const activate = useActivate(onActivate);
  const stored = useRef(false);
  const [count, setCount] = useState(5);
  const done = useRef(false);

  useEffect(() => {
    if (!stored.current) {
      stored.current = true;
      updateMemory({ livesAt50: 5 });
    }
  }, [updateMemory]);

  useEffect(() => {
    if (count <= 0) {
      if (!done.current) {
        done.current = true;
        succeed();
      }
      return;
    }
    const t = setTimeout(() => setCount((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [count, succeed]);

  return (
    <PuzzleRoot>
      <Prompt>Take a break.</Prompt>
      <p className="text-4xl font-semibold tabular-nums text-foreground">{count}</p>
      {count <= 2 && (
        <ChoiceButton
          onClick={() => {
            activate();
            fail();
          }}
          className="border-destructive text-destructive"
        >
          STOP THE BOMB
        </ChoiceButton>
      )}
      <BoyCameo
        edge="bottom-right"
        pose="idle"
        say="Not urgent. Really."
        bubbleSide="left"
        persist
      />
    </PuzzleRoot>
  );
}
