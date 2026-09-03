import type { Metadata } from "next";
import { Suspense } from "react";
import GamePlay from "@/components/game/GamePlay";
import { GameErrorBoundary } from "@/components/game/GameErrorBoundary";

export const metadata: Metadata = {
  title: "Definitely Possible — Manthan Gour",
  description:
    "100 perfectly reasonable levels hidden inside Manthan Gour's portfolio.",
};

export default function PlayPage() {
  return (
    <main className="py-8 md:py-12">
      <GameErrorBoundary>
        <Suspense
          fallback={
            <p className="px-4 text-sm text-muted-foreground">Loading run…</p>
          }
        >
          <GamePlay />
        </Suspense>
      </GameErrorBoundary>
    </main>
  );
}
