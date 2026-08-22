import { Coupon } from "@prisma/client";
import { prisma } from "../prisma";

export type CouponValidationError = { status: number; message: string };

// Shared by every checkout flow that accepts a coupon code (membership,
// event/webinar registration). Returns the coupon row on success, or a
// status/message pair to send straight back as an error response. Never
// increments usedCount — that only happens once the payment actually
// succeeds (see redeemCoupon, called from activatePayment), so an
// abandoned checkout doesn't burn a use.
//
// `context.planType` and `context.eventCode` are mutually exclusive
// checkout contexts, not two independent filters — a coupon scoped to
// "nahca_programmes" (an event/webinar) is never valid for a membership
// purchase and vice versa, since appliesTo's value domain is different for
// each (see the COUPON_SCOPES vs MEMBERSHIP_TYPES distinction in
// routes/coupons.ts).
export async function findValidCoupon(
  code: string,
  context: { planType?: string; eventCode?: string } = {}
): Promise<Coupon | CouponValidationError> {
  const coupon = await prisma.coupon.findUnique({ where: { code: code.trim().toUpperCase() } });

  if (!coupon || !coupon.published) {
    return { status: 404, message: "Invalid coupon code" };
  }

  const now = new Date();
  if (coupon.validFrom && now < coupon.validFrom) {
    return { status: 400, message: "This coupon is not active yet" };
  }
  if (coupon.validTill && now > coupon.validTill) {
    return { status: 400, message: "This coupon has expired" };
  }
  if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) {
    return { status: 400, message: "This coupon has reached its usage limit" };
  }

  const appliesTo = (coupon.appliesTo as string[] | null) ?? [];

  if (context.eventCode) {
    if (!appliesTo.includes("nahca_programmes") || coupon.eventCode !== context.eventCode) {
      return { status: 400, message: "This coupon does not apply to this event" };
    }
  } else if (context.planType && appliesTo.length > 0 && !appliesTo.includes(context.planType)) {
    return { status: 400, message: "This coupon does not apply to the selected plan" };
  }

  return coupon;
}

export function isCouponError(result: Coupon | CouponValidationError): result is CouponValidationError {
  return "status" in result;
}

// Applies the discount to a base price, floored at 0 (a fixed-amount coupon
// larger than the price, or a complimentary coupon, both just zero it out).
export function applyCouponDiscount(baseCents: number, coupon: Coupon): number {
  if (coupon.discountType === "complimentary") return 0;
  if (coupon.discountType === "fixed_amount") return Math.max(0, baseCents - coupon.discountValue);
  if (coupon.discountType === "percent") {
    return Math.max(0, Math.round(baseCents * (1 - coupon.discountValue / 100)));
  }
  return baseCents;
}

// Called once a payment referencing this coupon has actually succeeded.
export async function redeemCoupon(couponId: number) {
  await prisma.coupon.update({ where: { id: couponId }, data: { usedCount: { increment: 1 } } });
}
