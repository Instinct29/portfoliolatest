"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { LevelProps } from "../types";
import { COLORS, MAZE_LAYOUTS, WORDS } from "../banks";
import { pickInt, pickOne, randomFor, shuffle } from "../random";
import {
  ChoiceButton,
  ChoiceRow,
  DraggableMarker,
  DraggableWord,
  MAZE_WALL_FILL,
  NumberChoice,
  Prompt,
  PromptWord,
  PuzzleRoot,
  SecretMG,
  clientToCell,
  countLetters,
  hitTest,
  pathHitsWall,
  reverseWord,
  useActivate,
  useProgressClickEnable,
} from "./shared";
import { BoyCameo, useBoySuccessGate } from "@/components/game/boy";

type L = LevelProps;

/* ── Level 01 — Largest (physical font) ─────────────────────────────── */

export function Level01({ seed, onActivate, succeed, fail, variant }: L) {
  const activate = useActivate(onActivate);
  const rng = useMemo(() => randomFor(seed, 1, "nums"), [seed]);
  const layout = useMemo(() => {
    const nums = new Set<number>();
    while (nums.size < 4) nums.add(pickInt(rng, 1, 99));
    const values = Array.from(nums);
    const sizes = [14, 18, 24, 36];
    const shuffledSizes = shuffle(rng, sizes);
    const winnerIdx = shuffledSizes.indexOf(Math.max(...shuffledSizes));
    return values.map((v, i) => ({
      value: v,
      size: shuffledSizes[i]!,
      winner: i === winnerIdx,
    }));
  }, [rng]);

  return (
    <PuzzleRoot>
      <Prompt>Click the largest.</Prompt>
      <ChoiceRow>
        {layout.map(({ value, size, winner }) => (
          <NumberChoice
            key={value}
            value={value}
            fontSize={size}
            onClick={() => {
              activate();
              winner ? succeed() : fail("Numbers aren't always about numbers.");
            }}
          />
        ))}
      </ChoiceRow>
      {variant === "teaser" ? null : null}
    </PuzzleRoot>
  );
}

/* ── Level 02 — Smallest (numeric) ──────────────────────────────────── */

export function Level02({ seed, onActivate, succeed, fail }: L) {
  const activate = useActivate(onActivate);
  const layout = useMemo(() => {
    const rng = randomFor(seed, 2, "nums");
    const nums = new Set<number>();
    while (nums.size < 4) nums.add(pickInt(rng, 10, 99));
    const values = Array.from(nums);
    const min = Math.min(...values);
    const sizes = [32, 14, 22, 18];
    const shuffledSizes = shuffle(rng, sizes);
    return values.map((v, i) => ({
      value: v,
      size: shuffledSizes[i]!,
      winner: v === min,
    }));
  }, [seed]);

  return (
    <PuzzleRoot>
      <Prompt>Click the smallest number.</Prompt>
      <ChoiceRow>
        {layout.map(({ value, size, winner }) => (
          <NumberChoice
            key={value}
            value={value}
            fontSize={size}
            onClick={() => {
              activate();
              winner ? succeed() : fail();
            }}
          />
        ))}
      </ChoiceRow>
    </PuzzleRoot>
  );
}

/* ── Level 03 — The answer ──────────────────────────────────────────── */

export function Level03({ onActivate, succeed, fail }: L) {
  const activate = useActivate(onActivate);
  const wrong = ["THIS", "THAT", "MAYBE", "NOPE"];

  return (
    <PuzzleRoot>
      <Prompt>
        Click the{" "}
        <PromptWord
          onClick={() => {
            activate();
            succeed();
          }}
        >
          answer
        </PromptWord>
        .
      </Prompt>
      <ChoiceRow>
        {wrong.map((w) => (
          <ChoiceButton
            key={w}
            onClick={() => {
              activate();
              fail();
            }}
          >
            {w}
          </ChoiceButton>
        ))}
      </ChoiceRow>
    </PuzzleRoot>
  );
}

/* ── Level 04 — Instructions ────────────────────────────────────────── */

export function Level04({ onActivate, succeed, fail }: L) {
  const activate = useActivate(onActivate);
  return (
    <PuzzleRoot>
      <Prompt>Do NOT press THIS BUTTON.</Prompt>
      <ChoiceRow>
        <ChoiceButton
          onClick={() => {
            activate();
            fail();
          }}
        >
          THIS BUTTON
        </ChoiceButton>
        <ChoiceButton
          onClick={() => {
            activate();
            succeed();
          }}
        >
          OTHER BUTTON
        </ChoiceButton>
      </ChoiceRow>
    </PuzzleRoot>
  );
}

