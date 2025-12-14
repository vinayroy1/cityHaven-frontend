"use client";

import React, { useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SlidersHorizontal } from "lucide-react";
import { HeaderNav } from "../homePage/components/HeaderNav";
import { HeroSearch, type ListingType } from "../homePage/components/HeroSearch";
import { FiltersPanel } from "./components/FiltersPanel";
import { ResultsList } from "./components/ResultsList";
import { listingFilterConfigs, type ListingFilterConfig } from "./data";

const ResultsSkeleton = () => (
  <div className="flex-1 space-y-3">
    <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
      <div className="h-10 w-full animate-pulse rounded-md bg-slate-100" />
      <div className="mt-3 flex flex-wrap gap-2">
        {Array.from({ length: 4 }).map((_, idx) => (
          <div key={idx} className="h-8 w-24 animate-pulse rounded-full bg-slate-100" />
        ))}
      </div>
    </div>
    {Array.from({ length: 5 }).map((_, idx) => (
      <div key={idx} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-2">
            <div className="h-5 w-44 animate-pulse rounded bg-slate-100" />
            <div className="h-4 w-32 animate-pulse rounded bg-slate-100" />
            <div className="h-3 w-24 animate-pulse rounded bg-slate-100" />
          </div>
          <div className="h-20 w-28 animate-pulse rounded-xl bg-slate-100" />
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {Array.from({ length: 3 }).map((_, pillIdx) => (
            <div key={pillIdx} className="h-6 w-20 animate-pulse rounded-full bg-slate-100" />
          ))}
        </div>
      </div>
    ))}
  </div>
);

const getDefaultSelectedFilters = (config: ListingFilterConfig) => {
  const defaults: string[] = [];
  config.sections.forEach((section) => {
    if (section.type === "checkbox") {
      section.options.forEach((option) => {
        if (option.defaultChecked) defaults.push(option.label);
      });
    }
  });
  return defaults;
};

