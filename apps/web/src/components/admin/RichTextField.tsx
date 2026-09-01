"use client";

import { useEffect, useRef, useState } from "react";

const TOOLBAR: { label: string; command: string }[] = [
  { label: "B", command: "bold" },
  { label: "I", command: "italic" },
  { label: "U", command: "underline" },
  { label: "• List", command: "insertUnorderedList" },
  { label: "1. List", command: "insertOrderedList" },
];

export function RichTextField({
  name,
  label,
  currentValue,
  insertTags,
}: {
  name: string;
  label: string;
  currentValue?: string | null;
  // Extra toolbar buttons that insert literal text (e.g. "{{name}}") at
  // the cursor — used by the Receipt Email compose form for its dynamic
  // tags. Reuses the same execCommand path as the formatting buttons
  // above, just with "insertText" instead of a formatting command.
  insertTags?: { label: string; value: string }[];
}) {
  const editorRef = useRef<HTMLDivElement>(null);
  const initializedRef = useRef(false);
  const [html, setHtml] = useState(typeof currentValue === "string" ? currentValue : "");

  // Set the initial content imperatively, once — re-rendering the
  // contentEditable's children from React state on every keystroke would
  // reset the cursor to the start of the field.
  useEffect(() => {
    if (!initializedRef.current && editorRef.current) {
      editorRef.current.innerHTML = html;
      initializedRef.current = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function syncHtml() {
    setHtml(editorRef.current?.innerHTML ?? "");
  }

  function exec(command: string) {
    editorRef.current?.focus();
    document.execCommand(command);
    syncHtml();
  }

  function handleLink() {
    const url = window.prompt("Link URL");
    if (!url) return;
    editorRef.current?.focus();
    document.execCommand("createLink", false, url);
    syncHtml();
  }

  function insertTag(value: string) {
    editorRef.current?.focus();
    document.execCommand("insertText", false, value);
    syncHtml();
  }

  return (
    <div className="flex flex-col gap-1">
      <span className="text-sm font-medium text-black">{label}</span>
      <div className="flex flex-wrap gap-1 rounded-t-lg border border-b-0 border-ink/20 bg-sand/30 p-1.5">
        {TOOLBAR.map((btn) => (
          <button
            key={btn.command}
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => exec(btn.command)}
            className="rounded px-2 py-1 text-xs font-semibold text-black hover:bg-white"
          >
            {btn.label}
          </button>
        ))}
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={handleLink}
          className="rounded px-2 py-1 text-xs font-semibold text-black hover:bg-white"
        >
          Link
        </button>
        {insertTags && insertTags.length > 0 && (
          <>
            <span className="mx-1 w-px self-stretch bg-ink/15" />
            {insertTags.map((tag) => (
              <button
                key={tag.value}
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => insertTag(tag.value)}
                className="rounded border border-brand/30 bg-brand/5 px-2 py-1 text-xs font-semibold text-brand-dark hover:bg-brand/10"
              >
                + {tag.label}
              </button>
            ))}
          </>
        )}
      </div>
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={syncHtml}
        className="min-h-[140px] rounded-b-lg border border-ink/20 bg-white px-3 py-2 text-sm leading-relaxed focus:border-brand focus:outline-none [&_a]:text-brand [&_a]:underline [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:pl-5"
      />
      <input type="hidden" name={name} value={html} />
    </div>
  );
}
