import React from "react";
import { X } from "lucide-react";
import type { SelectedFilter } from "../data";

type Props = { filters: SelectedFilter[]; onClearAll?: () => void; onRemove?: (filter: SelectedFilter) => void };

export function AppliedFilters({ filters, onClearAll, onRemove }: Props) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {filters.map((filter) => (
        <span
          key={filter.slug}
          className="group flex items-center gap-2 rounded-full bg-gradient-to-r from-rose-50 via-amber-50 to-emerald-50 px-3 py-1.5 text-[11px] font-semibold text-slate-900 shadow-[0_12px_30px_-18px_rgba(244,63,94,0.35)] ring-1 ring-white/70"
        >
          {filter.label}
          <button
            type="button"
            aria-label={`Remove ${filter.label}`}
            className="flex h-5 w-5 items-center justify-center rounded-full bg-white/80 text-rose-500 shadow-sm transition hover:-translate-y-0.5 hover:shadow"
            onClick={() => onRemove?.(filter)}
          >
            <X className="h-3 w-3" />
          </button>
        </span>
      ))}
      <button
        type="button"
        className="text-xs font-semibold text-rose-600 underline-offset-4 hover:text-rose-700"
        onClick={onClearAll}
      >
        Clear all filters
      </button>
    </div>
  );
}
