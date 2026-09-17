"use server";

import { redirect } from "next/navigation";
import { auth } from "@/auth";

export interface NewTopicState {
  error?: string;
}

// A "use server" function bound to <form action={...}> must never throw on
// a real failure — every error path here returns { error } instead, same
// rule this session has applied everywhere else (login/coupons/admin
// content/Receipt Email). The one intentional throw is redirect()'s own
// internal signal on success, which must propagate.
export async function createForumTopic(_prevState: NewTopicState, formData: FormData): Promise<NewTopicState> {
  const session = await auth();
  if (!session?.apiToken) {
    return { error: "You're not signed in — please sign in and try again." };
  }

  const categoryId = Number(formData.get("categoryId"));
  const title = String(formData.get("title") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  const visibility = formData.get("visibility") === "members_only" ? "members_only" : "public";

  if (!Number.isInteger(categoryId) || !title || !body) {
    return { error: "Please fill in a category, title, and message." };
  }

  let res: Response;
  try {
    res = await fetch(`${process.env.API_URL}/forum/topics`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.apiToken}` },
      body: JSON.stringify({ categoryId, title, body, visibility }),
      signal: AbortSignal.timeout(10_000),
    });
  } catch (err) {
    console.error("createForumTopic: request failed:", err);
    return { error: "Couldn't reach the server. Please try again." };
  }

  if (!res.ok) {
    const data = await res.json().catch(() => null);
    const message = typeof data?.error === "string" ? data.error : "Couldn't post your topic. Please try again.";
    return { error: message };
  }

  redirect("/forum/my-topics?posted=1");
}
