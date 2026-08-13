import { Container } from "@/components/Container";
import { ClaimForm } from "./ClaimForm";

export default async function MembershipClaimPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string }>;
}) {
  const { code } = await searchParams;

  return (
    <section className="bg-white py-16">
      <Container>
        <h1 className="font-heading text-[32px] font-bold text-heading">Claim Your Sponsored Membership</h1>
        <p className="mt-2 max-w-2xl text-black">
          Your institution has sponsored a NAHCA membership for you. Enter your claim code and a few details below
          to activate it — no payment required.
        </p>

        <ClaimForm initialCode={code} />
      </Container>
    </section>
  );
}
