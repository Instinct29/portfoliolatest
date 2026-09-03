import type { RunMemory } from "./types";

/** Development-only jump targets with seeded memory for callback levels. */
export function isDevGameToolsEnabled(): boolean {
  return process.env.NODE_ENV === "development";
}

export function devMemoryForLevel(level: number): Partial<RunMemory> {
  const base: RunMemory = {
    chosenDoor: "B",
    chosenColor: "GREEN",
    chosenNumber: 4,
    forgottenPhrase: "ANGRY PANDA 481",
    forgottenAdjective: "ANGRY",
    forgottenNoun: "PANDA",
    forgottenNumber: 481,
    sequence51: ["◆", "●", "■", "▲", "★"],
    sequence53: ["★", "■", "●", "◆"],
    animal56: "PENGUIN",
    animalNumber56: 74,
    livesAt50: 5,
    flashedSymbol41: "★",
    currentSafeRule: "BLUE",
    level16Answer: "NO",
    level45First: "YES",
  };
  if (level <= 16) return {};
  if (level <= 20) return { level16Answer: "NO" };
  if (level <= 29) return {
    chosenDoor: base.chosenDoor,
    chosenColor: base.chosenColor,
    chosenNumber: base.chosenNumber,
    level16Answer: base.level16Answer,
  };
  if (level <= 40) {
    return {
      ...base,
      forgottenPhrase: undefined,
      forgottenAdjective: undefined,
      forgottenNoun: undefined,
      forgottenNumber: undefined,
    };
  }
  if (level <= 50) {
    return {
      ...base,
      flashedSymbol41: base.flashedSymbol41,
    };
  }
  if (level <= 60) {
    return {
      ...base,
      sequence51: base.sequence51,
      sequence53: base.sequence53,
      animal56: base.animal56,
      animalNumber56: base.animalNumber56,
      livesAt50: base.livesAt50,
    };
  }
  if (level <= 80) {
    return { ...base, currentSafeRule: level >= 81 ? "BLUE" : undefined };
  }
  return base;
}
