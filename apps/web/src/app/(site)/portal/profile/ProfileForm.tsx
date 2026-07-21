"use client";

import { useActionState } from "react";
import { updateProfile, ProfileFormState } from "./actions";

const INITIAL_STATE: ProfileFormState = {};

export function ProfileForm({ name, email }: { name: string; email: string }) {
  const [state, formAction, isPending] = useActionState(updateProfile, INITIAL_STATE);

  return (
    <form action={formAction} className="mt-6 flex max-w-md flex-col gap-4">
      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium text-ink/80">Name</span>
        <input
          type="text"
          name="name"
          required
          defaultValue={name}
          className="rounded-lg border border-ink/20 bg-white px-3 py-2 focus:border-brand focus:outline-none"
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium text-ink/80">Email</span>
        <input
          type="email"
          value={email}
          disabled
          className="rounded-lg border border-ink/20 bg-sand/20 px-3 py-2 text-ink/50"
        />
        <span className="text-xs text-ink/50">Contact us if you need to change your email address.</span>
      </label>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state.success && <p className="text-sm text-forest">Profile updated.</p>}

      <button
        type="submit"
        disabled={isPending}
        className="self-start rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-dark disabled:opacity-50"
      >
        {isPending ? "Saving…" : "Save changes"}
      </button>
    </form>
  );
}
