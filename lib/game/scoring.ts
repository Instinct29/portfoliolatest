/** Fun display score only. Leaderboard ranks by fastest time. */
export const SCORING_VERSION = 3;

export function calculateScore(input: {
  elapsedSeconds: number;
  secretsFound?: number;
}): number {
  const secretBonus = (input.secretsFound ?? 0) * 2_500;
  const raw = 1_000_000 - input.elapsedSeconds * 100 + secretBonus;
  return Math.max(0, Math.round(raw));
}

export function formatElapsed(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

/** Flavour meter from session fail count (not shown in HUD). */
export function paranoiaPercent(failCount: number): number {
  return Math.min(100, Math.round(failCount * 5 + 12));
}
