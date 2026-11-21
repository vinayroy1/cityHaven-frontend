"use client";

import { useAutoLoadMore } from "@/lib/hooks/useAutoLoadMore";
import React, { useState, useMemo } from "react";

const PAGE_SIZE = 30;
import Link from "next/link";
import dynamic from "next/dynamic";
import { PageBreadcrumbs, type BreadcrumbTrailItem } from "@/components/common/PageBreadcrumbs";
import { DesignerGridSkeleton } from "@/components/interiors/skeletons";
import {
  Building2,
  ChevronDown,
  SlidersHorizontal,
  ShieldCheck,
  X,
  RotateCcw,
} from "lucide-react";
import { setUserPreferredCity } from "@/lib/geo/geoService";
import { useLazySearchInteriorDesignersQuery, useSearchInteriorDesignersQuery } from "@/features/interiors/api";
import { InteriorDesignerCard } from "./components/InteriorDesignerCard";
import type { InteriorProfile, InteriorProviderType, InteriorSearchParams, InteriorSearchResponse } from "@/types/interior.types";
import {
  INTERIOR_CITIES,
  DESIGN_STYLES,
  SERVICES_OFFERED,
} from "@/constants/interior-data";
import {
  PropertyListingCitySelector,
  type CitySelection,
} from "@/components/propertyListing/PropertyListingCitySelector";
import {
  PropertyListingLocalitySelector,
  type LocalitySelection,
} from "@/components/propertyListing/PropertyListingLocalitySelector";
import { getSelectedCountry, useCountry } from "@/lib/country/countryStore";
import { getCountry } from "@/config/countries";
import { listingPath } from "@/lib/seo/countryPath";
import { CountryResultsBanner, useUrlCountry } from "@/components/country/CountryResultsBanner";
import { useRouter } from "next/navigation";
import { interiorProfilePath } from "@/lib/interiors/profileUrl";

// The enquiry form only loads once someone asks for a quote.
const BUDGET_LABELS: Record<string, string> = {
  ECONOMY: "Economy budget",
  MID_RANGE: "Standard budget",
  PREMIUM: "Premium budget",
  LUXURY: "Luxury budget",
};

const InteriorInquiryModal = dynamic(
  () => import("./components/InteriorInquiryModal").then((m) => m.InteriorInquiryModal),
  { ssr: false },
);

interface DirectoryClientProps {
  initialCity: string;
  initialState: string;
  /** Server-rendered first page for `initialCity` with no filters applied. */
  initialData: InteriorSearchResponse | null;
  /** Locality from the URL (/interior-designers/[cc/]city/locality); "" = whole city. */
  initialLocality?: string;
  /** Country from the URL prefix; null = India / no prefix. */
  country?: string | null;
}

const BASE = "/interior-designers";

