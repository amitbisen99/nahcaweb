import { notFound } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { getContentItem } from "@/lib/adminApi";
import type { AdminCoupon } from "@/lib/adminApi";
import { CouponForm } from "@/components/admin/CouponForm";
import { updateCoupon } from "../actions";

export default async function EditCouponPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const session = await auth();
  const coupon = (await getContentItem("coupons", id, session?.apiToken ?? "")) as unknown as AdminCoupon | null;
  if (!coupon) notFound();

  return (
    <div className="max-w-2xl">
      <Link href="/admin/coupons" className="text-sm font-semibold text-brand hover:text-brand-dark">
        ← Coupons
      </Link>
      <h1 className="mt-1 font-heading text-3xl font-medium text-heading">Edit {coupon.name}</h1>

      <div className="mt-8">
        <CouponForm coupon={coupon} action={updateCoupon.bind(null, id)} />
      </div>
    </div>
  );
}
