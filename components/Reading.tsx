import Image from "next/image";
import Section from "@/components/layout/Section";

const books = [
 
  {
    id: "freedom-from-known",
    title: "Freedom from the Known",
    year: "1969",
    note: "Breaking free from psychological patterns and the past.",
    cover: "https://covers.openlibrary.org/b/isbn/0060648082-M.jpg",
  },
  {
    id: "think-on-these-things",
    title: "Think on These Things",
    year: "1964",
    note: "Questions for young minds — and everyone who stayed curious.",
    cover: "https://covers.openlibrary.org/b/isbn/0060916095-M.jpg",
  },
  {
    id: "awakening-intelligence",
    title: "The Awakening of Intelligence",
    year: "1973",
    note: "Dialogues on insight, thought, and what lies beyond it.",
    cover: "https://covers.openlibrary.org/b/isbn/0060648341-M.jpg",
  },
  {
    id: "krishnamurti-notebook",
    title: "Krishnamurti's Notebook",
    year: "1976",
    note: "A private journal of perception, nature, and the sacred.",
    cover: "https://covers.openlibrary.org/b/isbn/1570628955-M.jpg",
  },
  {
    id: "education-significance",
    title: "Education and the Significance of Life",
    year: "1953",
    note: "What it means to truly educate, not just train.",
    cover: "https://covers.openlibrary.org/b/isbn/0060648767-M.jpg",
  },
];

export default function Reading() {
  return (
    <Section
      id="reading"
      number="05"
      label="Reading"
      title="What I read"
      width="reading"
    >
      <p className="mb-6 max-w-md text-sm text-muted-foreground">
        Books I return to. Jiddu Krishnamurti — on attention, freedom, and the
        examined life.
      </p>
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
        {books.map((b) => (
          <div
            key={b.id}
            className="flex flex-col gap-2 rounded-lg border border-border bg-card p-3.5"
          >
            <div className="flex items-start gap-3">
              <div className="group/orglink relative h-16 w-11 shrink-0 overflow-hidden rounded-sm bg-elevated ">
                <Image
                  src={b.cover}
                  alt={b.title}
                  fill
                  sizes="44px"
                  className="object-cover grayscale transition-[filter] duration-base ease-out group-hover/orglink:grayscale-0"
                  unoptimized
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium leading-snug text-foreground">
                  {b.title}
                </p>
                <p className="mt-1 font-mono text-2xs text-subtle">{b.year}</p>
              </div>
            </div>
            <p className="text-xs leading-relaxed text-muted-foreground">
              {b.note}
            </p>
          </div>
        ))}
      </div>
    </Section>
  );
}
