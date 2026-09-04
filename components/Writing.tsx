import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import Section from "@/components/layout/Section";

const articles = [
  {
    id: "react-charts-comparison",
    title: "Performance Based React Charts Comparison",
    subtitle: "ApexCharts vs ReCharts vs HighCharts",
    description:
      "A technical comparison of three major React charting libraries across render performance, bundle size, and developer experience — with benchmarks to back the decision.",
    source: "Medium",
    publication: "HashTrust Technologies",
    href: "https://medium.com/@Hashtrust_Technologies/performance-based-react-charts-comparison-apexcharts-v-s-recharts-v-s-highcharts-e7159af14c28",
    tags: ["React", "Performance", "Dataviz"],
  },
];

export default function Writing() {
  return (
    <Section
      id="writing"
      number="04"
      label="Writing"
      title="What I write"
      width="reading"
    >
      <div className=" gap-2.5 sm:grid-cols-2">
        {articles.map((a) => (
          <Link
            key={a.id}
            href={a.href}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-col gap-3 rounded-lg border border-border bg-card p-4 transition-colors duration-base ease-out hover:border-border-strong"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-sm font-medium leading-snug text-foreground">
                  {a.title}
                </p>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {a.subtitle}
                </p>
              </div>
              <ArrowUpRight className="mt-0.5 h-4 w-4 shrink-0 text-subtle transition-colors group-hover:text-foreground" />
            </div>

            <p className="text-xs leading-relaxed text-muted-foreground">
              {a.description}
            </p>

            <div className="mt-auto flex items-center gap-2">
              <span className="flex items-center gap-1.5 rounded-sm border border-border px-1.5 py-0.5 font-mono text-2xs uppercase tracking-label text-muted-foreground">
                <svg viewBox="0 0 1043.63 592.71" className="h-2.5 w-2.5 shrink-0 fill-current" aria-hidden="true">
                  <path d="M588.67 296.36c0 163.67-131.78 296.35-294.33 296.35S0 460 0 296.36 131.78 0 294.34 0s294.33 132.69 294.33 296.36M911.56 296.36c0 154.06-65.89 279-147.17 279s-147.17-124.94-147.17-279 65.88-279 147.16-279 147.17 124.9 147.17 279M1043.63 296.36c0 138-23.17 249.94-51.76 249.94s-51.75-111.91-51.75-249.94 23.17-249.94 51.75-249.94 51.76 111.9 51.76 249.94" />
                </svg>
                {a.source}
              </span>
              <span className="text-2xs text-subtle">{a.publication}</span>
              <span className="ml-auto flex gap-1.5">
                {a.tags.map((t) => (
                  <span
                    key={t}
                    className="font-mono text-2xs text-subtle"
                  >
                    {t}
                  </span>
                ))}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </Section>
  );
}
