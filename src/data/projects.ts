import type { CaseStudy, Project } from "@/types";

export const projects: Project[] = [
  {
    slug: "atomix",
    name: "Atomix",
    summary: "Loan origination platform with multi-stage workflows and dynamic application forms.",
    description:
      "A sophisticated loan origination platform involving multiple participants, conditional workflows, and complex property data capture across applicant onboarding through funding.",
    role: "Frontend Engineer",
    period: "2022 – 2025",
    context: "HashTrust Technologies — production fintech product",
    technologies: [
      "React",
      "Next.js",
      "TypeScript",
      "Redux",
      "TanStack Query",
      "Node.js",
      "PostgreSQL",
      "Redis",
    ],
    highlights: [
      "Multi-stage loan application workflows",
      "Dynamic forms with conditional routing",
      "WhenFresh property data integration",
    ],
    contributions: [
      "Built borrower-facing application flows and dashboard experiences",
      "Designed reusable runtime UI for dynamic form generation",
      "Integrated postcode → UPRN → property variable pipelines",
    ],
    featured: true,
    accent: "#0d9488",
  },
  {
    slug: "fetch-ai",
    name: "Fetch.ai Product Work",
    summary: "Modern product interfaces and documentation for AI-oriented platforms.",
    description:
      "Frontend and product engineering for Fetch.ai-related platforms—website, documentation, and AI product experiences including autonomous agent interfaces.",
    role: "Frontend Engineer",
    period: "2023 – 2025",
    context: "HashTrust Technologies — client product engineering",
    technologies: ["Next.js", "TypeScript", "React", "GraphQL", "Tailwind CSS"],
    highlights: [
      "Modern Next.js product architecture",
      "AI-oriented product interfaces",
      "Documentation and marketing surfaces",
    ],
    contributions: [
      "Shipped product interfaces for Fetch.ai web presence",
      "Built ASI Create and chatbot-related product experiences",
      "Established reusable component patterns for AI product UI",
    ],
    links: {
      live: "https://fetch.ai",
    },
    featured: true,
    accent: "#2563eb",
  },
  {
    slug: "property-finder",
    name: "Property Finder",
    summary: "Interactive property discovery for the UAE's leading real estate platform.",
    description:
      "Frontend engineering for property listing experiences—API-driven data, filtering, and responsive interfaces for high-traffic property search.",
    role: "Frontend Engineer",
    period: "2025",
    context: "Independent — project engineering",
    technologies: ["React", "TypeScript", "REST APIs", "Tailwind CSS"],
    highlights: [
      "API-driven property listings",
      "Advanced filtering experiences",
      "Performance-conscious rendering",
    ],
    contributions: [
      "Consumed property APIs for dynamic listing data",
      "Built interactive filter and search interfaces",
      "Optimized responsive layouts for mobile property browsing",
    ],
    links: {
      live: "https://www.propertyfinder.ae/",
    },
    featured: true,
    accent: "#b45309",
  },
  {
    slug: "imavatar",
    name: "ImAvatar",
    summary: "Digital puja booking and spiritual services platform.",
    description:
      "Online platform for spiritual services—puja booking workflows, user onboarding, and product UX for digital religious experiences.",
    role: "Frontend Engineer",
    period: "2025",
    context: "Independent — project engineering",
    technologies: ["React", "Next.js", "TypeScript"],
    highlights: [
      "Puja booking workflows",
      "User onboarding flows",
      "Reusable component library",
    ],
    contributions: [
      "Implemented end-to-end booking experiences",
      "Built onboarding and service selection interfaces",
      "Created reusable UI components for service catalogues",
    ],
    links: {
      live: "https://imavatar.com/",
    },
    featured: true,
    accent: "#7c3aed",
  },
];

