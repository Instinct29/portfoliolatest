import type { NavItem } from "@/types";

export const navItems: NavItem[] = [
  { label: "Work", href: "#experience" },
  { label: "Projects", href: "#projects" },
  { label: "About", href: "#about" },
  { label: "Resume", href: "/resume.pdf", external: true },
  { label: "Contact", href: "#contact" },
];

export const commandItems: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "Work", href: "/#experience" },
  { label: "Projects", href: "/#projects" },
  { label: "About", href: "/#about" },
  { label: "Resume", href: "/resume.pdf", external: true },
  { label: "GitHub", href: "https://github.com/Instinct29", external: true },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/manthan-gour/",
    external: true,
  },
  { label: "Contact", href: "/#contact" },
];
