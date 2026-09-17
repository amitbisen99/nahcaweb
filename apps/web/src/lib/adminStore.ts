import { fetchJson } from "./fetchJson";
import { StoreProduct } from "./store";

function adminStoreFetch<T>(path: string, token: string, init: RequestInit = {}): Promise<T | null> {
  return fetchJson<T>(`${process.env.API_URL}${path}`, {
    ...init,
    headers: { ...(init.headers ?? {}), Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
}

export async function listAdminProducts(token: string): Promise<StoreProduct[]> {
  const data = await adminStoreFetch<{ products: StoreProduct[] }>("/products/admin/all", token);
  return data?.products ?? [];
}

export async function getAdminProduct(id: number, token: string): Promise<StoreProduct | null> {
  const data = await adminStoreFetch<{ product: StoreProduct }>(`/products/admin/${id}`, token);
  return data?.product ?? null;
}