/* ── Level 05 — Wait ────────────────────────────────────────────────── */

export function Level05({ seed, onActivate, succeed, fail, reducedMotion }: L) {
  const activate = useActivate(onActivate);
  const delay = useMemo(
    () => pickInt(randomFor(seed, 5, "delay"), 3000, 6000),
    [seed]
  );
  const [ready, setReady] = useState(false);
  const [settled, setSettled] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setReady(true), reducedMotion ? delay / 2 : delay);
    return () => clearTimeout(t);
  }, [delay, reducedMotion]);

  return (
    <PuzzleRoot>
      <Prompt>Please wait.</Prompt>
      <ChoiceButton
        className={settled && !ready ? "opacity-90 tracking-wide" : undefined}
        onClick={() => {
          activate();
          if (ready) succeed();
          else {
            setSettled(true);
            fail();
          }
        }}
      >
        {ready ? "NOW" : "CONTINUE"}
      </ChoiceButton>
    </PuzzleRoot>
  );
}

/* ── Level 06 — Not a circle ────────────────────────────────────────── */

export function Level06({ onActivate, succeed, fail }: L) {
  const activate = useActivate(onActivate);
  return (
    <PuzzleRoot>
      <Prompt>
        Which one isn&apos;t a circle
        <PromptWord
          onClick={() => {
            activate();
            succeed();
          }}
        >
          ?
        </PromptWord>
      </Prompt>
      <ChoiceRow>
        {[0, 1, 2, 3].map((i) => (
          <button
            key={i}
            type="button"
            aria-label="Circle"
            onClick={() => {
              activate();
              fail();
            }}
            className="flex h-11 w-11 min-h-11 min-w-11 items-center justify-center rounded-full border border-border bg-card"
          >
            <span className="block h-8 w-8 rounded-full border border-foreground" />
          </button>
        ))}
      </ChoiceRow>
    </PuzzleRoot>
  );
}

/* ── Level 07 — Make green ──────────────────────────────────────────── */

export function Level07({ onActivate, succeed, fail }: L) {
  const activate = useActivate(onActivate);
  const greenRef = useRef<HTMLSpanElement>(null);
  const [colored, setColored] = useState(false);

  return (
    <PuzzleRoot>
      <Prompt>
        Make the word{" "}
        <span
          ref={greenRef}
          style={{ color: colored ? "#16a34a" : undefined }}
          className="font-semibold"
        >
          GREEN
        </span>{" "}
        green.
      </Prompt>
      <DraggableWord
        onDrop={(pos) => {
          activate();
          if (hitTest(pos.x, pos.y, greenRef.current)) {
            setColored(true);
            succeed();
          } else fail();
        }}
      >
        <span
          className="inline-block h-8 w-8 rounded-sm"
          style={{ backgroundColor: "#16a34a" }}
          aria-hidden
        />
      </DraggableWord>
    </PuzzleRoot>
  );
}

/* ── Level 08 — Eight (progress) ────────────────────────────────────── */

