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
      { label: "Organizational Partners", href: "/about#partners" },
    ],
  },
  {
    label: "Events",
    href: "/events",
    children: [
      {
        label: "NAHCA Monthly Q&A",
        href: "https://pro.software4nonprofits.com/secure/cause_pdetails/MjQyNDI3",
        external: true,
      },
      { label: "Upcoming Webinars", href: "/events#webinars" },
      { label: "NAHCA Sangha", href: "/events#sangha" },
      { label: "NAHCA Members-Only Meetings", href: "/events#members-only" },
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
  {
    label: "Learn More",
    href: "/learn-more",
    children: [
      { label: "Ten Useful Resources", href: "/learn-more#resources" },
      { label: "Code of Ethics", href: "/learn-more#ethics" },
    ],
  },
  { label: "Join Us", href: "/membership" },
  { label: "Get In Touch", href: "/contact" },
];
