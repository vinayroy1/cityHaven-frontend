"use client";

import { useAutoLoadMore } from "@/lib/hooks/useAutoLoadMore";
import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PropertyListingCitySelector, type CitySelection } from "@/components/propertyListing/PropertyListingCitySelector";
import { PropertyListingLocalitySelector, type LocalitySelection } from "@/components/propertyListing/PropertyListingLocalitySelector";
import { HardHat, Loader2, RotateCcw, Search, SlidersHorizontal } from "lucide-react";
import { FilterSelect } from "@/components/common/FilterSelect";
import { cn } from "@/components/ui/utils";
import { PagingLimitNote, pagingLimitOf, type PagingLimit } from "@/components/common/PagingLimitNote";
import { useLazySearchConstructionQuery } from "@/features/construction/api";
import { BUILDING_TYPE_OPTIONS, SECTOR_OPTIONS, SERVICE_OPTIONS } from "@/features/construction/options";
import { listingPath } from "@/lib/seo/countryPath";
import { getSelectedCountry } from "@/lib/country/countryStore";
import { useCountryCode } from "@/lib/country/useCountry";
import { CountryResultsBanner, useUrlCountry } from "@/components/country/CountryResultsBanner";

const BASE = "/construction-companies";
import type { BuildingType, ConstructionProfile, ConstructionSegment, ConstructionService, InfraSector } from "@/features/construction/types";
import { ConstructionCard } from "./ConstructionCard";

const PAGE_SIZE = 12;

