"use client";

import React from "react";
import Link from "next/link";
import { HardHat, Loader2, Search } from "lucide-react";
import { cn } from "@/components/ui/utils";
import { useLazySearchConstructionQuery } from "@/features/construction/api";
import { BUILDING_TYPE_OPTIONS, SERVICE_OPTIONS, citySlug } from "@/features/construction/options";
import type { BuildingType, ConstructionProfile, ConstructionService } from "@/features/construction/types";
import { ConstructionCard } from "./ConstructionCard";

const PAGE_SIZE = 24;

export function DirectoryClient({
  city,
  initialItems,
  initialTotal,
  cities,
}: {
  city: string;
  initialItems: ConstructionProfile[];
  initialTotal: number;
  cities: { city: string; count: number }[];
}) {
  const [service, setService] = React.useState<ConstructionService | "">("");
  const [buildingType, setBuildingType] = React.useState<BuildingType | "">("");
  const [q, setQ] = React.useState("");
  const [query, setQuery] = React.useState("");
  const [fetchPage, { isFetching }] = useLazySearchConstructionQuery();
  const filtered = !!(service || buildingType || query);
  const key = JSON.stringify({ city, service, buildingType, query });
  const baseKey = JSON.stringify({ city, service: "", buildingType: "", query: "" });
  // Results for one filter combination; the unfiltered list starts from the server render.
  const [state, setState] = React.useState({ key: baseKey, page: 1, items: initialItems, total: initialTotal });

  // Filters change → load page 1 from the API; no filters → the server-rendered list.
  React.useEffect(() => {
    if (!filtered) return;
    let cancelled = false;
    void fetchPage({ city: city || undefined, service: service || undefined, buildingType: buildingType || undefined, q: query || undefined, page: 1, limit: PAGE_SIZE })
      .unwrap()
      .then((r) => !cancelled && setState({ key, page: 1, items: r.items, total: r.pagination.total }))
      .catch(() => !cancelled && setState({ key, page: 1, items: [], total: 0 }));
    return () => {
      cancelled = true;
    };
  }, [key, filtered, city, service, buildingType, query, fetchPage]);

  const view = state.key === key ? state : key === baseKey ? { key, page: 1, items: initialItems, total: initialTotal } : null;
  const items = view?.items ?? [];
  const total = view?.total ?? 0;

  const loadMore = async () => {
    if (!view) return;
    const page = view.page + 1;
    const r = await fetchPage({ city: city || undefined, service: service || undefined, buildingType: buildingType || undefined, q: query || undefined, page, limit: PAGE_SIZE }).unwrap().catch(() => null);
    if (!r) return;
    const seen = new Set(view.items.map((x) => x.id));
    setState({ key, page, items: [...view.items, ...r.items.filter((x) => !seen.has(x.id))], total: r.pagination.total });
  };

  return (
    <div className="space-y-5">
      {/* City chips */}
      {cities.length > 0 && (
        <nav aria-label="Cities" className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0">
          <Link href="/construction-companies" className={cn("shrink-0 rounded-full border px-3.5 py-1.5 text-sm font-semibold", !city ? "border-rose-600 bg-rose-600 text-white" : "border-slate-200 bg-white text-slate-700 hover:border-rose-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200")}>
            All cities
          </Link>
          {cities.map((c) => (
            <Link
              key={c.city}
              href={`/construction-companies/${citySlug(c.city)}`}
              className={cn("shrink-0 rounded-full border px-3.5 py-1.5 text-sm font-semibold", c.city.toLowerCase() === city.toLowerCase() ? "border-rose-600 bg-rose-600 text-white" : "border-slate-200 bg-white text-slate-700 hover:border-rose-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200")}
            >
              {c.city} <span className="opacity-70">({c.count})</span>
            </Link>
          ))}
        </nav>
      )}

      {/* Filters */}
      <div className="grid gap-2 sm:grid-cols-[1.4fr_1fr_1fr]">
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
            className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm shadow-sm outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 dark:border-slate-700 dark:bg-slate-900"
            placeholder="Search company name"
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              if (!e.target.value) setQuery("");
            }}
            onBlur={() => setQuery(q.trim())}
          />
        </form>
        <select aria-label="Service" className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm shadow-sm dark:border-slate-700 dark:bg-slate-900" value={service} onChange={(e) => setService(e.target.value as ConstructionService | "")}>
          <option value="">All services</option>
          {SERVICE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <select aria-label="Building type" className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm shadow-sm dark:border-slate-700 dark:bg-slate-900" value={buildingType} onChange={(e) => setBuildingType(e.target.value as BuildingType | "")}>
          <option value="">All building types</option>
          {BUILDING_TYPE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      <p className="text-sm font-semibold text-slate-700 dark:text-slate-300" aria-live="polite">
        {!view && isFetching ? "Loading…" : `${total} ${total === 1 ? "company" : "companies"}${city ? ` in ${city}` : ""}`}
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
          <Link href="/dashboard/construction-profile" className="mt-4 inline-flex h-10 items-center rounded-xl bg-rose-600 px-4 text-sm font-bold text-white hover:bg-rose-700">
            Are you a builder? List your company free
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
