"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import {
  CARE_CONTEXTS,
  EmploymentEntry,
  HEAR_ABOUT_OPTIONS,
  HEAR_ABOUT_OTHER_TRIGGERS,
  ORG_MEMBERSHIPS,
  PREFERRED_PRONOUN_OPTIONS,
  PRIMARY_ROLES,
  RELIGIOUS_TRADITIONS,
  emptyEmployment,
} from "@/lib/memberProfileFields";
import {
  CheckboxGrid,
  Section,
  YesNoRadio,
  fieldLabelClass,
  inputClass,
  toggleInArray,
} from "@/components/MemberProfileFormFields";

export function ClaimForm({ initialCode }: { initialCode?: string }) {
  const [code, setCode] = useState(initialCode ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [preferredPronouns, setPreferredPronouns] = useState("");
  const [preferredPronounsOther, setPreferredPronounsOther] = useState("");
  const [mailingAddress, setMailingAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [usesWhatsapp, setUsesWhatsapp] = useState<"" | "yes" | "no">("");
  const [whatsappContactOk, setWhatsappContactOk] = useState<"" | "yes" | "no">("");
  const [religiousTraditions, setReligiousTraditions] = useState<string[]>([]);
  const [religiousTraditionOther, setReligiousTraditionOther] = useState("");
  const [primaryRole, setPrimaryRole] = useState<"" | "chaplain" | "student">("");
  const [employment, setEmployment] = useState<EmploymentEntry[]>([emptyEmployment()]);
  const [hearAboutUs, setHearAboutUs] = useState("");
  const [hearAboutUsOther, setHearAboutUsOther] = useState("");
  const [careContexts, setCareContexts] = useState<string[]>([]);
  const [boardCertified, setBoardCertified] = useState<"" | "yes" | "no">("");
  const [boardCertifiedOrg, setBoardCertifiedOrg] = useState("");
  const [endorsed, setEndorsed] = useState<"" | "yes" | "no">("");
  const [endorsedBy, setEndorsedBy] = useState("");
  const [orgMemberships, setOrgMemberships] = useState<string[]>([]);
  const [orgMembershipOther, setOrgMembershipOther] = useState("");

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
    setSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const firstName = String(formData.get("firstName") ?? "").trim();
    const lastName = String(formData.get("lastName") ?? "").trim();
    const name = `${firstName} ${lastName}`.trim();

    const showsDivinityOther = HEAR_ABOUT_OTHER_TRIGGERS.includes(hearAboutUs);

    const profile = {
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
      orgMembershipOther: orgMemberships.includes("Other") ? orgMembershipOther.trim() || undefined : undefined,
    };

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/institutions/claim`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          name,
          email: formData.get("email"),
          password: formData.get("password"),
          profile,
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
            <span className={fieldLabelClass()}>Email address that you check regularly</span>
            <input type="email" name="email" required className={inputClass()} />
          </label>

          <label className="flex flex-col gap-1">
            <span className={fieldLabelClass()}>Password</span>
            <input type="password" name="password" required minLength={8} className={inputClass()} />
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
          {orgMemberships.includes("Other") && (
            <input
              type="text"
              value={orgMembershipOther}
              onChange={(e) => setOrgMembershipOther(e.target.value)}
              placeholder="Please specify"
              className={inputClass()}
            />
          )}
        </Section>

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
