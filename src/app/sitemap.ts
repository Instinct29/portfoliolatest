import type { MetadataRoute } from "next";
import { profile } from "@/data/profile";
import { projects } from "@/data/projects";

export const dynamic = "force-static";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? profile.siteUrl;
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "/portfoliolatest";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = `${siteUrl}${basePath}`;

  return [
    {
      url: `${base}/`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
    ...projects.map((project) => ({
      url: `${base}/work/${project.slug}/`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}
