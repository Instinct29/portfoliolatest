"use client";

import { useReducedMotion } from "motion/react";
import HomeRunner from "./HomeRunner";

export default function HomeRunnerSection() {
  const reduced = useReducedMotion() ?? false;

  return (
    <section
      className="border-t border-border py-10 md:border-l md:py-12"
      aria-label="Endless runner"
    >
      <div className="px-6">
        <p className="text-2xs font-medium uppercase tracking-label text-muted-foreground">
          Endless runner
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          While you wait. Jump over things. Don&apos;t die.
        </p>
        <div className="mt-6">
          <HomeRunner reduced={reduced} />
        </div>
      </div>
    </section>
  );
}
