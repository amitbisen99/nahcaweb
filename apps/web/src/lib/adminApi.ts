import { ApiInstitutionSponsorship } from "@/lib/institutions";
import { fetchJson } from "@/lib/fetchJson";

export async function listContent(apiPath: string, token: string): Promise<Record<string, unknown>[]> {
  const data = await fetchJson<{ items: Record<string, unknown>[] }>(`${process.env.API_URL}/${apiPath}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    cache: "no-store",
  });
  return data?.items ?? [];
}

export async function getContentItem(
  apiPath: string,
  id: string,
  token: string
): Promise<Record<string, unknown> | null> {
  const data = await fetchJson<{ item: Record<string, unknown> }>(`${process.env.API_URL}/${apiPath}/${id}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    cache: "no-store",
  });
  return data?.item ?? null;
}

export interface AdminCoupon {
  id: number;
  name: string;
  code: string;
  discountType: "percent" | "fixed_amount" | "complimentary";
  discountValue: number;
  appliesTo: ("regular" | "student" | "institutional" | "nahca_programmes")[] | null;
  // Set only when appliesTo includes "nahca_programmes" — the Event/Webinar
  // this coupon is scoped to (matches Event.eventCode or Webinar.eventCode).
  eventCode: string | null;
  validFrom: string | null;
  validTill: string | null;
  maxUses: number | null;
  usedCount: number;
  published: boolean;
  createdAt: string;
}

export interface AdminMembershipPlan {
  id: number;
  type: "regular" | "student" | "institutional" | "conference";
  name: string;
  priceCents: number;
  term: string;
  note: string;
  benefits: string;
  tooltip: string | null;
  minStudents: number | null;
  pricePerStudentCents: number | null;
  updatedAt: string;
}

export async function listMembershipPlans(token: string): Promise<AdminMembershipPlan[]> {
  const data = await fetchJson<{ plans: AdminMembershipPlan[] }>(`${process.env.API_URL}/membership-plans`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    cache: "no-store",
  });
  return data?.plans ?? [];
}

export async function getMembershipPlanByType(type: string, token: string): Promise<AdminMembershipPlan | null> {
  const data = await fetchJson<{ plan: AdminMembershipPlan }>(`${process.env.API_URL}/membership-plans/${type}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    cache: "no-store",
  });
  return data?.plan ?? null;
}

// Mirrors apps/api/src/lib/memberProfile.ts's memberProfileSchema — the
// questionnaire captured on the Regular/Student/Institutional signup form.
export interface AdminMemberProfileEmployment {
  employerName: string;
  jobTitle: string | null;
  employmentType: "full_time" | "part_time" | "volunteer" | null;
}

export interface AdminMemberProfile {
  preferredPronouns: string | null;
  mailingAddress: string | null;
  phone: string | null;
  usesWhatsapp: boolean | null;
  whatsappContactOk: boolean | null;
  religiousTraditions: string[] | null;
  religiousTraditionOther: string | null;
  primaryRole: "chaplain" | "student" | null;
  employment: AdminMemberProfileEmployment[] | null;
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

export interface AdminMembershipDetail {
  id: number;
  type: "regular" | "student" | "institutional" | "conference";
  status: "active" | "expired" | "pending";
  priceCents: number;
  // Institutional only: null on the institution's own membership, set on a
  // sponsored student's — see the same convention noted on the Prisma
  // schema's Membership model.
  groupId: string | null;
  createdAt: string;
  user: {
    id: number;
    name: string;
    email: string;
    isActive: boolean;
    profile: AdminMemberProfile | null;
    institutionSponsorship: ApiInstitutionSponsorship | null;
  };
  // Set only when groupId is set (a sponsored student) — the institution
  // that sponsored them, resolved server-side from the sponsorship record.
  sponsoringInstitution: { id: number; name: string; email: string } | null;
}

// Mirrors apps/api/src/routes/eventRegistrations.ts's EventRegistration
// shape — the questionnaire captured on the event/webinar join form (a
// trimmed subset of AdminMemberProfile above), plus guest vs. member
// identity fields.
export interface AdminEventRegistrationEmployment {
  employerName: string;
  jobTitle: string | null;
  employmentType: "full_time" | "part_time" | "volunteer" | null;
}

export interface AdminEventRegistration {
  id: number;
  eventCode: string;
  userId: number | null;
  name: string | null;
  email: string | null;
  status: "pending" | "active";
  createdAt: string;
  preferredPronouns: string | null;
  mailingAddress: string | null;
  phone: string | null;
  usesWhatsapp: boolean | null;
  whatsappContactOk: boolean | null;
  religiousTraditions: string[] | null;
  religiousTraditionOther: string | null;
  primaryRole: "chaplain" | "student" | null;
  employment: AdminEventRegistrationEmployment[] | null;
  hearAboutUs: string | null;
  hearAboutUsOther: string | null;
  user: { id: number; name: string; email: string } | null;
  payment: { id: number; amountCents: number; status: string } | null;
}

export async function listEventRegistrations(
  eventCode: string,
  token: string,
  opts: { page?: number; pageSize?: number; status?: "active" | "pending" } = {}
): Promise<{ registrations: AdminEventRegistration[]; total: number }> {
  const params = new URLSearchParams({ eventCode });
  if (opts.page) params.set("page", String(opts.page));
  if (opts.pageSize) params.set("pageSize", String(opts.pageSize));
  if (opts.status) params.set("status", opts.status);

  const data = await fetchJson<{ registrations: AdminEventRegistration[]; total: number }>(
    `${process.env.API_URL}/event-registrations?${params.toString()}`,
    { headers: token ? { Authorization: `Bearer ${token}` } : {}, cache: "no-store" }
  );
  return { registrations: data?.registrations ?? [], total: data?.total ?? 0 };
}

export async function getEventRegistration(id: number, token: string): Promise<AdminEventRegistration | null> {
  const data = await fetchJson<{ registration: AdminEventRegistration }>(
    `${process.env.API_URL}/event-registrations/${id}`,
    { headers: token ? { Authorization: `Bearer ${token}` } : {}, cache: "no-store" }
  );
  return data?.registration ?? null;
}

export async function getMembershipDetail(id: number, token: string): Promise<AdminMembershipDetail | null> {
  const data = await fetchJson<{ membership: AdminMembershipDetail }>(`${process.env.API_URL}/memberships/${id}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    cache: "no-store",
  });
  return data?.membership ?? null;
}

// One row per Receipt Email send (not per recipient) — shown on the
// compose page so an admin can see "did we already send this?" before
// sending again.
export interface AdminReceiptEmailLog {
  id: number;
  eventCode: string;
  subject: string;
  sentByEmail: string;
  sentCount: number;
  failedCount: number;
  createdAt: string;
}

export async function getReceiptEmailLogs(eventCode: string, token: string): Promise<AdminReceiptEmailLog[]> {
  const data = await fetchJson<{ logs: AdminReceiptEmailLog[] }>(
    `${process.env.API_URL}/event-registrations/${eventCode}/receipt-email-logs`,
    { headers: token ? { Authorization: `Bearer ${token}` } : {}, cache: "no-store" }
  );
  return data?.logs ?? [];
}
