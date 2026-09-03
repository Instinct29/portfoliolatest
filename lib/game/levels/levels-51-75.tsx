"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from "react";
import type { LevelProps } from "../types";
import {
  ANIMALS,
  COLORS,
  INVISIBLE_MAZES,
  SYMBOLS,
} from "../banks";
import { pickInt, pickOne, randomFor, shuffle } from "../random";
import { LEVEL_70_WAIT_MS } from "../constants";
import { reverseSequence } from "../logic";
import {
  ChoiceButton,
  ChoiceRow,
  DraggableMarker,
  MAZE_WALL_FILL,
  Prompt,
  PuzzleRoot,
  SecretMG,
  clientToCell,
  pathHitsWall,
  useActivate,
  useNoInputSuccess,
} from "./shared";
import { BoyCameo } from "@/components/game/boy";

type L = LevelProps;

function uniqueNumericDistractors(
  rng: () => number,
  correct: number,
  count: number,
  spread = 3
): number[] {
  const opts = new Set<number>([correct]);
  let guard = 0;
  while (opts.size < count && guard++ < 100) {
    const delta = pickInt(rng, -spread, spread);
    const v = correct + delta;
    if (v >= 0 && v !== correct) opts.add(v);
  }
  return shuffle(rng, Array.from(opts)).slice(0, count);
}

function symbolChoices(
  rng: () => number,
  correct: string,
  count = 4
): string[] {
  const pool = [...SYMBOLS];
  const opts = new Set<string>([correct]);
  while (opts.size < count) opts.add(pickOne(rng, pool));
  return shuffle(rng, Array.from(opts));
}

/* ── Level 51 — Sequence ─────────────────────────────────────────────── */

/** Readable hold for the 5-symbol sequence flash (L51). */
const LEVEL51_SHOW_MS = 1600;
const LEVEL51_KNOWN_SHOW_MS = 500;
const LEVEL51_STORED_MS = 700;
const LEVEL51_KNOWN_STORED_MS = 200;

