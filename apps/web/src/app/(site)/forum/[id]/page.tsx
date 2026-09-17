import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/Container";
import { auth } from "@/auth";
import { getForumTopic } from "@/lib/forum";
import { formatDate } from "@/lib/formatDate";
import { ForumReplyDeleteButton } from "@/components/admin/ForumReplyDeleteButton";
import { ForumTopicAdminPanel } from "@/components/admin/ForumTopicAdminPanel";
import { ReplyForm } from "./ReplyForm";

export default async function ForumTopicPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const topicId = Number(id);
  if (!Number.isInteger(topicId)) notFound();

  const session = await auth();
  const token = session?.apiToken ?? "";
  const topic = await getForumTopic(topicId, token);
  if (!topic) notFound();

  return (
    <Container>
      <div className="mx-auto max-w-3xl py-12">
        <Link href="/forum" className="text-sm font-semibold text-brand hover:text-brand-dark">
          ← Forum
        </Link>

        {topic.status === "pending" && (
          <div className="mt-4 rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-black">
            This topic is awaiting admin review — it isn&rsquo;t visible to anyone else yet.
          </div>
        )}
        {topic.status === "rejected" && (
          <div className="mt-4 rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-black">
            <p className="font-semibold text-red-700">This topic was not approved.</p>
            {topic.rejectionReason && <p className="mt-1">{topic.rejectionReason}</p>}
          </div>
        )}

        {session?.user?.role === "admin" && <ForumTopicAdminPanel topic={topic} />}

        <div className="mt-2 flex flex-wrap items-center gap-2">
          {topic.pinned && (
            <span className="rounded-full bg-brand/10 px-2 py-0.5 text-xs font-semibold text-brand-dark">Pinned</span>
          )}
          {topic.visibility === "members_only" && (
            <span className="rounded-full bg-sand px-2 py-0.5 text-xs font-semibold text-black">Members only</span>
          )}
          {topic.locked && (
            <span className="rounded-full bg-ink/10 px-2 py-0.5 text-xs font-semibold text-black">Locked</span>
          )}
          <span className="text-xs font-medium uppercase tracking-wide text-black/50">{topic.category.name}</span>
        </div>

        <h1 className="mt-1 font-heading text-3xl font-medium text-heading">{topic.title}</h1>
        <p className="mt-1 text-sm text-black/60">
          by {topic.author.name} · {formatDate(topic.createdAt)}
        </p>

        <div
          className="mt-6 rounded-xl border border-ink/10 bg-white p-6 text-base leading-relaxed text-black [&_a]:text-brand [&_a]:underline [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:pl-5"
          dangerouslySetInnerHTML={{ __html: topic.body }}
        />

        {topic.replies.length > 0 && (
          <div className="mt-8 flex flex-col gap-3">
            <h2 className="font-heading text-lg font-medium text-heading">
              {topic.replies.length} {topic.replies.length === 1 ? "Reply" : "Replies"}
            </h2>
            {topic.replies.map((r) => (
              <div key={r.id} className="rounded-xl border border-ink/10 bg-white p-4">
                <p className="whitespace-pre-line text-sm text-black">{r.body}</p>
                <p className="mt-2 text-xs text-black/60">
                  {r.author.name} · {formatDate(r.createdAt)}
                  {session?.user?.role === "admin" && (
                    <ForumReplyDeleteButton replyId={r.id} topicId={topic.id} />
                  )}
                </p>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6">
          {topic.status === "published" && topic.locked && (
            <p className="text-sm text-black/60">This topic is locked — no new replies are being accepted.</p>
          )}
          {topic.status === "published" &&
            !topic.locked &&
            (session?.apiToken ? (
              <ReplyForm topicId={topic.id} />
            ) : (
              <p className="text-sm text-black">
                <Link href="/login" className="font-semibold text-brand hover:text-brand-dark">
                  Log in
                </Link>{" "}
                or{" "}
                <Link href="/signup" className="font-semibold text-brand hover:text-brand-dark">
                  create a free account
                </Link>{" "}
                to reply.
              </p>
            ))}
        </div>
      </div>
    </Container>
  );
}
