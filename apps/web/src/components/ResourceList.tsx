import Link from "next/link";
import type { CmsResource } from "@/lib/cms";
import { getResourceEmbed } from "@/lib/resourceEmbed";
import { formatDate } from "@/lib/formatDate";

const LINK_CLASS = "inline-block text-sm font-semibold text-brand hover:text-brand-dark";

// Rich-text bodies are HTML — strip the tags before cutting a preview, so it never
// shows raw markup or stops halfway through a tag.
function plainText(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// The player for a resource — the iframe from its embed code, else one built
// from a YouTube/Vimeo podcast or video link. Kept to a medium width rather than
// stretching across the whole page.
export function ResourcePlayer({ item }: { item: CmsResource }) {
  const embed = getResourceEmbed(item);
  if (!embed) return null;
  return (
    <div
      className={`mt-4 w-full max-w-xl overflow-hidden rounded-lg ${embed.height ? "" : "aspect-video"}`}
      style={embed.height ? { height: embed.height } : undefined}
    >
      <iframe
        src={embed.src}
        title={item.title}
        loading="lazy"
        allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
        allowFullScreen
        className="h-full w-full border-0"
      />
    </div>
  );
}

// The buttons to open whatever the resource has: its PDF and any links.
export function ResourceLinks({ item }: { item: CmsResource }) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const hasPlayer = getResourceEmbed(item) !== null;
  const links: { href: string; label: string }[] = [];

  if (item.fileUrl) {
    links.push({
      href: `${apiUrl}${item.fileUrl}`,
      label: item.tags.includes("newsletters") ? "Read newsletter →" : "View PDF →",
    });
  }
  if (item.websiteUrl) links.push({ href: item.websiteUrl, label: "Visit website →" });
  if (item.podcastUrl) {
    links.push({ href: item.podcastUrl, label: hasPlayer ? "Open podcast in a new tab →" : "Listen →" });
  }
  if (item.videoUrl) {
    links.push({ href: item.videoUrl, label: hasPlayer ? "Open video in a new tab →" : "Watch →" });
  }

  if (links.length === 0) return null;
  return (
    <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2">
      {links.map((link) => (
        <a key={link.label} href={link.href} target="_blank" rel="noopener noreferrer" className={LINK_CLASS}>
          {link.label}
        </a>
      ))}
    </div>
  );
}

export function ResourceList({
  items,
  emptyText = "Nothing has been added here yet — check back soon.",
}: {
  items: CmsResource[];
  emptyText?: string;
}) {
  if (items.length === 0) return <p className="mt-8 text-sm text-black">{emptyText}</p>;

  return (
    <div className="mt-8 flex flex-col gap-5">
      {items.map((item) => {
        const preview = item.description ? plainText(item.description) : "";
        const excerpt = preview.length > 260 ? `${preview.slice(0, 260)}…` : preview;
        const date = item.publishedDate;
        return (
          <article key={item.id} className="rounded-xl border border-ink/10 bg-white p-6">
            {date && <p className="mb-2 text-xs text-black">{formatDate(date)}</p>}
            <h2 className="font-heading text-lg font-medium text-heading">{item.title}</h2>
            {excerpt && <p className="mt-2 text-sm leading-relaxed text-black">{excerpt}</p>}
            {preview.length > 260 && (
              <Link href={`/resources/item/${item.id}`} className={`mt-2 ${LINK_CLASS}`}>
                Read more →
              </Link>
            )}

            <ResourcePlayer item={item} />
            <ResourceLinks item={item} />
          </article>
        );
      })}
    </div>
  );
}
