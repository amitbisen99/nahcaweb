// What a resource can be filed under ("tags") and which "Resources for ..." pages
// it can show on ("pages"). The slugs are what the API stores — keep them in
// step with RESOURCE_TAGS / RESOURCE_PAGES in apps/api/src/routes/resources.ts.

export interface ResourceSection {
  slug: string;
  title: string;
  description: string;
  href: string;
}

// The sections of the Resource Library (/resources). A resource tagged with one
// shows on that section's page — and on every other tag's page it also carries.
export const RESOURCE_SECTIONS: ResourceSection[] = [
  {
    slug: "academic-papers",
    title: "Academic Papers",
    description: "Scholarly papers on Hindu spiritual care and chaplaincy, available as PDFs.",
    href: "/resources/academic-papers",
  },
  {
    slug: "websites",
    title: "Websites",
    description: "Useful websites and organizations for Hindu spiritual care providers.",
    href: "/resources/websites",
  },
  {
    slug: "podcasts",
    title: "Podcasts",
    description: "Conversations on Hindu chaplaincy, spiritual care and community life.",
    href: "/resources/podcasts",
  },
  {
    slug: "videos",
    title: "Videos",
    description: "Talks, lectures and presentations you can watch online.",
    href: "/resources/videos",
  },
  {
    slug: "articles",
    title: "Articles",
    description: "Articles and reflections from NAHCA members and the board.",
    href: "/resources/articles",
  },
  {
    slug: "newsletters",
    title: "Newsletters",
    description: "Past issues of the NAHCA newsletter.",
    href: "/resources/newsletters",
  },
];

export interface ResourcePage {
  slug: string;
  title: string;
  description: string;
  image: string;
  href: string;
}

// The "Resources for ..." pages a resource can be placed on.
export const RESOURCE_PAGES: ResourcePage[] = [
  {
    slug: "chaplains",
    title: "Resources for Chaplains",
    description: "Materials and guidance for practicing and aspiring Hindu chaplains.",
    image: "/chaplaincy/IMG_0469.jpg",
    href: "/resources/chaplains",
  },
  {
    slug: "students",
    title: "Resources for Students",
    description: "Materials and guidance for students exploring or preparing for Hindu chaplaincy.",
    image: "/chaplaincy/colorful-palm-leaf-books.jpg",
    href: "/resources/students",
  },
  {
    slug: "community",
    title: "Resources for Community",
    description: "Materials for communities, temples and organizations working with Hindu chaplains.",
    image: "/chaplaincy/puja.jpg",
    href: "/resources/community",
  },
];

export function sectionTitle(slug: string): string {
  return RESOURCE_SECTIONS.find((s) => s.slug === slug)?.title ?? slug;
}

export function pageTitle(slug: string): string {
  return RESOURCE_PAGES.find((p) => p.slug === slug)?.title ?? slug;
}
