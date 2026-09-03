import { NextResponse } from "next/server";
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

function clientKey(req: Request): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "anon"
  );
}

export async function POST(req: Request) {
  try {
    if (!rateLimit(`progress:${clientKey(req)}`, 80, 60_000)) {
      return NextResponse.json({ error: "Slow down." }, { status: 429 });
    }
    const body = (await req.json()) as {
      runId?: string;
      event?: "success" | "failure";
      level?: number;
      secretsFound?: number;
      hintsUsed?: number;
      skipsUsed?: number;
      ranked?: boolean;
    };
    if (
      !body.runId ||
      typeof body.level !== "number" ||
      (body.event !== "success" && body.event !== "failure")
    ) {
      return NextResponse.json({ error: "Invalid." }, { status: 400 });
    }
    if (
      !Number.isInteger(body.level) ||
      body.level < 1 ||
      body.level > 100
    ) {
      return NextResponse.json({ error: "Invalid level." }, { status: 400 });
    }

    const store = await getLeaderboardStore();
    if (!store.isConfigured()) {
      return NextResponse.json({ ok: true, local: true });
    }

    const result = await store.applyProgress(body.runId, body.event, body.level, {
      secretsFound: body.secretsFound,
      hintsUsed: body.hintsUsed,
      skipsUsed: body.skipsUsed,
      ranked: body.ranked,
    });

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    return NextResponse.json({ ok: true, level: result.level });
  } catch {
    return NextResponse.json({ error: "Server error." }, { status: 500 });
  }
}
