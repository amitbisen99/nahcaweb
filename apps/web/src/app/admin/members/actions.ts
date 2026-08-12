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

export interface UpdateMemberActiveState {
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

// Toggles whether the member can log in — doesn't touch their profile data
// or purchase history. See User.isActive / POST /auth/login on the API.
export async function updateMemberActiveStatus(
  membershipId: number,
  isActive: boolean
): Promise<UpdateMemberActiveState> {
  const token = await requireAdminToken();

  const res = await fetch(`${process.env.API_URL}/memberships/${membershipId}/active`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ isActive }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => null);
    return { error: extractErrorMessage(data, "Failed to update this member's status.") };
  }

  revalidatePath("/admin/members");
  revalidatePath(`/admin/members/${membershipId}`);
  return { success: true };
}
