"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";

export interface RedeemState {
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

export async function redeemCode(code: string): Promise<RedeemState> {
  const session = await auth();
  if (!session?.apiToken) return { error: "Not authenticated." };

  const res = await fetch(`${process.env.API_URL}/institutions/redeem`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.apiToken}` },
    body: JSON.stringify({ code }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => null);
    return { error: extractErrorMessage(data, "Failed to redeem this code.") };
  }

  revalidatePath("/portal");
  revalidatePath("/portal/purchases");
  return { success: true };
}
