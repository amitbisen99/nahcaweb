import Link from "next/link";
import { Container } from "@/components/Container";
import { SignupForm } from "./SignupForm";

export default function SignupPage() {
  return (
    <Container>
      <div className="mx-auto max-w-sm py-16">
        <h1 className="mb-2 font-heading text-2xl font-medium text-heading">Create a free account</h1>
        <p className="mb-6 text-sm text-black">
          No payment needed — a free account lets you post and reply in the NAHCA Forum. Looking to become a
          NAHCA member instead? <Link href="/membership" className="font-semibold text-brand hover:text-brand-dark">See membership options</Link>.
        </p>
        <SignupForm />
        <p className="mt-4 text-sm text-black">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-brand hover:text-brand-dark">
            Sign in
          </Link>
        </p>
      </div>
    </Container>
  );
}
