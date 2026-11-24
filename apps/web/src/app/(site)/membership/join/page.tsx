import Link from "next/link";
import { Container } from "@/components/Container";
import { auth } from "@/auth";
import { getMembershipPlans } from "@/lib/api";
import { JoinForm } from "./JoinForm";

export default async function MembershipJoinPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const { type } = await searchParams;
  const plans = await getMembershipPlans();
  const session = await auth();
  // Someone who's already signed in (a general user, or a member whose term
  // ended) buys for the account they have — no new name/email/password.
  const account = session?.apiToken && session.user ? { name: session.user.name ?? "", email: session.user.email ?? "" } : null;

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
          {account
            ? `You're signed in as ${account.email}. Choose a plan below — it will be added to your existing account.`
            : "Tell us a bit about yourself so we can welcome you into the NAHCA community."}
        </p>

        <JoinForm plans={plans} initialType={type} account={account} />
      </Container>
    </section>
  );
}