export function Level51({
  seed,
  onActivate,
  succeed,
  updateMemory,
  memory,
}: L) {
  const activate = useActivate(onActivate);
  const sequence = useMemo(() => {
    if (memory.sequence51?.length === 5) return memory.sequence51;
    const rng = randomFor(seed, 51, "sequence");
    return shuffle(rng, [...SYMBOLS]).slice(0, 5);
  }, [seed, memory.sequence51]);

  const [phase, setPhase] = useState<"show" | "stored">("show");
  // Captured once at first render — see L41 for why the advance timers
  // below must not depend on the live memory.sequence51 prop.
  const alreadyKnown = useRef(memory.sequence51?.length === 5);
  const wrote = useRef(false);
  const advanced = useRef(false);

  useEffect(() => {
    if (wrote.current) return;
    wrote.current = true;
    updateMemory({ sequence51: sequence });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sequence]);

  useEffect(() => {
    activate();
    const showMs = alreadyKnown.current
      ? LEVEL51_KNOWN_SHOW_MS
      : LEVEL51_SHOW_MS;
    const storeMs = alreadyKnown.current
      ? LEVEL51_KNOWN_STORED_MS
      : LEVEL51_STORED_MS;
    const t1 = setTimeout(() => setPhase("stored"), showMs);
    const t2 = setTimeout(() => {
      if (advanced.current) return;
      advanced.current = true;
      succeed();
    }, showMs + storeMs);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
    // Intentionally runs once per mount only — see note above.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <PuzzleRoot>
      {phase === "show" ? (
        <>
          <Prompt>Remember this.</Prompt>
          <div className="flex gap-4 text-3xl">
            {sequence.map((s, i) => (
              <span key={`${s}-${i}`}>{s}</span>
            ))}
          </div>
        </>
      ) : (
        <Prompt>Stored.</Prompt>
      )}
    </PuzzleRoot>
  );
}

/* ── Level 52 — Tiny memory ──────────────────────────────────────────── */

export function Level52({ seed, onActivate, succeed, fail, reducedMotion }: L) {
  const activate = useActivate(onActivate);
  const { order, correct } = useMemo(() => {
    const rng = randomFor(seed, 52, "colors");
    const order = shuffle(rng, [...COLORS]).slice(0, 4);
    return { order, correct: order[1]!.label };
  }, [seed]);

  const [idx, setIdx] = useState(0);
  const [ask, setAsk] = useState(false);

  useEffect(() => {
    if (ask) return;
    if (idx >= order.length) {
      setAsk(true);
      return;
    }
    const t = setTimeout(() => setIdx((i) => i + 1), reducedMotion ? 900 : 650);
    return () => clearTimeout(t);
  }, [idx, ask, order.length, reducedMotion]);

  if (!ask) {
    const c = order[idx];
    return (
      <PuzzleRoot>
        <div
          className="h-16 w-16 rounded-md border border-border"
          style={{ backgroundColor: c?.hex }}
        />
      </PuzzleRoot>
    );
  }

  return (
    <PuzzleRoot>
      <Prompt>Which came second?</Prompt>
      <ChoiceRow>
        {order.map((c) => (
          <ChoiceButton
            key={c.id}
            style={{ color: c.hex, borderColor: c.hex }}
            onClick={() => {
              activate();
              c.label === correct ? succeed() : fail();
            }}
          >
            {c.label}
          </ChoiceButton>
        ))}
      </ChoiceRow>
    </PuzzleRoot>
  );
}

/* ── Level 53 — Repeat ───────────────────────────────────────────────── */

export function Level53({
  seed,
  onActivate,
  succeed,
  fail,
  updateMemory,
  memory,
}: L) {
  const activate = useActivate(onActivate);
  const sequence = useMemo(() => {
    if (memory.sequence53?.length === 4) return memory.sequence53;
    const rng = randomFor(seed, 53, "sequence");
    return shuffle(rng, [...SYMBOLS]).slice(0, 4);
  }, [seed, memory.sequence53]);

  // Always present visually first, then answering.
  const [phase, setPhase] = useState<"show" | "input">("show");
  const [input, setInput] = useState<string[]>([]);
  const wrote = useRef(false);

  useEffect(() => {
    if (wrote.current) return;
    wrote.current = true;
    updateMemory({ sequence53: sequence });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sequence]);

  useEffect(() => {
    if (phase !== "show") return;
    const t = setTimeout(() => setPhase("input"), 1500);
    return () => clearTimeout(t);
  }, [phase]);

  const onSymbol = (s: string) => {
    activate();
    const next = [...input, s];
    const expected = sequence[next.length - 1];
    if (s !== expected) {
      fail();
      setInput([]);
      return;
    }
    if (next.length === sequence.length) succeed();
    else setInput(next);
  };

  if (phase === "show") {
    return (
      <PuzzleRoot>
        <Prompt>Repeat this.</Prompt>
        <div className="flex gap-3 text-2xl">
          {sequence.map((s, i) => (
            <span key={`${s}-${i}`}>{s}</span>
          ))}
        </div>
      </PuzzleRoot>
    );
  }

  return (
    <PuzzleRoot>
      <Prompt>
        {input.length > 0
          ? `(${input.length}/${sequence.length})`
          : "Your turn."}
      </Prompt>
      <ChoiceRow>
        {SYMBOLS.map((s) => (
          <ChoiceButton key={s} onClick={() => onSymbol(s)}>
            {s}
          </ChoiceButton>
        ))}
      </ChoiceRow>
    </PuzzleRoot>
  );
}

/* ── Level 54 — Backwards ────────────────────────────────────────────── */

export function Level54({ memory, onActivate, succeed, fail, seed }: L) {
  const activate = useActivate(onActivate);
  const reversed = useMemo(
    () => reverseSequence(memory.sequence53 ?? ["★", "▲", "●", "◆"]),
    [memory.sequence53]
  );
  const [input, setInput] = useState<string[]>([]);
  // Stable once — no RNG during render. Every symbol the reversed sequence
  // actually needs must be clickable, not just the first — symbolChoices
  // only guarantees its one `correct` argument, so build the option set
  // from the whole reversed sequence directly instead.
  const options = useMemo(() => {
    const rng = randomFor(seed, 54, "distract");
    const opts = new Set<string>(reversed);
    while (opts.size < 5) opts.add(pickOne(rng, [...SYMBOLS]));
    return shuffle(rng, Array.from(opts));
  }, [seed, reversed]);

  const onSymbol = (s: string) => {
    activate();
    const next = [...input, s];
    const expected = reversed[next.length - 1];
    if (s !== expected) {
      fail();
      setInput([]);
      return;
    }
    if (next.length === reversed.length) succeed();
    else setInput(next);
  };

  return (
    <PuzzleRoot>
      <Prompt>Again. Backwards.</Prompt>
      <ChoiceRow>
        {options.map((s) => (
          <ChoiceButton key={s} onClick={() => onSymbol(s)}>
            {s}
          </ChoiceButton>
        ))}
      </ChoiceRow>
    </PuzzleRoot>
  );
}

/* ── Level 55 — Old memory ───────────────────────────────────────────── */

export function Level55({ memory, seed, onActivate, succeed, fail }: L) {
  const activate = useActivate(onActivate);
  const correct = memory.sequence51?.[2] ?? "●";
  const rng = useMemo(() => randomFor(seed, 55, "opts"), [seed]);
  const options = useMemo(
    () => symbolChoices(rng, correct, 4),
    [rng, correct]
  );

  return (
    <PuzzleRoot>
      <Prompt>What was third on Level 51?</Prompt>
      <ChoiceRow>
        {options.map((s) => (
          <ChoiceButton
            key={s}
            onClick={() => {
              activate();
              s === correct ? succeed() : fail();
            }}
          >
            {s}
          </ChoiceButton>
        ))}
      </ChoiceRow>
    </PuzzleRoot>
  );
}

/* ── Level 56 — Animal ───────────────────────────────────────────────── */

/** Readable hold for the animal=number flash (L56). */
const LEVEL56_FLASH_MS = 1500;
const LEVEL56_KNOWN_FLASH_MS = 500;
const LEVEL56_NOTE_MS = 400;

export function Level56({
  seed,
  onActivate,
  succeed,
  updateMemory,
  memory,
}: L) {
  const activate = useActivate(onActivate);
  const { animal, number } = useMemo(() => {
    if (memory.animal56 && memory.animalNumber56 != null) {
      return { animal: memory.animal56, number: memory.animalNumber56 };
    }
    const rng = randomFor(seed, 56, "animal");
    return {
      animal: pickOne(rng, ANIMALS),
      number: pickInt(rng, 10, 99),
    };
  }, [seed, memory.animal56, memory.animalNumber56]);

  const [phase, setPhase] = useState<"flash" | "noted">("flash");
  // Captured once at first render — see L41 for why the advance timer
  // below must not depend on the live memory.animal56 prop.
  const alreadyKnown = useRef(memory.animal56 != null);
  const wrote = useRef(false);
  const advanced = useRef(false);

  useEffect(() => {
    if (wrote.current) return;
    wrote.current = true;
    updateMemory({ animal56: animal, animalNumber56: number });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [animal, number]);

  useEffect(() => {
    activate();
    const flashMs = alreadyKnown.current
      ? LEVEL56_KNOWN_FLASH_MS
      : LEVEL56_FLASH_MS;
    const t1 = setTimeout(() => setPhase("noted"), flashMs);
    const t2 = setTimeout(() => {
      if (advanced.current) return;
      advanced.current = true;
      succeed();
    }, flashMs + LEVEL56_NOTE_MS);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
    // Intentionally runs once per mount only — see note above.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <PuzzleRoot>
      {phase === "flash" ? (
        <p className="text-xl font-medium tabular-nums text-foreground">
          {animal} = {number}
        </p>
      ) : (
        <Prompt>Noted.</Prompt>
      )}
    </PuzzleRoot>
  );
}

/* ── Level 57 — Your number ──────────────────────────────────────────── */

export function Level57({ memory, seed, onActivate, succeed, fail }: L) {
  const activate = useActivate(onActivate);
  const correct = memory.chosenNumber ?? 1;
  const options = useMemo(() => {
    const rng = randomFor(seed, 57, "nums");
    return uniqueNumericDistractors(rng, correct, 4, 2);
  }, [seed, correct]);

  return (
    <PuzzleRoot>
      <Prompt>What number did YOU choose?</Prompt>
      <ChoiceRow>
        {options.map((n) => (
          <ChoiceButton
            key={n}
            onClick={() => {
              activate();
              n === correct ? succeed() : fail();
            }}
          >
            {n}
          </ChoiceButton>
        ))}
      </ChoiceRow>
    </PuzzleRoot>
  );
}

/* ── Level 58 — Add them ─────────────────────────────────────────────── */

export function Level58({ memory, seed, onActivate, succeed, fail }: L) {
  const activate = useActivate(onActivate);
  const correct =
    (memory.chosenNumber ?? 0) + (memory.animalNumber56 ?? 0);
  const options = useMemo(() => {
    const rng = randomFor(seed, 58, "sum");
    return uniqueNumericDistractors(rng, correct, 4, 4);
  }, [seed, correct]);

  return (
    <PuzzleRoot>
      <Prompt>Your number + the animal&apos;s number?</Prompt>
      <ChoiceRow>
        {options.map((n) => (
          <ChoiceButton
            key={n}
            onClick={() => {
              activate();
              n === correct ? succeed() : fail();
            }}
          >
            {n}
          </ChoiceButton>
        ))}
      </ChoiceRow>
    </PuzzleRoot>
  );
}

/* ── Level 59 — Color memory ─────────────────────────────────────────── */

export function Level59({ memory, seed, onActivate, succeed, fail }: L) {
  const activate = useActivate(onActivate);
  const correct = (memory.chosenColor ?? "RED").toUpperCase();
  const options = useMemo(() => {
    const rng = randomFor(seed, 59, "order");
    return shuffle(
      rng,
      COLORS.map((c) => c.label)
    );
  }, [seed]);

  const inkFor = useMemo(() => {
    const map: Record<string, string> = {};
    for (const label of options) {
      const rng = randomFor(seed, 59, `ink-${label}`);
      const others = COLORS.filter((c) => c.label !== label);
      map[label] = others[pickInt(rng, 0, others.length - 1)]!.hex;
    }
    return map;
  }, [seed, options]);

  return (
    <PuzzleRoot>
      <Prompt>Which color did YOU choose?</Prompt>
      <ChoiceRow>
        {options.map((label) => (
          <ChoiceButton
            key={label}
            style={{ color: inkFor[label] }}
            onClick={() => {
              activate();
              label === correct ? succeed() : fail();
            }}
          >
            {label}
          </ChoiceButton>
        ))}
      </ChoiceRow>
    </PuzzleRoot>
  );
}

/* ── Level 60 — Forget ───────────────────────────────────────────────── */

export function Level60({ memory, seed, onActivate, succeed, fail }: L) {
  const activate = useActivate(onActivate);
  const correct = memory.forgottenPhrase ?? "ANGRY PANDA 481";
  const options = useMemo(() => {
    const rng = randomFor(seed, 60, "phrases");
    const adj = memory.forgottenAdjective ?? "ANGRY";
    const noun = memory.forgottenNoun ?? "PANDA";
    const num = memory.forgottenNumber ?? 481;
    const pool = new Set<string>([correct]);
    const candidates = [
      `${adj} ${noun} ${num + 1}`,
      `${adj} TIGER ${num}`,
      `CALM ${noun} ${num}`,
      `BRAVE ${noun} ${num}`,
      `${adj} EAGLE ${num + 2}`,
    ];
    for (const c of candidates) {
      if (c !== correct) pool.add(c);
      if (pool.size >= 4) break;
    }
    return shuffle(rng, Array.from(pool));
  }, [seed, correct, memory.forgottenAdjective, memory.forgottenNoun, memory.forgottenNumber]);

  return (
    <PuzzleRoot>
      <Prompt>What did I tell you to forget?</Prompt>
      <ChoiceRow className="flex-col">
        {options.map((p) => (
          <ChoiceButton
            key={p}
            className="w-full max-w-xs text-xs"
            onClick={() => {
              activate();
              p === correct ? succeed() : fail();
            }}
          >
            {p}
          </ChoiceButton>
        ))}
      </ChoiceRow>
    </PuzzleRoot>
  );
}

/* ── Level 61 — Below ────────────────────────────────────────────────── */

export function Level61({ onActivate, succeed }: L) {
  const activate = useActivate(onActivate);
  return (
    <PuzzleRoot className="items-stretch">
      <Prompt>Continue below.</Prompt>
      <div className="mx-auto h-48 w-full max-w-sm overflow-y-auto rounded-md border border-border bg-card/50">
        <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
          Not yet.
        </div>
        <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
          Keep scrolling.
        </div>
        <div className="flex h-32 items-center justify-center pb-6">
          <ChoiceButton
            onClick={() => {
              activate();
              succeed();
            }}
          >
            Continue
          </ChoiceButton>
        </div>
      </div>
    </PuzzleRoot>
  );
}

/* ── Level 62 — Catch me: chase, then the fall ────────────────────────── */

/** Chase-phase duration before ME detaches and starts falling. */
export const LEVEL62_AGGRESSIVE_MS = 4500;
const LEVEL62_FALL_SPEED_PX_S = 90;
const LEVEL62_PLATFORM_WIDTH = 92;
const LEVEL62_PLATFORM_HEIGHT = 44;
/** Forgiving horizontal catch margin either side of the platform. */
const LEVEL62_CATCH_MARGIN = 30;

type Level62Phase = "chase" | "falling" | "resolved";

export function Level62({ seed, onActivate, succeed, fail }: L) {
  const activate = useActivate(onActivate);
  const areaRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const meRef = useRef<HTMLSpanElement>(null);
  const platformRef = useRef<HTMLDivElement>(null);

  const [pos, setPos] = useState({ x: 120, y: 80 });
  const [phase, setPhase] = useState<Level62Phase>("chase");
  const [boyPose, setBoyPose] = useState<
    "point" | "laugh" | "cheer" | "shout"
  >("point");
  const [boySay, setBoySay] = useState("Wait…");

  const started = useRef(Date.now());
  const lastJump = useRef(0);
  const rng = useMemo(() => randomFor(seed, 62, "escape"), [seed]);
  const fallRng = useMemo(() => randomFor(seed, 62, "fall"), [seed]);

  const dragging = useRef(false);
  const platformX = useRef(0);
  const resolvedRef = useRef(false);

  // Phase A — chase: hard to catch at first, eases as the window closes.
  const teleport = useCallback(
    (aggressive: boolean) => {
      const area = areaRef.current;
      if (!area) return;
      const now = Date.now();
      const cooldown = aggressive ? 45 : 260;
      if (now - lastJump.current < cooldown) return;
      lastJump.current = now;
      const maxX = Math.max(16, area.clientWidth - 100);
      const maxY = Math.max(16, area.clientHeight - 48);
      setPos({ x: pickInt(rng, 8, maxX), y: pickInt(rng, 8, maxY) });
      setBoyPose(aggressive ? "laugh" : "cheer");
    },
    [rng]
  );

  useEffect(() => {
    if (phase !== "chase") return;
    started.current = Date.now();
    setBoySay("Wait…");
    const half = window.setTimeout(
      () => setBoySay("Then catch the sucker."),
      LEVEL62_AGGRESSIVE_MS * 0.4
    );
    const t = window.setTimeout(() => {
      setPhase("falling");
      setBoyPose("shout");
      setBoySay("Below you!");
    }, LEVEL62_AGGRESSIVE_MS);
    return () => {
      window.clearTimeout(half);
      window.clearTimeout(t);
    };
  }, [phase]);

  useEffect(() => {
    if (phase !== "chase") return;
    const area = areaRef.current;
    if (!area) return;
    const near = (clientX: number, clientY: number) => {
      const btn = btnRef.current;
      if (!btn) return;
      const r = btn.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const dist = Math.hypot(clientX - cx, clientY - cy);
      const elapsed = Date.now() - started.current;
      const aggressive = elapsed < LEVEL62_AGGRESSIVE_MS * 0.7;
      const thresh = aggressive ? 90 : 55;
      if (dist < thresh) teleport(aggressive);
    };
    // Desktop chase via move; touch via proximity on pointerdown (no hover).
    const onMove = (e: PointerEvent) => near(e.clientX, e.clientY);
    const onDown = (e: PointerEvent) => {
      if (e.pointerType === "touch" || e.pointerType === "pen") {
        near(e.clientX, e.clientY);
      }
    };
    area.addEventListener("pointermove", onMove);
    area.addEventListener("pointerdown", onDown);
    return () => {
      area.removeEventListener("pointermove", onMove);
      area.removeEventListener("pointerdown", onDown);
    };
  }, [phase, teleport]);

  // Phase B — ME falls at a constant readable speed; the platform is
  // dragged underneath it. Collision is tested before the floor each tick
  // so a same-frame catch always wins.
  useEffect(() => {
    if (phase !== "falling") return;
    const area = areaRef.current;
    const meEl = meRef.current;
    const platformEl = platformRef.current;
    if (!area || !meEl || !platformEl) return;

    const rect = area.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const meX = pickInt(fallRng, Math.round(width * 0.2), Math.round(width * 0.8));
    let meY = -24;
    platformX.current = width / 2 - LEVEL62_PLATFORM_WIDTH / 2;
    platformEl.style.transform = `translateX(${platformX.current}px)`;
    meEl.style.transform = `translate(${meX}px, ${meY}px)`;

    const floorY = height - 6;
    const platformTopY = height - LEVEL62_PLATFORM_HEIGHT - 6;

    let raf = 0;
    let last = performance.now();

    const tick = (now: number) => {
      if (resolvedRef.current) return;
      const dt = Math.min(50, now - last) / 1000;
      last = now;

      // 1. move ME
      meY += LEVEL62_FALL_SPEED_PX_S * dt;
      meEl.style.transform = `translate(${meX}px, ${meY}px)`;

      // 2. test catch collision (wins ties over the floor check)
      const platformLeft = platformX.current - LEVEL62_CATCH_MARGIN;
      const platformRight =
        platformX.current + LEVEL62_PLATFORM_WIDTH + LEVEL62_CATCH_MARGIN;
      const horizontallyOver = meX >= platformLeft && meX <= platformRight;
      const crossedPlatform = meY >= platformTopY;

      if (horizontallyOver && crossedPlatform) {
        resolvedRef.current = true;
        setPhase("resolved");
        activate();
        succeed();
        return;
      }
      // 3. otherwise, the floor
      if (meY >= floorY) {
        resolvedRef.current = true;
        setPhase("resolved");
        activate();
        fail();
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [phase, fallRng, activate, succeed, fail]);

  const clampPlatformX = useCallback((x: number) => {
    const area = areaRef.current;
    if (!area) return x;
    return Math.max(0, Math.min(area.clientWidth - LEVEL62_PLATFORM_WIDTH, x));
  }, []);

  const onPlatformPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (phase !== "falling") return;
    dragging.current = true;
    activate();
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      /* unsupported */
    }
  };

  const movePlatformTo = (clientX: number) => {
    const area = areaRef.current;
    const platformEl = platformRef.current;
    if (!area || !platformEl) return;
    const rect = area.getBoundingClientRect();
    const x = clampPlatformX(clientX - rect.left - LEVEL62_PLATFORM_WIDTH / 2);
    platformX.current = x;
    platformEl.style.transform = `translateX(${x}px)`;
  };

  const onPlatformPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragging.current || phase !== "falling") return;
    movePlatformTo(e.clientX);
  };

  const endPlatformDrag = (e: ReactPointerEvent<HTMLDivElement>) => {
    dragging.current = false;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      /* already released */
    }
  };

  return (
    <PuzzleRoot>
      <Prompt>Catch{phase === "chase" ? " me." : "."}</Prompt>
      <div
        ref={areaRef}
        className="relative h-56 w-full max-w-md overflow-hidden rounded-md border border-border"
        style={{ touchAction: phase === "falling" ? "none" : undefined }}
      >
        {phase === "chase" && (
          <button
            ref={btnRef}
            type="button"
            style={{ left: pos.x, top: pos.y }}
            className="absolute min-h-11 min-w-11 rounded-md border border-border bg-card px-4 py-2 text-sm font-medium transition-none"
            onClick={activate}
          >
            BUTTON
          </button>
        )}
        {phase !== "chase" && (
          <>
            <span
              ref={meRef}
              className="absolute left-0 top-0 select-none text-lg font-semibold text-foreground"
              aria-hidden={phase === "resolved"}
            >
              ME
            </span>
            <div
              ref={platformRef}
              role="button"
              tabIndex={-1}
              aria-label="Catch platform — drag to position it under ME"
              onPointerDown={onPlatformPointerDown}
              onPointerMove={onPlatformPointerMove}
              onPointerUp={endPlatformDrag}
              onPointerCancel={endPlatformDrag}
              className="absolute bottom-1 left-0 flex cursor-grab select-none items-center justify-center rounded-md border border-border-strong bg-card text-2xs font-medium text-muted-foreground active:cursor-grabbing"
              style={{
                width: LEVEL62_PLATFORM_WIDTH,
                height: LEVEL62_PLATFORM_HEIGHT,
                touchAction: "none",
              }}
            >
              CATCH
            </div>
          </>
        )}
        <BoyCameo
          edge="left"
          y={12}
          pose={boyPose}
          say={boySay}
          bubbleSide="right"
          scale={0.9}
          persist
        />
      </div>
    </PuzzleRoot>
  );
}

/* ── Level 63 — Invisible maze ───────────────────────────────────────── */

export function Level63({
  seed,
  onActivate,
  succeed,
  fail,
  collectSecret,
}: L) {
  const activate = useActivate(onActivate);
  const maze = useMemo(
    () =>
      INVISIBLE_MAZES[
        pickInt(randomFor(seed, 63, "maze"), 0, INVISIBLE_MAZES.length - 1)
      ]!,
    [seed]
  );
  const cell = 36;
  const containerRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);
  const [pos, setPos] = useState({ row: 1, col: 1 });
  const secretCollected = useRef(false);
  const lastClient = useRef<{ x: number; y: number } | null>(null);
  const pathLen = useRef(0);
  const done = useRef(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(false), 2000);
    return () => clearTimeout(t);
  }, []);

  // Finish is bottom-right path cell; secret is the top-right dead end.
  const finishPos = useMemo(
    () => ({ row: maze.length - 2, col: (maze[0]?.length ?? 7) - 2 }),
    [maze]
  );
  const secretPos = { row: 1, col: 5 };

  const onMove = useCallback(
    (clientPos: { x: number; y: number }) => {
      if (done.current) return;
      const root = containerRef.current;
      if (!root) return;
      const rect = root.getBoundingClientRect();
      // Collision stays even after walls fade
      if (lastClient.current) {
        if (pathHitsWall(maze, rect, cell, lastClient.current, clientPos, [1])) {
          done.current = true;
          activate();
          fail();
          return;
        }
        pathLen.current += Math.hypot(
          clientPos.x - lastClient.current.x,
          clientPos.y - lastClient.current.y
        );
      }
      lastClient.current = clientPos;
      const { row, col } = clientToCell(clientPos.x, clientPos.y, rect, cell);
      if (maze[row]?.[col] === 0) {
        setPos({ row, col });
        if (
          row === secretPos.row &&
          col === secretPos.col &&
          !secretCollected.current
        ) {
          secretCollected.current = true;
          collectSecret(4);
        }
      }
    },
    [activate, fail, maze, collectSecret]
  );

  const onRelease = useCallback(
    (clientPos: { x: number; y: number }) => {
      if (done.current) return;
      activate();
      const root = containerRef.current;
      if (!root) {
        lastClient.current = null;
        return;
      }
      const rect = root.getBoundingClientRect();
      if (lastClient.current) {
        if (pathHitsWall(maze, rect, cell, lastClient.current, clientPos, [1])) {
          done.current = true;
          fail();
          lastClient.current = null;
          return;
        }
      }
      lastClient.current = null;
      const { row, col } = clientToCell(clientPos.x, clientPos.y, rect, cell);
      if (maze[row]?.[col] !== 0) {
        done.current = true;
        fail();
        return;
      }
      setPos({ row, col });
      if (row === finishPos.row && col === finishPos.col) {
        // Block teleport START→FINISH
        if (pathLen.current < cell * 3) {
          done.current = true;
          fail();
          return;
        }
        done.current = true;
        succeed();
      }
    },
    [activate, fail, succeed, maze, finishPos]
  );

  return (
    <PuzzleRoot>
      <Prompt>Remember the path.</Prompt>
      <div
        ref={containerRef}
        className="relative border border-border"
        style={{
          width: (maze[0]?.length ?? 6) * cell,
          height: maze.length * cell,
        }}
      >
        {maze.map((row, r) =>
          row.map((v, c) => (
            <div
              key={`${r}-${c}`}
              className="absolute border border-border/20"
              style={{
                left: c * cell,
                top: r * cell,
                width: cell,
                height: cell,
                backgroundColor:
                  visible && v === 1 ? MAZE_WALL_FILL : "transparent",
                transition: "background-color 0.4s ease",
              }}
            />
          ))
        )}
        <span
          className="pointer-events-none absolute text-2xs text-muted-foreground"
          style={{ left: cell + 2, top: 4 }}
        >
          START
        </span>
        <span
          className="pointer-events-none absolute text-2xs text-muted-foreground"
          style={{
            left: finishPos.col * cell + 2,
            top: finishPos.row * cell + 4,
          }}
        >
          FINISH
        </span>
        <DraggableMarker
          onMove={onMove}
          onRelease={onRelease}
          onCancel={() => {
            lastClient.current = null;
          }}
          style={{
            left: pos.col * cell + cell / 2 - 8,
            top: pos.row * cell + cell / 2 - 16,
          }}
        >
          <span className="block h-4 w-4 rounded-full bg-foreground" />
        </DraggableMarker>
      </div>
    </PuzzleRoot>
  );
}

