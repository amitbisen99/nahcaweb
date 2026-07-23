import { Container } from "@/components/Container";
import { getUpcomingEvents } from "@/lib/cms";

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
              <div key={event.id} className="rounded-lg border border-ink/10 bg-white p-5">
                <p className="text-sm text-ink/50">
                  {event.date} {event.time ? `· ${event.time}` : ""}
                </p>
                <h3 className="mt-1 font-heading font-medium text-heading">{event.title}</h3>
                {event.description && (
                  <div
                    className="mt-2 text-sm leading-relaxed text-ink/70 [&_a]:text-brand [&_a]:underline [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:pl-5"
                    dangerouslySetInnerHTML={{ __html: event.description }}
                  />
                )}
                {event.registrationLink && (
                  <a
                    href={event.registrationLink}
                    className="mt-3 inline-block text-sm font-medium text-brand hover:text-brand-dark"
                  >
                    Register →
                  </a>
                )}
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
