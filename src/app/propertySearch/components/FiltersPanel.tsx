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
      className={`relative w-full overflow-hidden rounded-[28px] border border-slate-200 bg-white/95 p-5 shadow-[0_26px_70px_-38px_rgba(15,23,42,0.35)] ${
        asDrawer ? "" : "lg:w-[380px]"
      }`}
    >
      <div className="relative flex items-start justify-between gap-3 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-800 shadow-sm">
            <SlidersHorizontal className="h-5 w-5" />
          </span>
          <div className="space-y-0.5">
            <p className="text-base font-semibold text-slate-900">Filters</p>
            <p className="text-xs text-slate-500">Tune results to match your taste</p>
          </div>
        </div>
        <button
          type="button"
          className="text-sm font-semibold text-slate-700 underline-offset-4 transition hover:text-slate-900"
          onClick={() => onFiltersChange?.([])}
        >
          Clear all
        </button>
      </div>

      <div className="relative mt-4">
        <AppliedFilters
          filters={activeFilters}
          onClearAll={() => onFiltersChange?.([])}
          onRemove={(filter) => toggleFilter(filter.slug, filter.label, filter.apiKey, false)}
        />
      </div>

      <div className="relative mt-5 space-y-4">
        <FilterBlock title="Property category">
          <div className="flex flex-wrap gap-2 text-sm font-semibold text-slate-800">
            {allowedCategories.map((category) => (
              <label
                key={category.slug}
                className={`flex items-center gap-2 rounded-full border px-4 py-2 transition ${
                  selectedCategory === category.slug
                    ? "border-slate-900 bg-slate-900/5 text-slate-900 shadow-md shadow-slate-900/10"
                    : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                }`}
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-700">
                  {categoryIcons[category.slug] ?? <Home className="h-4 w-4" />}
                </span>
                <input
                  type="radio"
                  name={`property-category-${listingType}`}
                  className="accent-slate-900"
                  checked={selectedCategory === category.slug}
                  onChange={() => setSelectedCategory(category.slug)}
                />
                {category.name}
              </label>
            ))}
          </div>
        </FilterBlock>

        <FilterBlock title="Property type">
          <div key={selectedCategory} className="flex flex-wrap gap-2 text-sm font-semibold text-slate-800">
            {propertySubTypes
              .filter((item) => item.propertyTypeSlug === selectedCategory)
              .map((item) => (
                <label
                  key={item.slug}
                  className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3.5 py-2 shadow-[0_12px_32px_-26px_rgba(15,23,42,0.45)] transition hover:-translate-y-0.5 hover:border-slate-300"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-700">
                    {propertyIcons[item.slug] ?? <Building2 className="h-4 w-4" />}
                  </span>
                  <input
                    type="checkbox"
                    className="accent-slate-900"
                    checked={isActive(item.slug)}
                    onChange={(e) => toggleFilter(item.slug, item.name, item.apiKey, e.target.checked)}
                  />
                  {item.name}
                </label>
              ))}
          </div>
        </FilterBlock>

        {config.sections.map((section) => (
          <FilterBlock key={section.key} title={section.title}>
            {section.type === "dual-select" && section.key === "budget" ? (
              <div className="space-y-4 rounded-2xl border border-slate-200 bg-white px-3 py-4 shadow-[0_14px_36px_-28px_rgba(15,23,42,0.35)]">
                <div className="h-2 rounded-full bg-slate-100">
                  <div className="h-full w-full rounded-full bg-gradient-to-r from-rose-400 via-amber-400 to-emerald-400" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <label className="flex flex-col gap-1 text-xs font-semibold uppercase tracking-wide text-slate-700">
                    Minimum
                    <div className="flex items-center gap-2 rounded-2xl border border-slate-300 bg-white px-3 py-2 shadow-sm transition focus-within:border-slate-400">
                      <span className="text-sm text-slate-500">₹</span>
                      <input
                        type="text"
                        className="w-full bg-transparent text-sm font-semibold text-slate-900 outline-none placeholder:font-normal placeholder:text-slate-400"
                        placeholder={budgetOptions[0] ?? "No min"}
                        value={budgetValues.min}
                        onChange={(e) => setBudgetValues((prev) => ({ ...prev, min: e.target.value }))}
                      />
                    </div>
                  </label>
                  <label className="flex flex-col gap-1 text-xs font-semibold uppercase tracking-wide text-slate-700">
                    Maximum
                    <div className="flex items-center gap-2 rounded-2xl border border-slate-300 bg-white px-3 py-2 shadow-sm transition focus-within:border-slate-400">
                      <span className="text-sm text-slate-500">₹</span>
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
                <select className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-800 outline-none shadow-sm focus:border-slate-400">
                  {section.options.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
                <select className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-800 outline-none shadow-sm focus:border-slate-400">
                  {section.options.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2 text-sm font-semibold text-slate-800">
                {section.options.map((item) => (
                  <label
                    key={item.slug}
                    className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 shadow-[0_12px_32px_-26px_rgba(15,23,42,0.45)] transition hover:-translate-y-0.5 hover:border-slate-300"
                  >
                    <input
                      type="checkbox"
                      className="accent-slate-900"
                    checked={isActive(item.slug)}
                    onChange={(e) => toggleFilter(item.slug, item.label, item.apiKey, e.target.checked)}
                  />
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
    <details
      open={defaultOpen}
      className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_16px_40px_-30px_rgba(15,23,42,0.35)]"
    >
      <summary className="flex cursor-pointer items-center justify-between px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-50">
        {title}
        <div className="flex items-center gap-2 text-xs text-slate-600">
          {action && <button className="font-semibold hover:text-slate-900">{action}</button>}
          <ChevronDown className="h-4 w-4 text-slate-500 transition group-open:rotate-180" />
        </div>
      </summary>
      <div className="border-t border-slate-200 bg-white px-4 py-4">{children}</div>
    </details>
  );
};
