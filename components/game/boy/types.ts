export type BoyPose =
  | "idle"
  | "enter"
  | "exit"
  | "look-left"
  | "look-right"
  | "look"
  | "think"
  | "walk"
  | "walk-left"
  | "walk-right"
  | "quick-walk"
  | "run"
  | "wave"
  | "point"
  | "shrug"
  | "laugh"
  | "cheer"
  | "jump"
  | "stomp"
  | "shout"
  | "panic"
  | "lean"
  | "reach"
  | "pull"
  | "carry"
  | "carry-toolbox"
  | "use-wrench"
  | "unscrew"
  | "wipe"
  | "sweep"
  | "pick-up"
  | "throw"
  | "inspect";

export type BoyEdge =
  | "left"
  | "right"
  | "bottom-left"
  | "bottom-right"
  | "bottom-center"
  | "top-left"
  | "top-right";

export type BubbleSide = "auto" | "left" | "right";

/** Choreography beat: advance after action duration, not a free-running carousel. */
export type BoySceneBeat = {
  id: string;
  pose: BoyPose;
  say?: string;
  /** Hold this beat at least this long (ms). */
  minMs: number;
  flip?: boolean;
  facing?: "left" | "right";
  showTools?: boolean;
  tool?: "wrench" | "screwdriver" | "cloth" | "toolbox" | "none";
};
