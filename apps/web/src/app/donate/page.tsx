import { Container } from "@/components/Container";
import { DonateForm } from "./DonateForm";

export default async function DonatePage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;

  return (
    <Container>
      <div className="mx-auto max-w-lg py-16">
        <h1 className="font-heading text-3xl font-medium text-ink">Donate</h1>
        <p className="mt-2 text-ink/70">
          Your gift directly supports NAHCA&apos;s mission of advancing Hindu chaplaincy.
        </p>

        {status === "success" && (
          <p className="mt-6 rounded-lg bg-green-100 px-4 py-3 text-sm text-green-800">
            Thank you! Your donation was received — a receipt is on its way to your inbox.
          </p>
        )}
        {status === "cancelled" && (
          <p className="mt-6 rounded-lg bg-yellow-100 px-4 py-3 text-sm text-yellow-800">
            Checkout was cancelled — no charge was made.
          </p>
        )}

        <div className="mt-8">
          <DonateForm />
        </div>
      </div>
    </Container>
  );
}
