"use client";

import { FormEvent, useState } from "react";
import { AdminMembershipDetail } from "@/lib/adminApi";
import {
  CARE_CONTEXTS,
  HEAR_ABOUT_OPTIONS,
  HEAR_ABOUT_OTHER_TRIGGERS,
  ORG_MEMBERSHIPS,
  PREFERRED_PRONOUN_OPTIONS,
  PRIMARY_ROLES,
  RELIGIOUS_TRADITIONS,
  emptyEmployment,
  type EmploymentEntry,
} from "@/lib/memberProfileFields";
import {
  CheckboxGrid,
  Section,
  YesNoRadio,
  fieldLabelClass,
  inputClass,
  toggleInArray,
} from "@/components/MemberProfileFormFields";
import { updateMemberProfile } from "@/app/admin/members/actions";

function toYesNo(value: boolean | null | undefined): "" | "yes" | "no" {
  if (value === true) return "yes";
  if (value === false) return "no";
  return "";
}

function resolvePronounState(value: string | null | undefined): { selected: string; other: string } {
  if (!value) return { selected: "", other: "" };
  if (PREFERRED_PRONOUN_OPTIONS.slice(0, -1).includes(value)) return { selected: value, other: "" };
  return { selected: "Something else", other: value };
}

export function MemberProfileForm({ membership }: { membership: AdminMembershipDetail }) {
  const profile = membership.user.profile;
  const initialPronouns = resolvePronounState(profile?.preferredPronouns ?? null);

  const [name, setName] = useState(membership.user.name);
  const [preferredPronouns, setPreferredPronouns] = useState(initialPronouns.selected);
  const [preferredPronounsOther, setPreferredPronounsOther] = useState(initialPronouns.other);
  const [mailingAddress, setMailingAddress] = useState(profile?.mailingAddress ?? "");
  const [phone, setPhone] = useState(profile?.phone ?? "");
  const [usesWhatsapp, setUsesWhatsapp] = useState<"" | "yes" | "no">(toYesNo(profile?.usesWhatsapp));
  const [whatsappContactOk, setWhatsappContactOk] = useState<"" | "yes" | "no">(
    toYesNo(profile?.whatsappContactOk)
  );
  const [religiousTraditions, setReligiousTraditions] = useState<string[]>(profile?.religiousTraditions ?? []);
  const [religiousTraditionOther, setReligiousTraditionOther] = useState(profile?.religiousTraditionOther ?? "");
  const [primaryRole, setPrimaryRole] = useState<"" | "chaplain" | "student">(profile?.primaryRole ?? "");
  const [employment, setEmployment] = useState<EmploymentEntry[]>(
    profile?.employment?.length
      ? profile.employment.map((row) => ({
          employerName: row.employerName,
          jobTitle: row.jobTitle ?? "",
          employmentType: row.employmentType ?? "",
        }))
      : [emptyEmployment()]
  );
  const [hearAboutUs, setHearAboutUs] = useState(profile?.hearAboutUs ?? "");
  const [hearAboutUsOther, setHearAboutUsOther] = useState(profile?.hearAboutUsOther ?? "");
  const [careContexts, setCareContexts] = useState<string[]>(profile?.careContexts ?? []);
  const [boardCertified, setBoardCertified] = useState<"" | "yes" | "no">(toYesNo(profile?.boardCertified));
  const [boardCertifiedOrg, setBoardCertifiedOrg] = useState(profile?.boardCertifiedOrg ?? "");
  const [endorsed, setEndorsed] = useState<"" | "yes" | "no">(toYesNo(profile?.endorsed));
  const [endorsedBy, setEndorsedBy] = useState(profile?.endorsedBy ?? "");
  const [orgMemberships, setOrgMemberships] = useState<string[]>(profile?.orgMemberships ?? []);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  function updateEmploymentRow(index: number, patch: Partial<EmploymentEntry>) {
    setEmployment((rows) => rows.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  }

  function addEmploymentRow() {
    setEmployment((rows) => [...rows, emptyEmployment()]);
  }

  function removeEmploymentRow(index: number) {
    setEmployment((rows) => rows.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSaved(false);
    setSubmitting(true);

    const showsDivinityOther = HEAR_ABOUT_OTHER_TRIGGERS.includes(hearAboutUs);

    const profilePayload = {
      preferredPronouns:
        (preferredPronouns === "Something else" ? preferredPronounsOther.trim() : preferredPronouns) || undefined,
      mailingAddress: mailingAddress.trim() || undefined,
      phone: phone.trim() || undefined,
      usesWhatsapp: usesWhatsapp === "" ? undefined : usesWhatsapp === "yes",
      whatsappContactOk:
        usesWhatsapp === "yes" && whatsappContactOk !== "" ? whatsappContactOk === "yes" : undefined,
      religiousTraditions: religiousTraditions.length ? religiousTraditions : undefined,
      religiousTraditionOther: religiousTraditions.includes("Something else")
        ? religiousTraditionOther.trim() || undefined
        : undefined,
      primaryRole: primaryRole || undefined,
      employment: employment
        .filter((row) => row.employerName.trim())
        .map((row) => ({
          employerName: row.employerName.trim(),
          jobTitle: row.jobTitle.trim() || undefined,
          employmentType: row.employmentType || undefined,
        })),
      hearAboutUs: hearAboutUs || undefined,
      hearAboutUsOther: showsDivinityOther ? hearAboutUsOther.trim() || undefined : undefined,
      careContexts: careContexts.length ? careContexts : undefined,
      boardCertified: boardCertified === "" ? undefined : boardCertified === "yes",
      boardCertifiedOrg: boardCertified === "yes" ? boardCertifiedOrg.trim() || undefined : undefined,
      endorsed: endorsed === "" ? undefined : endorsed === "yes",
      endorsedBy: endorsed === "yes" ? endorsedBy.trim() || undefined : undefined,
      orgMemberships: orgMemberships.length ? orgMemberships : undefined,
    };

    const result = await updateMemberProfile(membership.id, {
      name: name.trim() || undefined,
      profile: profilePayload,
    });

    setSubmitting(false);
    if (result.error) {
      setError(result.error);
    } else {
      setSaved(true);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 rounded-xl border border-ink/10 bg-white p-6 sm:p-8"
    >
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
          <input type="email" value={membership.user.email} disabled className={`${inputClass()} bg-sand/20`} />
          <span className="text-xs text-black/50">Contact the member directly to change their email address.</span>
        </label>

        <label className="flex flex-col gap-1">
          <span className={fieldLabelClass()}>Preferred pronouns</span>
          <select
            value={preferredPronouns}
            onChange={(e) => setPreferredPronouns(e.target.value)}
            className={inputClass()}
          >
            <option value="">Select…</option>
            {PREFERRED_PRONOUN_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          {preferredPronouns === "Something else" && (
            <input
              type="text"
              value={preferredPronounsOther}
              onChange={(e) => setPreferredPronounsOther(e.target.value)}
              placeholder="Please specify"
              className={`mt-1 ${inputClass()}`}
            />
          )}
        </label>

        <label className="flex flex-col gap-1">
          <span className={fieldLabelClass()}>Mailing address</span>
          <textarea
            value={mailingAddress}
            onChange={(e) => setMailingAddress(e.target.value)}
            rows={2}
            className={inputClass()}
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className={fieldLabelClass()}>Telephone number</span>
          <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className={inputClass()} />
        </label>

        <div className="flex flex-col gap-1.5">
          <span className={fieldLabelClass()}>Do you use WhatsApp?</span>
          <YesNoRadio
            name="usesWhatsapp"
            value={usesWhatsapp}
            onChange={(v) => {
              setUsesWhatsapp(v);
              if (v === "no") setWhatsappContactOk("");
            }}
          />
        </div>

        {usesWhatsapp === "yes" && (
          <div className="flex flex-col gap-1.5">
            <span className={fieldLabelClass()}>If so, may NAHCA contact you via WhatsApp?</span>
            <YesNoRadio name="whatsappContactOk" value={whatsappContactOk} onChange={setWhatsappContactOk} />
          </div>
        )}
      </Section>

      <Section title="Religious/spiritual tradition">
        <CheckboxGrid
          options={RELIGIOUS_TRADITIONS}
          selected={religiousTraditions}
          onToggle={(value) => setReligiousTraditions((list) => toggleInArray(list, value))}
        />
        {religiousTraditions.includes("Something else") && (
          <input
            type="text"
            value={religiousTraditionOther}
            onChange={(e) => setReligiousTraditionOther(e.target.value)}
            placeholder="Please specify"
            className={inputClass()}
          />
        )}
      </Section>

      <Section title="Primary role in spiritual care">
        <div className="flex flex-col gap-2">
          {PRIMARY_ROLES.map((role) => (
            <label key={role.value} className="flex items-start gap-2 text-sm text-black">
              <input
                type="radio"
                name="primaryRole"
                className="mt-0.5"
                checked={primaryRole === role.value}
                onChange={() => setPrimaryRole(role.value)}
              />
              <span>{role.label}</span>
            </label>
          ))}
        </div>
      </Section>

      <Section title="Places of employment and/or study">
        <div className="flex flex-col gap-4">
          {employment.map((row, i) => (
            <div key={i} className="flex flex-col gap-3 rounded-lg border border-ink/10 p-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="flex flex-col gap-1">
                  <span className={fieldLabelClass()}>Employer Name / Affiliated Organization</span>
                  <input
                    type="text"
                    value={row.employerName}
                    onChange={(e) => updateEmploymentRow(i, { employerName: e.target.value })}
                    className={inputClass()}
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className={fieldLabelClass()}>Job Title</span>
                  <input
                    type="text"
                    value={row.jobTitle}
                    onChange={(e) => updateEmploymentRow(i, { jobTitle: e.target.value })}
                    className={inputClass()}
                  />
                </label>
              </div>
              <label className="flex flex-col gap-1">
                <span className={fieldLabelClass()}>Full Time/Part Time/Volunteer</span>
                <select
                  value={row.employmentType}
                  onChange={(e) =>
                    updateEmploymentRow(i, { employmentType: e.target.value as EmploymentEntry["employmentType"] })
                  }
                  className={inputClass()}
                >
                  <option value="">Select…</option>
                  <option value="full_time">Full Time</option>
                  <option value="part_time">Part Time</option>
                  <option value="volunteer">Volunteer</option>
                </select>
              </label>
              {employment.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeEmploymentRow(i)}
                  className="self-start text-xs font-semibold text-red-600 hover:text-red-700"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={addEmploymentRow}
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
                checked={hearAboutUs === option}
                onChange={() => setHearAboutUs(option)}
              />
              <span>{option}</span>
            </label>
          ))}
        </div>
        {HEAR_ABOUT_OTHER_TRIGGERS.includes(hearAboutUs) && (
          <input
            type="text"
            value={hearAboutUsOther}
            onChange={(e) => setHearAboutUsOther(e.target.value)}
            placeholder="Please specify"
            className={inputClass()}
          />
        )}
      </Section>

      <Section title="Which contexts of spiritual care are you interested in?">
        <CheckboxGrid
          options={CARE_CONTEXTS}
          selected={careContexts}
          onToggle={(value) => setCareContexts((list) => toggleInArray(list, value))}
        />
      </Section>

      <Section title="Board certification">
        <div className="flex flex-col gap-1.5">
          <span className={fieldLabelClass()}>Are you board certified by any organization?</span>
          <YesNoRadio
            name="boardCertified"
            value={boardCertified}
            onChange={(v) => {
              setBoardCertified(v);
              if (v === "no") setBoardCertifiedOrg("");
            }}
          />
        </div>
        {boardCertified === "yes" && (
          <label className="flex flex-col gap-1">
            <span className={fieldLabelClass()}>Which organization</span>
            <input
              type="text"
              value={boardCertifiedOrg}
              onChange={(e) => setBoardCertifiedOrg(e.target.value)}
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
            value={endorsed}
            onChange={(v) => {
              setEndorsed(v);
              if (v === "no") setEndorsedBy("");
            }}
          />
        </div>
        {endorsed === "yes" && (
          <label className="flex flex-col gap-1">
            <span className={fieldLabelClass()}>Who is your endorser?</span>
            <input
              type="text"
              value={endorsedBy}
              onChange={(e) => setEndorsedBy(e.target.value)}
              className={inputClass()}
            />
          </label>
        )}
      </Section>

      <Section title="Professional organization memberships">
        <CheckboxGrid
          options={ORG_MEMBERSHIPS}
          selected={orgMemberships}
          onToggle={(value) => setOrgMemberships((list) => toggleInArray(list, value))}
        />
      </Section>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {saved && !error && <p className="text-sm text-forest">Saved.</p>}

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
