import { profile } from "@/data/profile";
import { ExternalLink } from "@/components/ui/ExternalLink";
import { Container } from "./Container";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border py-12">
      <Container className="flex flex-col items-center justify-between gap-6 sm:flex-row">
        <div className="text-center sm:text-left">
          <p className="text-sm font-medium">{profile.name}</p>
          <p className="mt-1 text-xs text-muted-foreground">{profile.roleLine}</p>
        </div>
        <div className="flex items-center gap-6 text-sm text-muted-foreground">
          <ExternalLink href={profile.github} showIcon={false}>
            GitHub
          </ExternalLink>
          <ExternalLink href={profile.linkedin} showIcon={false}>
            LinkedIn
          </ExternalLink>
          <ExternalLink href={profile.resumePath} showIcon={false}>
            Resume
          </ExternalLink>
        </div>
        <p className="text-xs text-muted-foreground">
          © {year} {profile.name.split(" ")[0]} Gour
        </p>
      </Container>
    </footer>
  );
}
