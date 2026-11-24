"use server";

import { auth } from "@/auth";

export interface PurchaseResult {
  error?: string;
  checkoutUrl?: string;
}

interface PurchaseInput {
  type: "regular" | "student" | "institutional" | "conference";
  studentCount?: number;
  contactPersonName?: string;
  couponCode?: string;
  profile?: Record<string, unknown>;
}

function extractErrorMessage(data: unknown, fallback: string): string {
  const error = (data as { error?: unknown } | null)?.error;
  if (typeof error === "string") return error;
  if (error && typeof error === "object") {
    const nested = error as { message?: string; fieldErrors?: Record<string, string[]>; formErrors?: string[] };
    if (nested.message) return nested.message;
    const fieldErrors = Object.entries(nested.fieldErrors ?? {})
      .map(([field, messages]) => `${field}: ${messages.join(", ")}`)
      .join("; ");
    return fieldErrors || nested.formErrors?.join("; ") || fallback;
  }
  return fallback;
}

// Buys a membership for the account that's signed in right now — the API
// takes who they are from the token, so nothing about the person is sent.
export async function purchaseMembership(input: PurchaseInput): Promise<PurchaseResult> {
  const session = await auth();
  if (!session?.apiToken) return { error: "Please log in to continue." };

  const res = await fetch(`${process.env.API_URL}/memberships/purchase`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.apiToken}` },
    body: JSON.stringify(input),
  });
  const data = await res.json().catch(() => null);

  if (!res.ok) {
    return { error: extractErrorMessage(data, "Something went wrong. Please try again.") };
  }
  return { checkoutUrl: (data as { checkoutUrl: string }).checkoutUrl };
}
