import { ContentTypeConfig } from "@/lib/contentTypes";
import { Button } from "@/components/Button";
import { ContentFileField } from "./ContentFileField";
import { TimeField } from "./TimeField";
import { RichTextField } from "./RichTextField";

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
          return (
            <ContentFileField
              key={field.name}
              name={field.name}
              label={field.label}
              currentValue={typeof currentValue === "string" ? currentValue : null}
            />
          );
        }

        if (field.type === "time") {
          return (
            <TimeField
              key={field.name}
              name={field.name}
              label={field.label}
              currentValue={typeof currentValue === "string" ? currentValue : null}
            />
          );
        }

        if (field.type === "richtext") {
          return (
            <RichTextField
              key={field.name}
              name={field.name}
              label={field.label}
              currentValue={typeof currentValue === "string" ? currentValue : null}
            />
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
                {field.options?.map((opt) => {
                  const value = typeof opt === "string" ? opt : opt.value;
                  const label = typeof opt === "string" ? opt : opt.label;
                  return (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  );
                })}
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
