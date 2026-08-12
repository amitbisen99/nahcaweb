import Link from "next/link";
import { Container } from "@/components/Container";
import { getMembershipPlans } from "@/lib/api";
import { JoinForm } from "./JoinForm";

export default async function MembershipJoinPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const { type } = await searchParams;
  const plans = await getMembershipPlans();

  if (plans.length === 0) {
    return (
      <section className="bg-white py-20">
        <Container>
          <p className="text-sm text-black">
            Membership plans are temporarily unavailable. Please check back soon.
          </p>
        </Container>
      </section>
    );
  }

  return (
    <section className="bg-white py-16">
      <Container>
        <Link href="/membership" className="text-sm font-medium text-brand hover:text-brand-dark">
          ← Back to Membership
        </Link>
        <h1 className="mt-4 font-heading text-[32px] font-bold text-heading">Join NAHCA</h1>
        <p className="mt-2 max-w-2xl text-black">
          Tell us a bit about yourself so we can welcome you into the NAHCA community.
        </p>

        <JoinForm plans={plans} initialType={type} />
      </Container>
    </section>
  );
}
