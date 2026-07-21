"use client";

import { useState } from "react";

export function InviteLinkCard({ referralLink }: { referralLink: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="mt-6 rounded-xl border border-ink/10 bg-white p-6">
      <p className="text-sm font-medium text-ink/80">Your personal invite link</p>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <input
          readOnly
          value={referralLink}
          onFocus={(e) => e.currentTarget.select()}
          className="min-w-0 flex-1 rounded-lg border border-ink/20 bg-sand/20 px-3 py-2 text-sm text-ink/70"
        />
        <button
          type="button"
          onClick={handleCopy}
          className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
        >
          {copied ? "Copied!" : "Copy link"}
        </button>
      </div>
      <p className="mt-3 text-sm text-ink/60">
        Share this link with anyone you&apos;d like to invite to NAHCA membership.
      </p>
    </div>
  );
}
