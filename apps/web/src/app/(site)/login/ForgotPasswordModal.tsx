"use client";

import { FormEvent, useState } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/Button";

export function ForgotPasswordModal() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<"idle" | "sent" | "not_found" | "error">("idle");

  function close() {
    setOpen(false);
    setEmail("");
    setStatus("idle");
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setStatus("idle");

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (res.status === 404) {
        setStatus("not_found");
      } else if (res.ok) {
        setStatus("sent");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="self-start text-sm font-semibold text-brand hover:text-brand-dark"
      >
        Forgot password?
      </button>

      {open &&
        createPortal(
          // Portaled to document.body — this dialog has its own <form>,
          // and this trigger normally sits inside the login page's <form>;
          // nesting a form inside a form is invalid HTML and React refuses
          // to hydrate/submit it correctly if rendered in place here.
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={close}>
            <div
              role="dialog"
              aria-modal="true"
              aria-label="Reset your password"
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm rounded-xl bg-white p-6 shadow-lg"
            >
              <div className="flex items-start justify-between">
                <h2 className="font-heading text-lg font-medium text-heading">Reset your password</h2>
                <button type="button" onClick={close} aria-label="Close" className="text-black/50 hover:text-black">
                  ✕
                </button>
              </div>

              {status === "sent" ? (
                <div className="mt-4">
                  <p className="text-sm text-forest">A password reset link has been sent to your email.</p>
                  <Button type="button" variant="solid" className="mt-4 w-full" onClick={close}>
                    Close
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3">
                  <label className="flex flex-col gap-1">
                    <span className="text-sm font-medium text-black">Registered email</span>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="rounded-lg border border-ink/20 bg-white px-3 py-2 text-sm focus:border-brand focus:outline-none"
                    />
                  </label>

                  {status === "not_found" && (
                    <p className="text-sm text-red-600">No account found with that email address.</p>
                  )}
                  {status === "error" && <p className="text-sm text-red-600">Something went wrong — please try again.</p>}

                  <Button type="submit" variant="solid" className="mt-1 w-full" disabled={submitting}>
                    {submitting ? "Sending…" : "Send reset link"}
                  </Button>
                </form>
              )}
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