export function DirectoryClient({ initialCity, initialState, initialData, initialLocality = "", country = null }: DirectoryClientProps) {
  const router = useRouter();
  // City and area live in the URL (same as projects / property search): picking one navigates.
  const selectedCity = initialCity;
  const [selectedState, setSelectedState] = useState(initialState);
  const selectedLocality = initialLocality || "ALL";
  const setSelectedLocality = (next: string) => {
    const loc = next === "ALL" ? "" : next;
    if (loc.toLowerCase() === initialLocality.toLowerCase()) return;
    router.push(listingPath(BASE, selectedCity, loc || null, country));
  };
  useUrlCountry(country);
  const [providerType, setProviderType] = useState<InteriorProviderType | "ALL">("ALL");
  const [selectedService, setSelectedService] = useState("ALL");
  const [selectedStyle, setSelectedStyle] = useState("ALL");
  const [selectedBracket, setSelectedBracket] = useState("ALL");
  const [isVerifiedOnly, setIsVerifiedOnly] = useState(false);
  const [viewTab, setViewTab] = useState<"DIRECTORY" | "INSPIRATION">("DIRECTORY");
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Selected profile for inquiry quote modal
  const [inquiryProfile, setInquiryProfile] = useState<InteriorProfile | null>(null);

  // The server already rendered the default view; only fetch once filters change.
  const portalCountry = useCountry();
  // A city page is in the URL's country; without a city, the site's selected country.
  const pageCountry = selectedCity ? getCountry(country ?? "IN") : portalCountry;
  const sym = pageCountry.currencySymbol;
  // The server render is the URL's city, or India's list without one; other site countries fetch their own.
  const isInitialQuery =
    (!!selectedCity || portalCountry.code === "IN") &&
    !!initialData &&
    selectedCity === initialCity &&
    providerType === "ALL" &&
    selectedService === "ALL" &&
    selectedBracket === "ALL" &&
    !isVerifiedOnly;

  const searchArgs: InteriorSearchParams = {
      city: selectedCity || undefined,
      locality: (selectedCity && initialLocality) || undefined,
      countryCode: portalCountry.code,
      providerType: providerType === "ALL" ? undefined : providerType,
      service: selectedService === "ALL" ? undefined : selectedService,
      // The API's `budgetBracket` takes other values (and is not applied);
      // `budgetSegment` filters on the tiers designers pick in their profile.
      budgetSegment: selectedBracket === "ALL" ? undefined : (selectedBracket as InteriorSearchParams["budgetSegment"]),
      isVerified: isVerifiedOnly ? true : undefined,
      limit: PAGE_SIZE,
  };
  const query = useSearchInteriorDesignersQuery(searchArgs, { skip: isInitialQuery });
  const data = isInitialQuery ? initialData : query.data;
  const isLoading = !isInitialQuery && query.isLoading;

  const crumbs: BreadcrumbTrailItem[] = !selectedCity
    ? [{ label: "Interior designers" }]
    : initialLocality
      ? [{ label: "Interior designers", href: BASE }, { label: selectedCity, href: listingPath(BASE, selectedCity, null, country) }, { label: initialLocality }]
      : [{ label: "Interior designers", href: BASE }, { label: selectedCity }];

  // "Load more": later pages are appended for the current filters only (key change = fresh list).
  const filterKey = JSON.stringify(searchArgs);
  const [more, setMore] = useState<{ key: string; page: number; items: InteriorProfile[] }>({ key: "", page: 1, items: [] });
  const extra = more.key === filterKey ? more : { key: filterKey, page: 1, items: [] as InteriorProfile[] };
  const [fetchPage, { isFetching: loadingMore }] = useLazySearchInteriorDesignersQuery();
  const total = data?.pagination?.total ?? 0;
  const rawDesigners = useMemo(() => {
    const first = data?.items || [];
    const seen = new Set(first.map((d) => d.id));
    return [...first, ...extra.items.filter((d) => !seen.has(d.id) && (seen.add(d.id), true))];
  }, [data, extra.items]);
  const hasMore = rawDesigners.length < total;
  const loadMore = async () => {
    const page = extra.page + 1;
    try {
      const res = await fetchPage({ ...searchArgs, page }).unwrap();
      setMore({ key: filterKey, page, items: [...extra.items, ...(res?.items ?? [])] });
    } catch {
      // Keep what is shown; the button stays so the visitor can retry.
    }
  };
  // Infinite scroll; the "Load more designers" button stays as a fallback.
  const sentinelRef = useAutoLoadMore(() => void loadMore(), hasMore, loadingMore, rawDesigners.length);
  const clientFiltered = selectedStyle !== "ALL";

  // Client-side filtering for design style (locality is filtered by the API)
  const filteredDesigners = useMemo(() => {
    return rawDesigners.filter((d) => {
      // Locality is filtered by the API (the URL's area), including designers who serve it.
      // Design style check
      if (selectedStyle !== "ALL") {
        const styles = d.designStyles || [];
        if (!styles.some((s) => s.toLowerCase().includes(selectedStyle.toLowerCase()))) {
          return false;
        }
      }

      return true;
    });
  }, [rawDesigners, selectedStyle]);

  // Reset filters
  const handleResetFilters = () => {
    if (initialLocality) setSelectedLocality("ALL");
    setProviderType("ALL");
    setSelectedService("ALL");
    setSelectedStyle("ALL");
    setSelectedBracket("ALL");
    setIsVerifiedOnly(false);
  };


  // Inspiration Gallery feed
  const allProjects = useMemo(() => {
    return filteredDesigners.flatMap((d) =>
      (d.projects || []).map((p) => ({
        ...p,
        designerName: d.displayName || d.businessName || d.fullName || "Interior designer",
        designerSlug: d.slug,
        designerCity: d.primaryCity,
        designerLogo: d.logo,
      }))
    );
  }, [filteredDesigners]);

  const where = selectedLocality !== "ALL" ? `${selectedLocality}, ${selectedCity}` : selectedCity || portalCountry.name || "India";

  const pickCity = (city: string, state = "") => {
    setSelectedState(state);
    setUserPreferredCity(city);
    if (city.toLowerCase() === selectedCity.toLowerCase() && !initialLocality) return;
    // Cities in the picker belong to the site's selected country, so its prefix goes in the URL.
    router.push(listingPath(BASE, city || null, null, getSelectedCountry()));
  };

  const activeChips: { label: string; clear: () => void }[] = [
    ...(selectedLocality !== "ALL" ? [{ label: selectedLocality, clear: () => setSelectedLocality("ALL") }] : []),
    ...(providerType !== "ALL"
      ? [{ label: providerType === "COMPANY" ? "Studios & firms" : "Independent designers", clear: () => setProviderType("ALL") }]
      : []),
    ...(selectedService !== "ALL" ? [{ label: selectedService, clear: () => setSelectedService("ALL") }] : []),
    ...(selectedStyle !== "ALL" ? [{ label: selectedStyle, clear: () => setSelectedStyle("ALL") }] : []),
    ...(selectedBracket !== "ALL"
      ? [{ label: BUDGET_LABELS[selectedBracket] ?? selectedBracket, clear: () => setSelectedBracket("ALL") }]
      : []),
    ...(isVerifiedOnly ? [{ label: "Verified only", clear: () => setIsVerifiedOnly(false) }] : []),
  ];

  // The area has its own picker in the top bar, so the Filters count covers only what's inside the panel.
  const panelFilterCount = activeChips.length - (selectedLocality !== "ALL" ? 1 : 0);
  const filtersButton = (
    <button
      type="button"
      onClick={() => setMobileFilterOpen((o) => !o)}
      aria-expanded={mobileFilterOpen}
      className={`inline-flex h-11 w-full shrink-0 items-center justify-center gap-2 rounded-xl border px-3.5 text-sm font-bold transition ${
        mobileFilterOpen || panelFilterCount > 0
          ? "border-rose-400 bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300"
          : "border-slate-200 text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300"
      }`}
    >
      <SlidersHorizontal className="h-4 w-4" />
      Filters{panelFilterCount > 0 ? ` (${panelFilterCount})` : ""}
    </button>
  );

  const selectCls =
    "h-11 w-full min-w-0 cursor-pointer appearance-none truncate rounded-xl border border-slate-200 bg-white pl-3 pr-9 text-sm font-medium text-slate-800 shadow-2xs transition hover:border-slate-300 focus:border-rose-500 focus:outline-hidden focus:ring-2 focus:ring-rose-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:ring-rose-900/40";
  const chevron = (
    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden />
  );
  const labelCls = "mb-1 block text-xs font-semibold text-slate-500 dark:text-slate-400";

  return (
    <div className="min-h-screen bg-slate-50/70 dark:bg-slate-950">
      {/* Compact header */}
      <section className="border-b border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto max-w-7xl px-4 pt-3 pb-4 sm:px-6 sm:pt-4 sm:pb-6 lg:px-8">
          <PageBreadcrumbs items={crumbs} renderJsonLd={false} className="mb-2" />
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h1 className="text-xl font-extrabold tracking-tight text-slate-900 sm:text-3xl dark:text-white">
                Interior designers in <span className="text-rose-600 dark:text-rose-400">{where}</span>
              </h1>
              <p className="mt-1 hidden text-sm text-slate-600 sm:block dark:text-slate-300">
                Compare portfolios, starting prices and reviews. Call, WhatsApp or get free quotes.
              </p>
            </div>
            <Link
              href="/dashboard/interior-profile"
              prefetch={false}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-50 sm:bg-slate-900 sm:text-white sm:border-transparent sm:hover:bg-slate-800 dark:border-slate-700 dark:text-slate-200 sm:dark:bg-rose-600"
            >
              <Building2 className="h-4 w-4" />
              <span className="hidden sm:inline">List your business</span>
              <span className="sm:hidden">List yours</span>
            </Link>
          </div>

          {/* City, area, filters: one row (same pickers as the construction and pandit directories) */}
          <div className="mt-4 grid grid-cols-[1fr_1fr_auto] gap-2 lg:grid-cols-[1fr_1fr_10rem]">
            <div className="min-w-0">
              <PropertyListingCitySelector
                value={selectedCity}
                selectedState={selectedState}
                onChange={(c: CitySelection) => pickCity(c.name, c.state || "")}
                placeholder="All cities"
              />
            </div>
            <div className="relative min-w-0">
              {selectedCity ? (
                <>
                  <PropertyListingLocalitySelector
                    key={`${selectedCity}|${selectedLocality}`}
                    value={selectedLocality === "ALL" ? "" : selectedLocality}
                    cityName={selectedCity}
                    selectedState={selectedState}
                    onChange={(l: LocalitySelection) => setSelectedLocality(l.name || "ALL")}
                    placeholder="Any area"
                  />
                  {selectedLocality !== "ALL" && (
                    <button
                      type="button"
                      aria-label="Clear area"
                      onClick={() => setSelectedLocality("ALL")}
                      className="absolute right-9 top-1/2 z-10 -translate-y-1/2 rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </>
              ) : (
                <input
                  disabled
                  aria-label="Area"
                  placeholder="Pick a city first"
                  className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-400 dark:border-slate-700 dark:bg-slate-800/60"
                />
              )}
            </div>
            {filtersButton}
          </div>

          {/* City quick picks */}
          <div className="no-scrollbar -mx-4 mt-3 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0">
            {[{ label: "All cities", value: "" }, ...INTERIOR_CITIES.slice(0, 10).map((c) => ({ label: c, value: c }))].map((c) => {
              const active = selectedCity.toLowerCase() === c.value.toLowerCase();
              return (
                <button
                  key={c.label}
                  type="button"
                  onClick={() => pickCity(c.value)}
                  className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                    active
                      ? "bg-rose-600 text-white"
                      : "border border-slate-200 bg-white text-slate-700 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
                  }`}
                >
                  {c.label}
                </button>
              );
            })}
          </div>

          {/* All filters in one panel (desktop and mobile) */}
          {mobileFilterOpen && (
            <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50/60 p-4 dark:border-slate-800 dark:bg-slate-900/60">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-[1.1fr_1fr_1.2fr_1fr_auto]">
                <div className="min-w-0">
                  <span className={labelCls}>Designer type</span>
                  <div className="grid h-11 grid-cols-3 rounded-xl bg-slate-200/70 p-1 dark:bg-slate-800">
                    {(
                      [
                        ["ALL", "All"],
                        ["COMPANY", "Studios"],
                        ["INDIVIDUAL", "Independent"],
                      ] as const
                    ).map(([v, l]) => (
                      <button
                        key={v}
                        type="button"
                        onClick={() => setProviderType(v)}
                        className={`truncate rounded-lg px-1 text-xs font-bold transition ${
                          providerType === v
                            ? "bg-white text-slate-900 shadow-2xs dark:bg-slate-900 dark:text-white"
                            : "text-slate-600 dark:text-slate-400"
                        }`}
                      >
                        {l}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="min-w-0">
                  <label htmlFor="filter-service" className={labelCls}>Service</label>
                  <div className="relative">
                    <select id="filter-service" value={selectedService} onChange={(e) => setSelectedService(e.target.value)} className={selectCls}>
                      <option value="ALL">Any service</option>
                      {SERVICES_OFFERED.map((svc) => (
                        <option key={svc} value={svc}>{svc}</option>
                      ))}
                    </select>
                    {chevron}
                  </div>
                </div>
                <div className="min-w-0">
                  <label htmlFor="filter-budget" className={labelCls}>Budget</label>
                  <div className="relative">
                    <select id="filter-budget" value={selectedBracket} onChange={(e) => setSelectedBracket(e.target.value)} className={selectCls}>
                      <option value="ALL">Any budget</option>
                      <option value="ECONOMY">Economy (under {sym}1,400/sq.ft.)</option>
                      <option value="MID_RANGE">Standard ({sym}1,400–2,200/sq.ft.)</option>
                      <option value="PREMIUM">Premium ({sym}2,200–3,500/sq.ft.)</option>
                      <option value="LUXURY">Luxury ({sym}3,500+/sq.ft.)</option>
                    </select>
                    {chevron}
                  </div>
                </div>
                <div className="min-w-0">
                  <label htmlFor="filter-style" className={labelCls}>Design style</label>
                  <div className="relative">
                    <select id="filter-style" value={selectedStyle} onChange={(e) => setSelectedStyle(e.target.value)} className={selectCls}>
                      <option value="ALL">Any style</option>
                      {DESIGN_STYLES.map((st) => (
                        <option key={st} value={st}>{st}</option>
                      ))}
                    </select>
                    {chevron}
                  </div>
                </div>
                <div className="flex min-w-0 items-end">
                  <button
                    type="button"
                    onClick={() => setIsVerifiedOnly(!isVerifiedOnly)}
                    aria-pressed={isVerifiedOnly}
                    className={`inline-flex h-11 w-full items-center justify-center gap-1.5 whitespace-nowrap rounded-xl border px-4 text-sm font-bold transition ${
                      isVerifiedOnly
                        ? "border-emerald-600 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                        : "border-slate-200 bg-white text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                    }`}
                  >
                    <ShieldCheck className="h-4 w-4 text-emerald-600" />
                    Verified only
                  </button>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-end gap-2">
                {activeChips.length > 0 && (
                  <button type="button" onClick={handleResetFilters} className="inline-flex h-10 items-center gap-1.5 rounded-xl px-3 text-sm font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800">
                    <RotateCcw className="h-4 w-4" /> Clear all
                  </button>
                )}
                <button type="button" onClick={() => setMobileFilterOpen(false)} className="h-10 rounded-xl bg-rose-600 px-5 text-sm font-bold text-white hover:bg-rose-700">
                  Show {filteredDesigners.length} {filteredDesigners.length === 1 ? "result" : "results"}
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      <main className="mx-auto max-w-7xl px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
        <CountryResultsBanner countryCode={selectedCity ? country ?? "IN" : null} what="designers" className="mb-3" />
        {/* Active filters */}
        {activeChips.length > 0 && (
          <div className="mb-3 flex flex-wrap items-center gap-2">
            {activeChips.map((c) => (
              <button
                key={c.label}
                type="button"
                onClick={c.clear}
                className="inline-flex max-w-full items-center gap-1 rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700 dark:bg-rose-950/40 dark:text-rose-300"
              >
                <span className="truncate">{c.label}</span>
                <X className="h-3.5 w-3.5 shrink-0" aria-label={`Remove ${c.label}`} />
              </button>
            ))}
            <button type="button" onClick={handleResetFilters} className="text-xs font-semibold text-slate-500 underline-offset-2 hover:underline">
              Clear all
            </button>
          </div>
        )}

        {/* Count + view */}
        <div className="flex items-center justify-between gap-3">
          <p className="min-w-0 text-sm font-semibold text-slate-700 dark:text-slate-300">
            {isLoading
              ? "Loading…"
              : (() => {
                  // Server total when no on-page filter narrows the list; otherwise what's shown.
                  const n = clientFiltered || !total ? filteredDesigners.length : total;
                  return `${n} ${n === 1 ? "designer" : "designers"}`;
                })()}
          </p>
          <div className="inline-flex shrink-0 rounded-xl bg-slate-200/70 p-1 dark:bg-slate-800">
            {(
              [
                ["DIRECTORY", "Designers"],
                ["INSPIRATION", `Photos (${allProjects.length})`],
              ] as const
            ).map(([v, l]) => (
              <button
                key={v}
                type="button"
                onClick={() => setViewTab(v)}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                  viewTab === v ? "bg-white text-slate-900 shadow-2xs dark:bg-slate-900 dark:text-white" : "text-slate-600 dark:text-slate-400"
                }`}
              >
                {l}
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="mt-4">
          {isLoading ? (
            <DesignerGridSkeleton />
          ) : viewTab === "DIRECTORY" ? (
            filteredDesigners.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center dark:border-slate-800 dark:bg-slate-900/50">
                <Building2 className="mx-auto h-12 w-12 text-slate-400" />
                <h3 className="mt-3 text-lg font-bold text-slate-900 dark:text-white">
                  No designers found{selectedCity ? ` in ${where}` : ""} yet
                </h3>
                <p className="mt-1 text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
                  Try removing a filter or pick &quot;All cities&quot; to see every designer.
                </p>
                <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      handleResetFilters();
                      pickCity("");
                    }}
                    className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300"
                  >
                    Show all designers
                  </button>
                  <Link
                    href="/dashboard/interior-profile"
                    prefetch={false}
                    className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-rose-700"
                  >
                    Are you a Designer? Create Your Profile
                  </Link>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {filteredDesigners.map((profile, idx) => (
                  <React.Fragment key={profile.id}>
                    <InteriorDesignerCard
                      profile={profile}
                      priority={idx === 0}
                      onOpenInquiry={(p) => setInquiryProfile(p)}
                    />
                  </React.Fragment>
                ))}
              </div>
            )
          ) : null}
          {!isLoading && viewTab === "DIRECTORY" && filteredDesigners.length > 0 && hasMore && (
            <div ref={sentinelRef} className="mt-8 flex flex-col items-center gap-2">
              <button
                type="button"
                onClick={() => void loadMore()}
                disabled={loadingMore}
                className="inline-flex h-11 min-w-[200px] items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 text-sm font-bold text-slate-800 shadow-sm transition hover:border-rose-300 hover:text-rose-700 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              >
                {loadingMore ? "Loading…" : "Load more designers"}
              </button>
              <p className="text-xs text-slate-500">Showing {rawDesigners.length} of {total}</p>
            </div>
          )}
          {isLoading || viewTab === "DIRECTORY" ? null : (
            /* Inspiration Project Gallery View (Pinterest-style room feed) */
            allProjects.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-300 p-12 text-center dark:border-slate-800">
                <p className="text-sm text-slate-500">No project inspiration photos found matching these criteria.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {allProjects.map((project, idx) => (
                  <div
                    key={`${project.id}-${idx}`}
                    className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs transition hover:shadow-lg dark:border-slate-800 dark:bg-slate-900"
                  >
                    <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                      <img
                        src={project.coverImage || project.images?.[0]}
                        alt={project.title}
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                        loading="lazy"
                      />
                      <div className="absolute top-2.5 left-2.5 rounded-full bg-slate-900/80 px-2.5 py-0.5 text-[10px] font-bold text-white backdrop-blur-xs">
                        {[project.propertyConfig || project.propertyType, project.designStyle].filter(Boolean).join(" · ")}
                      </div>
                    </div>
                    <div className="p-4">
                      <h4 className="line-clamp-1 text-sm font-bold text-slate-900 dark:text-white">
                        {project.title}
                      </h4>
                      <p className="mt-1 line-clamp-1 text-xs text-slate-500 dark:text-slate-400">
                        {project.locality ? `${project.locality}, ` : ""}{project.cityName}
                      </p>
                      <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2.5 text-xs text-slate-600 dark:border-slate-800 dark:text-slate-400">
                        <span className="font-semibold truncate max-w-[150px]">By {project.designerName}</span>
                        <Link
                          href={interiorProfilePath({ primaryCity: project.designerCity, slug: project.designerSlug })}
                          className="font-bold text-rose-600 hover:underline dark:text-rose-400 shrink-0"
                        >
                          View Studio &rarr;
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      </main>

      {/* Inquiry Quote Modal */}
      {inquiryProfile && <InteriorInquiryModal
        profile={inquiryProfile}
        isOpen={Boolean(inquiryProfile)}
        onClose={() => setInquiryProfile(null)}
      />}
    </div>
  );
}
