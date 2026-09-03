"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { LevelProps, SafeRule } from "../types";
import {
  ADJECTIVES,
  COLORS,
  EXAM_POOL,
  MAZE_LAYOUTS,
  NOUNS,
  SIMON_COMMANDS,
  SYMBOLS,
} from "../banks";
import { pickInt, pickOne, randomFor, shuffle } from "../random";
import { level97TruthTable } from "../logic";
import { GRID_SIZE_98 } from "../constants";
import { generateMemoryPath } from "./memoryPath";
import {
  ChoiceButton,
  ChoiceRow,
  DraggableMarker,
  DraggableWord,
  MAZE_WALL_FILL,
  Prompt,
  PromptWord,
  PuzzleRoot,
  SecretMG,
  clientToCell,
  hitTest,
  pathHitsWall,
  useActivate,
  useNoInputSuccess,
  useProgressClickEnable,
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
  const opts = new Set<string>([correct]);
  while (opts.size < count) opts.add(pickOne(rng, [...SYMBOLS]));
  return shuffle(rng, Array.from(opts));
}

function useFrozenStat(value: number) {
  const ref = useRef(value);
  return ref.current;
}

/* ── Level 76 — Break conditioning + secret #5 ───────────────────────── */

export function Level76({
  onActivate,
  succeed,
  fail,
  collectSecret,
}: L) {
  const activate = useActivate(onActivate);
  const holdTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const secretGot = useRef(false);

  const labels = ["NO", "NO", "SAFE", "NO"] as const;

  const onSafeDown = () => {
    holdTimer.current = setTimeout(() => {
      if (!secretGot.current) {
        secretGot.current = true;
        collectSecret(5);
      }
    }, 800);
  };

  const onSafeUp = () => {
    if (holdTimer.current) clearTimeout(holdTimer.current);
  };

  return (
    <PuzzleRoot>
      <Prompt>RED = SAFE.</Prompt>
      <ChoiceRow>
        {labels.map((label, i) =>
          label === "SAFE" ? (
            <button
              key={`${label}-${i}`}
              type="button"
              style={{ color: "#dc2626", borderColor: "#dc2626" }}
              className="min-h-11 min-w-11 rounded-md border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border"
              onPointerDown={onSafeDown}
              onPointerUp={onSafeUp}
              onPointerLeave={onSafeUp}
              onClick={() => {
                activate();
                succeed();
              }}
            >
              {label}
            </button>
          ) : (
            <ChoiceButton
              key={`${label}-${i}`}
              style={{ color: "#dc2626", borderColor: "#dc2626" }}
              onClick={() => {
                activate();
                fail();
              }}
            >
              {label}
            </ChoiceButton>
          )
        )}
      </ChoiceRow>
    </PuzzleRoot>
  );
}

/* ── Level 77 — Green = danger: the literal word wins ─────────────────── */

export function Level77({ seed, onActivate, succeed, fail }: L) {
  const activate = useActivate(onActivate);
  const options = useMemo(() => {
    const opts = ["SAFE", "GREEN", "RED", "DANGER"] as const;
    return shuffle(randomFor(seed, 77, "opts"), [...opts]);
  }, [seed]);

  return (
    <PuzzleRoot>
      <Prompt>GREEN = DANGER. Choose danger.</Prompt>
      <ChoiceRow>
        {options.map((label) => (
          <ChoiceButton
            key={label}
            onClick={() => {
              activate();
              label === "DANGER" ? succeed() : fail();
            }}
          >
            {label}
          </ChoiceButton>
        ))}
      </ChoiceRow>
    </PuzzleRoot>
  );
}

/* ── Level 78 — Combined rules ───────────────────────────────────────── */

export function Level78({ onActivate, succeed, fail }: L) {
  const activate = useActivate(onActivate);
  return (
    <PuzzleRoot>
      <Prompt>Choose safety.</Prompt>
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

/* ── Level 79 — Prove both ───────────────────────────────────────────── */

export function Level79({ onActivate, succeed, fail }: L) {
  const activate = useActivate(onActivate);
  const [clicks, setClicks] = useState<string[]>([]);
  const deadline = useRef<number | null>(null);

  const onPick = (id: string) => {
    activate();
    const now = Date.now();
    if (clicks.length === 0) {
      deadline.current = now + 1500;
    } else if (deadline.current && now > deadline.current) {
      setClicks([]);
      deadline.current = null;
      fail();
      return;
    }
    const next = [...clicks, id];
    setClicks(next);
    if (next.length === 2) {
      if (next[0] === "red" && next[1] === "green") succeed();
      else {
        setClicks([]);
        fail();
      }
    } else if (id !== "red") {
      setClicks([]);
      fail();
    }
  };

  return (
    <PuzzleRoot>
      <p className="text-2xs text-muted-foreground">
        RED = SAFE → GREEN = DANGER
      </p>
      <Prompt>Prove both.</Prompt>
      <ChoiceRow>
        {COLORS.filter((c) => c.id === "red" || c.id === "green").map((c) => (
          <ChoiceButton
            key={c.id}
            style={{ color: c.hex, borderColor: c.hex }}
            onClick={() => onPick(c.id)}
          >
            {c.label}
            {clicks.includes(c.id) ? " ✓" : ""}
          </ChoiceButton>
        ))}
      </ChoiceRow>
    </PuzzleRoot>
  );
}

/* ── Level 80 — Reset (blue safe) ────────────────────────────────────── */

export function Level80({ onActivate, succeed, fail, updateMemory }: L) {
  const activate = useActivate(onActivate);
  const [showRule, setShowRule] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setShowRule(false), 700);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    updateMemory({ currentSafeRule: "BLUE" });
  }, [updateMemory]);

  return (
    <PuzzleRoot>
      {showRule ? (
        <p className="text-sm font-medium uppercase tracking-label text-foreground">
          RULES RESET
          <br />
          BLUE = SAFE
        </p>
      ) : (
        <Prompt>Choose safety.</Prompt>
      )}
      {!showRule ? (
        <ChoiceRow>
          {COLORS.map((c) => (
            <ChoiceButton
              key={c.id}
              style={{ color: c.hex, borderColor: c.hex }}
              onClick={() => {
                activate();
                c.id === "blue" ? succeed() : fail();
              }}
            >
              {c.label}
            </ChoiceButton>
          ))}
        </ChoiceRow>
      ) : null}
    </PuzzleRoot>
  );
}

/* ── Level 81 — Your door ────────────────────────────────────────────── */

export function Level81({ memory, seed, onActivate, succeed, fail }: L) {
  const activate = useActivate(onActivate);
  const correct = memory.chosenDoor ?? "A";
  const doors = useMemo(
    () => shuffle(randomFor(seed, 81, "doors"), ["A", "B", "C", "D"] as const),
    [seed]
  );

  return (
    <PuzzleRoot>
      <Prompt>Which door did you choose?</Prompt>
      <ChoiceRow>
        {doors.map((d) => (
          <ChoiceButton
            key={d}
            onClick={() => {
              activate();
              d === correct ? succeed() : fail();
            }}
          >
            {d}
          </ChoiceButton>
        ))}
      </ChoiceRow>
    </PuzzleRoot>
  );
}

