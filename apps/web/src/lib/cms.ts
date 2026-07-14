export interface CmsEvent {
  id: number;
  title: string;
  date: string;
  time: string | null;
  description: string;
  registrationLink: string | null;
}

interface StrapiListResponse<T> {
  data: Array<{ id: number; attributes: T }>;
}

export async function getUpcomingEvents(limit = 3): Promise<CmsEvent[]> {
  const cmsUrl = process.env.NEXT_PUBLIC_CMS_URL;
  const url = `${cmsUrl}/api/events?sort=date:asc&pagination[limit]=${limit}`;

  try {
    const res = await fetch(url, { next: { revalidate: 60 }, signal: AbortSignal.timeout(5000) });
    if (!res.ok) return [];

    const json: StrapiListResponse<Omit<CmsEvent, "id">> = await res.json();
    return json.data.map((entry) => ({ id: entry.id, ...entry.attributes }));
  } catch {
    // CMS not reachable (e.g. not running yet in local dev) — degrade gracefully.
    return [];
  }
}
