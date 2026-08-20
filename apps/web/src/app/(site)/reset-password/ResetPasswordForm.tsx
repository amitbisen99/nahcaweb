"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/Button";

export function ResetPasswordForm({ token }: { token?: string }) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!token) {
    return (
      <p className="text-sm text-red-600">
        This reset link is missing or invalid. Please request a new one from the{" "}
        <Link href="/login" className="font-semibold text-brand hover:text-brand-dark">
          login page
        </Link>
        .
      </p>
    );
  }

  if (success) {
    return (
      <div>
        <p className="text-sm text-forest">Your password has been reset.</p>
        <Button href="/login" variant="solid" className="mt-4 w-full">
          Login
        </Button>
      </div>
    );
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? "Something went wrong. Please try again.");
      }

      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium text-black">New password</span>
        <input
          type="password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="rounded-lg border border-ink/20 bg-white px-3 py-2 focus:border-brand focus:outline-none"
        />
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium text-black">Confirm new password</span>
        <input
          type="password"
          required
          minLength={8}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="rounded-lg border border-ink/20 bg-white px-3 py-2 focus:border-brand focus:outline-none"
        />
      </label>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <Button type="submit" variant="solid" className="mt-2 w-full" disabled={submitting}>
        {submitting ? "Resetting…" : "Reset password"}
      </Button>
    </form>
  );
}
