import { Container } from "@/components/Container";
import { EventBanner } from "@/components/EventBanner";
import { DonateForm } from "./DonateForm";

export default async function DonatePage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;

  return (
    <>
      <EventBanner title="Donate" image="/chaplaincy/puja.jpg" />
      <Container>
      <div className="mx-auto max-w-lg py-16">
        <p className="mt-2 text-black">
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
    </>
  );
}
