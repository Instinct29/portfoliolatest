import { ArrowLeft, ArrowRight } from "lucide-react";
import Link from "next/link";
import type { Project } from "@/types";
import { withBasePath } from "@/lib/utils";

interface ProjectNavigationProps {
  prev: Project | null;
  next: Project | null;
}

export function ProjectNavigation({ prev, next }: ProjectNavigationProps) {
  return (
    <nav
      className="flex items-center justify-between border-t border-border py-10"
      aria-label="Project navigation"
    >
      {prev ? (
        <Link
          href={withBasePath(`/work/${prev.slug}`)}
          className="focus-ring group flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          <div>
            <p className="font-mono text-xs">Previous</p>
            <p className="font-medium text-foreground">{prev.name}</p>
          </div>
        </Link>
      ) : (
        <div />
      )}
      {next ? (
        <Link
          href={withBasePath(`/work/${next.slug}`)}
          className="focus-ring group flex items-center gap-2 text-right text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <div>
            <p className="font-mono text-xs">Next</p>
            <p className="font-medium text-foreground">{next.name}</p>
          </div>
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Link>
      ) : (
        <div />
      )}
    </nav>
  );
}
