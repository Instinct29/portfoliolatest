import { StackName } from "@/components/common/StackIcon";

export type TSideProject = {
  id: string;
  slug: string;
  title: string;
  icon?: string;
  isRecent?: boolean;
  tagline: string;
  description: string;
  longDescription?: string;
  highlights: string[];
  thumbnail: string;
  preview?: string;
  screenshots?: string[];
  date?: string;
  links?: {
    github?: string;
    twitter?: string;
    web?: string;
    download?: string;
    producthunt?: string;
  };
  stack: { fe?: StackName[]; be?: StackName[] };
  tags?: string[];
  caseStudy?: {
    role?: string;
    year?: string;
    overview?: string;
    problem?: string;
    constraints?: string[];
    architecture?: string[] | string;
    tradeoffs?: string[] | string;
    performance?: string[] | string;
    results?: { value: string; caption: string }[];
    lessons?: string[] | string;
  };
};

export const sideProjects: TSideProject[] = [
  {
    id: "stack-underflow",
    slug: "stack-underflow",
    title: "stack_underflow",
    isRecent: true,
    tagline: "TypeScript data structure utilities",
    description:
      "A TypeScript project exploring stack-based data structure implementations and utilities.",
    highlights: [
      "Stack-based data structure implementations",
      "TypeScript throughout",
      "Clean utility abstractions",
    ],
    thumbnail: "/projects/stack-underflow.svg",
    date: "2026",
    links: {
      github: "https://github.com/Instinct29/stack_underflow",
    },
    stack: { fe: ["typescript"] },
    tags: ["TypeScript", "Data structures"],
  },
];

export const getSideProject = (slug: string) =>
  sideProjects.find((p) => p.slug === slug);

export const getAllSideProjects = () => sideProjects;
