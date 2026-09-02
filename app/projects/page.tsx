import { sideProjects } from "@/lib/projectsData";
import { getAllWorkProjects } from "@/lib/workData";
import { baseUrl } from "@/app/sitemap";
import Container from "@/components/layout/Container";
import Label from "@/components/layout/Label";
import ProjectsIndex from "@/components/ProjectsIndex";
import ProjectPreviewCard from "@/components/ProjectPreviewCard";
import { workProjectToCard } from "@/lib/projectCards";
import { ogUrl } from "@/lib/seo";

export const metadata = {
  title: "Projects",
  description: "Production work and personal projects I've shipped.",
  alternates: { canonical: `${baseUrl}projects` },
  openGraph: {
    title: "Projects",
    description: "Production work and personal projects I've shipped.",
    images: [{ url: ogUrl({ title: "Projects", subtitle: "Things I've built", type: "generic", label: "Work" }) }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Projects",
    description: "Production work and personal projects I've shipped.",
    images: [ogUrl({ title: "Projects", subtitle: "Things I've built", type: "generic", label: "Work" })],
  },
};

export default function ProjectsPage() {
  const work = getAllWorkProjects();

  return (
    <main className="py-8 md:py-12">
      <Container width="reading" className="space-y-10">
        <div className="space-y-2">
          <Label>Projects</Label>
          <h1 className="text-[clamp(2rem,5vw,2.75rem)] font-medium tracking-[-0.02em]">
            Everything I&apos;ve shipped
          </h1>
        </div>

        <section className="space-y-4">
          <h2 className="font-mono text-2xs uppercase tracking-label text-subtle">
            Production work
          </h2>
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            {work.map(({ org, project }) => (
              <ProjectPreviewCard
                key={project.id}
                project={workProjectToCard(org.slug, project)}
              />
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="font-mono text-2xs uppercase tracking-label text-subtle">
            Side projects
          </h2>
          <ProjectsIndex projects={sideProjects} />
        </section>
      </Container>
    </main>
  );
}
