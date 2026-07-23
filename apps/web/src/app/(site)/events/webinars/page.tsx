import Link from "next/link";
import { Container } from "@/components/Container";
import { EventBanner } from "@/components/EventBanner";
import { getOpenWebinars } from "@/lib/cms";

const EXCERPT_LIMIT = 300;

function excerptOf(text: string, max = EXCERPT_LIMIT): string {
  const clean = text.replace(/\s+/g, " ").trim();
  return clean.length > max ? `${clean.slice(0, max)}…` : clean;
}

export default async function WebinarsPage() {
  const webinars = await getOpenWebinars();

  return (
    <>
      <EventBanner title="Upcoming Webinars" image="/brand/temple-home.jpg" />
      <Container>
        <div className="py-16">
          <p className="max-w-2xl text-ink/70">
            NAHCA offers webinars on topics relevant to Hindu chaplaincy — from professional
            development and endorsement pathways to specific spiritual care practices across
            healthcare, higher education, and community settings.
          </p>

          {webinars.length > 0 ? (
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {webinars.map((webinar) => (
                <div
                  key={webinar.id}
                  className="flex h-80 flex-col rounded-lg border border-ink/10 bg-white p-5"
                >
                  {webinar.speakerInfo && (
                    <p className="text-sm text-ink/50">{webinar.speakerInfo}</p>
                  )}
                  <h3 className="mt-1 font-heading font-medium text-heading">{webinar.title}</h3>
                  {webinar.description && (
                    <p className="mt-2 flex-1 overflow-hidden text-sm leading-relaxed text-ink/70">
                      {excerptOf(webinar.description)}
                    </p>
                  )}
                  <p className="mt-2 text-sm font-semibold text-ink">
                    {webinar.priceCents ? `$${(webinar.priceCents / 100).toFixed(2)}` : "Free"}
                  </p>
                  <div className="mt-3 flex items-center gap-4">
                    <Link
                      href={`/events/webinars/${webinar.id}`}
                      className="text-sm font-medium text-brand hover:text-brand-dark"
                    >
                      Read more →
                    </Link>
                    {webinar.zoomOrYoutubeLink && (
                      <a
                        href={webinar.zoomOrYoutubeLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-medium text-brand hover:text-brand-dark"
                      >
                        Join →
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-8 text-sm text-ink/50">
              No webinars published yet — upcoming webinar dates and registration links will
              appear here.
            </p>
          )}
        </div>
      </Container>
    </>
  );
}
