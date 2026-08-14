"use client";

import { FormEvent, useState } from "react";
import { Button } from "@/components/Button";

export function NewsletterSignupForm() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setStatus("idle");

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/newsletter/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) throw new Error("Signup failed");

      setStatus("success");
      setEmail("");
    } catch {
      setStatus("error");
    } finally {
      setSubmitting(false);
    }
  }

  if (status === "success") {
    return <p className="mt-4 text-sm font-medium text-forest">You&rsquo;re subscribed — thank you!</p>;
  }

  return (
    <div className="mt-4 max-w-sm sm:mx-0 mx-auto">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Your email address"
          className="w-full rounded-lg border border-ink/20 bg-white px-4 py-2.5 text-sm focus:border-brand focus:outline-none"
        />
        <Button type="submit" variant="solid" disabled={submitting} className="!px-5 !py-2.5 whitespace-nowrap">
          {submitting ? "Signing Up…" : "Sign Up"}
        </Button>
      </form>
      {status === "error" && <p className="mt-2 text-xs text-red-600">Something went wrong — please try again.</p>}
    </div>
  );
}
