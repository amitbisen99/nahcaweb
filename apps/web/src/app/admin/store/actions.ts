"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";

export interface ProductFormState {
  error?: string;
}

export interface ProductActionState {
  error?: string;
  success?: boolean;
}

async function requireAdminToken(): Promise<string> {
  const session = await auth();
  if (!session?.apiToken || session.user?.role !== "admin") {
    throw new Error("Not authorized");
  }
  return session.apiToken;
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

export interface UploadState {
  url?: string;
  error?: string;
}

// Uploads on its own, called directly from ProductForm's file input the
// moment a file is chosen — kept out of the create/update form entirely so
// that form never submits as multipart. A form with a real <input
// type="file"> forces Next.js to fall back to a full-page multipart POST
// for progressive enhancement, which reloads the page and wipes every
// other field on any error (wrong price, blocked extension, whatever) —
// confusing enough on its own that it read as "the file upload doesn't
// work" even though the upload itself succeeded fine. Uploading ahead of
// time via its own action means the main form only ever carries the
// resulting URL as a plain hidden text field, so it stays a fast
// client-side transition like every other admin form.
export async function uploadProductFile(_prevState: UploadState, formData: FormData): Promise<UploadState> {
  let token: string;
  try {
    token = await requireAdminToken();
  } catch {
    return { error: "You're not authorized to do that — try signing in again." };
  }

  const file = formData.get("file") as File | null;
  if (!file || file.size === 0) {
    return { error: "Please choose a file." };
  }

  const upload = new FormData();
  upload.append("file", file);

  let res: Response;
  try {
    res = await fetch(`${process.env.API_URL}/products/admin/upload`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: upload,
    });
  } catch (err) {
    console.error("uploadProductFile: request failed:", err);
    return { error: "Couldn't reach the server. Please try again." };
  }

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    return { error: extractErrorMessage(data, "Couldn't upload the file.") };
  }

  return { url: data.url as string };
}

// Goes through the same generic image endpoint the rest of the admin panel
// already uses for content photos (image/PDF only, 10MB) rather than the
// product file endpoint's "any file, 50MB" policy — a thumbnail is always
// just a preview image, no reason to widen that policy for it.
export async function uploadProductThumbnail(_prevState: UploadState, formData: FormData): Promise<UploadState> {
  let token: string;
  try {
    token = await requireAdminToken();
  } catch {
    return { error: "You're not authorized to do that — try signing in again." };
  }

  const file = formData.get("file") as File | null;
  if (!file || file.size === 0) {
    return { error: "Please choose an image." };
  }

  const upload = new FormData();
  upload.append("file", file);

  let res: Response;
  try {
    res = await fetch(`${process.env.API_URL}/uploads`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: upload,
    });
  } catch (err) {
    console.error("uploadProductThumbnail: request failed:", err);
    return { error: "Couldn't reach the server. Please try again." };
  }

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    return { error: extractErrorMessage(data, "Couldn't upload the image.") };
  }

  return { url: data.url as string };
}

function readCommonFields(formData: FormData) {
  const type = formData.get("type") === "file" ? "file" : "video";
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const priceDollars = Number(formData.get("price"));
  const published = formData.get("published") === "on";
  const membersOnly = formData.get("membersOnly") === "on";
  const videoUrl = String(formData.get("videoUrl") ?? "").trim();
  const fileUrl = String(formData.get("fileUrl") ?? "").trim();
  const thumbnailUrl = String(formData.get("thumbnailUrl") ?? "").trim();
  return { type, title, description, priceDollars, published, membersOnly, videoUrl, fileUrl, thumbnailUrl };
}

