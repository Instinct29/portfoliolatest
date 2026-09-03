"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";
import Boy from "./Boy";
import type { BoyPose } from "./types";

/**
 * Secret post-completion toy, opened only from the FREEDOM button on the
 * final popup. Not a level: it never touches /api/game/*, the leaderboard,
 * completion time, or secrets. The boy cannot lose — a collision is a gag,
 * never a game-over.
 */

const GRAVITY = 2600;
const JUMP_VELOCITY = -780;
const RUN_SPEED_PX_S = 210;
const BOY_LEFT_PERCENT = 24;
const OBSTACLE_MIN_GAP_PX = 260;
const OBSTACLE_MAX_GAP_PX = 420;
const BONK_RECOVERY_MS = 480;
const MAX_DT_MS = 50;

const REACTIONS = ["Still here?", "Fine.", "Freedom!", "I can't die, apparently."];
const REACTION_COOLDOWN_MS = 4000;

type Obstacle = { id: number; x: number; width: number; height: number };

export default function FreedomRunner({ onClose }: { onClose: () => void }) {
  const reducedMotion = useReducedMotion() ?? false;
  const stageRef = useRef<HTMLDivElement>(null);

  const [boyY, setBoyY] = useState(0);
  const [pose, setPose] = useState<BoyPose>("run");
  const [obstacles, setObstacles] = useState<Obstacle[]>([]);
  const [jumps, setJumps] = useState(0);
  const [say, setSay] = useState<string | null>(null);

  const yRef = useRef(0);
  const vyRef = useRef(0);
  const groundedRef = useRef(true);
  const bonkUntilRef = useRef(0);
  const obstaclesRef = useRef<Obstacle[]>([]);
  const nextIdRef = useRef(0);
  const nextSpawnRef = useRef(320);
  const rafRef = useRef(0);
  const lastRef = useRef(0);
  const lastReactionRef = useRef(0);
  const sayTimerRef = useRef<ReturnType<typeof setTimeout>>();

  const doJump = useCallback(() => {
    if (!groundedRef.current) return;
    groundedRef.current = false;
    vyRef.current = JUMP_VELOCITY;
    setJumps((j) => j + 1);
    setPose("jump");
  }, []);

  const bonk = useCallback(() => {
    setPose("stomp");
    const now = Date.now();
    if (now - lastReactionRef.current > REACTION_COOLDOWN_MS) {
      lastReactionRef.current = now;
      const line = REACTIONS[Math.floor(Math.random() * REACTIONS.length)]!;
      setSay(line);
      clearTimeout(sayTimerRef.current);
      sayTimerRef.current = setTimeout(() => setSay(null), 1400);
    }
    setTimeout(() => {
      setPose(groundedRef.current ? "run" : "jump");
    }, BONK_RECOVERY_MS);
  }, []);

  // Keyboard: Space / ArrowUp jump.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.code === "ArrowUp") {
        e.preventDefault();
        doJump();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [doJump]);

  // Physics + world scroll + obstacle spawn/collision loop.
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    lastRef.current = performance.now();
    let cancelled = false;

    const tick = (now: number) => {
      if (cancelled) return;
      const dt = Math.min(MAX_DT_MS, now - lastRef.current) / 1000;
      lastRef.current = now;
      const width = stage.clientWidth || 640;

      if (!groundedRef.current) {
        vyRef.current += GRAVITY * dt;
        yRef.current += vyRef.current * dt;
        if (yRef.current >= 0) {
          yRef.current = 0;
          vyRef.current = 0;
          groundedRef.current = true;
          // Don't cut a bonk reaction short just because the landing beat both fire close together.
          setPose((p) => (now < bonkUntilRef.current ? p : "run"));
        }
        setBoyY(yRef.current);
      }

      nextSpawnRef.current -= RUN_SPEED_PX_S * dt;
      if (nextSpawnRef.current <= 0) {
        nextSpawnRef.current =
          OBSTACLE_MIN_GAP_PX + Math.random() * (OBSTACLE_MAX_GAP_PX - OBSTACLE_MIN_GAP_PX);
        obstaclesRef.current = [
          ...obstaclesRef.current,
          {
            id: nextIdRef.current++,
            x: width + 24,
            width: 14 + Math.random() * 12,
            height: 20 + Math.random() * 16,
          },
        ];
      }

      const boyLeftPx = (BOY_LEFT_PERCENT / 100) * width;
      const boyWidth = 30;
      let bonked = false;
      obstaclesRef.current = obstaclesRef.current
        .map((ob) => ({ ...ob, x: ob.x - RUN_SPEED_PX_S * dt }))
        .filter((ob) => ob.x + ob.width > -20);

      if (now > bonkUntilRef.current) {
        for (const ob of obstaclesRef.current) {
          const horizontallyOver =
            ob.x < boyLeftPx + boyWidth && ob.x + ob.width > boyLeftPx;
          const clearedByJump = Math.abs(yRef.current) > ob.height * 0.75;
          if (horizontallyOver && !clearedByJump) {
            bonked = true;
            break;
          }
        }
      }

      setObstacles(obstaclesRef.current);
      if (bonked) {
        bonkUntilRef.current = now + BONK_RECOVERY_MS;
        bonk();
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      cancelled = true;
      cancelAnimationFrame(rafRef.current);
    };
  }, [bonk]);

  useEffect(() => {
    return () => {
      clearTimeout(sayTimerRef.current);
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center bg-background/90 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Freedom"
    >
      <div className="w-full max-w-xl space-y-3">
        <div className="flex items-center justify-between text-2xs uppercase tracking-label text-muted-foreground">
          <span>FREEDOM</span>
          <span className="font-mono tabular-nums">JUMPS {jumps}</span>
        </div>
        <div
          ref={stageRef}
          onPointerDown={doJump}
          className="relative h-56 w-full touch-none select-none overflow-hidden rounded-md border border-border bg-card md:h-72"
        >
          {/* Floor line near 80% height */}
          <div className="absolute inset-x-0 bg-border" style={{ top: "80%", height: 1 }} />
          {obstacles.map((ob) => (
            <div
              key={ob.id}
              className="absolute rounded-sm bg-foreground/70"
              style={{
                left: ob.x,
                width: ob.width,
                height: ob.height,
                bottom: "20%",
              }}
            />
          ))}
          <div
            className="absolute"
            style={{
              left: `${BOY_LEFT_PERCENT}%`,
              bottom: "20%",
              transform: `translateY(${boyY}px)`,
            }}
          >
            <Boy pose={reducedMotion ? "run" : pose} say={say ?? undefined} scale={0.85} />
          </div>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-2xs text-muted-foreground">
            Space / tap to jump. He can&apos;t die.
          </p>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-border-strong px-3 py-1.5 text-sm font-medium text-foreground hover:bg-elevated"
          >
            BACK
          </button>
        </div>
      </div>
    </div>
  );
}
