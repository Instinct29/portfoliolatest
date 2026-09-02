import type { CaseStudy } from "@/types";
import { Tag } from "@/components/ui/Tag";
import { ExternalLink } from "@/components/ui/ExternalLink";

interface CaseStudyHeroProps {
  study: CaseStudy;
}

export function CaseStudyHero({ study }: CaseStudyHeroProps) {
  return (
    <header className="border-b border-border pb-12 pt-32 md:pb-16 md:pt-40">
      <p className="font-mono text-sm text-muted-foreground">{study.context}</p>
      <h1 className="mt-4 text-4xl font-semibold tracking-tight md:text-5xl">{study.name}</h1>
      <p className="mt-4 max-w-2xl text-lg text-muted-foreground">{study.summary}</p>

      <div className="mt-8 flex flex-wrap gap-6 text-sm">
        <div>
          <p className="font-mono text-xs text-muted-foreground">Role</p>
          <p className="mt-1 font-medium">{study.role}</p>
        </div>
        {study.period && (
          <div>
            <p className="font-mono text-xs text-muted-foreground">Timeline</p>
            <p className="mt-1 font-medium">{study.period}</p>
          </div>
        )}
        {study.links?.live && (
          <div>
            <p className="font-mono text-xs text-muted-foreground">Live</p>
            <ExternalLink href={study.links.live} className="mt-1">
              Visit site
            </ExternalLink>
          </div>
        )}
      </div>

      <div className="mt-6 flex flex-wrap gap-1.5">
        {study.technologies.map((tech) => (
          <Tag key={tech}>{tech}</Tag>
        ))}
      </div>
    </header>
  );
}
