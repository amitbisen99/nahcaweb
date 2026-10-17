import { fetchJson } from "./fetchJson";

export interface GeneralUser {
  id: number;
  name: string;
  email: string;
  isActive: boolean;
  createdAt: string;
  _count: { productOrders: number; forumTopics: number };
}

export async function getGeneralUsers(
  token: string,
  opts: { page?: number; pageSize?: number } = {}
): Promise<{ users: GeneralUser[]; total: number }> {
  const page = opts.page ?? 1;
  const pageSize = opts.pageSize ?? 10;
  const data = await fetchJson<{ users: GeneralUser[]; total: number }>(
    `${process.env.API_URL}/users/general?page=${page}&pageSize=${pageSize}`,
    { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" }
  );
  return data ?? { users: [], total: 0 };
}
