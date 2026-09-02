import { profile } from "@/data/profile";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/layout/Section";

export function About() {
  return (
    <Section id="about" number="05" title="About">
      <Reveal>
        <div className="max-w-3xl space-y-6 text-lg leading-relaxed text-muted-foreground">
          <p>
            I&apos;m a frontend-heavy software engineer based in{" "}
            <span className="text-foreground">{profile.location}</span>, with 4+ years
            building production web products.
          </p>
          <p>
            My strongest areas are product-oriented frontend engineering—React, Next.js,
            TypeScript—and the kind of complex application workflows that require careful state
            management, API integrations, and scalable reusable interfaces.
          </p>
          <p>
            I&apos;ve shipped loan origination platforms, AI product interfaces, property
            discovery experiences, and digital service workflows. When a product needs backend
            work, I&apos;m comfortable across Node.js and API layers too.
          </p>
          <p>
            I care about the details that make software feel considered: typography, loading
            states, error handling, and the small interactions that signal craft.
          </p>
        </div>
      </Reveal>
    </Section>
  );
}
