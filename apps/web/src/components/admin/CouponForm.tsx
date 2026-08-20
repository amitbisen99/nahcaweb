"use client";

import { FormEvent, useActionState, useState } from "react";
import { AdminCoupon } from "@/lib/adminApi";
import { CouponFormState } from "@/app/admin/coupons/actions";
import { Button } from "@/components/Button";
import { DateField } from "./DateField";

const initialState: CouponFormState = {};

const PLAN_OPTIONS: { value: NonNullable<AdminCoupon["appliesTo"]>[number]; label: string }[] = [
  { value: "regular", label: "Regular Membership" },
  { value: "student", label: "Student Membership" },
  { value: "institutional", label: "Institution-Sponsored Membership" },
  { value: "nahca_programmes", label: "Nahca Programmes (a specific Event/Webinar)" },
];

export function CouponForm({
  coupon,
  action,
}: {
  coupon?: AdminCoupon;
  action: (state: CouponFormState, formData: FormData) => Promise<CouponFormState>;
}) {
  const [state, formAction, isPending] = useActionState(action, initialState);
  const [discountType, setDiscountType] = useState<AdminCoupon["discountType"]>(
    coupon?.discountType ?? "percent"
  );
  const [appliesTo, setAppliesTo] = useState<string[]>(coupon?.appliesTo ?? []);
  const [formError, setFormError] = useState<string | null>(null);
  const isProgramme = appliesTo.includes("nahca_programmes");

  function toggleAppliesTo(value: string, checked: boolean) {
    setAppliesTo((prev) => (checked ? [...prev, value] : prev.filter((v) => v !== value)));
  }

  // The server action throws a plain Error on failure, which a plain
  // <form action={...}> has no way to display — same issue the login form
  // had. Validating here instead means these two required-field mistakes
  // never actually reach the server action in normal use.
  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    setFormError(null);
    if (appliesTo.length === 0) {
      e.preventDefault();
      setFormError('Select at least one option for "Applied to which plan".');
      return;
    }
    if (isProgramme) {
      const eventCode = new FormData(e.currentTarget).get("eventCode");
      if (!String(eventCode ?? "").trim()) {
        e.preventDefault();
        setFormError("Enter the event code this coupon applies to.");
      }
    }
  }

  return (
    <form action={formAction} onSubmit={handleSubmit} className="flex flex-col gap-5">
      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium text-black">Coupon name</span>
        <input
          type="text"
          name="name"
          required
          defaultValue={coupon?.name}
          placeholder="Spring conference discount"
          className="rounded-lg border border-ink/20 bg-white px-3 py-2 focus:border-brand focus:outline-none"
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium text-black">Coupon code</span>
        <input
          type="text"
          name="code"
          required
          defaultValue={coupon?.code}
          placeholder="SPRING25"
          className="rounded-lg border border-ink/20 bg-white px-3 py-2 uppercase focus:border-brand focus:outline-none"
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium text-black">Discount type</span>
        <select
          name="discountType"
          required
          value={discountType}
          onChange={(e) => setDiscountType(e.target.value as AdminCoupon["discountType"])}
          className="rounded-lg border border-ink/20 bg-white px-3 py-2 focus:border-brand focus:outline-none"
        >
          <option value="percent">Percentage off</option>
          <option value="fixed_amount">Fixed amount off</option>
          <option value="complimentary">Complimentary (free)</option>
        </select>
      </label>

      {discountType !== "complimentary" && (
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium text-black">
            {discountType === "percent" ? "Discount percentage (0-100)" : "Discount amount (USD)"}
          </span>
          <input
            type="number"
            name="discountValue"
            min={0}
            max={discountType === "percent" ? 100 : undefined}
            step={discountType === "percent" ? 1 : 0.01}
            required
            defaultValue={
              coupon
                ? discountType === "percent"
                  ? coupon.discountValue
                  : (coupon.discountValue / 100).toFixed(2)
                : undefined
            }
            className="rounded-lg border border-ink/20 bg-white px-3 py-2 focus:border-brand focus:outline-none"
          />
        </label>
      )}

      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium text-black">Applied to which plan</span>
        <span className="text-xs text-black/50">Select at least one.</span>
        <div className="mt-1 flex flex-col gap-2">
          {PLAN_OPTIONS.map((opt) => (
            <label key={opt.value} className="flex items-center gap-2 text-sm text-black">
              <input
                type="checkbox"
                name="appliesTo"
                value={opt.value}
                checked={appliesTo.includes(opt.value)}
                onChange={(e) => toggleAppliesTo(opt.value, e.target.checked)}
              />
              {opt.label}
            </label>
          ))}
        </div>

        {isProgramme && (
          <label className="mt-2 flex flex-col gap-1">
            <span className="text-sm font-medium text-black">Event code</span>
            <input
              type="text"
              name="eventCode"
              required
              defaultValue={coupon?.eventCode ?? ""}
              placeholder="EVT-A1B2C3"
              className="rounded-lg border border-ink/20 bg-white px-3 py-2 uppercase focus:border-brand focus:outline-none"
            />
            <span className="text-xs text-black/50">
              Find this on the event or webinar&rsquo;s own page in Website Content.
            </span>
          </label>
        )}
      </div>

      {(formError ?? state.error) && <p className="text-sm text-red-600">{formError ?? state.error}</p>}

      <div className="grid gap-5 sm:grid-cols-2">
        <DateField name="validFrom" label="Valid from" currentValue={coupon?.validFrom ?? null} />
        <DateField name="validTill" label="Valid till" currentValue={coupon?.validTill ?? null} />
      </div>

      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium text-black">No. of coupons (leave blank for unlimited)</span>
        <input
          type="number"
          name="maxUses"
          min={1}
          defaultValue={coupon?.maxUses ?? undefined}
          className="rounded-lg border border-ink/20 bg-white px-3 py-2 focus:border-brand focus:outline-none"
        />
      </label>

      {coupon && (
        <p className="text-xs text-black/50">Used {coupon.usedCount} time{coupon.usedCount === 1 ? "" : "s"} so far.</p>
      )}

      <label className="flex items-center gap-2 text-sm font-medium text-black">
        <input type="checkbox" name="published" defaultChecked={coupon?.published ?? false} />
        Published (active — code can be redeemed)
      </label>

      <Button type="submit" className="mt-2 self-start" disabled={isPending}>
        {isPending ? "Saving…" : "Save"}
      </Button>
    </form>
  );
}
