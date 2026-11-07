"use client";

/**
 * Lead Finder: find PGs, hotels, rental agents and project builders by city/locality, then save the
 * promising ones as leads. Only Google's place id is stored; details are fetched when a lead opens.
 */
import React, { useMemo, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { AlertCircle, BedDouble, Briefcase, HardHat, Sofa, Building2, Check, ExternalLink, Hotel, Home, Loader2, MapPin, Search, Users } from "lucide-react";
import { PropertyListingCitySelector } from "@/components/propertyListing/PropertyListingCitySelector";
import { PropertyListingLocalitySelector } from "@/components/propertyListing/PropertyListingLocalitySelector";
import { useCountryCode } from "@/lib/country/useCountry";
import { leadFinderApi, type LeadSearchResult, type LeadType } from "@/features/admin/api";

const TABS: Array<{ id: LeadType; label: string; icon: typeof Home; hint: string; keyword: string }> = [
  { id: "PG", label: "PG / Hostel", icon: BedDouble, hint: "PGs, co-living and hostels", keyword: "e.g. girls PG, boys hostel" },
  { id: "STAY", label: "Hotel / Stay", icon: Hotel, hint: "Hotels, guest houses, lodges", keyword: "e.g. budget hotel, homestay" },
  { id: "RENTAL", label: "Rental", icon: Home, hint: "Rental flats, houses and serviced apartments", keyword: "e.g. 2 BHK rental" },
  { id: "PROJECT", label: "Project", icon: Building2, hint: "Residential projects and new launches", keyword: "e.g. township, villa project" },
  { id: "BUILDER", label: "Builder", icon: HardHat, hint: "Builders, developers and construction companies", keyword: "e.g. township developer" },
  { id: "AGENT", label: "Agent", icon: Briefcase, hint: "Real estate agents, brokers and property dealers", keyword: "e.g. commercial broker" },
  { id: "INTERIOR", label: "Interior Designer", icon: Sofa, hint: "Interior designers, decorators and modular kitchens", keyword: "e.g. modular kitchen" },
];

const errorText = (e: unknown, fallback: string) => {
  const err = e as { response?: { data?: { message?: string } }; message?: string };
  return err?.response?.data?.message || err?.message || fallback;
};

export default function LeadFinderPage() {
  const country = useCountryCode();
  const [type, setType] = useState<LeadType>("PG");
  const [city, setCity] = useState("");
  const [state, setState] = useState<string | undefined>();
  const [locality, setLocality] = useState("");
  const [keyword, setKeyword] = useState("");
  const [results, setResults] = useState<LeadSearchResult[]>([]);
  const [nextToken, setNextToken] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);
  const [cached, setCached] = useState(false);
  const [hideSaved, setHideSaved] = useState(true);
  const [hiddenSaved, setHiddenSaved] = useState(0);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [picked, setPicked] = useState<Set<string>>(new Set());

  const tab = TABS.find((t) => t.id === type)!;
  const selectable = useMemo(() => results.filter((r) => !r.lead), [results]);

  const run = async (pageToken?: string) => {
    if (!city) return setError("Choose a city first.");
    setError("");
    setLoading(true);
    try {
      const res = await leadFinderApi.search({ type, city, locality: locality || undefined, keyword: keyword.trim() || undefined, country, pageToken, hideSaved: hideSaved ? "1" : "0" });
      setResults((prev) => {
        if (!pageToken) return res.results;
        const have = new Set(prev.map((r) => r.placeId));
        return [...prev, ...res.results.filter((r) => !have.has(r.placeId))];
      });
      setHiddenSaved((n) => (pageToken ? n + res.hiddenSaved : res.hiddenSaved));
      setNextToken(res.nextPageToken);
      setCached(res.cached);
      setSearched(true);
      if (!pageToken) setPicked(new Set());
    } catch (e) {
      setError(errorText(e, "Search failed. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  const toggle = (id: string) =>
    setPicked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const save = async (ids: string[]) => {
    if (!ids.length) return;
    setSaving(true);
    try {
      const res = await leadFinderApi.saveLeads(ids.map((placeId) => ({ placeId, type, cityName: city, locality: locality || null, countryCode: country })));
      toast.success(`${res.created} lead(s) saved${res.skipped ? `, ${res.skipped} already existed` : ""}`);
      setResults((prev) => prev.map((r) => (ids.includes(r.placeId) ? { ...r, lead: r.lead ?? { id: 0, placeId: r.placeId, status: "NEW" } } : r)));
      setPicked(new Set());
    } catch (e) {
      toast.error(errorText(e, "Could not save leads."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-bold text-slate-900 dark:text-white">
            <Search className="h-6 w-6 text-rose-500" /> Lead Finder
          </h1>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">Find businesses to onboard, save the good ones, then call them from the Leads board.</p>
        </div>
        <Link href="/admin/leads" className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-rose-700">
          <Users className="h-4 w-4" /> Open leads board
        </Link>
      </div>

      {/* Type tabs */}
      <div className="flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => {
              setType(t.id);
              setResults([]);
              setSearched(false);
              setNextToken(null);
              setPicked(new Set());
            }}
            className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold transition ${
              type === t.id ? "border-rose-600 bg-rose-600 text-white shadow-sm" : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
            }`}
          >
            <t.icon className="h-4 w-4" /> {t.label}
          </button>
        ))}
      </div>
      <p className="-mt-2 text-xs text-slate-500">{tab.hint}</p>

      {/* Search form */}
      <div className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 md:grid-cols-[1fr_1.2fr_1fr_auto] md:items-end">
        <div className="min-w-0">
          <p className="mb-1 text-[11px] font-bold uppercase tracking-wider text-slate-500">City</p>
          <PropertyListingCitySelector
            value={city}
            selectedState={state}
            countryCode={country}
            placeholder="Select city"
            onChange={(c) => {
              setCity(c.name);
              setState(c.state);
              setLocality("");
            }}
          />
        </div>
        <div className="min-w-0">
          <p className="mb-1 text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Locality <span className="font-medium normal-case tracking-normal text-slate-400">(optional)</span>
          </p>
          <PropertyListingLocalitySelector
            key={`${country}-${city}`}
            value={locality}
            cityName={city}
            selectedState={state}
            countryCode={country}
            placeholder={city ? `Locality in ${city}` : undefined}
            onChange={(l) => setLocality(l.name || "")}
          />
        </div>
        <div className="min-w-0">
          <p className="mb-1 text-[11px] font-bold uppercase tracking-wider text-slate-500">Keyword (optional)</p>
          <input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && run()}
            placeholder={tab.keyword}
            className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-200 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
          />
        </div>
        <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400 md:col-span-4">
          <input type="checkbox" checked={hideSaved} onChange={(e) => setHideSaved(e.target.checked)} className="h-4 w-4 rounded border-slate-300 accent-rose-600" />
          Hide businesses I&apos;ve already saved (show only new ones)
        </label>
        <button
          type="button"
          onClick={() => run()}
          disabled={loading || !city}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-rose-600 px-6 text-sm font-bold text-white shadow-sm transition hover:bg-rose-700 disabled:opacity-50"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />} Search
        </button>
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-300">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /> {error}
        </div>
      )}

      {searched && (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 px-4 py-3 dark:border-slate-800">
            <div className="text-xs text-slate-600 dark:text-slate-400">
              <span className="font-bold text-slate-900 dark:text-white">{results.length}</span> {hideSaved ? "new" : "found"}
              {hiddenSaved > 0 && <span className="text-slate-400"> · {hiddenSaved} already saved (hidden)</span>}
              {cached && <span className="ml-2 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">from cache, no cost</span>}
            </div>
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => setPicked(picked.size === selectable.length ? new Set() : new Set(selectable.map((r) => r.placeId)))} className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200">
                {picked.size === selectable.length && selectable.length > 0 ? "Clear selection" : "Select all new"}
              </button>
              <button type="button" disabled={!picked.size || saving} onClick={() => save([...picked])} className="inline-flex items-center gap-1.5 rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-rose-700 disabled:opacity-50">
                {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />} Save {picked.size || ""} to leads
              </button>
            </div>
          </div>

          {results.length === 0 ? (
            <p className="p-8 text-center text-sm text-slate-500">
              {nextToken
                ? `No new businesses on this page${hiddenSaved > 0 ? ` (${hiddenSaved} already saved)` : ""}. Click "Find more businesses" for the next page.`
                : hiddenSaved > 0
                  ? `All ${hiddenSaved} businesses found here are already saved. Try a nearby locality or a keyword.`
                  : "No businesses found. Try a broader locality or a different keyword."}
            </p>
          ) : (
            <ul className="divide-y divide-slate-100 dark:divide-slate-800">
              {results.map((r) => (
                <li key={r.placeId} className="flex items-center gap-3 px-3 py-3 sm:px-4">
                  <input
                    type="checkbox"
                    disabled={!!r.lead}
                    checked={picked.has(r.placeId)}
                    onChange={() => toggle(r.placeId)}
                    className="h-4 w-4 rounded border-slate-300 accent-rose-600 disabled:opacity-40"
                    aria-label={`Select ${r.name}`}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold text-slate-900 dark:text-white">{r.name}</div>
                    <div className="flex items-center gap-1 truncate text-xs text-slate-500">
                      <MapPin className="h-3 w-3 shrink-0" /> <span className="truncate">{r.address}</span>
                    </div>
                  </div>
                  {r.mapsUrl && (
                    <a href={r.mapsUrl} target="_blank" rel="noreferrer" className="hidden items-center gap-1 text-xs font-semibold text-slate-500 hover:text-rose-600 sm:inline-flex">
                      Maps <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                  {r.lead ? (
                    <Link href={r.lead.id ? `/admin/leads?open=${r.lead.id}` : "/admin/leads"} className="shrink-0 whitespace-nowrap rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 hover:underline dark:bg-emerald-950/40 dark:text-emerald-300">
                      Saved<span className="hidden sm:inline"> · {r.lead.status.replace(/_/g, " ").toLowerCase()}</span>
                    </Link>
                  ) : (
                    <button type="button" disabled={saving} onClick={() => save([r.placeId])} className="shrink-0 whitespace-nowrap rounded-lg border border-rose-200 px-3 py-1 text-xs font-bold text-rose-600 hover:bg-rose-50 disabled:opacity-50 dark:border-rose-900/50 dark:hover:bg-rose-950/30">
                      Save lead
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}

          {nextToken && (
            <div className="border-t border-slate-200 p-3 text-center dark:border-slate-800">
              <button type="button" disabled={loading} onClick={() => run(nextToken)} className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:text-slate-200">
                {loading ? "Searching…" : "Find more businesses"}
              </button>
            </div>
          )}
        </div>
      )}

      <p className="text-[11px] text-slate-400">
        Results come from Google. Phone numbers load only when you open a saved lead, which keeps costs low. Only the business reference is stored.
      </p>
    </div>
  );
}
