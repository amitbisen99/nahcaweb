"use client";

import { useState } from "react";
import { AdminCoupon } from "@/lib/adminApi";
import { Button } from "@/components/Button";

const PLAN_OPTIONS: { value: NonNullable<AdminCoupon["appliesTo"]>[number]; label: string }[] = [
  { value: "regular", label: "Regular Membership" },
  { value: "student", label: "Student Membership" },
  { value: "institutional", label: "Institution-Sponsored Membership" },
  { value: "conference", label: "Conference Membership" },
];

function dateInputValue(value: string | null): string {
  if (!value) return "";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? "" : d.toISOString().slice(0, 10);
}

export function CouponForm({
  coupon,
  action,
}: {
  coupon?: AdminCoupon;
  action: (formData: FormData) => Promise<void>;
}) {
  const [discountType, setDiscountType] = useState<AdminCoupon["discountType"]>(
    coupon?.discountType ?? "percent"
  );

  return (
    <form action={action} className="flex flex-col gap-5">
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
        <span className="text-xs text-black/50">Leave all unchecked to apply to every plan.</span>
        <div className="mt-1 flex flex-col gap-2">
          {PLAN_OPTIONS.map((opt) => (
            <label key={opt.value} className="flex items-center gap-2 text-sm text-black">
              <input
                type="checkbox"
                name="appliesTo"
                value={opt.value}
                defaultChecked={coupon?.appliesTo?.includes(opt.value)}
              />
              {opt.label}
            </label>
          ))}
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium text-black">Valid from</span>
          <input
            type="date"
            name="validFrom"
            defaultValue={dateInputValue(coupon?.validFrom ?? null)}
            className="rounded-lg border border-ink/20 bg-white px-3 py-2 focus:border-brand focus:outline-none"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium text-black">Valid till</span>
          <input
            type="date"
            name="validTill"
            defaultValue={dateInputValue(coupon?.validTill ?? null)}
            className="rounded-lg border border-ink/20 bg-white px-3 py-2 focus:border-brand focus:outline-none"
          />
        </label>
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

      <Button type="submit" className="mt-2 self-start">
        Save
      </Button>
    </form>
  );
}
