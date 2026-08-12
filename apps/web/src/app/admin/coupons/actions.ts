"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";

async function requireAdminToken() {
  const session = await auth();
  if (!session?.apiToken || session.user?.role !== "admin") {
    throw new Error("Not authorized");
  }
  return session.apiToken;
}

async function extractErrorMessage(res: Response): Promise<string> {
  const data = await res.json().catch(() => null);
  if (!data?.error) return `Request failed with status ${res.status}`;
  if (typeof data.error === "string") return data.error;
  const fieldErrors = Object.entries(data.error.fieldErrors ?? {})
    .map(([field, messages]) => `${field}: ${(messages as string[]).join(", ")}`)
    .join("; ");
  return fieldErrors || data.error.formErrors?.join("; ") || `Request failed with status ${res.status}`;
}

function buildPayload(formData: FormData) {
  const appliesTo = formData.getAll("appliesTo") as string[];
  const validFrom = formData.get("validFrom");
  const validTill = formData.get("validTill");
  const maxUses = formData.get("maxUses");
  const discountType = formData.get("discountType");
  const rawDiscountValue = Number(formData.get("discountValue") || 0);
  // Stored in cents for fixed_amount (matches every other price field in this
  // app), as a plain 0-100 integer for percent, unused for complimentary.
  const discountValue = discountType === "fixed_amount" ? Math.round(rawDiscountValue * 100) : Math.round(rawDiscountValue);

  return {
    name: formData.get("name"),
    code: formData.get("code"),
    discountType,
    discountValue,
    appliesTo,
    validFrom: validFrom ? validFrom : null,
    validTill: validTill ? validTill : null,
    maxUses: maxUses ? Number(maxUses) : null,
    published: formData.get("published") === "on",
  };
}

export async function createCoupon(formData: FormData) {
  const token = await requireAdminToken();
  const payload = buildPayload(formData);

  const res = await fetch(`${process.env.API_URL}/coupons`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error(`Failed to create coupon: ${await extractErrorMessage(res)}`);
  }

  revalidatePath("/admin/coupons");
  redirect("/admin/coupons");
}

export async function updateCoupon(id: string, formData: FormData) {
  const token = await requireAdminToken();
  const payload = buildPayload(formData);

  const res = await fetch(`${process.env.API_URL}/coupons/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error(`Failed to update coupon: ${await extractErrorMessage(res)}`);
  }

  revalidatePath("/admin/coupons");
  revalidatePath(`/admin/coupons/${id}`);
  redirect("/admin/coupons");
}

export async function deleteCoupon(id: string) {
  const token = await requireAdminToken();

  const res = await fetch(`${process.env.API_URL}/coupons/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    throw new Error(`Failed to delete coupon: ${await extractErrorMessage(res)}`);
  }

  revalidatePath("/admin/coupons");
}
