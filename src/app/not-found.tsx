import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { withBasePath } from "@/lib/utils";

export default function NotFound() {
  return (
    <Container className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <p className="font-mono text-sm text-muted-foreground">404</p>
      <h1 className="mt-4 text-3xl font-semibold">Page not found</h1>
      <p className="mt-2 text-muted-foreground">
        The page you&apos;re looking for doesn&apos;t exist.
      </p>
      <Link
        href={withBasePath("/")}
        className="focus-ring mt-8 text-sm text-accent hover:underline"
      >
        Back to home
      </Link>
    </Container>
  );
}