/* ── Level 82 — Your number ──────────────────────────────────────────── */

export function Level82({ memory, seed, onActivate, succeed, fail }: L) {
  const activate = useActivate(onActivate);
  const correct = memory.chosenNumber ?? 1;
  const options = useMemo(() => {
    const rng = randomFor(seed, 82, "nums");
    return uniqueNumericDistractors(rng, correct, 4, 2);
  }, [seed, correct]);

  return (
    <PuzzleRoot>
      <Prompt>Which number did you choose?</Prompt>
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

/* ── Level 83 — Forgotten component ──────────────────────────────────── */

export function Level83({ memory, seed, onActivate, succeed, fail }: L) {
  const activate = useActivate(onActivate);
  const field = useMemo(
    () =>
      pickOne(randomFor(seed, 83, "field"), [
        "adjective",
        "noun",
        "number",
      ] as const),
    [seed]
  );

  const correct =
    field === "adjective"
      ? (memory.forgottenAdjective ?? "ANGRY")
      : field === "noun"
        ? (memory.forgottenNoun ?? "PANDA")
        : String(memory.forgottenNumber ?? 481);

  const prompt =
    field === "adjective"
      ? "Which adjective did I tell you to forget?"
      : field === "noun"
        ? "Which noun did I tell you to forget?"
        : "Which number did I tell you to forget?";

  const options = useMemo(() => {
    const rng = randomFor(seed, 83, "opts");
    if (field === "number") {
      return uniqueNumericDistractors(rng, Number(correct), 4, 5).map(String);
    }
    const pool = new Set<string>([correct]);
    const bank = field === "adjective" ? ADJECTIVES : NOUNS;
    for (const w of shuffle(rng, [...bank])) {
      if (w !== correct) pool.add(w);
      if (pool.size >= 4) break;
    }
    return shuffle(rng, Array.from(pool));
  }, [seed, field, correct]);

  return (
    <PuzzleRoot>
      <Prompt>{prompt}</Prompt>
      <ChoiceRow>
        {options.map((o) => (
          <ChoiceButton
            key={o}
            onClick={() => {
              activate();
              o === correct ? succeed() : fail();
            }}
          >
            {o}
          </ChoiceButton>
        ))}
      </ChoiceRow>
    </PuzzleRoot>
  );
}

/* ── Level 84 — Sequence callback ────────────────────────────────────── */

export function Level84({ memory, seed, onActivate, succeed, fail }: L) {
  const activate = useActivate(onActivate);
  const pos = useMemo(
    () => pickInt(randomFor(seed, 84, "pos"), 1, 5),
    [seed]
  );
  const correct = memory.sequence51?.[pos - 1] ?? "★";
  const options = useMemo(
    () => symbolChoices(randomFor(seed, 84, "sym"), correct, 4),
    [seed, correct]
  );

  return (
    <PuzzleRoot>
      <Prompt>What was symbol #{pos} on Level 51?</Prompt>
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

/* ── Level 85 — Your animal ──────────────────────────────────────────── */

export function Level85({ memory, seed, onActivate, succeed, fail }: L) {
  const activate = useActivate(onActivate);
  const correct = memory.animal56 ?? "PENGUIN";
  const options = useMemo(() => {
    const rng = randomFor(seed, 85, "animals");
    const opts = new Set([correct]);
    while (opts.size < 4) opts.add(pickOne(rng, ["PENGUIN", "OTTER", "FALCON", "LLAMA", "COBRA", "RAVEN"]));
    return shuffle(rng, Array.from(opts));
  }, [seed, correct]);

  return (
    <PuzzleRoot>
      <Prompt>What animal did I show you?</Prompt>
      <ChoiceRow className="flex-col">
        {options.map((a) => (
          <ChoiceButton
            key={a}
            className="w-full max-w-xs"
            onClick={() => {
              activate();
              a === correct ? succeed() : fail();
            }}
          >
            {a}
          </ChoiceButton>
        ))}
      </ChoiceRow>
    </PuzzleRoot>
  );
}

/* ── Level 86 — Its number ───────────────────────────────────────────── */

export function Level86({ memory, seed, onActivate, succeed, fail }: L) {
  const activate = useActivate(onActivate);
  const correct = memory.animalNumber56 ?? 74;
  const options = useMemo(() => {
    const rng = randomFor(seed, 86, "num");
    return uniqueNumericDistractors(rng, correct, 4, 3);
  }, [seed, correct]);

  return (
    <PuzzleRoot>
      <Prompt>What number belonged to it?</Prompt>
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

/* ── Level 87 — Fail count (frozen) ─────────────────────────────────── */

export function Level87({ stats, seed, onActivate, succeed, fail }: L) {
  const activate = useActivate(onActivate);
  const correct = useFrozenStat(stats.failCount);
  const options = useMemo(() => {
    const rng = randomFor(seed, 87, "fails");
    return uniqueNumericDistractors(rng, correct, 4, 2);
  }, [seed, correct]);

  return (
    <PuzzleRoot>
      <Prompt>How many times have you failed this run?</Prompt>
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

/* ── Level 88 — Break timer memory ───────────────────────────────────── */

export function Level88({ memory, seed, onActivate, succeed, fail }: L) {
  const activate = useActivate(onActivate);
  const correct = memory.livesAt50 ?? 5;
  const options = useMemo(() => {
    const rng = randomFor(seed, 88, "break");
    return uniqueNumericDistractors(rng, correct, 4, 1);
  }, [seed, correct]);

  return (
    <PuzzleRoot>
      <Prompt>What number did the Level 50 break timer start at?</Prompt>
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

/* ── Level 89 — Cost of failure ──────────────────────────────────────── */

export function Level89({ seed, onActivate, succeed, fail }: L) {
  const activate = useActivate(onActivate);
  const correct = 5;
  const options = useMemo(() => {
    const rng = randomFor(seed, 89, "cost");
    return uniqueNumericDistractors(rng, correct, 4, 1);
  }, [seed]);

  return (
    <PuzzleRoot>
      <Prompt>How many levels does a wrong answer cost you?</Prompt>
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

/* ── Level 90 — Rule memory ──────────────────────────────────────────── */

export function Level90({ memory, onActivate, succeed, fail }: L) {
  const activate = useActivate(onActivate);
  const correct: SafeRule = memory.currentSafeRule ?? "BLUE";
  const options: SafeRule[] = ["RED", "GREEN", "BLUE", "NONE"];

  return (
    <PuzzleRoot>
      <Prompt>What is SAFE now?</Prompt>
      <ChoiceRow>
        {options.map((o) => (
          <ChoiceButton
            key={o}
            onClick={() => {
              activate();
              o === correct ? succeed() : fail();
            }}
          >
            {o}
          </ChoiceButton>
        ))}
      </ChoiceRow>
    </PuzzleRoot>
  );
}

/* ── Level 91 — Bomb maze ────────────────────────────────────────────── */

export function Level91({ seed, onActivate, succeed, fail }: L) {
  const activate = useActivate(onActivate);
  // Prefer a traversable maze (layout 1 has a path around red)
  const maze = MAZE_LAYOUTS[pickInt(randomFor(seed, 91, "maze"), 0, MAZE_LAYOUTS.length - 1)]!;
  const cell = 40;
  const surfaceRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const parkingRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ row: 1, col: 1 });
  const [frozen, setFrozen] = useState(false);
  const [seconds, setSeconds] = useState(10);
  const lastClient = useRef<{ x: number; y: number } | null>(null);
  const done = useRef(false);

  useEffect(() => {
    if (frozen) return;
    if (seconds <= 0) {
      fail();
      return;
    }
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [seconds, frozen, fail]);

  const finishPos = useMemo(() => {
    const cols = maze[0]?.length ?? 1;
    // Prefer bottom-right open cell
    for (let r = maze.length - 1; r >= 0; r--) {
      for (let c = cols - 1; c >= 0; c--) {
        if (maze[r]![c] === 0 && !(r === 1 && c === 1)) {
          return { row: r, col: c };
        }
      }
    }
    return { row: 3, col: 3 };
  }, [maze]);

  const onBombDrop = (clientPos: { x: number; y: number }) => {
    activate();
    if (hitTest(clientPos.x, clientPos.y, parkingRef.current, 12)) {
      setFrozen(true);
    }
  };

  const onMove = useCallback(
    (clientPos: { x: number; y: number }) => {
      if (!frozen || done.current) return;
      const root = containerRef.current;
      if (!root) return;
      const rect = root.getBoundingClientRect();
      if (lastClient.current) {
        if (
          pathHitsWall(maze, rect, cell, lastClient.current, clientPos, [1, 2])
        ) {
          done.current = true;
          activate();
          fail();
          return;
        }
      }
      lastClient.current = clientPos;
      const { row, col } = clientToCell(clientPos.x, clientPos.y, rect, cell);
      if (maze[row]?.[col] === 0) setPos({ row, col });
    },
    [activate, fail, maze, frozen]
  );

  const onRelease = useCallback(
    (clientPos: { x: number; y: number }) => {
      if (!frozen || done.current) return;
      activate();
      const root = containerRef.current;
      if (!root) return;
      const rect = root.getBoundingClientRect();
      if (lastClient.current) {
        if (
          pathHitsWall(maze, rect, cell, lastClient.current, clientPos, [1, 2])
        ) {
          done.current = true;
          fail();
          lastClient.current = null;
          return;
        }
      }
      lastClient.current = null;
      const { row, col } = clientToCell(clientPos.x, clientPos.y, rect, cell);
      const v = maze[row]?.[col];
      if (v === 1 || v === 2 || v === undefined) {
        done.current = true;
        fail();
        return;
      }
      setPos({ row, col });
      if (row === finishPos.row && col === finishPos.col) {
        done.current = true;
        succeed();
      }
    },
    [activate, fail, succeed, maze, frozen, finishPos]
  );

  return (
    <PuzzleRoot>
      <Prompt>Bomb maze. ({frozen ? "FROZEN" : `${seconds}s`})</Prompt>
      <div
        ref={surfaceRef}
        className="relative flex w-full max-w-sm flex-col items-center gap-3 rounded-md border border-border bg-card/30 p-3"
      >
        {/* Neutral parking zone — outside the maze rectangle, inside the surface */}
        <div
          ref={parkingRef}
          className="flex h-11 w-full items-center justify-center rounded-md border border-dashed border-border bg-muted/20 text-2xs text-muted-foreground"
        >
          Park bomb here
        </div>
        <div
          ref={containerRef}
          className="relative border border-border"
          style={{ width: maze[0]!.length * cell, height: maze.length * cell }}
        >
          {maze.map((row, r) =>
            row.map((v, c) => (
              <div
                key={`${r}-${c}`}
                className="absolute border border-border/30"
                style={{
                  left: c * cell,
                  top: r * cell,
                  width: cell,
                  height: cell,
                  backgroundColor:
                    v === 1
                      ? MAZE_WALL_FILL
                      : v === 2
                        ? "#dc2626"
                        : "transparent",
                }}
              />
            ))
          )}
          {!frozen ? (
            <DraggableWord onDrop={onBombDrop}>
              <span className="absolute left-2 top-2 z-20 cursor-grab rounded-md border border-border bg-card px-2 py-1 text-2xs font-medium tabular-nums">
                {seconds}s
              </span>
            </DraggableWord>
          ) : null}
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
              pointerEvents: frozen ? "auto" : "none",
              opacity: frozen ? 1 : 0.4,
            }}
          >
            <span className="block h-4 w-4 rounded-full bg-foreground" />
          </DraggableMarker>
        </div>
        {!frozen ? (
          <BoyCameo
            edge="bottom-right"
            pose="inspect"
            say="Could use some space…"
            bubbleSide="left"
            scale={0.85}
            persist
          />
        ) : null}
      </div>
    </PuzzleRoot>
  );
}

/* ── Level 92 — Simon says ───────────────────────────────────────────── */

type SimonCmd = {
  text: string;
  simon: boolean;
  target: (typeof SIMON_COMMANDS)[number];
};

export function Level92({ seed, onActivate, succeed, fail }: L) {
  const activate = useActivate(onActivate);
  const commands = useMemo(() => {
    const rng = randomFor(seed, 92, "simon");
    const count = 6;
    return Array.from({ length: count }, () => {
      const target = pickOne(rng, SIMON_COMMANDS);
      const simon = rng() > 0.35;
      return {
        text: simon
          ? `Simon says click ${target}.`
          : `Click ${target}.`,
        simon,
        target,
      } satisfies SimonCmd;
    });
  }, [seed]);

  const [idx, setIdx] = useState(0);
  const [phase, setPhase] = useState<"show" | "wait">("show");
  const windowMs = useMemo(
    () => pickInt(randomFor(seed, 92, "window"), 1500, 2500),
    [seed]
  );

  useEffect(() => {
    if (phase !== "show") return;
    const t = setTimeout(() => setPhase("wait"), 800);
    return () => clearTimeout(t);
  }, [phase, idx]);

  useEffect(() => {
    if (phase !== "wait") return;
    const cmd = commands[idx]!;
    const t = setTimeout(() => {
      if (!cmd.simon) {
        if (idx + 1 >= commands.length) succeed();
        else {
          setIdx((i) => i + 1);
          setPhase("show");
        }
      } else {
        activate();
        fail();
        setIdx(0);
        setPhase("show");
      }
    }, windowMs);
    return () => clearTimeout(t);
  }, [phase, idx, commands, windowMs, succeed, fail, activate]);

  const onTarget = (target: string) => {
    activate();
    const cmd = commands[idx]!;
    if (!cmd.simon) {
      fail();
      setIdx(0);
      setPhase("show");
      return;
    }
    if (target !== cmd.target) {
      fail();
      setIdx(0);
      setPhase("show");
      return;
    }
    if (idx + 1 >= commands.length) succeed();
    else {
      setIdx((i) => i + 1);
      setPhase("show");
    }
  };

  const cmd = commands[idx];

  return (
    <PuzzleRoot>
      <Prompt>{phase === "show" ? cmd?.text : "..."}</Prompt>
      <ChoiceRow>
        {SIMON_COMMANDS.map((t) => (
          <ChoiceButton key={t} onClick={() => onTarget(t)}>
            {t}
          </ChoiceButton>
        ))}
      </ChoiceRow>
    </PuzzleRoot>
  );
}

/* ── Level 93 — Callback to level 3 ──────────────────────────────────── */

export function Level93({ memory, seed, onActivate, succeed, fail }: L) {
  const activate = useActivate(onActivate);
  const sum =
    (memory.chosenNumber ?? 0) + (memory.animalNumber56 ?? 0);
  const decoys = useMemo(() => {
    const rng = randomFor(seed, 93, "decoy");
    const opts = new Set<number>();
    while (opts.size < 4) {
      const n = pickInt(rng, Math.max(0, sum - 20), sum + 20);
      if (n !== sum) opts.add(n);
    }
    return Array.from(opts);
  }, [seed, sum]);

  return (
    <PuzzleRoot>
      <Prompt>
        What is the{" "}
        <PromptWord
          className="relative inline-block px-2 py-1 before:absolute before:-inset-3 before:content-['']"
          ariaLabel="answer"
          onClick={() => {
            activate();
            succeed();
          }}
        >
          answer
        </PromptWord>{" "}
        to your number + the animal&apos;s number?
      </Prompt>
      <ChoiceRow>
        {decoys.map((n) => (
          <ChoiceButton
            key={n}
            onClick={() => {
              activate();
              fail();
            }}
          >
            {n}
          </ChoiceButton>
        ))}
      </ChoiceRow>
    </PuzzleRoot>
  );
}

/* ── Level 94 — Chaos + secret #6 ────────────────────────────────────── */

export function Level94({
  onActivate,
  succeed,
  fail,
  collectSecret,
}: L) {
  const activate = useActivate(onActivate);
  const puzzleRef = useRef<HTMLDivElement>(null);
  const done = useRef(false);
  const [showNext, setShowNext] = useState(false);
  const [secretVisible, setSecretVisible] = useState(false);

  useEffect(() => {
    const secretT = setTimeout(() => setSecretVisible(true), 3000);
    const secretHide = setTimeout(() => setSecretVisible(false), 3800);
    return () => {
      clearTimeout(secretT);
      clearTimeout(secretHide);
    };
  }, []);

  const finish = useCallback(() => {
    if (done.current) return;
    done.current = true;
    setShowNext(true);
    setTimeout(() => succeed(), 700);
  }, [succeed]);

  useNoInputSuccess(puzzleRef, 7000, finish, activate, {
    failOnInteraction: true,
    onFail: () => {
      if (!done.current) fail();
    },
    armingMs: 100,
  });

  return (
    <PuzzleRoot
      onBackgroundClick={() => {
        if (done.current) return;
        activate();
        fail();
      }}
    >
      <div ref={puzzleRef} className="relative flex w-full flex-col items-center gap-4">
        <Prompt>Do nothing for 7 seconds.</Prompt>
        <ChoiceButton
          className="animate-pulse"
          style={{ transform: `translateX(${Math.sin(Date.now() / 400) * 20}px)` }}
          onClick={() => {
            activate();
            fail();
          }}
        >
          CLICK ME
        </ChoiceButton>
        <p className="text-2xs tabular-nums text-muted-foreground">00:07</p>
        <span className="text-2xs text-red-600 animate-pulse">WARNING</span>
        {secretVisible ? (
          <SecretMG
            onCollect={() => {
              activate();
              collectSecret(6);
              fail();
            }}
            className="right-4 top-4"
          />
        ) : null}
        {showNext ? (
          <p className="text-2xs font-medium uppercase tracking-label text-foreground">
            NEXT: TOUCH ALL FOUR CORNERS
          </p>
        ) : null}
      </div>
    </PuzzleRoot>
  );
}

/* ── Level 95 — Four corners ─────────────────────────────────────────── */

export function Level95({ onActivate, succeed, fail }: L) {
  const activate = useActivate(onActivate);
  const areaRef = useRef<HTMLDivElement>(null);
  const [corners, setCorners] = useState<Set<string>>(new Set());
  const firstTouch = useRef<number | null>(null);

  const cornerHit = (name: string, e: React.PointerEvent) => {
    activate();
    const now = Date.now();
    if (firstTouch.current == null) firstTouch.current = now;
    else if (now - firstTouch.current > 8000) {
      setCorners(new Set());
      firstTouch.current = now;
    }
    const next = new Set(corners);
    next.add(name);
    setCorners(next);
    if (next.size >= 4) succeed();
    void e;
  };

  const marker = (name: string) =>
    corners.has(name) ? (
      <span className="absolute h-1 w-1 rounded-full bg-muted-foreground" />
    ) : null;

  return (
    <PuzzleRoot>
      <div
        ref={areaRef}
        className="relative h-48 w-full max-w-md rounded-md border border-border"
      >
        <button
          type="button"
          aria-label="Top left corner"
          className="absolute left-0 top-0 h-12 w-12"
          onPointerDown={(e) => cornerHit("tl", e)}
        >
          {marker("tl")}
        </button>
        <button
          type="button"
          aria-label="Top right corner"
          className="absolute right-0 top-0 h-12 w-12"
          onPointerDown={(e) => cornerHit("tr", e)}
        >
          {marker("tr")}
        </button>
        <button
          type="button"
          aria-label="Bottom left corner"
          className="absolute bottom-0 left-0 h-12 w-12"
          onPointerDown={(e) => cornerHit("bl", e)}
        >
          {marker("bl")}
        </button>
        <button
          type="button"
          aria-label="Bottom right corner"
          className="absolute bottom-0 right-0 h-12 w-12"
          onPointerDown={(e) => cornerHit("br", e)}
        >
          {marker("br")}
        </button>
        <div
          className="absolute inset-12"
          onClick={() => {
            activate();
            fail();
          }}
          role="presentation"
        />
      </div>
    </PuzzleRoot>
  );
}

/* ── Level 96 — Exam boss ────────────────────────────────────────────── */

type MicroRound = {
  id: string;
  prompt: string;
  render: (props: {
    succeed: () => void;
    fail: () => void;
    activate: () => void;
    onProgressLevelClick?: () => void;
    registerProgressLevelSuccess?: (fn: (() => void) | null) => void;
  }) => ReactNode;
};

/** Boy's line on every exam restart — rotates so round 1 never feels identical twice. */
const EXAM_TAUNTS = [
  "Back to one. Rude, I know.",
  "You trusted me?",
  "Round one energy, right there.",
  "Again? Bold of you.",
  "That's a fresh start. Congrats.",
  "I'm not even mad. Actually I am.",
  "Sit with that for a second.",
  "New round who dis.",
] as const;

const EXAM_VICTORY_LINES = [
  "Didn't think you'd make it.",
  "Fine. You win this one.",
  "Okay, that was actually impressive.",
] as const;

/** Beat before advancing after the whole exam is cleared. */
const EXAM_VICTORY_HOLD_MS = 900;

export function Level96({
  seed,
  memory,
  onActivate,
  succeed,
  fail,
  onProgressLevelClick,
  registerProgressLevelSuccess,
}: L) {
  const activate = useActivate(onActivate);
  const rounds = useMemo(() => buildExamRounds(seed, memory), [seed, memory]);
  const [idx, setIdx] = useState(0);
  const [taunt, setTaunt] = useState<string | null>(null);
  const [finished, setFinished] = useState(false);
  const restartCount = useRef(0);
  const victoryLine = useMemo(
    () => pickOne(randomFor(seed, 96, "victory"), EXAM_VICTORY_LINES),
    [seed]
  );

  useEffect(() => {
    if (!finished) return;
    const t = window.setTimeout(() => succeed(), EXAM_VICTORY_HOLD_MS);
    return () => window.clearTimeout(t);
  }, [finished, succeed]);

  const advance = () => {
    setTaunt(null);
    if (idx + 1 >= rounds.length) {
      setFinished(true);
    } else {
      setIdx((i) => i + 1);
    }
  };

  const onFail = () => {
    // L96 special: restart the exam at round 1. Do NOT global back-5 —
    // the whole point of a boss exam is redoing THIS run, not losing 5
    // levels of unrelated progress on top of it.
    setIdx(0);
    setTaunt(EXAM_TAUNTS[restartCount.current % EXAM_TAUNTS.length]!);
    restartCount.current += 1;
  };

  if (finished) {
    return (
      <PuzzleRoot>
        <Prompt>EXAM CLEARED.</Prompt>
        <BoyCameo
          edge="bottom-left"
          pose="cheer"
          say={victoryLine}
          bubbleSide="right"
        />
      </PuzzleRoot>
    );
  }

  const round = rounds[idx];
  if (!round) return null;

  return (
    <PuzzleRoot>
      <div className="flex items-center gap-3">
        <p className="text-2xs text-muted-foreground">
          Exam {idx + 1}/{rounds.length}
        </p>
        <div className="flex items-center gap-1" aria-hidden>
          {rounds.map((_, i) => (
            <span
              key={i}
              className={`h-1.5 w-4 rounded-full transition-colors ${
                i < idx
                  ? "bg-foreground"
                  : i === idx
                    ? "bg-foreground/50"
                    : "bg-border"
              }`}
            />
          ))}
        </div>
      </div>
      <Prompt>{round.prompt}</Prompt>
      {taunt ? (
        <BoyCameo
          key={taunt}
          edge="bottom-left"
          pose="shrug"
          say={taunt}
          bubbleSide="right"
        />
      ) : null}
      {round.render({
        succeed: advance,
        fail: onFail,
        activate,
        onProgressLevelClick,
        registerProgressLevelSuccess,
      })}
    </PuzzleRoot>
  );
}

function buildExamRounds(
  seed: string,
  memory: LevelProps["memory"]
): MicroRound[] {
  const rng = randomFor(seed, 96, "exam");
  const pool = shuffle(rng, [...EXAM_POOL]).slice(0, 8);
  return pool.map((key, i) => examRound(key, seed, memory, i));
}

function examRound(
  key: (typeof EXAM_POOL)[number],
  seed: string,
  memory: LevelProps["memory"],
  i: number
): MicroRound {
  const rng = randomFor(seed, 96, `round-${i}-${key}`);
  switch (key) {
    case "largest": {
      // Font size is deliberately decoupled from position (and thus from
      // value) — the biggest button on screen must never be a free tell.
      const values = [2, 17, 43, 82];
      const sizes = shuffle(rng, [14, 18, 28, 40]);
      const items = shuffle(
        rng,
        values.map((n, j) => ({ n, size: sizes[j] }))
      );
      const correct = Math.max(...values);
      return {
        id: key,
        prompt: "Click the largest.",
        render: ({ succeed, fail, activate }) => (
          <ChoiceRow>
            {items.map(({ n, size }) => (
              <ChoiceButton
                key={n}
                style={{ fontSize: size }}
                onClick={() => {
                  activate();
                  n === correct ? succeed() : fail();
                }}
              >
                {n}
              </ChoiceButton>
            ))}
          </ChoiceRow>
        ),
      };
    }
    case "smallest": {
      const nums = shuffle(rng, [44, 12, 38, 19]);
      const correct = Math.min(...nums);
      return {
        id: key,
        prompt: "Click the smallest number.",
        render: ({ succeed, fail, activate }) => (
          <ChoiceRow>
            {nums.map((n) => (
              <ChoiceButton
                key={n}
                style={{ fontSize: 28 }}
                onClick={() => {
                  activate();
                  n === correct ? succeed() : fail();
                }}
              >
                {n}
              </ChoiceButton>
            ))}
          </ChoiceRow>
        ),
      };
    }
    case "secondLargest": {
      const values = [3, 21, 58, 96];
      const sizes = shuffle(rng, [16, 20, 30, 38]);
      const items = shuffle(
        rng,
        values.map((n, j) => ({ n, size: sizes[j] }))
      );
      const correct = [...values].sort((a, b) => b - a)[1]!;
      return {
        id: key,
        prompt: "Click the SECOND largest.",
        render: ({ succeed, fail, activate }) => (
          <ChoiceRow>
            {items.map(({ n, size }) => (
              <ChoiceButton
                key={n}
                style={{ fontSize: size }}
                onClick={() => {
                  activate();
                  n === correct ? succeed() : fail();
                }}
              >
                {n}
              </ChoiceButton>
            ))}
          </ChoiceRow>
        ),
      };
    }
    case "trapAnswer": {
      // Escalated callback to "answerWord": now every decoy also SAYS
      // "CORRECT" — only the literal word ANSWER is the answer.
      const items = shuffle(rng, [
        { label: "CORRECT", ok: false },
        { label: "CORRECT", ok: false },
        { label: "CORRECT", ok: false },
        { label: "ANSWER", ok: true },
      ]);
      return {
        id: key,
        prompt: "Click the CORRECT answer.",
        render: ({ succeed, fail, activate }) => (
          <ChoiceRow>
            {items.map((it, j) => (
              <ChoiceButton
                key={`${it.label}-${j}`}
                onClick={() => {
                  activate();
                  it.ok ? succeed() : fail();
                }}
              >
                {it.label}
              </ChoiceButton>
            ))}
          </ChoiceRow>
        ),
      };
    }
    case "trustNothing": {
      // Neither option is literally "RED" — the game's own RED=SAFE
      // training is the trap. The word SAFE is what's safe.
      const items = shuffle(rng, [
        { label: "SAFE", ok: true, color: "#22c55e" },
        { label: "DANGER", ok: false, color: "#dc2626" },
      ]);
      return {
        id: key,
        prompt: "Which one is safe?",
        render: ({ succeed, fail, activate }) => (
          <ChoiceRow>
            {items.map((it) => (
              <ChoiceButton
                key={it.label}
                style={{ color: it.color, borderColor: it.color }}
                onClick={() => {
                  activate();
                  it.ok ? succeed() : fail();
                }}
              >
                {it.label}
              </ChoiceButton>
            ))}
          </ChoiceRow>
        ),
      };
    }
    case "mirrorWord": {
      const idx = pickInt(rng, 0, 3);
      const labels = ["FLIP", "FLIP", "FLIP", "FLIP"];
      return {
        id: key,
        prompt: "Click the backwards one.",
        render: ({ succeed, fail, activate }) => (
          <ChoiceRow>
            {labels.map((label, j) => (
              <ChoiceButton
                key={j}
                style={j === idx ? { transform: "scaleX(-1)" } : undefined}
                onClick={() => {
                  activate();
                  j === idx ? succeed() : fail();
                }}
              >
                {label}
              </ChoiceButton>
            ))}
          </ChoiceRow>
        ),
      };
    }
    case "lastDigit": {
      const chosen = memory.chosenNumber ?? 1;
      const correct = String(Math.abs(chosen)).slice(-1);
      const digits = new Set<string>([correct]);
      while (digits.size < 5) digits.add(String(pickInt(rng, 0, 9)));
      const opts = shuffle(rng, Array.from(digits));
      return {
        id: key,
        prompt: "Last digit of the number you chose?",
        render: ({ succeed, fail, activate }) => (
          <ChoiceRow>
            {opts.map((d) => (
              <ChoiceButton
                key={d}
                onClick={() => {
                  activate();
                  d === correct ? succeed() : fail();
                }}
              >
                {d}
              </ChoiceButton>
            ))}
          </ChoiceRow>
        ),
      };
    }
    case "fakeFinish":
      return {
        id: key,
        prompt: "EXAM COMPLETE.",
        render: ({ succeed, fail, activate }) => (
          <div
            className="relative flex min-h-[10rem] w-full max-w-sm flex-col items-center justify-center gap-4 rounded-md border border-border bg-card/40 px-4 py-6"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                activate();
                succeed();
              }
            }}
          >
            <ChoiceButton
              className="border-destructive text-destructive"
              onClick={() => {
                activate();
                fail();
              }}
            >
              CONTINUE
            </ChoiceButton>
          </div>
        ),
      };
    case "answerWord":
      return {
        id: key,
        prompt: "Click the answer.",
        render: ({ succeed, fail, activate }) => (
          <Prompt>
            Click the{" "}
            <PromptWord
              className="relative inline-block px-1 before:absolute before:-inset-3 before:content-['']"
              ariaLabel="answer"
              onClick={() => {
                activate();
                succeed();
              }}
            >
              answer
            </PromptWord>
            .
          </Prompt>
        ),
      };
    case "colorReact":
      return {
        id: key,
        prompt: "Click blue.",
        render: ({ succeed, fail, activate }) => (
          <ChoiceRow>
            {COLORS.map((c) => (
              <ChoiceButton
                key={c.id}
                style={{ color: c.hex, borderColor: c.hex }}
                onClick={() => {
                  activate();
                  c.id === "blue" ? succeed() : fail();
                }}
              >
                {c.label}
              </ChoiceButton>
            ))}
          </ChoiceRow>
        ),
      };
    case "opposite":
      return {
        id: key,
        prompt: "Click YES.",
        render: ({ succeed, fail, activate }) => (
          <ChoiceRow>
            <ChoiceButton
              onClick={() => {
                activate();
                fail();
              }}
            >
              YES
            </ChoiceButton>
            <ChoiceButton
              onClick={() => {
                activate();
                succeed();
              }}
            >
              NO
            </ChoiceButton>
          </ChoiceRow>
        ),
      };
    case "chosenColor": {
      const correct = memory.chosenColor ?? "RED";
      return {
        id: key,
        prompt: "Your color?",
        render: ({ succeed, fail, activate }) => (
          <ChoiceRow>
            {COLORS.map((c) => (
              <ChoiceButton
                key={c.id}
                onClick={() => {
                  activate();
                  c.label === correct ? succeed() : fail();
                }}
              >
                {c.label}
              </ChoiceButton>
            ))}
          </ChoiceRow>
        ),
      };
    }
    case "stopCounter": {
      const x = pickInt(rng, 2, 8);
      return {
        id: key,
        prompt: `STOP AT ${x}`,
        render: ({ succeed, fail, activate }) => (
          <StopCounterRound target={x} succeed={succeed} fail={fail} activate={activate} />
        ),
      };
    }
    case "arith": {
      const a = pickInt(rng, 2, 9);
      const b = pickInt(rng, 2, 9);
      const correct = a + b;
      const opts = uniqueNumericDistractors(rng, correct, 4, 2);
      return {
        id: key,
        prompt: `${a} + ${b} = ?`,
        render: ({ succeed, fail, activate }) => (
          <ChoiceRow>
            {opts.map((n) => (
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
        ),
      };
    }
    case "background":
      return {
        id: key,
        prompt: "Click the background.",
        render: ({ succeed, fail, activate }) => (
          <div
            className="relative flex min-h-[10rem] w-full max-w-sm flex-col items-center justify-center gap-4 rounded-md border border-border bg-card/40 px-4 py-6"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                activate();
                succeed();
              }
            }}
          >
            <ChoiceButton
              onClick={() => {
                activate();
                fail();
              }}
            >
              NOT HERE
            </ChoiceButton>
          </div>
        ),
      };
    case "dontClick":
      return {
        id: key,
        prompt: "Don't click.",
        render: ({ succeed, fail, activate }) => (
          <WaitRound ms={5000} onSuccess={succeed} onFail={fail} activate={activate} />
        ),
      };
    case "sequence": {
      const sym = pickOne(rng, SYMBOLS);
      const opts = (() => {
        const set = new Set<string>([sym]);
        while (set.size < 4) set.add(pickOne(rng, [...SYMBOLS]));
        return shuffle(rng, Array.from(set));
      })();
      return {
        id: key,
        prompt: "Remember, then choose.",
        render: ({ succeed, fail, activate }) => (
          <SequenceMemoryRound
            symbol={sym}
            options={opts}
            succeed={succeed}
            fail={fail}
            activate={activate}
          />
        ),
      };
    }
    case "levelIndicator":
      return {
        id: key,
        prompt: "Click the level number.",
        render: ({
          succeed,
          fail,
          activate,
          onProgressLevelClick,
          registerProgressLevelSuccess,
        }) => (
          <LevelIndicatorRound
            succeed={succeed}
            fail={fail}
            activate={activate}
            onProgressLevelClick={onProgressLevelClick}
            registerProgressLevelSuccess={registerProgressLevelSuccess}
          />
        ),
      };
    default:
      return {
        id: key,
        prompt: "Continue.",
        render: ({ succeed, activate }) => (
          <ChoiceButton
            onClick={() => {
              activate();
              succeed();
            }}
          >
            OK
          </ChoiceButton>
        ),
      };
  }
}

const SHOUT_BEATS: { pose: "enter" | "point" | "shout" | "jump" | "stomp" | "panic"; say: string; ms: number }[] = [
  { pose: "enter", say: "CLICK IT!", ms: 900 },
  { pose: "point", say: "TRUST ME!!", ms: 1000 },
  { pose: "shout", say: "GO ON!", ms: 1000 },
  { pose: "jump", say: "CLICK! CLICK! CLICK!", ms: 1100 },
  { pose: "stomp", say: "CLICK! CLICK! CLICK!", ms: 1000 },
];

function StopCounterRound({
  target,
  succeed,
  fail,
  activate,
}: {
  target: number;
  succeed: () => void;
  fail: () => void;
  activate: () => void;
}) {
  const [count, setCount] = useState(1);
  const countRef = useRef(1);

  useEffect(() => {
    const id = setInterval(() => {
      setCount((c) => {
        const next = c >= 9 ? 1 : c + 1;
        countRef.current = next;
        return next;
      });
    }, 200);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex flex-col items-center gap-4">
      <p className="text-4xl font-semibold tabular-nums text-foreground">{count}</p>
      <ChoiceButton
        onClick={() => {
          activate();
          countRef.current === target ? succeed() : fail();
        }}
      >
        STOP
      </ChoiceButton>
    </div>
  );
}

function SequenceMemoryRound({
  symbol,
  options,
  succeed,
  fail,
  activate,
}: {
  symbol: string;
  options: string[];
  succeed: () => void;
  fail: () => void;
  activate: () => void;
}) {
  const [phase, setPhase] = useState<"show" | "ask">("show");

  useEffect(() => {
    const t = setTimeout(() => setPhase("ask"), 900);
    return () => clearTimeout(t);
  }, []);

  if (phase === "show") {
    return <p className="text-4xl text-foreground">{symbol}</p>;
  }

  return (
    <ChoiceRow>
      {options.map((s) => (
        <ChoiceButton
          key={s}
          className="text-xl"
          onClick={() => {
            activate();
            s === symbol ? succeed() : fail();
          }}
        >
          {s}
        </ChoiceButton>
      ))}
    </ChoiceRow>
  );
}

function LevelIndicatorRound({
  succeed,
  fail,
  activate,
  onProgressLevelClick,
  registerProgressLevelSuccess,
}: {
  succeed: () => void;
  fail: () => void;
  activate: () => void;
  onProgressLevelClick?: () => void;
  registerProgressLevelSuccess?: (fn: (() => void) | null) => void;
}) {
  useProgressClickEnable(onProgressLevelClick);

  // The real answer is the header's own level number — but clicking it
  // must resolve THIS sub-round, not the whole outer exam level.
  useEffect(() => {
    registerProgressLevelSuccess?.(succeed);
    return () => registerProgressLevelSuccess?.(null);
  }, [succeed, registerProgressLevelSuccess]);

  return (
    <ChoiceRow>
      {[96, 69, 42].map((n) => (
        <ChoiceButton
          key={n}
          onClick={() => {
            activate();
            fail();
          }}
        >
          {n}
        </ChoiceButton>
      ))}
    </ChoiceRow>
  );
}

function WaitRound({
  ms,
  onSuccess,
  onFail,
  activate,
}: {
  ms: number;
  onSuccess: () => void;
  onFail: () => void;
  activate: () => void;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [beatIdx, setBeatIdx] = useState(0);
  const beat = SHOUT_BEATS[Math.min(beatIdx, SHOUT_BEATS.length - 1)]!;

  useNoInputSuccess(rootRef, ms, onSuccess, activate, {
    failOnInteraction: true,
    onFail,
    armingMs: 200,
  });

  useEffect(() => {
    if (beatIdx >= SHOUT_BEATS.length - 1) return;
    const hold = SHOUT_BEATS[beatIdx]!.ms;
    const t = window.setTimeout(() => setBeatIdx((i) => i + 1), hold);
    return () => window.clearTimeout(t);
  }, [beatIdx]);

  return (
    <div
      ref={rootRef}
      className="relative flex min-h-[8rem] w-full items-center justify-center"
    >
      <ChoiceButton
        onClick={() => {
          activate();
          onFail();
        }}
      >
        TEMPTING
      </ChoiceButton>
      <BoyCameo
        edge="bottom-right"
        pose={beat.pose}
        say={beat.say}
        bubbleSide="left"
        scale={1.05}
        persist
      />
    </div>
  );
}

/* ── Level 97 — The liar ─────────────────────────────────────────────── */

export function Level97({ onActivate, succeed, fail }: L) {
  const activate = useActivate(onActivate);
  if (!level97TruthTable()) {
    throw new Error("Level 97 truth table invariant failed");
  }
  const statements = [
    { id: "A", text: "B is true." },
    { id: "B", text: "C is true." },
    { id: "C", text: "D is false." },
    { id: "D", text: "A is false." },
  ] as const;

  return (
    <PuzzleRoot>
      <Prompt>Exactly ONE statement is true. Click it.</Prompt>
      <ChoiceRow className="flex-col items-stretch">
        {statements.map((s) => (
          <ChoiceButton
            key={s.id}
            className="w-full max-w-sm text-left"
            onClick={() => {
              activate();
              s.id === "D" ? succeed() : fail();
            }}
          >
            <strong className="font-semibold">{s.id}:</strong> {s.text}
          </ChoiceButton>
        ))}
      </ChoiceRow>
    </PuzzleRoot>
  );
}

/* ── Level 98 — 9×9 memory path ───────────────────────────────────────── */

type Level98Phase =
  | "intro"
  | "revealing"
  | "memorizeHold"
  | "hidden"
  | "resolvingSuccess"
  | "resolvingFailure";

const LEVEL98_INTRO_MS = 300;
/** Per-cell stagger while the route is being flashed during the preview. */
const LEVEL98_REVEAL_STAGGER_MS = 130;
const LEVEL98_MEMORIZE_HOLD_MS = 1300;
const LEVEL98_SUCCESS_HOLD_MS = 900;
/** Route re-lights briefly before the fail beat, so a miss reads as a lesson. */
const LEVEL98_FAILURE_REVEAL_MS = 550;

export function Level98({
  seed,
  stats,
  onActivate,
  succeed,
  fail,
  reducedMotion,
}: L) {
  const activate = useActivate(onActivate);
  // Attempt index folds into the seed so a retry after a fail — same-level
  // per the 3-chance rule, or a later replay after a rollback — generates
  // a genuinely different route rather than repeating the one just missed.
  const attemptIndex = stats.levelAttempts[98] ?? 0;
  const path = useMemo(
    () => generateMemoryPath(`${seed}:98:${attemptIndex}`, GRID_SIZE_98),
    [seed, attemptIndex]
  );
  const start = path[0]!;
  const end = path[path.length - 1]!;
  const pathSet = useMemo(() => new Set(path), [path]);

  const [phase, setPhase] = useState<Level98Phase>("intro");
  const [revealCount, setRevealCount] = useState(0);
  // path[0] (START) is preselected — the next expected cell starts at index 1.
  const [progressIndex, setProgressIndex] = useState(1);
  const resolvedRef = useRef(false);

  useEffect(() => {
    if (phase !== "intro") return;
    activate();
    const t = window.setTimeout(
      () => setPhase("revealing"),
      reducedMotion ? LEVEL98_INTRO_MS * 1.6 : LEVEL98_INTRO_MS
    );
    return () => window.clearTimeout(t);
  }, [phase, activate, reducedMotion]);

  useEffect(() => {
    if (phase !== "revealing") return;
    if (revealCount >= path.length) {
      setPhase("memorizeHold");
      return;
    }
    const stagger = reducedMotion
      ? LEVEL98_REVEAL_STAGGER_MS * 1.6
      : LEVEL98_REVEAL_STAGGER_MS;
    const t = window.setTimeout(() => setRevealCount((c) => c + 1), stagger);
    return () => window.clearTimeout(t);
  }, [phase, revealCount, path.length, reducedMotion]);

  useEffect(() => {
    if (phase !== "memorizeHold") return;
    const hold = reducedMotion
      ? LEVEL98_MEMORIZE_HOLD_MS * 1.3
      : LEVEL98_MEMORIZE_HOLD_MS;
    const t = window.setTimeout(() => setPhase("hidden"), hold);
    return () => window.clearTimeout(t);
  }, [phase, reducedMotion]);

  useEffect(() => {
    if (phase !== "resolvingSuccess") return;
    const t = window.setTimeout(() => succeed(), LEVEL98_SUCCESS_HOLD_MS);
    return () => window.clearTimeout(t);
  }, [phase, succeed]);

  useEffect(() => {
    if (phase !== "resolvingFailure") return;
    const t = window.setTimeout(() => fail(), LEVEL98_FAILURE_REVEAL_MS);
    return () => window.clearTimeout(t);
  }, [phase, fail]);

  const onCellTap = (cell: number) => {
    // Accidental input during the preview or after resolution is ignored,
    // never punished — only a real decision during "hidden" counts.
    if (phase !== "hidden" || resolvedRef.current) return;
    activate();
    const expected = path[progressIndex];
    if (cell === expected) {
      const nextIndex = progressIndex + 1;
      if (nextIndex >= path.length) {
        resolvedRef.current = true;
        setPhase("resolvingSuccess");
      } else {
        setProgressIndex(nextIndex);
      }
      return;
    }
    resolvedRef.current = true;
    setPhase("resolvingFailure");
  };

  const revealedDuringPreview =
    phase === "revealing" || phase === "memorizeHold"
      ? new Set(path.slice(0, revealCount))
      : null;
  const showFullRouteGlow = phase === "memorizeHold" || phase === "resolvingFailure";
  const traveled = new Set(phase === "hidden" ? path.slice(0, progressIndex) : []);

  return (
    <PuzzleRoot className="min-h-[20rem]">
      <Prompt>Remember the route. START to END.</Prompt>
      <div
        className="grid w-full max-w-[380px] gap-[3px]"
        style={{ gridTemplateColumns: `repeat(${GRID_SIZE_98}, 1fr)` }}
      >
        {Array.from({ length: GRID_SIZE_98 * GRID_SIZE_98 }, (_, cell) => {
          const isStart = cell === start;
          const isEnd = cell === end;
          const isPathCell = pathSet.has(cell);
          const showDot =
            (revealedDuringPreview?.has(cell) ?? false) ||
            (showFullRouteGlow && isPathCell) ||
            traveled.has(cell) ||
            isStart ||
            isEnd;
          return (
            <button
              key={cell}
              type="button"
              disabled={phase !== "hidden"}
              onClick={() => onCellTap(cell)}
              aria-label={isStart ? "Start" : isEnd ? "End" : `Cell ${cell + 1}`}
              className={`relative aspect-square min-h-0 rounded-[3px] border transition-colors duration-200 ${
                isStart || isEnd
                  ? "border-foreground bg-foreground/10"
                  : "border-border/40 bg-muted/20"
              }`}
            >
              <span
                className="absolute left-1/2 top-1/2 block h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-foreground transition-opacity duration-200"
                style={{ opacity: showDot ? 1 : 0 }}
                aria-hidden
              />
            </button>
          );
        })}
      </div>
    </PuzzleRoot>
  );
}

/* ── Level 99 — Next (progress click) ────────────────────────────────── */

export function Level99({
  onActivate,
  fail,
  onProgressHundredClick,
}: L) {
  const activate = useActivate(onActivate);
  useEffect(() => {
    onProgressHundredClick?.();
  }, [onProgressHundredClick]);

  const options = ["100", "ONE HUNDRED", "99 + 1", "THE LAST ONE"];

  return (
    <PuzzleRoot>
      <Prompt>Which level comes next?</Prompt>
      <ChoiceRow className="flex-col">
        {options.map((o) => (
          <ChoiceButton
            key={o}
            className="w-full max-w-xs"
            onClick={() => {
              activate();
              fail("I asked which LEVEL comes next.");
            }}
          >
            {o}
          </ChoiceButton>
        ))}
      </ChoiceRow>
    </PuzzleRoot>
  );
}

/* ── Level 100 — Final troll ─────────────────────────────────────────── */

const WAIT_MESSAGES: { at: number; text: string }[] = [
  { at: 8, text: "No trick." },
  { at: 16, text: "Seriously." },
  { at: 28, text: "FOR ONCE, CLICK THE BUTTON." },
  { at: 45, text: "You've become paranoid." },
];

export function Level100({
  onActivate,
  succeed,
  collectSecret,
}: L) {
  const activate = useActivate(onActivate);
  const [elapsed, setElapsed] = useState(0);
  const [secretVisible, setSecretVisible] = useState(false);
  const secretShown = useRef(false);
  const done = useRef(false);

  useEffect(() => {
    const id = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (elapsed >= 25 && !secretShown.current) {
      secretShown.current = true;
      setSecretVisible(true);
      const t = setTimeout(() => setSecretVisible(false), 1250);
      return () => clearTimeout(t);
    }
  }, [elapsed]);

  const message = [...WAIT_MESSAGES].reverse().find((m) => elapsed >= m.at)?.text;

  return (
    <PuzzleRoot className="gap-8">
      <p className="text-lg font-medium text-foreground">Congratulations.</p>
      <p className="max-w-sm text-center text-sm text-muted-foreground">
        You completed all 100 levels.
      </p>
      <BoyCameo
        edge="bottom-left"
        pose={elapsed >= 28 ? "point" : "wave"}
        say={message}
        bubbleSide="right"
        persist
      />
      <div className="relative">
        {secretVisible ? (
          <SecretMG
            onCollect={() => collectSecret(7)}
            className="-left-8 top-1/2 -translate-y-1/2"
          />
        ) : null}
        <ChoiceButton
          className="px-10 py-3 text-base"
          onClick={() => {
            if (done.current) return;
            done.current = true;
            activate();
            succeed();
          }}
        >
          FINISH
        </ChoiceButton>
      </div>
    </PuzzleRoot>
  );
}
