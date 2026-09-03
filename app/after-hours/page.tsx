import type { Metadata } from "next";
import dynamic from "next/dynamic";
import Container from "@/components/layout/Container";

export const metadata: Metadata = {
  title: "After Hours — Manthan Gour",
  robots: { index: false, follow: false },
};

const AfterHoursClient = dynamic(
  () => import("@/components/game/AfterHoursClient"),
  {
    ssr: false,
    loading: () => (
      <p className="text-sm text-muted-foreground">Loading…</p>
    ),
  }
);

export default function AfterHoursPage() {
  return (
    <main className="py-8 md:py-12">
      <Container width="reading">
        <AfterHoursClient />
      </Container>
    </main>
  );
}
