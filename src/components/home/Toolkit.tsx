import { aiPositioning, skillCategories } from "@/data/skills";
import { Stagger, StaggerItem } from "@/components/ui/Reveal";
import { Section } from "@/components/layout/Section";

export function Toolkit() {
  return (
    <Section
      id="toolkit"
      number="04"
      title="Toolkit"
      description="Technologies organized by purpose—not a logo wall."
    >
      <Stagger className="grid gap-8 sm:grid-cols-2" staggerDelay={0.06}>
        {skillCategories.map((category) => (
          <StaggerItem key={category.name}>
            <div>
              <h3 className="font-mono text-xs font-medium tracking-wider text-muted-foreground uppercase">
                {category.name}
              </h3>
              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2">
                {category.items.map((item) => (
                  <span key={item} className="text-sm">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </StaggerItem>
        ))}
      </Stagger>

      <div className="mt-16 rounded-xl border border-border bg-card p-6 md:p-8">
        <h3 className="font-mono text-xs font-medium tracking-wider text-muted-foreground uppercase">
          AI-assisted Engineering
        </h3>
        <p className="mt-4 max-w-3xl text-sm leading-relaxed text-muted-foreground">
          I use{" "}
          <span className="text-foreground">{aiPositioning.tools.join(", ")}</span> for{" "}
          {aiPositioning.uses.join(", ").toLowerCase()}. Generated work is always validated
          through {aiPositioning.validation.join(", ").toLowerCase()}.
        </p>
        <p className="mt-3 text-sm font-medium text-accent">
          AI-assisted engineer, not AI-dependent engineer.
        </p>
      </div>
    </Section>
  );
}
