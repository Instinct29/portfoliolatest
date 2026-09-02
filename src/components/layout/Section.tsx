import { cn } from "@/lib/utils";
import { Container } from "./Container";

interface SectionProps {
  id?: string;
  number: string;
  title: string;
  children: React.ReactNode;
  className?: string;
  description?: string;
}

export function Section({ id, number, title, children, className, description }: SectionProps) {
  return (
    <section id={id} className={cn("py-20 md:py-28", className)}>
      <Container>
        <div className="mb-12 md:mb-16">
          <p className="section-number mb-3">{number}</p>
          <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">{title}</h2>
          {description && (
            <p className="mt-4 max-w-2xl text-muted-foreground">{description}</p>
          )}
        </div>
        {children}
      </Container>
    </section>
  );
}
