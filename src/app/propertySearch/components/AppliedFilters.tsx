import React from "react";
import { X } from "lucide-react";

type Props = { filters: string[]; onClearAll?: () => void };

export function AppliedFilters({ filters, onClearAll }: Props) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {filters.map((filter) => (
        <span key={filter} className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700">
          {filter}
          <button aria-label={`Remove ${filter}`} className="text-slate-500 hover:text-slate-700">
            <X className="h-3 w-3" />
          </button>
        </span>
      ))}
      <button className="text-xs font-semibold text-sky-600 hover:text-indigo-600" onClick={onClearAll}>
        Clear all filters
      </button>
    </div>
  );
}
