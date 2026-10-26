"use client";

import { FormEvent, useState } from "react";
import { ApiMemberProfile } from "@/lib/api";
import {
  profileDraftFromSaved,
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
import { updateMyProfile } from "./actions";

export function ProfileForm({
  name: initialName,
  email,
  profile,
}: {
  name: string;
  email: string;
  profile: ApiMemberProfile | null;
}) {
  const [name, setName] = useState(initialName);
  const [draft, setDraft] = useState<ProfileDraft>(() => profileDraftFromSaved(profile));
  const [showErrors, setShowErrors] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  function updateDraft(patch: Partial<ProfileDraft>) {
    setDraft((current) => ({ ...current, ...patch }));
  }

  // Members who signed up before the address was split into separate fields
  // still have it as one block of text — shown as a reminder to re-enter it.
  const hasStructuredAddress = Boolean(
    profile?.addressStreet || profile?.addressState || profile?.addressPostalCode
  );
  const legacyAddress = !hasStructuredAddress ? profile?.mailingAddress?.trim() || null : null;

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSaved(false);

    if (!name.trim()) {
      setError("Name is required.");
      return;
    }

    const problem = validateProfileDraft(draft);
    if (problem) {
      setShowErrors(true);
      setError(problem);
      document.getElementById(POSTAL_CODE_INPUT_ID)?.focus();
      return;
    }

    setSubmitting(true);

    const result = await updateMyProfile({ name: name.trim(), profile: profileDraftToPayload(draft) });

    setSubmitting(false);
    if (result.error) {
      setError(result.error);
    } else {
      setSaved(true);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 flex max-w-3xl flex-col gap-4">
      <Section title="Basic information" divider={false}>
        <label className="flex flex-col gap-1">
          <span className={fieldLabelClass()}>Name</span>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className={inputClass()}
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className={fieldLabelClass()}>Email</span>
          <input type="email" value={email} disabled className={`${inputClass()} bg-sand/20`} />
          <span className="text-xs text-black/50">Contact us if you need to change your email address.</span>
        </label>

        <PronounsField draft={draft} update={updateDraft} />

        <ContactFields draft={draft} update={updateDraft} showErrors={showErrors} legacyAddress={legacyAddress} />
      </Section>

      <QuestionnaireSections draft={draft} update={updateDraft} />

      {error && <p className="text-sm text-red-600">{error}</p>}
      {saved && !error && <p className="text-sm text-forest">Profile updated.</p>}

      <button
        type="submit"
        disabled={submitting}
        className="mt-2 self-start rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-dark disabled:opacity-50"
      >
        {submitting ? "Saving…" : "Save changes"}
      </button>
    </form>
  );
}
