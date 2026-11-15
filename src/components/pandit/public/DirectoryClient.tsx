"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BadgeCheck, Flame, Loader2, Search, SlidersHorizontal, X } from "lucide-react";
import { PropertyListingCitySelector, type CitySelection } from "@/components/propertyListing/PropertyListingCitySelector";
import { PropertyListingLocalitySelector, type LocalitySelection } from "@/components/propertyListing/PropertyListingLocalitySelector";
import { cn } from "@/components/ui/utils";
import { useLazySearchPanditsQuery } from "@/features/pandit/api";
import { ALL_SERVICE_OPTIONS, LANGUAGE_OPTIONS, PANDIT_BASE, SERVICE_GROUPS, TRADITION_OPTIONS, citySlug } from "@/features/pandit/options";
import type { PanditProfile, PanditSegment, PanditSort } from "@/features/pandit/types";
import { PanditCard } from "./PanditCard";

const PAGE_SIZE = 24;
const selCls = "h-9 shrink-0 rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200";

/** Quick picks shown as chips; the full list is in the service select. */
const QUICK: Record<"" | PanditSegment, string[]> = {
  "": ["GRIHA_PRAVESH", "SATYANARAYAN_KATHA", "BHOOMI_PUJAN", "VASTU_HOME", "HAVAN", "VIVAH"],
  PANDIT: ["GRIHA_PRAVESH", "SATYANARAYAN_KATHA", "BHOOMI_PUJAN", "HAVAN", "RUDRABHISHEK", "NAAMKARAN", "VIVAH", "SHRADDH"],
  VASTU: ["VASTU_HOME", "VASTU_FLAT_PURCHASE", "VASTU_PLOT", "VASTU_FLOOR_PLAN", "VASTU_OFFICE", "VASTU_ONLINE"],
};

const readParam = (k: string) => (typeof window !== "undefined" ? new URLSearchParams(window.location.search).get(k) ?? "" : "");

