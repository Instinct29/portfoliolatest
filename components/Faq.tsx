import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Section from "@/components/layout/Section";
import { faqLd } from "@/lib/seo";
import { contactEmail, socialLinks } from "@/lib/siteLinks";

const linkedIn = socialLinks.find((s) => s.name === "LinkedIn")?.href ?? "";

const faqs = [
  {
    q: "Are you available for new work?",
    a: "Yes. I'm currently open to frontend, software engineering and frontend-heavy full-stack opportunities and can join immediately.",
  },
  {
    q: "What's your core stack?",
    a: "React, Next.js, TypeScript and JavaScript on the frontend, with Node.js, APIs, PostgreSQL and related backend experience.",
  },
  {
    q: "Do you work remotely?",
    a: "Yes. Remote is preferred, and I'm also open to appropriate opportunities in India.",
  },
  {
    q: "What kind of roles are you looking for?",
    a: "Frontend Engineer, Senior Frontend Engineer, Software Engineer and frontend-heavy Full-Stack roles.",
  },
  {
    q: "How do we get started?",
    a: contactEmail
      ? `Email ${contactEmail} with a short note about your project or role.`
      : `Connect on LinkedIn (${linkedIn}) with a short note about your project or role.`,
  },
];

export default function Faq() {
  return (
    <Section id="faq" number="05" label="FAQ" title="Questions, answered" width="reading">
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd(faqs)) }}
      />
      <Accordion type="single" collapsible defaultValue="faq-0" className="overflow-hidden rounded-2xl border border-border">
        {faqs.map((f, i) => (
          <AccordionItem key={f.q} value={`faq-${i}`} className="border-b border-border px-5 last:border-b-0">
            <AccordionTrigger className="py-4 text-left text-base font-medium text-foreground">
              {f.q}
            </AccordionTrigger>
            <AccordionContent className="pb-4 text-sm leading-relaxed text-muted-foreground">
              {f.a}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </Section>
  );
}
