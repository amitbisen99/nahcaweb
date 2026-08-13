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
  try {
    const res = await fetch(`${process.env.API_URL}/institutions/me`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    });
    if (res.status === 404) return null;
    if (!res.ok) {
      console.error(`getMySponsorship failed: ${res.status} ${res.statusText}`);
      return null;
    }
    const data = await res.json();
    return data.sponsorship ?? null;
  } catch (err) {
    console.error("getMySponsorship threw:", err);
    return null;
  }
}
