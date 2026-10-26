"use client";

import { FormEvent, useState } from "react";
import { ApiMembershipPlan } from "@/lib/api";
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

type PlanType = "regular" | "student" | "institutional" | "conference";
// Conference membership is on pause for now — not selectable on this page,
// even if someone lands here with ?type=conference. Kept in the type union
// since the backend/admin plan data still supports it.
const SELECTABLE_PLAN_TYPES: PlanType[] = ["regular", "student", "institutional"];

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

export function JoinForm({ plans, initialType }: { plans: ApiMembershipPlan[]; initialType?: string }) {
  const defaultType: PlanType = SELECTABLE_PLAN_TYPES.includes(initialType as PlanType)
    ? (initialType as PlanType)
    : "regular";

  const availablePlans = plans.filter((p) => SELECTABLE_PLAN_TYPES.includes(p.type));
  const tierByType = new Map(plans.map((p) => [p.type, p]));
  const institutionalPlan = tierByType.get("institutional");
  const institutionalMinStudents = institutionalPlan?.minStudents ?? 5;
  const institutionalPricePerStudentCents = institutionalPlan?.pricePerStudentCents ?? 0;

  const [selectedType, setSelectedType] = useState<PlanType>(defaultType);
  const [studentCount, setStudentCount] = useState(institutionalMinStudents);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [draft, setDraft] = useState<ProfileDraft>(emptyProfileDraft);
  const [showErrors, setShowErrors] = useState(false);

  function updateDraft(patch: Partial<ProfileDraft>) {
    setDraft((current) => ({ ...current, ...patch }));
  }

  const [couponInput, setCouponInput] = useState("");
  const [couponChecking, setCouponChecking] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null);

  function resetCoupon() {
    setCouponInput("");
    setCouponError(null);
    setAppliedCoupon(null);
  }

  function selectType(type: PlanType) {
    setSelectedType(type);
    resetCoupon();
  }

  async function applyCoupon() {
    if (!couponInput.trim()) return;
    setCouponChecking(true);
    setCouponError(null);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/coupons/validate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponInput.trim(), planType: selectedType }),
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

  if (availablePlans.length === 0) {
    return (
      <p className="mt-10 text-sm text-black">
        Membership plans are temporarily unavailable. Please check back soon.
      </p>
    );
  }

  const selectedPlan = tierByType.get(selectedType) ?? availablePlans[0];
  // Regular/Student are chaplains themselves and get the full questionnaire.
  // Institutional is a billing/admin contact managing a batch of codes for
  // students who'll fill out their own questionnaire when they claim a code
  // (see ClaimForm.tsx) — so the institution's own signup skips it entirely.
  const isInstitutional = selectedType === "institutional";
  const showProfileQuestionnaire = SELECTABLE_PLAN_TYPES.includes(selectedType) && !isInstitutional;

  const basePriceCents = isInstitutional
    ? studentCount * institutionalPricePerStudentCents
    : selectedPlan.priceCents;
  const finalPriceCents = discountedPriceCents(basePriceCents, appliedCoupon);
  const computedPrice = `$${(finalPriceCents / 100).toFixed(0)}`;

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (showProfileQuestionnaire) {
      const problem = validateProfileDraft(draft);
      if (problem) {
        setShowErrors(true);
        setError(problem);
        document.getElementById(POSTAL_CODE_INPUT_ID)?.focus();
        return;
      }
    }

    setSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const name = isInstitutional
      ? String(formData.get("institutionName") ?? "").trim()
      : `${String(formData.get("firstName") ?? "").trim()} ${String(formData.get("lastName") ?? "").trim()}`.trim();
    const contactPersonName = String(formData.get("contactPersonName") ?? "").trim();

    const profile = showProfileQuestionnaire ? profileDraftToPayload(draft) : undefined;

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/memberships/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email: formData.get("email"),
          password: formData.get("password"),
          type: selectedType,
          ...(isInstitutional ? { studentCount, contactPersonName } : {}),
          ...(appliedCoupon ? { couponCode: appliedCoupon.code } : {}),
          ...(profile ? { profile } : {}),
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
      <div className="flex flex-wrap gap-2">
        {availablePlans.map((plan) => (
          <button
            key={plan.type}
            type="button"
            onClick={() => selectType(plan.type)}
            className={`rounded-lg border px-3 py-1.5 text-xs font-medium ${
              selectedType === plan.type ? "border-brand bg-brand text-white" : "border-ink/20 bg-white text-black"
            }`}
          >
            {plan.name}
          </button>
        ))}
      </div>

      <p className="mt-3 text-sm text-black">
        Selected plan: <span className="font-semibold text-heading">{selectedPlan.name}</span> —{" "}
        {appliedCoupon && <span className="text-black/50 line-through">${(basePriceCents / 100).toFixed(0)} </span>}
        {computedPrice}
      </p>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4 rounded-xl border border-ink/10 bg-white p-6 sm:p-8">
        <Section title="Basic information" divider={false}>
          {isInstitutional ? (
            <>
              <label className="flex flex-col gap-1">
                <span className={fieldLabelClass()}>Institution / Organization Name</span>
                <input type="text" name="institutionName" required className={inputClass()} />
              </label>
              <label className="flex flex-col gap-1">
                <span className={fieldLabelClass()}>Contact person name</span>
                <input type="text" name="contactPersonName" required className={inputClass()} />
              </label>
            </>
          ) : (
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
          )}

          {showProfileQuestionnaire && <PronounsField draft={draft} update={updateDraft} />}

          <label className="flex flex-col gap-1">
            <span className={fieldLabelClass()}>
              {isInstitutional ? "Contact email address" : "Email address that you check regularly"}
            </span>
            <input type="email" name="email" required className={inputClass()} />
          </label>

          <label className="flex flex-col gap-1">
            <span className={fieldLabelClass()}>Password</span>
            <input type="password" name="password" required minLength={8} className={inputClass()} />
          </label>

          {showProfileQuestionnaire && <ContactFields draft={draft} update={updateDraft} showErrors={showErrors} />}

          {isInstitutional && (
            <label className="flex flex-col gap-1">
              <span className={fieldLabelClass()}>
                Number of students to sponsor (minimum {institutionalMinStudents})
              </span>
              <input
                type="number"
                min={institutionalMinStudents}
                value={studentCount}
                onChange={(e) =>
                  setStudentCount(Math.max(institutionalMinStudents, Number(e.target.value) || institutionalMinStudents))
                }
                className={inputClass()}
              />
            </label>
          )}
        </Section>

        {showProfileQuestionnaire && <QuestionnaireSections draft={draft} update={updateDraft} />}

        <Section title="Coupon code (optional)">
          {appliedCoupon ? (
            <div className="flex items-center justify-between rounded-lg border border-forest/30 bg-forest/5 px-3 py-2">
              <span className="text-sm font-medium text-forest">&ldquo;{appliedCoupon.code}&rdquo; applied</span>
              <button
                type="button"
                onClick={resetCoupon}
                className="text-xs font-semibold text-black/60 hover:text-black"
              >
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
