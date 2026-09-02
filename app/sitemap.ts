import { getAllSideProjects } from "@/lib/projectsData";
import { organizations } from "@/lib/workData";

export const baseUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.endsWith("/")
    ? process.env.NEXT_PUBLIC_SITE_URL
    : `${process.env.NEXT_PUBLIC_SITE_URL ?? "https://portfoliolatest.vercel.app"}/`;

export default async function sitemap() {
  const today = new Date().toISOString().split("T")[0];

  const routes = [
    { url: `${baseUrl}`, lastModified: today },
    { url: `${baseUrl}projects`, lastModified: today },
    { url: `${baseUrl}cv`, lastModified: today },
  ];

  const projects = getAllSideProjects().map((p) => ({
    url: `${baseUrl}project/${p.slug}`,
    lastModified: today,
  }));

  const workOrgs = organizations.map((o) => ({
    url: `${baseUrl}work/${o.slug}`,
    lastModified: today,
  }));

  const workProjects = organizations.flatMap((o) =>
    o.projects.map((p) => ({
      url: `${baseUrl}work/${o.slug}/${p.slug}`,
      lastModified: today,
    })),
  );

  return routes.concat(projects, workOrgs, workProjects);
}
