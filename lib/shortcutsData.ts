export type GoTo = { key: string; label: string; href: string };

export const goToShortcuts: GoTo[] = [
  { key: "h", label: "Home", href: "/" },
  { key: "w", label: "Work", href: "/#experience" },
  { key: "p", label: "Projects", href: "/#projects" },
  { key: "v", label: "CV", href: "/cv" },
];

export type Shortcut = { keys: string[]; label: string };

export const MOD_KEY = "mod";

export const shortcutGroups: { title: string; items: Shortcut[] }[] = [
  {
    title: "General",
    items: [
      { keys: [MOD_KEY, "K"], label: "Open command menu" },
      { keys: ["t"], label: "Toggle theme" },
      { keys: ["?"], label: "Show this help" },
    ],
  },
  {
    title: "Go to",
    items: goToShortcuts.map((g) => ({ keys: ["g", g.key], label: g.label })),
  },
];
