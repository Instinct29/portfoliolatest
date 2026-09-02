import { organizations } from "@/lib/workData";
import { formatPeriod, formatTenure, isCurrent } from "@/lib/tenure";
import { baseUrl } from "@/app/sitemap";
import { markdownResponse } from "@/lib/markdownResponse";
import { stats } from "@/lib/stats";
import { socialLinks } from "@/lib/siteLinks";

export const dynamic = "force-static";

export function GET() {
  return markdownResponse(composeHomepageMarkdown());
}

function composeHomepageMarkdown(): string {
  const lines: string[] = [];

  lines.push("# Manthan Gour, Software Engineer");
  lines.push("");
  lines.push(
    "> Frontend-heavy software engineer with 4+ years shipping production web products in React, Next.js and TypeScript.",
  );
  lines.push("");

  lines.push("## At a glance");
  lines.push("");
  for (const s of stats) {
    lines.push(`- **${s.n}** ${s.c}`);
  }
  lines.push("");

  const current = organizations.find((o) => isCurrent(o.period));
  if (current) {
    lines.push("## Currently");
    lines.push("");
    lines.push(`**${current.name}**: ${current.role} (${formatPeriod(current.period)})`);
    lines.push("");
    lines.push(current.description);
    lines.push("");
  }

  lines.push("## Experience");
  lines.push("");
  for (const org of organizations) {
    lines.push(`### ${org.name}`);
    lines.push(
      `*${org.role}* · ${formatPeriod(org.period)} · ${formatTenure(org.period)}`,
    );
    lines.push("");
    lines.push(org.description);
    lines.push("");
    if (org.highlights.length > 0) {
      for (const h of org.highlights) lines.push(`- ${h}`);
      lines.push("");
    }
    lines.push(`Full overview: ${baseUrl}work/${org.slug}`);
    lines.push("");
  }

  lines.push("## Explore");
  lines.push("");
  lines.push(`- Side projects: ${baseUrl}projects`);
  lines.push(`- CV: ${baseUrl}cv`);
  lines.push("");

  lines.push("## Contact");
  lines.push("");
  for (const s of socialLinks) {
    lines.push(`- ${s.name}: ${s.href}`);
  }
  lines.push(`- Site: ${baseUrl}`);
  lines.push("");

  return lines.join("\n");
}
