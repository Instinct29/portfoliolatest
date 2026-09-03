-- Definitely Possible — Beta leaderboard schema (Postgres)
-- Run once against DATABASE_URL or POSTGRES_URL
-- Ranking: fastest legitimate completion time.

CREATE TABLE IF NOT EXISTS game_runs (
  run_id TEXT PRIMARY KEY,
  seed TEXT NOT NULL,
  started_at BIGINT NOT NULL,
  completed_at BIGINT,
  level INTEGER NOT NULL DEFAULT 1,
  secrets_found INTEGER NOT NULL DEFAULT 0,
  hints_used INTEGER NOT NULL DEFAULT 0,
  skips_used INTEGER NOT NULL DEFAULT 0,
  ranked BOOLEAN NOT NULL DEFAULT true,
  submitted BOOLEAN NOT NULL DEFAULT false,
  client_sequence INTEGER NOT NULL DEFAULT 0,
  updated_at BIGINT
);

CREATE TABLE IF NOT EXISTS game_scores (
  id SERIAL PRIMARY KEY,
  run_id TEXT NOT NULL UNIQUE REFERENCES game_runs(run_id),
  display_name TEXT NOT NULL,
  elapsed_seconds INTEGER NOT NULL,
  secrets_found INTEGER NOT NULL DEFAULT 0,
  score INTEGER,
  ranked BOOLEAN NOT NULL DEFAULT true,
  completed_at BIGINT NOT NULL
);

CREATE INDEX IF NOT EXISTS game_scores_time_idx
  ON game_scores (elapsed_seconds ASC, secrets_found DESC, completed_at ASC)
  WHERE ranked = true;
