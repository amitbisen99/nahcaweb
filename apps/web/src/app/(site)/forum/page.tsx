import Link from "next/link";
import { Container } from "@/components/Container";
import { auth } from "@/auth";
import { getForumCategories, listForumTopics } from "@/lib/forum";
import { formatDate } from "@/lib/formatDate";

const PAGE_SIZE = 20;

function buildQuery(params: Record<string, string | undefined>) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value) search.set(key, value);
  }
  const query = search.toString();
  return query ? `?${query}` : "";
}

export default async function ForumPage({
  searchParams,
}: {
  searchParams: Promise<{ categoryId?: string; search?: string; page?: string }>;
}) {
  const { categoryId, search, page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);

  const session = await auth();
  const token = session?.apiToken ?? "";

  const [categories, { topics, total }] = await Promise.all([
    getForumCategories(token),
    listForumTopics(token, { categoryId: categoryId ? Number(categoryId) : undefined, search, page, pageSize: PAGE_SIZE }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const filters = { categoryId, search };

  return (
    <Container>
      <div className="py-12">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="font-heading text-3xl font-medium text-heading">Forum</h1>
            <p className="mt-1 text-sm text-black">
              Discuss with other NAHCA members and general users. New topics are reviewed before they go live.
            </p>
          </div>
          <div className="flex gap-2">
            <Link
              href="/forum/my-topics"
              className="rounded-lg border border-ink/20 px-4 py-2 text-sm font-semibold text-black hover:border-brand"
            >
              My Topics
            </Link>
            <Link
              href="/forum/new"
              className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark"
            >
              New Topic
            </Link>
          </div>
        </div>

        <form className="mt-6 flex flex-wrap items-end gap-3 rounded-xl border border-ink/10 bg-white p-4">
          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-black">Search</span>
            <input
              type="text"
              name="search"
              defaultValue={search ?? ""}
              placeholder="Search topics"
              className="rounded-lg border border-ink/20 px-3 py-1.5 text-sm focus:border-brand focus:outline-none"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-black">Category</span>
            <select
              name="categoryId"
              defaultValue={categoryId ?? ""}
              className="rounded-lg border border-ink/20 px-3 py-1.5 text-sm focus:border-brand focus:outline-none"
            >
              <option value="">All categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          <button
            type="submit"
            className="rounded-lg bg-brand px-4 py-1.5 text-sm font-semibold text-white hover:bg-brand-dark"
          >
            Search
          </button>
          {(categoryId || search) && (
            <Link href="/forum" className="text-sm font-semibold text-black/60 hover:text-black">
              Clear filters
            </Link>
          )}
        </form>

        {topics.length === 0 ? (
          <p className="mt-6 text-sm text-black">
            {categoryId || search ? "No topics match these filters." : "No topics yet — be the first to post."}
          </p>
        ) : (
          <>
            <div className="mt-6 flex flex-col gap-2">
              {topics.map((t) => (
                <Link
                  key={t.id}
                  href={`/forum/${t.id}`}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-ink/10 bg-white p-4 transition-colors hover:border-brand"
                >
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      {t.pinned && (
                        <span className="rounded-full bg-brand/10 px-2 py-0.5 text-xs font-semibold text-brand-dark">
                          Pinned
                        </span>
                      )}
                      {t.visibility === "members_only" && (
                        <span className="rounded-full bg-sand px-2 py-0.5 text-xs font-semibold text-black">
                          Members only
                        </span>
                      )}
                      {t.locked && (
                        <span className="rounded-full bg-ink/10 px-2 py-0.5 text-xs font-semibold text-black">
                          Locked
                        </span>
                      )}
                      <span className="text-xs font-medium uppercase tracking-wide text-black/50">
                        {t.category.name}
                      </span>
                    </div>
                    <p className="mt-1 font-medium text-ink">{t.title}</p>
                    <p className="mt-0.5 text-xs text-black/60">
                      by {t.author.name} · {formatDate(t.createdAt)}
                    </p>
                  </div>
                  <span className="whitespace-nowrap text-sm text-black/60">
                    {t._count.replies} {t._count.replies === 1 ? "reply" : "replies"}
                  </span>
                </Link>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="mt-4 flex items-center justify-between text-sm">
                <p className="text-black">
                  Page {page} of {totalPages}
                </p>
                <div className="flex gap-2">
                  <Link
                    href={`/forum${buildQuery({ ...filters, page: String(page - 1) })}`}
                    aria-disabled={page <= 1}
                    className={`rounded-lg border border-ink/20 px-3 py-1.5 font-medium ${
                      page <= 1 ? "pointer-events-none text-black/30" : "text-black transition-colors hover:border-brand"
                    }`}
                  >
                    ← Previous
                  </Link>
                  <Link
                    href={`/forum${buildQuery({ ...filters, page: String(page + 1) })}`}
                    aria-disabled={page >= totalPages}
                    className={`rounded-lg border border-ink/20 px-3 py-1.5 font-medium ${
                      page >= totalPages
                        ? "pointer-events-none text-black/30"
                        : "text-black transition-colors hover:border-brand"
                    }`}
                  >
                    Next →
                  </Link>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </Container>
  );
}
