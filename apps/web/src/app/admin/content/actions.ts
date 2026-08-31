"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { CONTENT_TYPES, ContentTypeKey } from "@/lib/contentTypes";

// A "use server" function bound to <form action={...}> must never throw on
// failure — Next.js has no way to display that, it just renders the
// nearest error boundary's generic "Something went wrong" page and hides
// the real reason. Every action below returns this instead and lets the
// caller decide how to show it. (The same anti-pattern was already fixed
// for login and coupons earlier — this file just hadn't been touched yet.)
export interface ContentFormState {
  error?: string;
}

async function requireAdminToken(): Promise<string> {
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

async function buildSpeakers(fieldName: string, formData: FormData, token: string) {
  const speakers: { name: string; title?: string; photoUrl: string | null }[] = [];

  for (let i = 0; formData.has(`${fieldName}[${i}][name]`); i++) {
    const name = ((formData.get(`${fieldName}[${i}][name]`) as string) ?? "").trim();
    if (!name) continue;

    const title = ((formData.get(`${fieldName}[${i}][title]`) as string) ?? "").trim();
    const existingPhotoUrl = (formData.get(`${fieldName}[${i}][existingPhotoUrl]`) as string) || null;
    const photoFile = formData.get(`${fieldName}[${i}][photo]`) as File | null;

    let photoUrl = existingPhotoUrl;
    if (photoFile && photoFile.size > 0) {
      const uploaded = await uploadFile(photoFile, token);
      if (uploaded) photoUrl = uploaded;
    }

    speakers.push({ name, title: title || undefined, photoUrl });
  }

  return speakers;
}

async function buildPayload(type: ContentTypeKey, formData: FormData, token: string) {
  const config = CONTENT_TYPES[type];
  const payload: Record<string, unknown> = {};

  for (const field of config.fields) {
    if (field.type === "speakers") {
      payload[field.name] = await buildSpeakers(field.name, formData, token);
      continue;
    }

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
    if (field.type === "currency") {
      // Entered in dollars (see ContentForm's currency field), stored in
      // cents like every other price field in this app.
      payload[field.name] = Math.round(Number(raw) * 100);
    } else {
      payload[field.name] = field.type === "number" ? Number(raw) : raw;
    }
  }

  return payload;
}

async function extractErrorMessage(res: Response): Promise<string> {
  const data = await res.json().catch(() => null);
  if (!data?.error) return `Request failed with status ${res.status}`;
  if (typeof data.error === "string") return data.error;
  // zod's .flatten() shape: { fieldErrors: { field: ["message", ...] }, formErrors: [...] }
  const fieldErrors = Object.entries(data.error.fieldErrors ?? {})
    .map(([field, messages]) => `${field}: ${(messages as string[]).join(", ")}`)
    .join("; ");
  return fieldErrors || data.error.formErrors?.join("; ") || `Request failed with status ${res.status}`;
}

export async function createContentItem(
  type: ContentTypeKey,
  _prevState: ContentFormState,
  formData: FormData
): Promise<ContentFormState> {
  let token: string;
  let payload: Record<string, unknown>;
  try {
    token = await requireAdminToken();
    payload = await buildPayload(type, formData, token);
  } catch (err) {
    console.error(`createContentItem ${type}: failed to prepare request:`, err);
    return { error: "Something went wrong while preparing this request. Please try again." };
  }

  let res: Response;
  try {
    res = await fetch(`${process.env.API_URL}/${type}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload),
    });
  } catch (err) {
    console.error(`createContentItem ${type}: request failed:`, err);
    return { error: "Couldn't reach the server. Please check your connection and try again." };
  }

  if (!res.ok) {
    return { error: `Failed to create ${CONTENT_TYPES[type].singularLabel}: ${await extractErrorMessage(res)}` };
  }

  // redirect() throws internally by design — must stay outside the try/catch
  // above, or its own throw would be caught and reported as a real error.
  revalidatePath(`/admin/content/${type}`);
  redirect(`/admin/content/${type}`);
}

export async function updateContentItem(
  type: ContentTypeKey,
  id: string,
  _prevState: ContentFormState,
  formData: FormData
): Promise<ContentFormState> {
  let token: string;
  let payload: Record<string, unknown>;
  try {
    token = await requireAdminToken();
    payload = await buildPayload(type, formData, token);
  } catch (err) {
    console.error(`updateContentItem ${type}/${id}: failed to prepare request:`, err);
    return { error: "Something went wrong while preparing this request. Please try again." };
  }

  let res: Response;
  try {
    res = await fetch(`${process.env.API_URL}/${type}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload),
    });
  } catch (err) {
    console.error(`updateContentItem ${type}/${id}: request failed:`, err);
    return { error: "Couldn't reach the server. Please check your connection and try again." };
  }

  if (!res.ok) {
    return { error: `Failed to update ${CONTENT_TYPES[type].singularLabel}: ${await extractErrorMessage(res)}` };
  }

  revalidatePath(`/admin/content/${type}`);
  redirect(`/admin/content/${type}`);
}

export async function deleteContentItem(type: ContentTypeKey, id: string): Promise<ContentFormState> {
  let token: string;
  try {
    token = await requireAdminToken();
  } catch (err) {
    console.error(`deleteContentItem ${type}/${id}: not authorized:`, err);
    return { error: "You're not authorized to do that — try signing in again." };
  }

  let res: Response;
  try {
    res = await fetch(`${process.env.API_URL}/${type}/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch (err) {
    console.error(`deleteContentItem ${type}/${id}: request failed:`, err);
    return { error: "Couldn't reach the server. Please try again." };
  }

  if (!res.ok) {
    return { error: `Failed to delete ${CONTENT_TYPES[type].singularLabel}: ${await extractErrorMessage(res)}` };
  }

  revalidatePath(`/admin/content/${type}`);
  return {};
}

export async function publishContentItem(type: ContentTypeKey, id: string): Promise<ContentFormState> {
  let token: string;
  try {
    token = await requireAdminToken();
  } catch (err) {
    console.error(`publishContentItem ${type}/${id}: not authorized:`, err);
    return { error: "You're not authorized to do that — try signing in again." };
  }

  let res: Response;
  try {
    res = await fetch(`${process.env.API_URL}/${type}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ published: true }),
    });
  } catch (err) {
    console.error(`publishContentItem ${type}/${id}: request failed:`, err);
    return { error: "Couldn't reach the server. Please try again." };
  }

  if (!res.ok) {
    return { error: `Failed to publish ${CONTENT_TYPES[type].singularLabel}: ${await extractErrorMessage(res)}` };
  }

  revalidatePath(`/admin/content/${type}`);
  return {};
}
