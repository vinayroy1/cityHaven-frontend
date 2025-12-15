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
          className="group flex items-center gap-2 rounded-full border border-slate-300 bg-white px-3 py-1.5 text-[11px] font-semibold text-slate-800 shadow-[0_10px_28px_-20px_rgba(15,23,42,0.35)]"
        >
          {filter.label}
          <button
            type="button"
            aria-label={`Remove ${filter.label}`}
            className="text-slate-400 transition hover:text-slate-700"
            onClick={() => onRemove?.(filter)}
          >
            <X className="h-3 w-3" />
          </button>
        </span>
      ))}
      <button
        type="button"
        className="text-xs font-semibold text-slate-700 underline-offset-4 hover:text-slate-900"
        onClick={onClearAll}
      >
        Clear all filters
      </button>
    </div>
  );
}
