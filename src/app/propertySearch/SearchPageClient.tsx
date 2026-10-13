"use client";

import React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SlidersHorizontal } from "lucide-react";
import { HeaderNav } from "../homePage/components/HeaderNav";
import { FooterLinks } from "../homePage/components/FooterLinks";
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
  const [isScrolledDown, setIsScrolledDown] = React.useState(false);

  React.useEffect(() => {
    let lastScrollY = window.scrollY;
    let downwardDistance = 0;
    let upwardDistance = 0;
    let frame: number | null = null;
    let compact = false;

    const updateFromScroll = () => {
      frame = null;
      const currentScrollY = window.scrollY;

      // Always restore full header near the top
      if (currentScrollY <= 40) {
        downwardDistance = 0;
        upwardDistance = 0;
        if (compact) {
          compact = false;
          setIsScrolledDown(false);
        }
        lastScrollY = currentScrollY;
        return;
      }

      // Body locking and keyboard focus can emit synthetic scroll events. They
      // must not change the sticky-header mode while a sheet/input is active.
      const activeElement = document.activeElement as HTMLElement | null;
      const inputFocused = Boolean(activeElement?.matches("input, textarea, select, [contenteditable='true']"));
      const modalOpen = Boolean(document.querySelector('[role="dialog"], [data-vaul-drawer], [data-city-modal="true"]'));
      if (inputFocused || modalOpen) {
        lastScrollY = currentScrollY;
        return;
      }

      const diff = currentScrollY - lastScrollY;
      if (diff > 0) {
        downwardDistance += diff;
        upwardDistance = 0;
      } else if (diff < 0) {
        upwardDistance -= diff;
        downwardDistance = 0;
      }

      // Use separate, deliberately wide thresholds. This prevents the height
      // change caused by compacting the bar from immediately reversing state.
      if (!compact && currentScrollY > 100 && downwardDistance >= 32) {
        compact = true;
        downwardDistance = 0;
        setIsScrolledDown(true);
      } else if (compact && upwardDistance >= 56) {
        compact = false;
        upwardDistance = 0;
        setIsScrolledDown(false);
      }

      lastScrollY = currentScrollY;
    };

    const handleScroll = () => {
      if (frame === null) frame = window.requestAnimationFrame(updateFromScroll);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (frame !== null) window.cancelAnimationFrame(frame);
    };
  }, []);

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
    <main className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 transition-colors duration-150">
      <HeaderNav isMobileHidden={isScrolledDown} />

      <div className="mx-auto max-w-7xl px-4 pt-1 sm:pt-4 pb-4 sm:px-6 lg:px-8">
        {/* sticky search + quick filters — sits just below the site header on desktop,
            docks directly to top-0 when user scrolls down on mobile to maximize viewport. */}
        <div
          className={`sticky z-30 -mx-4 border-b border-slate-200 bg-slate-50 px-4 dark:border-slate-800 dark:bg-slate-950 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 lg:top-16 transition-[top,padding,box-shadow] duration-200 ease-out ${
            isScrolledDown ? "top-0 py-2 shadow-xs" : "top-16 py-3 space-y-2.5"
          }`}
        >
          <SearchBar
            variant="results"
            value={state}
            onChange={commit}
            onSubmit={commit}
            resultCount={settledCount}
            activeFilterCount={activeCount}
            compact={isScrolledDown}
            onBack={() => {
              if (typeof window !== "undefined" && window.history.length > 1) {
                router.back();
              } else {
                router.push("/");
              }
            }}
            onOpenFilters={() => openFilters()}
          />
          <div
            className={`md:hidden overflow-hidden transition-[max-height,opacity,margin] duration-200 ease-out ${
              isScrolledDown
                ? "max-h-0 opacity-0 pointer-events-none -mt-1"
                : "max-h-16 opacity-100 mt-2"
            }`}
          >
            <QuickFilterChips state={state} onOpenFilters={openFilters} />
          </div>
        </div>

        {/* Semantic H1 & Results Status Bar for Google SEO & UX */}
        <div className="mt-4 flex flex-wrap items-baseline justify-between gap-2 border-b border-slate-200/60 pb-3 dark:border-slate-800/60">
          <div>
            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-950 dark:text-white">
              {state.cityName || state.localities?.[0]?.label
                ? `Properties in ${[state.localities?.[0]?.label, state.cityName].filter(Boolean).join(", ")}`
                : "Verified Properties in India"}
              <span className="ml-1.5 font-normal text-slate-500 text-sm dark:text-slate-400 capitalize">
                • {state.intent === "RENT" ? "Rent" : state.intent === "PG" ? "PG & Co-Living" : state.intent === "COMMERCIAL" ? "Commercial" : "Buy & Rent"}
              </span>
            </h1>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              {settledCount !== undefined
                ? `${settledCount} verified listings match your criteria`
                : "Fetching latest verified properties..."}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <SortMenu value={state.sort} onChange={(sort) => commit({ ...state, sort })} />
          </div>
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

      {/* Floating Bottom Filter Button (NoBroker / 99acres style on mobile) */}
      <div className="fixed bottom-6 left-1/2 z-40 -translate-x-1/2 md:hidden">
        <button
          type="button"
          onClick={() => openFilters()}
          className="flex items-center gap-2 rounded-full bg-slate-900 px-5 py-3 text-xs font-bold text-white shadow-xl shadow-slate-950/30 transition hover:bg-slate-800 active:scale-95 border border-slate-700/60 dark:bg-rose-600 dark:border-rose-500/80 dark:shadow-rose-950/40"
        >
          <SlidersHorizontal size={15} />
          <span>Filters</span>
          {activeCount > 0 && (
            <span className="flex h-4 min-w-[16px] items-center justify-center rounded-full bg-rose-600 dark:bg-white dark:text-rose-600 px-1 text-[10px] font-black text-white">
              {activeCount}
            </span>
          )}
        </button>
      </div>

      <FooterLinks />
    </main>
  );
}
