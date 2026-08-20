// Shared field definitions for the member questionnaire — used by the public
// signup form (membership/join/JoinForm.tsx) and the admin member
// view/update page (components/admin/MemberProfileForm.tsx). Keep these in
// sync with apps/api/src/lib/memberProfile.ts.

export interface EmploymentEntry {
  employerName: string;
  jobTitle: string;
  employmentType: "" | "full_time" | "part_time" | "volunteer";
}

export function emptyEmployment(): EmploymentEntry {
  return { employerName: "", jobTitle: "", employmentType: "" };
}

export const RELIGIOUS_TRADITIONS = [
  "Hindu",
  "Agnostic",
  "Atheist",
  "Bahai'i Faith",
  "Buddhist",
  "Christian - Catholic",
  "Christian - Protestant",
  "Indigenous Traditions",
  "Jain",
  "Jewish",
  "Mormon",
  "Muslim",
  "Pagan/Wiccan",
  "Quaker",
  "Sikh",
  "Unitarian/Universalist",
  "Zoroastrian",
  "Something else",
  "Unaffiliated",
];

export const PRIMARY_ROLES: { value: "chaplain" | "student"; label: string }[] = [
  { value: "chaplain", label: "Chaplain/Spiritual Caregiver" },
  { value: "student", label: "Chaplaincy student (degree, certificate program or chaplaincy courses)" },
];

export const HEAR_ABOUT_OPTIONS = [
  "CIF Spiritual Care course",
  "GTU",
  "Chaplaincy Innovation Lab",
  "Divinity School (please specify which one)",
  "Word of mouth",
  "Google search",
  "Other (please fill in)",
];

export const CARE_CONTEXTS = ["Healthcare", "Higher education", "Military", "Corrections", "Community"];

export const ORG_MEMBERSHIPS = [
  "APC",
  "ACPE",
  "Association of Chaplains and Spiritual Life in Higher Education (ACSLHE)",
  "Chaplaincy Innovation Lab",
  "Chinmaya Mission",
  "Other",
];

export const PREFERRED_PRONOUN_OPTIONS = ["She/Her", "He/Him", "They/Them", "Ze/Zir", "Something else"];

export const HEAR_ABOUT_OTHER_TRIGGERS = [
  "Divinity School (please specify which one)",
  "Other (please fill in)",
];
