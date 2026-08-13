"use client";

import { FormEvent, useState } from "react";
import { redeemCode } from "./actions";

export function RedeemForm() {
  const [code, setCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setSubmitting(true);

    const result = await redeemCode(code);

    setSubmitting(false);
    if (result.error) {
      setError(result.error);
    } else {
      setSuccess(true);
      setCode("");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 flex max-w-md flex-col gap-4">
      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium text-black">Claim code</span>
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          required
          placeholder="XXXX-XXXX-XX"
          className="rounded-lg border border-ink/20 bg-white px-3 py-2 uppercase focus:border-brand focus:outline-none"
        />
      </label>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {success && (
        <p className="text-sm text-forest">Code redeemed — your membership is active. Check Purchases for details.</p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="self-start rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-dark disabled:opacity-50"
      >
        {submitting ? "Redeeming…" : "Redeem code"}
      </button>
    </form>
  );
}
