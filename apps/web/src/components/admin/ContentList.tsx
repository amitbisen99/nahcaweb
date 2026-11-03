import type { ContentTypeConfig } from "@/lib/contentTypes";
import { ContentRowActions } from "@/components/admin/ContentRowActions";

// The rows of one content type's admin list — shared by the Website Content
// list pages and the tabs of the Resources page.
export function ContentList({
  config,
  items,
}: {
  config: ContentTypeConfig;
  items: Record<string, unknown>[];
}) {
  return (
    <div className="flex flex-col gap-3">
      {items.length === 0 && <p className="text-sm text-black">No {config.label.toLowerCase()} yet.</p>}
      {items.map((item) => (
        <div
          key={String(item.id)}
          className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-ink/10 bg-white p-4"
        >
          <div>
            <p className="font-medium text-ink">
              {String(item[config.titleField])}
              {(config.key === "events" || config.key === "webinars") && typeof item.eventCode === "string" && (
                <span className="ml-2 rounded bg-sand px-1.5 py-0.5 font-mono text-xs font-normal text-black/70">
                  {item.eventCode}
                </span>
              )}
            </p>
            <span
              className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${
                item.published ? "bg-forest/10 text-forest" : "bg-ink/10 text-black"
              }`}
            >
              {item.published ? "Published" : "Draft"}
            </span>
          </div>
          <ContentRowActions type={config.key} item={item} config={config} />
        </div>
      ))}
    </div>
  );
}
