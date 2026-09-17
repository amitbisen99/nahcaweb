"use client";

import { useState } from "react";
import { deleteForumReply } from "@/app/admin/forum/actions";

export function ForumReplyDeleteButton({ replyId, topicId }: { replyId: number; topicId: number }) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleted, setDeleted] = useState(false);

  async function handleDelete() {
    if (!window.confirm("Delete this reply?")) return;
    setPending(true);
    setError(null);
    const result = await deleteForumReply(replyId, topicId);
    setPending(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setDeleted(true);
  }

  if (deleted) return null;

  return (
    <span className="ml-2">
      <button
        type="button"
        disabled={pending}
        onClick={handleDelete}
        className="text-xs font-semibold text-red-600 hover:text-red-700 disabled:opacity-50"
      >
        Delete
      </button>
      {error && <span className="ml-2 text-xs text-red-600">{error}</span>}
    </span>
  );
}
