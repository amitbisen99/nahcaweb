"use client";

import { useState } from "react";
import { Button } from "@/components/Button";
import { quickJoinEvent } from "@/app/(site)/events/actions";

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

// Webinars have no scheduled date and get their own wording; Events keep
// the "held on" clause. Mirrors buildEventRegistrationReceiptBody on the
// API side — keep both in sync.
function confirmationMessage(type: "event" | "webinar", eventTitle: string, eventDate: string | null): string {
  if (type === "webinar") {
    return `You successfully registered for the webinar '${eventTitle}'.`;
  }
  return `You registered for this event '${eventTitle}'${eventDate ? ` held on ${formatDate(eventDate)}` : ""}.`;
}

// Not logged in -> off to the registration/payment form. Already a member ->
// one click, no form, no payment (client's explicit requirement) — this
// component makes that call itself and swaps in the confirmation message.
export function JoinButton({
  eventCode,
  eventTitle,
  eventDate,
  isLoggedIn,
  type,
  size = "md",
}: {
  eventCode: string;
  eventTitle: string;
  eventDate: string | null;
  isLoggedIn: boolean;
  type: "event" | "webinar";
  size?: "sm" | "md";
}) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [joined, setJoined] = useState(false);

  async function handleQuickJoin() {
    setPending(true);
    setError(null);
    const result = await quickJoinEvent(eventCode);
    setPending(false);

    if (result.error) {
      setError(result.error);
      return;
    }
    setJoined(true);
  }

  if (joined) {
    return (
      <p className="max-w-sm rounded-lg border border-forest/30 bg-forest/5 px-4 py-3 text-sm font-medium text-forest break-words">
        {confirmationMessage(type, eventTitle, eventDate)}
      </p>
    );
  }

  if (!isLoggedIn) {
    return (
      <Button href={`/events/join/${eventCode}`} variant="solid" size={size}>
        Join
      </Button>
    );
  }

  return (
    <div className="flex flex-col items-start gap-2">
      <Button type="button" variant="solid" size={size} onClick={handleQuickJoin} disabled={pending}>
        {pending ? "Joining…" : "Join"}
      </Button>
      {error && <p className="max-w-sm text-sm text-red-600 break-words">{error}</p>}
    </div>
  );
}