/* ── Level 64 — Where was dot ────────────────────────────────────────── */

export function Level64({ seed, onActivate, succeed, fail }: L) {
  const activate = useActivate(onActivate);
  const areaRef = useRef<HTMLDivElement>(null);
  const { dotPos, flashMs } = useMemo(() => {
    const rng = randomFor(seed, 64, "dot");
    return {
      dotPos: {
        x: pickInt(rng, 20, 80) / 100,
        y: pickInt(rng, 20, 80) / 100,
      },
      flashMs: pickInt(rng, 1200, 1500),
    };
  }, [seed]);
  const [phase, setPhase] = useState<"flash" | "guess">("flash");

  useEffect(() => {
    const t = setTimeout(() => setPhase("guess"), flashMs);
    return () => clearTimeout(t);
  }, [flashMs]);

  const onAreaTap = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (phase !== "guess") return;
    activate();
    // Single stable coordinate system: both the remembered dot and the
    // click are converted to the container's *current* pixel space, then
    // compared with an isotropic pixel radius — never a normalized-unit
    // distance, which stretches unevenly on a non-square container.
    const rect = e.currentTarget.getBoundingClientRect();
    const dotPxX = dotPos.x * rect.width;
    const dotPxY = dotPos.y * rect.height;
    const clickPxX = e.clientX - rect.left;
    const clickPxY = e.clientY - rect.top;
    const dist = Math.hypot(clickPxX - dotPxX, clickPxY - dotPxY);
    const coarse =
      typeof window !== "undefined" &&
      window.matchMedia("(pointer: coarse)").matches;
    const radius = coarse ? 40 : 30;
    dist < radius ? succeed() : fail();
  };

  return (
    <PuzzleRoot>
      <Prompt>
        {phase === "flash" ? "Remember where it is." : "Where was it?"}
      </Prompt>
      <div
        ref={areaRef}
        className="relative h-48 w-full max-w-md cursor-crosshair rounded-md border border-border touch-none"
        onPointerDown={onAreaTap}
      >
        {phase === "flash" ? (
          <span
            className="absolute block h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-foreground"
            style={{
              left: `${dotPos.x * 100}%`,
              top: `${dotPos.y * 100}%`,
            }}
          />
        ) : null}
      </div>
    </PuzzleRoot>
  );
}

