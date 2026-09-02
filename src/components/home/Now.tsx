import { profile } from "@/data/profile";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/layout/Section";

const nowItems = [
  {
    label: "Currently",
    value: "Exploring senior frontend / frontend-heavy full-stack opportunities",
  },
  { label: "Location", value: profile.location },
  { label: "Work preference", value: profile.workPreference },
  { label: "Availability", value: profile.availability },
];

export function Now() {
  return (
    <Section id="now" number="06" title="Now">
      <Reveal>
        <dl className="grid gap-6 sm:grid-cols-2">
          {nowItems.map((item) => (
            <div key={item.label} className="border-l-2 border-accent/30 pl-4">
              <dt className="font-mono text-xs text-muted-foreground">{item.label}</dt>
              <dd className="mt-1 text-sm font-medium">{item.value}</dd>
            </div>
          ))}
        </dl>
      </Reveal>
    </Section>
  );
}
