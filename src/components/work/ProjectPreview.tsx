"use client";

import { ArrowUpRight } from "lucide-react";
import type { Project } from "@/types";

interface ProjectPreviewProps {
  project: Project;
}

export function ProjectPreview({ project }: ProjectPreviewProps) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-border bg-muted/30">
      <div className="flex items-center gap-2 border-b border-border bg-card/50 px-4 py-2.5">
        <div className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-border" />
          <span className="h-2.5 w-2.5 rounded-full bg-border" />
          <span className="h-2.5 w-2.5 rounded-full bg-border" />
        </div>
        <span className="ml-2 font-mono text-[10px] text-muted-foreground">
          {project.slug}.app
        </span>
      </div>

      <div className="p-6">
        <div
          className="mb-4 h-1 w-12 rounded-full"
          style={{ backgroundColor: project.accent }}
        />
        <div className="space-y-3">
          <div className="h-3 w-3/4 rounded bg-border/60" />
          <div className="h-3 w-1/2 rounded bg-border/40" />
          <div className="mt-6 grid grid-cols-2 gap-3">
            <div className="h-16 rounded-lg border border-border/50 bg-card/50 p-3">
              <div className="h-2 w-2/3 rounded bg-border/60" />
              <div className="mt-2 h-2 w-1/2 rounded bg-border/40" />
            </div>
            <div className="h-16 rounded-lg border border-border/50 bg-card/50 p-3">
              <div className="h-2 w-2/3 rounded bg-border/60" />
              <div className="mt-2 h-2 w-1/2 rounded bg-border/40" />
            </div>
          </div>
          <div className="flex items-center justify-between pt-2">
            <span className="font-mono text-[10px] text-muted-foreground">
              Conceptual preview
            </span>
            {project.links?.live && (
              <ArrowUpRight className="h-3 w-3 text-muted-foreground" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
