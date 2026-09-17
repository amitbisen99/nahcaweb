"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";

export interface ReplyState {
  error?: string;
}

export async function postForumReply(
  topicId: number,
  _prevState: ReplyState,
  formData: FormData
): Promise<ReplyState> {
  const session = await auth();
  if (!session?.apiToken) {
    return { error: "You're not signed in — please sign in and try again." };
  }

  const body = String(formData.get("body") ?? "").trim();
  if (!body) {
    return { error: "Please write a reply before submitting." };
  }

  let res: Response;
  try {
    res = await fetch(`${process.env.API_URL}/forum/topics/${topicId}/replies`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.apiToken}` },
      body: JSON.stringify({ body }),
      signal: AbortSignal.timeout(10_000),
    });
  } catch (err) {
    console.error(`postForumReply ${topicId}: request failed:`, err);
    return { error: "Couldn't reach the server. Please try again." };
  }

  if (!res.ok) {
    const data = await res.json().catch(() => null);
    const message = typeof data?.error === "string" ? data.error : "Couldn't post your reply. Please try again.";
    return { error: message };
  }

  // The topic detail page fetches with cache: "no-store" already, but that
  // only prevents Next's own data cache from serving stale data on the
  // *next* request — this makes sure that next request actually happens
  // right after a successful reply instead of showing the pre-reply page
  // until the user manually refreshes.
  revalidatePath(`/forum/${topicId}`);
  return {};
}
