"use server";

import { auth } from "@/auth";

export interface EmailCodeResult {
  error?: string;
  success?: boolean;
}

// Called straight from a button in the claim-codes table (not a <form>), so
// it never throws — a failure comes back as { error } for the pop-up to show
// rather than crashing the page.
export async function emailClaimCode(codeId: number, email: string): Promise<EmailCodeResult> {
  try {
    const session = await auth();
    if (!session?.apiToken) return { error: "You're not signed in — please sign in and try again." };

    const res = await fetch(`${process.env.API_URL}/institutions/codes/${codeId}/send-email`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.apiToken}` },
      body: JSON.stringify({ email }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      return { error: typeof data?.error === "string" ? data.error : "Couldn't send the email. Please try again." };
    }

    return { success: true };
  } catch (err) {
    console.error(`emailClaimCode ${codeId} failed:`, err);
    return { error: "Couldn't send the email. Please try again." };
  }
}
