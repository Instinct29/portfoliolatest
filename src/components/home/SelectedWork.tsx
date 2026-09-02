"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { featuredProjects } from "@/data/projects";
import { Tag } from "@/components/ui/Tag";
import { Stagger, StaggerItem } from "@/components/ui/Reveal";
import { Section } from "@/components/layout/Section";
import { ProjectPreview } from "@/components/work/ProjectPreview";
import { withBasePath } from "@/lib/utils";

export function SelectedWork() {
  return (
    <Section
      id="projects"
      number="02"
      title="Selected Work"
      description="Product engineering stories—from loan origination platforms to AI interfaces and property discovery."
    >
      <Stagger className="grid gap-8 md:gap-12" staggerDelay={0.1}>
        {featuredProjects.map((project, index) => (
          <StaggerItem key={project.slug}>
            <Link
              href={withBasePath(`/work/${project.slug}`)}
              className="focus-ring group block rounded-2xl"
            >
              <article
                className={`grid items-center gap-8 rounded-2xl border border-border bg-card p-6 transition-all duration-300 hover:border-accent/30 hover:shadow-lg md:grid-cols-2 md:gap-12 md:p-8 ${
                  index % 2 === 1 ? "md:[&>*:first-child]:order-2" : ""
                }`}
              >
                <div>
                  <p className="font-mono text-xs text-muted-foreground">{project.context}</p>
                  <h3 className="mt-2 text-2xl font-semibold tracking-tight transition-colors group-hover:text-accent">
                    {project.name}
                  </h3>
                  <p className="mt-3 text-muted-foreground">{project.summary}</p>

                  <p className="mt-4 text-sm">
                    <span className="text-muted-foreground">Role · </span>
                    {project.role}
                  </p>

                  <ul className="mt-4 space-y-2">
                    {project.contributions.map((item) => (
                      <li
                        key={item}
                        className="flex items-start gap-2 text-sm text-muted-foreground"
                      >
                        <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-accent" />
                        {item}
                      </li>
                    ))}
                  </ul>

                  <div className="mt-5 flex flex-wrap gap-1.5">
                    {project.technologies.slice(0, 5).map((tech) => (
                      <Tag key={tech}>{tech}</Tag>
                    ))}
                  </div>

                  <span className="mt-6 inline-flex items-center gap-1 text-sm font-medium text-accent transition-all group-hover:gap-2">
                    View case study
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </div>

                <ProjectPreview project={project} />
              </article>
            </Link>
          </StaggerItem>
        ))}
      </Stagger>
    </Section>
  );
}
