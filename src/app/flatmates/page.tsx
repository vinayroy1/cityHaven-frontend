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
  Home,
  UserPlus,
} from "lucide-react";
import dynamic from "next/dynamic";
import { HeaderNav } from "@/app/homePage/components/HeaderNav";
import { FlatmateCard } from "@/components/flatmates/FlatmateCard";
import { FlatmateGridSkeleton } from "@/components/flatmates/FlatmateCardSkeleton";
import { canonicalizeCity, CitySelectorDropdown } from "@/components/search/CitySelectorDropdown";
import { LocationSearchInput } from "@/components/search/LocationSearchInput";
import { FilterRail } from "@/components/search/FilterSheet";
import { countActiveFilters, initialSearchState, type SearchState } from "@/components/search/searchQuery";
import { useSearchFlatmatesQuery } from "@/features/flatmates/api";
import type { FlatmateListing, FlatmateListingMode } from "@/types/flatmate.types";
import { detectUserLocation, getUserPreferredCity } from "@/lib/geo/geoService";

const FilterSheet = dynamic(
  () => import("@/components/search/FilterSheet").then((mod) => mod.FilterSheet),
  { ssr: false }
);

type FlatmatesDiscoveryPageProps = {
  initialCity?: string;
  initialLocality?: string;
  initialItems?: FlatmateListing[];
  initialTotal?: number;
};

const locationSlug = (value: string) => value.trim().toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
const SINGLE_SELECT_FLATMATE_FILTERS = new Set(["flatmateMode", "roomType", "gender", "diet", "bhkTypes", "furnishing"]);

const FLATMATE_MODE_TABS: Array<{
  label: string;
  mode: FlatmateListingMode;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  { label: "Room Available", mode: "HAVE_ROOM", icon: Home },
  { label: "Room Seeker", mode: "NEED_ROOM", icon: Search },
  { label: "Buddy Up", mode: "BUDDY_UP", icon: UserPlus },
];