/* ── Level 65 — The dot only shows in light mode ──────────────────────── */

/** Forgiving tap radius around the hidden dot. */
const LEVEL65_HIT_RADIUS_DESKTOP = 30;
const LEVEL65_HIT_RADIUS_MOBILE = 40;

export function Level65({ seed, onActivate, succeed, fail }: L) {
  const activate = useActivate(onActivate);
  const dotPos = useMemo(() => {
    const rng = randomFor(seed, 65, "dot");
    return {
      x: pickInt(rng, 20, 80) / 100,
      y: pickInt(rng, 20, 80) / 100,
    };
  }, [seed]);

  const onTap = (e: ReactPointerEvent<HTMLDivElement>) => {
    activate();
    const rect = e.currentTarget.getBoundingClientRect();
    const dotPxX = dotPos.x * rect.width;
    const dotPxY = dotPos.y * rect.height;
    const clickPxX = e.clientX - rect.left;
    const clickPxY = e.clientY - rect.top;
    const dist = Math.hypot(clickPxX - dotPxX, clickPxY - dotPxY);
    const coarse =
      typeof window !== "undefined" &&
      window.matchMedia("(pointer: coarse)").matches;
    const radius = coarse ? LEVEL65_HIT_RADIUS_MOBILE : LEVEL65_HIT_RADIUS_DESKTOP;
    dist < radius ? succeed() : fail();
  };

  return (
    <PuzzleRoot>
      <Prompt>Find the dot.</Prompt>
      <div
        className="relative h-48 w-full max-w-md cursor-crosshair touch-none rounded-md border border-border bg-card"
        onPointerDown={onTap}
      >
        {/*
          Always in the DOM — bg-card in dark mode makes it match the
          container exactly (invisible); dark:bg-card + a light-mode
          foreground fill makes it pop once the real theme toggle is used.
        */}
        <span
          className="absolute block h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-foreground dark:bg-card"
          style={{
            left: `${dotPos.x * 100}%`,
            top: `${dotPos.y * 100}%`,
          }}
        />
      </div>
    </PuzzleRoot>
  );
}

