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
