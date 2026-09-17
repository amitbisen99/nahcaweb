import Link from "next/link";
import { auth } from "@/auth";
import { listAdminForumTopics } from "@/lib/adminForum";
import { formatDate } from "@/lib/formatDate";
import { ForumTopicRowActions } from "@/components/admin/ForumTopicRowActions";

const TABS: { value: "pending" | "published" | "rejected"; label: string }[] = [
  { value: "pending", label: "Pending review" },
  { value: "published", label: "Published" },
  { value: "rejected", label: "Rejected" },
];

export default async function AdminForumPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status: statusParam } = await searchParams;
  const status = (["pending", "published", "rejected"] as const).includes(statusParam as never)
    ? (statusParam as "pending" | "published" | "rejected")
    : "pending";

  const session = await auth();
  const { topics, total } = session?.apiToken
    ? await listAdminForumTopics(session.apiToken, { status, pageSize: 100 })
    : { topics: [], total: 0 };

  return (
    <div>
      <h1 className="font-heading text-3xl font-medium text-heading">Forum Moderation</h1>
      <p className="mt-1 text-sm text-black">
        Every new topic is held for review before it appears in the forum. Replies aren&rsquo;t moderated —
        delete one directly from its topic thread if needed.
      </p>

      <div className="mt-4 flex gap-2">
        {TABS.map((tab) => (
          <Link
            key={tab.value}
            href={`/admin/forum?status=${tab.value}`}
            className={`rounded-lg px-4 py-2 text-sm font-semibold ${
              status === tab.value ? "bg-brand text-white" : "border border-ink/20 text-black hover:border-brand"
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {topics.length === 0 ? (
        <p className="mt-6 text-sm text-black">Nothing here.</p>
      ) : (
        <div className="mt-4 overflow-x-auto rounded-xl border border-ink/10">
          <table className="w-full text-left text-sm">
            <thead className="bg-sand/40 text-xs uppercase tracking-wide text-black">
              <tr>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Author</th>
                <th className="px-4 py-3">Visibility</th>
                <th className="px-4 py-3">Posted</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {topics.map((t) => (
                <tr key={t.id} className="border-t border-ink/10 align-top">
                  <td className="px-4 py-3 font-medium text-ink">
                    <Link href={`/forum/${t.id}`} className="hover:text-brand">
                      {t.title}
                    </Link>
                    {t.status === "rejected" && t.rejectionReason && (
                      <p className="mt-1 text-xs font-normal text-red-700">Reason: {t.rejectionReason}</p>
                    )}
                    {t.pinned && <span className="ml-2 text-xs font-normal text-brand-dark">Pinned</span>}
                    {t.locked && <span className="ml-2 text-xs font-normal text-black/60">Locked</span>}
                  </td>
                  <td className="px-4 py-3 text-black">{t.category.name}</td>
                  <td className="px-4 py-3 text-black">{t.author.name}</td>
                  <td className="px-4 py-3 text-black">{t.visibility === "members_only" ? "Members only" : "Everyone"}</td>
                  <td className="px-4 py-3 text-black">{formatDate(t.createdAt)}</td>
                  <td className="px-4 py-3">
                    <ForumTopicRowActions topic={t} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="mt-4 text-xs text-black/50">{total} topic{total === 1 ? "" : "s"} in this view.</p>
    </div>
  );
}
