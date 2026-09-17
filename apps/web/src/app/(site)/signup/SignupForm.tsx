"use client";

import { useActionState } from "react";
import { Button } from "@/components/Button";
import { signup, SignupState } from "./actions";

const initialState: SignupState = {};

export function SignupForm() {
  const [state, formAction, isPending] = useActionState(signup, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium text-black">Name</span>
        <input
          type="text"
          name="name"
          required
          className="rounded-lg border border-ink/20 bg-white px-3 py-2 focus:border-brand focus:outline-none"
        />
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium text-black">Email</span>
        <input
          type="email"
          name="email"
          required
          className="rounded-lg border border-ink/20 bg-white px-3 py-2 focus:border-brand focus:outline-none"
        />
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium text-black">Password</span>
        <input
          type="password"
          name="password"
          required
          minLength={8}
          className="rounded-lg border border-ink/20 bg-white px-3 py-2 focus:border-brand focus:outline-none"
        />
        <span className="text-xs text-black/60">At least 8 characters.</span>
      </label>
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      <Button type="submit" variant="solid" className="mt-2 w-full" disabled={isPending}>
        {isPending ? "Creating account…" : "Create free account"}
      </Button>
    </form>
  );
}
