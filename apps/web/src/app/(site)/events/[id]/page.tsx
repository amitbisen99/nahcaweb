import { notFound } from "next/navigation";
import Link from "next/link";
import { Container } from "@/components/Container";
import { AddToCalendar } from "@/components/AddToCalendar";
import { SpeakerCards } from "@/components/SpeakerCards";
import { Button } from "@/components/Button";
import { auth } from "@/auth";
import { getEvent, formatEventFee } from "@/lib/cms";

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  const event = await getEvent(id, session?.apiToken);
  if (!event) notFound();

  return (
    <div className="bg-white">
      <Container>
        <div className="py-16">
          <Link href="/events" className="text-sm font-semibold text-brand hover:text-brand-dark">
            ← All Events
          </Link>

          <div className="mt-6">
            {event.featuredImageUrl && (
              <img
                src={`${process.env.NEXT_PUBLIC_API_URL}${event.featuredImageUrl}`}
                alt=""
                className="mb-6 aspect-[2/1] w-full max-w-[600px] rounded-xl border border-ink/10 object-cover"
              />
            )}

            {event.access === "members_only" && (
              <span className="mb-2 inline-block w-fit rounded-full bg-brand/10 px-2.5 py-1 text-xs font-semibold text-brand-dark">
                Members Only
              </span>
            )}
            <p className="text-sm text-black">
              {formatDate(event.date)} {event.time ? `· ${event.time}` : ""}
            </p>
            <h1 className="mt-1 font-heading text-3xl font-medium text-heading">{event.title}</h1>
            {formatEventFee(event.priceCents) && (
              <p className="mt-1 text-sm font-semibold text-brand-dark">{formatEventFee(event.priceCents)}</p>
            )}

            {event.description && (
              <div
                className="mt-6 text-base leading-relaxed text-black [&_a]:text-brand [&_a]:underline [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:pl-5"
                dangerouslySetInnerHTML={{ __html: event.description }}
              />
            )}

            {event.speakers && event.speakers.length > 0 && (
              <SpeakerCards speakers={event.speakers} />
            )}

            <div className="mt-8 flex flex-wrap items-center gap-3">
              {/* Not wired up yet — placeholder only, per explicit instruction
                  to hold off on the actual join/payment flow for now. */}
              <Button type="button" variant="solid">
                Join
              </Button>
              <AddToCalendar
                event={{
                  title: event.title,
                  description: event.description,
                  date: event.date,
                  time: event.time,
                  url: event.registrationLink,
                }}
                triggerClassName="inline-flex items-center justify-center gap-1.5 rounded-lg bg-brand px-6 py-3 font-body text-sm font-semibold text-white transition-colors duration-200 hover:bg-brand-dark"
              />
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
