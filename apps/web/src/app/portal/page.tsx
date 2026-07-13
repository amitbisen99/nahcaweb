import { Container } from "@/components/Container";
import { auth } from "@/auth";

export default async function PortalPage() {
  const session = await auth();

  return (
    <Container>
      <div className="py-16">
        <h1 className="font-heading text-3xl font-medium text-ink">Member Portal</h1>
        <p className="mt-2 text-ink/70">Welcome, {session?.user?.name}.</p>
        <p className="mt-8 text-sm text-ink/40">
          Membership status, renewals, payment history, and members-only content will be built out in a follow-up
          phase.
        </p>
      </div>
    </Container>
  );
}
