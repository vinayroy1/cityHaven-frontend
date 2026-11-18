"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PropertyListingCitySelector, type CitySelection } from "@/components/propertyListing/PropertyListingCitySelector";
import { PropertyListingLocalitySelector, type LocalitySelection } from "@/components/propertyListing/PropertyListingLocalitySelector";
import { HardHat, Loader2, Search, X } from "lucide-react";
import { cn } from "@/components/ui/utils";
import { useLazySearchConstructionQuery } from "@/features/construction/api";
import { BUILDING_TYPE_OPTIONS, SECTOR_OPTIONS, SERVICE_OPTIONS } from "@/features/construction/options";
import { listingPath } from "@/lib/seo/countryPath";
import { getSelectedCountry } from "@/lib/country/countryStore";
import { useCountryCode } from "@/lib/country/useCountry";
import { CountryResultsBanner, useUrlCountry } from "@/components/country/CountryResultsBanner";

const BASE = "/construction-companies";
import type { BuildingType, ConstructionProfile, ConstructionSegment, ConstructionService, InfraSector } from "@/features/construction/types";
import { ConstructionCard } from "./ConstructionCard";

const PAGE_SIZE = 24;
const selCls =
  "h-9 shrink-0 rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200";

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
  const portalCountry = useCountryCode();
  useUrlCountry(country);
  const qs = () => (segment ? `?segment=${segment}` : "");
  // City and area live in the URL (same as projects / property search), so they can be shared and indexed.
  const pickCity = (c: CitySelection) => {
    const next = c.name?.trim();
    if (!next || next.toLowerCase() === city.toLowerCase()) return;
    router.push(`${listingPath(BASE, next, null, getSelectedCountry())}${qs()}`);
  };
  const setLocality = (next: string) => {
    if (next.toLowerCase() === locality.toLowerCase()) return;
    router.push(`${listingPath(BASE, city, next || null, country)}${qs()}`);
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
  const [state, setState] = React.useState({ key: baseKey, page: 1, items: initialItems, total: initialTotal });

  // Filters change → load page 1 from the API; no filters → the server-rendered list.
  React.useEffect(() => {
    if (!filtered) return;
    let cancelled = false;
    void fetchPage(params(1))
      .unwrap()
      .then((r) => !cancelled && setState({ key, page: 1, items: r.items, total: r.pagination.total }))
      .catch(() => !cancelled && setState({ key, page: 1, items: [], total: 0 }));
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, filtered, fetchPage]);

  const view = state.key === key ? state : key === baseKey ? { key, page: 1, items: initialItems, total: initialTotal } : null;
  const items = view?.items ?? [];
  const total = view?.total ?? 0;

  const loadMore = async () => {
    if (!view) return;
    const page = view.page + 1;
    const r = await fetchPage(params(page)).unwrap().catch(() => null);
    if (!r) return;
    const seen = new Set(view.items.map((x) => x.id));
    setState({ key, page, items: [...view.items, ...r.items.filter((x) => !seen.has(x.id))], total: r.pagination.total });
  };

  return (
    <div className="space-y-4">
      {/* Filters: 2 compact rows on desktop, 3 on mobile */}
      <div className="space-y-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="grid grid-cols-2 gap-2 lg:grid-cols-[1.3fr_1fr_1fr]">
          <form
            className="relative col-span-2 lg:col-span-1"
            role="search"
            onSubmit={(e) => {
              e.preventDefault();
              setQuery(q.trim());
            }}
          >
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              aria-label="Search by company name"
              className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50/60 pl-9 pr-3 text-sm outline-none focus:border-rose-400 focus:bg-white focus:ring-2 focus:ring-rose-100 dark:border-slate-700 dark:bg-slate-800/60"
              placeholder="Search company name"
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                if (!e.target.value) setQuery("");
              }}
              onBlur={() => setQuery(q.trim())}
            />
          </form>
          <div className="min-w-0">
            <PropertyListingCitySelector value={city} placeholder="All cities" onChange={pickCity} />
          </div>
          <div className="relative min-w-0">
            {city ? (
              <>
                <PropertyListingLocalitySelector
                  key={`${city}|${locality}`}
                  value={locality}
                  cityName={city}
                  placeholder="Any area"
                  onChange={(l: LocalitySelection) => setLocality(l.name || "")}
                />
                {locality && (
                  <button type="button" aria-label="Clear area" onClick={() => setLocality("")} className="absolute right-9 top-1/2 z-10 -translate-y-1/2 rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800">
                    <X className="h-4 w-4" />
                  </button>
                )}
              </>
            ) : (
              <input disabled aria-label="Area" placeholder="Pick a city first" className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-400 dark:border-slate-700 dark:bg-slate-800/60" />
            )}
          </div>
        </div>

        {/* Segment + type filters: one scrollable row on mobile */}
        <div className="no-scrollbar -mx-2 flex items-center gap-2 overflow-x-auto px-2">
          <div className="inline-flex shrink-0 rounded-lg bg-slate-100 p-0.5 text-xs font-semibold dark:bg-slate-800" role="tablist" aria-label="Kind of contractor">
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
          {segment === "INFRA" ? (
            <select aria-label="Sector" className={selCls} value={sector} onChange={(e) => setSector(e.target.value as InfraSector | "")}>
              <option value="">All sectors</option>
              {SECTOR_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          ) : (
            <>
              <select aria-label="Service" className={selCls} value={service} onChange={(e) => setService(e.target.value as ConstructionService | "")}>
                <option value="">All services</option>
                {SERVICE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <select aria-label="Building type" className={selCls} value={buildingType} onChange={(e) => setBuildingType(e.target.value as BuildingType | "")}>
                <option value="">All building types</option>
                {BUILDING_TYPE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </>
          )}
          {!city &&
            cities.slice(0, 6).map((c) => (
              <Link key={c.city} href={listingPath(BASE, c.city)} className="shrink-0 whitespace-nowrap rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:border-rose-300 hover:text-rose-600 dark:border-slate-700 dark:text-slate-300">
                {c.city} <span className="opacity-60">{c.count}</span>
              </Link>
            ))}
          {city && (
            <Link href="/construction-companies" className="shrink-0 whitespace-nowrap text-xs font-semibold text-rose-600 hover:underline">
              All cities
            </Link>
          )}
        </div>
      </div>

      <CountryResultsBanner countryCode={city ? country ?? "IN" : null} what="companies" />

      <p className="text-sm font-semibold text-slate-700 dark:text-slate-300" aria-live="polite">
        {!view && isFetching ? "Loading…" : `${total} ${total === 1 ? "company" : "companies"}${city ? ` in ${locality ? `${locality}, ` : ""}${city}` : ""}`}
      </p>

      {!view && isFetching ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((i) => <div key={i} className="h-80 animate-pulse rounded-3xl bg-white dark:bg-slate-900" />)}
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
          {items.map((p, i) => <ConstructionCard key={p.id} p={p} priority={i === 0} />)}
        </div>
      )}

      {view && items.length < total && (
        <div className="flex flex-col items-center gap-1.5">
          <button type="button" onClick={() => void loadMore()} disabled={isFetching} className="inline-flex h-11 min-w-[220px] items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 text-sm font-bold text-slate-800 shadow-sm hover:border-rose-300 hover:text-rose-700 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100">
            {isFetching && <Loader2 className="h-4 w-4 animate-spin" />} Load more companies
          </button>
          <p className="text-xs text-slate-500">Showing {items.length} of {total}</p>
        </div>
      )}
    </div>
  );
}
