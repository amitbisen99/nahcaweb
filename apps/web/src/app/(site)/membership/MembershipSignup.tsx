"use client";

import { FormEvent, ReactNode, SVGProps, useState } from "react";

interface Tier {
  type: "regular" | "student" | "institutional" | "conference";
  name: string;
  price: string;
  term: string;
  note: string;
  benefits: string[];
  highlight?: boolean;
}

const REGULAR_BENEFITS = [
  "Opportunities for professional development, mentoring & networking",
  "NAHCA webinar and conference fee discounts",
  "Opportunities to co-sponsor programming",
  "Access to specialized resources on Hindu spiritual care",
  "Support in pursuing professional credentialing",
];

const TIERS: Tier[] = [
  {
    type: "regular",
    name: "Regular Membership",
    price: "$75",
    term: "per year",
    note: "Valid for 1 year from the date you join, with an automatic renewal option available when you sign up.",
    benefits: REGULAR_BENEFITS,
  },
  {
    type: "student",
    name: "Student Membership",
    price: "$75",
    term: "per 2 years",
    note: "Discounted 50% since it's valid for 2 years. Students receive all the benefits of a regular membership.",
    benefits: REGULAR_BENEFITS,
    highlight: true,
  },
  {
    type: "institutional",
    name: "Institution-Sponsored Student Membership",
    price: "$60",
    term: "per student (min. 5)",
    note: "80% of the already-discounted student fee. Requires a minimum of 5 student memberships and applies to the membership fee only. Sponsored students gain a two-year student membership with the associated benefits.",
    benefits: REGULAR_BENEFITS,
  },
  {
    type: "conference",
    name: "Conference Membership",
    price: "$75",
    term: "per year",
    note: "A plan focused on attending NAHCA's conference programming throughout the year.",
    benefits: REGULAR_BENEFITS,
  },
];

const MAIN_TIERS = TIERS.filter((t) => t.type !== "conference");
const CONFERENCE_TIER = TIERS.find((t) => t.type === "conference")!;

const INSTITUTIONAL_MIN_STUDENTS = 5;
const INSTITUTIONAL_PRICE_PER_STUDENT = 60;

function ChevronIcon(props: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={props.className}>
      <path d="M8 5l8 7-8 7z" />
    </svg>
  );
}

function XIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

