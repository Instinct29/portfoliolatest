import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getAllWorkProjects } from "@/lib/workData";
import { sideProjects } from "@/lib/projectsData";
import { sideProjectToCard, workProjectToCard } from "@/lib/projectCards";
import ProjectPreviewCard from "./ProjectPreviewCard";
import Section from "@/components/layout/Section";

export default function Projects() {
  const work = getAllWorkProjects();
  const all = [
    ...work.map(({ org, project }) => workProjectToCard(org.slug, project)),
    ...sideProjects.map((p) => sideProjectToCard(p)),
  ];

  return (
    <Section
      id="projects"
      number="02"
      label="Projects"
      title="Everything I've shipped"
      width="reading"
      action={
        <Link href="/projects" className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground">
          View all <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      }
    >
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        {all.map((p) => (
          <ProjectPreviewCard key={p.id} project={p} />
        ))}
      </div>
    </Section>
  );
}
