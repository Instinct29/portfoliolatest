import React from "react";
import { SVGS } from "./SVGS";
import Section from "@/components/layout/Section";
import { socialLinks, contactEmail, location } from "@/lib/siteLinks";

const ICONS = {
  GitHub: SVGS.Github,
  LinkedIn: SVGS.LinkedIn,
} as const;

const Socials = () => {
  return (
    <Section id="contact" number="06" label="Contact" title="Let's build something good" width="reading">
      <div>
        <div className="flex flex-wrap items-center gap-3">
          {contactEmail ? (
            <a
              href={`mailto:${contactEmail}`}
              className="inline-block rounded-md bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground transition-opacity hover:opacity-90"
            >
              {contactEmail}
            </a>
          ) : (
            <a
              href={socialLinks.find((s) => s.name === "LinkedIn")?.href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block rounded-md bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground transition-opacity hover:opacity-90"
            >
              Connect on LinkedIn
            </a>
          )}
        </div>

        <div className="mt-8 space-y-4">
          <p className="font-mono text-2xs uppercase tracking-label text-subtle">
            {location.name} · {location.tzLabel}
          </p>

          <div className="flex gap-4 pt-2 text-sm text-muted-foreground">
            {socialLinks.map(({ name, href }) => {
              const Icon = ICONS[name];
              return (
                <a
                  key={name}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 transition-colors hover:text-foreground"
                >
                  <Icon className="h-4 w-4" />
                  <span>{name}</span>
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </Section>
  );
};

export default Socials;
