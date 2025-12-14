import React from "react";
import { ChevronDown, SlidersHorizontal } from "lucide-react";
import { listingFilterConfigs, propertySubTypes, propertyTypes, type ListingFilterConfig } from "../data";
import type { ListingType } from "../../homePage/components/HeroSearch";
import { AppliedFilters } from "./AppliedFilters";

export function FiltersPanel({ asDrawer, listingType = "SELL" }: { asDrawer?: boolean; listingType?: ListingType }) {
  const config: ListingFilterConfig = listingFilterConfigs[listingType] ?? listingFilterConfigs.SELL;
  const allowedCategories = React.useMemo(
    () => propertyTypes.filter((type) => config.propertyCategorySlugs.includes(type.slug)),
    [config.propertyCategorySlugs],
  );
  const defaultCategory = allowedCategories[0]?.slug ?? "residential";
  const [selectedCategory, setSelectedCategory] = React.useState(defaultCategory);
  const budgetOptions =
    config.sections.find((section) => section.key === "budget" && section.type === "dual-select")?.options ?? [];
  const budgetMaxIndex = Math.max(budgetOptions.length - 1, 1);
  const [budgetRange, setBudgetRange] = React.useState({ min: 0, max: budgetMaxIndex });

  React.useEffect(() => {
    setSelectedCategory(defaultCategory);
  }, [defaultCategory]);

  React.useEffect(() => {
    setBudgetRange({ min: 0, max: Math.max(budgetOptions.length - 1, 1) });
  }, [budgetOptions.join("|")]);

  return (
    <aside
      className={`relative w-full overflow-hidden rounded-3xl border border-slate-100/70 bg-white/80 p-4 shadow-xl shadow-rose-100/60 backdrop-blur ${
        asDrawer ? "" : "lg:w-80"
      }`}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-90"
        style={{
          backgroundImage:
            "radial-gradient(circle at 12% 18%, rgba(244,63,94,0.06), transparent 32%), radial-gradient(circle at 85% 12%, rgba(56,189,248,0.09), transparent 30%), radial-gradient(circle at 50% 90%, rgba(16,185,129,0.06), transparent 32%)",
        }}
        aria-hidden
      />
      <div className="relative flex items-center justify-between rounded-2xl bg-white/90 px-3 py-2 shadow-sm shadow-rose-100/50">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-rose-500/80 to-amber-400/80 text-white shadow">
            <SlidersHorizontal className="h-4 w-4" />
          </span>
          Filters
        </div>
        <button className="text-xs font-semibold text-rose-600 transition hover:text-rose-700">Clear All</button>
      </div>

      <div className="relative mt-3">
        <AppliedFilters filters={config.appliedFilters} />
      </div>

      <div className="relative mt-4 space-y-3">
        <FilterBlock title="Property category">
          <div className="flex flex-wrap gap-2 text-sm text-slate-700">
            {allowedCategories.map((category) => (
              <label
                key={category.slug}
                className={`flex items-center gap-2 rounded-full border px-3 py-2 transition ${
                  selectedCategory === category.slug
                    ? "border-rose-200 bg-rose-50 text-rose-700 shadow-sm"
                    : "border-slate-200 bg-white/80 text-slate-700 hover:border-rose-100"
                }`}
              >
                <input
                  type="radio"
                  name={`property-category-${listingType}`}
                  className="accent-rose-500"
                  checked={selectedCategory === category.slug}
                  onChange={() => setSelectedCategory(category.slug)}
                />
                {category.name}
              </label>
            ))}
          </div>
        </FilterBlock>

        <FilterBlock title="Property type">
          <div key={selectedCategory} className="flex flex-wrap gap-2 text-sm text-slate-700">
            {propertySubTypes
              .filter((item) => item.propertyTypeSlug === selectedCategory)
              .map((item) => (
                <label
                  key={item.slug}
                  className="flex items-center gap-2 rounded-full border border-slate-200 bg-white/90 px-3 py-2 shadow-sm transition hover:-translate-y-0.5 hover:border-rose-100"
                >
                  <input type="checkbox" className="accent-emerald-500" />
                  {item.name}
                </label>
              ))}
          </div>
        </FilterBlock>

        {config.sections.map((section) => (
          <FilterBlock key={section.key} title={section.title}>
            {section.type === "dual-select" && section.key === "budget" ? (
              <div className="space-y-3 rounded-2xl bg-white/90 px-2 py-2">
                <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wide text-slate-700">
                  <span>Min</span>
                  <span>Max</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <select
                    className="w-full rounded-lg border border-rose-100 bg-white px-3 py-2 text-sm font-semibold text-slate-800 outline-none shadow-sm shadow-rose-50"
                    value={budgetRange.min}
                    onChange={(e) => {
                      const nextMin = Number(e.target.value);
                      setBudgetRange((prev) => ({
                        min: nextMin,
                        max: Math.max(prev.max, nextMin),
                      }));
                    }}
                  >
                    {budgetOptions.map((item, idx) => (
                      <option key={item} value={idx}>
                        {item}
                      </option>
                    ))}
                  </select>
                  <select
                    className="w-full rounded-lg border border-emerald-100 bg-white px-3 py-2 text-sm font-semibold text-slate-800 outline-none shadow-sm shadow-emerald-50"
                    value={budgetRange.max}
                    onChange={(e) => {
                      const nextMax = Number(e.target.value);
                      setBudgetRange((prev) => ({
                        min: Math.min(prev.min, nextMax),
                        max: nextMax,
                      }));
                    }}
                  >
                    {budgetOptions.map((item, idx) => (
                      <option key={item} value={idx}>
                        {item}
                      </option>
                    ))}
                  </select>
                </div>
                <p className="text-xs text-slate-500">
                  Choose your preferred price band.
                </p>
              </div>
            ) : section.type === "dual-select" ? (
              <div className="flex gap-2">
                <select className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none">
                  {section.options.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
                <select className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none">
                  {section.options.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="space-y-2 text-sm text-slate-700">
                {section.options.map((item) => (
                  <label
                    key={item.label}
                    className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white/90 px-3 py-2 shadow-sm transition hover:border-rose-100"
                  >
                    <input type="checkbox" className="accent-rose-500" defaultChecked={item.defaultChecked} />
                    {item.label}
                  </label>
                ))}
              </div>
            )}
          </FilterBlock>
        ))}
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
    <details open={defaultOpen} className="group overflow-hidden rounded-2xl border border-slate-200/80 bg-white/80 shadow-sm shadow-rose-50">
      <summary className="flex cursor-pointer items-center justify-between px-3 py-2 text-sm font-semibold text-slate-900 transition hover:bg-rose-50/70">
        {title}
        <div className="flex items-center gap-2 text-xs text-rose-600">
          {action && <button className="hover:text-indigo-600">{action}</button>}
          <ChevronDown className="h-4 w-4 text-slate-500 transition group-open:rotate-180" />
        </div>
      </summary>
      <div className="border-t border-slate-200 bg-white/90 px-3 py-3">{children}</div>
    </details>
  );
};
