// Membership questionnaire shared by JoinForm, ClaimForm and the portal
// ProfileForm (via components/MemberProfileQuestionnaire.tsx). Event
// registration has its own older questionnaire and doesn't use anything here.
// Keep the option lists in sync with apps/api/src/lib/memberProfile.ts.

import { HEAR_ABOUT_OTHER_TRIGGERS, PREFERRED_PRONOUN_OPTIONS } from "./memberProfileFields";

// Country is fixed to the USA, so the state list is US states plus DC and the
// territories.
export const US_STATES = [
  "Alabama",
  "Alaska",
  "American Samoa",
  "Arizona",
  "Arkansas",
  "California",
  "Colorado",
  "Connecticut",
  "Delaware",
  "District of Columbia",
  "Florida",
  "Georgia",
  "Guam",
  "Hawaii",
  "Idaho",
  "Illinois",
  "Indiana",
  "Iowa",
  "Kansas",
  "Kentucky",
  "Louisiana",
  "Maine",
  "Maryland",
  "Massachusetts",
  "Michigan",
  "Minnesota",
  "Mississippi",
  "Missouri",
  "Montana",
  "Nebraska",
  "Nevada",
  "New Hampshire",
  "New Jersey",
  "New Mexico",
  "New York",
  "North Carolina",
  "North Dakota",
  "Northern Mariana Islands",
  "Ohio",
  "Oklahoma",
  "Oregon",
  "Pennsylvania",
  "Puerto Rico",
  "Rhode Island",
  "South Carolina",
  "South Dakota",
  "Tennessee",
  "Texas",
  "U.S. Virgin Islands",
  "Utah",
  "Vermont",
  "Virginia",
  "Washington",
  "West Virginia",
  "Wisconsin",
  "Wyoming",
];

// Shared by "Primary role in spiritual care → Chaplain" and "What are you
// interested in?".
export const SPIRITUAL_CARE_SETTINGS = ["Higher Ed", "Hospital", "Military", "Corrections", "Community", "Other"];

// 5 digits, optionally followed by a 4-digit ZIP+4 extension. Same pattern as
// apps/api/src/lib/memberProfile.ts.
const US_POSTAL_CODE = /^\d{5}(-\d{4})?$/;

export function isValidUsPostalCode(value: string): boolean {
  return US_POSTAL_CODE.test(value.trim());
}

export const POSTAL_CODE_ERROR = "Please enter a valid US ZIP code (e.g. 12345 or 12345-6789).";

export type YesNo = "" | "yes" | "no";

// Everything the questionnaire edits, held as plain strings/arrays so a form
// can keep it in one useState and the shared sections can patch it.
export interface ProfileDraft {
  preferredPronouns: string;
  preferredPronounsOther: string;
  addressStreet: string;
  addressState: string;
  addressPostalCode: string;
  phone: string;
  usesWhatsapp: YesNo;
  whatsappNumber: string;
  whatsappContactOk: YesNo;
  religiousTraditions: string[];
  religiousTraditionOther: string;
  primaryRole: "" | "chaplain" | "student";
  primaryRoleSetting: string;
  primaryRoleSettingOther: string;
  interestedIn: string;
  interestedInOther: string;
  spiritualCareRole: string;
  affiliatedOrganizations: string;
  studyProgram: string;
  hearAboutUs: string;
  hearAboutUsOther: string;
  careContexts: string[];
  boardCertified: YesNo;
  boardCertifiedOrg: string;
  endorsed: YesNo;
  endorsedBy: string;
  orgMemberships: string[];
  orgMembershipOther: string;
}

export function emptyProfileDraft(): ProfileDraft {
  return {
    preferredPronouns: "",
    preferredPronounsOther: "",
    addressStreet: "",
    addressState: "",
    addressPostalCode: "",
    phone: "",
    usesWhatsapp: "",
    whatsappNumber: "",
    whatsappContactOk: "",
    religiousTraditions: [],
    religiousTraditionOther: "",
    primaryRole: "",
    primaryRoleSetting: "",
    primaryRoleSettingOther: "",
    interestedIn: "",
    interestedInOther: "",
    spiritualCareRole: "",
    affiliatedOrganizations: "",
    studyProgram: "",
    hearAboutUs: "",
    hearAboutUsOther: "",
    careContexts: [],
    boardCertified: "",
    boardCertifiedOrg: "",
    endorsed: "",
    endorsedBy: "",
    orgMemberships: [],
    orgMembershipOther: "",
  };
}

function toYesNo(value: boolean | null | undefined): YesNo {
  if (value === true) return "yes";
  if (value === false) return "no";
  return "";
}

// "Something else" is how the pronoun dropdown represents free text.
function resolvePronouns(value: string | null | undefined): { selected: string; other: string } {
  if (!value) return { selected: "", other: "" };
  if (PREFERRED_PRONOUN_OPTIONS.slice(0, -1).includes(value)) return { selected: value, other: "" };
  return { selected: "Something else", other: value };
}

// The slice of a saved profile the draft is built from — satisfied by the
// member-facing ApiMemberProfile.
export interface SavedProfile {
  preferredPronouns: string | null;
  addressStreet: string | null;
  addressState: string | null;
  addressPostalCode: string | null;
  phone: string | null;
  usesWhatsapp: boolean | null;
  whatsappNumber: string | null;
  whatsappContactOk: boolean | null;
  religiousTraditions: string[] | null;
  religiousTraditionOther: string | null;
  primaryRole: "chaplain" | "student" | null;
  primaryRoleSetting: string | null;
  primaryRoleSettingOther: string | null;
  interestedIn: string | null;
  interestedInOther: string | null;
  spiritualCareRole: string | null;
  affiliatedOrganizations: string | null;
  studyProgram: string | null;
  hearAboutUs: string | null;
  hearAboutUsOther: string | null;
  careContexts: string[] | null;
  boardCertified: boolean | null;
  boardCertifiedOrg: string | null;
  endorsed: boolean | null;
  endorsedBy: string | null;
  orgMemberships: string[] | null;
  orgMembershipOther: string | null;
}

