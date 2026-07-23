import { notFound } from "next/navigation";
import Link from "next/link";
import { Container } from "@/components/Container";
import { Button } from "@/components/Button";
import { getEvent } from "@/lib/cms";

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const event = await getEvent(id);
  if (!event) notFound();

  return (
    <Container>
      <div className="py-16">
        <Link href="/events" className="text-sm font-semibold text-brand hover:text-brand-dark">
          ← All Events
        </Link>

        <div className="mt-6 max-w-2xl">
          {event.featuredImageUrl && (
            <img
              src={`${process.env.NEXT_PUBLIC_API_URL}${event.featuredImageUrl}`}
              alt=""
              className="mb-6 h-64 w-full rounded-xl border border-ink/10 object-cover"
            />
          )}

          <p className="text-sm text-ink/50">
            {event.date} {event.time ? `· ${event.time}` : ""}
          </p>
          <h1 className="mt-1 font-heading text-3xl font-medium text-heading">{event.title}</h1>

          {event.description && (
            <div
              className="mt-6 text-base leading-relaxed text-ink/80 [&_a]:text-brand [&_a]:underline [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:pl-5"
              dangerouslySetInnerHTML={{ __html: event.description }}
            />
          )}

          {event.registrationLink && (
            <Button href={event.registrationLink} className="mt-8">
              Register →
            </Button>
          )}
        </div>
      </div>
    </Container>
  );
}
