import { Container } from "@/components/Container";
import { LoginForm } from "./LoginForm";

export default function LoginPage() {
  return (
    <Container>
      <div className="mx-auto max-w-sm py-16">
        <h1 className="mb-6 font-heading text-2xl font-medium text-heading">Member / Admin Login</h1>
        <LoginForm />
      </div>
    </Container>
  );
}