/* ── Level 66 — Follow the Shadow ──────────────────────────────────────── */

export function Level66({ seed, onActivate, succeed, fail, reducedMotion }: L) {
  const activate = useActivate(onActivate);
  const SLOT = 80;
  const setup = useMemo(() => {
    const rng = randomFor(seed, 66, "shadow");
    const target = pickInt(rng, 0, 2);
    const swapCount = pickInt(rng, 3, 5);
    const swaps = Array.from({ length: swapCount }, () => {
      const a = pickInt(rng, 0, 2);
      let b = pickInt(rng, 0, 2);
      while (b === a) b = pickInt(rng, 0, 2);
      return [a, b] as const;
    });
    return { target, swaps };
  }, [seed]);

  // order[slot] = cupId, so the shadow's opacity — keyed by cupId, not
  // slot — travels with the real target through every swap below.
  const [order, setOrder] = useState([0, 1, 2]);
  const [offsets, setOffsets] = useState([0, 0, 0]);
  const [phase, setPhase] = useState<
    "reveal" | "shuffle" | "settle" | "pick"
  >("reveal");
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (phase !== "reveal") return;
    const t = setTimeout(() => setPhase("shuffle"), reducedMotion ? 1600 : 1200);
    return () => clearTimeout(t);
  }, [phase, reducedMotion]);

  useEffect(() => {
    if (phase !== "shuffle") return;
    if (step >= setup.swaps.length) {
      setPhase("settle");
      return;
    }
    const [a, b] = setup.swaps[step]!;
    const dur = reducedMotion ? 700 : 420;
    setOffsets((prev) => {
      const next = [...prev];
      next[a] = (b - a) * SLOT;
      next[b] = (a - b) * SLOT;
      return next;
    });
    const t = setTimeout(() => {
      setOrder((prev) => {
        const next = [...prev];
        [next[a], next[b]] = [next[b]!, next[a]!];
        return next;
      });
      setOffsets([0, 0, 0]);
      setStep((s) => s + 1);
    }, dur);
    return () => clearTimeout(t);
  }, [phase, step, setup.swaps, reducedMotion]);

  useEffect(() => {
    if (phase !== "settle") return;
    const t = setTimeout(() => setPhase("pick"), 150);
    return () => clearTimeout(t);
  }, [phase]);

  const pick = (slot: number) => {
    if (phase !== "pick") return;
    activate();
    order[slot] === setup.target ? succeed() : fail();
  };

  return (
    <PuzzleRoot>
      <Prompt>Follow the shadow.</Prompt>
      <div className="relative mx-auto h-24" style={{ width: SLOT * 3 }}>
        {order.map((cupId, slot) => (
          <button
            key={cupId}
            type="button"
            disabled={phase !== "pick"}
            onClick={() => pick(slot)}
            className="absolute top-0 flex h-20 w-16 flex-col items-center justify-end rounded-sm border border-border bg-card pb-2 disabled:opacity-90"
            style={{
              left: slot * SLOT + 8,
              transform: `translateX(${offsets[slot] ?? 0}px)`,
              transition:
                offsets[slot] !== 0
                  ? `transform ${reducedMotion ? 0.65 : 0.38}s ease`
                  : "none",
            }}
          >
            {phase === "reveal" && cupId === setup.target ? (
              <span
                className="absolute -top-3 block h-2 w-2 rounded-full bg-foreground"
                aria-hidden
              />
            ) : null}
            {/* The one fair clue: the real target's shadow sits a hair
                darker than the rest — subtle, but consistent through the
                shuffle since it's keyed by cupId, not by slot. */}
            <span
              className="mb-2 block h-1.5 w-10 rounded-full bg-foreground"
              style={{ opacity: cupId === setup.target ? 0.3 : 0.15 }}
            />
          </button>
        ))}
      </div>
    </PuzzleRoot>
  );
}

