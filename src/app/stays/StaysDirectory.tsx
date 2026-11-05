"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { BedDouble, Heart, Landmark, Plus, Search, SlidersHorizontal, Snowflake, Sparkles, Users, X } from "lucide-react";
import { HeaderNav } from "@/app/homePage/components/HeaderNav";
import { PropertyListingCitySelector } from "@/components/propertyListing/PropertyListingCitySelector";
import { PropertyListingLocalitySelector } from "@/components/propertyListing/PropertyListingLocalitySelector";
import { StayCard, StayCardSkeleton } from "@/components/stays/StayCard";
import { useStaySearch } from "@/features/stays/api";
import { STAY_TYPES } from "@/features/stays/options";
import type { StaySearchParams, StayType } from "@/features/stays/types";
import { useCountry } from "@/lib/country/countryStore";
import { formatMoney } from "@/lib/money";
import { CountryContextChip } from "@/components/country/CountryContextChip";

/** Popular stay destinations per country (India: pilgrimage + leisure hubs). */
const STAY_HOTSPOTS: Record<string, string[]> = {
  IN: ["Varanasi", "Haridwar", "Rishikesh", "Puri", "Tirupati", "Shirdi", "Goa", "Jaipur", "New Delhi", "Mumbai"],
};

const BUDGETS: Record<"lakh" | "million", number[]> = { lakh: [500, 1000, 2000, 3500, 6000], million: [3000, 6000, 10000, 20000] };

