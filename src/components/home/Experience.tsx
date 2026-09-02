import { experiences } from "@/data/experience";
import { Tag } from "@/components/ui/Tag";
import { Stagger, StaggerItem } from "@/components/ui/Reveal";
import { Section } from "@/components/layout/Section";

export function Experience() {
  return (
    <Section
      id="experience"
      number="01"
      title="Experience"
      description="Production engineering across fintech workflows, AI product interfaces, and full-stack application development."
    >
      <Stagger className="space-y-16" staggerDelay={0.12}>
        {experiences.map((exp) => (
          <StaggerItem key={exp.id}>
            <article className="group">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between">
                <div>
                  <h3 className="text-xl font-semibold tracking-tight">{exp.company}</h3>
                  <p className="mt-1 text-muted-foreground">{exp.role}</p>
                </div>
                <div className="font-mono text-sm text-muted-foreground">
                  <p>{exp.period}</p>
                  <p>{exp.location}</p>
                </div>
              </div>

              <p className="mt-4 max-w-3xl text-muted-foreground">{exp.summary}</p>

              <div className="mt-8 space-y-6">
                {exp.highlights.map((highlight) => (
                  <div
                    key={highlight.title}
                    className="rounded-xl border border-border bg-card p-5 transition-colors group-hover:border-border/80"
                  >
                    <h4 className="font-medium">{highlight.title}</h4>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {highlight.description}
                    </p>
                    {highlight.technologies && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {highlight.technologies.map((tech) => (
                          <Tag key={tech}>{tech}</Tag>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </article>
          </StaggerItem>
        ))}
      </Stagger>
    </Section>
  );
}
