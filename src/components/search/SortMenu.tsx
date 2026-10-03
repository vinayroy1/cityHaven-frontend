"use client";

import React from "react";
import { ArrowUpDown, ChevronDown } from "lucide-react";
import { SORT_OPTIONS } from "./searchConfig";
import type { SortKey } from "./searchQuery";

export function SortMenu({ value, onChange }: { value: SortKey; onChange: (v: SortKey) => void }) {
  return (
    <label className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200">
      <ArrowUpDown className="h-3.5 w-3.5 text-slate-400" />
      <span className="hidden text-slate-500 dark:text-slate-400 sm:inline">Sort</span>
      <span className="relative">
        <select
          className="appearance-none bg-transparent pr-5 font-bold text-slate-900 dark:text-white outline-none"
          value={value}
          onChange={(e) => onChange(e.target.value as SortKey)}
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value} className="bg-white text-slate-900 dark:bg-slate-900 dark:text-white">
              {o.label}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-0 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
      </span>
    </label>
  );
}
