"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { UploadError, uploadFile } from "@/lib/adminUpload";
import { RESOURCE_PAGES, RESOURCE_SECTIONS } from "@/lib/resourceSections";

// Same rule as the other content actions: never throw out of a form action —
// return the reason so the form can show it.
export interface ResourceFormState {
  error?: string;
}

const LIST_PATH = "/admin/content/resources";

async function adminToken(): Promise<string | null> {
  const session = await auth();
  return session?.apiToken && session.user?.role === "admin" ? session.apiToken : null;
}

function text(formData: FormData, name: string): string | null {
  const value = formData.get(name);
  return typeof value === "string" && value.trim() !== "" ? value.trim() : null;
}

// The rich-text editor leaves markup behind even when it looks empty ("<br>", "<p></p>").
function isBlankHtml(html: string): boolean {
  return html.replace(/<[^>]*>|&nbsp;/g, "").trim() === "";
}

async function errorMessage(res: Response): Promise<string> {
  const data = await res.json().catch(() => null);
  if (!data?.error) return `Request failed with status ${res.status}`;
  if (typeof data.error === "string") return data.error;
  const fieldErrors = Object.entries(data.error.fieldErrors ?? {})
    .map(([field, messages]) => `${field}: ${(messages as string[]).join(", ")}`)
    .join("; ");
  return fieldErrors || data.error.formErrors?.join("; ") || `Request failed with status ${res.status}`;
}

// Creates a resource (id null) or updates one. Every box is sent, so clearing a
// link or ticking a tag off really clears it.
export async function saveResource(
  id: string | null,
  _prevState: ResourceFormState,
  formData: FormData
): Promise<ResourceFormState> {
  const token = await adminToken();
  if (!token) return { error: "You're not authorized to do that — try signing in again." };

  const tags = formData.getAll("tags").filter((v): v is string => RESOURCE_SECTIONS.some((s) => s.slug === v));
  const pages = formData.getAll("pages").filter((v): v is string => RESOURCE_PAGES.some((p) => p.slug === v));

  const title = text(formData, "title");
  if (!title) return { error: "Please enter a title." };

  const payload: Record<string, unknown> = {
    title,
    websiteUrl: text(formData, "websiteUrl"),
    podcastUrl: text(formData, "podcastUrl"),
    videoUrl: text(formData, "videoUrl"),
    embedCode: text(formData, "embedCode"),
    // Only newsletters carry a date; the box is hidden otherwise.
    publishedDate: tags.includes("newsletters") ? text(formData, "publishedDate") : null,
    tags,
    pages,
    published: formData.get("published") === "on",
  };

  const description = formData.get("description");
  payload.description = typeof description === "string" && !isBlankHtml(description) ? description : null;

  try {
    const file = formData.get("fileUrl") as File | null;
    if (file && file.size > 0) {
      const url = await uploadFile(file, token);
      if (url) payload.fileUrl = url;
    } else if (formData.get("fileUrl__remove") === "on") {
      payload.fileUrl = null;
    }
  } catch (err) {
    if (err instanceof UploadError) return { error: err.message };
    console.error("saveResource: upload failed:", err);
    return { error: "Something went wrong while uploading the file. Please try again." };
  }

  let res: Response;
  try {
    res = await fetch(`${process.env.API_URL}/resources${id ? `/${id}` : ""}`, {
      method: id ? "PUT" : "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload),
    });
  } catch (err) {
    console.error("saveResource: request failed:", err);
    return { error: "Couldn't reach the server. Please check your connection and try again." };
  }

  if (!res.ok) {
    return { error: `Failed to save the resource: ${await errorMessage(res)}` };
  }

  // The public pages are fetched fresh on every visit, so only the admin list needs refreshing.
  revalidatePath(LIST_PATH);
  redirect(LIST_PATH);
}

export async function deleteResource(id: string): Promise<ResourceFormState> {
  const token = await adminToken();
  if (!token) return { error: "You're not authorized to do that — try signing in again." };

  let res: Response;
  try {
    res = await fetch(`${process.env.API_URL}/resources/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch (err) {
    console.error("deleteResource: request failed:", err);
    return { error: "Couldn't reach the server. Please try again." };
  }

  if (!res.ok) return { error: `Failed to delete the resource: ${await errorMessage(res)}` };

  revalidatePath(LIST_PATH);
  return {};
}
