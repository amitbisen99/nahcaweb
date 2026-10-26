"use client";

import { useActionState } from "react";
import { Button } from "@/components/Button";
import { AdminUserFormState, resetAdminPassword } from "@/app/admin/admin-users/actions";

const initialState: AdminUserFormState = {};

export function ResetAdminPasswordForm({ adminId }: { adminId: number }) {
  const [state, formAction, isPending] = useActionState(resetAdminPassword.bind(null, adminId), initialState);

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium text-black">New password</span>
        <input
          type="password"
          name="password"
          required
          minLength={8}
          autoComplete="new-password"
          className="rounded-lg border border-ink/20 bg-white px-3 py-2 focus:border-brand focus:outline-none"
        />
        <span className="text-xs text-black/60">At least 8 characters. Their old password stops working immediately.</span>
      </label>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state.success && <p className="text-sm text-forest">{state.success}</p>}

      <Button type="submit" variant="outline" className="self-start" disabled={isPending}>
        {isPending ? "Resetting…" : "Reset password"}
      </Button>
    </form>
  );
}
