"use client";

import { useActionState } from "react";
import { Button } from "@/components/Button";
import { postForumReply, ReplyState } from "./actions";

const initialState: ReplyState = {};

export function ReplyForm({ topicId }: { topicId: number }) {
  const action = postForumReply.bind(null, topicId);
  const [state, formAction, isPending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-3 rounded-xl border border-ink/10 bg-white p-4">
      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium text-black">Post a reply</span>
        <textarea
          name="body"
          required
          rows={4}
          className="rounded-lg border border-ink/20 bg-white px-3 py-2 text-sm focus:border-brand focus:outline-none"
        />
      </label>
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      <Button type="submit" variant="solid" className="self-start" disabled={isPending}>
        {isPending ? "Posting…" : "Post reply"}
      </Button>
    </form>
  );
}
