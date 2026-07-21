"use client";

import { useState } from "react";
import Link from "next/link";
import { AdminMembershipPlan } from "@/lib/adminApi";
import { EyeIcon, PencilIcon, XIcon } from "./icons";

export function MembershipPlanRowActions({ plan }: { plan: AdminMembershipPlan }) {
  const [viewing, setViewing] = useState(false);
  const benefitsList = plan.benefits.split("\n").filter(Boolean);
  const priceDisplay =
    plan.type === "institutional"
      ? `$${((plan.pricePerStudentCents ?? 0) / 100).toFixed(2)} ${plan.term}`
      : `$${(plan.priceCents / 100).toFixed(2)} ${plan.term}`;

  return (
    <>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setViewing(true)}
          aria-label="View"
          title="View"
          className="text-ink/50 transition-colors hover:text-brand"
        >
          <EyeIcon className="h-[18px] w-[18px]" />
        </button>
        <Link
          href={`/admin/membership-plans/${plan.type}`}
          aria-label="Edit"
          title="Edit"
          className="text-ink/50 transition-colors hover:text-brand"
        >
          <PencilIcon className="h-[18px] w-[18px]" />
        </Link>
      </div>

      {viewing && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4"
          onClick={() => setViewing(false)}
        >
          <div
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <h2 className="font-heading text-2xl font-medium text-heading">{plan.name}</h2>
              <button
                type="button"
                onClick={() => setViewing(false)}
                aria-label="Close"
                className="flex-none text-ink/40 hover:text-ink"
              >
                <XIcon className="h-6 w-6" />
              </button>
            </div>

            <p className="mt-2 text-sm font-semibold text-ink/70">{priceDisplay}</p>

            <dl className="mt-6 flex flex-col gap-5">
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-ink/50">Description</dt>
                <dd className="mt-1.5 text-base leading-relaxed text-ink/80">{plan.note}</dd>
              </div>

              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-ink/50">Benefits</dt>
                <dd className="mt-1.5">
                  <ul className="flex flex-col gap-1.5 text-base leading-relaxed text-ink/80">
                    {benefitsList.map((b, i) => (
                      <li key={i}>• {b}</li>
                    ))}
                  </ul>
                </dd>
              </div>

              {plan.type === "institutional" && (
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-ink/50">Minimum Students</dt>
                  <dd className="mt-1.5 text-base text-ink/80">{plan.minStudents}</dd>
                </div>
              )}
            </dl>

            <div className="mt-8 flex items-center gap-3 border-t border-ink/10 pt-6">
              <Link
                href={`/admin/membership-plans/${plan.type}`}
                className="ml-auto text-sm font-semibold text-brand hover:text-brand-dark"
              >
                Edit →
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
