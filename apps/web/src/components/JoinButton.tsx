"use client";

import { useState } from "react";
import { Button } from "@/components/Button";
import { quickJoinEvent } from "@/app/(site)/events/actions";

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

// Not logged in -> off to the registration/payment form. Already a member ->
// one click, no form, no payment (client's explicit requirement) — this
// component makes that call itself and swaps in the confirmation message.
export function JoinButton({
  eventCode,
  eventTitle,
  eventDate,
  isLoggedIn,
}: {
  eventCode: string;
  eventTitle: string;
  eventDate: string | null;
  isLoggedIn: boolean;
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
      <p className="rounded-lg border border-forest/30 bg-forest/5 px-4 py-3 text-sm font-medium text-forest">
        You registered for this event ({eventTitle}){eventDate ? ` held on ${formatDate(eventDate)}` : ""}.
      </p>
    );
  }

  if (!isLoggedIn) {
    return (
      <Button href={`/events/join/${eventCode}`} variant="solid">
        Join
      </Button>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <Button type="button" variant="solid" onClick={handleQuickJoin} disabled={pending}>
        {pending ? "Joining…" : "Join"}
      </Button>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
