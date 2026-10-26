"use client";

// The membership questionnaire, shared by the signup form
// (membership/join/JoinForm.tsx), the claim-code form
// (membership/claim/ClaimForm.tsx) and the portal profile editor
// (portal/profile/ProfileForm.tsx). Each form owns a ProfileDraft in state and
// drops these sections into its own layout; see lib/memberProfileDraft.ts for
// the draft shape and how it becomes the API payload.

import { useState } from "react";
import {
  CARE_CONTEXTS,
  HEAR_ABOUT_OPTIONS,
  HEAR_ABOUT_OTHER_TRIGGERS,
  ORG_MEMBERSHIPS,
  PREFERRED_PRONOUN_OPTIONS,
  PRIMARY_ROLES,
  RELIGIOUS_TRADITIONS,
} from "@/lib/memberProfileFields";
import {
  POSTAL_CODE_ERROR,
  PlaceRow,
  ProfileDraft,
  SPIRITUAL_CARE_SETTINGS,
  US_STATES,
  emptyPlace,
  isValidUsPostalCode,
} from "@/lib/memberProfileDraft";
import { CheckboxGrid, Section, YesNoRadio, fieldLabelClass, inputClass, toggleInArray } from "./MemberProfileFormFields";

export const POSTAL_CODE_INPUT_ID = "address-postal-code";

interface DraftProps {
  draft: ProfileDraft;
  update: (patch: Partial<ProfileDraft>) => void;
}

