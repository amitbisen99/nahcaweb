import { fetchJson } from "./fetchJson";

export interface AdminForumTopic {
  id: number;
  title: string;
  visibility: "public" | "members_only";
  status: "pending" | "published" | "rejected";
  pinned: boolean;
  locked: boolean;
  rejectionReason: string | null;
  createdAt: string;
  author: { id: number; name: string };
  category: { id: number; name: string };
}

export async function listAdminForumTopics(
  token: string,
  opts: { status?: "pending" | "published" | "rejected"; page?: number; pageSize?: number } = {}
): Promise<{ topics: AdminForumTopic[]; total: number }> {
  const params = new URLSearchParams();
  if (opts.status) params.set("status", opts.status);
  if (opts.page) params.set("page", String(opts.page));
  if (opts.pageSize) params.set("pageSize", String(opts.pageSize));

  const data = await fetchJson<{ topics: AdminForumTopic[]; total: number }>(
    `${process.env.API_URL}/forum/admin/topics?${params.toString()}`,
    { headers: token ? { Authorization: `Bearer ${token}` } : {}, cache: "no-store" }
  );
  return { topics: data?.topics ?? [], total: data?.total ?? 0 };
}
