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

export async function getEvent(id: string): Promise<CmsEvent | null> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/events/${id}`, {
      next: { revalidate: 60 },
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return null;
    const { item } = (await res.json()) as { item: CmsEvent };
    return item;
  } catch {
    return null;
  }
}

export interface CmsWebinar {
  id: number;
  title: string;
  description: string | null;
  zoomOrYoutubeLink: string | null;
  speakerInfo: string | null;
  access: "open" | "members_only";
}

// The API itself decides visibility based on the token (anonymous -> "open"
// only, any logged-in account -> "open" + "members_only") — pass the
// visitor's session token through so members actually see members-only
// webinars on the public site, not just anonymous ones. This response is
// now per-visitor, so it must never go through the shared page/data cache
// (cache: "no-store") — caching it would risk leaking one member's
// members-only view to a different, unauthenticated visitor.
export async function getOpenWebinars(token?: string): Promise<CmsWebinar[]> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/webinars`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return [];
    const { items } = (await res.json()) as { items: CmsWebinar[] };
    return items;
  } catch {
    return [];
  }
}

export interface CmsBoardMember {
  id: number;
  name: string;
  role: string | null;
  bio: string | null;
  photoUrl: string | null;
  order: number;
}

export async function getBoardMembers(): Promise<CmsBoardMember[]> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/board`, {
      next: { revalidate: 60 },
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return [];
    const { items } = (await res.json()) as { items: CmsBoardMember[] };
    return items;
  } catch {
    return [];
  }
}

export async function getOpenWebinar(id: string, token?: string): Promise<CmsWebinar | null> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/webinars/${id}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return null;
    const { item } = (await res.json()) as { item: CmsWebinar };
    return item;
  } catch {
    return null;
  }
}
