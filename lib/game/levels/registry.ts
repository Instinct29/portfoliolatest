import type { ComponentType } from "react";
import type { LevelProps } from "../types";
import { TOTAL_LEVELS } from "../constants";

type LevelComponent = ComponentType<LevelProps>;

const cache = new Map<number, LevelComponent>();

export const LEVEL_COUNT = TOTAL_LEVELS;
export const LEVEL_IDS = Array.from({ length: LEVEL_COUNT }, (_, i) => i + 1);

function levelExportName(n: number): string {
  return `Level${String(n).padStart(2, "0")}`;
}

async function importLevel(n: number): Promise<LevelComponent> {
  if (n >= 1 && n <= 25) {
    const mod = await import("./levels-01-25");
    const map: Record<number, LevelComponent> = {
      1: mod.Level01,
      2: mod.Level02,
      3: mod.Level03,
      4: mod.Level04,
      5: mod.Level05,
      6: mod.Level06,
      7: mod.Level07,
      8: mod.Level08,
      9: mod.Level09,
      10: mod.Level10,
      11: mod.Level11,
      12: mod.Level12,
      13: mod.Level13,
      14: mod.Level14,
      15: mod.Level15,
      16: mod.Level16,
      17: mod.Level17,
      18: mod.Level18,
      19: mod.Level19,
      20: mod.Level20,
      21: mod.Level21,
      22: mod.Level22,
      23: mod.Level23,
      24: mod.Level24,
      25: mod.Level25,
    };
    return map[n]!;
  }
  if (n >= 26 && n <= 50) {
    const mod = await import("./levels-26-50");
    const map: Record<number, LevelComponent> = {
      26: mod.Level26,
      27: mod.Level27,
      28: mod.Level28,
      29: mod.Level29,
      30: mod.Level30,
      31: mod.Level31,
      32: mod.Level32,
      33: mod.Level33,
      34: mod.Level34,
      35: mod.Level35,
      36: mod.Level36,
      37: mod.Level37,
      38: mod.Level38,
      39: mod.Level39,
      40: mod.Level40,
      41: mod.Level41,
      42: mod.Level42,
      43: mod.Level43,
      44: mod.Level44,
      45: mod.Level45,
      46: mod.Level46,
      47: mod.Level47,
      48: mod.Level48,
      49: mod.Level49,
      50: mod.Level50,
    };
    return map[n]!;
  }
  if (n >= 51 && n <= 75) {
    const mod = await import("./levels-51-75");
    const map: Record<number, LevelComponent> = {
      51: mod.Level51,
      52: mod.Level52,
      53: mod.Level53,
      54: mod.Level54,
      55: mod.Level55,
      56: mod.Level56,
      57: mod.Level57,
      58: mod.Level58,
      59: mod.Level59,
      60: mod.Level60,
      61: mod.Level61,
      62: mod.Level62,
      63: mod.Level63,
      64: mod.Level64,
      65: mod.Level65,
      66: mod.Level66,
      67: mod.Level67,
      68: mod.Level68,
      69: mod.Level69,
      70: mod.Level70,
      71: mod.Level71,
      72: mod.Level72,
      73: mod.Level73,
      74: mod.Level74,
      75: mod.Level75,
    };
    return map[n]!;
  }
  const mod = await import("./levels-76-100");
  const map: Record<number, LevelComponent> = {
    76: mod.Level76,
    77: mod.Level77,
    78: mod.Level78,
    79: mod.Level79,
    80: mod.Level80,
    81: mod.Level81,
    82: mod.Level82,
    83: mod.Level83,
    84: mod.Level84,
    85: mod.Level85,
    86: mod.Level86,
    87: mod.Level87,
    88: mod.Level88,
    89: mod.Level89,
    90: mod.Level90,
    91: mod.Level91,
    92: mod.Level92,
    93: mod.Level93,
    94: mod.Level94,
    95: mod.Level95,
    96: mod.Level96,
    97: mod.Level97,
    98: mod.Level98,
    99: mod.Level99,
    100: mod.Level100,
  };
  return map[n]!;
}

export function validateLevelRegistry(): { ok: boolean; missing?: number[] } {
  const missing: number[] = [];
  if (LEVEL_IDS.length !== LEVEL_COUNT) {
    return { ok: false, missing: LEVEL_IDS };
  }
  for (let i = 1; i <= LEVEL_COUNT; i++) {
    if (!LEVEL_IDS.includes(i)) missing.push(i);
  }
  return { ok: missing.length === 0, missing: missing.length ? missing : undefined };
}

export async function assertAllLevelExportsPresent(): Promise<void> {
  const chunks = [
    { importFn: () => import("./levels-01-25"), start: 1 },
    { importFn: () => import("./levels-26-50"), start: 26 },
    { importFn: () => import("./levels-51-75"), start: 51 },
    { importFn: () => import("./levels-76-100"), start: 76 },
  ] as const;

  for (const { importFn, start } of chunks) {
    const mod = await importFn();
    for (let i = 0; i < 25; i++) {
      const n = start + i;
      const key = levelExportName(n);
      if (!(key in mod) || typeof (mod as Record<string, unknown>)[key] !== "function") {
        throw new Error(`Missing export ${key} in level chunk starting at ${start}`);
      }
    }
  }
}

export async function getLevelComponent(level: number): Promise<LevelComponent> {
  if (level < 1 || level > LEVEL_COUNT) {
    throw new Error(`Invalid level ${level}`);
  }
  const cached = cache.get(level);
  if (cached) return cached;
  const comp = await importLevel(level);
  cache.set(level, comp);
  return comp;
}

/** @deprecated Use getLevelComponent */
export const loadLevelComponent = getLevelComponent;
