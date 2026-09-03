"use client";

import { createContext, useContext } from "react";
import type { GameState } from "@/lib/game/runReducer";
import type { GameAction } from "@/lib/game/runReducer";

type Ctx = {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
  activate: () => void;
  succeed: () => void;
  fail: (msg?: string) => void;
  grantLife: () => void;
  onProgressLevelClick: () => void;
};

const GameCtx = createContext<Ctx | null>(null);

export function GameProvider({
  value,
  children,
}: {
  value: Ctx;
  children: React.ReactNode;
}) {
  return <GameCtx.Provider value={value}>{children}</GameCtx.Provider>;
}

export function useGame() {
  const ctx = useContext(GameCtx);
  if (!ctx) throw new Error("useGame outside provider");
  return ctx;
}