export default function FlatmatesDiscoveryPage({
  initialCity = "",
  initialLocality = "",
  initialItems = [],
  initialTotal = 0,
}: FlatmatesDiscoveryPageProps) {
  const router = useRouter();
  const [city, setCity] = useState(initialCity);
  const [localities, setLocalities] = useState<string[]>(initialLocality ? [initialLocality] : []);
  const [cityDraft, setCityDraft] = useState(initialCity);
  const [localityDrafts, setLocalityDrafts] = useState<string[]>(initialLocality ? [initialLocality] : []);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filterState, setFilterState] = useState<SearchState>(() => {
    const s = initialSearchState("");
    s.intent = "FLATMATE";
    s.refine.flatmateMode = ["HAVE_ROOM"];
    return s;
  });
  const [appliedFilterState, setAppliedFilterState] = useState<SearchState>(() => {
    const s = initialSearchState("");
    s.intent = "FLATMATE";
    s.refine.flatmateMode = ["HAVE_ROOM"];
    return s;
  });
  const [page, setPage] = useState(1);

  const refine = appliedFilterState.refine;
  const mode = (refine.flatmateMode?.[0] as FlatmateListingMode | undefined) || "HAVE_ROOM";

  const handleSelectMode = (selectedMode: FlatmateListingMode) => {
    const nextFilters: SearchState = {
      ...filterState,
      refine: {
        ...filterState.refine,
        flatmateMode: [selectedMode],
      },
    };
    setFilterState(nextFilters);
    setAppliedFilterState(nextFilters);
    setPage(1);
  };
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

  const hasInitialData = initialItems.length > 0;
  const filteredInitialItems = initialItems.filter((item) => item.mode === mode);
  const listings = data?.items ?? (hasInitialData ? (filteredInitialItems.length > 0 ? filteredInitialItems : initialItems) : []);
  const total = data?.total ?? (hasInitialData ? (filteredInitialItems.length > 0 ? filteredInitialItems.length : initialTotal) : 0);
  const showSkeleton = (isLoading || isFetching) && listings.length === 0;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 flex flex-col transition-colors duration-150">
      <HeaderNav />

      <main className="flex-1 min-w-0 overflow-x-hidden bg-gradient-to-b from-rose-50/60 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 pb-28 sm:pb-12">
        {/* Hero Header Area */}
        <section className="relative overflow-hidden border-b border-slate-200/80 bg-white px-3 py-2.5 dark:border-slate-800 dark:bg-slate-900/60 sm:px-6 sm:py-6 lg:px-8">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(244,63,94,0.08),transparent_40%),radial-gradient(circle_at_85%_30%,rgba(245,158,11,0.08),transparent_40%)]" />

          <div className="relative mx-auto max-w-7xl">
            <div className="flex items-center justify-between gap-4">
              <div className="max-w-2xl space-y-1 sm:space-y-2">
                <div className="hidden w-fit items-center gap-1.5 rounded-full bg-rose-50 px-2.5 py-1 text-[10px] font-bold text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 sm:inline-flex sm:px-3 sm:text-xs">
                  <Users className="w-3.5 h-3.5" />
                  <span>Verified Roommate & Flat Sharing Network</span>
                </div>
                <h1 className="text-base font-extrabold leading-snug tracking-tight text-slate-900 dark:text-white sm:text-3xl md:text-4xl">
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
        <section className="mx-auto w-full max-w-7xl px-3 py-2 sm:px-6 sm:py-5 lg:px-8">
          <div className="flex flex-col gap-2.5 rounded-2xl border border-slate-200/90 bg-white p-3 shadow-xs dark:border-slate-800 dark:bg-slate-900 sm:gap-4 sm:rounded-3xl sm:p-5">
            {/* Header Tabs for Flatmate Category Filter (Like Home Screen Buy / Rent / Commercial) */}
            <div
              className="no-scrollbar flex items-center gap-4 sm:gap-6 overflow-x-auto border-b border-slate-100 pb-1 dark:border-slate-800"
              aria-label="Flatmate categories"
            >
              {FLATMATE_MODE_TABS.map((tab) => {
                const isActive = mode === tab.mode;
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.label}
                    type="button"
                    aria-pressed={isActive}
                    onClick={() => handleSelectMode(tab.mode)}
                    className={`shrink-0 flex items-center gap-1.5 border-b-2 pb-2.5 text-xs sm:text-sm font-bold transition-all ${
                      isActive
                        ? "border-rose-600 text-rose-600 dark:border-rose-400 dark:text-rose-400"
                        : "border-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                    }`}
                  >
                    <Icon className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${isActive ? "text-rose-600 dark:text-rose-400" : "text-slate-400"}`} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="grid grid-cols-[auto_minmax(0,1fr)] gap-2 min-w-0 md:grid-cols-[auto_minmax(12rem,1fr)_auto]">
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
                placeholder={cityDraft ? `Locality in ${cityDraft}` : "Select a city"}
                onChange={({ localities }) => {
                  setLocalityDrafts(localities.map((item) => item.label));
                }}
              />
              <button
                type="button"
                disabled={isLoading || isFetching}
                onClick={() => runSearch()}
                className={`hidden h-11 items-center justify-center gap-2 rounded-xl bg-rose-600 px-6 text-sm font-bold text-white shadow-md shadow-rose-600/20 transition hover:bg-rose-700 active:scale-[0.98] md:flex ${
                  isLoading || isFetching ? "opacity-75 cursor-not-allowed" : ""
                }`}
              >
                {isLoading || isFetching ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Searching...</span>
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4" />
                    <span>Search</span>
                  </>
                )}
              </button>
            </div>

            {/* Mobile Actions: Filters & Search side-by-side to save height */}
            <div className="grid grid-cols-2 gap-2 md:hidden">
              <button
                type="button"
                onClick={() => setFiltersOpen(true)}
                className="flex h-10 w-full items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-2 text-xs font-bold text-slate-800 transition active:scale-[0.98] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              >
                <SlidersHorizontal className="h-3.5 w-3.5 text-rose-600" />
                <span>Filters</span>
                {activeFilterCount > 0 && (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-600 px-1.5 text-[9px] font-bold text-white">
                    {activeFilterCount}
                  </span>
                )}
              </button>
              <button
                type="button"
                disabled={isLoading || isFetching}
                onClick={() => runSearch()}
                className={`flex h-10 w-full items-center justify-center gap-1.5 rounded-xl bg-rose-600 px-3 text-xs font-bold text-white shadow-xs transition active:scale-[0.98] ${
                  isLoading || isFetching ? "opacity-75 cursor-not-allowed" : ""
                }`}
              >
                {isLoading || isFetching ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Searching...</span>
                  </>
                ) : (
                  <>
                    <Search className="h-3.5 w-3.5" />
                    <span>Search</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {filtersOpen && (
            <FilterSheet
              open={filtersOpen}
              onClose={() => setFiltersOpen(false)}
              state={filterState}
              singleSelectKeys={SINGLE_SELECT_FLATMATE_FILTERS}
              onApply={(next) => {
                setFilterState(next);
              }}
            />
          )}

          <div className="mt-4 sm:mt-5 flex items-start gap-6">
            <div className="min-w-0 flex-1">
              {/* Listings count & Active indicator */}
              <div className="my-2.5 sm:my-4 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-0.5">
                <div>
                  <span className="sm:hidden">
                    <span className="font-bold text-slate-900 dark:text-white">{listings.length}</span>{" "}
                    {mode === "HAVE_ROOM"
                      ? "rooms available"
                      : mode === "NEED_ROOM"
                        ? "room seekers"
                        : "buddy-up listings"}{" "}
                    {city ? <span className="font-medium text-rose-600">in {city}</span> : ""}
                  </span>
                  <span className="hidden sm:inline">
                    Showing <span className="font-bold text-slate-900 dark:text-white">{listings.length}</span> of{" "}
                    <span className="font-bold text-slate-900 dark:text-white">{total}</span>{" "}
                    {mode === "HAVE_ROOM"
                      ? "rooms available"
                      : mode === "NEED_ROOM"
                        ? "room seekers"
                        : mode === "BUDDY_UP"
                          ? "buddy-up teams"
                          : "flatmate listings"}{" "}
                    in {city ? <span className="font-semibold text-rose-600">{city}</span> : <span>India</span>}
                  </span>
                </div>
                {isFetching && (
                  <div className="flex items-center gap-1.5 rounded-full border border-rose-200/80 bg-rose-50 px-2.5 py-0.5 sm:px-3 sm:py-1 text-[11px] sm:text-xs font-semibold text-rose-600 shadow-xs dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300">
                    <Loader2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 animate-spin" />
                    <span className="hidden xs:inline">Finding flatmates...</span>
                    <span className="xs:hidden">Loading...</span>
                  </div>
                )}
              </div>


          {/* Cards Grid */}
          {showSkeleton ? (
            <FlatmateGridSkeleton count={6} />
          ) : listings.length > 0 ? (
            <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 sm:gap-4.5">
              {listings.map((item, idx) => (
                <FlatmateCard key={item.id} listing={item} priority={idx < 2} />
              ))}
            </div>
          ) : (
            <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4 my-8">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-rose-50 text-rose-500 dark:bg-rose-950/40">
                <Users className="h-8 w-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  No {mode === "HAVE_ROOM" ? "rooms available" : mode === "NEED_ROOM" ? "room seekers" : mode === "BUDDY_UP" ? "buddy-up listings" : "flatmate listings"} found in {city} {localities.length ? `(${localities.join(", ")})` : ""}
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
