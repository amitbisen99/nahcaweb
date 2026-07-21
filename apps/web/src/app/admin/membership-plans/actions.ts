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

export async function updateMembershipPlan(type: string, formData: FormData) {
  const token = await requireAdminToken();

  const isInstitutional = type === "institutional";

  const payload: Record<string, unknown> = {
    name: formData.get("name"),
    term: formData.get("term"),
    note: formData.get("note"),
    benefits: formData.get("benefits"),
    priceCents: isInstitutional ? 0 : Math.round(Number(formData.get("price")) * 100),
  };

  if (isInstitutional) {
    payload.pricePerStudentCents = Math.round(Number(formData.get("pricePerStudent")) * 100);
    payload.minStudents = Number(formData.get("minStudents"));
  }

  await fetch(`${process.env.API_URL}/membership-plans/${type}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });

  revalidatePath("/admin/membership-plans");
  revalidatePath(`/admin/membership-plans/${type}`);
  redirect("/admin/membership-plans");
}
