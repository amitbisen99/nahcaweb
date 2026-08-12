"use client";

import Link from "next/link";
import { ReactNode, SVGProps, useMemo } from "react";
import { ApiMembershipPlan } from "@/lib/api";
import { RevealGroup, RevealItem } from "@/components/Reveal";

// The Conference plan will be featured on its own page later — keep all of
// its data and admin editing intact, just hide the promo card here.
const SHOW_CONFERENCE_PLAN = false;

interface Tier {
  type: "regular" | "student" | "institutional" | "conference";
  name: string;
  price: string;
  term: string;
  note: string;
  benefits: string[];
  tooltip: string | null;
  highlight?: boolean;
}

function ChevronIcon(props: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={props.className}>
      <path d="M8 5l8 7-8 7z" />
    </svg>
  );
}

function InfoIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} {...props}>
      <circle cx="12" cy="12" r="9" />
      <path strokeLinecap="round" d="M12 11v5.5" />
      <circle cx="12" cy="7.75" r="0.75" fill="currentColor" stroke="none" />
    </svg>
  );
}

function PlanTooltip({ text }: { text: string }) {
  return (
    <span className="group/tip absolute right-4 top-4 z-10 inline-block">
      <button
        type="button"
        aria-label="Plan information"
        className="flex h-8 w-8 items-center justify-center rounded-full bg-forest text-white shadow-md transition-colors hover:text-black"
      >
        <InfoIcon className="h-4 w-4" />
      </button>
      <span className="pointer-events-none absolute right-0 top-9 w-56 rounded-lg bg-navy p-3 text-xs leading-relaxed text-white opacity-0 shadow-lg transition-opacity duration-200 group-hover/tip:opacity-100 group-focus-within/tip:opacity-100">
        {text}
      </span>
    </span>
  );
}

function ChevronList({ items }: { items: ReactNode[] }) {
  return (
    <ul className="flex flex-col gap-2.5">
      {items.map((item, i) => (
        <li key={i} className="flex gap-2 text-sm leading-relaxed text-black">
          <ChevronIcon className="mt-0.5 h-3.5 w-3.5 flex-none text-brand" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function planToTier(plan: ApiMembershipPlan): Tier {
  const price =
    plan.type === "institutional"
      ? `$${((plan.pricePerStudentCents ?? 0) / 100).toFixed(0)}`
      : `$${(plan.priceCents / 100).toFixed(0)}`;

  return {
    type: plan.type,
    name: plan.name,
    price,
    term: plan.term,
    note: plan.note,
    benefits: plan.benefits.split("\n").filter(Boolean),
    tooltip: plan.tooltip,
    highlight: plan.type === "student",
  };
}

export function MembershipSignup({ plans }: { plans: ApiMembershipPlan[] }) {
  const tiers = useMemo(() => plans.map(planToTier), [plans]);
  const mainTiers = tiers.filter((t) => t.type !== "conference");
  const conferenceTier = tiers.find((t) => t.type === "conference");

  if (tiers.length === 0) {
    return (
      <p className="mt-14 text-sm text-black">
        Membership plans are temporarily unavailable. Please check back soon.
      </p>
    );
  }

  return (
    <>
      <RevealGroup className="mt-14 grid gap-6 lg:grid-cols-3">
        {mainTiers.map((tier) => (
          <RevealItem
            key={tier.type}
            className={`relative flex flex-col rounded-xl border p-7 ${
              tier.highlight ? "border-brand bg-white shadow-lg" : "border-ink/10 bg-white"
            }`}
          >
            {tier.tooltip && <PlanTooltip text={tier.tooltip} />}
            <h2 className="font-heading text-lg font-medium text-heading">{tier.name}</h2>
            <div className="mt-3 flex items-baseline gap-1.5">
              <span className="font-heading text-3xl font-bold text-ink">{tier.price}</span>
              <span className="text-sm text-black">{tier.term}</span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-black">{tier.note}</p>
            <div className="mt-5">
              <ChevronList items={tier.benefits} />
            </div>
            <div className="mt-auto pt-6">
              <Link
                href={`/membership/join?type=${tier.type}`}
                className="inline-flex w-full items-center justify-center rounded-lg bg-brand px-6 py-3 font-body text-sm font-semibold text-white transition-colors duration-200 hover:bg-brand-dark"
              >
                Join Now
              </Link>
            </div>
          </RevealItem>
        ))}
      </RevealGroup>

      {SHOW_CONFERENCE_PLAN && conferenceTier && (
        <div className="mt-16">
          <div className="relative rounded-xl border border-ink/10 bg-white p-7 lg:flex lg:items-center lg:justify-between lg:gap-10">
            {conferenceTier.tooltip && <PlanTooltip text={conferenceTier.tooltip} />}
            <div className="lg:max-w-md">
              <h2 className="font-heading text-lg font-medium text-heading">{conferenceTier.name}</h2>
              <div className="mt-3 flex items-baseline gap-1.5">
                <span className="font-heading text-3xl font-bold text-ink">{conferenceTier.price}</span>
                <span className="text-sm text-black">{conferenceTier.term}</span>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-black">{conferenceTier.note}</p>
            </div>
            <div className="mt-6 lg:mt-0 lg:max-w-sm lg:flex-none">
              <ChevronList items={conferenceTier.benefits} />
              <Link
                href="/membership/join?type=conference"
                className="mt-5 inline-flex w-full items-center justify-center rounded-lg bg-brand px-6 py-3 font-body text-sm font-semibold text-white transition-colors duration-200 hover:bg-brand-dark lg:w-auto"
              >
                Join Now
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
