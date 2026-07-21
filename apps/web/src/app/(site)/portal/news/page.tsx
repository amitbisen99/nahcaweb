import { getPublishedArticles, getPublishedNewsletters } from "@/lib/api";

interface NewsItem {
  id: string;
  title: string;
  date: string;
  kind: "Newsletter" | "Article";
  meta?: string;
  href?: string;
  excerpt?: string;
}

function excerptOf(html: string, max = 200): string {
  const text = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  return text.length > max ? `${text.slice(0, max)}…` : text;
}

export default async function PortalNewsPage() {
  const [newsletters, articles] = await Promise.all([getPublishedNewsletters(), getPublishedArticles()]);

  const items: NewsItem[] = [
    ...newsletters.map((n) => ({
      id: `newsletter-${n.id}`,
      title: n.title,
      date: n.publishedDate ?? n.createdAt,
      kind: "Newsletter" as const,
      href: n.fileUrl ? `${process.env.NEXT_PUBLIC_API_URL}${n.fileUrl}` : n.mailchimpCampaignUrl ?? undefined,
    })),
    ...articles.map((a) => ({
      id: `article-${a.id}`,
      title: a.title,
      date: a.createdAt,
      kind: "Article" as const,
      meta: a.category,
      excerpt: a.richTextBody ? excerptOf(a.richTextBody) : undefined,
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div>
      <h1 className="font-heading text-3xl font-medium text-heading">News and Updates</h1>
      <p className="mt-2 text-ink/70">The latest newsletters and articles from NAHCA.</p>

      {items.length === 0 ? (
        <p className="mt-6 text-sm text-ink/60">Nothing published yet — check back soon.</p>
      ) : (
        <div className="mt-6 flex flex-col gap-3">
          {items.map((item) => (
            <div key={item.id} className="rounded-xl border border-ink/10 bg-white p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="rounded-full bg-brand/10 px-2.5 py-0.5 text-xs font-semibold text-brand-dark">
                  {item.meta ?? item.kind}
                </span>
                <span className="text-xs text-ink/50">{new Date(item.date).toDateString()}</span>
              </div>
              <p className="mt-2 font-heading text-base font-medium text-heading">{item.title}</p>
              {item.excerpt && <p className="mt-1 text-sm leading-relaxed text-ink/70">{item.excerpt}</p>}
              {item.href && (
                <a
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-block text-sm font-semibold text-brand hover:text-brand-dark"
                >
                  Read more →
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
