"use client";

import { useTransition } from "react";
import Link from "next/link";
import { deleteCoupon } from "@/app/admin/coupons/actions";
import { PencilIcon, TrashIcon } from "./icons";

export function CouponRowActions({ id, name }: { id: number; name: string }) {
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    if (!confirm(`Delete the coupon "${name}"? This can't be undone.`)) return;
    startTransition(() => {
      deleteCoupon(String(id));
    });
  }

  return (
    <div className="flex items-center gap-3">
      <Link
        href={`/admin/coupons/${id}`}
        aria-label="Edit"
        title="Edit"
        className="text-black transition-colors hover:text-brand"
      >
        <PencilIcon className="h-[18px] w-[18px]" />
      </Link>
      <button
        type="button"
        onClick={handleDelete}
        disabled={isPending}
        aria-label="Delete"
        title="Delete"
        className="text-black transition-colors hover:text-red-600 disabled:opacity-50"
      >
        <TrashIcon className="h-[18px] w-[18px]" />
      </button>
    </div>
  );
}
