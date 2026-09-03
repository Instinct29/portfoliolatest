import About from "@/components/About";
import GameTeaser from "@/components/game/GameTeaser";
import { GameErrorBoundary } from "@/components/game/GameErrorBoundary";
import ExperienceWork from "@/components/ExperienceWork";
import Projects from "@/components/Projects";
import TechStack from "@/components/TechStack";
import Activity from "@/components/Activity";
import Faq from "@/components/Faq";
import Socials from "@/components/Socials";
import ChatBotMount from "@/components/ChatBotMount";
import { profilePageLd } from "@/lib/seo";


export default function Home() {
  return (
    <main>
      {/* The homepage is the entity page for this portfolio. `mainEntity`
          references the Person node emitted from the root layout by @id, so both
          resolve to one entity rather than two. */}
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: JSON.stringify(profilePageLd()) }}
      />
      <About />
      <GameErrorBoundary>
        <GameTeaser />
      </GameErrorBoundary>
      <ExperienceWork />
      <Projects />
      <TechStack />
      <Activity />
      <Faq />
      {/* Last section on the page, directly above the footer rendered from
          `app/layout.tsx`. It carries the visitor-card nudge at its foot:
          that copy is a parting note for someone who has scrolled the whole
          page, so it only reads honestly from here. */}
      <Socials />
      <ChatBotMount />
    </main>
  );
}
