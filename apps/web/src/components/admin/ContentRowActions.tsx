"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import type { ContentTypeConfig, ContentTypeKey } from "@/lib/contentTypes";
import { deleteContentItem, publishContentItem } from "@/app/admin/content/actions";
import { EyeIcon, PencilIcon, TrashIcon, XIcon, isImageUrl } from "./icons";

function formatValue(value: unknown, type: string): string {
  if (value === null || value === undefined || value === "") return "—";
  if (type === "date") {
    const d = new Date(value as string);
    return Number.isNaN(d.getTime()) ? String(value) : d.toDateString();
  }
  return String(value);
}

export function ContentRowActions({
  type,
  item,
  config,
}: {
  type: ContentTypeKey;
  item: Record<string, unknown>;
  config: ContentTypeConfig;
}) {
  const [viewing, setViewing] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    if (!confirm(`Delete this ${config.singularLabel.toLowerCase()}? This can't be undone.`)) {
      return;
    }
    startTransition(() => {
      deleteContentItem(type, String(item.id));
    });
  }

  function handlePublish() {
    startTransition(() => {
      publishContentItem(type, String(item.id));
    });
  }

  const detailFields = config.fields.filter(
    (f) => f.name !== config.titleField && f.type !== "checkbox"
  );

  return (
    <>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setViewing(true)}
          aria-label="View"
          title="View"
          className="text-ink/50 transition-colors hover:text-brand"
        >
          <EyeIcon className="h-[18px] w-[18px]" />
        </button>
        <Link
          href={`/admin/content/${type}/${item.id}`}
          aria-label="Edit"
          title="Edit"
          className="text-ink/50 transition-colors hover:text-brand"
        >
          <PencilIcon className="h-[18px] w-[18px]" />
        </Link>
        <button
          type="button"
          onClick={handleDelete}
          disabled={isPending}
          aria-label="Delete"
          title="Delete"
          className="text-ink/50 transition-colors hover:text-red-600 disabled:opacity-50"
        >
          <TrashIcon className="h-[18px] w-[18px]" />
        </button>
      </div>

      {viewing && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4"
          onClick={() => setViewing(false)}
        >
          <div
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <h2 className="font-heading text-2xl font-medium text-heading">
                {String(item[config.titleField])}
              </h2>
              <button
                type="button"
                onClick={() => setViewing(false)}
                aria-label="Close"
                className="flex-none text-ink/40 hover:text-ink"
              >
                <XIcon className="h-6 w-6" />
              </button>
            </div>

            <span
              className={`mt-3 inline-block rounded-full px-2.5 py-1 text-xs font-semibold ${
                item.published ? "bg-forest/10 text-forest" : "bg-ink/10 text-ink/60"
              }`}
            >
              {item.published ? "Published" : "Draft"}
            </span>

            <dl className="mt-6 flex flex-col gap-5">
              {detailFields.map((field) => {
                const value = item[field.name];
                if (value === null || value === undefined || value === "") return null;

                return (
                  <div key={field.name}>
                    <dt className="text-xs font-semibold uppercase tracking-wide text-ink/50">
                      {field.label}
                    </dt>
                    <dd className="mt-1.5 text-base leading-relaxed text-ink/80">
                      {field.type === "file" && typeof value === "string" ? (
                        isImageUrl(value) ? (
                          <img
                            src={`${process.env.NEXT_PUBLIC_API_URL}${value}`}
                            alt=""
                            className="mt-1 h-40 w-40 rounded-lg border border-ink/10 object-cover"
                          />
                        ) : (
                          <a
                            href={`${process.env.NEXT_PUBLIC_API_URL}${value}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-semibold text-brand hover:text-brand-dark"
                          >
                            View file
                          </a>
                        )
                      ) : (
                        formatValue(value, field.type)
                      )}
                    </dd>
                  </div>
                );
              })}
            </dl>

            <div className="mt-8 flex items-center gap-3 border-t border-ink/10 pt-6">
              {!item.published && (
                <button
                  type="button"
                  onClick={handlePublish}
                  disabled={isPending}
                  className="rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-dark disabled:opacity-50"
                >
                  {isPending ? "Publishing…" : "Publish"}
                </button>
              )}
              <Link
                href={`/admin/content/${type}/${item.id}`}
                className="ml-auto text-sm font-semibold text-brand hover:text-brand-dark"
              >
                Edit →
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
