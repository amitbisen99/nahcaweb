import { ContentTypeConfig } from "@/lib/contentTypes";
import { Button } from "@/components/Button";
import { isImageUrl } from "./icons";

function dateInputValue(value: unknown): string {
  if (!value) return "";
  const d = new Date(value as string);
  return Number.isNaN(d.getTime()) ? "" : d.toISOString().slice(0, 10);
}

export function ContentForm({
  config,
  action,
  item,
}: {
  config: ContentTypeConfig;
  action: (formData: FormData) => Promise<void>;
  item?: Record<string, unknown>;
}) {
  return (
    <form action={action} className="flex flex-col gap-5">
      {config.fields.map((field) => {
        const currentValue = item?.[field.name];

        if (field.type === "checkbox") {
          return (
            <label key={field.name} className="flex items-center gap-2 text-sm font-medium text-ink/80">
              <input type="checkbox" name={field.name} defaultChecked={Boolean(currentValue)} />
              {field.label}
            </label>
          );
        }

        if (field.type === "file") {
          const hasCurrent = typeof currentValue === "string" && currentValue.length > 0;
          return (
            <div key={field.name} className="flex flex-col gap-2">
              <span className="text-sm font-medium text-ink/80">{field.label}</span>

              {hasCurrent && (
                <div className="flex items-center gap-3">
                  {isImageUrl(currentValue as string) ? (
                    <img
                      src={`${process.env.NEXT_PUBLIC_API_URL}${currentValue}`}
                      alt=""
                      className="h-20 w-20 rounded-lg border border-ink/10 object-cover"
                    />
                  ) : (
                    <a
                      href={`${process.env.NEXT_PUBLIC_API_URL}${currentValue}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-semibold text-brand hover:text-brand-dark"
                    >
                      View current file
                    </a>
                  )}
                  <label className="flex items-center gap-1.5 text-xs font-medium text-ink/60">
                    <input type="checkbox" name={`${field.name}__remove`} />
                    Remove this file
                  </label>
                </div>
              )}

              <input
                type="file"
                name={field.name}
                className="rounded-lg border border-ink/20 bg-white px-3 py-2 text-sm"
              />
            </div>
          );
        }

        if (field.type === "textarea") {
          return (
            <label key={field.name} className="flex flex-col gap-1">
              <span className="text-sm font-medium text-ink/80">{field.label}</span>
              <textarea
                name={field.name}
                required={field.required}
                defaultValue={typeof currentValue === "string" ? currentValue : ""}
                rows={5}
                className="rounded-lg border border-ink/20 bg-white px-3 py-2 focus:border-brand focus:outline-none"
              />
            </label>
          );
        }

        if (field.type === "select") {
          return (
            <label key={field.name} className="flex flex-col gap-1">
              <span className="text-sm font-medium text-ink/80">{field.label}</span>
              <select
                name={field.name}
                required={field.required}
                defaultValue={typeof currentValue === "string" ? currentValue : ""}
                className="rounded-lg border border-ink/20 bg-white px-3 py-2 focus:border-brand focus:outline-none"
              >
                <option value="" disabled>
                  Select...
                </option>
                {field.options?.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </label>
          );
        }

        return (
          <label key={field.name} className="flex flex-col gap-1">
            <span className="text-sm font-medium text-ink/80">{field.label}</span>
            <input
              type={field.type === "date" ? "date" : field.type === "number" ? "number" : "text"}
              name={field.name}
              required={field.required}
              defaultValue={
                field.type === "date"
                  ? dateInputValue(currentValue)
                  : typeof currentValue === "string" || typeof currentValue === "number"
                    ? currentValue
                    : ""
              }
              className="rounded-lg border border-ink/20 bg-white px-3 py-2 focus:border-brand focus:outline-none"
            />
          </label>
        );
      })}

      <Button type="submit" className="mt-2 self-start">
        Save
      </Button>
    </form>
  );
}
