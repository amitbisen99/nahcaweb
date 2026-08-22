import { notFound } from "next/navigation";
import Link from "next/link";
import { Container } from "@/components/Container";
import { getEventInfoByCode } from "@/lib/cms";
import { EventJoinForm } from "./EventJoinForm";

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

// Webinars have no scheduled date and get their own wording; Events keep
// the "held on" clause. Mirrors JoinButton.tsx's confirmationMessage and
// the API's buildEventRegistrationReceiptBody — keep all three in sync.
function confirmationMessage(type: "event" | "webinar", title: string, date: string | null): string {
  if (type === "webinar") {
    return `You successfully registered for the webinar '${title}'.`;
  }
  return `You registered for this event '${title}'${date ? ` held on ${formatDate(date)}` : ""}.`;
}

export default async function EventJoinPage({
  params,
  searchParams,
}: {
  params: Promise<{ code: string }>;
  searchParams: Promise<{ status?: string }>;
}) {
  const { code } = await params;
  const { status } = await searchParams;
  const eventInfo = await getEventInfoByCode(code);
  if (!eventInfo) notFound();

  const backHref = eventInfo.type === "webinar" ? "/events/webinars" : "/events";
  const backLabel = eventInfo.type === "webinar" ? "All Webinars" : "All Events";

  return (
    <div className="bg-white">
      <Container>
        <div className="py-16">
          <Link href={backHref} className="text-sm font-semibold text-brand hover:text-brand-dark">
            ← {backLabel}
          </Link>

          <h1 className="mt-6 font-heading text-3xl font-medium text-heading">{eventInfo.title}</h1>

          {status === "success" ? (
            <p className="mt-6 max-w-xl rounded-lg border border-forest/30 bg-forest/5 px-4 py-3 text-sm font-medium text-forest">
              {confirmationMessage(eventInfo.type, eventInfo.title, eventInfo.date)}
            </p>
          ) : (
            <>
              {status === "cancelled" && (
                <p className="mt-6 text-sm text-red-600">
                  Your payment was cancelled — you have not been registered. You can try again below.
                </p>
              )}
              <EventJoinForm eventCode={code} eventTitle={eventInfo.title} basePriceCents={eventInfo.priceCents} />
            </>
          )}
        </div>
      </Container>
    </div>
  );
}
