"use client";

import { ArrowDown, ArrowRight } from "lucide-react";
import { availabilityStatus, metrics, profile } from "@/data/profile";
import { buttonVariants } from "@/components/ui/Button";
import { ExternalLink } from "@/components/ui/ExternalLink";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/Reveal";
import { Container } from "@/components/layout/Container";
import { cn } from "@/lib/utils";

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-32 pb-20 md:pt-40 md:pb-28">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% -20%, var(--hero-glow), transparent)",
        }}
      />

      <Container>
        <Reveal>
          <div className="mb-6 flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-40" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
              </span>
              <span className="text-xs text-muted-foreground">
                {availabilityStatus.primary}
              </span>
            </div>
            <span className="text-xs text-muted-foreground">·</span>
            <span className="text-xs text-muted-foreground">{availabilityStatus.secondary}</span>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <p className="mb-4 font-mono text-sm text-muted-foreground">{profile.roleLine}</p>
        </Reveal>

        <Reveal delay={0.15}>
          <h1 className="max-w-4xl text-balance text-[clamp(2.25rem,5vw,3.75rem)] font-semibold leading-[1.1] tracking-tight">
            {profile.headline}
          </h1>
        </Reveal>

        <Reveal delay={0.2}>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            {profile.bio}
          </p>
        </Reveal>

        <Reveal delay={0.25}>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <a href="#projects" className={cn(buttonVariants())}>
              View my work
              <ArrowRight className="h-4 w-4" />
            </a>
            <ExternalLink
              href={profile.resumePath}
              showIcon={false}
              className={cn(buttonVariants({ variant: "outline" }))}
            >
              Resume
            </ExternalLink>
            <a
              href={profile.github}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
              className={cn(buttonVariants({ variant: "ghost", size: "default" }))}
            >
              GitHub
            </a>
            <a
              href={profile.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              className={cn(buttonVariants({ variant: "ghost", size: "default" }))}
            >
              LinkedIn
            </a>
          </div>
        </Reveal>

        <Stagger
          className="mt-16 grid grid-cols-2 gap-4 border-t border-border pt-8 sm:grid-cols-4"
          staggerDelay={0.08}
        >
          {metrics.map((metric) => (
            <StaggerItem key={metric.label}>
              <p className="text-sm font-medium">{metric.label}</p>
            </StaggerItem>
          ))}
        </Stagger>

        <Reveal delay={0.4}>
          <a
            href="#experience"
            className="focus-ring mt-16 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
            aria-label="Scroll to experience section"
          >
            <ArrowDown className="h-4 w-4 animate-bounce" />
            Scroll
          </a>
        </Reveal>
      </Container>
    </section>
  );
}
