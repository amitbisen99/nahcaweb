"use client";

import { FormEvent, useState } from "react";
import { Button } from "@/components/Button";

const inputClass =
  "w-full rounded-lg border border-ink/20 bg-white px-4 py-2.5 text-sm focus:border-brand focus:outline-none";
const labelClass = "mb-1.5 block text-sm font-medium text-heading";

export function ContactForm() {
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    setSubmitting(true);
    setStatus("idle");

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.get("name"),
          email: data.get("email"),
          subject: data.get("subject"),
          message: data.get("message"),
          website: data.get("website"),
        }),
      });
      if (!res.ok) throw new Error("Send failed");

      setStatus("success");
      form.reset();
    } catch {
      setStatus("error");
    } finally {
      setSubmitting(false);
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-xl border border-forest/30 bg-forest/5 p-6">
        <p className="font-medium text-forest">Thank you — your message has been sent.</p>
        <p className="mt-1 text-sm text-black">We&rsquo;ll get back to you as soon as we can.</p>
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className="mt-4 text-sm font-semibold text-brand hover:text-brand-dark"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="contact-name" className={labelClass}>
            Name <span className="text-red-600">*</span>
          </label>
          <input id="contact-name" name="name" type="text" required maxLength={120} className={inputClass} />
        </div>
        <div>
          <label htmlFor="contact-email" className={labelClass}>
            Email <span className="text-red-600">*</span>
          </label>
          <input id="contact-email" name="email" type="email" required maxLength={190} className={inputClass} />
        </div>
      </div>
      <div>
        <label htmlFor="contact-subject" className={labelClass}>
          Subject
        </label>
        <input id="contact-subject" name="subject" type="text" maxLength={190} className={inputClass} />
      </div>
      <div>
        <label htmlFor="contact-message" className={labelClass}>
          Message <span className="text-red-600">*</span>
        </label>
        <textarea id="contact-message" name="message" required rows={6} maxLength={5000} className={inputClass} />
      </div>
      {/* Honeypot: hidden from people, filled in by bots. */}
      <div className="hidden" aria-hidden="true">
        <label>
          Website
          <input name="website" type="text" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      {status === "error" && (
        <p className="text-sm text-red-600">Something went wrong sending your message — please try again.</p>
      )}
      <Button type="submit" variant="solid" disabled={submitting}>
        {submitting ? "Sending…" : "Submit"}
      </Button>
    </form>
  );
}
