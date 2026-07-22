"use client";

export default function GlobalError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  return (
    <html lang="en">
      <body className="flex min-h-screen items-center justify-center bg-cream px-6 text-center font-sans">
        <div>
          <h1 className="text-2xl font-semibold text-heading">Something went wrong</h1>
          <p className="mt-2 text-sm text-ink/60">
            An unexpected error occurred. Please try again, or contact us if this keeps happening.
          </p>
          {error.digest && <p className="mt-1 text-xs text-ink/40">Reference: {error.digest}</p>}
          <button
            type="button"
            onClick={() => unstable_retry()}
            className="mt-6 rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
