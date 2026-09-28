"use client";

import React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { HeaderNav } from "../homePage/components/HeaderNav";
import { ResultsList } from "./components/ResultsList";
import { SearchBar } from "@/components/search/SearchBar";
import { QuickFilterChips } from "@/components/search/QuickFilterChips";
import { AppliedChips } from "@/components/search/AppliedChips";
import { SortMenu } from "@/components/search/SortMenu";
import { FilterRail, FilterSheet } from "@/components/search/FilterSheet";
import { useSearchResults } from "@/components/search/useSearchResults";
import {
  buildSearchParams,
  countActiveFilters,
  parseSearchParams,
  type SearchState,
} from "@/components/search/searchQuery";

export function SearchPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const state = React.useMemo(
    () => parseSearchParams(new URLSearchParams(searchParams.toString())),
    [searchParams],
  );

  const [sheetOpen, setSheetOpen] = React.useState(false);
  const [sheetFocus, setSheetFocus] = React.useState<string | null>(null);

  const commit = React.useCallback(
    (next: SearchState) => {
      router.push(`/propertySearch?${buildSearchParams(next).toString()}`, { scroll: false });
    },
    [router],
  );

  const results = useSearchResults(state);
  const resultCount = results.refining
    ? results.visible.length
    : results.total ?? results.visible.length;
  const settledCount = results.isLoading ? undefined : resultCount;
  const activeCount = countActiveFilters(state);

  const openFilters = (focusKey?: string) => {
    setSheetFocus(focusKey ?? null);
    setSheetOpen(true);
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <HeaderNav />

      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        {/* sticky search + quick filters — sits just below the site header.
            NB: no `backdrop-blur`/`filter` here — it would become the containing
            block for the SearchBar's `position: fixed` mobile sheet. */}
        <div className="sticky top-16 z-30 -mx-4 space-y-3 border-b border-slate-200 bg-slate-50 px-4 pb-3 pt-3 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
          <SearchBar
            variant="results"
            value={state}
            onChange={commit}
            onSubmit={commit}
            resultCount={settledCount}
            activeFilterCount={activeCount}
            onOpenFilters={() => openFilters()}
          />
          <div className="lg:hidden">
            <QuickFilterChips state={state} onOpenFilters={openFilters} />
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between gap-3">
          <p className="text-sm text-slate-600">
            {results.isLoading ? (
              <span className="text-slate-400">Searching…</span>
            ) : (
              <>
                <span className="text-base font-semibold text-slate-900">
                  {results.refining ? resultCount : results.total ?? resultCount}
                </span>{" "}
                {(results.refining ? resultCount : results.total ?? resultCount) === 1
                  ? "property"
                  : "properties"}{" "}
                to {state.intent === "RENT" || state.intent === "PG" ? "rent" : "buy"}
              </>
            )}
          </p>
          <SortMenu value={state.sort} onChange={(sort) => commit({ ...state, sort })} />
        </div>

        <div className="mt-3 empty:hidden">
          <AppliedChips state={state} onChange={commit} />
        </div>

        <div className="mt-4 flex gap-6">
          <div className="min-w-0 flex-1">
            <ResultsList results={results} />
          </div>
          <FilterRail state={state} onChange={commit} />
        </div>
      </div>

      <FilterSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        state={state}
        onApply={commit}
        focusKey={sheetFocus}
        resultCount={settledCount}
      />
    </main>
  );
}
