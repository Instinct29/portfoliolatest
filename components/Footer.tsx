import Link from "next/link";
import Image from "next/image";
import { Mail } from "lucide-react";
import Container from "@/components/layout/Container";
import { SVGS } from "./SVGS";
import { footerLinks, socialLinks, contactEmail } from "@/lib/siteLinks";

const SOCIAL_ICONS = {
  GitHub: SVGS.Github,
  LinkedIn: SVGS.LinkedIn,
} as const;

const Footer = () => {
  return (
    <footer className="relative mt-24 overflow-hidden border-t border-border">
      <span aria-hidden className="pointer-events-none absolute inset-0">
        <Image
          src="/footer-panther.jpg"
          alt=""
          fill
          sizes="100vw"
          quality={70}
          className="select-none object-cover object-center opacity-[0.16] dark:opacity-[0.28]"
          style={{
            maskImage: "linear-gradient(to bottom, transparent 0%, black 40%)",
            WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, black 40%)",
          }}
        />
      </span>
      <Container className="relative py-12 md:py-16">
        <div className="max-w-sm">
          <Link
            href="/"
            className="inline-flex items-center gap-2.5 transition-opacity duration-fast ease-out hover:opacity-80"
          >
            <span
              aria-hidden
              className="block h-7 w-7 shrink-0 bg-foreground"
              style={{
                WebkitMaskImage: "url(/brand-mark.png)",
                maskImage: "url(/brand-mark.png)",
                WebkitMaskSize: "contain",
                maskSize: "contain",
                WebkitMaskRepeat: "no-repeat",
                maskRepeat: "no-repeat",
                WebkitMaskPosition: "center",
                maskPosition: "center",
              }}
            />
            <span className="text-base font-semibold tracking-tight text-foreground">MG</span>
          </Link>

          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            Manthan Gour. Software engineer building product-focused frontend experiences.
          </p>
        </div>

        <div className="mt-10 flex flex-col gap-10 md:flex-row md:justify-between md:gap-16">
          <nav aria-label="Footer" className="md:max-w-md">
            <h2 className="font-mono text-2xs uppercase tracking-label text-subtle">Navigate</h2>
            <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-2.5">
              {footerLinks.map((l) => (
                <li key={l.label}>
                  <Link
                    href={l.href}
                    className="text-sm text-muted-foreground transition-colors duration-fast ease-out hover:text-foreground"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h2 className="font-mono text-2xs uppercase tracking-label text-subtle">Connect</h2>
            <ul className="mt-4 flex flex-wrap gap-2">
              {socialLinks.map(({ name, href }) => {
                const Icon = SOCIAL_ICONS[name];
                return (
                  <li key={name}>
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={name}
                      className="grid h-11 w-11 place-items-center rounded-lg border border-border-strong text-muted-foreground transition-colors duration-fast ease-out hover:bg-elevated hover:text-foreground"
                    >
                      <Icon aria-hidden="true" className="h-4 w-4" />
                      <span className="sr-only">{name}</span>
                    </a>
                  </li>
                );
              })}
              {contactEmail ? (
                <li>
                  <a
                    href={`mailto:${contactEmail}`}
                    title={contactEmail}
                    className="grid h-11 w-11 place-items-center rounded-lg border border-border-strong text-muted-foreground transition-colors duration-fast ease-out hover:bg-elevated hover:text-foreground"
                  >
                    <Mail aria-hidden="true" className="h-4 w-4" />
                    <span className="sr-only">Email {contactEmail}</span>
                  </a>
                </li>
              ) : null}
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t border-border pt-6 text-xs text-subtle sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; {new Date().getFullYear()} Manthan Gour. Built with Next.js.</p>
          <a
            href="https://github.com/shashwa7-dev/portfolio/blob/master/LICENSE"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors duration-fast ease-out hover:text-foreground"
          >
            MIT License
          </a>
        </div>
      </Container>
    </footer>
  );
};

export default Footer;
