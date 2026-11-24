"use client";

import { FormEvent, useState } from "react";
import {
  HEAR_ABOUT_OPTIONS,
  HEAR_ABOUT_OTHER_TRIGGERS,
  PREFERRED_PRONOUN_OPTIONS,
  PRIMARY_ROLES,
} from "@/lib/memberProfileFields";
import { Section, fieldLabelClass, inputClass } from "@/components/MemberProfileFormFields";

// Guest registration (no account is created), so it's a short form: name,
// pronouns, email, primary role, how they heard about NAHCA, and a coupon.

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
  const [primaryRole, setPrimaryRole] = useState<"" | "chaplain" | "student">("");
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
      primaryRole: primaryRole || undefined,
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
            <span className={fieldLabelClass()}>Pronouns</span>
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

        </Section>

        <Section title="Primary Role in Spiritual Care">
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

        <Section title="Coupon Code">
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
