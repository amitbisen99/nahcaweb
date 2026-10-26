import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/Container";
import { getPublishedArticle } from "@/lib/api";
import { formatDate } from "@/lib/formatDate";

export default async function ArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const articleId = Number(id);
  if (!Number.isInteger(articleId)) notFound();

  const article = await getPublishedArticle(articleId);
  if (!article) notFound();

  return (
    <Container>
      <div className="mx-auto max-w-3xl py-12">
        <Link href="/articles" className="text-sm font-semibold text-brand hover:text-brand-dark">
          ← Articles
        </Link>
        <div className="mt-4 flex items-center gap-3">
          <span className="rounded-full bg-brand/10 px-2.5 py-0.5 text-xs font-semibold text-brand-dark">
            {article.category}
          </span>
          <span className="text-xs text-black">{formatDate(article.createdAt)}</span>
        </div>
        <h1 className="mt-2 font-heading text-3xl font-medium text-heading">{article.title}</h1>
        {article.richTextBody && (
          <div
            className="mt-4 text-base leading-relaxed text-black [&_a]:text-brand [&_a]:underline [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:pl-5"
            dangerouslySetInnerHTML={{ __html: article.richTextBody }}
          />
        )}
      </div>
    </Container>
  );
}
