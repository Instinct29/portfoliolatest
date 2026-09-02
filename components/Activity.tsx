import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Section from "@/components/layout/Section";
import Bento from "@/components/layout/Bento";

export default function Activity() {
  return (
    <Section id="activity" number="04" label="Now" title="What I'm up to" width="reading">
      <Bento className="grid-cols-1 sm:grid-cols-2">
        <div className="bg-card p-5">
          <p className="mb-2.5 font-mono text-2xs uppercase tracking-label text-subtle">Currently</p>
          <p className="text-xl font-semibold text-foreground">Exploring my next engineering role</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Frontend-heavy · Full Stack · Immediate availability
          </p>
        </div>
        <div className="bg-card p-5">
          <p className="mb-2.5 font-mono text-2xs uppercase tracking-label text-subtle">Focus</p>
          <p className="text-base font-medium text-foreground">
            React, Next.js, TypeScript product engineering
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            Complex workflows, API integrations, AI-assisted development.
          </p>
        </div>
        <div className="col-span-full bg-card p-5">
          <p className="mb-2.5 font-mono text-2xs uppercase tracking-label text-subtle">Open to</p>
          <p className="text-sm text-muted-foreground">
            Frontend Engineer, Senior Frontend Engineer, Software Engineer, and frontend-heavy
            Full-Stack roles — remote-friendly.
          </p>
          <Link
            href="/#contact"
            className="group mt-4 inline-flex items-center gap-2 text-base font-medium transition-colors hover:text-foreground"
          >
            Get in touch <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </Bento>
    </Section>
  );
}
