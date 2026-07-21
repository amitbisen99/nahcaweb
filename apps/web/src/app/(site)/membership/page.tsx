import { ReactNode, SVGProps } from "react";
import { Container } from "@/components/Container";
import { getMembershipPlans } from "@/lib/api";
import { MembershipSignup } from "./MembershipSignup";

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

export default async function MembershipPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const plans = await getMembershipPlans();

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

            {status === "success" && (
              <p className="mt-4 rounded-lg bg-green-100 px-4 py-3 text-sm text-green-800">
                Welcome to NAHCA! Your membership is active — check your email for a confirmation,
                and visit the Member Portal to see your membership status.
              </p>
            )}
            {status === "cancelled" && (
              <p className="mt-4 rounded-lg bg-yellow-100 px-4 py-3 text-sm text-yellow-800">
                Checkout was cancelled — no charge was made.
              </p>
            )}

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

          <MembershipSignup plans={plans} />

          <div className="mt-16 max-w-2xl border-t border-ink/10 pt-10">
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