export function SearchPageClient() {
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const hasOpenedFiltersOnce = useRef(false);

  const currentParams = useMemo(() => {
    const entries = Array.from(searchParams.entries());
    return Object.fromEntries(entries);
  }, [searchParams]);

  const updateSearchParams = (next: Record<string, string | number | null | undefined>) => {
    setIsLoading(true);
    const params = new URLSearchParams();
    Object.entries(currentParams).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") params.set(key, value);
    });
    Object.entries(next).forEach(([key, value]) => {
      if (value === null || value === undefined || value === "") {
        params.delete(key);
      } else {
        params.set(key, String(value));
      }
    });
    router.push(`/propertySearch?${params.toString()}`);
    setTimeout(() => setIsLoading(false), 600);
  };

  const selectedListingType = ((["SELL", "RENT", "PG"] as ListingType[]).includes(currentParams.listingType as ListingType)
    ? (currentParams.listingType as ListingType)
    : "SELL") as ListingType;
  const [activeListingType, setActiveListingType] = useState<ListingType>(selectedListingType);

  React.useEffect(() => {
    setActiveListingType(selectedListingType);
  }, [selectedListingType]);

  React.useEffect(() => {
    if (searchParams.get("openFilters") === "1" && !hasOpenedFiltersOnce.current) {
      hasOpenedFiltersOnce.current = true;
      setShowMobileFilters(true);

      const params = new URLSearchParams(Array.from(searchParams.entries()));
      params.delete("openFilters");
      router.replace(`/propertySearch?${params.toString()}`, { scroll: false });
    }
  }, [router, searchParams]);

  const handleHeroSearch = (params: { location: string; listingType: ListingType }) => {
    updateSearchParams({ q: params.location || null, listingType: params.listingType });
  };

  const listingTitles: Record<ListingType, string> = {
    SELL: "Browse properties for sale",
    RENT: "Search homes and offices for rent",
    PG: "Discover PG / co-living stays",
  };
  const breadcrumbLabels: Record<ListingType, string> = {
    SELL: "Buy property",
    RENT: "Rentals",
    PG: "PG / Co-living",
  };
  const filterConfig = listingFilterConfigs[activeListingType] ?? listingFilterConfigs.SELL;
  const defaultFilters = useMemo(() => getDefaultSelectedFilters(filterConfig), [filterConfig]);
  const [selectedFilters, setSelectedFilters] = useState<string[]>(defaultFilters);
  const selectedFiltersCount = selectedFilters.length;

  const handleFiltersChange = (next: string[]) => {
    setSelectedFilters(Array.from(new Set(next)));
  };

  React.useEffect(() => {
    setSelectedFilters(defaultFilters);
  }, [defaultFilters, filterConfig, activeListingType]);

  return (
    <main className="relative min-h-screen bg-gradient-to-b from-rose-50/50 via-white to-emerald-50/40 text-slate-900">
      <HeaderNav />
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-10">
        <div className="relative flex flex-col gap-4">
          <nav className="inline-flex items-center gap-2 self-start rounded-full border border-rose-100 bg-white px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm">
            Home <span className="text-rose-500">›</span> {breadcrumbLabels[activeListingType]}
          </nav>
          <h1 className="text-xl font-semibold text-slate-900">{listingTitles[activeListingType]}</h1>
          <div className="relative flex flex-col gap-2 md:gap-3">
            <HeroSearch
              variant="embedded"
              eyebrowText="Switch between Buy, Rent, or PG and update your search instantly"
              initialLocation={(currentParams.q as string) || ""}
              initialListingType={activeListingType}
              onListingTypeChange={setActiveListingType}
              onSearch={({ location, listingType }) => handleHeroSearch({ location, listingType })}
              className="mt-1"
              trailingActionMobile={
                <button
                  type="button"
                  onClick={() => setShowMobileFilters(true)}
                  className="relative inline-flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-white shadow-md shadow-slate-300 transition hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-slate-300"
                >
                  <SlidersHorizontal className="h-4 w-4" />
                  {selectedFiltersCount > 0 && (
                    <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-amber-400 px-1 text-[11px] font-semibold text-slate-900 shadow-sm">
                      {selectedFiltersCount}
                    </span>
                  )}
                </button>
              }
              trailingActionDesktop={
                <button
                  type="button"
                  onClick={() => setShowMobileFilters(true)}
                  className="relative inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm transition hover:-translate-y-0.5"
                >
                  <SlidersHorizontal className="h-4 w-4 text-slate-500" />
                  Filters
                  {selectedFiltersCount > 0 && (
                    <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-amber-400 px-1 text-[11px] font-semibold text-slate-900 shadow-sm">
                      {selectedFiltersCount}
                    </span>
                  )}
                </button>
              }
            />
          </div>
          <div className="flex flex-col gap-4 lg:flex-row">
            {isLoading ? <ResultsSkeleton /> : <ResultsList />}
          </div>
        </div>
      </div>
      {showMobileFilters && (
        <div className="fixed inset-0 z-50 flex items-end justify-center px-3 md:items-center">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowMobileFilters(false)} />
          <div className="relative w-full max-w-xl rounded-t-3xl border border-slate-200 bg-white p-4 shadow-2xl md:max-w-4xl md:rounded-3xl">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-900">Filters</p>
              <button
                type="button"
                className="text-xs font-semibold text-sky-600 hover:text-indigo-600"
                onClick={() => setShowMobileFilters(false)}
              >
                Close
              </button>
            </div>
            <div className="max-h-[70vh] overflow-y-auto">
              <FiltersPanel
                asDrawer
                listingType={activeListingType}
                appliedFilters={selectedFilters}
                onFiltersChange={handleFiltersChange}
              />
            </div>
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                className="w-full rounded-full border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-800 shadow-sm"
                onClick={() => setShowMobileFilters(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="w-full rounded-full bg-slate-900 px-3 py-2 text-sm font-semibold text-white shadow-sm"
                onClick={() => setShowMobileFilters(false)}
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
