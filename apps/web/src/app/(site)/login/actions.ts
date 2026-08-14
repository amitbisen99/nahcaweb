"use server";

import { AuthError } from "next-auth";
import { signIn, AccountDeactivatedError } from "@/auth";

export interface LoginState {
  error?: string;
}

export async function login(_prevState: LoginState, formData: FormData): Promise<LoginState> {
  try {
    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirectTo: "/post-login",
    });
    return {};
  } catch (error) {
    // AccountDeactivatedError extends AuthError, so it must be checked first.
    if (error instanceof AccountDeactivatedError) {
      return { error: "This account has been deactivated. Contact NAHCA for help." };
    }
    if (error instanceof AuthError) {
      return { error: "Invalid email or password. Please try again." };
    }
    // Anything else (notably Next.js's internal redirect signal on a
    // successful sign-in) must propagate, not be swallowed here.
    throw error;
  }
}
