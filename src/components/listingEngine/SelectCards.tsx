"use client";

import React from "react";
import { Check, icons } from "lucide-react";
import { cn } from "@/components/ui/utils";
import type { Option } from "@/lib/listingEngine/types";

const pascal = (s: string) => s.replace(/(^|[-_ ])(\w)/g, (_m, _p, c: string) => c.toUpperCase());

/** lucide icon by kebab or Pascal name; null when unknown. */
export function OptionIcon({ name, className }: { name?: string; className?: string }) {
  if (!name) return null;
  const Icon = (icons as Record<string, React.ComponentType<{ className?: string }>>)[pascal(name)];
  return Icon ? <Icon className={className} /> : null;
}

/** Large selectable cards (icon / image + label + description). Single or multi select. */
export function SelectCards({
  options,
  value,
  onChange,
  multiple = false,
  disabled,
  isOptionDisabled,
  label,
  maxItems,
  columns = 2,
}: {
  options: Option[];
  value: unknown;
  onChange: (v: unknown) => void;
  multiple?: boolean;
  disabled?: boolean;
  isOptionDisabled?: (o: Option) => boolean;
  label: string;
  maxItems?: number;
  columns?: 2 | 3;
}) {
  const selected = multiple ? (Array.isArray(value) ? value : []) : [value];
  const atMax = multiple && maxItems != null && selected.length >= maxItems;
  const toggle = (o: Option) => {
    if (!multiple) return onChange(o.value);
    const has = selected.includes(o.value);
    onChange(has ? selected.filter((x) => x !== o.value) : [...selected, o.value]);
  };
  return (
    <div role={multiple ? "group" : "radiogroup"} aria-label={label} className={cn("grid gap-3", columns === 3 ? "grid-cols-2 sm:grid-cols-3" : "sm:grid-cols-2")}>
      {options.map((o) => {
        const active = selected.includes(o.value);
        const off = disabled || isOptionDisabled?.(o) || (atMax && !active);
        return (
          <button
            key={String(o.value)}
            type="button"
            role={multiple ? "checkbox" : "radio"}
            aria-checked={active}
            disabled={off}
            onClick={() => toggle(o)}
            className={cn(
              "group relative flex min-h-[72px] flex-col items-start gap-1 overflow-hidden rounded-2xl border bg-white p-4 text-left transition dark:bg-slate-900",
              active ? "border-rose-500 ring-2 ring-rose-500/70" : "border-slate-200 hover:border-slate-400 hover:shadow-sm dark:border-slate-700",
              off && "cursor-not-allowed opacity-50",
            )}
          >
            {o.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={o.image} alt="" className="-mx-4 -mt-4 mb-2 aspect-[16/9] w-[calc(100%+2rem)] max-w-none object-cover" />
            ) : o.icon ? (
              <span className={cn("mb-1 flex h-10 w-10 items-center justify-center rounded-xl", active ? "bg-rose-50 text-rose-600 dark:bg-rose-950/50" : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300")}>
                <OptionIcon name={o.icon} className="h-5 w-5" />
              </span>
            ) : null}
            <span className="text-sm font-semibold text-slate-900 dark:text-white">{o.label}</span>
            {o.description && <span className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">{o.description}</span>}
            {active && (
              <span aria-hidden className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-white">
                <Check className="h-3 w-3" />
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
