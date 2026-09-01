"use server";

import { auth } from "@/auth";

export interface SendReceiptEmailState {
  error?: string;
  result?: { sent: number; failed: { email: string; error: string }[] };
}

async function requireAdminToken(): Promise<string> {
  const session = await auth();
  if (!session?.apiToken || session.user?.role !== "admin") {
    throw new Error("Not authorized");
  }
  return session.apiToken;
}

// Same upload flow the generic content forms use (POST /uploads) — the PDF
// is uploaded first, then its URL is passed to the send endpoint, which
// reads the file back off disk to attach it.
async function uploadAttachment(file: File, token: string): Promise<string | null> {
  const formData = new FormData();
  formData.append("file", file);
  try {
    const res = await fetch(`${process.env.API_URL}/uploads`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    if (!res.ok) return null;
    const data = await res.json();
    return (data.url as string) ?? null;
  } catch (err) {
    // Same rule as every other fetch in this action: a form action bound to
    // <form action={...}> must never throw, or it surfaces as the generic
    // "Something went wrong" crash page instead of a real error message.
    // This call previously had no try/catch — a network failure reaching
    // the API (server down, connection reset, timeout) here would propagate
    // straight out of sendReceiptEmail uncaught.
    console.error("uploadAttachment: request failed:", err);
    return null;
  }
}

// A "use server" function bound to <form action={...}> must never throw on
// failure — it has no way to display that, so it'd surface as the generic
// "Something went wrong" crash page instead of a real error message (the
// same anti-pattern already fixed for login/coupons/admin-content this
// session). Every failure path here returns { error } instead.
export async function sendReceiptEmail(
  eventCode: string,
  _prevState: SendReceiptEmailState,
  formData: FormData
): Promise<SendReceiptEmailState> {
  let token: string;
  try {
    token = await requireAdminToken();
  } catch (err) {
    console.error("sendReceiptEmail: not authorized:", err);
    return { error: "You're not authorized to do that — try signing in again." };
  }

  const subject = String(formData.get("subject") ?? "").trim();
  const bodyHtml = String(formData.get("bodyHtml") ?? "").trim();
  if (!subject || !bodyHtml) {
    return { error: "Please fill in both a subject and a message." };
  }

  let attachmentUrl: string | undefined;
  const file = formData.get("attachment") as File | null;
  if (file && file.size > 0) {
    const uploaded = await uploadAttachment(file, token);
    if (!uploaded) {
      return { error: "Couldn't upload the attachment. Please try again." };
    }
    attachmentUrl = uploaded;
  }

  let res: Response;
  try {
    res = await fetch(`${process.env.API_URL}/event-registrations/${eventCode}/send-receipt-email`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ subject, bodyHtml, ...(attachmentUrl ? { attachmentUrl } : {}) }),
    });
  } catch (err) {
    console.error(`sendReceiptEmail ${eventCode}: request failed:`, err);
    return { error: "Couldn't reach the server. Please check your connection and try again." };
  }

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const message = typeof data?.error === "string" ? data.error : "Something went wrong sending the email.";
    return { error: message };
  }

  return { result: { sent: data.sent ?? 0, failed: data.failed ?? [] } };
}
