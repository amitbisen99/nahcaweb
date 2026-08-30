import { fetchJson } from "@/lib/fetchJson";

export interface ApiInstitutionCode {
  id: number;
  code: string;
  claimedAt: string | null;
  claimedByUser: { id: number; name: string; email: string } | null;
}

export interface ApiInstitutionSponsorship {
  id: number;
  seatCount: number;
  startDate: string;
  endDate: string;
  codes: ApiInstitutionCode[];
}

// Returns null both when the user has no sponsorship (404) and on any
// network/server error — callers treat "no dashboard to show" uniformly.
export async function getMySponsorship(token: string): Promise<ApiInstitutionSponsorship | null> {
  const data = await fetchJson<{ sponsorship: ApiInstitutionSponsorship }>(
    `${process.env.API_URL}/institutions/me`,
    { headers: { Authorization: `Bearer ${token}` }, cache: "no-store", silentStatuses: [404] }
  );
  return data?.sponsorship ?? null;
}
