"use client";

import { useState } from "react";
import { ApiInstitutionCode } from "@/lib/institutions";
import { formatDate } from "@/lib/formatDate";

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard API unavailable (e.g. insecure context) — no-op, the code
      // is still visible to select/copy manually.
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="text-xs font-semibold text-brand hover:text-brand-dark"
    >
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}

// Bare list view — code, claimed/unclaimed, who claimed it and when. Used
// by both the institution's own portal dashboard and the admin member
// detail page (read-only in both places).
export function InstitutionCodeList({ codes }: { codes: ApiInstitutionCode[] }) {
  if (codes.length === 0) {
    return <p className="text-sm text-black">No codes yet.</p>;
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-ink/10">
      <table className="w-full text-left text-sm">
        <thead className="bg-sand/40 text-xs uppercase tracking-wide text-black">
          <tr>
            <th className="px-4 py-3">Code</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Claimed By</th>
            <th className="px-4 py-3">Claimed On</th>
            <th className="px-4 py-3"></th>
          </tr>
        </thead>
        <tbody>
          {codes.map((c) => (
            <tr key={c.id} className="border-t border-ink/10">
              <td className="px-4 py-3 font-mono text-ink">{c.code}</td>
              <td className="px-4 py-3">
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                    c.claimedAt ? "bg-ink/10 text-black" : "bg-forest/10 text-forest"
                  }`}
                >
                  {c.claimedAt ? "Claimed" : "Unclaimed"}
                </span>
              </td>
              <td className="px-4 py-3 text-black">
                {c.claimedByUser ? `${c.claimedByUser.name} (${c.claimedByUser.email})` : "—"}
              </td>
              <td className="px-4 py-3 text-black">{formatDate(c.claimedAt)}</td>
              <td className="px-4 py-3">{!c.claimedAt && <CopyButton text={c.code} />}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
