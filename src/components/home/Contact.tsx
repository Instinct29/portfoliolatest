import { profile } from "@/data/profile";
import { buttonVariants } from "@/components/ui/Button";
import { ExternalLink } from "@/components/ui/ExternalLink";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/layout/Section";
import { cn } from "@/lib/utils";

export function Contact() {
  return (
    <Section id="contact" number="08" title="Contact">
      <Reveal>
        <div className="max-w-2xl">
          <p className="text-2xl font-medium tracking-tight md:text-3xl">
            Have a product, role, or engineering problem worth talking about?
          </p>
          <p className="mt-4 text-muted-foreground">
            I&apos;m open to senior frontend and frontend-heavy full-stack opportunities. Reach
            out through any of the channels below.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            {profile.email ? (
              <a href={`mailto:${profile.email}`} className={cn(buttonVariants())}>
                Email me
              </a>
            ) : (
              <ExternalLink
                href={profile.linkedin}
                showIcon={false}
                className={cn(buttonVariants())}
              >
                Connect on LinkedIn
              </ExternalLink>
            )}
            <ExternalLink
              href={profile.resumePath}
              showIcon={false}
              className={cn(buttonVariants({ variant: "outline" }))}
            >
              Resume
            </ExternalLink>
          </div>

          <div className="mt-8 flex flex-wrap gap-6 text-sm">
            <ExternalLink href={profile.github}>GitHub</ExternalLink>
            <ExternalLink href={profile.linkedin}>LinkedIn</ExternalLink>
            {!profile.email && (
              <span className="text-xs text-muted-foreground">
                Email: configure in src/data/profile.ts
              </span>
            )}
          </div>
        </div>
      </Reveal>
    </Section>
  );
}
