"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/Button";
import type { ResourceFormState } from "@/app/admin/content/resources/actions";
import { RESOURCE_PAGES, RESOURCE_SECTIONS } from "@/lib/resourceSections";
import { ContentFileField } from "./ContentFileField";
import { DateField } from "./DateField";
import { RichTextField } from "./RichTextField";

const initialState: ResourceFormState = {};

const INPUT_CLASS = "rounded-lg border border-ink/20 bg-white px-3 py-2 focus:border-brand focus:outline-none";

export interface ResourceFormItem {
  title?: string;
  description?: string | null;
  fileUrl?: string | null;
  websiteUrl?: string | null;
  podcastUrl?: string | null;
  videoUrl?: string | null;
  embedCode?: string | null;
  publishedDate?: string | null;
  tags?: string[];
  pages?: string[];
  published?: boolean;
}

function TextBox({
  name,
  label,
  defaultValue,
  placeholder,
  helpText,
}: {
  name: string;
  label: string;
  defaultValue?: string | null;
  placeholder?: string;
  helpText?: string;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-sm font-medium text-black">{label}</span>
      {helpText && <span className="text-xs text-black/60">{helpText}</span>}
      <input type="text" name={name} defaultValue={defaultValue ?? ""} placeholder={placeholder} className={INPUT_CLASS} />
    </label>
  );
}

function CheckboxGroup({
  title,
  helpText,
  name,
  options,
  selected,
  onToggle,
}: {
  title: string;
  helpText: string;
  name: string;
  options: { slug: string; title: string }[];
  selected: string[];
  onToggle?: (slug: string, checked: boolean) => void;
}) {
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="text-sm font-medium text-black">{title}</legend>
      <p className="text-xs text-black/60">{helpText}</p>
      <div className="mt-1 grid gap-2 sm:grid-cols-2">
        {options.map((option) => (
          <label
            key={option.slug}
            className="flex items-center gap-2 rounded-lg border border-ink/10 bg-white px-3 py-2 text-sm text-black"
          >
            <input
              type="checkbox"
              name={name}
              value={option.slug}
              checked={selected.includes(option.slug)}
              onChange={(e) => onToggle?.(option.slug, e.target.checked)}
            />
            {option.title}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export function ResourceForm({
  action,
  item,
}: {
  action: (prevState: ResourceFormState, formData: FormData) => Promise<ResourceFormState>;
  item?: ResourceFormItem;
}) {
  const [state, formAction, isPending] = useActionState(action, initialState);
  const [tags, setTags] = useState<string[]>(item?.tags ?? []);
  const [pages, setPages] = useState<string[]>(item?.pages ?? []);

  const toggle = (setter: (fn: (current: string[]) => string[]) => void) => (slug: string, checked: boolean) =>
    setter((current) => (checked ? [...current, slug] : current.filter((s) => s !== slug)));

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium text-black">Title</span>
        <input type="text" name="title" required defaultValue={item?.title ?? ""} className={INPUT_CLASS} />
      </label>

      <RichTextField name="description" label="Description" currentValue={item?.description ?? null} />

      <ContentFileField
        name="fileUrl"
        label="Upload PDF"
        accept="application/pdf"
        uploadLabel="Upload PDF"
        helpText="PDF, up to 10 MB."
        currentValue={item?.fileUrl ?? null}
      />

      <TextBox
        name="websiteUrl"
        label="Website Link"
        defaultValue={item?.websiteUrl}
        placeholder="https://example.org/"
      />
      <TextBox
        name="podcastUrl"
        label="Podcast Link"
        defaultValue={item?.podcastUrl}
        helpText="YouTube or Vimeo links play on the page; any other link is shown as a button."
      />
      <TextBox
        name="videoUrl"
        label="Video Link"
        defaultValue={item?.videoUrl}
        helpText="YouTube or Vimeo links play on the page; any other link is shown as a button."
      />

      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium text-black">Embedded Code</span>
        <span className="text-xs text-black/60">
          Paste the &lt;iframe&gt; embed code. It takes the place of the automatic player built from a podcast or video link.
        </span>
        <textarea name="embedCode" rows={4} defaultValue={item?.embedCode ?? ""} className={INPUT_CLASS} />
      </label>

      <CheckboxGroup
        title="Add Tags"
        helpText="The resource appears in every Resource Library section you tick."
        name="tags"
        options={RESOURCE_SECTIONS}
        selected={tags}
        onToggle={toggle(setTags)}
      />

      {tags.includes("newsletters") && (
        <DateField name="publishedDate" label="Published Date (newsletters)" currentValue={item?.publishedDate ?? null} />
      )}

      <CheckboxGroup
        title="Select webpage to show"
        helpText="The resource also appears on every “Resources for…” page you tick."
        name="pages"
        options={RESOURCE_PAGES}
        selected={pages}
        onToggle={toggle(setPages)}
      />

      <label className="flex items-center gap-2 text-sm font-medium text-black">
        <input type="checkbox" name="published" defaultChecked={item ? Boolean(item.published) : true} />
        Published
      </label>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      <div className="mt-2 flex items-center gap-4">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving…" : "Save"}
        </Button>
        <Link href="/admin/content/resources" className="text-sm font-semibold text-black/60 hover:text-ink">
          Cancel
        </Link>
      </div>
    </form>
  );
}
