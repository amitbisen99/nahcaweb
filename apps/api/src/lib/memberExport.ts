import type { MemberProfile } from "@prisma/client";

// Spreadsheet columns for everything a member fills in on the membership form
// (see MemberProfile and apps/web/src/components/MemberProfileQuestionnaire.tsx).
// Used by the Members export; kept next to the form's own field list so a new
// question gets a column here too.
export const PROFILE_EXPORT_COLUMNS: { header: string; key: string; width: number }[] = [
  { header: "Preferred Pronouns", key: "pronouns", width: 16 },
  { header: "Contact Number", key: "phone", width: 18 },
  { header: "Street Address", key: "street", width: 30 },
  { header: "State/Territory", key: "state", width: 18 },
  { header: "Country", key: "country", width: 10 },
  { header: "Postal Code", key: "postalCode", width: 12 },
  { header: "Uses WhatsApp", key: "usesWhatsapp", width: 14 },
  { header: "WhatsApp Mobile Number", key: "whatsappNumber", width: 20 },
  { header: "May NAHCA Contact via WhatsApp", key: "whatsappContactOk", width: 18 },
  { header: "Religious/Spiritual Traditions", key: "traditions", width: 36 },
  { header: "Primary Role", key: "primaryRole", width: 26 },
  { header: "Chaplain Setting", key: "primaryRoleSetting", width: 18 },
  { header: "Interested In", key: "interestedIn", width: 18 },
  { header: "Primary Role in Spiritual Care", key: "spiritualCareRole", width: 28 },
  { header: "Affiliated Organizations", key: "affiliatedOrganizations", width: 30 },
  { header: "Role/Program of Study", key: "studyProgram", width: 28 },
  { header: "Earlier Employment Answers", key: "legacyEmployment", width: 40 },
  { header: "How They Heard About NAHCA", key: "hearAboutUs", width: 30 },
  { header: "Contexts of Spiritual Care of Interest", key: "careContexts", width: 32 },
  { header: "Board Certified", key: "boardCertified", width: 14 },
  { header: "Board Certification Organization", key: "boardCertifiedOrg", width: 28 },
  { header: "Endorsed", key: "endorsed", width: 10 },
  { header: "Endorsed By", key: "endorsedBy", width: 24 },
  { header: "Professional Organization Memberships", key: "orgMemberships", width: 40 },
];

const EMPTY = "—";

const yesNo = (value: boolean | null | undefined) => (value === true ? "Yes" : value === false ? "No" : EMPTY);

const text = (value: string | null | undefined) => value?.trim() || EMPTY;

// A JSON column that should be a string[] — anything else counts as empty.
function list(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((v): v is string => typeof v === "string" && v.trim() !== "") : [];
}

// "Hospital" or, for "Other", "Other: Prison ministry".
function choice(value: string | null | undefined, other: string | null | undefined): string {
  if (!value?.trim()) return EMPTY;
  return value === "Other" && other?.trim() ? `Other: ${other.trim()}` : value;
}

const ROLE_LABELS: Record<string, string> = {
  chaplain: "Chaplain/Spiritual Caregiver",
  student: "Chaplaincy student",
};

const EMPLOYMENT_TYPE_LABELS: Record<string, string> = {
  full_time: "Full Time",
  part_time: "Part Time",
  volunteer: "Volunteer",
};

interface PlaceRow {
  spiritualCareRole: string;
  affiliatedOrganizations: string;
  studyProgram: string;
}

// The member's "Places of employment and/or study" rows. Members saved in the
// short window when this was one set of columns have their answers there
// instead, so fall back to those as a single row — but only if rows were never
// saved at all (null); an empty list means they cleared them on purpose.
function readPlaces(p: MemberProfile): PlaceRow[] {
  const trimmed = (v: unknown) => (typeof v === "string" ? v.trim() : "");

  if (Array.isArray(p.placesOfEmploymentStudy)) {
    return p.placesOfEmploymentStudy
      .map((row) => {
        const r = (row ?? {}) as Record<string, unknown>;
        return {
          spiritualCareRole: trimmed(r.spiritualCareRole),
          affiliatedOrganizations: trimmed(r.affiliatedOrganizations),
          studyProgram: trimmed(r.studyProgram),
        };
      })
      .filter((r) => r.spiritualCareRole || r.affiliatedOrganizations || r.studyProgram);
  }

  const legacy = {
    spiritualCareRole: trimmed(p.spiritualCareRole),
    affiliatedOrganizations: trimmed(p.affiliatedOrganizations),
    studyProgram: trimmed(p.studyProgram),
  };
  return legacy.spiritualCareRole || legacy.affiliatedOrganizations || legacy.studyProgram ? [legacy] : [];
}

