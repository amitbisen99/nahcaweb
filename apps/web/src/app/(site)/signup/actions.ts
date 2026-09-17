"use server";

import { AuthError } from "next-auth";
import { signIn } from "@/auth";

export interface SignupState {
  error?: string;
}

// Registers a free "general user" account (name/email/password, no
// payment) via the API's existing POST /auth/register — which had no page
// calling it before this — then signs the new account straight in via the
// same NextAuth credentials flow login/actions.ts uses, so signup doesn't
// require a second trip through the login form.
export async function signup(_prevState: SignupState, formData: FormData): Promise<SignupState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!name || !email || !password) {
    return { error: "Please fill in every field." };
  }
  if (password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }

  let res: Response;
  try {
    res = await fetch(`${process.env.API_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
      signal: AbortSignal.timeout(10_000),
    });
  } catch (err) {
    console.error("signup: request failed:", err);
    return { error: "Couldn't reach the server. Please try again." };
  }

  if (res.status === 409) {
    return { error: "An account with that email already exists. Try signing in instead." };
  }
  if (!res.ok) {
    const data = await res.json().catch(() => null);
    const message =
      typeof data?.error === "string" ? data.error : "Couldn't create your account. Please try again.";
    return { error: message };
  }

  try {
    await signIn("credentials", { email, password, redirectTo: "/post-login" });
    return {};
  } catch (error) {
    if (error instanceof AuthError) {
      // The account was just created successfully — a sign-in failure here
      // would be a genuine infra hiccup, not a credentials problem (we just
      // set that exact password moments ago). Send them to log in manually
      // rather than silently failing.
      return { error: "Account created — please sign in." };
    }
    // Next.js's internal redirect signal on a successful sign-in must
    // propagate, not be swallowed here.
    throw error;
  }
}
