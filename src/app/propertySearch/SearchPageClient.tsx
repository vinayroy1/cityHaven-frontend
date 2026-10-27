"use client";

import React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Heart, Search, SlidersHorizontal, Loader2 } from "lucide-react";
import { HeaderNav } from "../homePage/components/HeaderNav";
import { FooterLinks } from "../homePage/components/FooterLinks";
import { BrandLogo } from "@/components/common/BrandLogo";
import { BackButton } from "@/components/common/BackButton";
import { ResultsList } from "./components/ResultsList";
import { SearchBar, SearchEditor } from "@/components/search/SearchBar";
import { MobileSearchFlow } from "@/components/search/MobileSearchFlow";
import { QuickFilterChips } from "@/components/search/QuickFilterChips";
import { AppliedChips } from "@/components/search/AppliedChips";
import { SortMenu } from "@/components/search/SortMenu";
import { FilterRail, FilterSheet } from "@/components/search/FilterSheet";
import { useSearchResults } from "@/components/search/useSearchResults";
import {
  buildSearchHref,
  countActiveFilters,
  parseSearchParams,
  type IntentKey,
  type SearchState,
} from "@/components/search/searchQuery";
import { getUserPreferredCity, detectUserLocation } from "@/lib/geo/geoService";

type SearchPageClientProps = {
  routeCity?: string;
  routeLocalities?: string[];
  routeIntent?: IntentKey;
  routeState?: string;
};

