import React from "react";
import {
  BedDouble,
  Building2,
  Home,
  Hotel,
  House,
  TreePine,
  Warehouse,
  ChevronDown,
  SlidersHorizontal,
  UserRound,
  Users,
} from "lucide-react";
import { listingFilterConfigs, propertySubTypes, propertyTypes, type ListingFilterConfig, type SelectedFilter } from "../data";
import type { ListingType } from "../../homePage/components/HeroSearch";
import { AppliedFilters } from "./AppliedFilters";

type FiltersPanelProps = {
  asDrawer?: boolean;
  listingType?: ListingType;
  appliedFilters?: SelectedFilter[];
  onFiltersChange?: (filters: SelectedFilter[]) => void;
};

export function FiltersPanel({ asDrawer, listingType = "SELL", appliedFilters, onFiltersChange }: FiltersPanelProps) {
  const config: ListingFilterConfig = listingFilterConfigs[listingType] ?? listingFilterConfigs.SELL;
  const allowedCategories = React.useMemo(
    () => propertyTypes.filter((type) => config.propertyCategorySlugs.includes(type.slug)),
    [config.propertyCategorySlugs],
  );
  const defaultCategory = allowedCategories[0]?.slug ?? "residential";
  const [selectedCategory, setSelectedCategory] = React.useState(defaultCategory);
  const budgetOptions =
    config.sections.find((section) => section.key === "budget" && section.type === "dual-select")?.options ?? [];
  const [budgetValues, setBudgetValues] = React.useState({ min: "", max: "" });

  const categoryIcons: Record<string, React.ReactNode> = {
    residential: <Home className="h-4 w-4" />,
    commercial: <Building2 className="h-4 w-4" />,
    pg: <UserRound className="h-4 w-4" />,
  };

  const propertyIcons: Record<string, React.ReactNode> = {
    apartment: <Building2 className="h-4 w-4" />,
    "independent-house-villa": <House className="h-4 w-4" />,
    "independent-builder-floor": <Home className="h-4 w-4" />,
    "1rk-studio-apartment": <BedDouble className="h-4 w-4" />,
    "serviced-apartment": <Hotel className="h-4 w-4" />,
    "plot-land-res": <TreePine className="h-4 w-4" />,
    farmhouse: <TreePine className="h-4 w-4" />,
    office: <Building2 className="h-4 w-4" />,
    retail: <Building2 className="h-4 w-4" />,
    "plot-land-com": <TreePine className="h-4 w-4" />,
    storage: <Warehouse className="h-4 w-4" />,
    industry: <Warehouse className="h-4 w-4" />,
    hospitality: <Hotel className="h-4 w-4" />,
    "pg-private-room": <BedDouble className="h-4 w-4" />,
    "pg-shared-room": <Users className="h-4 w-4" />,
    "pg-bed": <BedDouble className="h-4 w-4" />,
  };

  React.useEffect(() => {
    setSelectedCategory(defaultCategory);
  }, [defaultCategory]);

  React.useEffect(() => {
    setBudgetValues({ min: "", max: "" });
  }, [budgetOptions.join("|")]);

  const activeFilters = appliedFilters ?? [];
  const isActive = (slug: string) => activeFilters.some((f) => f.slug === slug);
  const toggleFilter = (slug: string, label: string, apiKey: string, checked: boolean) => {
    if (!onFiltersChange) return;
    const normalized = slug.trim();
    const withoutLabel = activeFilters.filter((item) => item.slug !== normalized);
    const nextFilters = checked ? [...withoutLabel, { slug: normalized, label, apiKey }] : withoutLabel;
    onFiltersChange(nextFilters);
  };

  return (
    <aside
      className={`relative w-full overflow-hidden rounded-[28px] border border-white/60 bg-gradient-to-br from-white via-rose-50/85 to-emerald-50/80 p-5 shadow-[0_30px_90px_-46px_rgba(15,23,42,0.5)] backdrop-blur ${
        asDrawer ? "" : "lg:w-[380px]"
      }`}
    >
      <div className="pointer-events-none absolute -left-12 -top-10 h-48 w-48 rounded-full bg-rose-300/30 blur-3xl" />
      <div className="pointer-events-none absolute -right-16 bottom-0 h-52 w-52 rounded-full bg-emerald-300/25 blur-3xl" />

      <div className="relative z-10 space-y-5">
        <div className="relative flex items-start justify-between gap-3 rounded-2xl border border-white/70 bg-white/70 px-4 py-3 shadow-[0_20px_60px_-40px_rgba(15,23,42,0.4)] backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-rose-500 via-amber-400 to-teal-400 text-white shadow-lg shadow-rose-200/50 ring-4 ring-white/70">
              <SlidersHorizontal className="h-5 w-5" />
            </span>
            <div className="space-y-0.5">
              <p className="text-base font-semibold text-slate-900">Filters</p>
              <p className="text-xs text-slate-500">Tune results to match your taste</p>
            </div>
          </div>
          <button
            type="button"
            className="inline-flex items-center gap-1 rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-rose-600 shadow-sm ring-1 ring-rose-100 transition hover:-translate-y-0.5 hover:ring-rose-200"
            onClick={() => onFiltersChange?.([])}
          >
            Clear all
          </button>
        </div>

        <div className="relative">
          <AppliedFilters
            filters={activeFilters}
            onClearAll={() => onFiltersChange?.([])}
            onRemove={(filter) => toggleFilter(filter.slug, filter.label, filter.apiKey, false)}
          />
        </div>

        <div className="relative space-y-4">
          <FilterBlock title="Property category">
            <div className="flex flex-wrap gap-2 text-sm font-semibold text-slate-800">
              {allowedCategories.map((category) => {
                const isSelected = selectedCategory === category.slug;
                return (
                  <label
                    key={category.slug}
                    className={`flex items-center gap-2 rounded-full border px-4 py-2 transition ${
                      isSelected
                        ? "border-transparent bg-gradient-to-r from-rose-100 via-amber-100 to-emerald-100 text-slate-900 shadow-[0_12px_30px_-20px_rgba(244,63,94,0.4)]"
                        : "border-white/70 bg-white/80 text-slate-700 hover:border-rose-100 hover:shadow-sm"
                    }`}
                  >
                    <span
                      className={`flex h-8 w-8 items-center justify-center rounded-full text-slate-700 ${
                        isSelected ? "bg-gradient-to-br from-rose-500 via-amber-400 to-emerald-400 text-white shadow-md" : "bg-slate-100"
                      }`}
                    >
                      {categoryIcons[category.slug] ?? <Home className="h-4 w-4" />}
                    </span>
                    <input
                      type="radio"
                      name={`property-category-${listingType}`}
                      className="accent-rose-500"
                      checked={isSelected}
                      onChange={() => setSelectedCategory(category.slug)}
                    />
                    {category.name}
                  </label>
                );
              })}
            </div>
          </FilterBlock>

          <FilterBlock title="Property type">
            <div key={selectedCategory} className="flex flex-wrap gap-2 text-sm font-semibold text-slate-800">
              {propertySubTypes
                .filter((item) => item.propertyTypeSlug === selectedCategory)
                .map((item) => {
                  const checked = isActive(item.slug);
                  return (
                    <label
                      key={item.slug}
                      className={`flex items-center gap-2 rounded-full border px-3.5 py-2 shadow-[0_12px_32px_-26px_rgba(15,23,42,0.45)] transition hover:-translate-y-0.5 ${
                        checked
                          ? "border-transparent bg-gradient-to-r from-rose-100 via-amber-100 to-emerald-100 text-slate-900"
                          : "border-white/70 bg-white/85 text-slate-700 hover:border-rose-100"
                      }`}
                    >
                      <span
                        className={`flex h-8 w-8 items-center justify-center rounded-full text-slate-700 ${
                          checked ? "bg-gradient-to-br from-rose-500 via-amber-400 to-emerald-400 text-white shadow-sm" : "bg-slate-100"
                        }`}
                      >
                        {propertyIcons[item.slug] ?? <Building2 className="h-4 w-4" />}
                      </span>
                      <input
                        type="checkbox"
                        className="accent-rose-500"
                        checked={checked}
                        onChange={(e) => toggleFilter(item.slug, item.name, item.apiKey, e.target.checked)}
                      />
                      {item.name}
                    </label>
                  );
                })}
            </div>
          </FilterBlock>

          {config.sections.map((section) => (
            <FilterBlock key={section.key} title={section.title}>
              {section.type === "dual-select" && section.key === "budget" ? (
                <div className="space-y-4 rounded-2xl border border-white/70 bg-white/80 px-3 py-4 shadow-[0_14px_36px_-28px_rgba(15,23,42,0.35)] ring-1 ring-rose-100/60 backdrop-blur-sm">
                  <div className="h-2 rounded-full bg-rose-50/80">
                    <div className="h-full w-full rounded-full bg-gradient-to-r from-rose-400 via-amber-300 to-emerald-400" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <label className="flex flex-col gap-1 text-[11px] font-semibold uppercase tracking-wide text-slate-700">
                      Minimum
                      <div className="flex items-center gap-2 rounded-2xl border border-rose-100/80 bg-white px-3 py-2 shadow-sm transition focus-within:border-rose-200">
                        <span className="text-sm text-rose-500">₹</span>
                        <input
                          type="text"
                          className="w-full bg-transparent text-sm font-semibold text-slate-900 outline-none placeholder:font-normal placeholder:text-slate-400"
                          placeholder={budgetOptions[0] ?? "No min"}
                          value={budgetValues.min}
                          onChange={(e) => setBudgetValues((prev) => ({ ...prev, min: e.target.value }))}
                        />
                      </div>
                    </label>
                    <label className="flex flex-col gap-1 text-[11px] font-semibold uppercase tracking-wide text-slate-700">
                      Maximum
                      <div className="flex items-center gap-2 rounded-2xl border border-emerald-100/80 bg-white px-3 py-2 shadow-sm transition focus-within:border-emerald-200">
                        <span className="text-sm text-emerald-500">₹</span>
                        <input
                          type="text"
                          className="w-full bg-transparent text-sm font-semibold text-slate-900 outline-none placeholder:font-normal placeholder:text-slate-400"
                          placeholder={budgetOptions[budgetOptions.length - 1] ?? "No max"}
                          value={budgetValues.max}
                          onChange={(e) => setBudgetValues((prev) => ({ ...prev, max: e.target.value }))}
                        />
                      </div>
                    </label>
                  </div>
                  <p className="text-xs text-slate-500">Set a comfortable range for your budget.</p>
                </div>
              ) : section.type === "dual-select" ? (
                <div className="flex gap-2">
                  <select className="w-full rounded-xl border border-rose-100 bg-white px-3 py-2 text-sm font-semibold text-slate-800 outline-none shadow-sm transition focus:border-rose-200">
                    {section.options.map((item) => (
                      <option key={item}>{item}</option>
                    ))}
                  </select>
                  <select className="w-full rounded-xl border border-emerald-100 bg-white px-3 py-2 text-sm font-semibold text-slate-800 outline-none shadow-sm transition focus:border-emerald-200">
                    {section.options.map((item) => (
                      <option key={item}>{item}</option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2 text-sm font-semibold text-slate-800">
                  {section.options.map((item) => {
                    const checked = isActive(item.slug);
                    return (
                      <label
                        key={item.slug}
                        className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 shadow-[0_12px_32px_-26px_rgba(15,23,42,0.45)] transition hover:-translate-y-0.5 ${
                          checked
                            ? "border-transparent bg-gradient-to-r from-rose-100 via-amber-100 to-emerald-100 text-slate-900"
                            : "border-white/70 bg-white/85 text-slate-700 hover:border-rose-100"
                        }`}
                      >
                        <input
                          type="checkbox"
                          className="accent-rose-500"
                          checked={checked}
                          onChange={(e) => toggleFilter(item.slug, item.label, item.apiKey, e.target.checked)}
                        />
                        {item.label}
                      </label>
                    );
                  })}
                </div>
              )}
            </FilterBlock>
          ))}
        </div>
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
    <details
      open={defaultOpen}
      className="group overflow-hidden rounded-2xl border border-white/70 bg-white/85 shadow-[0_18px_50px_-34px_rgba(15,23,42,0.4)] ring-1 ring-rose-100/60 backdrop-blur-sm"
    >
      <summary className="flex cursor-pointer items-center justify-between bg-gradient-to-r from-white via-rose-50/60 to-white px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-rose-50/70">
        {title}
        <div className="flex items-center gap-2 text-xs text-slate-600">
          {action && <button className="font-semibold hover:text-slate-900">{action}</button>}
          <ChevronDown className="h-4 w-4 text-slate-500 transition group-open:rotate-180" />
        </div>
      </summary>
      <div className="border-t border-white/80 bg-white/90 px-4 py-4">{children}</div>
    </details>
  );
};
