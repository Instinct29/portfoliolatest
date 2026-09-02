export type NavLink = {
  label: string;
  href: string;
  match?: string;
};

export const navLinks: NavLink[] = [
  { label: "Work", href: "/#experience" },
  { label: "Projects", href: "/#projects" },
  { label: "CV", href: "/cv", match: "/cv" },
];

const FOOTER_ROUTES = new Set(["Work", "Projects", "CV"]);

export const footerLinks: NavLink[] = [
  { label: "Home", href: "/" },
  ...navLinks.filter((l) => FOOTER_ROUTES.has(l.label)),
];

export type SocialLink = { name: "GitHub" | "LinkedIn"; href: string };

export const socialLinks: SocialLink[] = [
  { name: "GitHub", href: "https://github.com/Instinct29" },
  { name: "LinkedIn", href: "https://www.linkedin.com/in/manthan-gour/" },
];

/** Leave empty to hide email CTAs — no placeholders in production UI. */
export const contactEmail = "";

export const location = {
  code: "JAI",
  name: "Jaipur, India",
  timeZone: "Asia/Kolkata",
  tzLabel: "IST",
};
