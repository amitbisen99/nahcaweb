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

export async function getMyMemberships(token: string): Promise<ApiMembership[]> {
  const data = await apiFetch<{ memberships: ApiMembership[] }>("/memberships/me", token);
  return data?.memberships ?? [];
}

export async function getAllMemberships(token: string): Promise<AdminMembership[]> {
  const data = await apiFetch<{ memberships: AdminMembership[] }>("/memberships", token);
  return data?.memberships ?? [];
}
