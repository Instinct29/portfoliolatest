import Image from "next/image";
import { ArrowRight, Linkedin } from "lucide-react";
import Container from "@/components/layout/Container";
import AvatarHover from "@/components/AvatarHover";
import LocalTime from "@/components/LocalTime";
import Shimmer from "@/components/common/Shimmer";
import Label from "@/components/layout/Label";
import Bento from "@/components/layout/Bento";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { stats } from "@/lib/stats";
import { contactEmail, socialLinks } from "@/lib/siteLinks";

export default function About() {
  const linkedIn = socialLinks.find((s) => s.name === "LinkedIn");

  return (
    <header className="pt-12 pb-10 md:pt-16">
      <Container width="reading">
        <div className="space-y-5 sm:space-y-7">
          <div className="flex items-start gap-3.5">
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="group relative shrink-0 overflow-hidden rounded-2xl border border-border-strong shadow-md shadow-black/10 dark:shadow-lg dark:shadow-black/40">
                  <AvatarHover />
                  <Shimmer className="absolute inset-x-0 bottom-0 block">
                    <span className="pointer-events-none flex items-center justify-center gap-1 bg-black/65 py-px font-mono text-2xs font-medium uppercase tracking-label text-white backdrop-blur-[2px]">
                      <span className="h-1 w-1 rounded-full bg-emerald-400" />
                      <span aria-hidden>Open</span>
                      <span className="sr-only">Open to work</span>
                    </span>
                  </Shimmer>
                </div>
              </TooltipTrigger>
              <TooltipContent>Open to work</TooltipContent>
            </Tooltip>
            <div className="flex min-h-[4rem] flex-col justify-between">
              <div>
                <h1 className="text-2xl font-semibold leading-none tracking-tight text-foreground">
                  Manthan Gour
                </h1>
              </div>
              <div>
                <Label>Software Engineer · Frontend · Full Stack · AI</Label>
              </div>
              <LocalTime />
            </div>
          </div>

          <p className="text-[clamp(2rem,5vw,3rem)] font-semibold leading-[1.02] tracking-tighter text-foreground">
            I build product interfaces that make{" "}
            <span className="font-semibold text-foreground">complex systems feel simple</span>.
          </p>

          <p className="max-w-[56ch] text-lg text-muted-foreground">
            I&apos;m Manthan, a frontend-heavy software engineer with 4+ years of experience
            building production web products. I work primarily with React, Next.js and
            TypeScript, and I&apos;m comfortable moving across APIs and backend layers when the
            product needs it.
            {contactEmail ? (
              <>
                {" "}
                Reach me at{" "}
                <a href={`mailto:${contactEmail}`} className="text-foreground">
                  {contactEmail}
                </a>
                .
              </>
            ) : null}
          </p>

          <Bento className="grid-cols-2 sm:grid-cols-4">
            {stats.map((s) => (
              <div
                key={s.c}
                className="relative flex h-full flex-col bg-card px-4 py-3.5"
              >
                {s.orgs && s.orgs.length > 0 && (
                  <div className="absolute right-2 top-2 flex items-center sm:right-2.5 sm:top-2.5">
                    {s.orgs.map((org, i) => (
                      <Tooltip key={org.name}>
                        <TooltipTrigger asChild>
                          <span
                            className={`relative h-4 w-4 shrink-0 overflow-hidden rounded-full bg-secondary outline outline-1 outline-border ring-2 ring-card sm:h-5 sm:w-5 ${
                              i > 0 ? "-ml-1" : ""
                            }`}
                          >
                            <Image
                              src={org.img}
                              alt={org.name}
                              fill
                              sizes="(max-width: 640px) 16px, 20px"
                              className="object-cover grayscale opacity-80 transition-[filter] duration-base ease-out hover:grayscale-0"
                            />
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>{org.name}</TooltipContent>
                      </Tooltip>
                    ))}
                  </div>
                )}
                <div className="text-2xl font-semibold text-foreground">{s.n}</div>
                <div className="mt-1 text-xs text-muted-foreground">{s.c}</div>
              </div>
            ))}
          </Bento>

          <div className="flex flex-wrap items-center gap-3">
            <a
              href="/#experience"
              className="inline-flex items-center gap-2 rounded-md bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground transition-[color,background-color,transform] duration-150 ease-out hover:bg-accent-hover active:scale-[0.97]"
            >
              View selected work <ArrowRight className="h-4 w-4" />
            </a>
            {contactEmail ? (
              <a
                href={`mailto:${contactEmail}`}
                className="inline-flex items-center gap-2 rounded-md border border-border-strong px-5 py-2.5 text-sm font-semibold text-foreground transition-[color,background-color,transform] duration-150 ease-out hover:bg-elevated active:scale-[0.97]"
              >
                Get in touch
              </a>
            ) : linkedIn ? (
              <a
                href={linkedIn.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-md border border-border-strong px-5 py-2.5 text-sm font-semibold text-foreground transition-[color,background-color,transform] duration-150 ease-out hover:bg-elevated active:scale-[0.97]"
              >
                <Linkedin className="h-4 w-4" /> Connect on LinkedIn
              </a>
            ) : null}
          </div>
        </div>
      </Container>
    </header>
  );
}
