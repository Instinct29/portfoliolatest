import { calculateScore } from "./scoring";
import { checkpointForLevel } from "./checkpoints";
import { TOTAL_LEVELS } from "./constants";

/**
 * Exactly one of four statements is true:
 * A: "B is true."   B: "C is true."   C: "D is false."   D: "A is false."
 *
 * Enumerates all 16 truth assignments. Consistency requires
 * A↔B, B↔C, C↔¬D, D↔¬A. Unique solution: only D is true.
 */
export function level97TruthTable(): boolean {
  const solutions: Array<{ A: boolean; B: boolean; C: boolean; D: boolean }> =
    [];

  for (let mask = 0; mask < 16; mask++) {
    const A = (mask & 1) !== 0;
    const B = (mask & 2) !== 0;
    const C = (mask & 4) !== 0;
    const D = (mask & 8) !== 0;

    const consistent =
      A === B && B === C && C === !D && D === !A;
    if (!consistent) continue;

    const trueCount = [A, B, C, D].filter(Boolean).length;
    if (trueCount === 1) {
      solutions.push({ A, B, C, D });
    }
  }

  return (
    solutions.length === 1 &&
    !solutions[0]!.A &&
    !solutions[0]!.B &&
    !solutions[0]!.C &&
    solutions[0]!.D
  );
}

export function level58Answer(chosen: number, animal: number): number {
  return chosen + animal;
}

/**
 * L54's "backwards" answer to L53's stored sequence. Immutable — never
 * mutates the stored sequence in place (Array.prototype.reverse() would),
 * since L53's memory value must stay usable by anything else that reads it.
 */
export function reverseSequence<T>(sequence: readonly T[]): T[] {
  return [...sequence].reverse();
}

export function isRankedEligible(run: {
  ranked: boolean;
  hintsUsed: number;
  skipsUsed: number;
  runMode: string;
  resumed?: boolean;
}): boolean {
  if (
    run.runMode === "debug" ||
    run.runMode === "assisted" ||
    run.runMode === "local"
  )
    return false;
  if (run.hintsUsed > 0 || run.skipsUsed > 0) return false;
  if (run.resumed) return false;
  return run.ranked;
}

export { calculateScore, checkpointForLevel, TOTAL_LEVELS };
