import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { getEventAttendee } from "@/lib/api";
import { formatDate } from "@/lib/formatDate";
import { PAYMENT_STATUS_STYLES } from "@/lib/membershipLabels";
import { Section } from "@/components/MemberProfileFormFields";

function Field({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div>
      <p className="text-sm font-medium text-black">{label}</p>
      <p className="mt-0.5 text-sm text-ink">{value?.trim() ? value : "—"}</p>
    </div>
  );
}

const yesNo = (value: boolean | null) => (value === true ? "Yes" : value === false ? "No" : null);

// Read-only: one registration with everything known about the person.
export default async function EventAttendeeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const attendeeId = Number(id);
  if (!Number.isInteger(attendeeId)) notFound();

  const session = await auth();
  const attendee = await getEventAttendee(attendeeId, session?.apiToken ?? "");
  if (!attendee) notFound();

  const traditions = [...attendee.religiousTraditions, attendee.religiousTraditionOther].filter(Boolean).join(", ");
  const when = [attendee.eventDate ? formatDate(attendee.eventDate) : null, attendee.eventTime].filter(Boolean).join(" · ");

  return (
    <div>
      <Link href="/admin/event-attendees" className="text-sm font-semibold text-brand hover:text-brand-dark">
        ← Event Attendees
      </Link>

      <h1 className="mt-1 font-heading text-3xl font-medium text-heading">{attendee.name ?? "Attendee"}</h1>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
            attendee.status === "active" ? "bg-forest/10 text-forest" : "bg-amber-100 text-amber-800"
          }`}
        >
          {attendee.status === "active" ? "Confirmed" : "Pending — payment not completed"}
        </span>
        <span className="rounded-full bg-sand px-2.5 py-1 text-xs font-semibold text-black">{attendee.attendeeType}</span>
      </div>

      <div className="mt-6 flex max-w-3xl flex-col gap-6 rounded-xl border border-ink/10 bg-white p-6 sm:p-8">
        <Section title={attendee.eventType ?? "Event"} divider={false}>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={attendee.eventType === "Webinar" ? "Webinar" : "Event"} value={attendee.eventTitle} />
            <Field label="Event code" value={attendee.eventCode} />
            <Field label="Date" value={when || null} />
            <Field label="Registered on" value={formatDate(attendee.createdAt)} />
          </div>
        </Section>

        <Section title="Attendee">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Name" value={attendee.name} />
            <Field label="Email" value={attendee.email} />
            <Field label="Pronouns" value={attendee.pronouns} />
            <Field label="Phone" value={attendee.phone} />
            <Field label="Primary role in spiritual care" value={attendee.primaryRoleLabel} />
            <Field
              label="How did you hear about NAHCA?"
              value={[attendee.hearAboutUs, attendee.hearAboutUsOther].filter(Boolean).join(" — ")}
            />
          </div>
          <Field label="Mailing address" value={attendee.mailingAddress} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Uses WhatsApp?" value={yesNo(attendee.usesWhatsapp)} />
            <Field label="OK to contact on WhatsApp?" value={yesNo(attendee.whatsappContactOk)} />
          </div>
          <Field label="Religious / spiritual traditions" value={traditions} />
          {attendee.employment.length > 0 && (
            <div>
              <p className="text-sm font-medium text-black">Places of employment / study</p>
              <ul className="mt-0.5 flex flex-col gap-0.5">
                {attendee.employment.map((row, i) => (
                  <li key={i} className="text-sm text-ink">
                    • {[row.employerName, row.jobTitle].filter(Boolean).join(" — ")}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Section>

        <Section title="Payment">
          {attendee.amountCents === null ? (
            <p className="text-sm text-ink">No payment on record — a free registration.</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Amount paid" value={`$${(attendee.amountCents / 100).toFixed(2)}`} />
              <div>
                <p className="text-sm font-medium text-black">Payment status</p>
                {attendee.paymentStatus && (
                  <span
                    className={`mt-0.5 inline-block rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${
                      PAYMENT_STATUS_STYLES[attendee.paymentStatus] ?? "bg-ink/10 text-black"
                    }`}
                  >
                    {attendee.paymentStatus}
                  </span>
                )}
              </div>
              <Field label="Coupon code" value={attendee.couponCode} />
              <Field label="Payment reference" value={attendee.paymentRef} />
            </div>
          )}
        </Section>
      </div>
    </div>
  );
}
