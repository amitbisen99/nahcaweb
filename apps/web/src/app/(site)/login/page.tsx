import Link from "next/link";
import { Container } from "@/components/Container";
import { LoginForm } from "./LoginForm";

export default function LoginPage() {
  return (
    <Container>
      <div className="mx-auto max-w-sm py-16">
        <h1 className="mb-6 font-heading text-2xl font-medium text-heading">Member / Admin Login</h1>
        <LoginForm />
        <p className="mt-4 text-sm text-black">
          New here?{" "}
          <Link href="/signup" className="font-semibold text-brand hover:text-brand-dark">
            Create a free account
          </Link>{" "}
          to join the Forum.
        </p>
      </div>
    </Container>
  );
}
