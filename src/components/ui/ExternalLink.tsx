import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { cn, withBasePath } from "@/lib/utils";

interface ExternalLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  showIcon?: boolean;
}

export function ExternalLink({ href, children, className, showIcon = true }: ExternalLinkProps) {
  const isExternal = href.startsWith("http") || href.endsWith(".pdf");

  const classes = cn("link-underline focus-ring group", className);

  if (isExternal) {
    const resolvedHref = href.endsWith(".pdf") ? withBasePath(href) : href;
    return (
      <a
        href={resolvedHref}
        target="_blank"
        rel="noopener noreferrer"
        className={classes}
      >
        {children}
        {showIcon && (
          <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        )}
      </a>
    );
  }

  return (
    <Link href={withBasePath(href)} className={classes}>
      {children}
    </Link>
  );
}
