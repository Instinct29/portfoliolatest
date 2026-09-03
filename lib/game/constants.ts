export const GAME_SCHEMA_VERSION = 2;
export const TOTAL_LEVELS = 100;
/** Soft cap for any residual UI; lives no longer drive progression. */
export const INITIAL_LIVES = 0;
export const MAX_LIVES = 0;
export const MAX_HINTS_PER_RUN = 1;
/** Skips removed from beta product; keep 0 so USE_SKIP is inert. */
export const MAX_SKIPS_PER_RUN = 0;
export const ABANDON_RANKED_HOURS = 24;

/** @deprecated Checkpoints retired in beta progression. */
export const CHECKPOINTS = [] as const;

/** Invisible per-level chances before a fail rolls the run back. Never shown/scored. */
export const MAX_LEVEL_FAILURES_BEFORE_ROLLBACK = 3;

/** Copy for failure #1 and #2 at a level: same-level retry, no rollback. */
export const RETRY_FAILURE_MESSAGES = ["NOPE.", "NOPE."] as const;
/** Copy for failure #3: the beat that precedes the BACK 5 rollback. */
export const ROLLBACK_FAILURE_MESSAGE = "THAT'S THREE.";
export const BACK_FIVE_MESSAGE = "BACK 5.";
/** Copy shown briefly after a successful level. */
export const SUCCESS_MESSAGES = ["CORRECT.", "NICE."] as const;

/** How long each feedback beat holds before the next transition fires. */
export const LEVEL_FAIL_RETRY_MS = 1050;
export const LEVEL_FAIL_ROLLBACK_MS = 1400;
export const LEVEL_SUCCESS_HOLD_MS = 900;
export const LEVEL_ENTER_MS = 220;

/** L70's "do nothing" wait. */
export const LEVEL_70_WAIT_MS = 7000;
/** L98's memory-path grid dimension. */
export const GRID_SIZE_98 = 9;

/** @deprecated superseded by RETRY_FAILURE_MESSAGES / ROLLBACK_FAILURE_MESSAGE. */
export const FAILURE_MESSAGES = [
  "Nope.",
  "Back five.",
  "See you five levels ago.",
  "Hope you remember those.",
  "That cost you five.",
] as const;

/** Personal-best / completed-run only. Unfinished runs are not durable. */
export const STORAGE_KEY_BEST = "mg-definitely-possible-best-v2";
/** Legacy unfinished-run key — cleared on load, never restored. */
export const STORAGE_KEY_RUN_LEGACY = "mg-definitely-possible-run-v1";

export const SECRET_IDS = [1, 2, 3, 4, 5, 6, 7] as const;

export const BETA_LABEL = "BETA";