export function DirectoryClient({
  city,
  initialItems,
  initialTotal,
  cities,
}: {
  city: string;
  initialItems: PanditProfile[];
  initialTotal: number;
  cities: { city: string; count: number }[];
}) {
  const router = useRouter();
  const [segment, setSegmentState] = React.useState<"" | PanditSegment>(() => (["PANDIT", "VASTU"].includes(readParam("segment")) ? (readParam("segment") as PanditSegment) : ""));
  const [service, setService] = React.useState(() => (ALL_SERVICE_OPTIONS.some((o) => o.value === readParam("service")) ? readParam("service") : ""));
  const [locality, setLocality] = React.useState("");
  const [language, setLanguage] = React.useState("");
  const [tradition, setTradition] = React.useState("");
  const [online, setOnline] = React.useState(false);
  const [verified, setVerified] = React.useState(false);
  const [sort, setSort] = React.useState<PanditSort>("relevance");
  const [q, setQ] = React.useState("");
  const [query, setQuery] = React.useState("");
  const [more, setMore] = React.useState(false);
  const [fetchPage, { isFetching }] = useLazySearchPanditsQuery();

  const setSegment = (v: "" | PanditSegment) => {
    setSegmentState(v);
    if (v && service && (v === "VASTU") !== service.startsWith("VASTU_")) setService("");
    if (v === "VASTU") setTradition("");
  };
  const pickCity = (c: CitySelection) => {
    const next = c.name?.trim();
    if (!next || next.toLowerCase() === city.toLowerCase()) return;
    const qs = new URLSearchParams({ ...(segment ? { segment } : {}), ...(service ? { service } : {}) }).toString();
    router.push(`${PANDIT_BASE}/${citySlug(next)}${qs ? `?${qs}` : ""}`);
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
  const filtered = !!(locality || segment || service || language || tradition || online || verified || sort !== "relevance" || query);
  const key = JSON.stringify({ city, ...filters });
  const baseKey = JSON.stringify({ city, locality: "", segment: "", service: "", language: "", tradition: "", online: false, verified: false, sort: "relevance", query: "" });
  const params = (page: number) => ({
    city: city || undefined,
    locality: (city && locality) || undefined,
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

  const loadMore = async () => {
    if (!view) return;
    const page = view.page + 1;
    const r = await fetchPage(params(page)).unwrap().catch(() => null);
    if (!r) return;
    const seen = new Set(view.items.map((x) => x.id));
    setState({ key, page, items: [...view.items, ...r.items.filter((x) => !seen.has(x.id))], total: r.pagination.total });
  };

  const clearAll = () => {
    setSegmentState("");
    setService("");
    setLocality("");
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
              aria-label="Search by name"
              className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50/60 pl-9 pr-3 text-sm outline-none focus:border-rose-400 focus:bg-white focus:ring-2 focus:ring-rose-100 dark:border-slate-700 dark:bg-slate-800/60"
              placeholder="Search by name"
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
                <PropertyListingLocalitySelector key={`${city}|${locality}`} value={locality} cityName={city} placeholder="Any area" onChange={(l: LocalitySelection) => setLocality(l.name || "")} />
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

        <div className="no-scrollbar -mx-2 flex items-center gap-2 overflow-x-auto px-2">
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
          <select aria-label="Puja or service" className={selCls} value={service} onChange={(e) => setService(e.target.value)}>
            <option value="">{segment === "VASTU" ? "All consultations" : "All pujas & services"}</option>
            {serviceGroups.map((g) => (
              <optgroup key={g.key} label={g.label}>
                {ALL_SERVICE_OPTIONS.filter((o) => o.group === g.key).map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </optgroup>
            ))}
          </select>
          <select aria-label="Language" className={selCls} value={language} onChange={(e) => setLanguage(e.target.value)}>
            <option value="">Any language</option>
            {LANGUAGE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <button
            type="button"
            onClick={() => setMore((m) => !m)}
            aria-expanded={more}
            className={cn("inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg border px-2.5 text-xs font-semibold", extraCount ? "border-rose-300 bg-rose-50 text-rose-700 dark:border-rose-900 dark:bg-rose-950/40" : "border-slate-200 text-slate-700 dark:border-slate-700 dark:text-slate-200")}
          >
            <SlidersHorizontal className="h-3.5 w-3.5" /> More{extraCount ? ` (${extraCount})` : ""}
          </button>
          {filtered && (
            <button type="button" onClick={clearAll} className="shrink-0 whitespace-nowrap text-xs font-semibold text-rose-600 hover:underline">
              Clear all
            </button>
          )}
        </div>

        {more && (
          <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 px-1 pt-2 dark:border-slate-800">
            {segment !== "VASTU" && (
              <select aria-label="Tradition" className={selCls} value={tradition} onChange={(e) => setTradition(e.target.value)}>
                <option value="">Any tradition</option>
                {TRADITION_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            )}
            <select aria-label="Sort by" className={selCls} value={sort} onChange={(e) => setSort(e.target.value as PanditSort)}>
              <option value="relevance">Sort: Recommended</option>
              <option value="rating">Sort: Highest rated</option>
              <option value="price">Sort: Lowest fee</option>
              <option value="experience">Sort: Most experienced</option>
            </select>
            <label className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 text-xs font-semibold text-slate-700 dark:border-slate-700 dark:text-slate-200">
              <input type="checkbox" className="h-3.5 w-3.5 accent-rose-600" checked={online} onChange={(e) => setOnline(e.target.checked)} /> Online available
            </label>
            <label className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 text-xs font-semibold text-slate-700 dark:border-slate-700 dark:text-slate-200">
              <input type="checkbox" className="h-3.5 w-3.5 accent-rose-600" checked={verified} onChange={(e) => setVerified(e.target.checked)} /> <BadgeCheck className="h-3.5 w-3.5 text-emerald-600" /> Verified only
            </label>
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
            <Link key={c.city} href={`${PANDIT_BASE}/${citySlug(c.city)}`} className="shrink-0 whitespace-nowrap rounded-full border border-dashed border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:border-rose-300 hover:text-rose-600 dark:border-slate-700 dark:text-slate-300">
              {c.city} <span className="opacity-60">{c.count}</span>
            </Link>
          ))}
        {city && (
          <Link href={PANDIT_BASE} className="shrink-0 self-center whitespace-nowrap text-xs font-semibold text-rose-600 hover:underline">
            All cities
          </Link>
        )}
      </div>

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
          {items.map((p, i) => <PanditCard key={p.id} p={p} priority={i === 0} service={service || undefined} />)}
        </div>
      )}

      {view && items.length < total && (
        <div className="flex flex-col items-center gap-1.5">
          <button type="button" onClick={() => void loadMore()} disabled={isFetching} className="inline-flex h-11 min-w-[220px] items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 text-sm font-bold text-slate-800 shadow-sm hover:border-rose-300 hover:text-rose-700 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100">
            {isFetching && <Loader2 className="h-4 w-4 animate-spin" />} Load more
          </button>
          <p className="text-xs text-slate-500">Showing {items.length} of {total}</p>
        </div>
      )}
    </div>
  );
}
