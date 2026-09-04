"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/* ── constants ── */
const W = 600;
const H = 150;
const FLOOR_Y = H - 32; // y where player feet rest
const PW = 10;          // player width
const PH = 16;          // player height
const PLAYER_X = 56;
const GRAVITY = 1900;
const JUMP_VY = -530;
const BASE_SPEED = 190;
const ACCEL = 18;        // px/s² speed growth
const MAX_SPEED = 500;
const MIN_GAP = 240;
const HI_KEY = "dp-runner-hi";

/* Obstacle types: single short, single tall, double (two back-to-back) */
type ObsShape = "short" | "tall" | "double";
type Obstacle = { x: number; w: number; h: number; shape: ObsShape };

type RunState = {
  phase: "idle" | "dead";
} | {
  phase: "running";
  score: number;
  speed: number;
  vy: number;
  playerY: number;
  airborne: boolean;
  obstacles: Obstacle[];
  nextSpawn: number;
  distAccum: number;
  dashOffset: number;
};

function pad5(n: number) { return String(Math.round(n)).padStart(5, "0"); }

function readHi(): number {
  try { return parseInt(localStorage.getItem(HI_KEY) ?? "0", 10) || 0; }
  catch { return 0; }
}
function saveHi(n: number) {
  try { localStorage.setItem(HI_KEY, String(n)); }
  catch { /* private mode */ }
}

function makeObstacle(x: number): Obstacle {
  const roll = Math.random();
  if (roll < 0.35) return { x, w: 10, h: 13, shape: "short" };
  if (roll < 0.70) return { x, w: 10, h: 22, shape: "tall" };
  // double: two rects close together
  return { x, w: 24, h: 14, shape: "double" };
}

