export interface Profile {
  name: string;
  title: string;
  roleLine: string;
  headline: string;
  bio: string;
  email: string;
  github: string;
  linkedin: string;
  location: string;
  availability: string;
  workPreference: string;
  resumePath: string;
  siteUrl: string;
}

export interface Metric {
  label: string;
}

export interface ExperienceHighlight {
  title: string;
  description: string;
  technologies?: string[];
}

export interface Experience {
  id: string;
  company: string;
  role: string;
  location: string;
  period: string;
  summary: string;
  highlights: ExperienceHighlight[];
  technologies: string[];
}

export interface ProjectLinks {
  live?: string;
  github?: string;
}

export interface Project {
  slug: string;
  name: string;
  summary: string;
  description: string;
  role: string;
  period?: string;
  context: string;
  technologies: string[];
  highlights: string[];
  contributions: string[];
  links?: ProjectLinks;
  featured: boolean;
  accent: string;
}

export interface CaseStudySection {
  id: string;
  title: string;
  content: string[];
  bullets?: string[];
}

export interface CaseStudy extends Project {
  problem: string;
  myRole: string[];
  challenges: string[];
  architecture: string[];
  features: string[];
  decisions: string[];
  learnings: string[];
  diagramSteps?: string[];
  architectureLayers?: string[];
}

export interface SkillCategory {
  name: string;
  items: string[];
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface SideProject {
  name: string;
  description: string;
  stack: string[];
  github: string;
  live?: string;
}

export interface NavItem {
  label: string;
  href: string;
  external?: boolean;
}
