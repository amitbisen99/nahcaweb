import { AdminMembershipDetail } from "@/lib/adminApi";
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

// Read-only display of everything the member filled out at signup. Admins
// can see this data but cannot edit it — only the member can, from their
// own /portal/profile. The only thing admins can change here is the
// active/inactive login toggle rendered above this component.
export function MemberProfileView({ membership }: { membership: AdminMembershipDetail }) {
  const profile = membership.user.profile;
  const isInstitutionSponsor = membership.type === "institutional" && !membership.groupId;

  if (!profile) {
    return (
      <div className="rounded-xl border border-ink/10 bg-white p-6 sm:p-8">
        <p className="text-sm text-black">
          {isInstitutionSponsor
            ? "Institutional sponsors are billing/admin contacts, not chaplains — there's no membership questionnaire on file for them."
            : "This member doesn’t have a filled-out profile questionnaire on file."}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 rounded-xl border border-ink/10 bg-white p-6 sm:p-8">
      <Section title="Basic information" divider={false}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Name" value={membership.user.name} />
          <Field label="Email" value={membership.user.email} />
          <Field label="Preferred pronouns" value={profile.preferredPronouns} />
          <Field label="Telephone number" value={profile.phone} />
        </div>
        <Field label="Mailing address" value={profile.mailingAddress} />
        <div className="grid gap-4 sm:grid-cols-2">
          <YesNoField label="Uses WhatsApp?" value={profile.usesWhatsapp} />
          <YesNoField label="May NAHCA contact via WhatsApp?" value={profile.whatsappContactOk} />
        </div>
      </Section>

      <Section title="Religious/spiritual tradition">
        <ListField label="Traditions" values={profile.religiousTraditions} />
        {profile.religiousTraditionOther && (
          <Field label="Something else — specified as" value={profile.religiousTraditionOther} />
        )}
      </Section>

      <Section title="Primary role in spiritual care">
        <Field
          label="Role"
          value={
            profile.primaryRole === "chaplain"
              ? "Chaplain/Spiritual Caregiver"
              : profile.primaryRole === "student"
                ? "Chaplaincy student (degree, certificate program or chaplaincy courses)"
                : undefined
          }
        />
      </Section>

      <Section title="Places of employment and/or study">
        {profile.employment && profile.employment.length > 0 ? (
          <div className="flex flex-col gap-3">
            {profile.employment.map((row, i) => (
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
        <Field label="Source" value={profile.hearAboutUs} />
        {profile.hearAboutUsOther && <Field label="Specified as" value={profile.hearAboutUsOther} />}
      </Section>

      <Section title="Which contexts of spiritual care are they interested in?">
        <ListField label="Contexts" values={profile.careContexts} />
      </Section>

      <Section title="Board certification">
        <YesNoField label="Board certified?" value={profile.boardCertified} />
        {profile.boardCertified && <Field label="Organization" value={profile.boardCertifiedOrg} />}
      </Section>

      <Section title="Endorsement">
        <YesNoField label="Endorsed for chaplaincy?" value={profile.endorsed} />
        {profile.endorsed && <Field label="Endorser" value={profile.endorsedBy} />}
      </Section>

      <Section title="Professional organization memberships">
        <ListField label="Organizations" values={profile.orgMemberships} />
        {profile.orgMembershipOther && (
          <Field label="Other — specified as" value={profile.orgMembershipOther} />
        )}
      </Section>
    </div>
  );
}
