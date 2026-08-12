export async function listContent(apiPath: string, token: string): Promise<Record<string, unknown>[]> {
  try {
    const res = await fetch(`${process.env.API_URL}/${apiPath}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) {
      console.error(`listContent ${apiPath} failed: ${res.status} ${res.statusText}`);
      return [];
    }
    const data = await res.json();
    return data.items ?? [];
  } catch (err) {
    console.error(`listContent ${apiPath} threw:`, err);
    return [];
  }
}

export async function getContentItem(
  apiPath: string,
  id: string,
  token: string
): Promise<Record<string, unknown> | null> {
  try {
    const res = await fetch(`${process.env.API_URL}/${apiPath}/${id}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) {
      console.error(`getContentItem ${apiPath}/${id} failed: ${res.status} ${res.statusText}`);
      return null;
    }
    const data = await res.json();
    return data.item ?? null;
  } catch (err) {
    console.error(`getContentItem ${apiPath}/${id} threw:`, err);
    return null;
  }
}

export interface AdminCoupon {
  id: number;
  name: string;
  code: string;
  discountType: "percent" | "fixed_amount" | "complimentary";
  discountValue: number;
  appliesTo: ("regular" | "student" | "institutional" | "conference")[] | null;
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
  try {
    const res = await fetch(`${process.env.API_URL}/membership-plans`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) {
      console.error(`listMembershipPlans failed: ${res.status} ${res.statusText}`);
      return [];
    }
    const data = await res.json();
    return data.plans ?? [];
  } catch (err) {
    console.error("listMembershipPlans threw:", err);
    return [];
  }
}

export async function getMembershipPlanByType(type: string, token: string): Promise<AdminMembershipPlan | null> {
  try {
    const res = await fetch(`${process.env.API_URL}/membership-plans/${type}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) {
      console.error(`getMembershipPlanByType ${type} failed: ${res.status} ${res.statusText}`);
      return null;
    }
    const data = await res.json();
    return data.plan ?? null;
  } catch (err) {
    console.error(`getMembershipPlanByType ${type} threw:`, err);
    return null;
  }
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
}

export interface AdminMembershipDetail {
  id: number;
  type: "regular" | "student" | "institutional" | "conference";
  status: "active" | "expired" | "pending";
  priceCents: number;
  createdAt: string;
  user: {
    id: number;
    name: string;
    email: string;
    profile: AdminMemberProfile | null;
  };
}

export async function getMembershipDetail(id: number, token: string): Promise<AdminMembershipDetail | null> {
  try {
    const res = await fetch(`${process.env.API_URL}/memberships/${id}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) {
      console.error(`getMembershipDetail ${id} failed: ${res.status} ${res.statusText}`);
      return null;
    }
    const data = await res.json();
    return data.membership ?? null;
  } catch (err) {
    console.error(`getMembershipDetail ${id} threw:`, err);
    return null;
  }
}
