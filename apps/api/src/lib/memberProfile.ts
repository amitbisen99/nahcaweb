import { z } from "zod";

// Extended demographic/professional questionnaire — see the "Fields for
// collecting member information" doc. Every field is optional. Collected on
// the Regular/Student signup form (JoinForm.tsx), the claim-code form
// (ClaimForm.tsx), and editable afterward by the member from /portal/profile.
// Keep the option lists in sync with apps/web/src/lib/memberProfileFields.ts.
//
// Still used by event registration (a separate questionnaire that keeps the
// old repeating employment rows) — not part of memberProfileSchema anymore.
export const employmentEntrySchema = z.object({
  employerName: z.string().min(1),
  jobTitle: z.string().optional(),
  employmentType: z.enum(["full_time", "part_time", "volunteer"]).optional(),
});

// 5 digits, optionally followed by a 4-digit ZIP+4 extension.
export const US_POSTAL_CODE = /^\d{5}(-\d{4})?$/;

// One-line address for exports. Falls back to the legacy free-text
// mailingAddress for members who signed up before the address was split
// into separate fields.
export function formatProfileAddress(p: {
  addressStreet: string | null;
  addressState: string | null;
  addressPostalCode: string | null;
  addressCountry: string | null;
  mailingAddress: string | null;
}): string {
  const structured = [p.addressStreet, p.addressState, p.addressPostalCode, p.addressCountry]
    .map((part) => part?.trim())
    .filter(Boolean)
    .join(", ");
  return structured || p.mailingAddress?.trim() || "";
}

// One row of "Places of employment and/or study" — a member can add several.
export const placeOfEmploymentStudySchema = z.object({
  spiritualCareRole: z.string().optional(),
  affiliatedOrganizations: z.string().optional(),
  studyProgram: z.string().optional(),
});

export const memberProfileSchema = z.object({
  preferredPronouns: z.string().optional(),
  addressStreet: z.string().optional(),
  addressState: z.string().optional(),
  addressCountry: z.literal("USA").optional(),
  addressPostalCode: z
    .string()
    .regex(US_POSTAL_CODE, "Enter a valid US ZIP code (12345 or 12345-6789)")
    .optional(),
  phone: z.string().optional(),
  usesWhatsapp: z.boolean().optional(),
  whatsappNumber: z.string().optional(),
  whatsappContactOk: z.boolean().optional(),
  religiousTraditions: z.array(z.string()).optional(),
  religiousTraditionOther: z.string().optional(),
  primaryRole: z.enum(["chaplain", "student"]).optional(),
  primaryRoleSetting: z.string().optional(),
  primaryRoleSettingOther: z.string().optional(),
  interestedIn: z.string().optional(),
  interestedInOther: z.string().optional(),
  placesOfEmploymentStudy: z.array(placeOfEmploymentStudySchema).optional(),
  hearAboutUs: z.string().optional(),
  hearAboutUsOther: z.string().optional(),
  careContexts: z.array(z.string()).optional(),
  boardCertified: z.boolean().optional(),
  boardCertifiedOrg: z.string().optional(),
  endorsed: z.boolean().optional(),
  endorsedBy: z.string().optional(),
  orgMemberships: z.array(z.string()).optional(),
  orgMembershipOther: z.string().optional(),
});
