import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getAdjacentProjects,
  getCaseStudy,
  projects,
} from "@/data/projects";
import { CaseStudyHero } from "@/components/work/CaseStudyHero";
import { CaseStudySection } from "@/components/work/CaseStudySection";
import { FlowDiagram, LayerDiagram } from "@/components/work/ArchitectureDiagram";
import { ProjectNavigation } from "@/components/work/ProjectNavigation";
import { ProjectMeta } from "@/components/work/ProjectMeta";
import { ReadingProgress } from "@/components/work/ReadingProgress";
import { Container } from "@/components/layout/Container";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const study = getCaseStudy(slug);
  if (!study) return {};

  return {
    title: `${study.name} — Case Study`,
    description: study.summary,
  };
}

export default async function CaseStudyPage({ params }: PageProps) {
  const { slug } = await params;
  const study = getCaseStudy(slug);

  if (!study) {
    notFound();
  }

  const { prev, next } = getAdjacentProjects(slug);

  return (
    <>
      <ReadingProgress />
      <Container>
        <article>
          <CaseStudyHero study={study} />

          <div className="grid gap-12 lg:grid-cols-[1fr_280px] lg:gap-16">
            <div>
              <CaseStudySection title="Problem">
                <p className="leading-relaxed text-muted-foreground">{study.problem}</p>
              </CaseStudySection>

              <CaseStudySection title="My Role">
                <ul className="space-y-3">
                  {study.myRole.map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-3 text-muted-foreground"
                    >
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                      <span className="leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </CaseStudySection>

              <CaseStudySection title="Engineering Challenges">
                <ul className="space-y-3">
                  {study.challenges.map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-3 text-muted-foreground"
                    >
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                      <span className="leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </CaseStudySection>

              <CaseStudySection title="Architecture & Implementation">
                <ul className="mb-8 space-y-2">
                  {study.architecture.map((item) => (
                    <li key={item} className="text-sm text-muted-foreground">
                      · {item}
                    </li>
                  ))}
                </ul>
                <div className="grid gap-6 md:grid-cols-2">
                  {study.diagramSteps && (
                    <FlowDiagram steps={study.diagramSteps} title="Data Flow" />
                  )}
                  {study.architectureLayers && (
                    <LayerDiagram layers={study.architectureLayers} title="System Layers" />
                  )}
                </div>
              </CaseStudySection>

              <CaseStudySection title="Selected Features">
                <ul className="grid gap-3 sm:grid-cols-2">
                  {study.features.map((feature) => (
                    <li
                      key={feature}
                      className="rounded-lg border border-border bg-card px-4 py-3 text-sm"
                    >
                      {feature}
                    </li>
                  ))}
                </ul>
              </CaseStudySection>

              <CaseStudySection title="Decisions & Tradeoffs">
                <ul className="space-y-3">
                  {study.decisions.map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-3 text-muted-foreground"
                    >
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                      <span className="leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </CaseStudySection>

              <CaseStudySection title="What I Learned">
                <ul className="space-y-3">
                  {study.learnings.map((item) => (
                    <li
                      key={item}
                      className="leading-relaxed text-muted-foreground"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </CaseStudySection>
            </div>

            <div className="hidden lg:block">
              <div className="sticky top-28">
                <ProjectMeta study={study} />
              </div>
            </div>
          </div>

          <ProjectNavigation prev={prev} next={next} />
        </article>
      </Container>
    </>
  );
}