export function SearchPageClient({ routeCity, routeLocalities = [], routeIntent, routeState }: SearchPageClientProps = {}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const routeLocalitiesKey = routeLocalities.join("\u001f");

  const state = React.useMemo(() => {
    const parsed = parseSearchParams(new URLSearchParams(searchParams.toString()));
    if (routeIntent) parsed.intent = routeIntent;
    if (routeState && !parsed.q) parsed.q = routeState;
    if (routeCity) parsed.cityName = routeCity;
    const pathLocalities = routeLocalitiesKey ? routeLocalitiesKey.split("\u001f") : [];
    if (pathLocalities.length > 0) {
      parsed.localities = pathLocalities.slice(0, 2).map((label) => ({ label, city: routeCity }));
    }
    return parsed;
  }, [searchParams, routeCity, routeLocalitiesKey, routeIntent, routeState]);

  React.useEffect(() => {
    // Restore browser-only city preferences after hydration. Keeping storage
    // reads out of render prevents server/client text mismatches.
    // Legacy /propertySearch may restore a saved location. Canonical intent
    // landings such as /buy and /rent must remain nationwide until the user
    // explicitly selects a city; otherwise crawlers and users see different URLs.
    if (!routeIntent && !routeState && !state.cityName && state.localities.length === 0) {
      const preferredCity = getUserPreferredCity();
      if (preferredCity) {
        router.replace(buildSearchHref({ ...state, cityName: preferredCity }), { scroll: false });
        return;
      }

      void detectUserLocation().then((profile) => {
        if (profile?.city) {
          const next = { ...state, cityName: profile.city };
          router.replace(buildSearchHref(next), { scroll: false });
        }
      });
    }
  }, [state, router, routeIntent, routeState]);

  const [sheetOpen, setSheetOpen] = React.useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = React.useState(false);
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
      router.push(buildSearchHref(next), { scroll: false });
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
    if (typeof window !== "undefined" && window.innerWidth < 640) {
      setMobileSearchOpen(true);
      return;
    }
    setSheetFocus(focusKey ?? null);
    setSheetOpen(true);
  };

  const [isMobileSearching, setIsMobileSearching] = React.useState(false);

  const handleMobileHeaderSubmit = () => {
    if (isMobileSearching || results.isLoading) return;
    setIsMobileSearching(true);
    commit(state);
    setTimeout(() => setIsMobileSearching(false), 2000);
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 transition-colors duration-150">
      <HeaderNav isMobileHidden={isScrolledDown} hideOnPhone />

      <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/95 px-2 pb-2 shadow-xs backdrop-blur-xl sm:hidden dark:border-slate-800 dark:bg-slate-950/95">
        <div className="grid h-12 grid-cols-[2.75rem_1fr_2.75rem] items-center">
          <BackButton fallbackHref="/" variant="ghost" size="md" ariaLabel="Back to Home" />
          <div className="flex justify-center">
            <BrandLogo size="sm" />
          </div>
          <Link
            href="/favorites"
            aria-label="Saved properties"
            className="flex h-10 w-10 items-center justify-center rounded-full text-slate-600 active:bg-slate-100 dark:text-slate-300 dark:active:bg-slate-800"
          >
            <Heart size={20} />
          </Link>
        </div>
        <div className="flex h-10 w-full items-center gap-2 overflow-hidden rounded-xl border border-slate-200 bg-slate-50 pl-3 shadow-inner transition dark:border-slate-700 dark:bg-slate-900">
          <button
            type="button"
            onClick={() => setMobileSearchOpen(true)}
            aria-label="Open search filters"
            className="flex min-w-0 flex-1 items-center gap-2 text-left focus:outline-none"
          >
            <Search size={16} className="shrink-0 text-rose-600 dark:text-rose-400" />
            <span className="min-w-0 flex-1 truncate text-xs font-semibold text-slate-800 dark:text-slate-100">
              {[state.cityName, ...state.localities.map((locality) => locality.label), state.q]
                .filter(Boolean)
                .join(" • ") || "Search locality, project or landmark"}
            </span>
          </button>
          <button
            type="button"
            disabled={isMobileSearching || results.isLoading}
            onClick={handleMobileHeaderSubmit}
            aria-label="Submit search"
            className={`flex h-full shrink-0 items-center justify-center gap-1.5 bg-rose-600 px-3.5 text-xs font-bold text-white transition hover:bg-rose-700 active:scale-[0.98] dark:bg-rose-500 ${
              isMobileSearching || results.isLoading ? "opacity-80 cursor-not-allowed" : ""
            }`}
          >
            {isMobileSearching || results.isLoading ? (
              <>
                <Loader2 size={13} className="animate-spin" />
                <span>Searching...</span>
              </>
            ) : (
              <span>Search</span>
            )}
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-3 pb-4 pt-2 sm:px-6 sm:pt-4 lg:px-8">
        {/* sticky search + quick filters — sits just below the site header on desktop,
            docks directly to top-0 when user scrolls down on mobile to maximize viewport. */}
        <div
          className={`sticky z-30 -mx-4 hidden border-b border-slate-200 bg-slate-50 px-4 dark:border-slate-800 dark:bg-slate-950 sm:-mx-6 sm:block sm:px-6 lg:-mx-8 lg:px-8 lg:top-16 transition-[top,padding,box-shadow] duration-200 ease-out ${
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
        <div className="mt-3 sm:mt-4 flex flex-wrap items-baseline justify-between gap-2 border-b border-slate-200/60 pb-3 dark:border-slate-800/60">
          <div>
            <h1 className="text-base sm:text-xl font-bold tracking-tight text-slate-950 dark:text-white">
              {state.cityName || state.localities?.[0]?.label
                ? `${state.intent === "FLATMATE" ? "Flatmates & Shared Homes in" : "Properties in"} ${[state.localities?.[0]?.label, state.cityName].filter(Boolean).join(", ")}`
                : state.intent === "FLATMATE"
                  ? "Flatmates & Shared Homes in India"
                  : "Verified Properties in India"}
              <span className="ml-1.5 font-normal text-slate-500 text-xs sm:text-sm dark:text-slate-400 capitalize">
                • {state.intent === "RENT" ? "Rent" : state.intent === "PG" ? "PG & Co-Living" : state.intent === "FLATMATE" ? "Flatmate" : state.intent === "COMMERCIAL" ? "Commercial" : "Buy & Rent"}
              </span>
            </h1>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              {settledCount !== undefined
                ? `${settledCount} verified ${state.intent === "FLATMATE" ? "flatmate listings" : "listings"} match your criteria`
                : state.intent === "FLATMATE"
                  ? "Fetching latest verified flatmates..."
                  : "Fetching latest verified properties..."}
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-3">
            <SortMenu value={state.sort} onChange={(sort) => commit({ ...state, sort })} />
          </div>
        </div>

        <div className="mt-3 hidden empty:hidden sm:block">
          <AppliedChips state={state} onChange={commit} />
        </div>

        <div className="mt-0 flex gap-6 sm:mt-4">
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

      <MobileSearchFlow
        open={mobileSearchOpen}
        onClose={() => setMobileSearchOpen(false)}
        value={state}
        resultCount={settledCount}
        renderSearchEditor={(draft, setDraft) => (
          <SearchEditor variant="hero" value={draft} onSubmit={setDraft} onContextChange={setDraft} showSubmit={false} liveChanges />
        )}
        onSubmit={(next) => {
          commit(next);
        }}
      />

      {/* Floating Bottom Filter Button (NoBroker / 99acres style on mobile) */}
      <div className="fixed bottom-[calc(5rem+env(safe-area-inset-bottom))] right-4 z-40 md:hidden">
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