function ChevronList({ items }: { items: ReactNode[] }) {
  return (
    <ul className="flex flex-col gap-2.5">
      {items.map((item, i) => (
        <li key={i} className="flex gap-2 text-sm leading-relaxed text-ink/75">
          <ChevronIcon className="mt-0.5 h-3.5 w-3.5 flex-none text-brand" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export function MembershipSignup() {
  const [selectedType, setSelectedType] = useState<Tier["type"]>("regular");
  const [studentCount, setStudentCount] = useState(INSTITUTIONAL_MIN_STUDENTS);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function openModal(type: Tier["type"]) {
    setSelectedType(type);
    setError(null);
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const formData = new FormData(e.currentTarget);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/memberships/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.get("name"),
          email: formData.get("email"),
          password: formData.get("password"),
          type: selectedType,
          ...(selectedType === "institutional" ? { studentCount } : {}),
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

  const selectedTier = TIERS.find((t) => t.type === selectedType)!;
  const computedPrice =
    selectedType === "institutional"
      ? `$${studentCount * INSTITUTIONAL_PRICE_PER_STUDENT}`
      : selectedTier.price;

  return (
    <>
      <div className="mt-14 grid gap-6 lg:grid-cols-3">
        {MAIN_TIERS.map((tier) => (
          <div
            key={tier.type}
            className={`flex flex-col rounded-xl border p-7 ${
              tier.highlight ? "border-brand bg-white shadow-lg" : "border-ink/10 bg-white"
            }`}
          >
            <h2 className="font-heading text-lg font-medium text-heading">{tier.name}</h2>
            <div className="mt-3 flex items-baseline gap-1.5">
              <span className="font-heading text-3xl font-bold text-ink">{tier.price}</span>
              <span className="text-sm text-ink/60">{tier.term}</span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-ink/70">{tier.note}</p>
            <div className="mt-5">
              <ChevronList items={tier.benefits} />
            </div>
            <div className="mt-auto pt-6">
              <button
                type="button"
                onClick={() => openModal(tier.type)}
                className="inline-flex w-full items-center justify-center rounded-lg bg-brand px-6 py-3 font-body text-sm font-semibold text-white transition-colors duration-200 hover:bg-brand-dark"
              >
                Join Now
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-16 border-t border-ink/10 pt-10">
        <div className="rounded-xl border border-ink/10 bg-white p-7 lg:flex lg:items-center lg:justify-between lg:gap-10">
          <div className="lg:max-w-md">
            <h2 className="font-heading text-lg font-medium text-heading">{CONFERENCE_TIER.name}</h2>
            <div className="mt-3 flex items-baseline gap-1.5">
              <span className="font-heading text-3xl font-bold text-ink">{CONFERENCE_TIER.price}</span>
              <span className="text-sm text-ink/60">{CONFERENCE_TIER.term}</span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-ink/70">{CONFERENCE_TIER.note}</p>
          </div>
          <div className="mt-6 lg:mt-0 lg:max-w-sm lg:flex-none">
            <ChevronList items={CONFERENCE_TIER.benefits} />
            <button
              type="button"
              onClick={() => openModal("conference")}
              className="mt-5 inline-flex w-full items-center justify-center rounded-lg bg-brand px-6 py-3 font-body text-sm font-semibold text-white transition-colors duration-200 hover:bg-brand-dark lg:w-auto"
            >
              Join Now
            </button>
          </div>
        </div>
      </div>

      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4"
          onClick={closeModal}
        >
          <div
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="font-heading text-2xl font-medium text-heading">Join NAHCA</h2>
                <p className="mt-1 text-sm text-ink/60">
                  Selected plan: <span className="font-semibold text-heading">{selectedTier.name}</span> —{" "}
                  {computedPrice}
                </p>
              </div>
              <button
                type="button"
                onClick={closeModal}
                aria-label="Close"
                className="flex-none text-ink/40 hover:text-ink"
              >
                <XIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {TIERS.map((tier) => (
                <button
                  key={tier.type}
                  type="button"
                  onClick={() => setSelectedType(tier.type)}
                  className={`rounded-lg border px-3 py-1.5 text-xs font-medium ${
                    selectedType === tier.type
                      ? "border-brand bg-brand text-white"
                      : "border-ink/20 bg-white text-ink/70"
                  }`}
                >
                  {tier.name}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
              <label className="flex flex-col gap-1">
                <span className="text-sm font-medium text-ink/80">Name</span>
                <input
                  type="text"
                  name="name"
                  required
                  className="rounded-lg border border-ink/20 bg-white px-3 py-2 focus:border-brand focus:outline-none"
                />
              </label>

              <label className="flex flex-col gap-1">
                <span className="text-sm font-medium text-ink/80">Email</span>
                <input
                  type="email"
                  name="email"
                  required
                  className="rounded-lg border border-ink/20 bg-white px-3 py-2 focus:border-brand focus:outline-none"
                />
              </label>

              <label className="flex flex-col gap-1">
                <span className="text-sm font-medium text-ink/80">Password</span>
                <input
                  type="password"
                  name="password"
                  required
                  minLength={8}
                  className="rounded-lg border border-ink/20 bg-white px-3 py-2 focus:border-brand focus:outline-none"
                />
              </label>

              {selectedType === "institutional" && (
                <label className="flex flex-col gap-1">
                  <span className="text-sm font-medium text-ink/80">
                    Number of students to sponsor (minimum {INSTITUTIONAL_MIN_STUDENTS})
                  </span>
                  <input
                    type="number"
                    min={INSTITUTIONAL_MIN_STUDENTS}
                    value={studentCount}
                    onChange={(e) =>
                      setStudentCount(
                        Math.max(INSTITUTIONAL_MIN_STUDENTS, Number(e.target.value) || INSTITUTIONAL_MIN_STUDENTS)
                      )
                    }
                    className="rounded-lg border border-ink/20 bg-white px-3 py-2 focus:border-brand focus:outline-none"
                  />
                </label>
              )}

              {error && <p className="text-sm text-red-600">{error}</p>}

              <button
                type="submit"
                disabled={submitting}
                className="rounded-lg bg-brand px-5 py-2.5 font-medium text-white hover:bg-brand-dark disabled:opacity-50"
              >
                {submitting ? "Redirecting to checkout…" : `Continue to Payment — ${computedPrice}`}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
