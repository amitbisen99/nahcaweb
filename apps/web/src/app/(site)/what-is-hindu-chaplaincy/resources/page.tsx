import { SVGProps } from "react";
import { EventBanner } from "@/components/EventBanner";
import { Container } from "@/components/Container";

function ExternalLinkIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M7 17 17 7M8 7h9v9" />
    </svg>
  );
}

function GlobeIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c2.5 2.5 3.8 5.7 3.8 9s-1.3 6.5-3.8 9c-2.5-2.5-3.8-5.7-3.8-9s1.3-6.5 3.8-9Z" />
    </svg>
  );
}

function YouTubeIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M22 8.4c0-2-1.6-3.6-3.6-3.6C15.9 4.5 12 4.5 12 4.5s-3.9 0-6.4.3C3.6 4.8 2 6.4 2 8.4v7.2c0 2 1.6 3.6 3.6 3.6 2.5.3 6.4.3 6.4.3s3.9 0 6.4-.3c2-.1 3.6-1.7 3.6-3.6V8.4ZM9.8 15.3V8.7l6 3.3-6 3.3Z" />
    </svg>
  );
}

function ArrowRightIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

interface ResourceLink {
  label: string;
  url: string;
}

interface Resource {
  title: string;
  meta: string;
  description?: string;
  url?: string;
  extraLinks?: ResourceLink[];
}

const RESOURCES: Resource[] = [
  {
    title: "Hindu Approaches to Spiritual Care",
    meta: "Edited by Lucinda Mosher and Vineet Chander · Jessica Kingsley Publishers · October 2019",
    description: "The first book to address Hindu chaplaincy in the United States.",
    url: "https://www.amazon.com/Hindu-Approaches-Spiritual-Care-Chaplaincy/dp/1785926055",
    extraLinks: [
      {
        label: "Review by Prof. Deven Patel — Chaplaincy Innovation Lab",
        url: "https://chaplaincyinnovation.org/2020/06/book-review-hindu-approaches-to-spiritual-care",
      },
      {
        label: "Review by Dr. Joe Pritchett — Franklin & Marshall College",
        url: "https://www.fandm.edu/directory/joseph-pritchett.html",
      },
    ],
  },
  {
    title: "Hindu Chaplaincy: The Oxford Centre for Hindu Studies Guide",
    meta: "Dr. Nicholas Sutton, Vineet Chander & Shaunaka Rishi Das · Oxford Centre for Hindu Studies · July 2017",
    url: "https://a.co/d/0iVWAjch",
  },
  {
    title: "Hinduism and Chaplaincy: Relating Core Concepts to Spiritual Care",
    meta: "Dr. Asha Shipman · Convergence Magazine · May 2020",
    url: "https://drive.google.com/file/d/1bD10osc0LtswdmCzErogXa6mqIgbjXq5/view?usp=sharing",
  },
  {
    title: "A Room with a View: Accommodating Hindu Religious Practice on a College Campus",
    meta: "Vineet Chander · Journal of College and Character, Vol. 14, Issue 2 · May 2013",
    url: "https://drive.google.com/file/d/1VsW5uF1FttmwlfitOyFGE8qWGE_uld3m/view?usp=sharing",
  },
  {
    title: "Hindu Chaplaincy in US Higher Education",
    meta: "Dr. Asha Shipman · Journal of Interreligious Studies, Vol. 31 · November 2020, pp. 21–36",
    url: "https://irstudies.org/index.php/jirs/issue/view/39",
  },
  {
    title: "Hindu Hospital Chaplain Tells Her Covid Story",
    meta: "Shama Mehta · Hinduism Today Magazine · Special Feature: Life Under Lockdown, New York to New Delhi · Oct/Nov/Dec 2020",
    url: "https://www.hinduismtoday.com/magazine/oct-nov-dec-2020/special-feature-life-under-lockdown-new-york-to-new-delhi/",
  },
  {
    title: "“That's So Hindu” Podcast — Interview with Brahmachariji",
    meta: "Hindu American Foundation · 2020",
    description:
      "Suhag Shukla speaks with Dr. Brahmachari Sharan, Director of Dharmic Life and campus ministry at Georgetown, about applying ancient Hindu spiritual teachings to contemporary social challenges.",
    url: "https://www.hinduamerican.org/the-feed/podcasts/thats-so-hindu-podcast",
  },
  {
    title: "Chaplaincy Innovation Lab Podcast — Interview on Hindu Chaplaincy",
    meta: "CIL Executive Director Michael Skaggs with Asha Shipman, Hindu Chaplain at Yale University · December 16, 2019",
    url: "https://chaplaincyinnovation.org/2019/12/cil-audio-short-hindu-chaplaincy",
  },
  {
    title: "A Glimpse into Hindu Practices and Spiritual Care in the Season of Pandemic",
    meta: "Dr. Asha Shipman · Convergence on Campus Blog · March 24, 2021",
    url: "https://docs.google.com/document/d/1H3Yg2otZ-TG7wm8mbKSaEgouXKmf-TSL/edit?usp=drive_link&ouid=115543048220244866596&rtpof=true&sd=true",
  },
];

