"use client";

import { useAutoLoadMore } from "@/lib/hooks/useAutoLoadMore";
import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowUpDown, BadgeCheck, MapPin, BookOpen, ChevronDown, Flame, Languages, Loader2, Search, SlidersHorizontal } from "lucide-react";
import { PropertyListingCitySelector, type CitySelection } from "@/components/propertyListing/PropertyListingCitySelector";
import { PropertyListingLocalitySelector, type LocalitySelection } from "@/components/propertyListing/PropertyListingLocalitySelector";
import { cn } from "@/components/ui/utils";
import { useLazySearchPanditsQuery } from "@/features/pandit/api";
import { ALL_SERVICE_OPTIONS, LANGUAGE_OPTIONS, PANDIT_BASE, SERVICE_GROUPS, TRADITION_OPTIONS } from "@/features/pandit/options";
import { listingPath } from "@/lib/seo/countryPath";
import { getSelectedCountry } from "@/lib/country/countryStore";
import { useCountryCode } from "@/lib/country/useCountry";
import { CountryResultsBanner, useUrlCountry } from "@/components/country/CountryResultsBanner";
import type { PanditProfile, PanditSegment, PanditSort } from "@/features/pandit/types";
import { PanditCard } from "./PanditCard";

const PAGE_SIZE = 24;
/** Shared look for every search/filter box: same height, font, left icon and chevron as the city picker. */
const fieldCls = (active: boolean) =>
  cn(
    "h-11 w-full min-w-0 truncate rounded-xl border border-slate-200 bg-white pl-9 text-sm outline-none transition-colors hover:border-slate-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 dark:border-slate-700 dark:bg-slate-800 dark:hover:border-slate-600",
    active ? "font-semibold text-slate-900 dark:text-slate-100" : "text-slate-400 dark:text-slate-500",
  );

