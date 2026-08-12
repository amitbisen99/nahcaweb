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

export interface MemberProfileUpdatePayload {
  name?: string;
  profile?: Record<string, unknown>;
}

export interface UpdateMemberProfileState {
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

export async function updateMemberProfile(
  membershipId: number,
  payload: MemberProfileUpdatePayload
): Promise<UpdateMemberProfileState> {
  const token = await requireAdminToken();

  const res = await fetch(`${process.env.API_URL}/memberships/${membershipId}/profile`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => null);
    return { error: extractErrorMessage(data, "Failed to update this member's profile.") };
  }

  revalidatePath("/admin/members");
  revalidatePath(`/admin/members/${membershipId}`);
  return { success: true };
}
