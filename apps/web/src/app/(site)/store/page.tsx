import Link from "next/link";
import { Container } from "@/components/Container";
import { listProducts } from "@/lib/store";
import { FileIcon } from "@/components/admin/icons";

const TYPE_LABELS = { video: "Video", file: "Download" } as const;

// Video thumbnails are absolute (YouTube/Vimeo); an admin-uploaded one is a
// relative path off our own API, same as any other uploaded file.
function resolveThumbnailUrl(url: string): string {
  return url.startsWith("http") ? url : `${process.env.NEXT_PUBLIC_API_URL}${url}`;
}

// Descriptions are rich-text HTML — strip tags before truncating so the
// card preview never shows raw markup or cuts off mid-tag.
function excerptOf(html: string, maxWords = 20): string {
  const text = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  const words = text.split(" ").filter(Boolean);
  return words.length > maxWords ? `${words.slice(0, maxWords).join(" ")}…` : text;
}

export default async function StorePage() {
  const products = await listProducts();

  return (
    <Container>
      <div className="py-12">
        <h1 className="font-heading text-3xl font-medium text-heading">Store</h1>
        <p className="mt-1 text-sm text-black">
          Videos and downloadable resources from NAHCA. Browse freely — you&rsquo;ll need to sign in to purchase.
        </p>

        {products.length === 0 ? (
          <p className="mt-6 text-sm text-black">Nothing for sale yet — check back soon.</p>
        ) : (
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((p) => (
              <Link
                key={p.id}
                href={`/store/${p.id}`}
                className="overflow-hidden rounded-xl border border-ink/10 bg-white transition-colors hover:border-brand"
              >
                {/* A static preview image only — never an embeddable/playable
                    link, so there's no way to watch from the card itself. */}
                {p.thumbnailUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={resolveThumbnailUrl(p.thumbnailUrl)}
                    alt=""
                    className="aspect-video w-full object-cover"
                  />
                ) : p.type === "file" ? (
                  <div className="flex aspect-video w-full items-center justify-center bg-sand/40">
                    <FileIcon className="h-10 w-10 text-black/30" />
                  </div>
                ) : (
                  <div className="flex aspect-video w-full items-center justify-center bg-sand/40 text-sm font-semibold uppercase tracking-wide text-black/40">
                    {TYPE_LABELS[p.type]}
                  </div>
                )}
                <div className="flex flex-col gap-2 p-5">
                  <span className="self-start rounded-full bg-sand px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide text-black">
                    {TYPE_LABELS[p.type]}
                  </span>
                  <p className="font-medium text-ink">{p.title}</p>
                  <p className="line-clamp-2 text-sm text-black/70">{excerptOf(p.description)}</p>
                  <p className="mt-1 text-sm font-semibold text-brand-dark">
                    ${(p.priceCents / 100).toFixed(2)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </Container>
  );
}
