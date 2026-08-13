export interface ApiMembership {
  id: number;
  type: "regular" | "student" | "institutional" | "conference";
  status: "active" | "expired" | "pending";
  startDate: string | null;
  endDate: string | null;
  priceCents: number;
  createdAt: string;
}

export interface AdminMembership extends ApiMembership {
  // Institutional only: null on the institution's own membership, set on a
  // sponsored student's — see AdminMembershipDetail for the same convention.
  groupId: string | null;
  user: { id: number; name: string; email: string; isActive: boolean };
}

export interface PaginatedMemberships {
  memberships: AdminMembership[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ApiPayment {
  id: number;
  type: "membership" | "donation" | "conference" | "endorsement";
  amountCents: number;
  status: "pending" | "succeeded" | "failed" | "refunded";
  createdAt: string;
  membership: { type: ApiMembership["type"]; groupId: string | null } | null;
  donation: { purpose: string | null } | null;
}

export interface ApiNewsletter {
  id: number;
  title: string;
  fileUrl: string | null;
  mailchimpCampaignUrl: string | null;
  publishedDate: string | null;
  createdAt: string;
}

// Mirrors apps/api/src/lib/memberProfile.ts's memberProfileSchema — the
// questionnaire captured on the Regular/Student/Institutional signup form,
// viewable/editable by the member themselves on /portal/profile.
export interface ApiMemberProfileEmployment {
  employerName: string;
  jobTitle: string | null;
  employmentType: "full_time" | "part_time" | "volunteer" | null;
}

export interface ApiMemberProfile {
  preferredPronouns: string | null;
  mailingAddress: string | null;
  phone: string | null;
  usesWhatsapp: boolean | null;
  whatsappContactOk: boolean | null;
  religiousTraditions: string[] | null;
  religiousTraditionOther: string | null;
  primaryRole: "chaplain" | "student" | null;
  employment: ApiMemberProfileEmployment[] | null;
  hearAboutUs: string | null;
  hearAboutUsOther: string | null;
  careContexts: string[] | null;
  boardCertified: boolean | null;
  boardCertifiedOrg: string | null;
  endorsed: boolean | null;
  endorsedBy: string | null;
  orgMemberships: string[] | null;
}

export interface ApiUserWithProfile {
  id: number;
  email: string;
  name: string;
  role: "admin" | "member";
  createdAt: string;
  profile: ApiMemberProfile | null;
}

export interface ApiMembershipPlan {
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
}

export interface ApiArticle {
  id: number;
  title: string;
  richTextBody: string | null;
  category: "Podcast" | "Presentation" | "Referral" | "Ethics";
  createdAt: string;
}

export interface ApiConferenceVideo {
  id: number;
  title: string;
  videoUrl: string;
  year: number | null;
  category: string | null;
}

async function apiFetch<T>(path: string, token: string): Promise<T | null> {
  try {
    const res = await fetch(`${process.env.API_URL}${path}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) {
      console.error(`apiFetch ${path} failed: ${res.status} ${res.statusText}`);
      return null;
    }
    return (await res.json()) as T;
  } catch (err) {
    console.error(`apiFetch ${path} threw:`, err);
    return null;
  }
}

async function publicFetch<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${process.env.API_URL}${path}`, {
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) {
      console.error(`publicFetch ${path} failed: ${res.status} ${res.statusText}`);
      return null;
    }
    return (await res.json()) as T;
  } catch (err) {
    console.error(`publicFetch ${path} threw:`, err);
    return null;
  }
}

export async function getMyProfile(token: string): Promise<ApiUserWithProfile | null> {
  const data = await apiFetch<{ user: ApiUserWithProfile }>("/auth/me", token);
  return data?.user ?? null;
}

export async function getMyMemberships(token: string): Promise<ApiMembership[]> {
  const data = await apiFetch<{ memberships: ApiMembership[] }>("/memberships/me", token);
  return data?.memberships ?? [];
}

export async function getAllMemberships(
  token: string,
  opts: { page?: number; pageSize?: number; status?: ApiMembership["status"] } = {}
): Promise<PaginatedMemberships> {
  const page = opts.page ?? 1;
  const pageSize = opts.pageSize ?? 10;
  const statusParam = opts.status ? `&status=${opts.status}` : "";
  const data = await apiFetch<PaginatedMemberships>(
    `/memberships?page=${page}&pageSize=${pageSize}${statusParam}`,
    token
  );
  return data ?? { memberships: [], total: 0, page, pageSize };
}

export async function getMyPayments(token: string): Promise<ApiPayment[]> {
  const data = await apiFetch<{ payments: ApiPayment[] }>("/payments/me", token);
  return data?.payments ?? [];
}

export async function getMembershipPlans(): Promise<ApiMembershipPlan[]> {
  const data = await publicFetch<{ plans: ApiMembershipPlan[] }>("/membership-plans");
  return data?.plans ?? [];
}

export async function getPublishedNewsletters(): Promise<ApiNewsletter[]> {
  const data = await publicFetch<{ items: ApiNewsletter[] }>("/newsletters");
  return data?.items ?? [];
}

export async function getPublishedArticles(): Promise<ApiArticle[]> {
  const data = await publicFetch<{ items: ApiArticle[] }>("/articles");
  return data?.items ?? [];
}

export async function getMemberConferenceVideos(token: string): Promise<ApiConferenceVideo[]> {
  const data = await apiFetch<{ items: ApiConferenceVideo[] }>("/conference-videos", token);
  return data?.items ?? [];
}
