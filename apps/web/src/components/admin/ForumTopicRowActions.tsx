"use client";

import { useState } from "react";
import {
  approveForumTopic,
  rejectForumTopic,
  setForumTopicFlags,
  deleteForumTopic,
} from "@/app/admin/forum/actions";
import { AdminForumTopic } from "@/lib/adminForum";

export function ForumTopicRowActions({ topic }: { topic: AdminForumTopic }) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run(action: () => Promise<{ error?: string }>) {
    setPending(true);
    setError(null);
    const result = await action();
    setPending(false);
    if (result.error) setError(result.error);
  }

  function handleReject() {
    const reason = window.prompt("Reason for rejecting this topic (the author will see this):");
    if (!reason || !reason.trim()) return;
    run(() => rejectForumTopic(topic.id, reason.trim()));
  }

  function handleDelete() {
    const confirmed = window.confirm(
      topic.status === "rejected"
        ? "Permanently delete this rejected topic?"
        : "Delete/hide this topic? It will no longer be visible to anyone."
    );
    if (!confirmed) return;
    run(() => deleteForumTopic(topic.id));
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex flex-wrap justify-end gap-2">
        {topic.status === "pending" && (
          <>
            <button
              type="button"
              disabled={pending}
              onClick={() => run(() => approveForumTopic(topic.id))}
              className="rounded-lg bg-forest px-3 py-1.5 text-xs font-semibold text-white hover:bg-forest/90 disabled:opacity-50"
            >
              Approve
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={handleReject}
              className="rounded-lg border border-red-300 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50"
            >
              Reject
            </button>
          </>
        )}
        {topic.status === "published" && (
          <>
            <button
              type="button"
              disabled={pending}
              onClick={() => run(() => setForumTopicFlags(topic.id, { pinned: !topic.pinned }))}
              className="rounded-lg border border-ink/20 px-3 py-1.5 text-xs font-semibold text-black hover:border-brand disabled:opacity-50"
            >
              {topic.pinned ? "Unpin" : "Pin"}
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={() => run(() => setForumTopicFlags(topic.id, { locked: !topic.locked }))}
              className="rounded-lg border border-ink/20 px-3 py-1.5 text-xs font-semibold text-black hover:border-brand disabled:opacity-50"
            >
              {topic.locked ? "Unlock" : "Lock"}
            </button>
          </>
        )}
        <button
          type="button"
          disabled={pending}
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
