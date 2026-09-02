"use client";

import { Command } from "cmdk";
import { ArrowUpRight, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { commandItems } from "@/data/navigation";
import { cn, withBasePath } from "@/lib/utils";

export function CommandMenu() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const handleSelect = useCallback(
    (href: string, external?: boolean) => {
      setOpen(false);
      if (external || href.startsWith("http") || href.endsWith(".pdf")) {
        window.open(href.startsWith("http") ? href : withBasePath(href), "_blank");
        return;
      }
      if (href.startsWith("/#")) {
        const el = document.querySelector(href.slice(1));
        el?.scrollIntoView({ behavior: "smooth" });
        return;
      }
      router.push(withBasePath(href));
    },
    [router],
  );

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="focus-ring hidden items-center gap-2 rounded-lg border border-border px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground sm:flex"
        aria-label="Open command menu"
      >
        <Search className="h-3.5 w-3.5" />
        <span className="hidden lg:inline">Search</span>
        <kbd className="hidden rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px] lg:inline">
          ⌘K
        </kbd>
      </button>

      {open && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[20vh]">
          <div
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <Command
            className="relative z-10 w-full max-w-lg overflow-hidden rounded-xl border border-border bg-card shadow-2xl"
            label="Command menu"
          >
            <div className="flex items-center gap-2 border-b border-border px-4">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Command.Input
                placeholder="Navigate to..."
                className="flex h-12 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                autoFocus
              />
            </div>
            <Command.List className="max-h-72 overflow-y-auto p-2">
              <Command.Empty className="px-4 py-8 text-center text-sm text-muted-foreground">
                No results found.
              </Command.Empty>
              <Command.Group heading="Navigation" className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground">
                {commandItems.map((item) => (
                  <Command.Item
                    key={item.label}
                    value={item.label}
                    onSelect={() => handleSelect(item.href, item.external)}
                    className={cn(
                      "flex cursor-pointer items-center justify-between rounded-lg px-3 py-2.5 text-sm",
                      "aria-selected:bg-muted",
                    )}
                  >
                    {item.label}
                    {item.external && <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground" />}
                  </Command.Item>
                ))}
              </Command.Group>
            </Command.List>
          </Command>
        </div>
      )}
    </>
  );
}
