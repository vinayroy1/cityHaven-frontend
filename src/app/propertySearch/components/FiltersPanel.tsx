import React from "react";
import { ChevronDown, SlidersHorizontal } from "lucide-react";
import { appliedFilters, filterOptions } from "../data";
import { AppliedFilters } from "./AppliedFilters";

export function FiltersPanel({ asDrawer }: { asDrawer?: boolean }) {
  return (
    <aside className={`w-full rounded-2xl border border-slate-200 bg-white p-4 shadow-sm ${asDrawer ? "" : "lg:w-80"}`}>
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-slate-900">Applied Filters</p>
        <button className="text-xs font-semibold text-sky-600 hover:text-indigo-600">Clear All</button>
      </div>
      <div className="mt-3">
        <AppliedFilters filters={appliedFilters} />
      </div>

      <div className="mt-4 space-y-3">
        <FilterBlock title="Budget">
          <div className="flex gap-2">
            <select className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none">
              {filterOptions.budget.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
            <select className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none">
              {filterOptions.budget.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </div>
        </FilterBlock>

        <FilterBlock title="Type of property">
          <div className="space-y-2 text-sm text-slate-700">
            {filterOptions.types.slice(0, 4).map((item) => (
              <label key={item} className="flex items-center gap-2">
                <input type="checkbox" className="accent-sky-600" defaultChecked />
                {item}
              </label>
            ))}
          </div>
        </FilterBlock>

        <FilterBlock title="Posted by">
          <div className="space-y-1 text-sm text-slate-700">
            <label className="flex items-center gap-2">
              <input type="checkbox" className="accent-sky-600" /> Owner
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" className="accent-sky-600" /> Dealer
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" className="accent-sky-600" /> Builder
            </label>
          </div>
        </FilterBlock>

        {/* Investment Type and Localities filters intentionally removed */}
      </div>
    </aside>
  );
}

const FilterBlock = ({
  title,
  children,
  action,
  defaultOpen = true,
}: {
  title: string;
  children: React.ReactNode;
  action?: string;
  defaultOpen?: boolean;
}) => {
  return (
    <details open={defaultOpen} className="rounded-xl border border-slate-200">
      <summary className="flex cursor-pointer items-center justify-between px-3 py-2 text-sm font-semibold text-slate-900">
        {title}
        <div className="flex items-center gap-2 text-xs text-sky-600">
          {action && <button className="hover:text-indigo-600">{action}</button>}
          <ChevronDown className="h-4 w-4 text-slate-500" />
        </div>
      </summary>
      <div className="border-t border-slate-200 px-3 py-3">{children}</div>
    </details>
  );
};
