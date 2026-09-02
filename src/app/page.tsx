import { Hero } from "@/components/home/Hero";
import { Experience } from "@/components/home/Experience";
import { SelectedWork } from "@/components/home/SelectedWork";
import { Projects } from "@/components/home/Projects";
import { Toolkit } from "@/components/home/Toolkit";
import { About } from "@/components/home/About";
import { Now } from "@/components/home/Now";
import { FAQ } from "@/components/home/FAQ";
import { Contact } from "@/components/home/Contact";

export default function HomePage() {
  return (
    <>
      <Hero />
      <Experience />
      <SelectedWork />
      <Projects />
      <Toolkit />
      <About />
      <Now />
      <FAQ />
      <Contact />
    </>
  );
}
