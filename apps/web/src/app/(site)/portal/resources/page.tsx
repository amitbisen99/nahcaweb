import Link from "next/link";
import { auth } from "@/auth";
import { getMemberResources } from "@/lib/store";
import { FileIcon } from "@/components/admin/icons";

// Video thumbnails are absolute (YouTube/Vimeo); an admin-uploaded one is a
// relative path off our own API, same as any other uploaded file.
function resolveThumbnailUrl(url: string): string {
  return url.startsWith("http") ? url : `${process.env.NEXT_PUBLIC_API_URL}${url}`;
}

export default async function PortalResourcesPage() {
  const session = await auth();
  const resources = session?.apiToken ? await getMemberResources(session.apiToken) : [];

  return (
    <div>
      <h1 className="font-heading text-3xl font-medium text-heading">Resources</h1>
      <p className="mt-2 text-black">Materials to support your work as a Hindu chaplain.</p>

      {resources.length > 0 && (
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {resources.map((r) => (
            <Link
              key={r.id}
              href={`/store/${r.id}`}
              className="overflow-hidden rounded-xl border border-ink/10 bg-white transition-colors hover:border-brand"
            >
              {r.thumbnailUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={resolveThumbnailUrl(r.thumbnailUrl)}
                  alt=""
                  className="aspect-video w-full object-cover"
                />
              ) : r.type === "file" ? (
                <div className="flex aspect-video w-full items-center justify-center bg-sand/40">
                  <FileIcon className="h-8 w-8 text-black/30" />
                </div>
              ) : (
                <div className="flex aspect-video w-full items-center justify-center bg-sand/40 text-xs font-semibold uppercase tracking-wide text-black/40">
                  Video
                </div>
              )}
              <div className="p-4">
                <p className="font-medium text-ink">{r.title}</p>
              </div>
            </Link>
          ))}
        </div>
      )}

      <div className="mt-6 rounded-xl border border-ink/10 bg-white p-6">
        <p className="text-sm text-black">Browse our public resource library for more.</p>
        <Link
          href="/about/resources"
          className="mt-3 inline-block text-sm font-semibold text-brand hover:text-brand-dark"
        >
          Visit Hindu Spiritual Care Resources →
        </Link>
      </div>
    </div>
  );
}
