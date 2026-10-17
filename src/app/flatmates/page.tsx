"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Users,
  Search,
  PlusCircle,
  Loader2,
  SlidersHorizontal,
  ChevronRight,
} from "lucide-react";
import { HeaderNav } from "@/app/homePage/components/HeaderNav";
import { FlatmateCard } from "@/components/flatmates/FlatmateCard";
import { canonicalizeCity, CitySelectorDropdown } from "@/components/search/CitySelectorDropdown";
import { LocationSearchInput } from "@/components/search/LocationSearchInput";
import { FilterRail, FilterSheet } from "@/components/search/FilterSheet";
import { countActiveFilters, initialSearchState, type SearchState } from "@/components/search/searchQuery";
import { useSearchFlatmatesQuery } from "@/features/flatmates/api";
import type { FlatmateListingMode } from "@/types/flatmate.types";
import { detectUserLocation, getUserPreferredCity } from "@/lib/geo/geoService";

type FlatmatesDiscoveryPageProps = { initialCity?: string; initialLocality?: string };

const locationSlug = (value: string) => value.trim().toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
const SINGLE_SELECT_FLATMATE_FILTERS = new Set(["flatmateMode", "roomType", "gender", "diet", "bhkTypes", "furnishing"]);

export default function FlatmatesDiscoveryPage({ initialCity = "", initialLocality = "" }: FlatmatesDiscoveryPageProps) {
  const router = useRouter();
  const [city, setCity] = useState(initialCity);
  const [localities, setLocalities] = useState<string[]>(initialLocality ? [initialLocality] : []);
  const [cityDraft, setCityDraft] = useState(initialCity);
  const [localityDrafts, setLocalityDrafts] = useState<string[]>(initialLocality ? [initialLocality] : []);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filterState, setFilterState] = useState<SearchState>(() => ({ ...initialSearchState(""), intent: "FLATMATE" }));
  const [appliedFilterState, setAppliedFilterState] = useState<SearchState>(() => ({ ...initialSearchState(""), intent: "FLATMATE" }));
  const [page, setPage] = useState(1);

  const refine = appliedFilterState.refine;
  const mode = refine.flatmateMode?.[0] as FlatmateListingMode | undefined;
  const gender = refine.gender?.[0]?.replace(" Only", "");
  const preferredDiet = refine.diet?.[0] === "Any Diet" ? undefined : refine.diet?.[0];
  const lifestyle = refine.lifestyle || [];
  const bhkValue = refine.bhkTypes?.[0];
  const activeFilterCount = countActiveFilters(filterState);

  React.useEffect(() => {
    if (initialCity) return;
    let cancelled = false;

    const applyDetectedCity = (rawCity?: string) => {
      if (cancelled || !rawCity?.trim()) return;
      const normalized = canonicalizeCity({ id: 0, name: rawCity.trim(), slug: locationSlug(rawCity) }).name;
      setCity(normalized);
      setCityDraft(normalized);
      router.replace(`/flatmate/${locationSlug(normalized)}`);
    };

    const preferredCity = getUserPreferredCity();
    if (preferredCity) {
      applyDetectedCity(preferredCity);
      return () => { cancelled = true; };
    }

    void detectUserLocation().then((profile) => applyDetectedCity(profile.city));
    return () => { cancelled = true; };
  }, [initialCity, router]);

  const { data, isLoading, isFetching } = useSearchFlatmatesQuery({
    mode,
    city: city || undefined,
    locality: localities.length ? localities.join(",") : undefined,
    budgetMin: appliedFilterState.priceMin,
    budgetMax: appliedFilterState.priceMax,
    gender: gender || undefined,
    roomType: refine.roomType?.[0] || undefined,
    furnishing: refine.furnishing?.[0] || undefined,
    bhk: bhkValue ? Number.parseInt(bhkValue, 10) : undefined,
    smokingAllowed: lifestyle.includes("SMOKING_ALLOWED")
      ? true
      : lifestyle.includes("NON_SMOKER")
        ? false
        : undefined,
    drinkingAllowed: lifestyle.includes("DRINKING_ALLOWED") ? true : undefined,
    petsAllowed: lifestyle.includes("PET_FRIENDLY") ? true : undefined,
    preferredDiet: preferredDiet || undefined,
    page,
    pageSize: 18,
  });

  const navigateToLocation = (nextCity: string, nextLocalities: string[] = []) => {
    const segments = [nextCity, nextLocalities[0]].map((value) => locationSlug(value || "")).filter(Boolean);
    router.push(`/flatmate${segments.length ? `/${segments.join("/")}` : ""}`);
  };

  const runSearch = (nextFilters = filterState) => {
    setCity(cityDraft);
    setLocalities(localityDrafts);
    setFilterState(nextFilters);
    setAppliedFilterState(nextFilters);
    setPage(1);
    navigateToLocation(cityDraft, localityDrafts);
    if (cityDraft && typeof window !== "undefined") window.localStorage.setItem("awasio.home.city", cityDraft);
  };

  const listings = data?.items || [];
  const total = data?.total || 0;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 flex flex-col transition-colors duration-150">
      <HeaderNav />

      <main className="flex-1 bg-gradient-to-b from-rose-50/60 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        {/* Hero Header Area */}
        <section className="relative overflow-hidden border-b border-slate-200/80 bg-white px-4 py-5 dark:border-slate-800 dark:bg-slate-900/60 sm:px-6 sm:py-8 lg:px-8 lg:py-8">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(244,63,94,0.08),transparent_40%),radial-gradient(circle_at_85%_30%,rgba(245,158,11,0.08),transparent_40%)]" />

          <div className="relative mx-auto max-w-7xl">
            <div className="flex items-center justify-between gap-4">
              <div className="max-w-2xl space-y-1.5 sm:space-y-2">
                <div className="inline-flex w-fit items-center gap-1.5 rounded-full bg-rose-50 px-2.5 py-1 text-[10px] font-bold text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 sm:px-3 sm:text-xs">
                  <Users className="w-3.5 h-3.5" />
                  <span>Verified Roommate & Flat Sharing Network</span>
                </div>
                <h1 className="text-2xl font-extrabold leading-tight tracking-tight text-slate-900 dark:text-white sm:text-4xl">
                  Find Roommates Who Share Your Vibes & Lifestyle
                </h1>
                <p className="hidden max-w-xl text-sm leading-5 text-slate-600 dark:text-slate-400 sm:line-clamp-2">
                  Search rooms available in flats, connect with people looking for flatmates, or buddy up to rent an apartment together with 100% zero brokerage.
                </p>
              </div>

              <div className="hidden shrink-0 items-center gap-3 sm:flex">
                <Link
                  href="/flatmates/post"
                  className="inline-flex items-center gap-2 rounded-full bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm px-6 py-3 shadow-lg shadow-rose-600/25 transition active:scale-95"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Post Flatmate Requirement</span>
                </Link>
              </div>
            </div>

          </div>
        </section>

        {/* Filters and Controls */}
        <section className="mx-auto max-w-7xl px-3 py-3 sm:px-6 sm:py-6 lg:px-8">
          <div className="flex flex-col gap-3 rounded-2xl border border-slate-200/90 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:gap-4 sm:rounded-3xl sm:p-5">
            <div className="grid grid-cols-1 gap-2 md:grid-cols-[auto_minmax(12rem,1fr)_auto]">
              <CitySelectorDropdown
                compact
                selectedCityName={cityDraft}
                onSelectCity={(selectedCity) => {
                  setCityDraft(selectedCity.name);
                  setLocalityDrafts([]);
                }}
              />
              <LocationSearchInput
                cityName={cityDraft}
                localities={localityDrafts.map((label) => ({ label, city: cityDraft }))}
                keyword=""
                maxLocalities={2}
                placeholder={cityDraft ? `Search locality in ${cityDraft}` : "Select a city, then search locality"}
                onChange={({ localities }) => {
                  setLocalityDrafts(localities.map((item) => item.label));
                }}
              />
              <button
                type="button"
                onClick={() => runSearch()}
                className="hidden h-11 items-center justify-center gap-2 rounded-xl bg-rose-600 px-6 text-sm font-bold text-white shadow-md shadow-rose-600/20 transition hover:bg-rose-700 active:scale-[0.98] md:flex"
              >
                <Search className="h-4 w-4" />
                Search
              </button>
              <button
                type="button"
                onClick={() => setFiltersOpen(true)}
                className="flex h-11 w-full items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3.5 text-left transition hover:border-rose-300 hover:bg-rose-50/50 dark:border-slate-700 dark:bg-slate-800 dark:hover:border-rose-700 dark:hover:bg-rose-950/20 md:hidden"
              >
                <span className="flex items-center gap-2.5">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-rose-600 shadow-sm dark:bg-slate-900 dark:text-rose-400">
                    <SlidersHorizontal className="h-4 w-4" />
                  </span>
                  <span>
                    <span className="block text-xs font-bold text-slate-900 dark:text-white">All filters</span>
                    <span className="block text-[10px] text-slate-500 dark:text-slate-400">Mode, budget, room and lifestyle</span>
                  </span>
                </span>
                <span className="flex items-center gap-2">
                  {activeFilterCount > 0 && (
                    <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-rose-600 px-2 text-[10px] font-bold text-white">
                      {activeFilterCount}
                    </span>
                  )}
                  <ChevronRight className="h-4 w-4 text-slate-400" />
                </span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => runSearch()}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-rose-600 text-sm font-bold text-white shadow-md shadow-rose-600/20 transition active:scale-[0.99] md:hidden"
            >
              <Search className="h-4 w-4" />
              Search Flatmates
            </button>
          </div>

          <FilterSheet
            open={filtersOpen}
            onClose={() => setFiltersOpen(false)}
            state={filterState}
            singleSelectKeys={SINGLE_SELECT_FLATMATE_FILTERS}
            onApply={(next) => {
              setFilterState(next);
            }}
          />

          <div className="flex items-start gap-6">
            <div className="min-w-0 flex-1">
          {/* Listings count & Active indicator */}
          <div className="my-5 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <div>
              Showing <span className="font-bold text-slate-900 dark:text-white">{listings.length}</span> of{" "}
              <span className="font-bold text-slate-900 dark:text-white">{total}</span> flatmate listings in{" "}
              {city ? <span className="font-semibold text-rose-600">{city}</span> : <span>India</span>}
            </div>
            {isFetching && (
              <div className="flex items-center gap-1 text-rose-600">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Updating...</span>
              </div>
            )}
          </div>

          {/* Cards Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="h-80 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 animate-pulse space-y-4"
                >
                  <div className="h-44 w-full rounded-2xl bg-slate-200 dark:bg-slate-800" />
                  <div className="h-4 w-3/4 rounded bg-slate-200 dark:bg-slate-800" />
                  <div className="h-4 w-1/2 rounded bg-slate-200 dark:bg-slate-800" />
                </div>
              ))}
            </div>
          ) : listings.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
              {listings.map((item) => (
                <FlatmateCard key={item.id} listing={item} />
              ))}
            </div>
          ) : (
            <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4 my-8">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-rose-50 text-rose-500 dark:bg-rose-950/40">
                <Users className="h-8 w-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  No flatmate listings found in {city} {localities.length ? `(${localities.join(", ")})` : ""}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                  Be the first one to post a room or your requirement in this area and connect with thousands of active room seekers!
                </p>
              </div>
              <div className="pt-2">
                <Link
                  href="/flatmates/post"
                  className="inline-flex items-center gap-2 rounded-full bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs px-6 py-2.5 shadow-md shadow-rose-600/20"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Post First Flatmate Listing</span>
                </Link>
              </div>
            </div>
          )}
            </div>

            <div className="hidden pt-5 md:block">
              <FilterRail
                state={filterState}
                singleSelectKeys={SINGLE_SELECT_FLATMATE_FILTERS}
                deferred
                onChange={setFilterState}
              />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