// Starting draft for the portal "edit my profile" form.
export function profileDraftFromSaved(profile: SavedProfile | null): ProfileDraft {
  if (!profile) return emptyProfileDraft();
  const pronouns = resolvePronouns(profile.preferredPronouns);
  return {
    preferredPronouns: pronouns.selected,
    preferredPronounsOther: pronouns.other,
    addressStreet: profile.addressStreet ?? "",
    addressState: profile.addressState ?? "",
    addressPostalCode: profile.addressPostalCode ?? "",
    phone: profile.phone ?? "",
    usesWhatsapp: toYesNo(profile.usesWhatsapp),
    whatsappNumber: profile.whatsappNumber ?? "",
    whatsappContactOk: toYesNo(profile.whatsappContactOk),
    religiousTraditions: profile.religiousTraditions ?? [],
    religiousTraditionOther: profile.religiousTraditionOther ?? "",
    primaryRole: profile.primaryRole ?? "",
    primaryRoleSetting: profile.primaryRoleSetting ?? "",
    primaryRoleSettingOther: profile.primaryRoleSettingOther ?? "",
    interestedIn: profile.interestedIn ?? "",
    interestedInOther: profile.interestedInOther ?? "",
    spiritualCareRole: profile.spiritualCareRole ?? "",
    affiliatedOrganizations: profile.affiliatedOrganizations ?? "",
    studyProgram: profile.studyProgram ?? "",
    hearAboutUs: profile.hearAboutUs ?? "",
    hearAboutUsOther: profile.hearAboutUsOther ?? "",
    careContexts: profile.careContexts ?? [],
    boardCertified: toYesNo(profile.boardCertified),
    boardCertifiedOrg: profile.boardCertifiedOrg ?? "",
    endorsed: toYesNo(profile.endorsed),
    endorsedBy: profile.endorsedBy ?? "",
    orgMemberships: profile.orgMemberships ?? [],
    orgMembershipOther: profile.orgMembershipOther ?? "",
  };
}

// The first problem that should stop a submit, or null. Only the ZIP is
// checked — every other questionnaire answer is optional.
export function validateProfileDraft(draft: ProfileDraft): string | null {
  const zip = draft.addressPostalCode.trim();
  if (zip && !isValidUsPostalCode(zip)) return POSTAL_CODE_ERROR;
  return null;
}

// What gets sent to the API. Answers that no longer apply (e.g. a "which
// organization" text after switching to "No") are dropped so stale values
// don't get saved.
export function profileDraftToPayload(d: ProfileDraft) {
  const trimmed = (value: string) => value.trim() || undefined;
  const hasAddress = Boolean(trimmed(d.addressStreet) || d.addressState || trimmed(d.addressPostalCode));
  const isChaplain = d.primaryRole === "chaplain";

  return {
    preferredPronouns:
      (d.preferredPronouns === "Something else" ? d.preferredPronounsOther.trim() : d.preferredPronouns) ||
      undefined,
    addressStreet: trimmed(d.addressStreet),
    addressState: d.addressState || undefined,
    addressCountry: hasAddress ? ("USA" as const) : undefined,
    addressPostalCode: trimmed(d.addressPostalCode),
    phone: trimmed(d.phone),
    usesWhatsapp: d.usesWhatsapp === "" ? undefined : d.usesWhatsapp === "yes",
    whatsappNumber: d.usesWhatsapp === "yes" ? trimmed(d.whatsappNumber) : undefined,
    whatsappContactOk:
      d.usesWhatsapp === "yes" && d.whatsappContactOk !== "" ? d.whatsappContactOk === "yes" : undefined,
    religiousTraditions: d.religiousTraditions.length ? d.religiousTraditions : undefined,
    religiousTraditionOther: d.religiousTraditions.includes("Something else")
      ? trimmed(d.religiousTraditionOther)
      : undefined,
    primaryRole: d.primaryRole || undefined,
    primaryRoleSetting: isChaplain ? d.primaryRoleSetting || undefined : undefined,
    primaryRoleSettingOther:
      isChaplain && d.primaryRoleSetting === "Other" ? trimmed(d.primaryRoleSettingOther) : undefined,
    interestedIn: d.interestedIn || undefined,
    interestedInOther: d.interestedIn === "Other" ? trimmed(d.interestedInOther) : undefined,
    spiritualCareRole: trimmed(d.spiritualCareRole),
    affiliatedOrganizations: trimmed(d.affiliatedOrganizations),
    studyProgram: trimmed(d.studyProgram),
    hearAboutUs: d.hearAboutUs || undefined,
    hearAboutUsOther: HEAR_ABOUT_OTHER_TRIGGERS.includes(d.hearAboutUs) ? trimmed(d.hearAboutUsOther) : undefined,
    careContexts: d.careContexts.length ? d.careContexts : undefined,
    boardCertified: d.boardCertified === "" ? undefined : d.boardCertified === "yes",
    boardCertifiedOrg: d.boardCertified === "yes" ? trimmed(d.boardCertifiedOrg) : undefined,
    endorsed: d.endorsed === "" ? undefined : d.endorsed === "yes",
    endorsedBy: d.endorsed === "yes" ? trimmed(d.endorsedBy) : undefined,
    orgMemberships: d.orgMemberships.length ? d.orgMemberships : undefined,
    orgMembershipOther: d.orgMemberships.includes("Other") ? trimmed(d.orgMembershipOther) : undefined,
  };
}
