"use client";

import { useState } from "react";
import { updateMemberActiveStatus } from "@/app/admin/members/actions";

export function MemberActiveToggle({
  membershipId,
  initialActive,
}: {
  membershipId: number;
  initialActive: boolean;
}) {
  const [isActive, setIsActive] = useState(initialActive);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleToggle() {
    const next = !isActive;
    if (!next) {
      const confirmed = window.confirm(
        "Deactivate this member? They will not be able to log in until reactivated."
      );
      if (!confirmed) return;
    }

    setPending(true);
    setError(null);
    const result = await updateMemberActiveStatus(membershipId, next);
    setPending(false);

    if (result.error) {
      setError(result.error);
      return;
    }
    setIsActive(next);
  }

  return (
    <div className="flex items-center gap-3 rounded-xl border border-ink/10 bg-white px-5 py-4">
      <button
        type="button"
        role="switch"
        aria-checked={isActive}
        onClick={handleToggle}
        disabled={pending}
        className={`relative inline-flex h-6 w-11 flex-none items-center rounded-full transition-colors disabled:opacity-50 ${
          isActive ? "bg-forest" : "bg-ink/20"
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            isActive ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
      <div>
        <p className="text-sm font-semibold text-ink">
          {isActive ? "Active" : "Inactive"}
          {pending && <span className="ml-2 font-normal text-black/50">Saving…</span>}
        </p>
        <p className="text-xs text-black/60">
          {isActive
            ? "This member can log in normally."
            : "This member cannot log in until reactivated."}
        </p>
        {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      </div>
    </div>
  );
}
