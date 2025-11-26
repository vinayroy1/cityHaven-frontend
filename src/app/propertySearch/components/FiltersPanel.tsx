import React from "react";
import { ChevronDown, SlidersHorizontal } from "lucide-react";
import { appliedFilters, filterOptions } from "../data";
import { AppliedFilters } from "./AppliedFilters";

export function FiltersPanel() {
  return (
    <aside className="w-full rounded-2xl border border-slate-200 bg-white p-4 shadow-sm lg:w-80">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-slate-900">Applied Filters</p>
        <button className="text-xs font-semibold text-sky-600 hover:text-indigo-600">Clear All</button>
      </div>
      <div className="mt-3">
        <AppliedFilters filters={appliedFilters} />
      </div>

      <div className="mt-4 flex items-center justify-between rounded-xl border border-slate-200 px-3 py-2 text-sm">
        <span className="text-slate-800">Hide already seen</span>
        <label className="relative inline-flex cursor-pointer items-center">
          <input type="checkbox" className="peer sr-only" />
          <div className="peer h-5 w-9 rounded-full bg-slate-200 after:absolute after:left-0.5 after:top-0.5 after:h-4 after:w-4 after:rounded-full after:bg-white after:transition peer-checked:bg-sky-500 peer-checked:after:translate-x-4" />
        </label>
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

        <FilterBlock title="Type of property" action="Clear">
          <div className="space-y-2 text-sm text-slate-700">
            {filterOptions.types.slice(0, 4).map((item) => (
              <label key={item} className="flex items-center gap-2">
                <input type="checkbox" className="accent-sky-600" defaultChecked />
                {item}
              </label>
            ))}
            <button className="text-xs font-semibold text-sky-600">+ 7 more</button>
          </div>
        </FilterBlock>

        <FilterBlock title="Area">
          <select className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none">
            <option>sq.ft</option>
            <option>sq.m</option>
            <option>acre</option>
          </select>
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

        <FilterBlock title="Investment Type" defaultOpen>
          <div className="space-y-2 text-sm text-slate-700">
            <label className="flex items-center gap-2">
              <input type="checkbox" className="accent-sky-600" defaultChecked /> Assured Returns
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" className="accent-sky-600" /> Rental Yield
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" className="accent-sky-600" /> Lease Guarantee
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" className="accent-sky-600" /> ROI
            </label>
          </div>
        </FilterBlock>

        <FilterBlock title="Localities" action="Clear">
          <div className="space-y-1 text-sm text-slate-700">
            {filterOptions.localities.map((item) => (
              <label key={item} className="flex items-center gap-2">
                <input type="checkbox" className="accent-sky-600" /> {item}
              </label>
            ))}
            <button className="text-xs font-semibold text-sky-600">More Localities</button>
          </div>
        </FilterBlock>

        <div className="space-y-2 text-sm font-semibold text-slate-800">
          <div className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2">
            Properties with photos
            <label className="relative inline-flex cursor-pointer items-center">
              <input type="checkbox" className="peer sr-only" />
              <div className="peer h-5 w-9 rounded-full bg-slate-200 after:absolute after:left-0.5 after:top-0.5 after:h-4 after:w-4 after:rounded-full after:bg-white after:transition peer-checked:bg-sky-500 peer-checked:after:translate-x-4" />
            </label>
          </div>
          <div className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2">
            Properties with videos
            <label className="relative inline-flex cursor-pointer items-center">
              <input type="checkbox" className="peer sr-only" />
              <div className="peer h-5 w-9 rounded-full bg-slate-200 after:absolute after:left-0.5 after:top-0.5 after:h-4 after:w-4 after:rounded-full after:bg-white after:transition peer-checked:bg-sky-500 peer-checked:after:translate-x-4" />
            </label>
          </div>
        </div>
      </div>

      <button className="mt-4 flex w-full items-center justify-center gap-2 rounded-full border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-800 shadow-sm lg:hidden">
        <SlidersHorizontal className="h-4 w-4" /> More filters
      </button>
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
