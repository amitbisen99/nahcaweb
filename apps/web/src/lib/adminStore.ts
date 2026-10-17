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

export interface AdminProductOrder {
  id: number;
  status: "pending" | "active";
  createdAt: string;
  buyer: { id: number; name: string; email: string };
  product: { id: number; title: string; type: "video" | "file" };
  payment: {
    status: "pending" | "succeeded" | "failed" | "refunded";
    amountCents: number;
    stripeRef: string | null;
    createdAt: string;
  } | null;
}

export async function listAdminProductOrders(
  token: string,
  opts: { page?: number; pageSize?: number } = {}
): Promise<{ orders: AdminProductOrder[]; total: number }> {
  const page = opts.page ?? 1;
  const pageSize = opts.pageSize ?? 10;
  const data = await adminStoreFetch<{ orders: AdminProductOrder[]; total: number }>(
    `/products/admin/orders?page=${page}&pageSize=${pageSize}`,
    token
  );
  return data ?? { orders: [], total: 0 };
}

export async function getAdminProduct(id: number, token: string): Promise<StoreProduct | null> {
  const data = await adminStoreFetch<{ product: StoreProduct }>(`/products/admin/${id}`, token);
  return data?.product ?? null;
}