// A "use server" function bound to <form action={...}> must never throw on
// failure — every error path here returns { error } instead, same rule
// applied everywhere else in this app.
export async function createProduct(_prevState: ProductFormState, formData: FormData): Promise<ProductFormState> {
  let token: string;
  try {
    token = await requireAdminToken();
  } catch {
    return { error: "You're not authorized to do that — try signing in again." };
  }

  const { type, title, description, priceDollars, published, membersOnly, videoUrl, fileUrl, thumbnailUrl } =
    readCommonFields(formData);
  if (!title || !description || !Number.isFinite(priceDollars) || priceDollars <= 0) {
    return { error: "Please fill in a title, description, and a price greater than $0." };
  }
  if (type === "file" && !fileUrl) {
    return { error: "Please upload a file." };
  }
  if (type === "video" && !videoUrl) {
    return { error: "Please enter a Vimeo or YouTube link." };
  }

  let res: Response;
  try {
    res = await fetch(`${process.env.API_URL}/products/admin`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        type,
        title,
        description,
        priceCents: Math.round(priceDollars * 100),
        published,
        membersOnly,
        ...(type === "video" ? { videoUrl } : { fileUrl }),
        ...(thumbnailUrl ? { thumbnailUrl } : {}),
      }),
    });
  } catch (err) {
    console.error("createProduct: request failed:", err);
    return { error: "Couldn't reach the server. Please try again." };
  }

  if (!res.ok) {
    const data = await res.json().catch(() => null);
    return { error: extractErrorMessage(data, "Couldn't create this product.") };
  }

  revalidatePath("/admin/store");
  redirect("/admin/store");
}

export async function updateProduct(
  productId: number,
  _prevState: ProductFormState,
  formData: FormData
): Promise<ProductFormState> {
  let token: string;
  try {
    token = await requireAdminToken();
  } catch {
    return { error: "You're not authorized to do that — try signing in again." };
  }

  const { type, title, description, priceDollars, published, membersOnly, videoUrl, fileUrl, thumbnailUrl } =
    readCommonFields(formData);
  if (!title || !description || !Number.isFinite(priceDollars) || priceDollars <= 0) {
    return { error: "Please fill in a title, description, and a price greater than $0." };
  }
  if (type === "file" && !fileUrl) {
    return { error: "Please upload a file." };
  }
  if (type === "video" && !videoUrl) {
    return { error: "Please enter a Vimeo or YouTube link." };
  }

  let res: Response;
  try {
    res = await fetch(`${process.env.API_URL}/products/admin/${productId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        type,
        title,
        description,
        priceCents: Math.round(priceDollars * 100),
        published,
        membersOnly,
        ...(type === "video" ? { videoUrl, fileUrl: null } : { fileUrl, videoUrl: null }),
        ...(thumbnailUrl ? { thumbnailUrl } : {}),
      }),
    });
  } catch (err) {
    console.error(`updateProduct ${productId}: request failed:`, err);
    return { error: "Couldn't reach the server. Please try again." };
  }

  if (!res.ok) {
    const data = await res.json().catch(() => null);
    return { error: extractErrorMessage(data, "Couldn't update this product.") };
  }

  revalidatePath("/admin/store");
  revalidatePath(`/admin/store/${productId}`);
  redirect("/admin/store");
}

// Both of these are called directly from a plain button (not a form
// submission) in ProductRowActions — never a throw here, or it'd crash the
// whole page with the generic "Something went wrong" error boundary
// instead of a retriable message next to the button that was clicked. Same
// fix as the Forum admin panel's identical bug.
async function withProductAdminAction(fn: (token: string) => Promise<ProductActionState>): Promise<ProductActionState> {
  try {
    const session = await auth();
    if (!session?.apiToken || session.user?.role !== "admin") {
      return { error: "You're not signed in as an admin." };
    }
    return await fn(session.apiToken);
  } catch (err) {
    console.error("Product admin action failed:", err);
    return { error: "Something went wrong. Please try again." };
  }
}

export async function deleteProduct(productId: number): Promise<ProductActionState> {
  return withProductAdminAction(async (token) => {
    const res = await fetch(`${process.env.API_URL}/products/admin/${productId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      return { error: extractErrorMessage(data, "Couldn't delete this product.") };
    }

    revalidatePath("/admin/store");
    return { success: true };
  });
}

export async function setProductPublished(productId: number, published: boolean): Promise<ProductActionState> {
  return withProductAdminAction(async (token) => {
    const res = await fetch(`${process.env.API_URL}/products/admin/${productId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ published }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      return { error: extractErrorMessage(data, "Couldn't update this product.") };
    }

    revalidatePath("/admin/store");
    return { success: true };
  });
}
