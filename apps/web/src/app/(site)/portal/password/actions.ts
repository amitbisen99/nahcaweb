"use server";

import { auth } from "@/auth";

export interface PasswordFormState {
  error?: string;
  success?: boolean;
}

export async function changePassword(_prevState: PasswordFormState, formData: FormData): Promise<PasswordFormState> {
  const session = await auth();
  if (!session?.apiToken) return { error: "Not authenticated." };

  const currentPassword = String(formData.get("currentPassword") ?? "");
  const newPassword = String(formData.get("newPassword") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (newPassword.length < 8) return { error: "New password must be at least 8 characters." };
  if (newPassword !== confirmPassword) return { error: "New passwords do not match." };

  const res = await fetch(`${process.env.API_URL}/auth/change-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.apiToken}` },
    body: JSON.stringify({ currentPassword, newPassword }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    return { error: typeof data.error === "string" ? data.error : "Failed to change password." };
  }

  return { success: true };
}
