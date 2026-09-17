"use client";

import { useActionState } from "react";
import { Button } from "@/components/Button";
import { RichTextField } from "@/components/admin/RichTextField";
import { ForumCategory } from "@/lib/forum";
import { createForumTopic, NewTopicState } from "./actions";

const initialState: NewTopicState = {};

export function NewTopicForm({ categories, canPostMembersOnly }: { categories: ForumCategory[]; canPostMembersOnly: boolean }) {
  const [state, formAction, isPending] = useActionState(createForumTopic, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium text-black">Category</span>
        <select
          name="categoryId"
          required
          className="rounded-lg border border-ink/20 bg-white px-3 py-2 focus:border-brand focus:outline-none"
        >
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium text-black">Title</span>
        <input
          type="text"
          name="title"
          required
          maxLength={200}
          className="rounded-lg border border-ink/20 bg-white px-3 py-2 focus:border-brand focus:outline-none"
        />
      </label>

      <RichTextField name="body" label="Message" />

      {canPostMembersOnly && (
        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium text-black">Who can see this topic?</span>
          <label className="flex items-center gap-2 text-sm text-black">
            <input type="radio" name="visibility" value="public" defaultChecked />
            Everyone (general users, members, and admin)
          </label>
          <label className="flex items-center gap-2 text-sm text-black">
            <input type="radio" name="visibility" value="members_only" />
            Members only
          </label>
        </div>
      )}

      <p className="text-xs text-black/60">
        New topics are reviewed by an admin before they go live — you&rsquo;ll see it under{" "}
        <span className="font-medium">My Topics</span> once it&rsquo;s approved (or if it needs changes).
      </p>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      <Button type="submit" variant="solid" className="self-start" disabled={isPending}>
        {isPending ? "Posting…" : "Submit for review"}
      </Button>
    </form>
  );
}
