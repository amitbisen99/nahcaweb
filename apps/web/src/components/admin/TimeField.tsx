"use client";

import { useState } from "react";

const HOURS = Array.from({ length: 12 }, (_, i) => String(i + 1));
const MINUTES = ["00", "15", "30", "45"];

function parseTime(value?: string | null) {
  if (!value) return { hour: "", minute: "", period: "AM" };
  const match = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i.exec(value.trim());
  if (!match) return { hour: "", minute: "", period: "AM" };
  return { hour: String(Number(match[1])), minute: match[2], period: match[3].toUpperCase() };
}

export function TimeField({
  name,
  label,
  currentValue,
}: {
  name: string;
  label: string;
  currentValue?: string | null;
}) {
  const initial = parseTime(currentValue);
  const [hour, setHour] = useState(initial.hour);
  const [minute, setMinute] = useState(initial.minute);
  const [period, setPeriod] = useState(initial.period);

  const combined = hour && minute ? `${hour}:${minute} ${period}` : "";
  const selectClasses =
    "rounded-lg border border-ink/20 bg-white px-3 py-2 text-sm focus:border-brand focus:outline-none";

  return (
    <div className="flex flex-col gap-1">
      <span className="text-sm font-medium text-ink/80">{label}</span>
      <div className="flex items-center gap-2">
        <select value={hour} onChange={(e) => setHour(e.target.value)} className={selectClasses}>
          <option value="">Hour</option>
          {HOURS.map((h) => (
            <option key={h} value={h}>
              {h}
            </option>
          ))}
        </select>
        <span className="text-ink/50">:</span>
        <select value={minute} onChange={(e) => setMinute(e.target.value)} className={selectClasses}>
          <option value="">Min</option>
          {MINUTES.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
        <select value={period} onChange={(e) => setPeriod(e.target.value)} className={selectClasses}>
          <option value="AM">AM</option>
          <option value="PM">PM</option>
        </select>
      </div>
      <input type="hidden" name={name} value={combined} />
    </div>
  );
}
