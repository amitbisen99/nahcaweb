"use client";

import { FormEvent, useState } from "react";
import {
  EmploymentEntry,
  HEAR_ABOUT_OPTIONS,
  HEAR_ABOUT_OTHER_TRIGGERS,
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

// Same questionnaire as the membership form, but only through "How did you
// hear about NAHCA?" (client's explicit instruction) — no password (guest
// registration, no account created) and no care-context/board-cert/
// endorsement/org-membership sections.

interface AppliedCoupon {
  code: string;
  discountType: "percent" | "fixed_amount" | "complimentary";
  discountValue: number;
}

function discountedPriceCents(baseCents: number, coupon: AppliedCoupon | null): number {
  if (!coupon) return baseCents;
  if (coupon.discountType === "complimentary") return 0;
  if (coupon.discountType === "fixed_amount") return Math.max(0, baseCents - coupon.discountValue);
  return Math.max(0, Math.round(baseCents * (1 - coupon.discountValue / 100)));
}

export function EventJoinForm({
  eventCode,
  eventTitle,
  basePriceCents,
}: {
  eventCode: string;
  eventTitle: string;
  basePriceCents: number | null;
}) {
  const baseCents = basePriceCents ?? 0;

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const [couponInput, setCouponInput] = useState("");
  const [couponChecking, setCouponChecking] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null);

  function resetCoupon() {
    setCouponInput("");
    setCouponError(null);
    setAppliedCoupon(null);
  }

  function updateEmploymentRow(index: number, patch: Partial<EmploymentEntry>) {
    setEmployment((rows) => rows.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  }

  function addEmploymentRow() {
    setEmployment((rows) => [...rows, emptyEmployment()]);
  }

  function removeEmploymentRow(index: number) {
    setEmployment((rows) => rows.filter((_, i) => i !== index));
  }

  async function applyCoupon() {
    if (!couponInput.trim()) return;
    setCouponChecking(true);
    setCouponError(null);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/coupons/validate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponInput.trim(), eventCode }),
      });
      const data = await res.json();

      if (!res.ok) {
        setAppliedCoupon(null);
        setCouponError(data.error ?? "This coupon code isn't valid.");
        return;
      }

      setAppliedCoupon(data.coupon);
    } catch {
      setAppliedCoupon(null);
      setCouponError("Couldn't check that code right now — please try again.");
    } finally {
      setCouponChecking(false);
    }
  }

  const finalPriceCents = discountedPriceCents(baseCents, appliedCoupon);
  const computedPrice = `$${(finalPriceCents / 100).toFixed(0)}`;

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const name = `${String(formData.get("firstName") ?? "").trim()} ${String(formData.get("lastName") ?? "").trim()}`.trim();

    const showsDivinityOther = HEAR_ABOUT_OTHER_TRIGGERS.includes(hearAboutUs);

    const profile = {
      preferredPronouns:
        (preferredPronouns === "Something else" ? preferredPronounsOther.trim() : preferredPronouns) || undefined,
      mailingAddress: mailingAddress.trim() || undefined,
      phone: phone.trim() || undefined,
      usesWhatsapp: usesWhatsapp === "" ? undefined : usesWhatsapp === "yes",
      whatsappContactOk: usesWhatsapp === "yes" && whatsappContactOk !== "" ? whatsappContactOk === "yes" : undefined,
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
    };

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/event-registrations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventCode,
          name,
          email: formData.get("email"),
          ...(appliedCoupon ? { couponCode: appliedCoupon.code } : {}),
          profile,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error?.message ?? data.error ?? "Something went wrong. Please try again.");
      }

      window.location.href = data.checkoutUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <div className="mt-10 w-full max-w-3xl">
      <p className="text-sm text-black">
        Registering for <span className="font-semibold text-heading">{eventTitle}</span> —{" "}
        {appliedCoupon && <span className="text-black/50 line-through">${(baseCents / 100).toFixed(0)} </span>}
        {computedPrice}
      </p>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4 rounded-xl border border-ink/10 bg-white p-6 sm:p-8">
        <Section title="Basic information" divider={false}>
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

        <Section title="Coupon code (optional)">
          {appliedCoupon ? (
            <div className="flex items-center justify-between rounded-lg border border-forest/30 bg-forest/5 px-3 py-2">
              <span className="text-sm font-medium text-forest">&ldquo;{appliedCoupon.code}&rdquo; applied</span>
              <button type="button" onClick={resetCoupon} className="text-xs font-semibold text-black/60 hover:text-black">
                Remove
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <input
                type="text"
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value)}
                placeholder="Enter code"
                className={`flex-1 uppercase ${inputClass()}`}
              />
              <button
                type="button"
                onClick={applyCoupon}
                disabled={couponChecking || !couponInput.trim()}
                className="rounded-lg border border-ink/20 px-4 py-2 text-sm font-medium text-black transition-colors hover:border-brand disabled:opacity-50"
              >
                {couponChecking ? "Checking…" : "Apply"}
              </button>
            </div>
          )}
          {couponError && <p className="text-xs text-red-600">{couponError}</p>}
        </Section>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="mt-2 rounded-lg bg-brand px-5 py-2.5 font-medium text-white hover:bg-brand-dark disabled:opacity-50"
        >
          {submitting ? "Redirecting to checkout…" : `Continue to Payment — ${computedPrice}`}
        </button>
      </form>
    </div>
  );
}