/* ── Level 67 — Reaction ─────────────────────────────────────────────── */

export function Level67({ seed, onActivate, succeed, fail }: L) {
  const activate = useActivate(onActivate);
  const timing = useMemo(() => {
    const rng = randomFor(seed, 67, "react");
    const delay = pickInt(rng, 1000, 3000);
    const coarse =
      typeof window !== "undefined" &&
      window.matchMedia("(pointer: coarse)").matches;
    // Desktop ~900–1200ms; mobile ~1200–1500ms
    const windowMs = coarse
      ? pickInt(rng, 1200, 1500)
      : pickInt(rng, 900, 1200);
    return { delay, windowMs };
  }, [seed]);

  const [phase, setPhase] = useState<
    "get-ready" | "waiting" | "targetVisible" | "resolved"
  >("get-ready");
  const failTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const done = useRef(false);

  useEffect(() => {
    const ready = setTimeout(() => setPhase("waiting"), 400);
    const show = setTimeout(() => {
      if (done.current) return;
      setPhase("targetVisible");
      // Fail timer starts AFTER target visible
      failTimer.current = setTimeout(() => {
        if (done.current) return;
        done.current = true;
        setPhase("resolved");
        fail();
      }, timing.windowMs);
    }, 400 + timing.delay);
    return () => {
      clearTimeout(ready);
      clearTimeout(show);
      if (failTimer.current) clearTimeout(failTimer.current);
    };
  }, [timing, fail]);

  const onTarget = () => {
    if (phase !== "targetVisible" || done.current) return;
    done.current = true;
    if (failTimer.current) clearTimeout(failTimer.current);
    setPhase("resolved");
    activate();
    succeed();
  };

  const onEarly = () => {
    if (done.current || phase === "targetVisible" || phase === "resolved")
      return;
    if (phase === "get-ready") return;
    done.current = true;
    if (failTimer.current) clearTimeout(failTimer.current);
    setPhase("resolved");
    activate();
    fail();
  };

  return (
    <PuzzleRoot onBackgroundClick={onEarly}>
      <Prompt>
        {phase === "get-ready"
          ? "Get ready."
          : phase === "waiting"
            ? "…"
            : phase === "targetVisible"
              ? "NOW"
              : ""}
      </Prompt>
      {phase === "targetVisible" ? (
        <button
          type="button"
          onClick={onTarget}
          className="relative flex h-14 w-14 items-center justify-center rounded-full border border-border bg-card p-4 before:absolute before:inset-[-12px] before:content-['']"
          aria-label="React"
        >
          <span className="block h-3 w-3 rounded-full bg-foreground" />
        </button>
      ) : (
        <div className="h-14 w-14" onClick={onEarly} role="presentation" />
      )}
    </PuzzleRoot>
  );
}

