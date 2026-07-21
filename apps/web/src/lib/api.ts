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
  user: { id: number; name: string; email: string };
}

export interface ApiPayment {
  id: number;
  type: "membership" | "donation" | "conference" | "endorsement";
  amountCents: number;
  status: "pending" | "succeeded" | "failed" | "refunded";
  createdAt: string;
  membership: { type: ApiMembership["type"] } | null;
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

export interface ApiArticle {
  id: number;
  title: string;
  richTextBody: string | null;
  category: "Podcast" | "Presentation" | "Referral" | "Ethics";
  createdAt: string;
}

async function apiFetch<T>(path: string, token: string): Promise<T | null> {
  try {
    const res = await fetch(`${process.env.API_URL}${path}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

async function publicFetch<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${process.env.API_URL}${path}`, {
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export async function getMyMemberships(token: string): Promise<ApiMembership[]> {
  const data = await apiFetch<{ memberships: ApiMembership[] }>("/memberships/me", token);
  return data?.memberships ?? [];
}

export async function getAllMemberships(token: string): Promise<AdminMembership[]> {
  const data = await apiFetch<{ memberships: AdminMembership[] }>("/memberships", token);
  return data?.memberships ?? [];
}

export async function getMyPayments(token: string): Promise<ApiPayment[]> {
  const data = await apiFetch<{ payments: ApiPayment[] }>("/payments/me", token);
  return data?.payments ?? [];
}

export async function getPublishedNewsletters(): Promise<ApiNewsletter[]> {
  const data = await publicFetch<{ items: ApiNewsletter[] }>("/newsletters");
  return data?.items ?? [];
}

export async function getPublishedArticles(): Promise<ApiArticle[]> {
  const data = await publicFetch<{ items: ApiArticle[] }>("/articles");
  return data?.items ?? [];
}
