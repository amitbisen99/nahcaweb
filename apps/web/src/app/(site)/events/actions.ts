"use server";

// Shared by both the Event and Webinar detail pages' JoinButton — an
// existing member clicking Join needs no form/payment (client's explicit
// requirement), just this one call.

import { auth } from "@/auth";

export interface QuickJoinState {
  error?: string;
  success?: boolean;
}

export async function quickJoinEvent(eventCode: string): Promise<QuickJoinState> {
  const session = await auth();
  if (!session?.apiToken) {
    return { error: "You must be signed in to join." };
  }

  const res = await fetch(`${process.env.API_URL}/event-registrations/quick-join`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.apiToken}` },
    body: JSON.stringify({ eventCode }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => null);
    const message = typeof data?.error === "string" ? data.error : "Something went wrong. Please try again.";
    return { error: message };
  }

  return { success: true };
}
