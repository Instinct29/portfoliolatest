import { NextResponse } from "next/server";
import { createRunSeed } from "@/lib/game/random";
import { getLeaderboardStore } from "@/lib/game/leaderboard/store";

const buckets = new Map<string, { n: number; t: number }>();
function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const b = buckets.get(key);
  if (!b || now - b.t > windowMs) {
    buckets.set(key, { n: 1, t: now });
    return true;
  }
  if (b.n >= limit) return false;
  b.n++;
  return true;
}

export async function POST(req: Request) {
  try {
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "anon";
    if (!rateLimit(`start:${ip}`, 20, 60_000)) {
      return NextResponse.json({ error: "Slow down." }, { status: 429 });
    }
    const body = (await req.json().catch(() => ({}))) as { seed?: string };
    const seed =
      typeof body.seed === "string" && body.seed.length >= 8
        ? body.seed
        : createRunSeed();
    const store = await getLeaderboardStore();
    if (!store.isConfigured()) {
      return NextResponse.json({
        runId: crypto.randomUUID(),
        seed,
        startedAt: Date.now(),
        ranked: false,
      });
    }
    const run = await store.createRun(seed);
    return NextResponse.json({
      runId: run.runId,
      seed: run.seed,
      startedAt: run.startedAt,
      ranked: true,
    });
  } catch {
    return NextResponse.json({ error: "Could not start run." }, { status: 500 });
  }
}
