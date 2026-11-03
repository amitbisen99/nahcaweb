import { SVGProps } from "react";
import { Container } from "@/components/Container";
import { EventBanner } from "@/components/EventBanner";
import { getPartners } from "@/lib/cms";

function ChevronIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M8 5l8 7-8 7z" />
    </svg>
  );
}

// Logos that ship with the site are "/partners/..."; anything an admin uploads
// is served by the API.
function logoSrc(logoUrl: string) {
  return logoUrl.startsWith("/uploads/") ? `${process.env.NEXT_PUBLIC_API_URL}${logoUrl}` : logoUrl;
}

export default async function OrganizationalPartnersPage() {
  const partners = await getPartners();

  return (
    <>
      <EventBanner title="Organizational Partners" image="/brand/temple-home.jpg" />
      <section className="bg-white py-20">
      <Container>
        <div>
          <p className="text-black">
            NAHCA collaborates with a growing network of organizations that support Hindu spiritual care
            and chaplaincy across North America.
          </p>
        </div>

        {partners.length === 0 ? (
          <p className="mt-14 text-sm text-black">Our partners will be listed here soon.</p>
        ) : (
          <div className="mt-14 grid gap-6 sm:grid-cols-2">
            {partners.map((partner) => (
              <a
                key={partner.id}
                href={partner.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col items-center gap-5 rounded-xl border border-ink/10 p-8 text-center transition-colors hover:border-brand/40"
              >
                <div className="flex h-20 w-full items-center justify-center">
                  {partner.logoUrl && (
                    <img
                      src={logoSrc(partner.logoUrl)}
                      alt={partner.name}
                      className="max-h-full max-w-full object-contain"
                    />
                  )}
                </div>
                <h2 className="font-heading text-lg font-medium text-heading">{partner.name}</h2>
                <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand group-hover:text-brand-dark">
                  Visit Website
                  <ChevronIcon className="h-3 w-3" />
                </span>
              </a>
            ))}
          </div>
        )}
      </Container>
      </section>
    </>
  );
}
