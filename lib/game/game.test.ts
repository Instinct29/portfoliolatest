import { describe, expect, it } from "vitest";
import { calculateScore } from "./scoring";
import { hashString, randomFor, pickInt } from "./random";
import {
  level97TruthTable,
  level58Answer,
  isRankedEligible,
  reverseSequence,
} from "./logic";
import {
  createFreshRun,
  mergePersonalBest,
  loadPersonalBest,
} from "./persistence";
import {
  memoryAfterRollback,
  rollbackLevel,
  FAIL_ROLLBACK_LEVELS,
} from "./memoryOwnership";
import { computeNextLevel } from "./leaderboard/store";
import {
  gameReducer,
  initialGameState,
  type GameState,
} from "./runReducer";
import {
  LEVEL_COUNT,
  LEVEL_IDS,
  validateLevelRegistry,
  assertAllLevelExportsPresent,
} from "./levels/registry";
import { normalizeDisplayName, validateDisplayName } from "./validation";
import { LEVEL62_AGGRESSIVE_MS } from "./levels/levels-51-75";
import {
  generateMemoryPath,
  startCell,
  endCell,
} from "./levels/memoryPath";
import { GRID_SIZE_98 } from "./constants";

function reduce(
  state: GameState,
  ...actions: Parameters<typeof gameReducer>[1][]
) {
  return actions.reduce(gameReducer, state);
}

describe("scoring v3 time-based", () => {
  it("clamps at zero for absurd times", () => {
    expect(calculateScore({ elapsedSeconds: 999_999 })).toBe(0);
  });

  it("rewards secrets without dominating time", () => {
    const base = calculateScore({ elapsedSeconds: 600, secretsFound: 0 });
    const withSecrets = calculateScore({
      elapsedSeconds: 600,
      secretsFound: 7,
    });
    expect(withSecrets).toBeGreaterThan(base);
  });
});

describe("fail rollback", () => {
  it.each([
    [1, 1],
    [3, 1],
    [5, 1],
    [6, 1],
    [10, 5],
    [39, 34],
    [67, 62],
    [99, 94],
  ])("fail L%i -> L%i", (from, to) => {
    expect(rollbackLevel(from)).toBe(to);
    expect(computeNextLevel(from, "failure")).toBe(to);
  });

  it("uses FAIL_ROLLBACK_LEVELS = 5", () => {
    expect(FAIL_ROLLBACK_LEVELS).toBe(5);
  });

  it("success increments one level", () => {
    expect(computeNextLevel(12, "success")).toBe(13);
    expect(computeNextLevel(100, "success")).toBe(100);
  });
});

describe("memory rollback", () => {
  it("clears chosenDoor when rolling before L21", () => {
    const mem = memoryAfterRollback(
      { chosenDoor: "B", chosenColor: "RED", chosenNumber: 7 },
      16
    );
    expect(mem.chosenDoor).toBeUndefined();
    expect(mem.chosenColor).toBeUndefined();
    expect(mem.chosenNumber).toBeUndefined();
  });

  it("keeps chosenDoor when rolling to L22", () => {
    const mem = memoryAfterRollback(
      { chosenDoor: "B", chosenColor: "RED", chosenNumber: 7 },
      22
    );
    expect(mem.chosenDoor).toBe("B");
    expect(mem.chosenColor).toBeUndefined();
    expect(mem.chosenNumber).toBeUndefined();
  });

  it("clears L41 symbol when rolling to L40", () => {
    const mem = memoryAfterRollback({ flashedSymbol41: "★" }, 40);
    expect(mem.flashedSymbol41).toBeUndefined();
  });
});