export function DirectoryClient({
  city,
  locality,
  country,
  initialItems,
  initialTotal,
  cities,
}: {
  city: string;
  /** Locality from the URL (/construction-companies/[cc/]city/locality); "" = whole city. */
  locality: string;
  /** Country from the URL prefix; null = India / no prefix. */
  country: string | null;
  initialItems: ConstructionProfile[];
  initialTotal: number;
  cities: { city: string; count: number }[];
}) {
  const [segment, setSegmentState] = React.useState<ConstructionSegment | "">(() =>
    typeof window !== "undefined" && new URLSearchParams(window.location.search).get("segment") === "INFRA" ? "INFRA" : "",
  );
  const router = useRouter();
  // City / area change is a route navigation: show the skeleton until the new page's results arrive.
  const [navPending, startNav] = React.useTransition();
  const portalCountry = useCountryCode();
  useUrlCountry(country);
  const qs = () => (segment ? `?segment=${segment}` : "");
  // City and area live in the URL (same as projects / property search), so they can be shared and indexed.
  const pickCity = (c: CitySelection) => {
    const next = c.name?.trim();
    if (!next || next.toLowerCase() === city.toLowerCase()) return;
    startNav(() => router.push(`${listingPath(BASE, next, null, getSelectedCountry())}${qs()}`));
  };
  const setLocality = (next: string) => {
    if (next.toLowerCase() === locality.toLowerCase()) return;
    startNav(() => router.push(`${listingPath(BASE, city, next || null, country)}${qs()}`));
  };
  const [sector, setSector] = React.useState<InfraSector | "">("");
  const [service, setService] = React.useState<ConstructionService | "">("");
  const [buildingType, setBuildingType] = React.useState<BuildingType | "">("");
  const [q, setQ] = React.useState("");
  const [query, setQuery] = React.useState("");
  const [fetchPage, { isFetching }] = useLazySearchConstructionQuery();
  const setSegment = (v: ConstructionSegment | "") => {
    setSegmentState(v);
    setSector("");
    setService("");
    setBuildingType("");
  };
  // Without a city the server renders India's list; another site country loads its own.
  const otherCountry = !city && portalCountry !== "IN";
  const filtered = !!(otherCountry || segment || sector || service || buildingType || query);
  const key = JSON.stringify({ city, locality, portalCountry: city ? "" : portalCountry, segment, sector, service, buildingType, query });
  const baseKey = JSON.stringify({ city, locality, portalCountry: city ? "" : "IN", segment: "", sector: "", service: "", buildingType: "", query: "" });
  const params = (page: number) => ({
    city: city || undefined,
    locality: (city && locality) || undefined,
    countryCode: city ? undefined : portalCountry,
    segment: segment || undefined,
    sector: sector || undefined,
    service: service || undefined,
    buildingType: buildingType || undefined,
    q: query || undefined,
    page,
    limit: PAGE_SIZE,
  });
  // Results for one filter combination; the unfiltered list starts from the server render.
  const [state, setState] = React.useState<{ key: string; page: number; items: typeof initialItems; total: number; limit?: PagingLimit | null }>({ key: baseKey, page: 1, items: initialItems, total: initialTotal });

  // Filters change → load page 1 from the API; no filters → the server-rendered list.
  React.useEffect(() => {
    if (!filtered) return;
    let cancelled = false;
    void fetchPage(params(1))
      .unwrap()
      .then((r) => !cancelled && setState({ key, page: 1, items: r.items, total: r.pagination.total, limit: pagingLimitOf(r) }))
      .catch(() => !cancelled && setState({ key, page: 1, items: [], total: 0 }));
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, filtered, fetchPage]);

  const view = state.key === key ? state : key === baseKey ? { key, page: 1, items: initialItems, total: initialTotal, limit: null } : null;
  const items = view?.items ?? [];
  // No results for the current filters yet (request not started or in flight), or a city/area navigation in progress.
  const loading = !view || navPending;
  const total = view?.total ?? 0;

  const loadMore = async () => {
    if (!view || isFetching) return;
    const page = view.page + 1;
    const r = await fetchPage(params(page)).unwrap().catch(() => null);
    if (!r) return;
    const seen = new Set(view.items.map((x) => x.id));
    setState({ key, page, items: [...view.items, ...r.items.filter((x) => !seen.has(x.id))], total: r.pagination.total, limit: pagingLimitOf(r) });
  };
  // Infinite scroll; the button stays as a fallback.
  const sentinelRef = useAutoLoadMore(() => void loadMore(), !!view && items.length < total, isFetching, items.length);

  const [panelOpen, setPanelOpen] = React.useState(false);
  const activeCount = [segment, sector, service, buildingType, query].filter(Boolean).length;
  const clearAll = () => {
    setSegment("");
    setQ("");
    setQuery("");
  };
  const searchBox = (
    <form
      className="relative"
      role="search"
      onSubmit={(e) => {
        e.preventDefault();
        setQuery(q.trim());
      }}
    >
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      <input
        aria-label="Search by company name"
        className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 dark:border-slate-700 dark:bg-slate-800"
        placeholder="Search company name"
        value={q}
        onChange={(e) => {
          setQ(e.target.value);
          if (!e.target.value) setQuery("");
        }}
        onBlur={() => setQuery(q.trim())}
      />
    </form>
  );
  const segmentTabs = (layout: string) => (
    <div className={cn(layout, "rounded-lg bg-slate-100 p-0.5 text-[13px] font-medium dark:bg-slate-800")} role="tablist" aria-label="Kind of contractor">
      {([
        ["", "All"],
        ["RESIDENTIAL", "Homes"],
        ["INFRA", "Infra / Govt"],
      ] as const).map(([v, l]) => (
        <button
          key={v || "all"}
          type="button"
          role="tab"
          aria-selected={segment === v}
          onClick={() => setSegment(v)}
          className={cn("whitespace-nowrap rounded-md px-3 py-1.5 transition", segment === v ? "bg-white text-rose-600 shadow-sm dark:bg-slate-900" : "text-slate-600 hover:text-rose-600 dark:text-slate-300")}
        >
          {l}
        </button>
      ))}
    </div>
  );
  const typeSelects = (cls: string, size: "sm" | "md") =>
    segment === "INFRA" ? (
      <FilterSelect size={size} className={cls} ariaLabel="Sector" value={sector} onChange={(v) => setSector(v as InfraSector | "")}
        options={[{ value: "", label: "All sectors" }, ...SECTOR_OPTIONS.map((o) => ({ value: o.value, label: o.label }))]} />
    ) : (
      <>
        <FilterSelect size={size} className={cls} ariaLabel="Service" value={service} onChange={(v) => setService(v as ConstructionService | "")}
          options={[{ value: "", label: "All services" }, ...SERVICE_OPTIONS.map((o) => ({ value: o.value, label: o.label }))]} />
        <FilterSelect size={size} className={cls} ariaLabel="Building type" value={buildingType} onChange={(v) => setBuildingType(v as BuildingType | "")}
          options={[{ value: "", label: "All building types" }, ...BUILDING_TYPE_OPTIONS.map((o) => ({ value: o.value, label: o.label }))]} />
      </>
    );

  return (
    <div className="space-y-4">
      {/* Filters. Desktop: search/city/area row + type row. Mobile: city, then area + Filters button opening a panel. */}
      <div className="space-y-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="grid grid-cols-[1fr_auto] gap-2 sm:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr]">
          <div className="hidden sm:col-span-2 sm:block lg:col-span-1">{searchBox}</div>
          <div className="col-span-2 min-w-0 sm:col-span-1">
            <PropertyListingCitySelector value={city} placeholder="All cities" onChange={pickCity} />
          </div>
          <div className="relative min-w-0">
            {city ? (
              <PropertyListingLocalitySelector
                key={`${city}|${locality}`}
                value={locality}
                cityName={city}
                placeholder="Any area"
                onChange={(l: LocalitySelection) => setLocality(l.name || "")}
              />
            ) : (
              <input disabled aria-label="Area" placeholder="Pick a city first" className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-500 placeholder:text-slate-400 dark:border-slate-700 dark:bg-slate-800/60" />
            )}
          </div>
          <button
            type="button"
            onClick={() => setPanelOpen((o) => !o)}
            aria-expanded={panelOpen}
            className={cn(
              "inline-flex h-11 items-center justify-center gap-1.5 rounded-xl border px-3.5 text-sm font-semibold transition sm:hidden",
              panelOpen || activeCount > 0
                ? "border-rose-400 bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300"
                : "border-slate-200 text-slate-700 dark:border-slate-700 dark:text-slate-300",
            )}
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters{activeCount > 0 ? ` (${activeCount})` : ""}
          </button>
        </div>

        {/* Desktop / tablet: type tabs + dropdowns + city shortcuts in one row */}
        <div className="no-scrollbar -mx-2 hidden items-center gap-2 overflow-x-auto px-2 sm:flex">
          {segmentTabs("inline-flex shrink-0")}
          {typeSelects("w-auto min-w-[9.5rem] shrink-0", "sm")}
          {!city &&
            cities.slice(0, 6).map((c) => (
              <Link key={c.city} href={listingPath(BASE, c.city)} className="shrink-0 whitespace-nowrap rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:border-rose-300 hover:text-rose-600 dark:border-slate-700 dark:text-slate-300">
                {c.city} <span className="opacity-60">{c.count}</span>
              </Link>
            ))}
          {city && (
            <Link href="/construction-companies" className="shrink-0 whitespace-nowrap text-xs font-semibold text-rose-600 hover:underline">
              All cities
            </Link>
          )}
        </div>

        {/* Mobile filter panel */}
        {panelOpen && (
          <div className="space-y-3 rounded-xl bg-slate-50 p-3 sm:hidden dark:bg-slate-800/50">
            {searchBox}
            <div>
              <span className="mb-1.5 block text-[13px] font-medium text-slate-700 dark:text-slate-300">Kind of contractor</span>
              {segmentTabs("grid w-full grid-cols-3")}
            </div>
            <div className="grid gap-3">{typeSelects("", "md")}</div>
            <div className="flex items-center justify-end gap-2 pt-1">
              {activeCount > 0 && (
                <button type="button" onClick={clearAll} className="inline-flex h-10 items-center gap-1.5 rounded-xl px-3 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300">
                  <RotateCcw className="h-4 w-4" /> Clear all
                </button>
              )}
              <button type="button" onClick={() => setPanelOpen(false)} className="h-10 rounded-xl bg-rose-600 px-5 text-sm font-semibold text-white hover:bg-rose-700">
                {loading ? "Loading…" : `Show ${total} ${total === 1 ? "result" : "results"}`}
              </button>
            </div>
          </div>
        )}
      </div>

      <CountryResultsBanner countryCode={city ? country ?? "IN" : null} what="companies" />

      <p className="text-sm font-semibold text-slate-700 dark:text-slate-300" aria-live="polite">
        {loading ? "Loading…" : `${total} ${total === 1 ? "company" : "companies"}${city ? ` in ${locality ? `${locality}, ` : ""}${city}` : ""}`}
      </p>

      {loading ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true" aria-label="Loading companies">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="overflow-hidden rounded-3xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
              <div className="aspect-[16/9] animate-pulse bg-slate-200 dark:bg-slate-800" />
              <div className="space-y-3 p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 shrink-0 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-3/4 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
                    <div className="h-3 w-1/2 animate-pulse rounded bg-slate-100 dark:bg-slate-800/70" />
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="h-6 w-20 animate-pulse rounded-full bg-slate-100 dark:bg-slate-800/70" />
                  <div className="h-6 w-24 animate-pulse rounded-full bg-slate-100 dark:bg-slate-800/70" />
                </div>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div className="h-10 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800/70" />
                  <div className="h-10 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center dark:border-slate-700 dark:bg-slate-900">
          <HardHat className="mx-auto h-10 w-10 text-slate-300" />
          <p className="mt-3 text-base font-bold text-slate-900 dark:text-white">No construction companies {city ? `in ${city} ` : ""}yet</p>
          <p className="mt-1 text-sm text-slate-500">{filtered ? "Try removing a filter." : "New companies are joining every week."}</p>
          <Link href={segment === "INFRA" ? "/dashboard/construction-profile?segment=INFRA" : "/dashboard/construction-profile"} className="mt-4 inline-flex h-10 items-center rounded-xl bg-rose-600 px-4 text-sm font-bold text-white hover:bg-rose-700">
            {segment === "INFRA" ? "Are you an infra contractor? List your company" : "Are you a builder? List your company free"}
          </Link>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((p, i) => (
            <React.Fragment key={p.id}>
              <ConstructionCard p={p} priority={i === 0} />
            </React.Fragment>
          ))}
        </div>
      )}

      {view && items.length < total && (
        <div ref={sentinelRef} className="flex flex-col items-center gap-1.5">
          <button type="button" onClick={() => void loadMore()} disabled={isFetching} className="inline-flex h-11 min-w-[220px] items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 text-sm font-bold text-slate-800 shadow-sm hover:border-rose-300 hover:text-rose-700 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100">
            {isFetching && <Loader2 className="h-4 w-4 animate-spin" />} Load more companies
          </button>
          <p className="text-xs text-slate-500">Showing {items.length} of {total}</p>
        </div>
      )}
      {/* Server-rendered no-city list is the capped first page; later pages say why they stopped. */}
      {view && items.length > 0 && <PagingLimitNote limit={view.limit ?? (!city && items.length >= total ? "CITY_REQUIRED" : null)} />}
    </div>
  );
}
