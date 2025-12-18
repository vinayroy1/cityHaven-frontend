"use client";

import React from "react";
import Link from "next/link";
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
import {
  listingFilterConfigs,
  propertySubTypes,
  propertyTypes,
  commercialPropertyCategories,
  type ListingFilterConfig,
  type SelectedFilter,
} from "../data";
import type { ListingType } from "../../homePage/components/HeroSearch";
import { AppliedFilters } from "./AppliedFilters";
import { Slider } from "@/components/ui/slider";

type FiltersPanelProps = {
  asDrawer?: boolean;
  listingType?: ListingType;
  appliedFilters?: SelectedFilter[];
  onFiltersChange?: (filters: SelectedFilter[]) => void;
};

export function FiltersPanel({ asDrawer, listingType = "SELL", appliedFilters, onFiltersChange }: FiltersPanelProps) {
  const config: ListingFilterConfig = listingFilterConfigs[listingType] ?? listingFilterConfigs.SELL;
  type CategoryOption = { slug: string; name: string };
  const baseCategories = React.useMemo(
    () => propertyTypes.filter((type) => config.propertyCategorySlugs.includes(type.slug)),
    [config.propertyCategorySlugs],
  );
  const commercialCategories = React.useMemo<CategoryOption[]>(() => {
    if (listingType !== "COMMERCIAL") return [];
    return commercialPropertyCategories;
  }, [listingType]);
  const categoryOptions: CategoryOption[] = listingType === "COMMERCIAL" ? commercialCategories : baseCategories;
  const defaultCategory = categoryOptions[0]?.slug ?? baseCategories[0]?.slug ?? "residential";
  const [selectedCategory, setSelectedCategory] = React.useState(defaultCategory);
  const [selectedAreaUnit, setSelectedAreaUnit] = React.useState<AreaUnitValue>("SQFT");

  const categoryIcons: Record<string, React.ReactNode> = {
    residential: <Home className="h-4 w-4" />,
    commercial: <Building2 className="h-4 w-4" />,
    pg: <UserRound className="h-4 w-4" />,
    office: <Building2 className="h-4 w-4" />,
    retail: <Building2 className="h-4 w-4" />,
    "plot-land-com": <TreePine className="h-4 w-4" />,
    storage: <Warehouse className="h-4 w-4" />,
    industry: <Warehouse className="h-4 w-4" />,
    hospitality: <Hotel className="h-4 w-4" />,
  };

  const propertyIcons: Record<string, React.ReactNode> = {
    apartment: <Building2 className="h-4 w-4" />,
    "independent-house-villa": <House className="h-4 w-4" />,
    "independent-builder-floor": <Home className="h-4 w-4" />,
    "1rk-studio-apartment": <BedDouble className="h-4 w-4" />,
    "serviced-apartment": <Hotel className="h-4 w-4" />,
    "plot-land-res": <TreePine className="h-4 w-4" />,
    farmhouse: <TreePine className="h-4 w-4" />,
    "agri-farm-land": <TreePine className="h-4 w-4" />,
    "ready-to-move-office-space": <Building2 className="h-4 w-4" />,
    "bare-shell-office-space": <Building2 className="h-4 w-4" />,
    "co-working-office-space": <Building2 className="h-4 w-4" />,
    "commercial-shops": <Building2 className="h-4 w-4" />,
    "commercial-showrooms": <Building2 className="h-4 w-4" />,
    "commercial-land-inst-land": <TreePine className="h-4 w-4" />,
    "agricultural-farm-land": <TreePine className="h-4 w-4" />,
    "industrial-lands-plots": <TreePine className="h-4 w-4" />,
    warehouse: <Warehouse className="h-4 w-4" />,
    "factory-manufacturing": <Warehouse className="h-4 w-4" />,
    "cold-storage": <Warehouse className="h-4 w-4" />,
    godown: <Warehouse className="h-4 w-4" />,
    factory: <Warehouse className="h-4 w-4" />,
    manufacturing: <Warehouse className="h-4 w-4" />,
    "hotel-resorts": <Hotel className="h-4 w-4" />,
    "guest-house-banquet-halls": <Hotel className="h-4 w-4" />,
    "plot-land-com": <TreePine className="h-4 w-4" />,
    "commercial-other": <Building2 className="h-4 w-4" />,
    "pg-private-room": <BedDouble className="h-4 w-4" />,
    "pg-shared-room": <Users className="h-4 w-4" />,
    "pg-bed": <BedDouble className="h-4 w-4" />,
  };

  React.useEffect(() => {
    setSelectedCategory(defaultCategory);
  }, [defaultCategory]);

  const filteredSubTypes = React.useMemo(() => {
    if (listingType === "PLOT") {
      if (selectedCategory === "residential") {
        return [];
      }
      const plotCommercialSlugs = ["commercial-land-inst-land", "agricultural-farm-land", "industrial-lands-plots"];
      return plotCommercialSlugs
        .map((slug) => propertySubTypes.find((item) => item.slug === slug))
        .filter((item): item is (typeof propertySubTypes)[number] => Boolean(item));
    }
    return propertySubTypes.filter((item) => item.propertyTypeSlug === selectedCategory);
  }, [listingType, selectedCategory]);
  const showPlotResidentialMessage = listingType === "PLOT" && selectedCategory === "residential";

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
          <FilterBlock title={listingType === "COMMERCIAL" ? "Property sub-category" : "Property category"}>
            <div className="flex flex-wrap gap-2 text-sm font-semibold text-slate-800">
              {categoryOptions.map((category) => {
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
            {showPlotResidentialMessage ? (
              <p className="text-xs font-semibold text-slate-600">All residential plots / land are included automatically.</p>
            ) : (
              <div key={selectedCategory} className="flex flex-wrap gap-2 text-sm font-semibold text-slate-800">
                {filteredSubTypes.map((item) => {
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
            )}
            {listingType === "SELL" && (
              <p className="mt-2 text-xs text-slate-500">
                Looking for commercial properties?{" "}
                <Link href="/propertySearch?listingType=COMMERCIAL" className="font-semibold text-rose-600 hover:underline">
                  Click here
                </Link>
              </p>
            )}
            {listingType === "COMMERCIAL" && (
              <p className="mt-2 text-xs text-slate-500">
                Looking for residential properties?{" "}
                <Link href="/propertySearch?listingType=SELL" className="font-semibold text-rose-600 hover:underline">
                  Browse homes
                </Link>
              </p>
            )}
          </FilterBlock>

          {config.sections.map((section) => {
            if (section.type === "dual-select" && section.key === "area") {
              return (
                <FilterBlock
                  key={section.key}
                  title="Select area range"
                  action={
                    <div className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/80 px-2 py-1 text-xs font-semibold text-slate-700 shadow-sm">
                      <span className="hidden text-[11px] uppercase tracking-wide text-slate-500 sm:inline">Area unit</span>
                      <select
                        value={selectedAreaUnit}
                        onChange={(event) => setSelectedAreaUnit(event.target.value as AreaUnitValue)}
                        className="rounded-full border border-white/80 bg-white px-2 py-1 text-sm font-semibold text-slate-800 outline-none focus:border-rose-200"
                      >
                        {AREA_UNIT_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  }
                >
                  <AreaRangeSlider options={section.options} areaUnit={selectedAreaUnit} />
                </FilterBlock>
              );
            }

            return (
              <FilterBlock key={section.key} title={section.title}>
                {section.type === "dual-select" && section.key === "budget" ? (
                  <PriceRangeSlider options={section.options} listingType={listingType} />
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
            );
          })}
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
  action?: React.ReactNode;
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
          {action}
          <ChevronDown className="h-4 w-4 text-slate-500 transition group-open:rotate-180" />
        </div>
      </summary>
      <div className="border-t border-white/80 bg-white/90 px-4 py-4">{children}</div>
    </details>
  );
};

const numberFormatter = new Intl.NumberFormat("en-IN");
const AREA_UNIT_OPTIONS = [
  { label: "Sq.ft", value: "SQFT", suffix: "sqft" },
  { label: "Sq.yd", value: "SQYD", suffix: "sqyd" },
  { label: "Sq.m", value: "SQM", suffix: "sqm" },
  { label: "Acre", value: "ACRE", suffix: "acre" },
] as const;
type AreaUnitValue = (typeof AREA_UNIT_OPTIONS)[number]["value"];

const parseAreaValue = (input: string): number | null => {
  const valueMatch = input.replace(/,/g, "").match(/[\d.]+/);
  if (!valueMatch) return null;
  const baseValue = Number(valueMatch[0]);
  if (Number.isNaN(baseValue)) return null;
  const normalized = input.toLowerCase();
  if (normalized.includes("acre")) {
    return Math.round(baseValue * 43560);
  }
  if (normalized.includes("sqyd")) {
    return Math.round(baseValue * 9);
  }
  if (normalized.includes("sqm")) {
    return Math.round(baseValue * 10.7639);
  }
  return Math.round(baseValue);
};

const getAreaSliderSettings = (options: string[]) => {
  const numericValues = options
    .map((option) => (option.toLowerCase().includes("no min") || option.toLowerCase().includes("no max") ? null : parseAreaValue(option)))
    .filter((value): value is number => typeof value === "number");
  const fallbackMax = 20000;
  const max = numericValues.length ? Math.max(...numericValues) : fallbackMax;
  const safeMax = Math.max(max, 1000);
  const min = 0;
  const magnitude = Math.pow(10, Math.max(Math.floor(Math.log10(safeMax)) - 2, 0));
  const step = Math.max(10, Math.round(magnitude));
  return { min, max: safeMax, step };
};

const convertSqftToUnit = (sqft: number, unit: AreaUnitValue) => {
  switch (unit) {
    case "ACRE":
      return sqft / 43560;
    case "SQM":
      return sqft / 10.7639;
    case "SQYD":
      return sqft / 9;
    default:
      return sqft;
  }
};

const AreaRangeSlider = ({ options, areaUnit }: { options: string[]; areaUnit: AreaUnitValue }) => {
  const sliderSettings = React.useMemo(() => getAreaSliderSettings(options), [options]);
  const [range, setRange] = React.useState<[number, number]>([sliderSettings.min, sliderSettings.max]);

  React.useEffect(() => {
    setRange([sliderSettings.min, sliderSettings.max]);
  }, [sliderSettings.min, sliderSettings.max]);

  const unitSuffix = React.useMemo(() => AREA_UNIT_OPTIONS.find((item) => item.value === areaUnit)?.suffix ?? "sqft", [areaUnit]);

  const formatLabel = (value: number, type: "min" | "max") => {
    if (type === "min" && value <= sliderSettings.min) return "No min";
    if (type === "max" && value >= sliderSettings.max) return "No max";
    const convertedValue = convertSqftToUnit(value, areaUnit);
    return `${numberFormatter.format(Math.round(convertedValue))} ${unitSuffix}`;
  };

  return (
    <div className="space-y-4 rounded-2xl border border-white/70 bg-white/80 px-4 py-5 shadow-[0_14px_36px_-28px_rgba(15,23,42,0.35)] ring-1 ring-rose-100/60 backdrop-blur-sm">
      <div className="flex items-center justify-between text-sm font-semibold text-slate-900">
        <span>{formatLabel(range[0], "min")}</span>
        <span>{formatLabel(range[1], "max")}</span>
      </div>
      <Slider
        value={range}
        className="py-3"
        min={sliderSettings.min}
        max={sliderSettings.max}
        step={sliderSettings.step}
        onValueChange={(values) => setRange(values as [number, number])}
      />
      <p className="text-xs text-slate-500">Values shown in {unitSuffix}</p>
    </div>
  );
};

const parseCurrencyValue = (input: string): number | null => {
  const normalized = input.replace(/[,₹]/g, "").trim().toLowerCase();
  if (!normalized || normalized.includes("no min") || normalized.includes("no max")) return null;
  const match = normalized.match(/[\d.]+/);
  if (!match) return null;
  const base = Number(match[0]);
  if (Number.isNaN(base)) return null;
  const hasCrore = normalized.includes("crore") || normalized.includes("cr");
  const hasLac = normalized.includes("lakh") || normalized.includes("lac") || /(^|\s)[\d.]+l/.test(normalized) || normalized.endsWith("l");
  const hasThousand = normalized.includes("k");
  if (hasCrore) return Math.round(base * 10000000);
  if (hasLac) return Math.round(base * 100000);
  if (hasThousand) return Math.round(base * 1000);
  return Math.round(base);
};

const PRICE_SLIDER_OVERRIDES: Partial<Record<ListingType, { min?: number; max?: number; hasNoMin?: boolean; hasNoMax?: boolean }>> = {
  RENT: { min: 0, max: 2000000, hasNoMin: false, hasNoMax: false },
  SELL: { min: 500000, max: 30000000, hasNoMin: false, hasNoMax: false },
};

const getPriceSliderSettings = (options: string[], listingType: ListingType) => {
  const numericValues = options
    .map((option) => parseCurrencyValue(option))
    .filter((value): value is number => typeof value === "number");
  const fallbackMax = 10000000;
  let hasNoMin = options.some((option) => option.toLowerCase().includes("no min"));
  let hasNoMax = options.some((option) => option.toLowerCase().includes("no max"));
  const minValue = numericValues.length ? Math.min(...numericValues) : 0;
  const maxValue = numericValues.length ? Math.max(...numericValues) : fallbackMax;
  let sliderMin = hasNoMin ? 0 : minValue;
  let sliderMax = hasNoMax ? Math.max(maxValue, minValue + 1) : maxValue;

  const override = PRICE_SLIDER_OVERRIDES[listingType];
  if (override) {
    if (typeof override.min === "number") {
      sliderMin = override.min;
      hasNoMin = override.hasNoMin ?? false;
    }
    if (typeof override.max === "number") {
      sliderMax = override.max;
      hasNoMax = override.hasNoMax ?? false;
    }
    if (override.hasNoMin !== undefined) hasNoMin = override.hasNoMin;
    if (override.hasNoMax !== undefined) hasNoMax = override.hasNoMax;
  }

  const magnitude = Math.pow(10, Math.max(Math.floor(Math.log10(sliderMax || 1)) - 1, 0));
  const step = Math.max(1000, Math.round(magnitude));
  return { min: sliderMin, max: sliderMax, step, hasNoMin, hasNoMax };
};

const formatCurrencyLabel = (value: number) => {
  if (value >= 10000000) {
    const amount = value / 10000000;
    return `₹${amount % 1 === 0 ? amount.toFixed(0) : amount.toFixed(1)} Cr`;
  }
  if (value >= 100000) {
    const amount = value / 100000;
    return `₹${amount % 1 === 0 ? amount.toFixed(0) : amount.toFixed(1)} Lac`;
  }
  if (value >= 1000) {
    const amount = value / 1000;
    return `₹${amount % 1 === 0 ? amount.toFixed(0) : amount.toFixed(1)} K`;
  }
  return `₹${numberFormatter.format(value)}`;
};

const PriceRangeSlider = ({ options, listingType }: { options: string[]; listingType: ListingType }) => {
  const sliderSettings = React.useMemo(() => getPriceSliderSettings(options, listingType), [options, listingType]);
  const [range, setRange] = React.useState<[number, number]>([sliderSettings.min, sliderSettings.max]);

  React.useEffect(() => {
    setRange([sliderSettings.min, sliderSettings.max]);
  }, [sliderSettings.min, sliderSettings.max]);

  const formatLabel = (value: number, type: "min" | "max") => {
    if (type === "min" && sliderSettings.hasNoMin && value <= sliderSettings.min) return "No min";
    if (type === "max" && sliderSettings.hasNoMax && value >= sliderSettings.max) return "No max";
    return formatCurrencyLabel(value);
  };

  return (
    <div className="space-y-4 rounded-2xl border border-white/70 bg-white/80 px-4 py-5 shadow-[0_14px_36px_-28px_rgba(15,23,42,0.35)] ring-1 ring-rose-100/60 backdrop-blur-sm">
      <div className="flex items-center justify-between text-sm font-semibold text-slate-900">
        <span>{formatLabel(range[0], "min")}</span>
        <span>{formatLabel(range[1], "max")}</span>
      </div>
      <Slider
        value={range}
        className="py-3"
        min={sliderSettings.min}
        max={sliderSettings.max}
        step={sliderSettings.step}
        onValueChange={(values) => setRange(values as [number, number])}
      />
      <p className="text-xs text-slate-500">Values shown in INR</p>
    </div>
  );
};
