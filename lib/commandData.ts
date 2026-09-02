import { getAllSideProjects } from "@/lib/projectsData";
import { goToShortcuts } from "@/lib/shortcutsData";

export type Command = {
  id: string;
  label: string;
  group: "Navigation" | "Projects" | "Actions";
  href?: string;
  action?: "toggle-theme" | "copy-email" | "open-shortcuts";
  keys?: string[];
};

export function buildCommands(): Command[] {
  const withGoToKeys = (c: Command): Command => {
    const dest = goToShortcuts.find((g) => g.href === c.href);
    return dest ? { ...c, keys: ["g", dest.key] } : c;
  };

  const nav: Command[] = (
    [
      { id: "nav-work", label: "Selected work", group: "Navigation", href: "/#projects" },
      { id: "nav-exp", label: "Experience", group: "Navigation", href: "/#experience" },
      { id: "nav-cv", label: "CV", group: "Navigation", href: "/cv" },
      { id: "nav-contact", label: "Contact", group: "Navigation", href: "/#contact" },
    ] satisfies Command[]
  ).map(withGoToKeys);

  const projects: Command[] = getAllSideProjects().map((p) => ({
    id: `proj-${p.slug}`,
    label: p.title,
    group: "Projects" as const,
    href: `/project/${p.slug}`,
  }));

  const actions: Command[] = [
    { id: "act-theme", label: "Toggle theme", group: "Actions", action: "toggle-theme", keys: ["t"] },
    { id: "act-shortcuts", label: "Keyboard shortcuts", group: "Actions", action: "open-shortcuts", keys: ["?"] },
  ];

  return nav.concat(projects, actions);
}

export function filterCommands(commands: Command[], q: string): Command[] {
  const s = q.trim().toLowerCase();
  if (!s) return commands;
  return commands.filter((c) => c.label.toLowerCase().includes(s) || c.group.toLowerCase().includes(s));
}
