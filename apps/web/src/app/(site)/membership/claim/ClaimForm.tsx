"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import {
  emptyProfileDraft,
  profileDraftToPayload,
  validateProfileDraft,
  type ProfileDraft,
} from "@/lib/memberProfileDraft";
import { Section, fieldLabelClass, inputClass } from "@/components/MemberProfileFormFields";
import {
  ContactFields,
  POSTAL_CODE_INPUT_ID,
  PronounsField,
  QuestionnaireSections,
} from "@/components/MemberProfileQuestionnaire";

export function ClaimForm({ initialCode }: { initialCode?: string }) {
  const [code, setCode] = useState(initialCode ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [draft, setDraft] = useState<ProfileDraft>(emptyProfileDraft);
  const [showErrors, setShowErrors] = useState(false);

  function updateDraft(patch: Partial<ProfileDraft>) {
    setDraft((current) => ({ ...current, ...patch }));
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const problem = validateProfileDraft(draft);
    if (problem) {
      setShowErrors(true);
      setError(problem);
      document.getElementById(POSTAL_CODE_INPUT_ID)?.focus();
      return;
    }

    setSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const firstName = String(formData.get("firstName") ?? "").trim();
    const lastName = String(formData.get("lastName") ?? "").trim();
    const name = `${firstName} ${lastName}`.trim();

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/institutions/claim`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          name,
          email: formData.get("email"),
          password: formData.get("password"),
          profile: profileDraftToPayload(draft),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error?.message ?? data.error ?? "Something went wrong. Please try again.");
      }

      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <div className="mt-10 w-full max-w-3xl rounded-xl border border-forest/30 bg-forest/5 p-8">
        <h2 className="font-heading text-xl font-semibold text-heading">You&rsquo;re in!</h2>
        <p className="mt-2 text-sm text-black">
          Your institution-sponsored NAHCA membership is active — no payment needed. A confirmation email is on
          its way.
        </p>
        <Link
          href="/login"
          className="mt-4 inline-flex rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark"
        >
          Log in to your account
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-10 w-full max-w-3xl">
      <p className="text-sm text-black">
        Already a NAHCA member?{" "}
        <Link href="/portal/redeem" className="font-semibold text-brand hover:text-brand-dark">
          Log in and redeem your code from the Member Portal
        </Link>{" "}
        instead.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4 rounded-xl border border-ink/10 bg-white p-6 sm:p-8">
        <Section title="Your claim code" divider={false}>
          <label className="flex flex-col gap-1">
            <span className={fieldLabelClass()}>Claim code</span>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
              placeholder="XXXX-XXXX-XX"
              className={`uppercase ${inputClass()}`}
            />
            <span className="text-xs text-black/50">Given to you by your sponsoring institution.</span>
          </label>
        </Section>

        <Section title="Basic information">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1">
              <span className={fieldLabelClass()}>First Name</span>
              <input type="text" name="firstName" required className={inputClass()} />
            </label>
            <label className="flex flex-col gap-1">
              <span className={fieldLabelClass()}>Last Name</span>
              <input type="text" name="lastName" required className={inputClass()} />
            </label>
          </div>

          <PronounsField draft={draft} update={updateDraft} />

          <label className="flex flex-col gap-1">
            <span className={fieldLabelClass()}>Email address that you check regularly</span>
            <input type="email" name="email" required className={inputClass()} />
          </label>

          <label className="flex flex-col gap-1">
            <span className={fieldLabelClass()}>Password</span>
            <input type="password" name="password" required minLength={8} className={inputClass()} />
          </label>

          <ContactFields draft={draft} update={updateDraft} showErrors={showErrors} />
        </Section>

        <QuestionnaireSections draft={draft} update={updateDraft} />

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="mt-2 rounded-lg bg-brand px-5 py-2.5 font-medium text-white hover:bg-brand-dark disabled:opacity-50"
        >
          {submitting ? "Activating your membership…" : "Claim my membership"}
        </button>
      </form>
    </div>
  );
}