export function PronounsField({ draft, update }: DraftProps) {
  return (
    <label className="flex flex-col gap-1">
      <span className={fieldLabelClass()}>Preferred pronouns</span>
      <select
        value={draft.preferredPronouns}
        onChange={(e) => update({ preferredPronouns: e.target.value })}
        className={inputClass()}
      >
        <option value="">Select…</option>
        {PREFERRED_PRONOUN_OPTIONS.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      {draft.preferredPronouns === "Something else" && (
        <input
          type="text"
          value={draft.preferredPronounsOther}
          onChange={(e) => update({ preferredPronounsOther: e.target.value })}
          placeholder="Please specify"
          className={`mt-1 ${inputClass()}`}
        />
      )}
    </label>
  );
}

// Address, contact number and WhatsApp. `showErrors` lets the parent form
// surface a bad ZIP immediately when someone hits submit without having
// touched the field; otherwise it only complains once they leave it.
export function ContactFields({
  draft,
  update,
  showErrors = false,
  legacyAddress,
}: DraftProps & { showErrors?: boolean; legacyAddress?: string | null }) {
  const [postalTouched, setPostalTouched] = useState(false);
  const postalInvalid =
    draft.addressPostalCode.trim() !== "" && !isValidUsPostalCode(draft.addressPostalCode);
  const showPostalError = postalInvalid && (postalTouched || showErrors);

  return (
    <>
      <div className="flex flex-col gap-3">
        <span className={fieldLabelClass()}>Address</span>
        {legacyAddress && (
          <p className="rounded-lg border border-ink/10 bg-sand/20 px-3 py-2 text-xs text-black">
            Address on file from before: {legacyAddress}. Please re-enter it in the fields below.
          </p>
        )}

        <label className="flex flex-col gap-1">
          <span className="text-xs text-black/70">Street Address</span>
          <input
            type="text"
            value={draft.addressStreet}
            onChange={(e) => update({ addressStreet: e.target.value })}
            autoComplete="street-address"
            className={inputClass()}
          />
        </label>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="flex flex-col gap-1">
            <span className="text-xs text-black/70">State/Territory</span>
            <select
              value={draft.addressState}
              onChange={(e) => update({ addressState: e.target.value })}
              className={inputClass()}
            >
              <option value="">Select…</option>
              {US_STATES.map((state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-xs text-black/70">Country</span>
            <input type="text" value="USA" disabled className={`${inputClass()} bg-sand/20`} />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-xs text-black/70">Postal Code</span>
            <input
              id={POSTAL_CODE_INPUT_ID}
              type="text"
              inputMode="numeric"
              autoComplete="postal-code"
              maxLength={10}
              value={draft.addressPostalCode}
              onChange={(e) => update({ addressPostalCode: e.target.value })}
              onBlur={() => setPostalTouched(true)}
              placeholder="12345"
              aria-invalid={showPostalError}
              className={`${inputClass()} ${showPostalError ? "border-red-500" : ""}`}
            />
            {showPostalError && (
              <span role="alert" className="text-xs font-medium text-red-600">
                {POSTAL_CODE_ERROR}
              </span>
            )}
          </label>
        </div>
      </div>

      <label className="flex flex-col gap-1">
        <span className={fieldLabelClass()}>Contact number</span>
        <input
          type="tel"
          value={draft.phone}
          onChange={(e) => update({ phone: e.target.value })}
          className={inputClass()}
        />
      </label>

      <div className="flex flex-col gap-1.5">
        <span className={fieldLabelClass()}>Do you use WhatsApp?</span>
        <YesNoRadio
          name="usesWhatsapp"
          value={draft.usesWhatsapp}
          onChange={(v) =>
            update(v === "no" ? { usesWhatsapp: v, whatsappContactOk: "", whatsappNumber: "" } : { usesWhatsapp: v })
          }
        />
      </div>

      {draft.usesWhatsapp === "yes" && (
        <>
          <label className="flex flex-col gap-1">
            <span className={fieldLabelClass()}>WhatsApp mobile number</span>
            <input
              type="tel"
              value={draft.whatsappNumber}
              onChange={(e) => update({ whatsappNumber: e.target.value })}
              className={inputClass()}
            />
          </label>

          <div className="flex flex-col gap-1.5">
            <span className={fieldLabelClass()}>If so, may NAHCA contact you via WhatsApp?</span>
            <YesNoRadio
              name="whatsappContactOk"
              value={draft.whatsappContactOk}
              onChange={(v) => update({ whatsappContactOk: v })}
            />
          </div>
        </>
      )}
    </>
  );
}

// A dropdown over SPIRITUAL_CARE_SETTINGS with a "Please specify" box that
// appears for "Other".
function SettingSelect({
  label,
  value,
  otherValue,
  onChange,
  onOtherChange,
}: {
  label: string;
  value: string;
  otherValue: string;
  onChange: (value: string) => void;
  onOtherChange: (value: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="flex flex-col gap-1">
        <span className="text-xs text-black/70">{label}</span>
        <select value={value} onChange={(e) => onChange(e.target.value)} className={inputClass()}>
          <option value="">Select…</option>
          {SPIRITUAL_CARE_SETTINGS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </label>
      {value === "Other" && (
        <input
          type="text"
          value={otherValue}
          onChange={(e) => onOtherChange(e.target.value)}
          placeholder="Please specify"
          className={inputClass()}
        />
      )}
    </div>
  );
}

// Everything below "Basic information".
export function QuestionnaireSections({ draft, update }: DraftProps) {
  function updatePlace(index: number, patch: Partial<PlaceRow>) {
    update({ places: draft.places.map((place, i) => (i === index ? { ...place, ...patch } : place)) });
  }

  return (
    <>
      <Section title="Religious/spiritual tradition">
        <CheckboxGrid
          options={RELIGIOUS_TRADITIONS}
          selected={draft.religiousTraditions}
          onToggle={(value) => update({ religiousTraditions: toggleInArray(draft.religiousTraditions, value) })}
        />
        {draft.religiousTraditions.includes("Something else") && (
          <input
            type="text"
            value={draft.religiousTraditionOther}
            onChange={(e) => update({ religiousTraditionOther: e.target.value })}
            placeholder="Please specify"
            className={inputClass()}
          />
        )}
      </Section>

      <Section title="Primary role in spiritual care">
        <div className="flex flex-col gap-2">
          {PRIMARY_ROLES.map((role) => (
            <div key={role.value} className="flex flex-col gap-2">
              <label className="flex items-start gap-2 text-sm text-black">
                <input
                  type="radio"
                  name="primaryRole"
                  className="mt-0.5"
                  checked={draft.primaryRole === role.value}
                  onChange={() => update({ primaryRole: role.value })}
                />
                <span>{role.label}</span>
              </label>
              {role.value === "chaplain" && draft.primaryRole === "chaplain" && (
                <div className="ml-6">
                  <SettingSelect
                    label="Which setting?"
                    value={draft.primaryRoleSetting}
                    otherValue={draft.primaryRoleSettingOther}
                    onChange={(value) => update({ primaryRoleSetting: value })}
                    onOtherChange={(value) => update({ primaryRoleSettingOther: value })}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </Section>

      <Section title="What are you interested in?">
        <SettingSelect
          label="Select one"
          value={draft.interestedIn}
          otherValue={draft.interestedInOther}
          onChange={(value) => update({ interestedIn: value })}
          onOtherChange={(value) => update({ interestedInOther: value })}
        />
      </Section>

      <Section title="Places of employment and/or study">
        <div className="flex flex-col gap-4">
          {draft.places.map((place, i) => (
            <div key={i} className="flex flex-col gap-3 rounded-lg border border-ink/10 p-4">
              <label className="flex flex-col gap-1">
                <span className={fieldLabelClass()}>Primary role in spiritual care</span>
                <input
                  type="text"
                  value={place.spiritualCareRole}
                  onChange={(e) => updatePlace(i, { spiritualCareRole: e.target.value })}
                  className={inputClass()}
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className={fieldLabelClass()}>Affiliated organizations</span>
                <input
                  type="text"
                  value={place.affiliatedOrganizations}
                  onChange={(e) => updatePlace(i, { affiliatedOrganizations: e.target.value })}
                  className={inputClass()}
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className={fieldLabelClass()}>Role/Program of Study</span>
                <input
                  type="text"
                  value={place.studyProgram}
                  onChange={(e) => updatePlace(i, { studyProgram: e.target.value })}
                  className={inputClass()}
                />
              </label>
              {draft.places.length > 1 && (
                <button
                  type="button"
                  onClick={() => update({ places: draft.places.filter((_, index) => index !== i) })}
                  className="self-start text-xs font-semibold text-red-600 hover:text-red-700"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={() => update({ places: [...draft.places, emptyPlace()] })}
            className="self-start rounded-lg border border-ink/20 px-4 py-2 text-sm font-medium text-black hover:border-brand"
          >
            + Add another
          </button>
        </div>
      </Section>

      <Section title="How did you hear about NAHCA?">
        <div className="flex flex-col gap-2">
          {HEAR_ABOUT_OPTIONS.map((option) => (
            <label key={option} className="flex items-start gap-2 text-sm text-black">
              <input
                type="radio"
                name="hearAboutUs"
                className="mt-0.5"
                checked={draft.hearAboutUs === option}
                onChange={() => update({ hearAboutUs: option })}
              />
              <span>{option}</span>
            </label>
          ))}
        </div>
        {HEAR_ABOUT_OTHER_TRIGGERS.includes(draft.hearAboutUs) && (
          <input
            type="text"
            value={draft.hearAboutUsOther}
            onChange={(e) => update({ hearAboutUsOther: e.target.value })}
            placeholder="Please specify"
            className={inputClass()}
          />
        )}
      </Section>

      <Section title="Which contexts of spiritual care are you interested in?">
        <CheckboxGrid
          options={CARE_CONTEXTS}
          selected={draft.careContexts}
          onToggle={(value) => update({ careContexts: toggleInArray(draft.careContexts, value) })}
        />
      </Section>

      <Section title="Board certification">
        <div className="flex flex-col gap-1.5">
          <span className={fieldLabelClass()}>Are you board certified by any organization?</span>
          <YesNoRadio
            name="boardCertified"
            value={draft.boardCertified}
            onChange={(v) => update(v === "no" ? { boardCertified: v, boardCertifiedOrg: "" } : { boardCertified: v })}
          />
        </div>
        {draft.boardCertified === "yes" && (
          <label className="flex flex-col gap-1">
            <span className={fieldLabelClass()}>Which organization</span>
            <input
              type="text"
              value={draft.boardCertifiedOrg}
              onChange={(e) => update({ boardCertifiedOrg: e.target.value })}
              className={inputClass()}
            />
          </label>
        )}
      </Section>

      <Section title="Endorsement">
        <div className="flex flex-col gap-1.5">
          <span className={fieldLabelClass()}>Are you endorsed for chaplaincy by any organization?</span>
          <YesNoRadio
            name="endorsed"
            value={draft.endorsed}
            onChange={(v) => update(v === "no" ? { endorsed: v, endorsedBy: "" } : { endorsed: v })}
          />
        </div>
        {draft.endorsed === "yes" && (
          <label className="flex flex-col gap-1">
            <span className={fieldLabelClass()}>Who is your endorser?</span>
            <input
              type="text"
              value={draft.endorsedBy}
              onChange={(e) => update({ endorsedBy: e.target.value })}
              className={inputClass()}
            />
          </label>
        )}
      </Section>

      <Section title="Professional organization memberships">
        <CheckboxGrid
          options={ORG_MEMBERSHIPS}
          selected={draft.orgMemberships}
          onToggle={(value) => update({ orgMemberships: toggleInArray(draft.orgMemberships, value) })}
        />
        {draft.orgMemberships.includes("Other") && (
          <input
            type="text"
            value={draft.orgMembershipOther}
            onChange={(e) => update({ orgMembershipOther: e.target.value })}
            placeholder="Please specify"
            className={inputClass()}
          />
        )}
      </Section>
    </>
  );
}