// One cell per column, one entry per row, in the same order — so with
// several places, the 1st role lines up with the 1st organization. A row
// that left one answer blank shows a dash there to keep that alignment.
function placeColumn(rows: PlaceRow[], key: keyof PlaceRow): string {
  return rows.length ? rows.map((r) => r[key] || EMPTY).join("; ") : EMPTY;
}

function legacyEmployment(value: unknown): string {
  if (!Array.isArray(value)) return EMPTY;
  const rows = value
    .map((row) => {
      const r = row as { employerName?: string; jobTitle?: string; employmentType?: string };
      if (!r.employerName) return null;
      const extras = [r.jobTitle, r.employmentType ? EMPLOYMENT_TYPE_LABELS[r.employmentType] : null].filter(Boolean);
      return extras.length ? `${r.employerName} (${extras.join(", ")})` : r.employerName;
    })
    .filter(Boolean);
  return rows.length ? rows.join("; ") : EMPTY;
}

// One row's worth of values for PROFILE_EXPORT_COLUMNS. A member who never
// filled in the form (e.g. an institution's own login) gets dashes throughout.
export function profileExportValues(p: MemberProfile | null | undefined): Record<string, string> {
  if (!p) return Object.fromEntries(PROFILE_EXPORT_COLUMNS.map((c) => [c.key, EMPTY]));

  const hasStructuredAddress = Boolean(p.addressStreet || p.addressState || p.addressPostalCode);
  const places = readPlaces(p);

  const traditions = list(p.religiousTraditions).map((t) =>
    t === "Something else" && p.religiousTraditionOther?.trim() ? `Something else: ${p.religiousTraditionOther.trim()}` : t
  );
  const orgs = list(p.orgMemberships).map((o) =>
    o === "Other" && p.orgMembershipOther?.trim() ? `Other: ${p.orgMembershipOther.trim()}` : o
  );
  const heard = p.hearAboutUs?.trim()
    ? p.hearAboutUsOther?.trim()
      ? `${p.hearAboutUs} — ${p.hearAboutUsOther.trim()}`
      : p.hearAboutUs
    : EMPTY;

  return {
    pronouns: text(p.preferredPronouns),
    phone: text(p.phone),
    // Members from before the address was split into fields only have the old
    // free-text address; show that in the street column rather than lose it.
    street: hasStructuredAddress ? text(p.addressStreet) : text(p.mailingAddress),
    state: text(p.addressState),
    country: text(p.addressCountry),
    postalCode: text(p.addressPostalCode),
    usesWhatsapp: yesNo(p.usesWhatsapp),
    whatsappNumber: text(p.whatsappNumber),
    whatsappContactOk: yesNo(p.whatsappContactOk),
    traditions: traditions.length ? traditions.join("; ") : EMPTY,
    primaryRole: p.primaryRole ? (ROLE_LABELS[p.primaryRole] ?? p.primaryRole) : EMPTY,
    primaryRoleSetting: choice(p.primaryRoleSetting, p.primaryRoleSettingOther),
    interestedIn: choice(p.interestedIn, p.interestedInOther),
    spiritualCareRole: placeColumn(places, "spiritualCareRole"),
    affiliatedOrganizations: placeColumn(places, "affiliatedOrganizations"),
    studyProgram: placeColumn(places, "studyProgram"),
    legacyEmployment: legacyEmployment(p.employment),
    hearAboutUs: heard,
    careContexts: list(p.careContexts).join("; ") || EMPTY,
    boardCertified: yesNo(p.boardCertified),
    boardCertifiedOrg: text(p.boardCertifiedOrg),
    endorsed: yesNo(p.endorsed),
    endorsedBy: text(p.endorsedBy),
    orgMemberships: orgs.length ? orgs.join("; ") : EMPTY,
  };
}