export function StaysDirectory({ initialCity = "", initialLocality = "", initialType }: { initialCity?: string; initialLocality?: string; initialType?: StayType }) {
  const country = useCountry();
  const [city, setCity] = useState(initialCity);
  const [locality, setLocality] = useState(initialLocality);
  // New city -> old area no longer applies.
  const pickCity = (c: string) => {
    setCity(c);
    setLocality("");
  };
  const [type, setType] = useState<StayType | undefined>(initialType);
  const [priceMax, setPriceMax] = useState<number | undefined>();
  const [ac, setAc] = useState(false);
  const [coupleFriendly, setCoupleFriendly] = useState(false);
  const [familyFriendly, setFamilyFriendly] = useState(false);
  const [free, setFree] = useState(false);
  const [sort, setSort] = useState<StaySearchParams["sort"]>("recommended");
  const [showFilters, setShowFilters] = useState(false);
  const [sheet, setSheet] = useState<null | "search" | "filters">(null);

  const params: StaySearchParams = {
    countryCode: country.code,
    city: city || undefined,
    locality: locality || undefined,
    type,
    priceMax,
    ac,
    coupleFriendly,
    familyFriendly,
    free,
    sort,
  };
  const q = useStaySearch(params);
  const items = useMemo(() => q.data?.pages.flatMap((p) => p.items) ?? [], [q.data]);
  const total = q.data?.pages[0]?.total ?? 0;
  const hotspots = STAY_HOTSPOTS[country.code] ?? country.popularCities;
  const activeFilters = [priceMax, ac, coupleFriendly, familyFriendly, free].filter(Boolean).length;

  const clearAll = () => {
    setType(undefined);
    setPriceMax(undefined);
    setAc(false);
    setCoupleFriendly(false);
    setFamilyFriendly(false);
    setFree(false);
    setLocality("");
  };

  const toggle = (on: boolean, set: (v: boolean) => void, label: string, Icon: typeof Heart) => (
    <button
      type="button"
      onClick={() => set(!on)}
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
        on ? "border-rose-600 bg-rose-600 text-white shadow-sm" : "border-slate-200 bg-white text-slate-700 hover:border-rose-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
      }`}
    >
      <Icon className="h-3.5 w-3.5" /> {label}
    </button>
  );

  return (
    <div className="min-h-screen bg-slate-50 pb-28 dark:bg-slate-950">
      <HeaderNav />

      {/* Hero */}
      {/* Soft, light hero: tinted mesh + dark text (the old saturated gradient felt heavy). */}
      <section className="relative hidden overflow-hidden border-b border-slate-200/70 bg-gradient-to-b sm:block from-rose-50/80 via-white to-slate-50 px-4 pb-12 pt-5 text-slate-900 sm:pb-16 sm:pt-12 dark:border-slate-800 dark:from-slate-900 dark:via-slate-950 dark:to-slate-950 dark:text-white">
        <div className="pointer-events-none absolute -right-24 -top-28 h-80 w-80 rounded-full bg-rose-200/40 blur-3xl dark:bg-rose-900/20" />
        <div className="pointer-events-none absolute -left-20 top-10 h-64 w-64 rounded-full bg-amber-200/40 blur-3xl dark:bg-amber-900/10" />
        <div className="pointer-events-none absolute bottom-0 right-1/3 h-48 w-48 rounded-full bg-sky-200/30 blur-3xl dark:bg-sky-900/10" />
        <div className="relative mx-auto max-w-6xl">
          <p className="hidden items-center gap-1.5 rounded-full border border-rose-200 bg-white/80 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-rose-600 shadow-2xs backdrop-blur sm:inline-flex dark:border-rose-900 dark:bg-slate-900/70 dark:text-rose-300">
            <Sparkles className="h-3.5 w-3.5" /> New on Awasio
          </p>
          <CountryContextChip what="Stays" className="ml-2 hidden align-middle sm:inline-flex" />
          {/* Phones: one short line so results show on the first screen. */}
          <h1 className="text-xl font-black leading-snug tracking-tight sm:mt-3 sm:max-w-3xl sm:text-5xl sm:leading-[1.1]">
            <span className="sm:hidden">
              Stays in <span className="text-rose-600 dark:text-rose-400">{city || country.name}</span>
            </span>
            <span className="hidden sm:inline">
              Hotels, guest houses & dharamshalas{" "}
              <span className="bg-gradient-to-r from-rose-600 to-amber-500 bg-clip-text text-transparent">
                {city ? `in ${city}` : `across ${country.name}`}
              </span>
            </span>
          </h1>
          <p className="mt-0.5 text-xs text-slate-500 sm:hidden dark:text-slate-400">Hotels · guest houses · homestays · dharamshalas</p>
          <p className="mt-2 hidden max-w-xl text-sm text-slate-600 sm:block sm:text-base dark:text-slate-300">
            Compare rooms and nightly prices, call the owner directly or book on their preferred site. No middleman fees.
          </p>

          {/* City + area: side by side on desktop, stacked on phones (area only after a city is chosen). */}
          <div className="mt-3 grid grid-cols-[1fr_auto] items-center gap-2 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-xl shadow-slate-900/5 sm:mt-6 sm:flex sm:max-w-3xl sm:rounded-3xl sm:p-2 dark:border-slate-800 dark:bg-slate-900">
            <div className="min-w-0 text-slate-900 sm:flex-1 dark:text-white">
              <PropertyListingCitySelector
                value={city}
                countryCode={country.code}
                onChange={(c) => pickCity(c.name)}
                placeholder="Search city"
              />
            </div>
            <div className={`col-span-2 row-start-2 min-w-0 text-slate-900 sm:col-auto sm:row-auto sm:flex-1 dark:text-white ${city ? "" : "hidden sm:block"}`}>
              <PropertyListingLocalitySelector
                value={locality}
                cityName={city}
                countryCode={country.code}
                onChange={(l) => setLocality(l.name)}
                placeholder={city ? `Area in ${city}` : "Pick a city first"}
              />
            </div>
            <button
              type="button"
              aria-label="Find stays"
              onClick={() => document.getElementById("stay-results")?.scrollIntoView({ behavior: "smooth", block: "start" })}
              className="col-start-2 row-start-1 inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-slate-900 px-3.5 text-sm font-bold text-white transition hover:bg-slate-800 sm:rounded-2xl sm:px-6"
            >
              <Search className="h-4 w-4" /> <span className="hidden sm:inline">Find stays</span>
            </button>
          </div>

          {hotspots.length > 0 && (
            <div className="-mx-4 mt-3 flex gap-2 overflow-x-auto px-4 pb-1 no-scrollbar sm:mx-0 sm:mt-4 sm:px-0">
              {hotspots.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => pickCity(c === city ? "" : c)}
                  className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold transition ${
                    c === city
                      ? "border border-rose-600 bg-rose-600 text-white shadow-sm"
                      : "border border-slate-200 bg-white/80 text-slate-700 hover:border-rose-300 hover:text-rose-700 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-200"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ---------- Phones: compact search pill + filters button + one row of type chips ---------- */}
      <div className="border-b border-slate-200/70 bg-gradient-to-b from-rose-50/70 to-slate-50 px-4 pb-2 pt-3 sm:hidden dark:border-slate-800 dark:from-slate-900 dark:to-slate-950">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setSheet("search")}
            className="flex min-w-0 flex-1 items-center gap-2.5 rounded-full border border-slate-200 bg-white py-2 pl-3 pr-4 text-left shadow-sm dark:border-slate-700 dark:bg-slate-900"
            aria-label="Change city or area"
          >
            <Search className="h-4 w-4 shrink-0 text-rose-600" />
            <span className="min-w-0">
              <span className="block truncate text-sm font-bold text-slate-900 dark:text-white">{city || `Anywhere in ${country.name}`}</span>
              <span className="block truncate text-[11px] text-slate-500">{locality || (city ? "Any area · tap to change" : "Hotels · guest houses · dharamshalas")}</span>
            </span>
          </button>
          <button
            type="button"
            onClick={() => setSheet("filters")}
            className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-800 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            aria-label="Filters and sort"
          >
            <SlidersHorizontal className="h-4 w-4" />
            {activeFilters + (sort !== "recommended" ? 1 : 0) > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-600 px-1 text-[10px] font-bold text-white">
                {activeFilters + (sort !== "recommended" ? 1 : 0)}
              </span>
            )}
          </button>
        </div>
        <CountryContextChip what="Stays" className="mt-2" />
        <div className="-mx-4 mt-2 flex gap-1.5 overflow-x-auto px-4 pb-0.5 no-scrollbar">
          {[{ value: undefined as StayType | undefined, plural: "All", icon: BedDouble }, ...STAY_TYPES].map((t) => {
            const on = type === t.value;
            return (
              <button
                key={t.plural}
                type="button"
                onClick={() => setType(on && t.value ? undefined : t.value)}
                className={`inline-flex shrink-0 items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold transition ${
                  on ? "border-slate-900 bg-slate-900 text-white dark:border-white dark:bg-white dark:text-slate-900" : "border-slate-200 bg-white text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                }`}
              >
                <t.icon className="h-3.5 w-3.5" /> {t.plural}
              </button>
            );
          })}
        </div>
      </div>

      <main className="relative mx-auto max-w-6xl px-4 sm:-mt-8">
        {/* Type tiles */}
        <div className="hidden gap-2 overflow-x-auto rounded-3xl border border-slate-200/80 bg-white p-2 shadow-md shadow-slate-900/5 no-scrollbar sm:flex dark:border-slate-800 dark:bg-slate-900">
          <button
            type="button"
            onClick={() => setType(undefined)}
            className={`flex shrink-0 flex-col items-center gap-1 rounded-2xl px-3 py-2 text-[11px] font-bold transition sm:px-4 sm:py-2.5 ${
              !type ? "bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300" : "text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"
            }`}
          >
            <BedDouble className="h-5 w-5" /> All stays
          </button>
          {STAY_TYPES.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => setType(type === t.value ? undefined : t.value)}
              title={t.blurb}
              className={`flex shrink-0 flex-col items-center gap-1 rounded-2xl px-3 py-2 text-[11px] font-bold transition sm:px-4 sm:py-2.5 ${
                type === t.value ? "bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300" : "text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"
              }`}
            >
              <t.icon className="h-5 w-5" /> {t.plural}
            </button>
          ))}
        </div>

        {/* Filters row */}
        <div className="mt-4 hidden items-center gap-2 overflow-x-auto pb-1 no-scrollbar sm:flex">
          <button
            type="button"
            onClick={() => setShowFilters((v) => !v)}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-800 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          >
            <SlidersHorizontal className="h-3.5 w-3.5" /> Budget{priceMax ? `: ≤ ${formatMoney(priceMax, country.code)}` : ""}
          </button>
          {toggle(ac, setAc, "AC rooms", Snowflake)}
          {toggle(coupleFriendly, setCoupleFriendly, "Couple friendly", Heart)}
          {toggle(familyFriendly, setFamilyFriendly, "Family friendly", Users)}
          {toggle(free, setFree, "Free / donation", Landmark)}
          {(activeFilters > 0 || type || locality) && (
            <button type="button" onClick={clearAll} className="inline-flex shrink-0 items-center gap-1 px-2 text-xs font-semibold text-rose-600">
              <X className="h-3.5 w-3.5" /> Clear
            </button>
          )}
        </div>
        {showFilters && (
          <div className="mt-2 hidden flex-wrap gap-2 rounded-2xl sm:flex border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
            <span className="w-full text-[11px] font-bold uppercase tracking-wider text-slate-500">Max price per night</span>
            {BUDGETS[country.bigNumbers].map((b) => (
              <button
                key={b}
                type="button"
                onClick={() => setPriceMax(priceMax === b ? undefined : b)}
                className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                  priceMax === b ? "border-rose-600 bg-rose-600 text-white" : "border-slate-200 text-slate-700 dark:border-slate-700 dark:text-slate-200"
                }`}
              >
                Under {formatMoney(b, country.code)}
              </button>
            ))}
          </div>
        )}

        {/* Results header */}
        <div id="stay-results" className="mt-3 flex scroll-mt-20 items-center justify-between gap-3 sm:mt-5 sm:items-end">
          <div className="min-w-0">
            <h2 className="truncate text-base font-bold text-slate-900 sm:text-lg dark:text-white">
              {q.isLoading
                ? "Finding stays…"
                : `${total} stay${total === 1 ? "" : "s"} in ${[locality, city].filter(Boolean).join(", ") || country.name}`}
            </h2>
            <p className="hidden text-xs text-slate-500 sm:block">Prices are per night, set by the property. Book directly — no Awasio fee.</p>
          </div>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as StaySearchParams["sort"])}
            className="hidden h-9 w-28 shrink-0 rounded-xl border border-slate-200 bg-white px-2 text-xs font-semibold text-slate-700 sm:block sm:w-auto dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
            aria-label="Sort stays"
          >
            <option value="recommended">Top picks</option>
            <option value="price_low">Price ↑</option>
            <option value="price_high">Price ↓</option>
            <option value="newest">Newest</option>
          </select>
        </div>

        <div className="mt-3 grid grid-cols-1 gap-4 sm:mt-4 sm:grid-cols-2 lg:grid-cols-3">
          {q.isLoading && Array.from({ length: 6 }).map((_, i) => <StayCardSkeleton key={i} />)}
          {items.map((s, i) => (
            <StayCard key={s.id} stay={s} priority={i < 3} />
          ))}
        </div>

        {!q.isLoading && items.length === 0 && (
          <div className="mt-4 rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center dark:border-slate-700 dark:bg-slate-900">
            <BedDouble className="mx-auto h-10 w-10 text-rose-400" />
            <p className="mt-3 text-base font-bold text-slate-900 dark:text-white">No stays listed here yet</p>
            <p className="mt-1 text-sm text-slate-500">Own a hotel, guest house or dharamshala? List it free and get calls directly.</p>
            <Link href="/dashboard/stays/new" className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-rose-600 px-4 py-2 text-sm font-bold text-white">
              <Plus className="h-4 w-4" /> List your property
            </Link>
          </div>
        )}

        {q.hasNextPage && (
          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => q.fetchNextPage()}
              disabled={q.isFetchingNextPage}
              className="rounded-full border border-slate-300 bg-white px-5 py-2 text-sm font-semibold text-slate-800 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            >
              {q.isFetchingNextPage ? "Loading…" : "Show more stays"}
            </button>
          </div>
        )}

        {/* Owner CTA */}
        <section className="mt-10 overflow-hidden rounded-3xl bg-slate-900 p-6 text-white sm:flex sm:items-center sm:justify-between sm:p-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-amber-300">For owners</p>
            <h3 className="mt-1 text-xl font-black">Run a hotel, lodge, homestay or dharamshala?</h3>
            <p className="mt-1 max-w-xl text-sm text-slate-300">
              Add your rooms and nightly prices, link your Booking.com / Agoda / website, and get direct calls & WhatsApp enquiries — free.
            </p>
          </div>
          <Link href="/dashboard/stays/new" className="mt-4 inline-flex shrink-0 items-center gap-1.5 rounded-full bg-white px-5 py-2.5 text-sm font-bold text-slate-900 sm:mt-0">
            <Plus className="h-4 w-4" /> List your stay free
          </Link>
        </section>
      </main>

      {/* ---------- Phone bottom sheets ---------- */}
      {sheet && (
        <div className="fixed inset-0 z-[70] flex items-end bg-black/40 sm:hidden" onClick={() => setSheet(null)} role="dialog" aria-modal="true">
          <div
            className="max-h-[88vh] w-full overflow-y-auto rounded-t-3xl bg-white pb-[max(1rem,env(safe-area-inset-bottom))] dark:bg-slate-900"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900">
              <span className="mx-auto absolute left-1/2 top-1.5 h-1 w-10 -translate-x-1/2 rounded-full bg-slate-200" aria-hidden />
              <h2 className="text-base font-bold text-slate-900 dark:text-white">{sheet === "search" ? "Where to?" : "Filters & sort"}</h2>
              <button type="button" onClick={() => setSheet(null)} aria-label="Close" className="rounded-full bg-slate-100 p-1.5 dark:bg-slate-800">
                <X className="h-4 w-4" />
              </button>
            </div>

            {sheet === "search" ? (
              <div className="space-y-3 px-4 pt-4">
                <div className="text-slate-900 dark:text-white">
                  <PropertyListingCitySelector value={city} countryCode={country.code} onChange={(c) => pickCity(c.name)} placeholder="Search city" />
                </div>
                <div className={`text-slate-900 dark:text-white ${city ? "" : "opacity-60"}`}>
                  <PropertyListingLocalitySelector
                    value={locality}
                    cityName={city}
                    countryCode={country.code}
                    onChange={(l) => setLocality(l.name)}
                    placeholder={city ? `Area in ${city} (optional)` : "Pick a city first"}
                  />
                </div>
                {hotspots.length > 0 && (
                  <div>
                    <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-500">Popular</p>
                    <div className="flex flex-wrap gap-2">
                      {hotspots.map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => pickCity(c === city ? "" : c)}
                          className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${
                            c === city ? "border-rose-600 bg-rose-600 text-white" : "border-slate-200 text-slate-700 dark:border-slate-700 dark:text-slate-200"
                          }`}
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-5 px-4 pt-4">
                <div>
                  <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-500">Sort by</p>
                  <div className="grid grid-cols-2 gap-2">
                    {([
                      ["recommended", "Top picks"],
                      ["price_low", "Price: low → high"],
                      ["price_high", "Price: high → low"],
                      ["newest", "Newest"],
                    ] as const).map(([v, l]) => (
                      <button
                        key={v}
                        type="button"
                        onClick={() => setSort(v)}
                        className={`rounded-xl border px-3 py-2 text-xs font-semibold ${
                          sort === v ? "border-rose-600 bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300" : "border-slate-200 text-slate-700 dark:border-slate-700 dark:text-slate-200"
                        }`}
                      >
                        {l}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-500">Max price per night</p>
                  <div className="flex flex-wrap gap-2">
                    {BUDGETS[country.bigNumbers].map((b) => (
                      <button
                        key={b}
                        type="button"
                        onClick={() => setPriceMax(priceMax === b ? undefined : b)}
                        className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${
                          priceMax === b ? "border-rose-600 bg-rose-600 text-white" : "border-slate-200 text-slate-700 dark:border-slate-700 dark:text-slate-200"
                        }`}
                      >
                        Under {formatMoney(b, country.code)}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-500">Good to have</p>
                  <div className="flex flex-wrap gap-2">
                    {toggle(ac, setAc, "AC rooms", Snowflake)}
                    {toggle(coupleFriendly, setCoupleFriendly, "Couple friendly", Heart)}
                    {toggle(familyFriendly, setFamilyFriendly, "Family friendly", Users)}
                    {toggle(free, setFree, "Free / donation", Landmark)}
                  </div>
                </div>
              </div>
            )}

            <div className="sticky bottom-0 mt-5 flex gap-2 border-t border-slate-100 bg-white px-4 pt-3 dark:border-slate-800 dark:bg-slate-900">
              <button
                type="button"
                onClick={() => {
                  if (sheet === "search") {
                    pickCity("");
                  } else {
                    clearAll();
                    setSort("recommended");
                  }
                }}
                className="h-12 rounded-2xl px-4 text-sm font-semibold text-slate-600 underline dark:text-slate-300"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={() => setSheet(null)}
                className="h-12 flex-1 rounded-2xl bg-rose-600 text-sm font-bold text-white"
              >
                {q.isFetching && !q.isFetchingNextPage ? "Searching…" : `Show ${total} stay${total === 1 ? "" : "s"}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
