import { NextResponse } from "next/server";
import { getLeaderboardStore } from "@/lib/game/leaderboard/store";

export async function GET() {
  try {
    const store = await getLeaderboardStore();
    if (!store.isConfigured()) {
      return NextResponse.json({ configured: false, entries: [], stats: null });
    }
    const [entries, stats] = await Promise.all([
      store.topEntries(10),
      store.stats(),
    ]);
    return NextResponse.json(
      { configured: true, entries, stats },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
        },
      }
    );
  } catch {
    return NextResponse.json({ configured: false, entries: [], stats: null });
  }
}
