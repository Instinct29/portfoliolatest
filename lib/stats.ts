export type Stat = {
  n: string;
  c: string;
  orgs?: { name: string; img: string }[];
};

export const stats: Stat[] = [
  { n: "4+ yrs", c: "software development" },
  { n: "3.5+ yrs", c: "frontend focused" },
  {
    n: "5+",
    c: "products / projects",
    orgs: [
      { name: "HashTrust", img: "/images/hashtrust.svg" },
      { name: "Independent", img: "/images/independent.svg" },
    ],
  },
  { n: "Immediate", c: "availability" },
];
