import { cn } from "@/lib/utils";

interface TagProps {
  children: React.ReactNode;
  className?: string;
}

export function Tag({ children, className }: TagProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border border-border bg-muted/50 px-2.5 py-0.5 font-mono text-xs text-muted-foreground",
        className,
      )}
    >
      {children}
    </span>
  );
}
