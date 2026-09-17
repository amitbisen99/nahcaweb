"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";

async function requireAdminToken() {
  const session = await auth();
  if (!session?.apiToken || session.user?.role !== "admin") {
    throw new Error("Not authorized");
  }
  return session.apiToken;
}

export interface ForumActionState {
  error?: string;
  success?: boolean;
}

function extractErrorMessage(data: unknown, fallback: string): string {
  const error = (data as { error?: unknown } | null)?.error;
  if (typeof error === "string") return error;
  if (error && typeof error === "object") {
    const flat = error as { fieldErrors?: Record<string, string[]>; formErrors?: string[] };
    const fieldErrors = Object.entries(flat.fieldErrors ?? {})
      .map(([field, messages]) => `${field}: ${messages.join(", ")}`)
      .join("; ");
    return fieldErrors || flat.formErrors?.join("; ") || fallback;
  }
  return fallback;
}

function revalidateForum() {
  revalidatePath("/admin/forum");
  revalidatePath("/forum");
}

export async function approveForumTopic(topicId: number): Promise<ForumActionState> {
  const token = await requireAdminToken();

  const res = await fetch(`${process.env.API_URL}/forum/admin/topics/${topicId}/approve`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const data = await res.json().catch(() => null);
    return { error: extractErrorMessage(data, "Couldn't approve this topic.") };
  }

  revalidateForum();
  return { success: true };
}

export async function rejectForumTopic(topicId: number, reason: string): Promise<ForumActionState> {
  const token = await requireAdminToken();

  const res = await fetch(`${process.env.API_URL}/forum/admin/topics/${topicId}/reject`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ reason }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => null);
    return { error: extractErrorMessage(data, "Couldn't reject this topic.") };
  }

  revalidateForum();
  return { success: true };
}

export async function setForumTopicFlags(
  topicId: number,
  flags: { pinned?: boolean; locked?: boolean }
): Promise<ForumActionState> {
  const token = await requireAdminToken();

  const res = await fetch(`${process.env.API_URL}/forum/admin/topics/${topicId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(flags),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => null);
    return { error: extractErrorMessage(data, "Couldn't update this topic.") };
  }

  revalidateForum();
  return { success: true };
}

export async function deleteForumTopic(topicId: number): Promise<ForumActionState> {
  const token = await requireAdminToken();

  const res = await fetch(`${process.env.API_URL}/forum/admin/topics/${topicId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const data = await res.json().catch(() => null);
    return { error: extractErrorMessage(data, "Couldn't delete this topic.") };
  }

  revalidateForum();
  return { success: true };
}

export async function deleteForumReply(replyId: number, topicId: number): Promise<ForumActionState> {
  const token = await requireAdminToken();

  const res = await fetch(`${process.env.API_URL}/forum/admin/replies/${replyId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const data = await res.json().catch(() => null);
    return { error: extractErrorMessage(data, "Couldn't delete this reply.") };
  }

  revalidatePath(`/forum/${topicId}`);
  return { success: true };
}
