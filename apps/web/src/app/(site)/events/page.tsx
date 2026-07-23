import Link from "next/link";
import { Container } from "@/components/Container";
import { getUpcomingEvents } from "@/lib/cms";

const EXCERPT_LIMIT = 300;

function excerptOf(html: string, max = EXCERPT_LIMIT): string {
  const text = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  return text.length > max ? `${text.slice(0, max)}…` : text;
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default async function EventsPage() {
  const events = await getUpcomingEvents(50);

  return (
    <Container>
      <div className="py-16">
        <h1 className="font-heading text-3xl font-medium text-heading">Events</h1>
        <p className="mt-2 text-ink/70">
          Annual Conference, Monthly Q&amp;A, Webinars, Sangha, and Members-Only Meetings.
        </p>

        {events.length > 0 ? (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
              <div
                key={event.id}
                className="flex h-80 flex-col rounded-lg border border-ink/10 bg-white p-5"
              >
                <p className="text-sm text-ink/50">
                  {formatDate(event.date)} {event.time ? `· ${event.time}` : ""}
                </p>
                <h3 className="mt-1 font-heading font-medium text-heading">{event.title}</h3>
                {event.description && (
                  <p className="mt-2 flex-1 overflow-hidden text-sm leading-relaxed text-ink/70">
                    {excerptOf(event.description)}
                  </p>
                )}
                <div className="mt-3 flex items-center gap-4">
                  <Link
                    href={`/events/${event.id}`}
                    className="text-sm font-medium text-brand hover:text-brand-dark"
                  >
                    Read more →
                  </Link>
                  {event.registrationLink && (
                    <a
                      href={event.registrationLink}
                      className="text-sm font-medium text-brand hover:text-brand-dark"
                    >
                      Register →
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-8 text-sm text-ink/50">
            No events published yet — once events are added in the CMS, they&apos;ll appear here automatically.
          </p>
        )}
      </div>
    </Container>
  );
}