describe("reducer beta progression — 3 invisible chances", () => {
  it("fail #1 and #2 at L10 retry the same level, fail #3 jumps to L5", () => {
    let s = initialGameState(createFreshRun());
    s = reduce(s, { type: "ACTIVATE", mode: "local" });
    s = { ...s, run: { ...s.run, level: 10 }, phase: "active" };

    s = gameReducer(s, { type: "FAIL" });
    expect(s.phase).toBe("resolving-fail");
    expect(s.pendingFailKind).toBe("retry");
    expect(s.pendingRollback).toBe(10);
    expect(s.levelFailCount).toBe(1);
    s = gameReducer(s, { type: "FAIL_TRANSITION_DONE" });
    expect(s.run.level).toBe(10);
    expect(s.levelFailCount).toBe(1);
    expect(s.phase).toBe("entering");

    s = { ...s, phase: "active" };
    s = gameReducer(s, { type: "FAIL" });
    expect(s.pendingFailKind).toBe("retry");
    expect(s.levelFailCount).toBe(2);
    s = gameReducer(s, { type: "FAIL_TRANSITION_DONE" });
    expect(s.run.level).toBe(10);
    expect(s.levelFailCount).toBe(2);

    s = { ...s, phase: "active" };
    s = gameReducer(s, { type: "FAIL" });
    expect(s.pendingFailKind).toBe("rollback");
    expect(s.pendingRollback).toBe(5);
    expect(s.levelFailCount).toBe(0);
    expect(s.run.failCount).toBe(3);
    s = gameReducer(s, { type: "FAIL_TRANSITION_DONE" });
    expect(s.run.level).toBe(5);
    expect(s.levelFailCount).toBe(0);
    expect(s.phase).toBe("entering");
  });

  it("success after one failure resets the count; first fail on the next level is fresh", () => {
    let s = initialGameState(createFreshRun());
    s = reduce(s, { type: "ACTIVATE", mode: "local" });
    s = { ...s, run: { ...s.run, level: 10 }, phase: "active" };
    s = gameReducer(s, { type: "FAIL" });
    s = gameReducer(s, { type: "FAIL_TRANSITION_DONE" });
    expect(s.levelFailCount).toBe(1);

    s = { ...s, phase: "active" };
    s = gameReducer(s, { type: "SUCCEED" });
    expect(s.run.level).toBe(11);
    expect(s.levelFailCount).toBe(0);

    s = { ...s, phase: "active" };
    s = gameReducer(s, { type: "FAIL" });
    expect(s.pendingFailKind).toBe("retry");
    expect(s.levelFailCount).toBe(1);
  });

  it("fail #3 at L3 goes to L1", () => {
    let s = initialGameState(createFreshRun());
    s = reduce(s, { type: "ACTIVATE", mode: "local" });
    s = { ...s, run: { ...s.run, level: 3 }, phase: "active" };
    for (let i = 0; i < 3; i++) {
      s = gameReducer(s, { type: "FAIL" });
      s = gameReducer(s, { type: "FAIL_TRANSITION_DONE" });
      s = { ...s, phase: "active" };
    }
    expect(s.run.level).toBe(1);
  });

  it("returning to a level after rollback gets a fresh 3 chances", () => {
    let s = initialGameState(createFreshRun());
    s = reduce(s, { type: "ACTIVATE", mode: "local" });
    s = { ...s, run: { ...s.run, level: 10 }, phase: "active" };
    for (let i = 0; i < 3; i++) {
      s = gameReducer(s, { type: "FAIL" });
      s = gameReducer(s, { type: "FAIL_TRANSITION_DONE" });
      s = { ...s, phase: "active" };
    }
    expect(s.run.level).toBe(5);
    expect(s.levelFailCount).toBe(0);
    s = gameReducer(s, { type: "FAIL" });
    expect(s.levelFailCount).toBe(1);
    expect(s.pendingFailKind).toBe("retry");
  });

  it("duplicate fail same frame is ignored while resolving", () => {
    let s = initialGameState(createFreshRun());
    s = reduce(s, { type: "ACTIVATE", mode: "local" });
    s = { ...s, run: { ...s.run, level: 20 }, phase: "active" };
    s = gameReducer(s, { type: "FAIL" });
    const again = gameReducer(s, { type: "FAIL" });
    expect(again.run.failCount).toBe(1);
    expect(again.levelFailCount).toBe(1);
  });

  it("a stale FAIL_TRANSITION_DONE from a previous attempt is inert once resolved", () => {
    let s = initialGameState(createFreshRun());
    s = reduce(s, { type: "ACTIVATE", mode: "local" });
    s = { ...s, run: { ...s.run, level: 20 }, phase: "active" };
    s = gameReducer(s, { type: "FAIL" });
    s = gameReducer(s, { type: "FAIL_TRANSITION_DONE" });
    const stale = gameReducer(s, { type: "FAIL_TRANSITION_DONE" });
    expect(stale).toBe(s);
  });

  it("success on L100 completes", () => {
    let s = initialGameState(createFreshRun());
    s = reduce(s, { type: "ACTIVATE", mode: "local" });
    s = { ...s, run: { ...s.run, level: 100 }, phase: "active" };
    s = gameReducer(s, { type: "SUCCEED" });
    expect(s.run.completed).toBe(true);
  });

  it("success increments once", () => {
    let s = initialGameState(createFreshRun());
    s = reduce(s, { type: "ACTIVATE", mode: "local" });
    s = { ...s, run: { ...s.run, level: 12 }, phase: "active" };
    s = gameReducer(s, { type: "SUCCEED" });
    expect(s.run.level).toBe(13);
    expect(s.phase).toBe("exiting");
  });

  it("displayedLevel lags run.level through the exit beat, then catches up on EXIT_TRANSITION_DONE", () => {
    let s = initialGameState(createFreshRun());
    s = reduce(s, { type: "ACTIVATE", mode: "local" });
    s = { ...s, run: { ...s.run, level: 12 }, displayedLevel: 12, phase: "active" };
    s = gameReducer(s, { type: "SUCCEED" });
    // run.level is already the new level — needed immediately for scoring/API —
    // but displayedLevel (what LevelRenderer actually mounts) has not moved yet.
    expect(s.run.level).toBe(13);
    expect(s.displayedLevel).toBe(12);
    expect(s.phase).toBe("exiting");
    s = gameReducer(s, { type: "EXIT_TRANSITION_DONE" });
    expect(s.displayedLevel).toBe(13);
    expect(s.phase).toBe("entering");
  });

  it("EXIT_TRANSITION_DONE is a no-op outside the exiting phase", () => {
    let s = initialGameState(createFreshRun());
    s = { ...s, run: { ...s.run, level: 5 }, displayedLevel: 5, phase: "active" };
    const again = gameReducer(s, { type: "EXIT_TRANSITION_DONE" });
    expect(again).toBe(s);
  });

  it("displayedLevel stays on the failed level through resolving-fail, catching up only on FAIL_TRANSITION_DONE", () => {
    let s = initialGameState(createFreshRun());
    s = reduce(s, { type: "ACTIVATE", mode: "local" });
    s = { ...s, run: { ...s.run, level: 10 }, displayedLevel: 10, phase: "active" };
    s = gameReducer(s, { type: "FAIL" });
    expect(s.run.level).toBe(10);
    expect(s.displayedLevel).toBe(10);
    s = gameReducer(s, { type: "FAIL_TRANSITION_DONE" });
    expect(s.displayedLevel).toBe(10);
    expect(s.phase).toBe("entering");
  });

  it("clears door memory on the rollback fail before L21", () => {
    let s = initialGameState(createFreshRun());
    s = reduce(
      s,
      { type: "ACTIVATE", mode: "local" },
      { type: "UPDATE_MEMORY", memory: { chosenDoor: "C" } }
    );
    s = { ...s, run: { ...s.run, level: 24 }, phase: "active" };
    for (let i = 0; i < 3; i++) {
      s = gameReducer(s, { type: "FAIL" });
      s = gameReducer(s, { type: "FAIL_TRANSITION_DONE" });
      s = { ...s, phase: "active" };
    }
    expect(s.run.memory.chosenDoor).toBeUndefined();
  });

  it("does not touch memory on a same-level retry fail", () => {
    let s = initialGameState(createFreshRun());
    s = reduce(
      s,
      { type: "ACTIVATE", mode: "local" },
      { type: "UPDATE_MEMORY", memory: { chosenDoor: "C" } }
    );
    s = { ...s, run: { ...s.run, level: 24 }, phase: "active" };
    s = gameReducer(s, { type: "FAIL" });
    expect(s.run.memory.chosenDoor).toBe("C");
  });

  it("keeps secrets across rollback", () => {
    let s = initialGameState(createFreshRun());
    s = reduce(
      s,
      { type: "ACTIVATE", mode: "local" },
      { type: "COLLECT_SECRET", id: 2 }
    );
    s = { ...s, run: { ...s.run, level: 40 }, phase: "active" };
    for (let i = 0; i < 3; i++) {
      s = gameReducer(s, { type: "FAIL" });
      s = gameReducer(s, { type: "FAIL_TRANSITION_DONE" });
      s = { ...s, phase: "active" };
    }
    expect(s.run.secrets).toEqual([2]);
    expect(s.run.level).toBe(35);
  });
});

