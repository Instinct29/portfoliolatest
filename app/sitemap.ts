import { getAllSideProjects } from "@/lib/projectsData";
import { organizations } from "@/lib/workData";

const DEFAULT_SITE_URL = "https://portfoliolatest.vercel.app";

function resolveBaseUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (raw) {
    try {
      const parsed = new URL(raw.startsWith("http") ? raw : `https://${raw}`);
      if (parsed.protocol === "http:" || parsed.protocol === "https:") {
        return `${parsed.origin}/`;
      }
    } catch {
      // Fall through to default when env is "/", "localhost", or otherwise invalid.
    }
  }
  return `${DEFAULT_SITE_URL}/`;
}

export const baseUrl = resolveBaseUrl();

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
