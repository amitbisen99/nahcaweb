import { Button } from "@/components/Button";
import { auth } from "@/auth";
import { listContent } from "@/lib/adminApi";
import { pageTitle, sectionTitle } from "@/lib/resourceSections";
import { formatDate } from "@/lib/formatDate";
import { ResourceRowActions } from "@/components/admin/ResourceRowActions";

const CHIP = "rounded-full px-2 py-0.5 text-xs font-semibold";

export default async function AdminResourcesPage() {
  const session = await auth();
  const items = await listContent("resources", session?.apiToken ?? "");

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-medium text-heading">Resources</h1>
          <p className="mt-2 text-black">
            Everything shown in the website&rsquo;s Resource Library and on the &ldquo;Resources for&hellip;&rdquo; pages.
          </p>
        </div>
        <Button href="/admin/content/resources/new">+ Add Resource</Button>
      </div>

      <div className="mt-8 flex flex-col gap-3">
        {items.length === 0 && <p className="text-sm text-black">No resources yet.</p>}
        {items.map((item) => {
          const tags = Array.isArray(item.tags) ? (item.tags as string[]) : [];
          const pages = Array.isArray(item.pages) ? (item.pages as string[]) : [];
          return (
            <div
              key={String(item.id)}
              className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-ink/10 bg-white p-4"
            >
              <div className="min-w-0 flex-1">
                <p className="font-medium text-ink">{String(item.title)}</p>
                <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                  <span
                    className={`${CHIP} ${item.published ? "bg-forest/10 text-forest" : "bg-ink/10 text-black"}`}
                  >
                    {item.published ? "Published" : "Draft"}
                  </span>
                  {tags.map((tag) => (
                    <span key={tag} className={`${CHIP} bg-brand/10 text-brand-dark`}>
                      {sectionTitle(tag)}
                    </span>
                  ))}
                  {pages.map((page) => (
                    <span key={page} className={`${CHIP} bg-sand text-black`}>
                      {pageTitle(page)}
                    </span>
                  ))}
                  {tags.length === 0 && pages.length === 0 && (
                    <span className="text-xs text-black/60">Not shown anywhere — pick a tag or page.</span>
                  )}
                  {typeof item.publishedDate === "string" && (
                    <span className="text-xs text-black/60">{formatDate(item.publishedDate)}</span>
                  )}
                </div>
              </div>
              <ResourceRowActions id={Number(item.id)} title={String(item.title)} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
