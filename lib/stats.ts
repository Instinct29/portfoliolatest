export type Stat = {
  n: string;
  c: string;
  orgs?: { name: string; img: string }[];
};

export const stats: Stat[] = [
  { n: "4+ yrs", c: "software development" },
  { n: "3.5+ yrs", c: "frontend focused" },
  {
    n: "6+",
    c: "products / projects",
    orgs: [
      { name: "HashTrust", img: "/images/orgs/hashtrust.webp" },
      { name: "Property Finder", img: "/images/orgs/property-finder.webp" },
      { name: "Fetch.ai", img: "/images/orgs/fetch-ai.webp" },
      { name: "ImAvatar", img: "/images/orgs/imavatar.webp" },
    ],
  },
  { n: "Immediate", c: "availability" },
];
