import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { CONTENT_TYPES, ContentTypeKey } from "@/lib/contentTypes";
import { getContentItem, getEventRegistration } from "@/lib/adminApi";
import { Section } from "@/components/MemberProfileFormFields";

const EMPLOYMENT_TYPE_LABELS: Record<string, string> = {
  full_time: "Full Time",
  part_time: "Part Time",
  volunteer: "Volunteer",
};

function Field({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div>
      <p className="text-sm font-medium text-black">{label}</p>
      <p className="mt-0.5 text-sm text-ink">{value?.trim() ? value : "—"}</p>
    </div>
  );
}

function ListField({ label, values }: { label: string; values: string[] | null | undefined }) {
  return (
    <div>
      <p className="text-sm font-medium text-black">{label}</p>
      {values && values.length > 0 ? (
        <ul className="mt-0.5 flex flex-col gap-0.5">
          {values.map((v) => (
            <li key={v} className="text-sm text-ink">
              • {v}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-0.5 text-sm text-ink">—</p>
      )}
    </div>
  );
}

function YesNoField({ label, value }: { label: string; value: boolean | null | undefined }) {
  return <Field label={label} value={value === true ? "Yes" : value === false ? "No" : undefined} />;
}

// Read-only — a guest registration has no account to edit, and a member's
// quick-join has no questionnaire at all (just their existing account info).
export default async function EventAttendeeDetailPage({
  params,
}: {
  params: Promise<{ type: string; id: string; attendeeId: string }>;
}) {
  const { type, id, attendeeId } = await params;
  const config = CONTENT_TYPES[type as ContentTypeKey];
  if (!config || (type !== "events" && type !== "webinars")) notFound();

  const session = await auth();
  const token = session?.apiToken ?? "";

  const [item, registration] = await Promise.all([
    getContentItem(config.key, id, token),
    getEventRegistration(Number(attendeeId), token),
  ]);
  if (!item || !registration || registration.eventCode !== item.eventCode) notFound();

  const isMember = Boolean(registration.user);

  return (
    <div>
      <Link
        href={`/admin/content/${config.key}/${id}/attendees`}
        className="text-sm font-semibold text-brand hover:text-brand-dark"
      >
        ← Attendees
      </Link>

      <h1 className="mt-1 font-heading text-3xl font-medium text-heading">
        {registration.user?.name ?? registration.name ?? "Attendee"}
      </h1>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${
            registration.status === "active" ? "bg-forest/10 text-forest" : "bg-ink/10 text-black"
          }`}
        >
          {registration.status}
        </span>
        <span className="rounded-full bg-sand px-2.5 py-1 text-xs font-semibold text-black">
          {isMember ? "Existing member" : "Guest registration"}
        </span>
        {registration.payment && (
          <span className="rounded-full bg-brand/10 px-2.5 py-1 text-xs font-semibold text-brand-dark">
            Paid ${(registration.payment.amountCents / 100).toFixed(2)}
          </span>
        )}
      </div>

      {isMember ? (
        <div className="mt-6 rounded-xl border border-ink/10 bg-white p-6 sm:p-8">
          <p className="text-sm text-black">
            {registration.user?.name} joined using their existing NAHCA membership account — no separate
            registration form or payment was collected.
          </p>
          <Field label="Email" value={registration.user?.email} />
        </div>
      ) : (
        <div className="mt-6 flex flex-col gap-6 rounded-xl border border-ink/10 bg-white p-6 sm:p-8">
          <Section title="Basic information" divider={false}>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Name" value={registration.name} />
              <Field label="Email" value={registration.email} />
              <Field label="Preferred pronouns" value={registration.preferredPronouns} />
              <Field label="Telephone number" value={registration.phone} />
            </div>
            <Field label="Mailing address" value={registration.mailingAddress} />
            <div className="grid gap-4 sm:grid-cols-2">
              <YesNoField label="Uses WhatsApp?" value={registration.usesWhatsapp} />
              <YesNoField label="May NAHCA contact via WhatsApp?" value={registration.whatsappContactOk} />
            </div>
          </Section>

          <Section title="Religious/spiritual tradition">
            <ListField label="Traditions" values={registration.religiousTraditions} />
            {registration.religiousTraditionOther && (
              <Field label="Something else — specified as" value={registration.religiousTraditionOther} />
            )}
          </Section>

          <Section title="Primary role in spiritual care">
            <Field
              label="Role"
              value={
                registration.primaryRole === "chaplain"
                  ? "Chaplain/Spiritual Caregiver"
                  : registration.primaryRole === "student"
                    ? "Chaplaincy student (degree, certificate program or chaplaincy courses)"
                    : undefined
              }
            />
          </Section>

          <Section title="Places of employment and/or study">
            {registration.employment && registration.employment.length > 0 ? (
              <div className="flex flex-col gap-3">
                {registration.employment.map((row, i) => (
                  <div key={i} className="rounded-lg border border-ink/10 p-4">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <Field label="Employer Name / Affiliated Organization" value={row.employerName} />
                      <Field label="Job Title" value={row.jobTitle} />
                    </div>
                    <Field
                      label="Full Time/Part Time/Volunteer"
                      value={row.employmentType ? EMPLOYMENT_TYPE_LABELS[row.employmentType] : undefined}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-ink">—</p>
            )}
          </Section>

          <Section title="How did you hear about NAHCA?">
            <Field label="Source" value={registration.hearAboutUs} />
            {registration.hearAboutUsOther && <Field label="Specified as" value={registration.hearAboutUsOther} />}
          </Section>
        </div>
      )}
    </div>
  );
}