describe("level 97 logic", () => {
  it("unique solution is D via exhaustive table", () => {
    expect(level97TruthTable()).toBe(true);
  });
});

describe("level 58", () => {
  it("adds chosen + animal", () => {
    expect(level58Answer(3, 74)).toBe(77);
  });
});

describe("level 53 -> 54 backwards sequence", () => {
  it("reverses [A,B,C,D] to [D,C,B,A] without mutating the original", () => {
    const stored = ["A", "B", "C", "D"];
    const reversed = reverseSequence(stored);
    expect(reversed).toEqual(["D", "C", "B", "A"]);
    expect(stored).toEqual(["A", "B", "C", "D"]);
  });

  it("accepts D,C,B,A entered in order against a stored [A,B,C,D] sequence", () => {
    const stored = ["A", "B", "C", "D"];
    const reversed = reverseSequence(stored);
    const clicks = ["D", "C", "B", "A"];
    let input: string[] = [];
    for (const click of clicks) {
      const next = [...input, click];
      const expected = reversed[next.length - 1];
      expect(click).toBe(expected);
      input = next;
    }
    expect(input).toEqual(reversed);
  });

  it("rejects a forward-order entry against the same stored sequence", () => {
    const reversed = reverseSequence(["A", "B", "C", "D"]);
    expect(reversed[0]).not.toBe("A");
  });
});

