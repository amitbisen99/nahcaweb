import Image from "next/image";
import { SVGProps } from "react";
import { Container } from "@/components/Container";

function DiamondIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 2l5 10-5 10-5-10z" />
    </svg>
  );
}

function ChevronIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M8 5l8 7-8 7z" />
    </svg>
  );
}

interface Partner {
  name: string;
  url: string;
  logo: string;
  /** Aspect ratio (width/height) of the logo mark itself, for source files that have a
   *  lot of built-in whitespace padding around the mark. When set, the logo is cropped
   *  (object-cover) to this ratio instead of letterboxed (object-contain), so it renders
   *  at the same visual size as the tightly-cropped logos. */
  contentAspect?: number;
}

const PARTNERS: Partner[] = [
  {
    name: "Association of Professional Chaplains (APC)",
    url: "https://www.apchaplains.org/",
    logo: "/partners/apc.png",
  },
  {
    name: "ACPE",
    url: "https://acpe.edu/",
    logo: "/partners/acpe.png",
  },
  {
    name: "Chaplaincy Innovation Lab",
    url: "https://chaplaincyinnovation.org/",
    logo: "/partners/chaplaincy-innovation-lab.jpg",
    contentAspect: 1.82,
  },
  {
    name: "Chinmaya International Foundation",
    url: "https://chinfo.org/all-courses/hindu-spiritual-care/",
    logo: "/partners/chinmaya-international-foundation.jpg",
    contentAspect: 2.94,
  },
];

export default function OrganizationalPartnersPage() {
  return (
    <section className="bg-white py-20">
      <Container>
        <div className="max-w-2xl">
          <span className="inline-flex items-center gap-2 font-heading text-xs font-semibold uppercase tracking-widest text-brand">
            <DiamondIcon className="h-3 w-3" />
            About Us
          </span>
          <h1 className="mt-3 font-heading text-4xl font-bold text-heading">Organizational Partners</h1>
          <p className="mt-4 text-ink/70">
            NAHCA collaborates with a growing network of organizations that support Hindu spiritual care
            and chaplaincy across North America.
          </p>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2">
          {PARTNERS.map((partner) => (
            <a
              key={partner.name}
              href={partner.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col items-center gap-5 rounded-xl border border-ink/10 p-8 text-center transition-colors hover:border-brand/40"
            >
              <div
                className={partner.contentAspect ? "relative h-20 overflow-hidden" : "relative h-20 w-full"}
                style={partner.contentAspect ? { aspectRatio: partner.contentAspect } : undefined}
              >
                <Image
                  src={partner.logo}
                  alt={partner.name}
                  fill
                  className={partner.contentAspect ? "object-cover" : "object-contain"}
                />
              </div>
              <h2 className="font-heading text-lg font-medium text-heading">{partner.name}</h2>
              <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand group-hover:text-brand-dark">
                Visit Website
                <ChevronIcon className="h-3 w-3" />
              </span>
            </a>
          ))}
        </div>
      </Container>
    </section>
  );
}
