export interface NavChild {
  label: string;
  href: string;
  external?: boolean;
}

export interface NavItem {
  label: string;
  href: string;
  children?: NavChild[];
}

export const NAV: NavItem[] = [
  { label: "Home", href: "/" },
  {
    label: "What Is Hindu Chaplaincy?",
    href: "/what-is-hindu-chaplaincy",
    children: [
      { label: "Defining Hindu Chaplaincy", href: "/what-is-hindu-chaplaincy/defining" },
      { label: "Higher Education", href: "/what-is-hindu-chaplaincy/higher-education" },
      { label: "Healthcare", href: "/what-is-hindu-chaplaincy/healthcare" },
      { label: "Community", href: "/what-is-hindu-chaplaincy/community" },
    ],
  },
  {
    label: "About Us",
    href: "/about",
    children: [
      { label: "NAHCA Board", href: "/about#board" },
      { label: "Organizational Partners", href: "/organizational-partners" },
    ],
  },
  {
    label: "Events",
    href: "/events",
    children: [
      { label: "Monthly Q&A", href: "/events/monthly-qa" },
      { label: "Upcoming Webinars", href: "/events/webinars" },
      { label: "Sangha", href: "/events/sangha" },
      { label: "Members-Only Meetings", href: "/events/members-only" },
      { label: "NAHCA Conference", href: "/events/conference" },
    ],
  },
  {
    label: "Store",
    href: "/store",
    children: [
      { label: "Webinars", href: "/store#webinars" },
      { label: "Conference Videos", href: "/conference-videos" },
      { label: "Endorsement Fee", href: "/endorsement" },
    ],
  },
  { label: "Endorsement", href: "/endorsement" },
  { label: "Member Portal", href: "/portal" },
];

export const FOOTER_LINKS: NavChild[] = [
  { label: "Newsletters", href: "/newsletters" },
  { label: "Join Us / Membership", href: "/membership" },
  { label: "Get In Touch / Contact Us", href: "/contact" },
];
