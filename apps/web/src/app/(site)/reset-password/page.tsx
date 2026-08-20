import { Container } from "@/components/Container";
import { ResetPasswordForm } from "./ResetPasswordForm";

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  return (
    <Container>
      <div className="mx-auto max-w-sm py-16">
        <h1 className="mb-6 font-heading text-2xl font-medium text-heading">Set a New Password</h1>
        <ResetPasswordForm token={token} />
      </div>
    </Container>
  );
}
