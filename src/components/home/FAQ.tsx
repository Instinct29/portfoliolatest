"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { faqItems } from "@/data/faq";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/layout/Section";
import { cn } from "@/lib/utils";

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <Section id="faq" number="07" title="FAQ">
      <Reveal>
        <div className="divide-y divide-border border-y border-border">
          {faqItems.map((item, index) => (
            <div key={item.question}>
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="focus-ring flex w-full items-center justify-between py-5 text-left"
                aria-expanded={openIndex === index}
              >
                <span className="pr-4 font-medium">{item.question}</span>
                <ChevronDown
                  className={cn(
                    "h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200",
                    openIndex === index && "rotate-180",
                  )}
                />
              </button>
              <div
                className={cn(
                  "grid transition-all duration-200",
                  openIndex === index ? "grid-rows-[1fr] pb-5" : "grid-rows-[0fr]",
                )}
              >
                <div className="overflow-hidden">
                  <p className="text-sm leading-relaxed text-muted-foreground">{item.answer}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Reveal>
    </Section>
  );
}
