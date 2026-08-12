import Link from "next/link";
import { CouponForm } from "@/components/admin/CouponForm";
import { createCoupon } from "../actions";

export default function NewCouponPage() {
  return (
    <div className="max-w-2xl">
      <Link href="/admin/coupons" className="text-sm font-semibold text-brand hover:text-brand-dark">
        ← Coupons
      </Link>
      <h1 className="mt-1 font-heading text-3xl font-medium text-heading">New Coupon</h1>

      <div className="mt-8">
        <CouponForm action={createCoupon} />
      </div>
    </div>
  );
}
