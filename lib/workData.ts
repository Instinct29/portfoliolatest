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
  employment?: "full-time" | "contract" | "internship";
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
        thumbnail: "/projects/property-finder.webp",
        date: "2025",
      },
      {
        id: "imavatar",
        slug: "imavatar",
        title: "ImAvatar",
        shortTitle: "ImAvatar",
        featured: true,
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
        thumbnail: "/projects/imavatar.webp",
        date: "2025",
      },
    ],
  },
  {
    id: "hashtrust",
    slug: "hashtrust",
    name: "HashTrust Technologies",
    logo: "/images/orgs/hashtrust.ico",
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
    links: { web: "https://hashtrust.in" },
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
        thumbnail: "/projects/atomix.webp",
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
        thumbnail: "/projects/fetch-ai.webp",
        date: "2023 – 2025",
      },
      {
        id: "asi-create",
        slug: "asi-create",
        title: "ASI Create",
        shortTitle: "ASI Create",
        featured: true,
        description:
          "End-to-end AI platform integrating the ASI LLM with chat UI, memory handling, session management, and backend APIs — delivering a smooth real-time conversational experience within the Fetch.ai / ASI Alliance ecosystem.",
        highlights: [
          "Chat UI with memory and session management",
          "Real-time conversational flows backed by ASI LLM APIs",
          "Reusable AI product component patterns",
        ],
        stack: {
          fe: ["react", "typescript", "next", "reactQuery"],
        },
        links: { web: "https://asicreate.io/" },
        thumbnail: "/projects/asi-create.webp",
        date: "2024 – 2025",
      },
      {
        id: "dev-platform",
        slug: "dev-platform",
        title: "Developer Platform",
        shortTitle: "Developer Platform",
        featured: true,
        description:
          "Dynamic integrations hub that pulls live data from GitHub, processes it through a FastAPI backend, and presents a responsive Next.js UI — cutting manual docs work and giving the Fetch.ai ecosystem real-time developer visibility.",
        highlights: [
          "Live GitHub data ingestion via API",
          "FastAPI backend for data processing and aggregation",
          "Next.js frontend with responsive integration dashboards",
        ],
        stack: {
          fe: ["next", "react", "typescript", "tailwind"],
          be: ["python", "postgres"],
        },
        thumbnail: "/projects/dev-platform.svg",
        date: "2024",
      },
      {
        id: "mettalex",
        slug: "mettalex",
        title: "Mettalex",
        shortTitle: "Mettalex",
        featured: true,
        description:
          "P2P decentralized exchange built on Fetch.ai's agent technology. Frontend work across the trading interface, cross-chain flow screens, and documentation surfaces for a DeFi platform with zero slippage and no liquidity pools.",
        highlights: [
          "Trading UI for chain-agnostic P2P order flows",
          "Agent-based transaction status and confirmation patterns",
          "Documentation and onboarding surfaces",
        ],
        stack: {
          fe: ["react", "typescript", "next", "tailwind"],
          be: ["restAPI"],
        },
        links: { web: "https://mettalex.ai" },
        thumbnail: "/projects/mettalex-screenshot.png",
        date: "2023 – 2024",
      },
      {
        id: "globacap",
        slug: "globacap",
        title: "Globacap",
        shortTitle: "Globacap",
        featured: true,
        description:
          "Enterprise frontend modules for a private capital markets platform — pixel-perfect Figma implementation, complex API integration, and stable high-performance workflows across issuance, administration, and securities transfer.",
        highlights: [
          "Pixel-perfect Figma-to-code enterprise UI modules",
          "Complex API integration for private markets workflows",
          "High-performance, production-stable frontend delivery",
        ],
        stack: {
          fe: ["react", "typescript", "tailwind", "reactQuery"],
        },
        links: { web: "https://globacap.com" },
        thumbnail: "/images/orgs/globacap-logo.svg",
        date: "2023",
      },
    ],
  },
  {
    id: "claymango",
    slug: "claymango",
    name: "Claymango",
    logo: "/images/orgs/claymango.svg",
    role: "Web Developer Intern",
    employment: "internship",
    period: { start: "03.2021", end: "10.2021" },
    skills: ["React", "JavaScript", "Product thinking", "Wireframing"],
    description:
      "Early product and web development work on Claymango's seller platform — user journeys, onboarding flows, and dashboard wireframes for a handmade home-goods marketplace.",
    highlights: [
      "Mapped seller onboarding journeys and translated them into actionable product updates.",
      "Wireframed a seller dashboard and iterated from user interviews and feedback.",
      "Wrote user stories and coordinated engineering delivery for key platform features.",
    ],
    links: { web: "https://claymango.com" },
    projects: [
      {
        id: "seller-platform",
        slug: "seller-platform",
        title: "Seller Platform & Onboarding",
        shortTitle: "Seller platform",
        featured: true,
        description:
          "Product and frontend work on Claymango's seller onboarding and dashboard experience for a Shopify-based handmade goods marketplace.",
        highlights: [
          "Seller onboarding flow improvements",
          "Dashboard wireframes and user research",
          "User stories and cross-functional delivery",
        ],
        stack: {
          fe: ["react", "javascript"],
        },
        links: { web: "https://claymango.com" },
        thumbnail: "/projects/claymango-platform.webp",
        date: "2021",
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

/** All work projects in portfolio display order (newest orgs first). */
export function getAllWorkProjects() {
  return organizations.flatMap((org) =>
    org.projects.map((project) => ({ org, project }))
  );
}