/* ── Level 68 — Recognition ──────────────────────────────────────────── */

export function Level68({ memory, seed, onActivate, succeed, fail }: L) {
  const activate = useActivate(onActivate);
  const correct = memory.sequence51?.[0] ?? "★";
  const options = useMemo(() => {
    const rng = randomFor(seed, 68, "sym");
    return symbolChoices(rng, correct, 5);
  }, [seed, correct]);

  return (
    <PuzzleRoot>
      <Prompt>Click the familiar one.</Prompt>
      <ChoiceRow>
        {options.map((s) => (
          <ChoiceButton
            key={s}
            onClick={() => {
              activate();
              s === correct ? succeed() : fail();
            }}
          >
            {s}
          </ChoiceButton>
        ))}
      </ChoiceRow>
    </PuzzleRoot>
  );
}

/* ── Level 69 — Nothing ──────────────────────────────────────────────── */

export function Level69({ onActivate, succeed, fail }: L) {
  const activate = useActivate(onActivate);
  const decoys = ["CLICK ME", "HERE", "THIS ONE"];

  return (
    <PuzzleRoot
      onBackgroundClick={() => {
        activate();
        succeed();
      }}
    >
      <Prompt>Click nothing.</Prompt>
      <ChoiceRow>
        {decoys.map((d) => (
          <ChoiceButton
            key={d}
            onClick={() => {
              activate();
              fail();
            }}
          >
            {d}
          </ChoiceButton>
        ))}
      </ChoiceRow>
    </PuzzleRoot>
  );
}

/* ── Level 70 — Nothing II ───────────────────────────────────────────── */

export function Level70({ onActivate, succeed, fail, reducedMotion }: L) {
  const activate = useActivate(onActivate);
  const puzzleRef = useRef<HTMLDivElement>(null);
  const lines = useMemo(() => ["Hi.", "Hey.", "You good?"] as const, []);
  const [lineIdx, setLineIdx] = useState(0);
  const [x, setX] = useState(18);
  const [pose, setPose] = useState<"wave" | "idle" | "walk">("wave");

  useNoInputSuccess(puzzleRef, LEVEL_70_WAIT_MS, succeed, activate, {
    failOnInteraction: true,
    onFail: fail,
    armingMs: 200,
  });

  useEffect(() => {
    if (reducedMotion) {
      setPose("wave");
      return;
    }
    const waypoints = [18, 42, 68, 28, 55];
    let i = 0;
    const id = setInterval(() => {
      i = (i + 1) % waypoints.length;
      setX(waypoints[i]!);
      setLineIdx((n) => (n + 1) % lines.length);
      setPose(i % 2 === 0 ? "wave" : "walk");
    }, 1600);
    return () => clearInterval(id);
  }, [reducedMotion, lines.length]);

  return (
    <PuzzleRoot>
      <div ref={puzzleRef} className="relative flex w-full flex-col items-center gap-6">
        <Prompt>Don&apos;t click anything.</Prompt>
        <ChoiceRow>
          {["WAIT", "STOP", "NO"].map((d) => (
            <ChoiceButton
              key={d}
              onClick={() => {
                activate();
                fail();
              }}
            >
              {d}
            </ChoiceButton>
          ))}
        </ChoiceRow>
        <BoyCameo
          x={x}
          y={2}
          pose={pose}
          say={lines[lineIdx]}
          flip={x > 50}
          bubbleSide={x > 50 ? "left" : "right"}
          scale={0.95}
          persist
        />
      </div>
    </PuzzleRoot>
  );
}

