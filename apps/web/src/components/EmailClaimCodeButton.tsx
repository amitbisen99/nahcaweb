"use client";

import { FormEvent, useState, useTransition } from "react";
import { emailClaimCode } from "@/app/(site)/portal/institution/actions";

// "Email" next to Copy on an unclaimed claim code: opens a small pop-up that
// asks for the student's email address and sends them the invitation, with
// the code already in the claim link.
export function EmailClaimCodeButton({ codeId, code }: { codeId: number; code: string }) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function close() {
    if (isPending) return;
    setOpen(false);
    setEmail("");
    setError(null);
    setSentTo(null);
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const address = email.trim();

    startTransition(async () => {
      try {
        const result = await emailClaimCode(codeId, address);
        if (result.error) {
          setError(result.error);
          return;
        }
        setSentTo(address);
      } catch (err) {
        console.error("Emailing claim code failed:", err);
        setError("Couldn't send the email. Please try again.");
      }
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-xs font-semibold text-brand hover:text-brand-dark"
      >
        Email
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4"
          onClick={close}
          role="dialog"
          aria-modal="true"
          aria-label="Email claim code"
        >
          <div
            className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {sentTo ? (
              <>
                <h3 className="font-heading text-lg font-semibold text-heading">Email sent</h3>
                <p className="mt-2 break-words text-sm text-black">
                  We&rsquo;ve emailed the invitation for code <span className="font-mono">{code}</span> to{" "}
                  <span className="font-semibold">{sentTo}</span>.
                </p>
                <button
                  type="button"
                  onClick={close}
                  className="mt-5 rounded-lg bg-brand px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-dark"
                >
                  Done
                </button>
              </>
            ) : (
              <form onSubmit={handleSubmit}>
                <h3 className="font-heading text-lg font-semibold text-heading">Email this claim code</h3>
                <p className="mt-1 text-sm text-black">
                  Enter the student&rsquo;s email address and we&rsquo;ll send them an invitation with a link to claim
                  code <span className="font-mono">{code}</span>.
                </p>

                <label className="mt-4 flex flex-col gap-1">
                  <span className="text-sm font-medium text-black">Student&rsquo;s email address</span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoFocus
                    className="rounded-lg border border-ink/20 bg-white px-3 py-2 focus:border-brand focus:outline-none"
                  />
                </label>

                {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

                <div className="mt-5 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={close}
                    disabled={isPending}
                    className="text-sm font-semibold text-black/60 hover:text-black disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isPending || !email.trim()}
                    className="rounded-lg bg-brand px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-dark disabled:opacity-50"
                  >
                    {isPending ? "Sending…" : "Send"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
