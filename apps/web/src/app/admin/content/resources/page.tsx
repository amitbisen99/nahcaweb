import Link from "next/link";
import { Button } from "@/components/Button";
import { auth } from "@/auth";
import { CONTENT_TYPES, ContentTypeKey, RESOURCE_TAB_KEYS } from "@/lib/contentTypes";
import { listContent } from "@/lib/adminApi";
import { ContentList } from "@/components/admin/ContentList";

export default async function AdminResourcesPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const { tab } = await searchParams;
  const activeKey: ContentTypeKey = RESOURCE_TAB_KEYS.includes(tab as ContentTypeKey)
    ? (tab as ContentTypeKey)
    : RESOURCE_TAB_KEYS[0];
  const config = CONTENT_TYPES[activeKey];

  const session = await auth();
  const items = await listContent(activeKey, session?.apiToken ?? "");

  return (
    <div>
      <h1 className="font-heading text-3xl font-medium text-heading">Resources</h1>
      <p className="mt-2 text-black">
        Everything shown on the website&rsquo;s Resources page. Pick a type, then add or remove items.
      </p>

      <div className="mt-6 flex flex-wrap gap-1 border-b border-ink/10">
        {RESOURCE_TAB_KEYS.map((key) => (
          <Link
            key={key}
            href={`/admin/content/resources?tab=${key}`}
            className={`-mb-px border-b-2 px-4 py-2.5 text-sm font-semibold transition-colors ${
              key === activeKey
                ? "border-brand text-brand"
                : "border-transparent text-black hover:border-ink/20 hover:text-ink"
            }`}
          >
            {CONTENT_TYPES[key].label}
          </Link>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
        <h2 className="font-heading text-xl font-medium text-heading">{config.label}</h2>
        <Button href={`/admin/content/${activeKey}/new`}>+ Add {config.singularLabel}</Button>
      </div>

      <div className="mt-4">
        <ContentList config={config} items={items} />
      </div>
    </div>
  );
}
