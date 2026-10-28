import { Container } from "@/components/Container";
import { EventBanner } from "@/components/EventBanner";
import { getPublishedNewsletters } from "@/lib/api";
import { formatDate } from "@/lib/formatDate";

export default async function NewslettersPage() {
  const newsletters = await getPublishedNewsletters();

  // Newest first by the date shown on each one, which the admin can set to
  // the issue's date; falls back to when it was added.
  const sorted = [...newsletters].sort(
    (a, b) =>
      new Date(b.publishedDate ?? b.createdAt).getTime() - new Date(a.publishedDate ?? a.createdAt).getTime()
  );

  return (
    <>
      <EventBanner title="Newsletters" image="/brand/temple-home.jpg" />
      <Container>
        <div className="py-12">
          {sorted.length === 0 ? (
            <p className="text-sm text-black">No newsletters have been published yet — check back soon.</p>
          ) : (
            <div className="flex flex-col gap-4">
              {sorted.map((n) => {
                // Older newsletters may only have the Mailchimp link they were
                // saved with before that field was removed from the admin form.
                const href = n.fileUrl ? `${process.env.NEXT_PUBLIC_API_URL}${n.fileUrl}` : n.mailchimpCampaignUrl;
                const card = (
                  <>
                    <span className="text-xs text-black">{formatDate(n.publishedDate ?? n.createdAt)}</span>
                    <p className="mt-1 font-heading text-lg font-medium text-heading">{n.title}</p>
                    {href && <span className="mt-2 inline-block text-sm font-semibold text-brand">Read newsletter →</span>}
                  </>
                );
                const className = "rounded-xl border border-ink/10 bg-white p-5";
                return href ? (
                  <a
                    key={n.id}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${className} transition-colors hover:border-brand`}
                  >
                    {card}
                  </a>
                ) : (
                  <div key={n.id} className={className}>
                    {card}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </Container>
    </>
  );
}
