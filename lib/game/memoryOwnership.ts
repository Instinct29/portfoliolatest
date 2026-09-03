import type { RunMemory } from "./types";

/**
 * Which level creates each memory key. On fail→back-5, any key whose
 * origin level is >= rollback target is cleared so callbacks cannot use
 * a future timeline's answer.
 */
export const MEMORY_ORIGIN_LEVEL: Record<keyof RunMemory, number> = {
  chosenDoor: 21,
  chosenColor: 22,
  chosenNumber: 23,
  forgottenPhrase: 30,
  forgottenAdjective: 30,
  forgottenNoun: 30,
  forgottenNumber: 30,
  flashedSymbol41: 41,
  sequence51: 51,
  sequence53: 53,
  animal56: 56,
  animalNumber56: 56,
  livesAt50: 50,
  currentSafeRule: 80,
  level16Answer: 16,
  level45First: 45,
};

/** Fail sends the player back this many levels (clamped at 1). */
export const FAIL_ROLLBACK_LEVELS = 5;

export function rollbackLevel(current: number): number {
  return Math.max(1, current - FAIL_ROLLBACK_LEVELS);
}

/**
 * Keep secrets. Clear memories created at or after `targetLevel`.
 * Deterministic seed-driven values regenerate when those levels replay.
 */
export function memoryAfterRollback(
  memory: RunMemory,
  targetLevel: number
): RunMemory {
  const next: RunMemory = { ...memory };
  for (const key of Object.keys(MEMORY_ORIGIN_LEVEL) as (keyof RunMemory)[]) {
    const origin = MEMORY_ORIGIN_LEVEL[key];
    if (origin >= targetLevel) {
      delete next[key];
    }
  }
  return next;
}
