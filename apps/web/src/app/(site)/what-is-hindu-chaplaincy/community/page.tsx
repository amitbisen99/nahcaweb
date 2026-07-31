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

interface CommunityOrg {
  title: string;
  description?: string;
  url: string;
}

const COMMUNITY_ORGS: CommunityOrg[] = [
  {
    title: "Chinmaya International Foundation (CIF)",
    description:
      "Chinmaya International Foundation (CIF), the Academia of Sanskrit Research and Indology, is the research wing of the Chinmaya Mission Worldwide. It is a centre of excellence for the study, research and dissemination of knowledge in the areas of Indian philosophy, culture, art and science, business management, both modern and ancient.",
    url: "https://chinfo.org/",
  },
  {
    title: "Team AID",
    description:
      "Team AID is a national 501(c)3 offering emergency guidance and support for foreign visitors to the US. Hear how this dynamic cadre of volunteers help coordinate funeral arrangements, repatriation and transportation of remains with local and national organizations and the Indian embassy.",
    url: "https://teamaid.org/",
  },
  {
    title: "American Red Cross",
    description:
      "American Red Cross helps those affected by disasters. Red Cross volunteers and staff work to deliver vital services – from providing relief and support to those in crisis, to helping you be prepared to respond in emergencies.",
    url: "https://www.redcross.org/",
  },
  {
    title: "The Hindu Chaplain",
    url: "https://thehinduchaplain.com",
  },
];

export default function CommunityPage() {
  return (
    <>
      <EventBanner title="Community" image="/chaplaincy/puja.jpg" />

      <section className="bg-white py-16">
        <Container>
          <p className="text-black">
            NAHCA works alongside a wider community of organizations that support Hindu spiritual
            life and provide care for those in need. Explore some of these partners and resources
            below.
          </p>

          <div className="mt-10 flex flex-col gap-5">
            {COMMUNITY_ORGS.map((org) => (
              <div
                key={org.title}
                className="rounded-xl border border-ink/10 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-brand/40 hover:shadow-lg"
              >
                <h2 className="font-heading text-lg font-medium text-heading">{org.title}</h2>
                {org.description && (
                  <p className="mt-2 text-sm leading-relaxed text-black">{org.description}</p>
                )}
                <a
                  href={org.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand hover:text-brand-dark"
                >
                  Visit Website
                  <ExternalLinkIcon className="h-3.5 w-3.5" />
                </a>
              </div>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
