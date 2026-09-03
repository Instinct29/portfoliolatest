"use client";

import Link from "next/link";
import { TOTAL_LEVELS, BETA_LABEL } from "@/lib/game/constants";

export function GameProgress({
  level,
  onLevelClick,
  onHundredClick,
  hundredOnly,
  minimal,
}: {
  level: number;
  onLevelClick?: () => void;
  onHundredClick?: () => void;
  hundredOnly?: boolean;
  minimal?: boolean;
}) {
  if (minimal) return null;
  const current = String(level).padStart(2, "0");
  return (
    <div className="flex items-center gap-2 font-mono text-sm tabular-nums text-muted-foreground">
      <span>LEVEL</span>
      {hundredOnly ? (
        <span className="text-foreground">
          <span aria-hidden>{current}</span>
          <span aria-hidden> / </span>
          <button
            type="button"
            onClick={onHundredClick}
            aria-label="100"
            className="inline min-h-11 min-w-[2ch] bg-transparent p-0 font-mono text-sm tabular-nums text-foreground hover:no-underline focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-border"
            style={{ cursor: "inherit" }}
          >
            {TOTAL_LEVELS}
          </button>
        </span>
      ) : (
        <>
          <button
            type="button"
            onClick={onLevelClick}
            className="text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border"
            aria-label={`Level ${level}`}
            style={{ cursor: onLevelClick ? "pointer" : "inherit" }}
          >
            {current}
          </button>
          <span>/ {TOTAL_LEVELS}</span>
        </>
      )}
    </div>
  );
}

export function GameTimer({ elapsed }: { elapsed: string }) {
  return (
    <span className="font-mono text-sm tabular-nums text-muted-foreground">
      {elapsed}
    </span>
  );
}

export function GameHeader({
  level,
  elapsed,
  onExit,
  onLevelClick,
  onHundredClick,
  hundredOnly,
  minimal,
}: {
  level: number;
  /** @deprecated ignored in beta HUD */
  lives?: number;
  elapsed: string;
  onExit: () => void;
  onLevelClick?: () => void;
  onHundredClick?: () => void;
  hundredOnly?: boolean;
  minimal?: boolean;
}) {
  return (
    <header className="flex flex-col gap-4 border-b border-border pb-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-label text-muted-foreground">
          <span>MG / DEFINITELY POSSIBLE</span>
          <span className="rounded-sm border border-border px-1.5 py-0.5 text-2xs tracking-label text-muted-foreground">
            {BETA_LABEL}
          </span>
        </div>
        <Link
          href="/"
          onClick={onExit}
          className="text-xs font-medium uppercase tracking-label text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
        >
          EXIT
        </Link>
      </div>
      {!minimal && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <GameProgress
            level={level}
            onLevelClick={onLevelClick}
            onHundredClick={onHundredClick}
            hundredOnly={hundredOnly}
          />
          <GameTimer elapsed={elapsed} />
        </div>
      )}
    </header>
  );
}