function FilterSelect({
  icon: Icon,
  active,
  className,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & { icon: React.ComponentType<{ className?: string }>; active: boolean }) {
  return (
    <div className={cn("relative min-w-0", className)}>
      <Icon className={cn("pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2", active ? "text-rose-500" : "text-slate-400")} />
      <select {...props} className={cn(fieldCls(active), "cursor-pointer appearance-none pr-9")} />
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
    </div>
  );
}

/** Quick picks shown as chips; the full list is in the service select. */
const QUICK: Record<"" | PanditSegment, string[]> = {
  "": ["GRIHA_PRAVESH", "SATYANARAYAN_KATHA", "BHOOMI_PUJAN", "VASTU_HOME", "HAVAN", "VIVAH"],
  PANDIT: ["GRIHA_PRAVESH", "SATYANARAYAN_KATHA", "BHOOMI_PUJAN", "HAVAN", "RUDRABHISHEK", "NAAMKARAN", "VIVAH", "SHRADDH"],
  VASTU: ["VASTU_HOME", "VASTU_FLAT_PURCHASE", "VASTU_PLOT", "VASTU_FLOOR_PLAN", "VASTU_OFFICE", "VASTU_ONLINE"],
};

const readParam = (k: string) => (typeof window !== "undefined" ? new URLSearchParams(window.location.search).get(k) ?? "" : "");

export function DirectoryClient({
  city,
  locality,
  country,
  initialItems,
  initialTotal,
  cities,
}: {
  city: string;
  /** Locality from the URL (/pandit-vastu/[cc/]city/locality); "" = whole city. */
  locality: string;
  /** Country from the URL prefix; null = India / no prefix. */
  country: string | null;
  initialItems: PanditProfile[];
  initialTotal: number;
  cities: { city: string; count: number }[];
}) {
  const router = useRouter();
  const [segment, setSegmentState] = React.useState<"" | PanditSegment>(() => (["PANDIT", "VASTU"].includes(readParam("segment")) ? (readParam("segment") as PanditSegment) : ""));
  const [service, setService] = React.useState(() => (ALL_SERVICE_OPTIONS.some((o) => o.value === readParam("service")) ? readParam("service") : ""));
  const portalCountry = useCountryCode();
  useUrlCountry(country);
  const [language, setLanguage] = React.useState("");
  const [tradition, setTradition] = React.useState("");
  const [online, setOnline] = React.useState(false);
  const [verified, setVerified] = React.useState(false);
  const [sort, setSort] = React.useState<PanditSort>("relevance");
  const [q, setQ] = React.useState("");
  const [query, setQuery] = React.useState("");
  const [more, setMore] = React.useState(false);
  // The Filters panel closes on a click/tap outside the search box, on Escape, or with "Done".
  const searchBoxRef = React.useRef<HTMLDivElement | null>(null);
  React.useEffect(() => {
    if (!more) return;
    const onDown = (e: PointerEvent) => {
      if (searchBoxRef.current && !searchBoxRef.current.contains(e.target as Node)) setMore(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMore(false);
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [more]);
  const [fetchPage, { isFetching }] = useLazySearchPanditsQuery();

  const setSegment = (v: "" | PanditSegment) => {
    setSegmentState(v);
    if (v && service && (v === "VASTU") !== service.startsWith("VASTU_")) setService("");
    if (v === "VASTU") setTradition("");
  };
  const pickCity = (c: CitySelection) => {
    const next = c.name?.trim();
    if (!next || next.toLowerCase() === city.toLowerCase()) return;
    router.push(`${listingPath(PANDIT_BASE, next, null, getSelectedCountry())}${urlQuery()}`);
  };
  // City and area live in the URL (same as projects / property search), so they can be shared and indexed.
  const urlQuery = () => {
    const qs = new URLSearchParams({ ...(segment ? { segment } : {}), ...(service ? { service } : {}) }).toString();
    return qs ? `?${qs}` : "";
  };
  const setLocality = (next: string) => {
    if (next.toLowerCase() === locality.toLowerCase()) return;
    router.push(`${listingPath(PANDIT_BASE, city, next || null, country)}${urlQuery()}`);
  };

  // Keep the URL shareable (segment + service) without a navigation.
  React.useEffect(() => {
    const u = new URL(window.location.href);
    for (const [k, v] of [["segment", segment], ["service", service]] as const) {
      if (v) u.searchParams.set(k, v);
      else u.searchParams.delete(k);
    }
    window.history.replaceState(window.history.state, "", u.toString());
  }, [segment, service]);

  const filters = { locality, segment, service, language, tradition, online, verified, sort, query };
  // Without a city the server renders India's list; another site country loads its own.
  const otherCountry = !city && portalCountry !== "IN";
  const filtered = !!(otherCountry || segment || service || language || tradition || online || verified || sort !== "relevance" || query);
  const key = JSON.stringify({ city, portalCountry: city ? "" : portalCountry, ...filters });
  const baseKey = JSON.stringify({ city, portalCountry: city ? "" : "IN", locality, segment: "", service: "", language: "", tradition: "", online: false, verified: false, sort: "relevance", query: "" });
  const params = (page: number) => ({
    city: city || undefined,
    locality: (city && locality) || undefined,
    countryCode: city ? undefined : portalCountry,
    segment: segment || undefined,
    service: service || undefined,
    language: language || undefined,
    tradition: tradition || undefined,
    mode: online ? ("ONLINE" as const) : undefined,
    verified: verified ? ("1" as const) : undefined,
    sort: sort === "relevance" ? undefined : sort,
    q: query || undefined,
    page,
    limit: PAGE_SIZE,
  });
  const [state, setState] = React.useState({ key: baseKey, page: 1, items: initialItems, total: initialTotal });

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

  const loadingMore = React.useRef(false);
  const loadMore = async () => {
    if (!view || loadingMore.current) return;
    loadingMore.current = true;
    const page = view.page + 1;
    const r = await fetchPage(params(page)).unwrap().catch(() => null);
    loadingMore.current = false;
    if (!r) return;
    const seen = new Set(view.items.map((x) => x.id));
    setState({ key, page, items: [...view.items, ...r.items.filter((x) => !seen.has(x.id))], total: r.pagination.total });
  };

  // Infinite scroll (shared with every directory); the button below stays as a fallback.
  const hasMore = !!view && items.length < total;
  const sentinelRef = useAutoLoadMore(() => void loadMore(), hasMore, isFetching, items.length);

  const clearAll = () => {
    setSegmentState("");
    setService("");
    if (locality) setLocality("");
    setLanguage("");
    setTradition("");
    setOnline(false);
    setVerified(false);
    setSort("relevance");
    setQ("");
    setQuery("");
  };

  const serviceGroups = SERVICE_GROUPS.filter((g) => (segment === "VASTU" ? g.key === "vastu" : segment === "PANDIT" ? g.key !== "vastu" : true));
  const noun = segment === "VASTU" ? "vastu consultant" : segment === "PANDIT" ? "pandit" : "pandit & vastu expert";
  const extraCount = [language, tradition, online, verified, sort !== "relevance"].filter(Boolean).length;

  return (
    <div className="space-y-4">
      {/* Simple search: where + which puja. Everything else sits behind one Filters button. */}
      <div ref={searchBoxRef} className="relative space-y-3 lg:space-y-0 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        {/* Phones: fields stacked, then tabs + Filters. Desktop: everything on one row. */}
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:gap-2">
        <div className="grid grid-cols-2 gap-2 lg:min-w-0 lg:flex-1 lg:grid-cols-[1fr_1fr_1.2fr]">
          <div className="min-w-0">
            <PropertyListingCitySelector compact value={city} placeholder="Select city" onChange={pickCity} />
          </div>
          {/* Always shown so visitors know they can search by area; disabled until a city is picked. */}
          <div className="min-w-0">
            {city ? (
              <PropertyListingLocalitySelector key={`${city}|${locality}`} value={locality} cityName={city} placeholder="Any area" menuAlignEnd onChange={(l: LocalitySelection) => setLocality(l.name || "")} />
            ) : (
              <div aria-disabled="true" title="Select a city first" className="flex h-11 cursor-not-allowed items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-400 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-500">
                <MapPin className="h-4 w-4 shrink-0" />
                <span className="truncate">Any area</span>
              </div>
            )}
          </div>
          <FilterSelect
            className="col-span-2 lg:col-span-1"
            icon={Flame}
            active={!!service}
                        aria-label="Puja or service"
            value={service}
            onChange={(e) => setService(e.target.value)}
          >
            <option value="">{segment === "VASTU" ? "Which consultation?" : "Which puja or service?"}</option>
            {serviceGroups.map((g) => (
              <optgroup key={g.key} label={g.label}>
                {ALL_SERVICE_OPTIONS.filter((o) => o.group === g.key).map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </optgroup>
            ))}
          </FilterSelect>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 lg:shrink-0 lg:flex-nowrap">
          <div className="inline-flex shrink-0 rounded-lg bg-slate-100 p-0.5 text-xs font-semibold dark:bg-slate-800" role="tablist" aria-label="Kind of expert">
            {([
              ["", "All"],
              ["PANDIT", "Pandit ji"],
              ["VASTU", "Vastu"],
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
          <div className="flex items-center gap-3">
            {filtered && (
              <button type="button" onClick={clearAll} className="whitespace-nowrap text-xs font-semibold text-rose-600 hover:underline">
                Clear all
              </button>
            )}
            <button
              type="button"
              onClick={() => setMore((m) => !m)}
              aria-expanded={more}
              className={cn("inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg border px-3 text-xs font-semibold", extraCount || query ? "border-rose-300 bg-rose-50 text-rose-700 dark:border-rose-900 dark:bg-rose-950/40" : "border-slate-200 text-slate-700 dark:border-slate-700 dark:text-slate-200")}
            >
              <SlidersHorizontal className="h-3.5 w-3.5" /> Filters{extraCount + (query ? 1 : 0) ? ` (${extraCount + (query ? 1 : 0)})` : ""}
            </button>
          </div>
        </div>

        </div>

        {more && (
          <div className="grid gap-2 border-t border-slate-100 pt-3 sm:grid-cols-2 dark:border-slate-800 lg:absolute lg:right-3 lg:top-[calc(100%+0.5rem)] lg:z-30 lg:w-[480px] lg:rounded-2xl lg:border lg:border-slate-200 lg:bg-white lg:p-4 lg:shadow-xl lg:dark:border-slate-700 lg:dark:bg-slate-900">
            <form
              className="relative sm:col-span-2"
              role="search"
              onSubmit={(e) => {
                e.preventDefault();
                setQuery(q.trim());
              }}
            >
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                aria-label="Search by name"
                className={cn(fieldCls(!!q), "pr-3 placeholder:font-normal placeholder:text-slate-400 dark:placeholder:text-slate-500")}
                placeholder="Pandit name"
                value={q}
                onChange={(e) => {
                  setQ(e.target.value);
                  if (!e.target.value) setQuery("");
                }}
                onBlur={() => setQuery(q.trim())}
              />
            </form>
            <FilterSelect icon={Languages} active={!!language} aria-label="Language" value={language} onChange={(e) => setLanguage(e.target.value)}>
              <option value="">Any language</option>
              {LANGUAGE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </FilterSelect>
            {segment !== "VASTU" && (
              <FilterSelect icon={BookOpen} active={!!tradition} aria-label="Tradition" value={tradition} onChange={(e) => setTradition(e.target.value)}>
                <option value="">Any tradition</option>
                {TRADITION_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </FilterSelect>
            )}
            <FilterSelect icon={ArrowUpDown} active={sort !== "relevance"} aria-label="Sort by" value={sort} onChange={(e) => setSort(e.target.value as PanditSort)}>
              <option value="relevance">Sort: Recommended</option>
              <option value="rating">Sort: Highest rated</option>
              <option value="price">Sort: Lowest fee</option>
              <option value="experience">Sort: Most experienced</option>
            </FilterSelect>
            <div className="flex flex-wrap gap-2 sm:col-span-2">
              <label className="inline-flex h-11 cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
                <input type="checkbox" className="h-3.5 w-3.5 accent-rose-600" checked={online} onChange={(e) => setOnline(e.target.checked)} /> Online available
              </label>
              <label className="inline-flex h-11 cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
                <input type="checkbox" className="h-3.5 w-3.5 accent-rose-600" checked={verified} onChange={(e) => setVerified(e.target.checked)} /> <BadgeCheck className="h-3.5 w-3.5 text-emerald-600" /> Verified only
              </label>
            </div>
            <div className="flex justify-end sm:col-span-2">
              <button type="button" onClick={() => setMore(false)} className="inline-flex h-10 items-center rounded-xl bg-slate-900 px-5 text-sm font-bold text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900">
                Done
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Quick service chips */}
      <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0">
        {QUICK[segment].map((s) => {
          const o = ALL_SERVICE_OPTIONS.find((x) => x.value === s)!;
          const on = service === s;
          return (
            <button
              key={s}
              type="button"
              aria-pressed={on}
              onClick={() => setService(on ? "" : s)}
              className={cn(
                "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition",
                on ? "border-amber-500 bg-amber-50 text-amber-900 dark:bg-amber-950/40 dark:text-amber-200" : "border-slate-200 bg-white text-slate-700 hover:border-amber-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200",
              )}
            >
              <span aria-hidden>{o.icon}</span> {o.label}
            </button>
          );
        })}
        {!city &&
          cities.slice(0, 6).map((c) => (
            <Link key={c.city} href={listingPath(PANDIT_BASE, c.city)} className="shrink-0 whitespace-nowrap rounded-full border border-dashed border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:border-rose-300 hover:text-rose-600 dark:border-slate-700 dark:text-slate-300">
              {c.city} <span className="opacity-60">{c.count}</span>
            </Link>
          ))}
        {city && (
          <Link href={PANDIT_BASE} className="shrink-0 self-center whitespace-nowrap text-xs font-semibold text-rose-600 hover:underline">
            All cities
          </Link>
        )}
      </div>

      <CountryResultsBanner countryCode={city ? country ?? "IN" : null} what="pandits and vastu consultants" />

      <p className="text-sm font-semibold text-slate-700 dark:text-slate-300" aria-live="polite">
        {!view && isFetching ? "Loading…" : `${total} ${noun}${total === 1 ? "" : "s"}${city ? ` in ${locality ? `${locality}, ` : ""}${city}` : ""}`}
      </p>

      {!view && isFetching ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((i) => <div key={i} className="h-80 animate-pulse rounded-3xl bg-white dark:bg-slate-900" />)}
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center dark:border-slate-700 dark:bg-slate-900">
          <Flame className="mx-auto h-10 w-10 text-amber-300" />
          <p className="mt-3 text-base font-bold text-slate-900 dark:text-white">No {noun}s {city ? `in ${city} ` : ""}match yet</p>
          <p className="mt-1 text-sm text-slate-500">{filtered ? "Try removing a filter, or look for someone who offers online puja / consultation." : "New pandits and vastu experts are joining every week."}</p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {filtered && (
              <button type="button" onClick={clearAll} className="inline-flex h-10 items-center rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-700 dark:border-slate-700 dark:text-slate-200">
                Clear filters
              </button>
            )}
            <Link href="/dashboard/pandit-profile" className="inline-flex h-10 items-center rounded-xl bg-rose-600 px-4 text-sm font-bold text-white hover:bg-rose-700">
              Are you a pandit or vastu expert? List free
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((p, i) => (
            <React.Fragment key={p.id}>
              <PanditCard p={p} priority={i === 0} service={service || undefined} />
            </React.Fragment>
          ))}
        </div>
      )}

      {hasMore && (
        <div ref={sentinelRef} className="flex flex-col items-center gap-1.5">
          <button type="button" onClick={() => void loadMore()} disabled={isFetching} className="inline-flex h-11 min-w-[220px] items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 text-sm font-bold text-slate-800 shadow-sm hover:border-rose-300 hover:text-rose-700 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100">
            {isFetching ? <><Loader2 className="h-4 w-4 animate-spin" /> Loading…</> : "Load more"}
          </button>
          <p className="text-xs text-slate-500">Showing {items.length} of {total}</p>
        </div>
      )}
    </div>
  );
}
