"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { availabilityStatus } from "@/data/profile";
import { navItems } from "@/data/navigation";
import { CommandMenu } from "@/components/ui/CommandMenu";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { cn, withBasePath } from "@/lib/utils";
import { Container } from "./Container";

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-all duration-300",
          scrolled
            ? "border-b border-border/80 bg-background/80 backdrop-blur-lg"
            : "bg-transparent",
        )}
      >
        <Container as="div" className="flex h-16 items-center justify-between">
          <Link
            href={withBasePath("/")}
            className="focus-ring group flex items-center gap-2 rounded-lg"
          >
            <span className="font-mono text-sm font-semibold tracking-tight">MG</span>
            <span className="hidden text-sm text-muted-foreground transition-colors group-hover:text-foreground sm:inline">
              Manthan
            </span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex" aria-label="Main navigation">
            {navItems.map((item) => (
              <NavLink key={item.label} item={item} />
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <div className="hidden items-center gap-2 lg:flex">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-40" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
              </span>
              <span className="text-xs text-muted-foreground">Available</span>
            </div>
            <CommandMenu />
            <ThemeToggle />
            <button
              className="focus-ring flex h-9 w-9 items-center justify-center rounded-lg border border-border md:hidden"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </Container>
      </header>

      {/* Mobile navigation overlay */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-background/95 backdrop-blur-lg transition-all duration-300 md:hidden",
          mobileOpen ? "visible opacity-100" : "invisible opacity-0",
        )}
        aria-hidden={!mobileOpen}
      >
        <nav
          className="flex h-full flex-col justify-center px-8"
          aria-label="Mobile navigation"
        >
          <div className="mb-8 flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
            </span>
            <span className="text-sm text-muted-foreground">
              {availabilityStatus.primary}
            </span>
          </div>
          {navItems.map((item, i) => (
            <Link
              key={item.label}
              href={item.external ? item.href : withBasePath(item.href)}
              target={item.external ? "_blank" : undefined}
              rel={item.external ? "noopener noreferrer" : undefined}
              onClick={() => setMobileOpen(false)}
              className="focus-ring border-b border-border py-4 text-2xl font-medium tracking-tight transition-colors hover:text-accent"
              style={{ transitionDelay: mobileOpen ? `${i * 50}ms` : "0ms" }}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </>
  );
}

function NavLink({ item }: { item: (typeof navItems)[0] }) {
  if (item.external) {
    return (
      <a
        href={item.href}
        target="_blank"
        rel="noopener noreferrer"
        className="focus-ring rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        {item.label}
      </a>
    );
  }

  return (
    <a
      href={item.href}
      className="focus-ring rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
    >
      {item.label}
    </a>
  );
}
