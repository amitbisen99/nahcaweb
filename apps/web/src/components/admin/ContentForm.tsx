import { ContentTypeConfig } from "@/lib/contentTypes";
import { Button } from "@/components/Button";
import { ContentFileField } from "./ContentFileField";
import { TimeField } from "./TimeField";
import { RichTextField } from "./RichTextField";
import { SpeakersField } from "./SpeakersField";

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
            <label key={field.name} className="flex items-center gap-2 text-sm font-medium text-black">
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
              helpText={field.helpText}
              currentValue={typeof currentValue === "string" ? currentValue : null}
            />
          );
        }

        if (field.type === "speakers") {
          return (
            <SpeakersField
              key={field.name}
              name={field.name}
              label={field.label}
              currentValue={currentValue}
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
              <span className="text-sm font-medium text-black">{field.label}</span>
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
              <span className="text-sm font-medium text-black">{field.label}</span>
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

        if (field.type === "currency") {
          // Stored in cents (same convention as every other price field in
          // this app) but entered/shown in dollars — matches how the
          // bespoke MembershipPlanForm handles price, unlike this generic
          // form's "number" type, which submits the raw value as-is.
          const dollars = typeof currentValue === "number" ? (currentValue / 100).toFixed(2) : "";
          return (
            <label key={field.name} className="flex flex-col gap-1">
              <span className="text-sm font-medium text-black">{field.label}</span>
              <input
                type="number"
                name={field.name}
                min={0}
                step={0.01}
                required={field.required}
                defaultValue={dollars}
                className="rounded-lg border border-ink/20 bg-white px-3 py-2 focus:border-brand focus:outline-none"
              />
              {field.helpText && <span className="text-xs text-black/60">{field.helpText}</span>}
            </label>
          );
        }

        return (
          <label key={field.name} className="flex flex-col gap-1">
            <span className="text-sm font-medium text-black">{field.label}</span>
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
