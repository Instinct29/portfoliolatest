import { NextResponse } from "next/server";
import { getLeaderboardStore } from "@/lib/game/leaderboard/store";
import {
  validateFinishPayload,
  validateDisplayName,
} from "@/lib/game/validation";

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
    if (!rateLimit(`finish:${ip}`, 10, 60_000)) {
      return NextResponse.json({ error: "Slow down." }, { status: 429 });
    }

    const body = await req.json();
    if (!validateFinishPayload(body)) {
      return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
    }
    const o = body as {
      runId: string;
      displayName: string;
      secretsFound: number;
      hintsUsed?: number;
      skipsUsed?: number;
      ranked?: boolean;
    };
    const nameCheck = validateDisplayName(o.displayName);
    if (!nameCheck.ok) {
      return NextResponse.json({ error: nameCheck.error }, { status: 400 });
    }

    const store = await getLeaderboardStore();
    if (!store.isConfigured()) {
      return NextResponse.json(
        { error: "Leaderboard not configured." },
        { status: 503 }
      );
    }

    const run = await store.getRun(o.runId);
    if (!run) {
      return NextResponse.json({ error: "Run not found." }, { status: 404 });
    }

    const result = await store.finishRun(o.runId, {
      displayName: nameCheck.value!,
      secretsFound: o.secretsFound,
      hintsUsed: o.hintsUsed ?? 0,
      skipsUsed: o.skipsUsed ?? 0,
      ranked: o.ranked !== false,
    });

    if (!result) {
      return NextResponse.json(
        { error: "Could not finish run." },
        { status: 400 }
      );
    }

    return NextResponse.json({
      score: result.score,
      elapsedSeconds: result.elapsedSeconds,
    });
  } catch {
    return NextResponse.json({ error: "Server error." }, { status: 500 });
  }
}
