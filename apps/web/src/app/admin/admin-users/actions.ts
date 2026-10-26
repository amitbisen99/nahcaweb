"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { ADMIN_PERMISSION_KEYS } from "@/lib/adminPermissions";

export interface AdminUserFormState {
  error?: string;
  success?: string;
}

export interface AdminUserActionState {
  error?: string;
  success?: boolean;
}

async function superAdminToken(): Promise<string | null> {
  const session = await auth();
  return session?.apiToken && session.user?.role === "admin" ? session.apiToken : null;
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

// Only keys we know about — the form is just checkboxes, but the API is the
// one that actually enforces this.
function readPermissions(formData: FormData): string[] {
  return formData.getAll("permissions").filter((v): v is string => ADMIN_PERMISSION_KEYS.includes(v as never));
}

// A "use server" function bound to a <form> never throws on failure — every
// error path returns { error } so the form shows it instead of crashing.
export async function createAdminUser(_prev: AdminUserFormState, formData: FormData): Promise<AdminUserFormState> {
  const token = await superAdminToken();
  if (!token) return { error: "You're not signed in as an admin." };

  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!name || !email || password.length < 8) {
    return { error: "Please enter a name, an email, and a password of at least 8 characters." };
  }

  let res: Response;
  try {
    res = await fetch(`${process.env.API_URL}/admin-users`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ name, email, password, permissions: readPermissions(formData) }),
    });
  } catch (err) {
    console.error("createAdminUser: request failed:", err);
    return { error: "Couldn't reach the server. Please try again." };
  }

  if (!res.ok) {
    const data = await res.json().catch(() => null);
    return { error: extractErrorMessage(data, "Couldn't create this admin.") };
  }

  revalidatePath("/admin/admin-users");
  redirect("/admin/admin-users");
}

export async function updateAdminUser(
  adminId: number,
  _prev: AdminUserFormState,
  formData: FormData
): Promise<AdminUserFormState> {
  const token = await superAdminToken();
  if (!token) return { error: "You're not signed in as an admin." };

  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { error: "Please enter a name." };

  let res: Response;
  try {
    res = await fetch(`${process.env.API_URL}/admin-users/${adminId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        name,
        permissions: readPermissions(formData),
        isActive: formData.get("isActive") === "on",
        isSuperAdmin: formData.get("access") === "super",
      }),
    });
  } catch (err) {
    console.error(`updateAdminUser ${adminId}: request failed:`, err);
    return { error: "Couldn't reach the server. Please try again." };
  }

  if (!res.ok) {
    const data = await res.json().catch(() => null);
    return { error: extractErrorMessage(data, "Couldn't save the changes.") };
  }

  revalidatePath("/admin/admin-users");
  revalidatePath(`/admin/admin-users/${adminId}`);
  return { success: "Changes saved." };
}

export async function resetAdminPassword(
  adminId: number,
  _prev: AdminUserFormState,
  formData: FormData
): Promise<AdminUserFormState> {
  const token = await superAdminToken();
  if (!token) return { error: "You're not signed in as an admin." };

  const password = String(formData.get("password") ?? "");
  if (password.length < 8) return { error: "Password must be at least 8 characters." };

  let res: Response;
  try {
    res = await fetch(`${process.env.API_URL}/admin-users/${adminId}/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ password }),
    });
  } catch (err) {
    console.error(`resetAdminPassword ${adminId}: request failed:`, err);
    return { error: "Couldn't reach the server. Please try again." };
  }

  if (!res.ok) {
    const data = await res.json().catch(() => null);
    return { error: extractErrorMessage(data, "Couldn't reset the password.") };
  }

  return { success: "Password reset. Share the new password with them securely." };
}

// Called straight from a button (not a <form>), so it must never throw — see
// the same note on the Store's delete action.
export async function deleteAdminUser(adminId: number): Promise<AdminUserActionState> {
  try {
    const token = await superAdminToken();
    if (!token) return { error: "You're not signed in as an admin." };

    const res = await fetch(`${process.env.API_URL}/admin-users/${adminId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      return { error: extractErrorMessage(data, "Couldn't delete this admin.") };
    }

    revalidatePath("/admin/admin-users");
    return { success: true };
  } catch (err) {
    console.error(`deleteAdminUser ${adminId} failed:`, err);
    return { error: "Something went wrong. Please try again." };
  }
}
