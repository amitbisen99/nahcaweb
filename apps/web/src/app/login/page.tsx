import { Container } from "@/components/Container";
import { Button } from "@/components/Button";
import { signIn } from "@/auth";
import { AuthError } from "next-auth";

async function login(formData: FormData) {
  "use server";

  try {
    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirectTo: "/portal",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      throw new Error("Invalid email or password");
    }
    throw error;
  }
}

export default function LoginPage() {
  return (
    <Container>
      <div className="mx-auto max-w-sm py-16">
        <h1 className="mb-6 font-heading text-2xl font-medium text-ink">Member / Admin Login</h1>
        <form action={login} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium text-ink/80">Email</span>
            <input
              type="email"
              name="email"
              required
              className="rounded-lg border border-ink/20 bg-white px-3 py-2 focus:border-brand focus:outline-none"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium text-ink/80">Password</span>
            <input
              type="password"
              name="password"
              required
              className="rounded-lg border border-ink/20 bg-white px-3 py-2 focus:border-brand focus:outline-none"
            />
          </label>
          <Button type="submit" variant="solid" className="mt-2 w-full">
            Sign in
          </Button>
        </form>
      </div>
    </Container>
  );
}
