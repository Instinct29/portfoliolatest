import type { SkillCategory } from "@/types";

export const skillCategories: SkillCategory[] = [
  {
    name: "Core Frontend",
    items: [
      "JavaScript",
      "TypeScript",
      "React",
      "Next.js",
      "HTML5",
      "CSS3",
      "Tailwind CSS",
      "Redux",
      "TanStack Query",
      "Material UI",
    ],
  },
  {
    name: "Backend / Data",
    items: [
      "Node.js",
      "Express",
      "PostgreSQL",
      "SQL",
      "Redis",
      "GraphQL",
      "REST APIs",
    ],
  },
  {
    name: "Engineering / Infrastructure",
    items: [
      "Git",
      "GitHub",
      "Docker",
      "ESLint",
      "Prettier",
      "Husky",
      "Storybook",
      "Jest",
      "React Testing Library",
    ],
  },
  {
    name: "AI Development",
    items: [
      "Cursor",
      "GitHub Copilot",
      "OpenAI Codex",
      "Claude",
      "LLM Workflows",
      "AI Agents",
      "AI-assisted Development",
    ],
  },
  {
    name: "Additional",
    items: ["Python", "C++", "Bash", "Hasura", "Chart.js"],
  },
];

export const aiPositioning = {
  tools: ["Cursor", "GitHub Copilot", "OpenAI Codex", "Claude"],
  uses: [
    "Implementation acceleration",
    "Refactoring and debugging",
    "Test generation",
    "Documentation",
    "Exploring architectural approaches",
    "Reviewing repetitive code patterns",
  ],
  validation: [
    "Code review",
    "TypeScript compiler checks",
    "Linting",
    "Automated tests",
    "Browser testing",
    "API validation",
    "Manual verification",
  ],
};
