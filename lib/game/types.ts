import type { ComponentType } from "react";

export type RunMode =
  | "pending"
  | "ranked"
  | "local"
  | "assisted"
  | "debug"
  | "completed";

export type SafeRule = "RED" | "GREEN" | "BLUE" | "NONE";

export type RunMemory = {
  chosenDoor?: "A" | "B" | "C" | "D";
  chosenColor?: string;
  chosenNumber?: number;
  forgottenPhrase?: string;
  forgottenAdjective?: string;
  forgottenNoun?: string;
  forgottenNumber?: number;
  sequence51?: string[];
  sequence53?: string[];
  animal56?: string;
  animalNumber56?: number;
  /** Legacy; cleared on rollback before L50. Not used for scoring. */
  livesAt50?: number;
  flashedSymbol41?: string;
  currentSafeRule?: SafeRule;
  level16Answer?: "YES" | "NO";
  level45First?: "YES" | "NO";
};

export type RunStats = {
  hintsUsed: number;
  skipsUsed: number;
  levelAttempts: Record<number, number>;
  /** Display-only fail count for paranoia flavour; not a HUD metric. */
  failCount: number;
};

export type GameRun = {
  schemaVersion: number;
  runId: string;
  seed: string;
  startedAt: number | null;
  serverStartedAt: number | null;
  level: number;
  hintsUsed: number;
  skipsUsed: number;
  /** Cumulative fail events this session (for paranoia copy only). */
  failCount: number;
  secrets: number[];
  memory: RunMemory;
  runMode: RunMode;
  ranked: boolean;
  completed: boolean;
  completedAt: number | null;
  level1Complete: boolean;
  levelAttempts: Record<number, number>;
  submitted: boolean;
  activePlayMs?: number;
  scoringVersion?: number;
};

export type LevelProps = {
  seed: string;
  memory: RunMemory;
  stats: RunStats;
  level: number;
  /** Always 0 in beta; kept so level components type-check. */
  lives: number;
  reducedMotion: boolean;
  variant?: "teaser" | "full";
  interactive?: boolean;
  onActivate: () => void;
  succeed: (payload?: unknown) => void;
  fail: (reason?: string) => void;
  updateMemory: (payload: Partial<RunMemory>) => void;
  collectSecret: (id: number) => void;
  onProgressLevelClick?: () => void;
  onProgressHundredClick?: () => void;
  /**
   * For a level with internal sub-rounds (L96's exam): register a local
   * success handler so a header level-number click (armed via
   * onProgressLevelClick) resolves the active sub-round instead of the
   * whole outer level. Pass null to release it (e.g. on round change).
   */
  registerProgressLevelSuccess?: (fn: (() => void) | null) => void;
  grantLife?: () => void;
};

export type LevelModule = {
  default: ComponentType<LevelProps>;
};

export type LeaderboardEntry = {
  rank: number;
  displayName: string;
  elapsedSeconds: number;
  secretsFound: number;
  completedAt: string;
  /** Optional fun display; ranking is by time. */
  score?: number;
};

export type PersonalBest = {
  bestTimeSeconds: number;
  secretsFound: number;
  completedRuns: number;
  score?: number;
};
