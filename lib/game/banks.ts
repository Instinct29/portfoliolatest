export const ADJECTIVES = [
  "ANGRY",
  "CALM",
  "BRAVE",
  "QUIET",
  "WILD",
  "GENTLE",
  "FIERCE",
  "HAPPY",
] as const;

export const NOUNS = [
  "PANDA",
  "TIGER",
  "EAGLE",
  "RIVER",
  "STORM",
  "COMET",
  "FOREST",
  "CANYON",
] as const;

export const ANIMALS = [
  "PENGUIN",
  "OTTER",
  "FALCON",
  "LLAMA",
  "COBRA",
  "RAVEN",
  "DOLPHIN",
  "BADGER",
] as const;

export const WORDS = [
  "MISSISSIPPI",
  "ALABAMA",
  "KENTUCKY",
  "OHIO",
  "VERMONT",
  "ARIZONA",
] as const;

export const COLORS = [
  { id: "red", label: "RED", hex: "#dc2626" },
  { id: "green", label: "GREEN", hex: "#16a34a" },
  { id: "blue", label: "BLUE", hex: "#2563eb" },
  { id: "grey", label: "GREY", hex: "#6b7280" },
] as const;

export const SYMBOLS = ["★", "▲", "●", "◆", "■"] as const;

export const EDIBLE = ["APPLE", "RICE", "BREAD", "MANGO", "GRAPE"] as const;
export const NON_EDIBLE = ["SOAP", "STONE", "GLASS", "METAL", "CLOTH"] as const;

export const FALSE_EQUATIONS = [
  { left: "3 + 3", right: "8" },
  { left: "5 + 2", right: "9" },
  { left: "4 + 4", right: "7" },
  { left: "6 + 1", right: "9" },
] as const;

export const MAZE_LAYOUTS: number[][][] = [
  [
    [1, 1, 1, 1, 1],
    [1, 0, 0, 0, 1],
    [1, 0, 2, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 1, 1, 1, 1],
  ],
  [
    [1, 1, 1, 1, 1],
    [1, 0, 0, 2, 1],
    [1, 0, 1, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 1, 1, 1, 1],
  ],
];

/** 0 = path, 1 = wall. Dead-end cells used for secret placement. */
export const INVISIBLE_MAZES: number[][][] = [
  [
    [1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 1, 0, 1],
    [1, 0, 1, 0, 1, 0, 1],
    [1, 0, 1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1, 0, 1],
    [1, 1, 1, 1, 1, 0, 1],
    [1, 1, 1, 1, 1, 1, 1],
  ],
];

/** Visually blocked START/FINISH maze for L15 (drag FINISH, not traverse). */
export const IMPOSSIBLE_MAZE: number[][] = [
  [1, 1, 1, 1, 1],
  [1, 0, 0, 0, 1],
  [1, 2, 2, 2, 1],
  [1, 0, 0, 0, 1],
  [1, 1, 1, 1, 1],
];

export const SIMON_COMMANDS = ["RED", "GREEN", "LEFT", "RIGHT"] as const;

export const EXAM_POOL = [
  "largest",
  "smallest",
  "answerWord",
  "colorReact",
  "opposite",
  "chosenColor",
  "stopCounter",
  "arith",
  "background",
  "dontClick",
  "sequence",
  "levelIndicator",
  "trapAnswer",
  "secondLargest",
  "trustNothing",
  "fakeFinish",
  "mirrorWord",
  "lastDigit",
] as const;
