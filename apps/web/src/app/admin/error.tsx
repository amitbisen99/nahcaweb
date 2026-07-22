"use client";

import { useEffect } from "react";
import { Button } from "@/components/Button";

export default function AdminError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="rounded-xl border border-ink/10 bg-white p-8 text-center">
      <h1 className="font-heading text-xl font-medium text-heading">Something went wrong</h1>
      <p className="mt-2 text-sm text-ink/60">
        An unexpected error occurred loading this page. Please try again.
      </p>
      {error.digest && <p className="mt-1 text-xs text-ink/40">Reference: {error.digest}</p>}
      <div className="mt-6 flex justify-center gap-3">
        <button
          type="button"
          onClick={() => unstable_retry()}
          className="rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark"
        >
          Try again
        </button>
        <Button href="/admin" variant="outline">
          Back to Dashboard
        </Button>
      </div>
    </div>
  );
}
