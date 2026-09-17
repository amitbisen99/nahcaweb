import Link from "next/link";
import { Container } from "@/components/Container";
import { auth } from "@/auth";
import { getMyForumTopics } from "@/lib/forum";
import { formatDate } from "@/lib/formatDate";

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800",
  published: "bg-forest/10 text-forest",
  rejected: "bg-red-100 text-red-700",
};

const STATUS_LABELS: Record<string, string> = {
  pending: "Awaiting review",
  published: "Published",
  rejected: "Not approved",
};

export default async function MyForumTopicsPage({
  searchParams,
}: {
  searchParams: Promise<{ posted?: string }>;
}) {
  const { posted } = await searchParams;
  const session = await auth();
  const token = session?.apiToken ?? "";
  const topics = await getMyForumTopics(token);

  return (
    <Container>
      <div className="mx-auto max-w-3xl py-12">
        <Link href="/forum" className="text-sm font-semibold text-brand hover:text-brand-dark">
          ← Forum
        </Link>
        <h1 className="mt-1 font-heading text-3xl font-medium text-heading">My Topics</h1>

        {posted === "published" && (
          <div className="mt-4 rounded-lg border border-forest/30 bg-forest/5 p-3 text-sm text-black">
            Your topic has been posted.
          </div>
        )}
        {posted === "pending" && (
          <div className="mt-4 rounded-lg border border-forest/30 bg-forest/5 p-3 text-sm text-black">
            Your topic was submitted and is awaiting admin review.
          </div>
        )}

        {topics.length === 0 ? (
          <p className="mt-6 text-sm text-black">
            You haven&rsquo;t posted any topics yet.{" "}
            <Link href="/forum/new" className="font-semibold text-brand hover:text-brand-dark">
              Start one
            </Link>
            .
          </p>
        ) : (
          <div className="mt-6 flex flex-col gap-2">
            {topics.map((t) => (
              <Link
                key={t.id}
                href={`/forum/${t.id}`}
                className="flex flex-col gap-1 rounded-xl border border-ink/10 bg-white p-4 transition-colors hover:border-brand"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_STYLES[t.status] ?? "bg-ink/10 text-black"}`}
                  >
                    {STATUS_LABELS[t.status] ?? t.status}
                  </span>
                  <span className="text-xs font-medium uppercase tracking-wide text-black/50">{t.category.name}</span>
                </div>
                <p className="font-medium text-ink">{t.title}</p>
                {t.status === "rejected" && t.rejectionReason && (
                  <p className="text-sm text-red-700">{t.rejectionReason}</p>
                )}
                <p className="text-xs text-black/60">{formatDate(t.createdAt)}</p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </Container>
  );
}
