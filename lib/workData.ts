import { StackName } from "@/components/common/StackIcon";
import type { TPeriod } from "@/lib/tenure";

export type TProject = {
  id: string;
  slug: string;
  title: string;
  shortTitle?: string;
  isActive?: boolean;
  featured?: boolean;
  description: string;
  highlights?: string[];
  thumbnail: string;
  preview?: string;
  date?: string;
  metric?: string;
  links?: {
    github?: string;
    twitter?: string;
    web?: string;
    opensea?: string;
    other?: string;
  };
  stack: { fe?: StackName[]; be?: StackName[] };
};

export type TOrganization = {
  id: string;
  slug: string;
  name: string;
  logo: string;
  role: string;
  period: TPeriod;
  skills?: string[];
  employment?: "full-time" | "contract";
  description: string;
  highlights: string[];
  link?: string;
  links?: {
    web?: string;
    app?: string;
    twitter?: string;
  };
  projects: TProject[];
};

export const organizations: TOrganization[] = [
  {
    id: "hashtrust",
    slug: "hashtrust",
    name: "HashTrust Technologies",
    logo: "/images/hashtrust.svg",
    role: "Software Developer",
    employment: "full-time",
    period: { start: "09.2022", end: "04.2025" },
    skills: ["React", "TypeScript", "Next.js", "React Query", "Node.js", "PostgreSQL"],
    description:
      "Frontend-heavy software development on production fintech and AI-oriented products — loan origination workflows, property data integrations, and modern product interfaces for Fetch.ai-related work.",
    highlights: [
      "Built multi-stage loan application workflows with dynamic forms and borrower dashboards on Atomix.",
      "Integrated WhenFresh property data: postcode lookup, UPRN selection, Redis caching, and Google Places.",
      "Shipped Fetch.ai website, documentation, and AI product interfaces including ASI Create.",
    ],
    projects: [
      {
        id: "atomix",
        slug: "atomix",
        title: "Atomix",
        shortTitle: "Atomix",
        featured: true,
        description:
          "Loan origination platform with multi-stage application workflows, dynamic forms, conditional routing, and borrower dashboards across applicant onboarding through funding.",
        highlights: [
          "Schema-driven dynamic application forms",
          "Postcode → UPRN → property variable pipelines",
          "Reusable runtime UI for complex fintech workflows",
        ],
        stack: {
          fe: ["react", "typescript", "next", "reactQuery", "motion"],
          be: ["node", "postgres", "restAPI"],
        },
        thumbnail: "/projects/atomix.svg",
        date: "2022 – 2025",
      },
      {
        id: "fetch-ai",
        slug: "fetch-ai",
        title: "Fetch.ai Product Work",
        shortTitle: "Fetch.ai",
        featured: true,
        description:
          "Frontend and product engineering for Fetch.ai-related platforms — website, documentation, and modern Next.js product interfaces.",
        highlights: [
          "Modern Next.js product architecture",
          "Documentation and marketing surfaces",
          "AI-oriented product UI patterns",
        ],
        stack: {
          fe: ["next", "react", "typescript", "tailwind", "graphql"],
        },
        links: { web: "https://fetch.ai" },
        thumbnail: "/projects/fetch-ai.svg",
        date: "2023 – 2025",
      },
      {
        id: "asi-create",
        slug: "asi-create",
        title: "ASI Create",
        shortTitle: "ASI Create",
        featured: true,
        description:
          "AI-oriented product interfaces and autonomous chatbot experiences within the Fetch.ai product ecosystem.",
        highlights: [
          "Chatbot interaction flows with responsive UI",
          "Product interfaces for AI agent workflows",
          "Reusable component patterns for AI product surfaces",
        ],
        stack: {
          fe: ["react", "typescript", "next", "reactQuery"],
        },
        thumbnail: "/projects/asi-create.svg",
        date: "2024 – 2025",
      },
    ],
  },
  {
    id: "independent",
    slug: "independent",
    name: "Independent Software Developer",
    logo: "/images/independent.svg",
    role: "Freelance & Project Engineering",
    employment: "contract",
    period: { start: "04.2025" },
    skills: ["React", "Next.js", "TypeScript", "Tailwind CSS", "REST API"],
    description:
      "Frontend engineering for product teams — property discovery platforms, digital service workflows, and maintainable component systems.",
    highlights: [
      "Built API-driven property listing and filtering experiences for Property Finder.",
      "Implemented puja booking workflows and onboarding for ImAvatar.",
    ],
    projects: [
      {
        id: "property-finder",
        slug: "property-finder",
        title: "Property Finder",
        shortTitle: "Property Finder",
        featured: true,
        description:
          "Interactive property discovery interfaces with API-driven listings, filtering, and responsive layouts for a leading UAE property platform.",
        highlights: [
          "API-driven property listing data",
          "Multi-criteria search and filter panel",
          "Performance-conscious mobile layouts",
        ],
        stack: {
          fe: ["react", "typescript", "tailwind", "reactQuery"],
        },
        links: { web: "https://www.propertyfinder.ae/" },
        thumbnail: "/projects/property-finder.svg",
        date: "2025",
      },
      {
        id: "imavatar",
        slug: "imavatar",
        title: "ImAvatar",
        shortTitle: "ImAvatar",
        description:
          "Digital puja booking workflows, user onboarding, and reusable UI for an online spiritual services platform.",
        highlights: [
          "Step-by-step booking wizard",
          "Service catalogue and scheduling UI",
          "Mobile-first responsive layouts",
        ],
        stack: {
          fe: ["react", "next", "typescript"],
        },
        links: { web: "https://imavatar.com/" },
        thumbnail: "/projects/imavatar.svg",
        date: "2025",
      },
    ],
  },
];

export const getOrganization = (slug: string) =>
  organizations.find((o) => o.slug === slug);

export const getProjectFromOrg = (orgSlug: string, projectSlug: string) => {
  const org = getOrganization(orgSlug);
  return org?.projects.find((p) => p.slug === projectSlug);
};
