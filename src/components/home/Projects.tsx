import { sideProjects } from "@/data/side-projects";
import { Tag } from "@/components/ui/Tag";
import { ExternalLink } from "@/components/ui/ExternalLink";
import { Stagger, StaggerItem } from "@/components/ui/Reveal";
import { Section } from "@/components/layout/Section";

export function Projects() {
  return (
    <Section
      id="side-projects"
      number="03"
      title="Projects"
      description="Open-source experiments and side engineering work."
    >
      <Stagger className="grid gap-4 sm:grid-cols-2" staggerDelay={0.08}>
        {sideProjects.map((project) => (
          <StaggerItem key={project.name}>
            <article className="flex h-full flex-col rounded-xl border border-border bg-card p-5 transition-colors hover:border-accent/20">
              <h3 className="font-medium">{project.name}</h3>
              <p className="mt-2 flex-1 text-sm text-muted-foreground">{project.description}</p>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {project.stack.map((tech) => (
                  <Tag key={tech}>{tech}</Tag>
                ))}
              </div>
              <div className="mt-4 flex gap-4 text-sm">
                <ExternalLink href={project.github}>GitHub</ExternalLink>
                {project.live && <ExternalLink href={project.live}>Live</ExternalLink>}
              </div>
            </article>
          </StaggerItem>
        ))}
      </Stagger>
    </Section>
  );
}
