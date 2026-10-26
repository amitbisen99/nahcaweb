import Link from "next/link";
import { Container } from "@/components/Container";
import { EventBanner } from "@/components/EventBanner";
import { getPublishedArticles } from "@/lib/api";
import { formatDate } from "@/lib/formatDate";

// Article bodies are rich-text HTML — strip tags before truncating so the
// list preview never shows raw markup or cuts off mid-tag.
function excerptOf(html: string, max = 220): string {
  const text = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  return text.length > max ? `${text.slice(0, max)}…` : text;
}

export default async function ArticlesPage() {
  const articles = await getPublishedArticles();

  return (
    <>
      <EventBanner title="Articles" image="/chaplaincy/colorful-palm-leaf-books.jpg" />
      <Container>
        <div className="py-12">
          {articles.length === 0 ? (
            <p className="text-sm text-black">No articles have been published yet — check back soon.</p>
          ) : (
            <div className="flex flex-col gap-4">
              {articles.map((a) => (
                <Link
                  key={a.id}
                  href={`/articles/${a.id}`}
                  className="rounded-xl border border-ink/10 bg-white p-5 transition-colors hover:border-brand"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="rounded-full bg-brand/10 px-2.5 py-0.5 text-xs font-semibold text-brand-dark">
                      {a.category}
                    </span>
                    <span className="text-xs text-black">{formatDate(a.createdAt)}</span>
                  </div>
                  <p className="mt-2 font-heading text-lg font-medium text-heading">{a.title}</p>
                  {a.richTextBody && (
                    <p className="mt-1 text-sm leading-relaxed text-black">{excerptOf(a.richTextBody)}</p>
                  )}
                  <span className="mt-2 inline-block text-sm font-semibold text-brand">Read more →</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </Container>
    </>
  );
}