export function Level08({ onActivate, succeed, fail, onProgressLevelClick }: L) {
  const activate = useActivate(onActivate);
  useProgressClickEnable(onProgressLevelClick);

  const decoys = [8, 8, 8, 18];

  return (
    <PuzzleRoot>
      <Prompt>Click 8.</Prompt>
      <ChoiceRow>
        {decoys.map((n, i) => (
          <ChoiceButton
            key={i}
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

/* ── Level 09 — Somewhere + secret #1 ─────────────────────────────────── */

export function Level09({
  seed,
  onActivate,
  succeed,
  fail,
  collectSecret,
}: L) {
  const activate = useActivate(onActivate);
  const pos = useMemo(() => {
    const rng = randomFor(seed, 9, "target");
    return {
      top: `${pickInt(rng, 15, 75)}%`,
      left: `${pickInt(rng, 15, 75)}%`,
    };
  }, [seed]);
  const targetRef = useRef<HTMLButtonElement>(null);
  const [hover, setHover] = useState(false);

  return (
    <PuzzleRoot className="min-h-[14rem]">
      <Prompt>It&apos;s somewhere.</Prompt>
      <SecretMG
        style={{ top: "8%", right: "12%" }}
        onCollect={() => {
          activate();
          collectSecret(1);
        }}
      />
      <button
        ref={targetRef}
        type="button"
        aria-label="Hidden target"
        style={pos}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        onClick={() => {
          activate();
          succeed();
        }}
        className="absolute h-3 w-3 min-h-[44px] min-w-[44px] rounded-full border border-border/30 bg-transparent opacity-30 transition-opacity hover:opacity-70 focus-visible:opacity-80"
      />
      <span
        aria-hidden
        style={{ ...pos, opacity: hover ? 0.5 : 0.15 }}
        className="pointer-events-none absolute h-2 w-2 rounded-full bg-foreground"
      />
    </PuzzleRoot>
  );
}

/* ── Level 10 — Free life ───────────────────────────────────────────── */

export function Level10({ onActivate, succeed, grantLife }: L) {
  const activate = useActivate(onActivate);
  return (
    <PuzzleRoot>
      <Prompt>You&apos;ve earned this.</Prompt>
      <ChoiceButton
        onClick={() => {
          activate();
          grantLife?.();
          succeed();
        }}
        className="text-base"
      >
        ♥ +1
      </ChoiceButton>
    </PuzzleRoot>
  );
}

/* ── Level 11 — Letters in word ───────────────────────────────────────── */

export function Level11({ seed, onActivate, succeed, fail }: L) {
  const activate = useActivate(onActivate);
  const { word, correct, options } = useMemo(() => {
    const rng = randomFor(seed, 11, "word");
    const word = pickOne(rng, WORDS);
    const correct = word.length;
    const opts = new Set([correct]);
    while (opts.size < 4) opts.add(correct + pickInt(rng, -3, 3));
    return {
      word,
      correct,
      options: shuffle(rng, Array.from(opts)),
    };
  }, [seed]);

  return (
    <PuzzleRoot>
      <Prompt>
        How many letters are in {word}?
      </Prompt>
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

/* ── Level 12 — Letters in this question ────────────────────────────── */

export function Level12({ seed, onActivate, succeed, fail }: L) {
  const activate = useActivate(onActivate);
  const sentence = "How many letters are in this question?";
  const correct = countLetters(sentence);
  const options = useMemo(() => {
    const rng = randomFor(seed, 12, "opts");
    const opts = new Set([correct]);
    while (opts.size < 4) opts.add(correct + pickInt(rng, -2, 2));
    return shuffle(rng, Array.from(opts));
  }, [seed, correct]);

  return (
    <PuzzleRoot>
      <Prompt>{sentence}</Prompt>
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

/* ── Level 13 — Odd one out ─────────────────────────────────────────── */

export function Level13({ seed, onActivate, succeed, fail }: L) {
  const activate = useActivate(onActivate);
  const evens = useMemo(() => {
    const rng = randomFor(seed, 13, "evens");
    const set = new Set<number>();
    while (set.size < 4) set.add(pickInt(rng, 2, 98) & ~1 || 2);
    return Array.from(set);
  }, [seed]);

  return (
    <PuzzleRoot>
      <Prompt>
        Click the{" "}
        <PromptWord
          onClick={() => {
            activate();
            succeed();
          }}
        >
          odd
        </PromptWord>{" "}
        one out.
      </Prompt>
      <ChoiceRow>
        {evens.map((n) => (
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

/* ── Level 14 — Red maze ──────────────────────────────────────────────── */

export function Level14({ seed, onActivate, succeed, fail }: L) {
  const activate = useActivate(onActivate);
  const maze = useMemo(
    () => MAZE_LAYOUTS[pickInt(randomFor(seed, 14, "maze"), 0, MAZE_LAYOUTS.length - 1)]!,
    [seed]
  );
  const containerRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ row: 1, col: 1 });
  const lastClient = useRef<{ x: number; y: number } | null>(null);
  const pathLen = useRef(0);
  const cell = 40;
  const done = useRef(false);

  const finishCell = useMemo(() => {
    const cols = maze[0]?.length ?? 1;
    const finish = maze.flat().lastIndexOf(0);
    return { row: Math.floor(finish / cols), col: finish % cols };
  }, [maze]);

  const onMove = useCallback(
    (clientPos: { x: number; y: number }) => {
      if (done.current) return;
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
        pathLen.current += Math.hypot(
          clientPos.x - lastClient.current.x,
          clientPos.y - lastClient.current.y
        );
      }
      lastClient.current = clientPos;
      const { row, col } = clientToCell(clientPos.x, clientPos.y, rect, cell);
      if (maze[row]?.[col] === 0) setPos({ row, col });
    },
    [activate, fail, maze]
  );

  const onRelease = useCallback(
    (clientPos: { x: number; y: number }) => {
      if (done.current) return;
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
      if (row === finishCell.row && col === finishCell.col) {
        if (pathLen.current < cell * 1.5) {
          done.current = true;
          fail();
          return;
        }
        done.current = true;
        succeed();
      }
    },
    [activate, fail, succeed, maze, finishCell]
  );

  return (
    <PuzzleRoot>
      <Prompt>Reach FINISH without touching red.</Prompt>
      <div
        ref={containerRef}
        className="relative border border-border"
        style={{ width: (maze[0]?.length ?? 5) * cell, height: maze.length * cell }}
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
        <span
          className="pointer-events-none absolute text-2xs text-muted-foreground"
          style={{ left: cell + 4, top: 4 }}
        >
          START
        </span>
        <span
          className="pointer-events-none absolute text-2xs text-muted-foreground"
          style={{
            left: finishCell.col * cell + 4,
            top: finishCell.row * cell + 4,
          }}
        >
          FINISH
        </span>
      </div>
    </PuzzleRoot>
  );
}

/* ── Level 15 — Red maze II (drag finish) ─────────────────────────────── */

export function Level15({ onActivate, succeed, fail }: L) {
  const activate = useActivate(onActivate);
  const startRef = useRef<HTMLDivElement>(null);
  const cell = 44;
  const cols = 5;
  const rows = 5;
  // Solid red barrier column blocks any path from START (left) to FINISH (right)
  const isWall = (r: number, c: number) =>
    r === 0 || r === rows - 1 || c === 0 || c === cols - 1;
  const isBarrier = (r: number, c: number) => c === 2 && r > 0 && r < rows - 1;

  return (
    <PuzzleRoot>
      <Prompt>Reach FINISH without touching red.</Prompt>
      <div
        className="relative border border-border-strong"
        style={{ width: cols * cell, height: rows * cell }}
      >
        {Array.from({ length: rows }, (_, r) =>
          Array.from({ length: cols }, (_, c) => {
            const wall = isWall(r, c);
            const barrier = isBarrier(r, c);
            return (
              <div
                key={`${r}-${c}`}
                className="absolute"
                style={{
                  left: c * cell,
                  top: r * cell,
                  width: cell,
                  height: cell,
                  backgroundColor: barrier
                    ? "#dc2626"
                    : wall
                      ? "hsl(var(--border))"
                      : "transparent",
                  border: "1px solid hsl(var(--border))",
                }}
              />
            );
          })
        )}
        <div
          ref={startRef}
          className="absolute z-10 text-2xs font-medium text-foreground"
          style={{ left: cell + 6, top: cell * 2 + 14 }}
        >
          START
        </div>
        <DraggableWord
          onDrop={(pos) => {
            activate();
            if (hitTest(pos.x, pos.y, startRef.current, 28)) succeed();
            else fail();
          }}
        >
          <div
            className="absolute z-10 text-2xs font-medium text-foreground"
            style={{
              left: cell * 3 + 4,
              top: cell * 2 + 14,
            }}
          >
            FINISH
          </div>
        </DraggableWord>
      </div>
    </PuzzleRoot>
  );
}

/* ── Level 16 — Opposite day ────────────────────────────────────────── */

export function Level16({ onActivate, succeed, fail, updateMemory }: L) {
  const activate = useActivate(onActivate);
  return (
    <PuzzleRoot>
      <p className="text-2xs uppercase tracking-label text-muted-foreground">
        Opposite day
      </p>
      <Prompt>Click YES.</Prompt>
      <ChoiceRow>
        <ChoiceButton
          onClick={() => {
            activate();
            updateMemory({ level16Answer: "YES" });
            fail();
          }}
        >
          YES
        </ChoiceButton>
        <ChoiceButton
          onClick={() => {
            activate();
            updateMemory({ level16Answer: "NO" });
            succeed();
          }}
        >
          NO
        </ChoiceButton>
      </ChoiceRow>
    </PuzzleRoot>
  );
}

/* ── Level 17 — Again ─────────────────────────────────────────────────── */

export function Level17({ memory, onActivate, succeed, fail }: L) {
  const activate = useActivate(onActivate);
  const prev = memory.level16Answer ?? "NO";
  const correct = prev === "YES" ? "NO" : "YES";

  return (
    <PuzzleRoot>
      <Prompt>Do the opposite of what you did last time.</Prompt>
      <ChoiceRow>
        {(["YES", "NO"] as const).map((opt) => (
          <ChoiceButton
            key={opt}
            onClick={() => {
              activate();
              if (opt === correct) succeed();
              else fail();
            }}
          >
            {opt}
          </ChoiceButton>
        ))}
      </ChoiceRow>
    </PuzzleRoot>
  );
}

/* ── Level 18 — Backwards ─────────────────────────────────────────────── */

export function Level18({ seed, onActivate, succeed, fail }: L) {
  const activate = useActivate(onActivate);
  const { word, correct, options } = useMemo(() => {
    const rng = randomFor(seed, 18, "word");
    const word = pickOne(rng, WORDS);
    const correct = reverseWord(word);
    const opts = new Set([correct]);
    while (opts.size < 4) {
      const w = pickOne(rng, WORDS);
      opts.add(reverseWord(w));
    }
    return { word, correct, options: shuffle(rng, Array.from(opts)) };
  }, [seed]);

  return (
    <PuzzleRoot>
      <Prompt>Click {word} backwards.</Prompt>
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

/* ── Level 19 — Backwards II (progress) ───────────────────────────────── */

export function Level19({ onActivate, fail, onProgressLevelClick }: L) {
  const activate = useActivate(onActivate);
  useProgressClickEnable(onProgressLevelClick);

  return (
    <PuzzleRoot>
      <Prompt>
        <span className="inline-block scale-x-[-1]">
          Click the level number
        </span>
      </Prompt>
      <ChoiceRow>
        {[19, 91, 61].map((n) => (
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

/* ── Level 20 — Save (progress) ─────────────────────────────────────── */

export function Level20({ onActivate, succeed, fail, onProgressLevelClick }: L) {
  const activate = useActivate(onActivate);
  useProgressClickEnable(onProgressLevelClick);

  return (
    <PuzzleRoot>
      <Prompt>Save your progress.</Prompt>
      <ChoiceButton
        className="px-8 py-4 text-lg"
        onClick={() => {
          activate();
          fail("That saves nothing.");
        }}
      >
        SAVE
      </ChoiceButton>
    </PuzzleRoot>
  );
}

/* ── Level 21 — Door ──────────────────────────────────────────────────── */

export function Level21({ onActivate, succeed, updateMemory }: L) {
  const activate = useActivate(onActivate);
  const doors = ["A", "B", "C", "D"] as const;
  const [picked, setPicked] = useState(false);

  useBoySuccessGate(succeed, picked);

  return (
    <PuzzleRoot>
      <Prompt>Pick one.</Prompt>
      <ChoiceRow>
        {doors.map((d) => (
          <ChoiceButton
            key={d}
            disabled={picked}
            onClick={() => {
              if (picked) return;
              activate();
              updateMemory({ chosenDoor: d });
              setPicked(true);
            }}
          >
            {d}
          </ChoiceButton>
        ))}
      </ChoiceRow>
      <BoyCameo
        edge="bottom-right"
        pose="point"
        say="Important stuff, pal. Remember this or you'll be locked out."
        bubbleSide="left"
        persist
      />
    </PuzzleRoot>
  );
}

/* ── Level 22 — Color ─────────────────────────────────────────────────── */

export function Level22({ onActivate, succeed, updateMemory }: L) {
  const activate = useActivate(onActivate);
  return (
    <PuzzleRoot>
      <Prompt>Pick a color.</Prompt>
      <ChoiceRow>
        {COLORS.map((c) => (
          <ChoiceButton
            key={c.id}
            style={{ color: c.hex, borderColor: c.hex }}
            onClick={() => {
              activate();
              updateMemory({ chosenColor: c.label });
              succeed();
            }}
          >
            {c.label}
          </ChoiceButton>
        ))}
      </ChoiceRow>
    </PuzzleRoot>
  );
}

/* ── Level 23 — Number ────────────────────────────────────────────────── */

export function Level23({ seed, onActivate, succeed, updateMemory }: L) {
  const activate = useActivate(onActivate);
  const nums = useMemo(() => {
    const rng = randomFor(seed, 23, "nums");
    const set = new Set<number>();
    while (set.size < 4) set.add(pickInt(rng, 1, 9));
    return shuffle(rng, Array.from(set));
  }, [seed]);
  const [picked, setPicked] = useState(false);

  useBoySuccessGate(succeed, picked);

  return (
    <PuzzleRoot>
      <Prompt>Pick a number.</Prompt>
      <ChoiceRow>
        {nums.map((n) => (
          <ChoiceButton
            key={n}
            disabled={picked}
            onClick={() => {
              if (picked) return;
              activate();
              updateMemory({ chosenNumber: n });
              setPicked(true);
            }}
          >
            {n}
          </ChoiceButton>
        ))}
      </ChoiceRow>
      <BoyCameo
        edge="bottom-left"
        pose="point"
        say="Remember that number. You'll need it later."
        bubbleSide="right"
        persist
      />
    </PuzzleRoot>
  );
}

/* ── Level 24 — Door again ────────────────────────────────────────────── */

export function Level24({ memory, onActivate, succeed, fail }: L) {
  const activate = useActivate(onActivate);
  const chosen = memory.chosenDoor ?? "A";
  const options = ["A", "B", "C", "D"] as const;

  return (
    <PuzzleRoot>
      <Prompt>Which door did you choose?</Prompt>
      <ChoiceRow>
        {options.map((d) => (
          <ChoiceButton
            key={d}
            onClick={() => {
              activate();
              d === chosen ? succeed() : fail();
            }}
          >
            {d}
          </ChoiceButton>
        ))}
      </ChoiceRow>
    </PuzzleRoot>
  );
}

/* ── Level 25 — Green word cycle ──────────────────────────────────────── */
/* Correct = literal text is GREEN (ink may mismatch). Hold each frame long
   enough to read + click; dwell longer on GREEN so it is not a flash. */

export function Level25({ seed, onActivate, succeed, fail, reducedMotion }: L) {
  const activate = useActivate(onActivate);
  const words = useMemo(() => {
    const rng = randomFor(seed, 25, "cycle");
    const labels = ["RED", "BLUE", "GREY", "GREEN"] as const;
    // Curated cycle: every 4th frame is GREEN text. Ink usually mismatches,
    // but at least one GREEN frame uses green ink so the color system is visible.
    const frames: { text: string; color: string }[] = [];
    let greenInkUsed = false;
    for (let i = 0; i < 12; i++) {
      const text = labels[i % labels.length]!;
      if (text === "GREEN") {
        if (!greenInkUsed) {
          frames.push({ text, color: COLORS.find((c) => c.label === "GREEN")!.hex });
          greenInkUsed = true;
        } else {
          const others = COLORS.filter((c) => c.label !== "GREEN");
          frames.push({
            text,
            color: others[pickInt(rng, 0, others.length - 1)]!.hex,
          });
        }
      } else {
        // Prefer mismatching ink for non-GREEN labels.
        const others = COLORS.filter((c) => c.label !== text);
        frames.push({
          text,
          color: others[pickInt(rng, 0, others.length - 1)]!.hex,
        });
      }
    }
    return frames;
  }, [seed]);

  const [idx, setIdx] = useState(0);
  const dwellMs = reducedMotion ? 2600 : 1800;
  const greenDwellMs = reducedMotion ? 3600 : 2800;

  useEffect(() => {
    const current = words[idx]!;
    const ms = current.text === "GREEN" ? greenDwellMs : dwellMs;
    const t = setTimeout(() => setIdx((i) => (i + 1) % words.length), ms);
    return () => clearTimeout(t);
  }, [idx, words, dwellMs, greenDwellMs]);

  const current = words[idx]!;

  return (
    <PuzzleRoot>
      <Prompt>Click when the word says GREEN.</Prompt>
      <button
        type="button"
        style={{ color: current.color }}
        onClick={() => {
          activate();
          current.text === "GREEN" ? succeed() : fail();
        }}
        className="min-h-12 min-w-[7rem] rounded-md border border-border bg-card px-6 py-3 text-lg font-semibold tracking-wide transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border"
        aria-label={current.text}
      >
        {current.text}
      </button>
    </PuzzleRoot>
  );
}
