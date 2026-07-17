import { ReactNode, SVGProps } from "react";
import { Container } from "@/components/Container";
import { Button } from "@/components/Button";

const MEMBERSHIP_PAYMENT_URL = "https://www.hinduchaplains.com/membership.html";

function DiamondIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 2l5 10-5 10-5-10z" />
    </svg>
  );
}

function ChevronIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M8 5l8 7-8 7z" />
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

const REGULAR_BENEFITS = [
  "Opportunities for professional development, mentoring & networking",
  "NAHCA webinar and conference fee discounts",
  "Opportunities to co-sponsor programming",
  "Access to specialized resources on Hindu spiritual care",
  "Support in pursuing professional credentialing",
];

interface MembershipTier {
  name: string;
  price: string;
  term: string;
  note: string;
  benefits: string[];
  highlight?: boolean;
}

const TIERS: MembershipTier[] = [
  {
    name: "Regular Membership",
    price: "$75",
    term: "per year",
    note: "Valid for 1 year from the date you join, with an automatic renewal option available when you sign up.",
    benefits: REGULAR_BENEFITS,
  },
  {
    name: "Student Membership",
    price: "$75",
    term: "per 2 years",
    note: "Discounted 50% since it's valid for 2 years. Students receive all the benefits of a regular membership.",
    benefits: REGULAR_BENEFITS,
    highlight: true,
  },
  {
    name: "Institution-Sponsored Student Membership",
    price: "$60",
    term: "per membership",
    note: "80% of the already-discounted student fee. Requires a minimum of 5 student memberships and applies to the membership fee only. Sponsored students gain a two-year student membership with the associated benefits.",
    benefits: REGULAR_BENEFITS,
  },
];

export default function MembershipPage() {
  return (
    <>
      <section className="bg-white py-20">
        <Container>
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 font-heading text-xs font-semibold uppercase tracking-widest text-brand">
              <DiamondIcon className="h-3 w-3" />
              Join Us
            </span>
            <h1 className="mt-3 font-heading text-4xl font-bold text-heading">
              Become a NAHCA Member
            </h1>
            <p className="mt-4 text-ink/70">Are you:</p>
            <ChevronList
              items={[
                "Currently working as a spiritual care provider",
                "Considering work as a spiritual care provider",
                "A hiring manager or supervisor for spiritual care providers",
                "In support of diversifying professional spiritual caregiving",
              ]}
            />
            <p className="mt-4 text-ink/70">
              ...and eager to learn about spiritual care from a Hindu lens? Then join us!
            </p>

            <div className="mt-8 rounded-xl border border-ink/10 bg-sand/40 p-6">
              <p className="text-ink/75">
                Hello! I am Bindu, your Membership Chair, and would like to share some benefits
                of becoming a member of NAHCA.
              </p>
            </div>
          </div>

          <div className="mt-14 grid gap-6 lg:grid-cols-3">
            {TIERS.map((tier) => (
              <div
                key={tier.name}
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
                  <Button
                    href={MEMBERSHIP_PAYMENT_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full"
                  >
                    Join Now
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-14 max-w-2xl border-t border-ink/10 pt-10">
            <h2 className="font-heading text-2xl font-medium text-heading">Good to Know</h2>
            <ChevronList
              items={[
                "Regular memberships are valid for a year from the date you join",
                "Automatic renewal option is available when you sign up",
                <>
                  Institutions interested in sponsoring student memberships should contact{" "}
                  <a
                    href="mailto:NAHCA108@gmail.com"
                    className="font-semibold text-heading hover:text-heading/70"
                  >
                    NAHCA108@gmail.com
                  </a>{" "}
                  for payment and registration instructions.
                </>,
                <>
                  Questions? Email Bindu at{" "}
                  <a
                    href="mailto:NAHCA108@gmail.com"
                    className="font-semibold text-heading hover:text-heading/70"
                  >
                    NAHCA108@gmail.com
                  </a>{" "}
                  with the header &ldquo;Membership payment&rdquo;.
                </>,
              ]}
            />
          </div>
        </Container>
      </section>
    </>
  );
}