describe("ranked eligibility", () => {
  it("debug and assisted are unranked", () => {
    expect(
      isRankedEligible({
        ranked: true,
        hintsUsed: 0,
        skipsUsed: 0,
        runMode: "debug",
      })
    ).toBe(false);
    expect(
      isRankedEligible({
        ranked: true,
        hintsUsed: 1,
        skipsUsed: 0,
        runMode: "ranked",
      })
    ).toBe(false);
  });
});

describe("display name", () => {
  it("trims and caps length", () => {
    expect(normalizeDisplayName("  hello   world  ").length).toBeLessThanOrEqual(
      18
    );
    expect(validateDisplayName("").ok).toBe(false);
  });
});

describe("level registry", () => {
  it("covers all 100 level IDs", () => {
    expect(LEVEL_COUNT).toBe(100);
    expect(LEVEL_IDS).toHaveLength(100);
    expect(validateLevelRegistry().ok).toBe(true);
  });

  it("exports every level component in chunks", async () => {
    await assertAllLevelExportsPresent();
  });
});

describe("deterministic random", () => {
  it("stable for same seed", () => {
    const a = pickInt(randomFor("seed", 30, "noun"), 1, 100);
    const b = pickInt(randomFor("seed", 30, "noun"), 1, 100);
    expect(a).toBe(b);
  });
});

