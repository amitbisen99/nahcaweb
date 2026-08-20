import { z } from "zod";

// Extended demographic/professional questionnaire — see the "Fields for
// collecting member information" doc. Every field is optional. Collected on
// the Regular/Student/Institutional signup form (JoinForm.tsx) and editable
// afterward by admins (apps/web/src/components/admin/MemberProfileForm.tsx).
export const employmentEntrySchema = z.object({
  employerName: z.string().min(1),
  jobTitle: z.string().optional(),
  employmentType: z.enum(["full_time", "part_time", "volunteer"]).optional(),
});

export const memberProfileSchema = z.object({
  preferredPronouns: z.string().optional(),
  mailingAddress: z.string().optional(),
  phone: z.string().optional(),
  usesWhatsapp: z.boolean().optional(),
  whatsappContactOk: z.boolean().optional(),
  religiousTraditions: z.array(z.string()).optional(),
  religiousTraditionOther: z.string().optional(),
  primaryRole: z.enum(["chaplain", "student"]).optional(),
  employment: z.array(employmentEntrySchema).optional(),
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
