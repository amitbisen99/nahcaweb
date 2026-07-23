import Link from "next/link";
import { Container } from "@/components/Container";
import { EventBanner } from "@/components/EventBanner";
import { auth } from "@/auth";
import { getOpenWebinars } from "@/lib/cms";

const EXCERPT_LIMIT = 300;

function excerptOf(html: string, max = EXCERPT_LIMIT): string {
  const text = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  return text.length > max ? `${text.slice(0, max)}…` : text;
}

export default async function WebinarsPage() {
  const session = await auth();
  const webinars = await getOpenWebinars(session?.apiToken);

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
                  {webinar.access === "members_only" && (
                    <span className="mb-1 inline-block w-fit rounded-full bg-brand/10 px-2 py-0.5 text-xs font-semibold text-brand-dark">
                      Members Only
                    </span>
                  )}
                  <h3 className="font-heading font-medium text-heading">{webinar.title}</h3>
                  {webinar.description && (
                    <p className="mt-2 flex-1 overflow-hidden text-sm leading-relaxed text-ink/70">
                      {excerptOf(webinar.description)}
                    </p>
                  )}
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
