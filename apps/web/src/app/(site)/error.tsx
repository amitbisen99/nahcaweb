"use client";

import { useEffect } from "react";
import { Container } from "@/components/Container";
import { Button } from "@/components/Button";

export default function SiteError({
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
    <Container>
      <div className="mx-auto max-w-md py-24 text-center">
        <h1 className="font-heading text-2xl font-medium text-heading">Something went wrong</h1>
        <p className="mt-2 text-sm text-ink/60">
          An unexpected error occurred loading this page. Please try again, or head back home.
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
          <Button href="/" variant="outline">
            Go home
          </Button>
        </div>
      </div>
    </Container>
  );
}
