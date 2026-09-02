export type Client = {
  name: string;
  img: string;
  link: string;
  contribution: string;
  org: string;
};

export const clients: Client[] = [
  {
    name: "Fetch.ai",
    img: "/images/orgs/fetch-ai.webp",
    link: "https://fetch.ai",
    contribution: "Website, documentation, and product interfaces",
    org: "hashtrust",
  },
  {
    name: "ASI Create",
    img: "/images/orgs/asi-create.webp",
    link: "https://asicreate.io/",
    contribution: "AI agent product interfaces",
    org: "hashtrust",
  },
  {
    name: "Property Finder",
    img: "/images/orgs/property-finder.webp",
    link: "https://www.propertyfinder.ae/",
    contribution: "Property listing and search UI",
    org: "independent",
  },
  {
    name: "ImAvatar",
    img: "/images/orgs/imavatar.webp",
    link: "https://imavatar.com/",
    contribution: "Puja booking and onboarding flows",
    org: "independent",
  },
];