export const caseStudies: Record<string, CaseStudy> = {
  atomix: {
    ...projects[0],
    problem:
      "Mortgage origination involves multiple stakeholders, conditional application paths, and property data that must be captured accurately across stages—from initial applicant details through legal review and funding. The frontend needed to handle dynamic workflows without becoming unmaintainable.",
    myRole: [
      "Owned borrower-facing application flows and dashboard experiences",
      "Built dynamic form systems that adapt to application state and product rules",
      "Integrated WhenFresh property data APIs with postcode-to-UPRN address selection",
      "Established reusable frontend architecture for runtime UI generation",
      "Collaborated on API contracts and caching strategies with backend engineers",
    ],
    challenges: [
      "Conditional workflow routing across dozens of application states",
      "Dynamic form schemas that change based on product configuration",
      "Address intelligence integration with postcode lookup, UPRN selection, and property variables",
      "Maintaining UI consistency across a large surface area of loan stages",
      "Caching external API responses without stale property data",
    ],
    architecture: [
      "React component tree with container/presentational separation",
      "Redux for global application state and workflow progression",
      "TanStack Query for server state, caching, and background refetching",
      "Runtime form renderer driven by backend configuration schemas",
      "API abstraction layer for REST endpoints and external integrations",
    ],
    features: [
      "Multi-stage loan application workflow with progress tracking",
      "Dynamic application forms with conditional field visibility",
      "Borrower dashboard with application status and action items",
      "Postcode → address list → UPRN selection flow",
      "WhenFresh catalogue integration for purchased property variables",
      "Google Places autocomplete for address entry",
      "Reusable runtime UI components for form fields and validation",
    ],
    decisions: [
      "Chose schema-driven forms over hard-coded screens to support product configurability",
      "Used TanStack Query for server state to separate it from Redux workflow state",
      "Implemented Redis-backed caching on the API layer for address lookup performance",
      "Built accessible form components with consistent validation patterns",
      "Prioritized responsive layouts for broker and borrower mobile usage",
    ],
    learnings: [
      "Complex fintech workflows benefit enormously from schema-driven UI—the upfront architecture investment pays off as products evolve.",
      "Address intelligence integrations require careful UX around partial data and user correction flows.",
      "Separating workflow state from server state prevents the most common bugs in multi-stage applications.",
    ],
    diagramSteps: [
      "User enters postcode",
      "Address API lookup",
      "UPRN results displayed",
      "Property selection",
      "WhenFresh catalogue",
      "Purchased variables loaded",
      "Application UI updated",
    ],
    architectureLayers: [
      "React UI Layer",
      "Application State (Redux)",
      "Server State (TanStack Query)",
      "Backend APIs",
      "Redis / PostgreSQL",
      "External Services",
    ],
  },
  "fetch-ai": {
    ...projects[1],
    problem:
      "Fetch.ai needed modern, performant web experiences for its AI platform—product interfaces that communicate complex autonomous agent concepts clearly, alongside documentation and marketing surfaces built on a maintainable Next.js architecture.",
    myRole: [
      "Built product interfaces for Fetch.ai web presence and documentation",
      "Implemented ASI Create and autonomous AI chatbot product experiences",
      "Established Next.js architecture patterns for the product frontend",
      "Created reusable component systems for AI-oriented UI patterns",
    ],
    challenges: [
      "Communicating complex AI/agent concepts through clear product UI",
      "Balancing marketing surfaces with functional product interfaces",
      "Maintaining performance with content-heavy documentation pages",
      "Building chatbot interfaces that feel responsive and trustworthy",
    ],
    architecture: [
      "Next.js App Router with server and client component boundaries",
      "Component library for shared product UI patterns",
      "GraphQL integration for product data",
      "Static generation for documentation with dynamic product routes",
    ],
    features: [
      "Fetch.ai marketing and product landing experiences",
      "Documentation site with navigable content architecture",
      "ASI Create product interface",
      "Autonomous AI chatbot interaction flows",
      "Responsive layouts across product and docs surfaces",
    ],
    decisions: [
      "Used Next.js for unified marketing, docs, and product surfaces",
      "Separated content-heavy pages as server components for performance",
      "Built chatbot UI with optimistic updates for perceived responsiveness",
      "Established consistent typography and spacing for technical content",
    ],
    learnings: [
      "AI product UI requires extra attention to loading states and trust signals—users need to understand what the system is doing.",
      "Documentation and product surfaces benefit from shared design tokens even when content types differ significantly.",
    ],
    architectureLayers: [
      "Next.js App Router",
      "React Components",
      "GraphQL / REST APIs",
      "Content & Product Data",
      "CDN / Static Assets",
    ],
  },
  "property-finder": {
    ...projects[2],
    problem:
      "Property Finder serves millions of property searches across the UAE. The frontend needed to handle large listing datasets, sophisticated filtering, and responsive layouts that work equally well on mobile property browsing and desktop research sessions.",
    myRole: [
      "Built property listing interfaces consuming REST APIs",
      "Implemented filtering and search experiences",
      "Optimized responsive layouts for mobile and desktop",
      "Handled frontend data transformation and pagination patterns",
    ],
    challenges: [
      "Rendering large property datasets without performance degradation",
      "Complex multi-criteria filtering with immediate UI feedback",
      "Responsive card layouts across diverse screen sizes",
      "Image-heavy listings with acceptable load times",
    ],
    architecture: [
      "React with component-driven listing architecture",
      "API layer for property data fetching and transformation",
      "Filter state management with URL-synced parameters",
      "Lazy loading and pagination for listing performance",
    ],
    features: [
      "Property listing cards with key metadata and imagery",
      "Multi-criteria search and filter panel",
      "Responsive grid/list view switching",
      "API-driven dynamic property data",
      "Mobile-optimized property detail navigation",
    ],
    decisions: [
      "Synced filter state to URL parameters for shareable search results",
      "Used pagination over infinite scroll for predictable performance",
      "Built filter components as controlled inputs for testability",
      "Prioritized skeleton loading states for perceived performance",
    ],
    learnings: [
      "Property platforms are fundamentally search products—filter UX and performance matter more than visual novelty.",
      "URL-synced filter state is essential for a platform where users share and revisit searches.",
    ],
    architectureLayers: [
      "React UI",
      "Filter State",
      "REST API Layer",
      "Property Data Service",
      "CDN / Image Assets",
    ],
  },
  imavatar: {
    ...projects[3],
    problem:
      "ImAvatar brings traditional spiritual services online—puja bookings, service selection, and user onboarding for a domain where trust and clarity are essential. The frontend needed to guide users through unfamiliar digital workflows naturally.",
    myRole: [
      "Implemented puja booking and service selection flows",
      "Built user onboarding experiences",
      "Created reusable component library for service catalogues",
      "Designed responsive layouts for mobile-first spiritual service browsing",
    ],
    challenges: [
      "Translating traditional service workflows into intuitive digital flows",
      "Onboarding users unfamiliar with online puja booking",
      "Service catalogue presentation with clear pricing and scheduling",
      "Building trust through clean, respectful UI design",
    ],
    architecture: [
      "Next.js with page-based routing for service categories",
      "Reusable booking flow components",
      "API integration for service availability and scheduling",
      "Shared design system for consistent service presentation",
    ],
    features: [
      "Puja service catalogue with category browsing",
      "Step-by-step booking workflow",
      "User onboarding and account setup",
      "Service detail pages with scheduling options",
      "Responsive mobile booking experience",
    ],
    decisions: [
      "Used step-by-step booking wizard over single-page forms for clarity",
      "Built service cards as reusable components across catalogue pages",
      "Prioritized mobile layouts since most users book from phones",
      "Kept visual design restrained and respectful of the domain",
    ],
    learnings: [
      "Domain-specific products require UX that respects user mental models—even when digitizing traditional workflows.",
      "Step-by-step flows outperform complex single-page forms for unfamiliar service categories.",
    ],
    architectureLayers: [
      "Next.js Pages",
      "Booking Flow Components",
      "REST APIs",
      "Service & Schedule Data",
      "Payment Integration",
    ],
  },
};

export const featuredProjects = projects.filter((p) => p.featured);

export function getCaseStudy(slug: string): CaseStudy | undefined {
  return caseStudies[slug];
}

export function getAdjacentProjects(slug: string): {
  prev: Project | null;
  next: Project | null;
} {
  const index = projects.findIndex((p) => p.slug === slug);
  return {
    prev: index > 0 ? projects[index - 1] : null,
    next: index < projects.length - 1 ? projects[index + 1] : null,
  };
}
