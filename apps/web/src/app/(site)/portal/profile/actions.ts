"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";

export interface ProfileFormState {
  error?: string;
  success?: boolean;
}

export async function updateProfile(_prevState: ProfileFormState, formData: FormData): Promise<ProfileFormState> {
  const session = await auth();
  if (!session?.apiToken) return { error: "Not authenticated." };

  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { error: "Name is required." };

  const res = await fetch(`${process.env.API_URL}/auth/me`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.apiToken}` },
    body: JSON.stringify({ name }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    return { error: typeof data.error === "string" ? data.error : "Failed to update profile." };
  }

  revalidatePath("/portal/profile");
  return { success: true };
}
