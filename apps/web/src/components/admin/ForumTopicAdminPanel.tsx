"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  approveForumTopic,
  rejectForumTopic,
  setForumTopicFlags,
  deleteForumTopic,
} from "@/app/admin/forum/actions";
import { ForumTopicDetail } from "@/lib/forum";

// Approve and Reject each become a plain non-clickable "Approved"/
// "Rejected" label once the topic is already in that state — showing an
// actionable "Approve" button on an already-published topic was confusing
// (per explicit feedback). They're still clickable from any *other* state,
// since moderation isn't one-way: a rejected topic can be reconsidered
// (Approve), and a published one can be pulled back (Reject). Pin/lock
// only make sense once something is actually published, so those stay
// conditional on that.
export function ForumTopicAdminPanel({ topic }: { topic: ForumTopicDetail }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // Calling a Server Action directly from a plain onClick (not a <form
  // action={...}>) needs to go through startTransition — without it, a
  // revalidatePath() inside the action (every one below calls it) can throw
  // instead of just refreshing the data, which is what was actually causing
  // the "Something went wrong" crash on Pin despite the pin itself
  // succeeding server-side. try/catch on top is belt-and-suspenders: any
  // other failure (a network hiccup, a stale session) becomes a retriable
  // message here instead of crashing the whole page.
  function run(action: () => Promise<{ error?: string }>) {
    setError(null);
    startTransition(async () => {
      try {
        const result = await action();
        if (result.error) {
          setError(result.error);
          return;
        }
        router.refresh();
      } catch (err) {
        console.error("Forum admin action failed:", err);
        setError("Something went wrong. Please try again.");
      }
    });
  }

  function handleReject() {
    const reason = window.prompt("Reason for rejecting this topic (the author will see this):");
    if (!reason || !reason.trim()) return;
    run(() => rejectForumTopic(topic.id, reason.trim()));
  }

  function handleDelete() {
    if (!window.confirm("Delete/hide this topic? It will no longer be visible to anyone.")) return;
    run(() => deleteForumTopic(topic.id));
  }

  return (
    <div className="mt-4 flex flex-col gap-2 rounded-lg border border-ink/15 bg-sand/30 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-black/50">Admin</p>
      <div className="flex flex-wrap gap-2">
        {topic.status === "published" ? (
          <span className="rounded-lg bg-forest/10 px-3 py-1.5 text-xs font-semibold text-forest">Approved</span>
        ) : (
          <button
            type="button"
            disabled={isPending}
            onClick={() => run(() => approveForumTopic(topic.id))}
            className="rounded-lg bg-forest px-3 py-1.5 text-xs font-semibold text-white hover:bg-forest/90 disabled:opacity-50"
          >
            Approve
          </button>
        )}
        {topic.status === "rejected" ? (
          <span className="rounded-lg bg-red-100 px-3 py-1.5 text-xs font-semibold text-red-700">Rejected</span>
        ) : (
          <button
            type="button"
            disabled={isPending}
            onClick={handleReject}
            className="rounded-lg border border-red-300 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50"
          >
            Reject
          </button>
        )}
        {topic.status === "published" && (
          <>
            <button
              type="button"
              disabled={isPending}
              onClick={() => run(() => setForumTopicFlags(topic.id, { pinned: !topic.pinned }))}
              className="rounded-lg border border-ink/20 bg-white px-3 py-1.5 text-xs font-semibold text-black hover:border-brand disabled:opacity-50"
            >
              {topic.pinned ? "Unpin" : "Pin"}
            </button>
            <button
              type="button"
              disabled={isPending}
              onClick={() => run(() => setForumTopicFlags(topic.id, { locked: !topic.locked }))}
              className="rounded-lg border border-ink/20 bg-white px-3 py-1.5 text-xs font-semibold text-black hover:border-brand disabled:opacity-50"
            >
              {topic.locked ? "Unlock" : "Lock"}
            </button>
          </>
        )}
        <button
          type="button"
          disabled={isPending}
          onClick={handleDelete}
          className="rounded-lg border border-red-300 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50"
        >
          Delete
        </button>
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
