// The sections of the public Resources page. `apiPath` is set for the four
// types managed from the admin Resources page; Articles and Newsletters have
// their own existing pages.
export interface ResourceSection {
  slug: string;
  title: string;
  description: string;
  href: string;
  apiPath?: string;
}

export const RESOURCE_SECTIONS: ResourceSection[] = [
  {
    slug: "academic-papers",
    title: "Academic Papers",
    description: "Scholarly papers on Hindu spiritual care and chaplaincy, available as PDFs.",
    href: "/resources/academic-papers",
    apiPath: "academic-papers",
  },
  {
    slug: "websites",
    title: "Websites",
    description: "Useful websites and organizations for Hindu spiritual care providers.",
    href: "/resources/websites",
    apiPath: "resource-websites",
  },
  {
    slug: "podcasts",
    title: "Podcasts",
    description: "Conversations on Hindu chaplaincy, spiritual care and community life.",
    href: "/resources/podcasts",
    apiPath: "podcasts",
  },
  {
    slug: "videos",
    title: "Videos",
    description: "Talks, lectures and presentations you can watch online.",
    href: "/resources/videos",
    apiPath: "resource-videos",
  },
  {
    slug: "articles",
    title: "Articles",
    description: "Articles and reflections from NAHCA members and the board.",
    href: "/articles",
  },
  {
    slug: "newsletters",
    title: "Newsletters",
    description: "Past issues of the NAHCA newsletter.",
    href: "/newsletters",
  },
];
