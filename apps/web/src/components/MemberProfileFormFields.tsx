"use client";

// Shared presentational bits for the member questionnaire, used by both the
// public signup form (app/(site)/membership/join/JoinForm.tsx) and the admin
// member view/edit form (components/admin/MemberProfileForm.tsx).

import { ReactNode } from "react";

export function fieldLabelClass() {
  return "text-sm font-medium text-black";
}

export function inputClass() {
  return "rounded-lg border border-ink/20 bg-white px-3 py-2 focus:border-brand focus:outline-none";
}

export function YesNoRadio({
  name,
  value,
  onChange,
}: {
  name: string;
  value: "" | "yes" | "no";
  onChange: (value: "yes" | "no") => void;
}) {
  return (
    <div className="flex gap-5">
      <label className="flex items-center gap-2 text-sm text-black">
        <input type="radio" name={name} checked={value === "yes"} onChange={() => onChange("yes")} />
        Yes
      </label>
      <label className="flex items-center gap-2 text-sm text-black">
        <input type="radio" name={name} checked={value === "no"} onChange={() => onChange("no")} />
        No
      </label>
    </div>
  );
}

export function CheckboxGrid({
  options,
  selected,
  onToggle,
}: {
  options: string[];
  selected: string[];
  onToggle: (value: string) => void;
}) {
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {options.map((option) => (
        <label key={option} className="flex items-start gap-2 text-sm text-black">
          <input
            type="checkbox"
            className="mt-0.5"
            checked={selected.includes(option)}
            onChange={() => onToggle(option)}
          />
          <span>{option}</span>
        </label>
      ))}
    </div>
  );
}

export function Section({
  title,
  children,
  divider = true,
}: {
  title: string;
  children: ReactNode;
  divider?: boolean;
}) {
  return (
    <div className={divider ? "border-t border-ink/10 pt-6" : ""}>
      <h3 className="font-heading text-base font-semibold text-heading">{title}</h3>
      <div className="mt-4 flex flex-col gap-4">{children}</div>
    </div>
  );
}

export function toggleInArray(list: string[], value: string): string[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}
