import type { CaseStudy } from "@/types";

interface ProjectMetaProps {
  study: CaseStudy;
}

export function ProjectMeta({ study }: ProjectMetaProps) {
  return (
    <aside className="space-y-6">
      <div>
        <p className="font-mono text-xs text-muted-foreground">Role</p>
        <p className="mt-1 text-sm font-medium">{study.role}</p>
      </div>
      {study.period && (
        <div>
          <p className="font-mono text-xs text-muted-foreground">Timeline</p>
          <p className="mt-1 text-sm font-medium">{study.period}</p>
        </div>
      )}
      <div>
        <p className="font-mono text-xs text-muted-foreground">Stack</p>
        <ul className="mt-2 space-y-1">
          {study.technologies.map((tech) => (
            <li key={tech} className="text-sm">
              {tech}
            </li>
          ))}
        </ul>
      </div>
      <div>
        <p className="font-mono text-xs text-muted-foreground">Responsibilities</p>
        <ul className="mt-2 space-y-2">
          {study.myRole.slice(0, 4).map((item) => (
            <li key={item} className="text-sm text-muted-foreground">
              {item}
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