describe("hash", () => {
  it("stable", () => {
    expect(hashString("shashwa7")).toBe(hashString("shashwa7"));
  });
});

describe("playtest contracts", () => {
  it("L62 chase window is 4.5s", () => {
    expect(LEVEL62_AGGRESSIVE_MS).toBe(4500);
  });
});

describe("L98 memory path generator", () => {
  const seeds = Array.from({ length: 120 }, (_, i) => `seed-${i}`);

  it("starts and ends at the fixed START/END cells", () => {
    const start = startCell(GRID_SIZE_98);
    const end = endCell(GRID_SIZE_98);
    for (const seed of seeds) {
      const path = generateMemoryPath(seed, GRID_SIZE_98);
      expect(path[0]).toBe(start);
      expect(path[path.length - 1]).toBe(end);
    }
  });

  it("every cell is in range 0..80 and every step is orthogonally adjacent", () => {
    for (const seed of seeds) {
      const path = generateMemoryPath(seed, GRID_SIZE_98);
      for (const cell of path) {
        expect(cell).toBeGreaterThanOrEqual(0);
        expect(cell).toBeLessThan(GRID_SIZE_98 * GRID_SIZE_98);
      }
      for (let i = 1; i < path.length; i++) {
        const a = path[i - 1]!;
        const b = path[i]!;
        const rowA = Math.floor(a / GRID_SIZE_98);
        const colA = a % GRID_SIZE_98;
        const rowB = Math.floor(b / GRID_SIZE_98);
        const colB = b % GRID_SIZE_98;
        const manhattan = Math.abs(rowA - rowB) + Math.abs(colA - colB);
        expect(manhattan).toBe(1);
      }
    }
  });

  it("never repeats a cell", () => {
    for (const seed of seeds) {
      const path = generateMemoryPath(seed, GRID_SIZE_98);
      expect(new Set(path).size).toBe(path.length);
    }
  });

  it("has a reasonable length that winds through the grid", () => {
    for (const seed of seeds) {
      const path = generateMemoryPath(seed, GRID_SIZE_98);
      expect(path.length).toBeGreaterThanOrEqual(8);
      expect(path.length).toBeLessThanOrEqual(40);
    }
  });

  it("is deterministic for the same seed", () => {
    for (const seed of seeds.slice(0, 20)) {
      const a = generateMemoryPath(seed, GRID_SIZE_98);
      const b = generateMemoryPath(seed, GRID_SIZE_98);
      expect(a).toEqual(b);
    }
  });

  it("a different attempt index regenerates a different route", () => {
    const a = generateMemoryPath("run-seed:98:0", GRID_SIZE_98);
    const b = generateMemoryPath("run-seed:98:1", GRID_SIZE_98);
    expect(a).not.toEqual(b);
  });
});

describe("server progression", () => {
  it("rejects forward jumps and accepts legal transitions", async () => {
    const { MemoryLeaderboardStore } = await import("./leaderboard/store");
    const store = new MemoryLeaderboardStore();
    // Force configured for unit path by monkey-patching
    store.isConfigured = () => true;
    const { runId, seed } = await store.createRun("test-seed-abcdef");
    expect(seed).toBe("test-seed-abcdef");
    const ok = await store.applyProgress(runId, "success", 1);
    expect(ok).toEqual({ ok: true, level: 2 });
    const jump = await store.applyProgress(runId, "success", 50);
    expect(jump.ok).toBe(false);
    const fail = await store.applyProgress(runId, "failure", 2);
    expect(fail).toEqual({ ok: true, level: 1 });
  });
});

describe("fresh run", () => {
  it("starts at level 1 pending without lives fields", () => {
    const run = createFreshRun();
    expect(run.level).toBe(1);
    expect(run.runMode).toBe("pending");
    expect(run.failCount).toBe(0);
    expect("lives" in run).toBe(false);
  });
});
