"use client";

import type { ComponentType } from "react";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

/** `group` puts consecutive options under a heading (like <optgroup>). */
export type FilterOption = { value: string; label: string; hint?: string; group?: string };

// Radix Select rejects "" as an item value; map it through a sentinel so callers can keep "" = "any".
const EMPTY = "__any__";

/**
 * Directory filter dropdown (interiors, construction, pandit, agents, stays, projects, blog).
 * Replaces native <select>, whose menu uses the OS font and looks out of place.
 */
export function FilterSelect({
  id,
  value,
  onChange,
  options,
  placeholder,
  size = "md",
  icon: Icon,
  active,
  className,
  ariaLabel,
}: {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  options: FilterOption[];
  placeholder?: string;
  size?: "sm" | "md";
  /** Optional left icon; turns rose when `active`. */
  icon?: ComponentType<{ className?: string }>;
  active?: boolean;
  className?: string;
  ariaLabel?: string;
}) {
  const enc = (v: string) => (v === "" ? EMPTY : v);
  const item = (o: FilterOption) => (
    <SelectItem
      key={o.value}
      value={enc(o.value)}
      className="rounded-lg py-2 text-sm text-slate-800 focus:bg-rose-50 focus:text-rose-700 dark:text-slate-200 dark:focus:bg-rose-950/40"
    >
      {o.label}
      {o.hint && <span className="ml-1 text-xs text-slate-500">{o.hint}</span>}
    </SelectItem>
  );
  // Consecutive runs of the same group become one labelled section.
  const runs: { group?: string; items: FilterOption[] }[] = [];
  for (const o of options) {
    const last = runs[runs.length - 1];
    if (last && last.group === o.group) last.items.push(o);
    else runs.push({ group: o.group, items: [o] });
  }
  return (
    <Select value={enc(value)} onValueChange={(v) => onChange(v === EMPTY ? "" : v)}>
      <SelectTrigger
        id={id}
        aria-label={ariaLabel}
        className={cn(
          "relative w-full min-w-0 rounded-xl border-slate-200 bg-white px-3 font-normal text-slate-900 shadow-2xs hover:border-slate-300 focus-visible:border-rose-500 focus-visible:ring-rose-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100",
          size === "md" ? "h-11 text-sm data-[size=default]:h-11" : "h-9 text-[13px] data-[size=default]:h-9",
          Icon && "pl-9",
          className,
        )}
      >
        {Icon && (
          <Icon className={cn("pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2", active ? "text-rose-500" : "text-slate-400")} />
        )}
        {/* Explicit label so the chosen option shows in server HTML and before the menu has mounted. */}
        <SelectValue placeholder={placeholder}>{options.find((o) => o.value === value)?.label}</SelectValue>
      </SelectTrigger>
      <SelectContent position="popper" className="max-h-72 rounded-xl border-slate-200 p-1 dark:border-slate-700">
        {runs.map((r, i) =>
          r.group ? (
            <SelectGroup key={`${r.group}-${i}`}>
              <SelectLabel className="px-2 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500">{r.group}</SelectLabel>
              {r.items.map(item)}
            </SelectGroup>
          ) : (
            r.items.map(item)
          ),
        )}
      </SelectContent>
    </Select>
  );
}