interface BoardLink {
  institution: string;
  links: ResourceLink[];
}

const BOARD_LINKS: BoardLink[] = [
  {
    institution: "Princeton University Hindu Life Program",
    links: [
      { label: "Website", url: "https://hindu.princeton.edu/about/vineet/" },
      { label: "YouTube Channel", url: "https://www.youtube.com/channel/UCXI_S3tzWojr218Ik-Q63iQ" },
    ],
  },
  {
    institution: "Rochester Institute of Technology — Spiritual and Religious Life",
    links: [{ label: "Hindu Student Life Website", url: "https://campusgroups.rit.edu/hsl/home/" }],
  },
  {
    institution: "University of Rochester — The Interfaith Chapel, Hindu Student Support",
    links: [{ label: "Website", url: "https://www.rochester.edu/chapel/faith-communities/#hindu" }],
  },
  {
    institution: "Shama Mehta, Hindu Chaplain",
    links: [{ label: "Being Dharmic Blog", url: "https://shamamehta.com/" }],
  },
  {
    institution: "Yale University Hindu Life Program",
    links: [
      { label: "Website", url: "https://hindulife.yale.edu/" },
      { label: "Yale Chaplain's Office YouTube Channel", url: "https://www.youtube.com/channel/UClWxGcXJ5kvmofupKWV3KQA" },
    ],
  },
];

export default function UsefulResourcesPage() {
  return (
    <>
      <EventBanner title="Useful Resources" image="/chaplaincy/colorful-palm-leaf-books.jpg" />

      <section className="bg-white py-16">
        <Container>
          <div>
            <p className="text-black">
              Hindu chaplaincy is a nascent but growing field in North America. Critical to
              NAHCA&apos;s mission is to provide resources on Hindu spiritual caregiving for use
              by spiritual providers and institutions whose mission includes support for Hindu
              care recipients.
            </p>
            <p className="mt-4 text-black">
              Many of the resources listed on this page offer the basics: what Hindu spiritual
              caregiving is, who it is for, and why it is important. Also included are links to
              Board members&apos; professional websites as examples of the scope and breadth of
              their work.
            </p>
          </div>

          <div className="mt-14 flex flex-col gap-5">
            {RESOURCES.map((resource) => (
              <div
                key={resource.title}
                className="group relative rounded-xl border border-ink/10 bg-sand/30 p-6 pr-56 transition-all duration-300 hover:-translate-y-1 hover:border-brand/40 hover:shadow-lg"
              >
                <ArrowRightIcon
                  strokeWidth={1}
                  className="pointer-events-none absolute right-6 top-1/2 h-10 w-50 -translate-y-1/2 text-brand opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                />
                <h2 className="font-heading text-lg font-medium text-heading">{resource.title}</h2>
                <p className="mt-1.5 text-sm text-black">{resource.meta}</p>
                {resource.description && (
                  <p className="mt-3 text-sm leading-relaxed text-black">{resource.description}</p>
                )}

                {resource.url && (
                  <a
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand hover:text-brand-dark"
                  >
                    View Resource
                    <ExternalLinkIcon className="h-3.5 w-3.5" />
                  </a>
                )}

                {resource.extraLinks && (
                  <div className="mt-3 flex flex-col gap-1.5 border-t border-ink/10 pt-3">
                    {resource.extraLinks.map((link) => (
                      <a
                        key={link.url}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-sm text-black hover:text-brand"
                      >
                        <ExternalLinkIcon className="h-3 w-3 flex-none" />
                        {link.label}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-16 border-t border-ink/10 pt-10">
            <h2 className="font-heading text-2xl font-medium text-heading">
              NAHCA Board Members&apos; Websites &amp; Social Media
            </h2>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {BOARD_LINKS.map((item) => (
              <div key={item.institution} className="rounded-xl border border-ink/10 bg-white p-6">
                <h3 className="font-heading text-base font-medium text-heading">
                  {item.institution}
                </h3>
                <div className="mt-3 flex items-center gap-2">
                  {item.links.map((link) => {
                    const isYouTube = link.url.includes("youtube.com");
                    const LinkIcon = isYouTube ? YouTubeIcon : GlobeIcon;
                    return (
                      <a
                        key={link.url}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={link.label}
                        title={link.label}
                        className="flex h-9 w-9 flex-none items-center justify-center rounded-full border border-ink/10 text-brand transition-colors hover:border-brand hover:bg-sand"
                      >
                        <LinkIcon className="h-4 w-4" />
                      </a>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
