export async function listContent(apiPath: string, token: string): Promise<Record<string, unknown>[]> {
  try {
    const res = await fetch(`${process.env.API_URL}/${apiPath}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.items ?? [];
  } catch {
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
    if (!res.ok) return null;
    const data = await res.json();
    return data.item ?? null;
  } catch {
    return null;
  }
}

export interface AdminMembershipPlan {
  id: number;
  type: "regular" | "student" | "institutional" | "conference";
  name: string;
  priceCents: number;
  term: string;
  note: string;
  benefits: string;
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
    if (!res.ok) return [];
    const data = await res.json();
    return data.plans ?? [];
  } catch {
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
    if (!res.ok) return null;
    const data = await res.json();
    return data.plan ?? null;
  } catch {
    return null;
  }
}
