"use client";

import { useEffect, useState } from "react";
import type { ComponentType } from "react";
import type { LevelProps } from "@/lib/game/types";
import { loadLevelComponent } from "@/lib/game/levels/registry";

export default function LevelRenderer({
  level,
  props,
}: {
  level: number;
  props: LevelProps;
}) {
  const [Comp, setComp] = useState<ComponentType<LevelProps> | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setComp(null);
    setError(null);
    loadLevelComponent(level)
      .then((c) => {
        if (!cancelled) setComp(() => c);
      })
      .catch(() => {
        if (!cancelled) setError("Could not load level.");
      });
    return () => {
      cancelled = true;
    };
  }, [level]);

  if (error) {
    return (
      <p className="text-center text-sm text-muted-foreground">{error}</p>
    );
  }

  if (!Comp) {
    return (
      <p className="text-center text-sm text-muted-foreground">Loading run…</p>
    );
  }

  return <Comp key={level} {...props} />;
}
