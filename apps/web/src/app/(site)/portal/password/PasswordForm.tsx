"use client";

import { useActionState } from "react";
import { changePassword, PasswordFormState } from "./actions";

const INITIAL_STATE: PasswordFormState = {};

export function PasswordForm() {
  const [state, formAction, isPending] = useActionState(changePassword, INITIAL_STATE);

  return (
    <form action={formAction} className="mt-6 flex max-w-md flex-col gap-4">
      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium text-ink/80">Current password</span>
        <input
          type="password"
          name="currentPassword"
          required
          className="rounded-lg border border-ink/20 bg-white px-3 py-2 focus:border-brand focus:outline-none"
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium text-ink/80">New password</span>
        <input
          type="password"
          name="newPassword"
          required
          minLength={8}
          className="rounded-lg border border-ink/20 bg-white px-3 py-2 focus:border-brand focus:outline-none"
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium text-ink/80">Confirm new password</span>
        <input
          type="password"
          name="confirmPassword"
          required
          minLength={8}
          className="rounded-lg border border-ink/20 bg-white px-3 py-2 focus:border-brand focus:outline-none"
        />
      </label>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state.success && <p className="text-sm text-forest">Password changed successfully.</p>}

      <button
        type="submit"
        disabled={isPending}
        className="self-start rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-dark disabled:opacity-50"
      >
        {isPending ? "Saving…" : "Change password"}
      </button>
    </form>
  );
}
