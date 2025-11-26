import React from "react";
import { Search, ChevronDown, MapPin } from "lucide-react";
import { AppliedFilters } from "./AppliedFilters";
import { appliedFilters } from "../data";

export function SearchToolbar() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-center gap-3">
        <button className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-800 shadow-sm">
          Commercial Buy <ChevronDown className="h-4 w-4 text-slate-500" />
        </button>
        <button className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-800 shadow-sm">
          T.N.H.B.Phase-1 <ChevronDown className="h-4 w-4 text-slate-500" />
        </button>
        <button className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-800 shadow-sm">
          Add more <ChevronDown className="h-4 w-4 text-slate-500" />
        </button>
        <div className="flex flex-1 items-center rounded-full border border-slate-200 px-3 py-2 shadow-sm min-w-[220px]">
          <Search className="h-4 w-4 text-slate-500" />
          <input className="w-full bg-transparent px-2 text-sm outline-none" placeholder='Search "Flats for rent in sector 77"' />
        </div>
        <button className="flex items-center justify-center gap-2 rounded-full bg-sky-600 px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:-translate-y-0.5">
          <MapPin className="h-4 w-4" /> Map
        </button>
      </div>
      <div className="mt-3">
        <AppliedFilters filters={appliedFilters} />
      </div>
    </div>
  );
}