/* ── Level 71 — Red = safe ───────────────────────────────────────────── */

export function Level71({ onActivate, succeed, fail, updateMemory }: L) {
  const activate = useActivate(onActivate);
  useEffect(() => {
    updateMemory({ currentSafeRule: "RED" });
  }, [updateMemory]);

  return (
    <PuzzleRoot>
      <Prompt>RED = SAFE.</Prompt>
      <ChoiceRow>
        {COLORS.map((c) => (
          <ChoiceButton
            key={c.id}
            style={{ color: c.hex, borderColor: c.hex }}
            onClick={() => {
              activate();
              c.id === "red" ? succeed() : fail();
            }}
          >
            {c.label}
          </ChoiceButton>
        ))}
      </ChoiceRow>
    </PuzzleRoot>
  );
}

/* ── Level 72 — Red = safe II ────────────────────────────────────────── */

export function Level72({ seed, onActivate, succeed, fail }: L) {
  const activate = useActivate(onActivate);
  const [positions, setPositions] = useState(() =>
    COLORS.map((c, i) => ({ id: c.id, x: i * 70, y: 0, c }))
  );

  useEffect(() => {
    const rng = randomFor(seed, 72, "move");
    const id = setInterval(() => {
      setPositions((prev) =>
        prev.map((p) => ({
          ...p,
          x: pickInt(rng, 0, 180),
          y: pickInt(rng, 0, 40),
        }))
      );
    }, 1200);
    return () => clearInterval(id);
  }, [seed]);

  return (
    <PuzzleRoot>
      <Prompt>RED = SAFE.</Prompt>
      <div className="relative h-24 w-full max-w-xs">
        {positions.map((p) => (
          <ChoiceButton
            key={p.id}
            style={{
              color: p.c.hex,
              borderColor: p.c.hex,
              position: "absolute",
              left: p.x,
              top: p.y,
              transition: "left 0.8s, top 0.8s",
            }}
            onClick={() => {
              activate();
              p.id === "red" ? succeed() : fail();
            }}
          >
            {p.c.label}
          </ChoiceButton>
        ))}
      </div>
    </PuzzleRoot>
  );
}

/* ── Level 73 — Red = safe III ───────────────────────────────────────── */

export function Level73({ seed, onActivate, succeed, fail }: L) {
  const activate = useActivate(onActivate);
  const options = useMemo(() => shuffle(randomFor(seed, 73, "opts"), [...COLORS]), [seed]);

  const ink = (label: string) => {
    const rng = randomFor(seed, 73, `ink-${label}`);
    const c = pickOne(rng, COLORS);
    return { color: c.hex };
  };

  return (
    <PuzzleRoot>
      <Prompt>RED = SAFE.</Prompt>
      <ChoiceRow>
        {options.map((c) => (
          <ChoiceButton
            key={c.id}
            style={ink(c.label)}
            onClick={() => {
              activate();
              c.id === "red" ? succeed() : fail();
            }}
          >
            {c.label}
          </ChoiceButton>
        ))}
      </ChoiceRow>
    </PuzzleRoot>
  );
}

/* ── Level 74 — Red = safe IV: the label is the trick, not the fill ────── */

export function Level74({ onActivate, succeed, fail }: L) {
  const activate = useActivate(onActivate);
  const red = COLORS.find((c) => c.id === "red")!;
  const green = COLORS.find((c) => c.id === "green")!;

  return (
    <PuzzleRoot>
      <Prompt>RED = SAFE.</Prompt>
      <div className="flex flex-wrap items-center justify-center gap-4">
        {/* Filled red — the color itself is unsafe; the label doesn't say RED. */}
        <button
          type="button"
          onClick={() => {
            activate();
            fail();
          }}
          className="flex min-h-16 min-w-24 items-center justify-center rounded-md border text-sm font-medium text-white"
          style={{ backgroundColor: red.hex, borderColor: red.hex }}
        >
          BLOCK
        </button>
        {/* A different fill whose text literally says RED — that's what's safe. */}
        <button
          type="button"
          onClick={() => {
            activate();
            succeed();
          }}
          className="flex min-h-16 min-w-24 items-center justify-center rounded-md border bg-muted text-sm font-semibold text-foreground"
          style={{ borderColor: green.hex }}
        >
          RED
        </button>
        {/* Green fill, unrelated label — fill color never mattered. */}
        <button
          type="button"
          onClick={() => {
            activate();
            fail();
          }}
          className="flex min-h-16 min-w-24 items-center justify-center rounded-md border text-sm font-medium text-white"
          style={{ backgroundColor: green.hex, borderColor: green.hex }}
        >
          SAFE
        </button>
      </div>
    </PuzzleRoot>
  );
}

/* ── Level 75 — Red = safe V ─────────────────────────────────────────── */

export function Level75({ onActivate, succeed, fail }: L) {
  const activate = useActivate(onActivate);
  const [seconds, setSeconds] = useState(2);
  const expired = useRef(false);

  useEffect(() => {
    if (seconds <= 0) {
      expired.current = true;
      fail();
      return;
    }
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [seconds, fail]);

  return (
    <PuzzleRoot>
      <Prompt>RED = SAFE. ({seconds}s)</Prompt>
      <ChoiceRow>
        {COLORS.map((c) => (
          <ChoiceButton
            key={c.id}
            style={{ color: c.hex, borderColor: c.hex }}
            onClick={() => {
              activate();
              if (expired.current) {
                fail();
                return;
              }
              c.id === "red" ? succeed() : fail();
            }}
          >
            {c.label}
          </ChoiceButton>
        ))}
      </ChoiceRow>
    </PuzzleRoot>
  );
}
