"use client";

import { FormEvent, useState } from "react";

const PRESET_AMOUNTS = [25, 50, 100, 250];

export function DonateForm() {
  const [amount, setAmount] = useState(50);
  const [customAmount, setCustomAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const amountDollars = customAmount ? Number(customAmount) : amount;

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/donations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          donorName: formData.get("donorName"),
          donorEmail: formData.get("donorEmail"),
          purpose: formData.get("purpose") || undefined,
          address: formData.get("address") || undefined,
          amountCents: Math.round(amountDollars * 100),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error?.message ?? data.error ?? "Something went wrong. Please try again.");
      }

      window.location.href = data.checkoutUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div>
        <span className="text-sm font-medium text-black">Amount</span>
        <div className="mt-2 flex flex-wrap gap-2">
          {PRESET_AMOUNTS.map((preset) => (
            <button
              type="button"
              key={preset}
              onClick={() => {
                setAmount(preset);
                setCustomAmount("");
              }}
              className={`rounded-lg border px-4 py-2 text-sm font-medium ${
                amount === preset && !customAmount
                  ? "border-brand bg-brand text-white"
                  : "border-ink/20 bg-white text-black"
              }`}
            >
              ${preset}
            </button>
          ))}
          <input
            type="number"
            min={1}
            placeholder="Custom"
            value={customAmount}
            onChange={(e) => setCustomAmount(e.target.value)}
            className="w-28 rounded-lg border border-ink/20 bg-white px-3 py-2 text-sm focus:border-brand focus:outline-none"
          />
        </div>
      </div>

      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium text-black">Purpose / Dedication (optional)</span>
        <input
          type="text"
          name="purpose"
          placeholder="e.g. In honor of..."
          className="rounded-lg border border-ink/20 bg-white px-3 py-2 focus:border-brand focus:outline-none"
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium text-black">Name</span>
        <input
          type="text"
          name="donorName"
          required
          className="rounded-lg border border-ink/20 bg-white px-3 py-2 focus:border-brand focus:outline-none"
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium text-black">Email</span>
        <input
          type="email"
          name="donorEmail"
          required
          className="rounded-lg border border-ink/20 bg-white px-3 py-2 focus:border-brand focus:outline-none"
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium text-black">Address (optional)</span>
        <textarea
          name="address"
          rows={3}
          placeholder="Street, city, state, ZIP"
          className="rounded-lg border border-ink/20 bg-white px-3 py-2 focus:border-brand focus:outline-none"
        />
      </label>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="rounded-lg bg-brand px-5 py-2.5 font-medium text-white hover:bg-brand-dark disabled:opacity-50"
      >
        {submitting ? "Redirecting to checkout…" : "Donate"}
      </button>
    </form>
  );
}
