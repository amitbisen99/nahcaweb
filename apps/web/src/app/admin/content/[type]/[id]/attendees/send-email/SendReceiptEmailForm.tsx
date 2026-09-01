"use client";

import { useActionState } from "react";
import { RichTextField } from "@/components/admin/RichTextField";
import { fieldLabelClass, inputClass } from "@/components/MemberProfileFormFields";
import { sendReceiptEmail, SendReceiptEmailState } from "./actions";

const TAGS = [
  { label: "Attendee Name", value: "{{name}}" },
  { label: "Event Name", value: "{{event_name}}" },
];

const initialState: SendReceiptEmailState = {};

export function SendReceiptEmailForm({ eventCode, activeCount }: { eventCode: string; activeCount: number }) {
  const action = sendReceiptEmail.bind(null, eventCode);
  const [state, formAction, isPending] = useActionState(action, initialState);

  return (
    <form
      action={formAction}
      onSubmit={(e) => {
        if (activeCount === 0) {
          e.preventDefault();
          return;
        }
        const ok = window.confirm(
          `Send this email to ${activeCount} ${activeCount === 1 ? "attendee" : "attendees"}? This can't be undone.`
        );
        if (!ok) e.preventDefault();
      }}
      className="flex flex-col gap-5 rounded-xl border border-ink/10 bg-white p-6 sm:p-8"
    >
      {state.result && (
        <div className="rounded-lg border border-forest/30 bg-forest/5 p-4 text-sm">
          <p className="font-semibold text-forest">
            Sent to {state.result.sent} of {state.result.sent + state.result.failed.length} attendees.
          </p>
          {state.result.failed.length > 0 && (
            <div className="mt-2">
              <p className="font-medium text-black">Failed to send to:</p>
              <ul className="mt-1 flex flex-col gap-0.5">
                {state.result.failed.map((f) => (
                  <li key={f.email} className="text-black/70">
                    {f.email} — {f.error}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <label className="flex flex-col gap-1">
        <span className={fieldLabelClass()}>Subject</span>
        <input
          type="text"
          name="subject"
          required
          placeholder="Your receipt for {{event_name}}"
          className={inputClass()}
        />
        <span className="text-xs text-black/60">
          You can use <code className="font-mono">{"{{name}}"}</code> and{" "}
          <code className="font-mono">{"{{event_name}}"}</code> here too — just type them.
        </span>
      </label>

      <RichTextField name="bodyHtml" label="Message" insertTags={TAGS} />

      <label className="flex flex-col gap-1">
        <span className={fieldLabelClass()}>Attachment (PDF)</span>
        <input type="file" name="attachment" accept="application/pdf" className={inputClass()} />
        <span className="text-xs text-black/60">Optional — the same file is sent to every attendee.</span>
      </label>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      {activeCount === 0 && (
        <p className="text-sm text-black/60">There are no active attendees to email yet.</p>
      )}

      <button
        type="submit"
        disabled={isPending || activeCount === 0}
        className="mt-2 self-start rounded-lg bg-brand px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-dark disabled:opacity-50"
      >
        {isPending ? "Sending…" : "Send Email"}
      </button>
    </form>
  );
}
