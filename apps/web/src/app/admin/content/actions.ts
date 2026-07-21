"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { CONTENT_TYPES, ContentTypeKey } from "@/lib/contentTypes";

async function requireAdminToken() {
  const session = await auth();
  if (!session?.apiToken || session.user?.role !== "admin") {
    throw new Error("Not authorized");
  }
  return session.apiToken;
}

async function uploadFile(file: File, token: string): Promise<string | null> {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch(`${process.env.API_URL}/uploads`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  if (!res.ok) return null;
  const data = await res.json();
  return (data.url as string) ?? null;
}

async function buildPayload(type: ContentTypeKey, formData: FormData, token: string) {
  const config = CONTENT_TYPES[type];
  const payload: Record<string, unknown> = {};

  for (const field of config.fields) {
    if (field.type === "file") {
      const file = formData.get(field.name) as File | null;
      if (file && file.size > 0) {
        const url = await uploadFile(file, token);
        if (url) payload[field.name] = url;
      } else if (formData.get(`${field.name}__remove`) === "on") {
        payload[field.name] = null;
      }
      continue;
    }

    if (field.type === "checkbox") {
      payload[field.name] = formData.get(field.name) === "on";
      continue;
    }

    const raw = formData.get(field.name);
    if (raw === null || raw === "") continue;
    payload[field.name] = field.type === "number" ? Number(raw) : raw;
  }

  return payload;
}

export async function createContentItem(type: ContentTypeKey, formData: FormData) {
  const token = await requireAdminToken();
  const payload = await buildPayload(type, formData, token);

  await fetch(`${process.env.API_URL}/${type}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });

  revalidatePath(`/admin/content/${type}`);
  redirect(`/admin/content/${type}`);
}

export async function updateContentItem(type: ContentTypeKey, id: string, formData: FormData) {
  const token = await requireAdminToken();
  const payload = await buildPayload(type, formData, token);

  await fetch(`${process.env.API_URL}/${type}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });

  revalidatePath(`/admin/content/${type}`);
  redirect(`/admin/content/${type}`);
}

export async function deleteContentItem(type: ContentTypeKey, id: string) {
  const token = await requireAdminToken();

  await fetch(`${process.env.API_URL}/${type}/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });

  revalidatePath(`/admin/content/${type}`);
}

export async function publishContentItem(type: ContentTypeKey, id: string) {
  const token = await requireAdminToken();

  await fetch(`${process.env.API_URL}/${type}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ published: true }),
  });

  revalidatePath(`/admin/content/${type}`);
}
