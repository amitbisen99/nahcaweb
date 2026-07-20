export interface CmsEvent {
  id: number;
  title: string;
  date: string;
  time: string | null;
  description: string | null;
  registrationLink: string | null;
  featuredImageUrl?: string | null;
}

export async function getUpcomingEvents(limit = 3): Promise<CmsEvent[]> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/events`, {
      next: { revalidate: 60 },
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return [];

    const { items } = (await res.json()) as { items: CmsEvent[] };
    const now = Date.now();
    return items.filter((e) => new Date(e.date).getTime() >= now).slice(0, limit);
  } catch {
    // API not reachable (e.g. not running yet in local dev) — degrade gracefully.
    return [];
  }
}
