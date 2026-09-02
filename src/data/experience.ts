import type { Experience } from "@/types";

export const experiences: Experience[] = [
  {
    id: "hashtrust",
    company: "HashTrust Technologies Pvt. Ltd.",
    role: "Software Developer",
    location: "Gurugram, India",
    period: "Sep 2022 – Apr 2025",
    summary:
      "Built production frontend systems for fintech and AI-oriented products—loan origination workflows, address intelligence integrations, and modern product interfaces for Fetch.ai-related work.",
    highlights: [
      {
        title: "Atomix — Loan Origination Platform",
        description:
          "Engineered multi-stage loan application workflows with dynamic forms, borrower dashboards, conditional routing, and reusable frontend architecture across applicant onboarding, legal states, and funding stages.",
        technologies: ["React", "Next.js", "TypeScript", "Redux", "TanStack Query"],
      },
      {
        title: "WhenFresh Integration",
        description:
          "Implemented postcode-to-UPRN address selection flows, property variable catalogues, Redis-backed caching, and Google Places integration with reusable UI patterns for property data capture.",
        technologies: ["React", "Node.js", "Redis", "REST APIs"],
      },
      {
        title: "Fetch.ai Product Engineering",
        description:
          "Contributed to Fetch.ai website, documentation, and product interfaces—including modern Next.js architecture and AI-oriented product experiences such as ASI Create and autonomous AI chatbot workflows.",
        technologies: ["Next.js", "TypeScript", "React", "GraphQL"],
      },
    ],
    technologies: [
      "React",
      "Next.js",
      "JavaScript",
      "TypeScript",
      "Redux",
      "TanStack Query",
      "Tailwind CSS",
      "Material UI",
      "Node.js",
      "Express",
      "PostgreSQL",
      "Redis",
      "REST APIs",
      "GraphQL",
      "Docker",
      "Jest",
      "React Testing Library",
      "Git",
      "GitHub",
    ],
  },
  {
    id: "independent",
    company: "Independent Software Developer",
    role: "Freelance & Open-Source Engineering",
    location: "Remote",
    period: "Apr 2025 – Present",
    summary:
      "Delivering frontend engineering for product teams—interactive property platforms, digital service workflows, and maintainable component systems.",
    highlights: [
      {
        title: "Property Finder",
        description:
          "Built responsive property discovery interfaces with API-driven listings, filtering experiences, and performance-conscious data handling for a leading UAE property platform.",
        technologies: ["React", "TypeScript", "REST APIs"],
      },
      {
        title: "ImAvatar",
        description:
          "Implemented digital puja booking workflows, onboarding flows, and reusable UI components for an online spiritual services platform.",
        technologies: ["React", "Next.js", "TypeScript"],
      },
    ],
    technologies: [
      "React",
      "Next.js",
      "TypeScript",
      "JavaScript",
      "Tailwind CSS",
      "REST APIs",
      "Git",
      "GitHub",
    ],
  },
];
