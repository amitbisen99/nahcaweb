import { fetchJson } from "./fetchJson";

export type ProductType = "video" | "file";

// The public/listing shape never carries videoUrl/fileUrl — those only
// ever appear once `owned` is true (see getProduct below), matching the
// API's own "never send access before purchase" rule.
export interface StoreProduct {
  id: number;
  type: ProductType;
  title: string;
  description: string;
  priceCents: number;
  thumbnailUrl?: string | null;
  membersOnly: boolean;
  published: boolean;
  createdAt: string;
  videoUrl?: string | null;
  fileUrl?: string | null;
}

export interface StoreOrder {
  id: number;
  status: "pending" | "active";
  createdAt: string;
  product: StoreProduct;
  payment: { status: "pending" | "succeeded" | "failed" | "refunded"; amountCents: number } | null;
}

function storeFetch<T>(path: string, token: string, init: RequestInit = {}): Promise<T | null> {
  return fetchJson<T>(`${process.env.API_URL}${path}`, {
    ...init,
    headers: { ...(init.headers ?? {}), ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    cache: "no-store",
  });
}

export async function listProducts(): Promise<StoreProduct[]> {
  const data = await storeFetch<{ products: StoreProduct[] }>("/products", "");
  return data?.products ?? [];
}

export async function getProduct(
  id: number,
  token: string
): Promise<{ product: StoreProduct; owned: boolean } | null> {
  return storeFetch<{ product: StoreProduct; owned: boolean }>(`/products/${id}`, token);
}

export async function getMyOrders(token: string): Promise<StoreOrder[]> {
  const data = await storeFetch<{ orders: StoreOrder[] }>("/products/me/orders", token);
  return data?.orders ?? [];
}

// Members-only products — free for any active member, surfaced on the
// Portal's Resources page instead of the public Store.
export async function getMemberResources(token: string): Promise<StoreProduct[]> {
  const data = await storeFetch<{ products: StoreProduct[] }>("/products/resources", token);
  return data?.products ?? [];
}

// Converts a plain Vimeo/YouTube URL (whatever an admin naturally pastes)
// into an embeddable iframe src. Returns null for anything else so callers
// can fall back to a plain link instead of a broken/blank embed.
export function toVideoEmbedUrl(url: string): string | null {
  let u: URL;
  try {
    u = new URL(url);
  } catch {
    return null;
  }

  if (u.hostname.includes("youtube.com")) {
    const id = u.searchParams.get("v");
    if (id) return `https://www.youtube.com/embed/${id}`;
    const embedMatch = u.pathname.match(/\/embed\/([\w-]+)/);
    if (embedMatch) return `https://www.youtube.com/embed/${embedMatch[1]}`;
  }
  if (u.hostname === "youtu.be") {
    const id = u.pathname.slice(1);
    if (id) return `https://www.youtube.com/embed/${id}`;
  }
  if (u.hostname.includes("vimeo.com")) {
    const idMatch = u.pathname.match(/(\d+)/);
    if (idMatch) return `https://player.vimeo.com/video/${idMatch[1]}`;
  }
  return null;
}
