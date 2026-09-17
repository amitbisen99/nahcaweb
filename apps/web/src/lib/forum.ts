import { fetchJson } from "./fetchJson";

export interface ForumCategory {
  id: number;
  name: string;
  slug: string;
}

export interface ForumAuthor {
  id: number;
  name: string;
}

export interface ForumTopicSummary {
  id: number;
  title: string;
  body: string;
  visibility: "public" | "members_only";
  status: "pending" | "published" | "rejected";
  pinned: boolean;
  locked: boolean;
  rejectionReason: string | null;
  createdAt: string;
  author: ForumAuthor;
  category: ForumCategory;
  _count: { replies: number };
}

export interface ForumReply {
  id: number;
  body: string;
  createdAt: string;
  author: ForumAuthor;
}

export interface ForumTopicDetail {
  id: number;
  categoryId: number;
  title: string;
  body: string;
  visibility: "public" | "members_only";
  status: "pending" | "published" | "rejected";
  pinned: boolean;
  locked: boolean;
  rejectionReason: string | null;
  createdAt: string;
  author: ForumAuthor;
  category: ForumCategory;
  replies: ForumReply[];
}

// A user's own topic list (my-topics) skips the reply list/count — it's
// just for tracking status, not for reading the thread.
export interface ForumMyTopic {
  id: number;
  title: string;
  visibility: "public" | "members_only";
  status: "pending" | "published" | "rejected";
  rejectionReason: string | null;
  createdAt: string;
  category: ForumCategory;
}

function forumFetch<T>(path: string, token: string, init: RequestInit = {}): Promise<T | null> {
  return fetchJson<T>(`${process.env.API_URL}${path}`, {
    ...init,
    headers: { ...(init.headers ?? {}), Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
}

export async function getForumCategories(token: string): Promise<ForumCategory[]> {
  const data = await forumFetch<{ categories: ForumCategory[] }>("/forum/categories", token);
  return data?.categories ?? [];
}

export async function listForumTopics(
  token: string,
  opts: { categoryId?: number; search?: string; page?: number; pageSize?: number } = {}
): Promise<{ topics: ForumTopicSummary[]; total: number }> {
  const params = new URLSearchParams();
  if (opts.categoryId) params.set("categoryId", String(opts.categoryId));
  if (opts.search) params.set("search", opts.search);
  if (opts.page) params.set("page", String(opts.page));
  if (opts.pageSize) params.set("pageSize", String(opts.pageSize));
  const data = await forumFetch<{ topics: ForumTopicSummary[]; total: number }>(
    `/forum/topics?${params.toString()}`,
    token
  );
  return { topics: data?.topics ?? [], total: data?.total ?? 0 };
}

export async function getForumTopic(id: number, token: string): Promise<ForumTopicDetail | null> {
  const data = await forumFetch<{ topic: ForumTopicDetail }>(`/forum/topics/${id}`, token);
  return data?.topic ?? null;
}

export async function getMyForumTopics(token: string): Promise<ForumMyTopic[]> {
  const data = await forumFetch<{ topics: ForumMyTopic[] }>("/forum/my-topics", token);
  return data?.topics ?? [];
}