export default function HomeRunner({ reduced = false }: { reduced?: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stRef = useRef<RunState>({ phase: "idle" });
  const hiRef = useRef(0);
  const rafRef = useRef(0);
  const lastTsRef = useRef(0);
  const [phase, setPhase] = useState<"idle" | "running" | "dead">("idle");
  const [score, setScore] = useState(0);
  const [hi, setHi] = useState(0);

  useEffect(() => {
    hiRef.current = readHi();
    setHi(hiRef.current);
  }, []);

  /* ── draw ── */
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const cs = getComputedStyle(canvas);
    const toColor = (v: string) => `hsl(${cs.getPropertyValue(v).trim()})`;
    const fg = toColor("--foreground");
    const muted = toColor("--muted-foreground");
    const border = toColor("--border");
    const borderStrong = toColor("--border-strong");

    ctx.clearRect(0, 0, W, H);

    const st = stRef.current;

    /* ground line */
    ctx.strokeStyle = border;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, FLOOR_Y + PH + 1);
    ctx.lineTo(W, FLOOR_Y + PH + 1);
    ctx.stroke();

    /* idle */
    if (st.phase === "idle") {
      /* player */
      ctx.fillStyle = fg;
      ctx.fillRect(PLAYER_X, FLOOR_Y, PW, PH);
      /* prompt */
      ctx.fillStyle = muted;
      ctx.font = "20px monospace";
      ctx.textAlign = "center";
      ctx.fillText("SPACE or CLICK to start", W / 2, H / 4 - 10);
      ctx.fillStyle = border;
      ctx.font = "20px monospace";
      ctx.fillText("ARROW UP to jump", W / 2, H / 2 + 6);
      return;
    }

    const loose = st as { phase: string; score: number; playerY?: number; obstacles?: Obstacle[]; airborne?: boolean; dashOffset?: number };
    const { playerY = FLOOR_Y, obstacles = [], score: sc, airborne = false, dashOffset = 0 } = loose;

    /* speed-dashes on ground */
    const dashLen = 18;
    const dashGap = 32;
    ctx.strokeStyle = borderStrong;
    ctx.lineWidth = 1;
    ctx.setLineDash([dashLen, dashGap]);
    ctx.lineDashOffset = -dashOffset;
    ctx.beginPath();
    ctx.moveTo(0, FLOOR_Y + PH + 4);
    ctx.lineTo(W, FLOOR_Y + PH + 4);
    ctx.stroke();
    ctx.setLineDash([]);

    /* player — slightly different shade when airborne */
    ctx.fillStyle = st.phase === "dead" ? muted : (airborne ? borderStrong : fg);
    ctx.fillRect(PLAYER_X, playerY, PW, PH);

    /* obstacles */
    for (const obs of obstacles) {
      if (obs.shape === "double") {
        /* two separate blocks with a narrow gap */
        const bw = 10;
        const gap = 4;
        ctx.fillStyle = fg;
        ctx.fillRect(obs.x, FLOOR_Y + PH - obs.h, bw, obs.h);
        ctx.fillRect(obs.x + bw + gap, FLOOR_Y + PH - obs.h, bw, obs.h);
      } else {
        ctx.fillStyle = fg;
        ctx.fillRect(obs.x, FLOOR_Y + PH - obs.h, obs.w, obs.h);
      }
    }

    /* score bar */
    ctx.fillStyle = muted;
    ctx.font = "20px monospace";
    ctx.textAlign = "left";
    ctx.fillText(`HI ${pad5(Math.max(hiRef.current, sc))}`, 8, 16);
    ctx.fillStyle = fg;
    ctx.font = "20px monospace";
    ctx.textAlign = "right";
    ctx.fillText(pad5(sc), W - 8, 16);

    /* dead overlay */
    if (st.phase === "dead") {
      ctx.fillStyle = muted;
      ctx.font = "bold 20px monospace";
      ctx.textAlign = "center";
      ctx.fillText("DEAD.", W / 2, H / 2 - 8);
      ctx.font = "20px monospace";
      ctx.fillText("SPACE or CLICK to restart", W / 2, H / 2 + 10);
    }
  }, []);

  /* ── game loop ── */
  const loop = useCallback((ts: number) => {
    const dt = Math.min((ts - (lastTsRef.current || ts)) / 1000, 0.05);
    lastTsRef.current = ts;
    const st = stRef.current;

    if (st.phase !== "running") { draw(); return; }

    const speed = Math.min(st.speed + ACCEL * dt, MAX_SPEED);
    const distAccum = st.distAccum + speed * dt;
    const dashOffset = (st.dashOffset + speed * dt * 0.6) % (18 + 32); // dashLen+dashGap

    let vy = st.vy + GRAVITY * dt;
    let playerY = st.playerY + vy * dt;
    let airborne = true;
    if (playerY >= FLOOR_Y) { playerY = FLOOR_Y; vy = 0; airborne = false; }

    /* move + cull obstacles */
    const obstacles: Obstacle[] = st.obstacles
      .map(o => ({ ...o, x: o.x - speed * dt }))
      .filter(o => o.x + (o.shape === "double" ? 24 : o.w) > -20);

    /* spawn */
    let nextSpawn = st.nextSpawn - speed * dt;
    if (nextSpawn <= 0) {
      obstacles.push(makeObstacle(W + 20));
      nextSpawn = MIN_GAP + Math.random() * 180;
    }

    /* collision */
    const px1 = PLAYER_X + 2;
    const px2 = PLAYER_X + PW - 2;
    const py2 = playerY + PH - 2;
    let dead = false;
    for (const obs of obstacles) {
      const hitRects: Array<[number, number, number, number]> =
        obs.shape === "double"
          ? [[obs.x, obs.x + 10, FLOOR_Y + PH - obs.h, FLOOR_Y + PH],
             [obs.x + 14, obs.x + 24, FLOOR_Y + PH - obs.h, FLOOR_Y + PH]]
          : [[obs.x, obs.x + obs.w, FLOOR_Y + PH - obs.h, FLOOR_Y + PH]];
      for (const [ox1, ox2, oy1, oy2] of hitRects) {
        if (px2 > ox1 && px1 < ox2 && py2 > oy1 && playerY < oy2) {
          dead = true; break;
        }
      }
      if (dead) break;
    }

    if (dead) {
      const finalScore = Math.round(distAccum / 10);
      if (finalScore > hiRef.current) { hiRef.current = finalScore; saveHi(finalScore); setHi(finalScore); }
      stRef.current = { phase: "dead", score: finalScore } as RunState;
      setPhase("dead");
      setScore(finalScore);
      draw();
      return;
    }

    const sc = Math.round(distAccum / 10);
    stRef.current = { phase: "running", score: sc, speed, vy, playerY, airborne, obstacles, nextSpawn, distAccum, dashOffset };
    setScore(sc);
    draw();
    rafRef.current = requestAnimationFrame(loop);
  }, [draw]);

  /* ── start/restart ── */
  const startRun = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    lastTsRef.current = 0;
    stRef.current = { phase: "running", score: 0, speed: BASE_SPEED, vy: 0, playerY: FLOOR_Y, airborne: false, obstacles: [], nextSpawn: MIN_GAP, distAccum: 0, dashOffset: 0 };
    setPhase("running");
    setScore(0);
    rafRef.current = requestAnimationFrame(loop);
  }, [loop]);

  /* ── input ── */
  const action = useCallback(() => {
    const st = stRef.current;
    if (st.phase !== "running") { startRun(); return; }
    if (!st.airborne) { (stRef.current as Extract<RunState, { phase: "running" }>).vy = JUMP_VY; }
  }, [startRun]);

  const onKey = useCallback((e: KeyboardEvent) => {
    if (e.code === "Space" || e.code === "ArrowUp") { e.preventDefault(); action(); }
  }, [action]);

  const onCanvasClick = useCallback(() => {
    action();
    canvasRef.current?.focus();
  }, [action]);

  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    c.addEventListener("keydown", onKey);
    return () => c.removeEventListener("keydown", onKey);
  }, [onKey]);

  /* initial draw */
  useEffect(() => { draw(); }, [draw]);

  /* reduced motion: freeze at idle */
  useEffect(() => {
    if (!reduced) return;
    cancelAnimationFrame(rafRef.current);
    stRef.current = { phase: "idle" };
    setPhase("idle");
    draw();
  }, [reduced, draw]);

  useEffect(() => () => cancelAnimationFrame(rafRef.current), []);

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        width={W}
        height={H}
        tabIndex={0}
        onClick={onCanvasClick}
        className="w-full cursor-pointer rounded-sm border border-border bg-card focus:outline-none focus-visible:ring-1 focus-visible:ring-border-strong"
        aria-label={
          phase === "idle" ? "Endless runner — press Space or click to start"
          : phase === "dead" ? `Game over — score ${pad5(score)} — press Space or click to restart`
          : `Running — score ${pad5(score)}`
        }
        role="img"
        style={{ imageRendering: "pixelated" }}
      />
      {phase === "dead" && hi > 0 && score >= hi && (
        <p className="mt-2 text-right font-mono text-2xs text-foreground">
          NEW HI {pad5(hi)}
        </p>
      )}
    </div>
  );
}
