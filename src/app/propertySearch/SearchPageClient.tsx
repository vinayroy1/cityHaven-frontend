"use client";

import React, { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { HeaderNav } from "../homePage/components/HeaderNav";
import { SearchToolbar } from "./components/SearchToolbar";
import { FiltersPanel } from "./components/FiltersPanel";
import { ResultsList } from "./components/ResultsList";
import { AppliedFilters } from "./components/AppliedFilters";
import { appliedFilters } from "./data";

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

export function SearchPageClient() {
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

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

  const handleSearchSubmit = (query: string) => {
    updateSearchParams({ q: query || null });
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <HeaderNav />
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-6 sm:px-6">
        <nav className="text-xs text-slate-500">Home › Commercial Property</nav>
        <h1 className="text-xl font-semibold text-slate-900">Commercial Property</h1>
        <SearchToolbar
          onOpenFilters={() => setShowMobileFilters(true)}
          onSearchSubmit={handleSearchSubmit}
          initialQuery={(currentParams.q as string) || ""}
        />
        <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
          <AppliedFilters filters={appliedFilters} />
        </div>

        <div className="flex flex-col gap-4 lg:flex-row">
          <div className="hidden lg:block">
            <FiltersPanel />
          </div>
          {isLoading ? <ResultsSkeleton /> : <ResultsList />}
        </div>

      </div>
      {showMobileFilters && (
        <div className="fixed inset-0 z-50 flex items-end justify-center px-3">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowMobileFilters(false)} />
          <div className="relative w-full max-w-xl rounded-t-3xl border border-slate-200 bg-white p-4 shadow-2xl">
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
              <FiltersPanel asDrawer />
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
