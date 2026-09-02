interface CaseStudySectionProps {
  title: string;
  children: React.ReactNode;
}

export function CaseStudySection({ title, children }: CaseStudySectionProps) {
  return (
    <section className="py-10 md:py-12">
      <h2 className="text-xl font-semibold tracking-tight md:text-2xl">{title}</h2>
      <div className="mt-6">{children}</div>
    </section>
  );
}
