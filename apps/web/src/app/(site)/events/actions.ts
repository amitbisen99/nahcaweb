"use server";

// Shared by both the Event and Webinar detail pages' JoinButton — an
// existing member clicking Join needs no form to re-fill, but pays the
// same fee a guest would (client's explicit requirement). A free
// event/webinar still returns { success: true } directly (no payment
// step); a paid one returns { checkoutUrl } for the client to redirect to,
// same as the guest join form does.

import { auth } from "@/auth";

export interface QuickJoinState {
  error?: string;
  success?: boolean;
  checkoutUrl?: string;
}

export async function quickJoinEvent(eventCode: string, couponCode?: string): Promise<QuickJoinState> {
  const session = await auth();
  if (!session?.apiToken) {
    return { error: "You must be signed in to join." };
  }

  const res = await fetch(`${process.env.API_URL}/event-registrations/quick-join`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.apiToken}` },
    body: JSON.stringify({ eventCode, ...(couponCode ? { couponCode } : {}) }),
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const message = typeof data?.error === "string" ? data.error : "Something went wrong. Please try again.";
    return { error: message };
  }

  if (typeof data?.checkoutUrl === "string") {
    return { checkoutUrl: data.checkoutUrl };
  }

  return { success: true };
}
