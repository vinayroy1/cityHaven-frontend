"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Loader2, MapPin, RotateCcw, SearchX } from "lucide-react";
import { SearchBar } from "@/components/search/SearchBar";
import { buildSearchHref, buildSearchParams, initialSearchState, type SearchState } from "@/components/search/searchQuery";
import { usePropertySearchInfinite } from "@/features/propertyListing/useQueries";
import { ResultCard } from "@/app/propertySearch/components/ResultCard";
import { toResultCardProps } from "@/app/propertySearch/components/propertyCardAdapter";
import type { PropertySearchItem } from "@/types/propertySearch.types";

const CITY_OPTIONS = ["Delhi", "Gurugram", "Noida", "Mumbai", "Bengaluru", "Pune", "Hyderabad"];
const STORAGE_KEY = "cityhaven.home.city";

export function HomeExperience() {
  const [selectedCity, setSelectedCity] = React.useState("");
  const [searchState, setSearchState] = React.useState<SearchState>(() => initialSearchState());

  React.useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved && CITY_OPTIONS.includes(saved)) setSelectedCity(saved);
  }, []);

  const updateCity = (city: string) => {
    setSelectedCity(city);
    if (city) window.localStorage.setItem(STORAGE_KEY, city);
    else window.localStorage.removeItem(STORAGE_KEY);
  };

  const submit = (next: SearchState) => {
    const state = { ...next, cityName: selectedCity || undefined };
    setSearchState(state);
    window.location.href = `/propertySearch?${buildSearchParams(state).toString()}`;
  };

  const query = usePropertySearchInfinite({
    listingType: searchState.intent === "RENT" || searchState.intent === "PG" ? searchState.intent : "SELL",
    cityName: selectedCity || undefined,
    sort: "newest",
    pageSize: 12,
  });

  const listings = (query.items as PropertySearchItem[]) ?? [];
  const ownerListings = listings.filter((item) => item.postedAs === "OWNER").slice(0, 4);
  const budgetListings = listings.filter((item) => item.price != null && item.price <= (searchState.intent === "RENT" ? 50000 : 10000000)).slice(0, 4);
  const localities = topLocalities(listings);

  return (
    <>
      <section className="overflow-x-clip border-b border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950">
        <div className="mx-auto grid max-w-6xl gap-5 px-4 py-6 sm:px-6 lg:grid-cols-[1fr_320px] lg:items-end">
          <div className="min-w-0 w-full space-y-4">
            <div>
              <h1 className="text-2xl font-bold tracking-normal text-slate-950 sm:text-3xl dark:text-white">CityHaven</h1>
              <p className="mt-1 max-w-2xl text-sm text-slate-600 dark:text-slate-400">
                Search real approved listings by city, locality, project, property type and budget.
              </p>
            </div>
            <SearchBar
              variant="hero"
              value={{ ...searchState, cityName: selectedCity || undefined }}
              onChange={setSearchState}
              onSubmit={submit}
            />

            {/* Mobile single-row horizontal scrollable city chips */}
            <div className="flex w-full max-w-full items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 sm:hidden">
              <span className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 shrink-0">
                <MapPin className="h-3 w-3 text-rose-500" />
                City:
              </span>
              <button
                type="button"
                onClick={() => updateCity("")}
                className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold transition active:scale-95 ${
                  !selectedCity
                    ? "bg-slate-900 text-white shadow-sm dark:bg-white dark:text-slate-950"
                    : "bg-white border border-slate-200 text-slate-700 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
                }`}
              >
                All
              </button>
              {CITY_OPTIONS.map((city) => (
                <button
                  key={city}
                  type="button"
                  onClick={() => updateCity(city)}
                  className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold transition active:scale-95 ${
                    selectedCity === city
                      ? "bg-rose-600 text-white shadow-sm shadow-rose-600/30"
                      : "bg-white border border-slate-200 text-slate-700 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
                  }`}
                >
                  {city}
                </button>
              ))}
            </div>
          </div>

          <div className="hidden rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900 sm:block">
            <p className="flex items-center gap-1.5 text-xs font-semibold uppercase text-slate-500">
              <MapPin className="h-3.5 w-3.5" />
              Active city
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => updateCity("")}
                className={`rounded-full border px-3 py-1.5 text-sm font-semibold ${!selectedCity ? "border-slate-900 bg-slate-900 text-white dark:border-white dark:bg-white dark:text-slate-950" : "border-slate-200 text-slate-700 dark:border-slate-700 dark:text-slate-300"}`}
              >
                All
              </button>
              {CITY_OPTIONS.map((city) => (
                <button
                  key={city}
                  type="button"
                  onClick={() => updateCity(city)}
                  className={`rounded-full border px-3 py-1.5 text-sm font-semibold ${selectedCity === city ? "border-rose-600 bg-rose-600 text-white" : "border-slate-200 text-slate-700 dark:border-slate-700 dark:text-slate-300"}`}
                >
                  {city}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-6xl overflow-x-clip px-4 py-7 sm:px-6">
        <ListingBlock
          title={selectedCity ? `Fresh listings in ${selectedCity}` : "Fresh listings"}
          href={buildSearchHref({ ...initialSearchState(), cityName: selectedCity || undefined, sort: "newest" })}
          loading={query.isLoading}
          error={query.isError}
          onRetry={() => query.refetch()}
          listings={listings.slice(0, 8)}
        />

        {ownerListings.length > 0 && (
          <ListingBlock
            title="Owner-listed homes"
            href={buildSearchHref({ ...initialSearchState(), cityName: selectedCity || undefined, refine: { ...initialSearchState().refine, postedAs: ["OWNER"] } })}
            listings={ownerListings}
          />
        )}

        {budgetListings.length > 0 && (
          <ListingBlock
            title={searchState.intent === "RENT" ? "Rentals under Rs 50,000/month" : "Homes under Rs 1 crore"}
            href={buildSearchHref({
              ...initialSearchState(),
              cityName: selectedCity || undefined,
              intent: searchState.intent,
              priceMax: searchState.intent === "RENT" ? 50000 : 10000000,
            })}
            listings={budgetListings}
          />
        )}

        {localities.length > 0 && (
          <section className="mt-9">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-950 dark:text-white">Explore localities</h2>
            </div>
            <div className="flex w-full gap-2.5 overflow-x-auto pb-3 no-scrollbar snap-x sm:grid sm:grid-cols-2 sm:overflow-visible sm:pb-0 lg:grid-cols-4">
              {localities.map((locality) => (
                <Link
                  key={locality.name}
                  href={buildSearchHref({ ...initialSearchState(), cityName: selectedCity || undefined, q: locality.name })}
                  className="w-[58vw] max-w-[210px] shrink-0 snap-start rounded-lg border border-slate-200 bg-white p-3 text-sm font-semibold text-slate-800 transition hover:border-rose-200 hover:text-rose-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 sm:w-auto sm:max-w-none"
                >
                  {locality.name}
                  <span className="mt-1 block text-xs font-normal text-slate-500">{locality.count} listings</span>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>
    </>
  );
}

function ListingBlock({
  title,
  href,
  listings,
  loading,
  error,
  onRetry,
}: {
  title: string;
  href: string;
  listings: PropertySearchItem[];
  loading?: boolean;
  error?: boolean;
  onRetry?: () => void;
}) {
  return (
    <section className="mt-9">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-slate-950 dark:text-white">{title}</h2>
        <Link href={href} className="inline-flex items-center gap-1 text-sm font-semibold text-rose-700 dark:text-rose-400">
          View all <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
      {loading ? (
        <div className="flex w-full gap-3.5 overflow-x-auto pb-4 pt-1 no-scrollbar snap-x snap-mandatory sm:grid sm:grid-cols-2 sm:gap-3 sm:overflow-visible sm:pb-0 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="w-[76vw] max-w-[295px] shrink-0 snap-start sm:w-auto sm:max-w-none">
              <PropertyCardSkeleton />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="rounded-lg border border-rose-200 bg-rose-50 p-5 text-sm text-rose-800 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-200">
          Could not load listings.
          {onRetry && (
            <button type="button" onClick={onRetry} className="ml-3 inline-flex items-center gap-1 font-semibold">
              <RotateCcw className="h-3.5 w-3.5" /> Retry
            </button>
          )}
        </div>
      ) : listings.length ? (
        <div className="flex w-full gap-3.5 overflow-x-auto pb-4 pt-1 no-scrollbar snap-x snap-mandatory sm:grid sm:grid-cols-2 sm:gap-3 sm:overflow-visible sm:pb-0 lg:grid-cols-4">
          {listings.map((item) => (
            <div key={item.id} className="w-[76vw] max-w-[295px] shrink-0 snap-start sm:w-auto sm:max-w-none">
              <ResultCard {...toResultCardProps(item)} />
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-slate-200 bg-white p-8 text-center dark:border-slate-800 dark:bg-slate-900">
          <SearchX className="mx-auto h-7 w-7 text-slate-400" />
          <p className="mt-2 text-sm font-semibold text-slate-800 dark:text-slate-200">No approved listings found here yet</p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Try another city or search a nearby locality.</p>
        </div>
      )}
    </section>
  );
}

function topLocalities(items: PropertySearchItem[]) {
  const counts = new Map<string, number>();
  for (const item of items) {
    const name = item.locality?.trim();
    if (!name) continue;
    counts.set(name, (counts.get(name) ?? 0) + 1);
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([name, count]) => ({ name, count }));
}

export function PropertyCardSkeleton() {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 animate-pulse">
      {/* Media skeleton */}
      <div className="relative aspect-[16/10] w-full bg-slate-200 dark:bg-slate-800 sm:aspect-[4/3]">
        {/* Badge skeletons */}
        <div className="absolute left-3 top-3 flex gap-1.5">
          <div className="h-5 w-16 rounded-md bg-slate-300 dark:bg-slate-700" />
          <div className="h-5 w-12 rounded-md bg-slate-300 dark:bg-slate-700" />
        </div>
        {/* Heart icon skeleton */}
        <div className="absolute right-3 top-3 h-8 w-8 rounded-full bg-slate-300/80 dark:bg-slate-700/80" />
      </div>

      {/* Summary skeleton */}
      <div className="flex flex-1 flex-col gap-2.5 p-3 sm:gap-3 sm:p-4">
        {/* Category tag skeleton */}
        <div className="flex gap-1.5">
          <div className="h-4 w-14 rounded bg-slate-200 dark:bg-slate-800" />
          <div className="h-4 w-12 rounded bg-slate-200 dark:bg-slate-800" />
        </div>

        {/* Title skeleton */}
        <div className="space-y-1.5 pt-0.5">
          <div className="h-4 w-4/5 rounded bg-slate-200 dark:bg-slate-800" />
          <div className="h-3 w-1/2 rounded bg-slate-150 dark:bg-slate-850" />
        </div>

        {/* Price skeleton */}
        <div className="h-5 w-28 rounded bg-slate-200 dark:bg-slate-800 mt-0.5" />

        {/* Specs 4-cell grid */}
        <div className="grid grid-cols-2 gap-1.5 pt-1 sm:grid-cols-4">
          <div className="h-9 rounded-lg bg-slate-100 dark:bg-slate-800/60" />
          <div className="h-9 rounded-lg bg-slate-100 dark:bg-slate-800/60" />
          <div className="h-9 rounded-lg bg-slate-100 dark:bg-slate-800/60" />
          <div className="h-9 rounded-lg bg-slate-100 dark:bg-slate-800/60" />
        </div>

        {/* Action button skeleton */}
        <div className="mt-auto pt-2">
          <div className="h-9 w-full rounded-xl bg-slate-200 dark:bg-slate-800" />
        </div>
      </div>
    </div>
  );
}
