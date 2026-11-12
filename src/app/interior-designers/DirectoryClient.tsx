"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { PageBreadcrumbs, type BreadcrumbTrailItem } from "@/components/common/PageBreadcrumbs";
import { DesignerGridSkeleton } from "@/components/interiors/skeletons";
import {
  Search,
  Building2,
  SlidersHorizontal,
  ShieldCheck,
  X,
  RotateCcw,
} from "lucide-react";
import { useSearchInteriorDesignersQuery } from "@/features/interiors/api";
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
import { useCountry } from "@/lib/country/countryStore";
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
  /** True when the URL asked for a specific city (?city=...). */
  cityFromUrl?: boolean;
}

export function DirectoryClient({ initialCity, initialState, initialData }: DirectoryClientProps) {
  const [selectedCity, setSelectedCity] = useState(initialCity);
  const [selectedState, setSelectedState] = useState(initialState);
  const [selectedLocality, setSelectedLocality] = useState("ALL");
  const [providerType, setProviderType] = useState<InteriorProviderType | "ALL">("ALL");
  const [selectedService, setSelectedService] = useState("ALL");
  const [selectedStyle, setSelectedStyle] = useState("ALL");
  const [selectedBracket, setSelectedBracket] = useState("ALL");
  const [isVerifiedOnly, setIsVerifiedOnly] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [viewTab, setViewTab] = useState<"DIRECTORY" | "INSPIRATION">("DIRECTORY");
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Selected profile for inquiry quote modal
  const [inquiryProfile, setInquiryProfile] = useState<InteriorProfile | null>(null);

  // The server already rendered the default view; only fetch once filters change.
  const portalCountry = useCountry();
  const sym = portalCountry.currencySymbol;
  // The server render is India's; other countries always fetch their own list.
  const isInitialQuery =
    portalCountry.code === "IN" &&
    !!initialData &&
    selectedCity === initialCity &&
    providerType === "ALL" &&
    selectedService === "ALL" &&
    selectedBracket === "ALL" &&
    !isVerifiedOnly;

  const query = useSearchInteriorDesignersQuery(
    {
      city: selectedCity || undefined,
      countryCode: portalCountry.code,
      providerType: providerType === "ALL" ? undefined : providerType,
      service: selectedService === "ALL" ? undefined : selectedService,
      // The API's `budgetBracket` takes other values (and is not applied);
      // `budgetSegment` filters on the tiers designers pick in their profile.
      budgetSegment: selectedBracket === "ALL" ? undefined : (selectedBracket as InteriorSearchParams["budgetSegment"]),
      isVerified: isVerifiedOnly ? true : undefined,
      limit: 30,
    },
    { skip: isInitialQuery },
  );
  const data = isInitialQuery ? initialData : query.data;
  const isLoading = !isInitialQuery && query.isLoading;

  const crumbs: BreadcrumbTrailItem[] = selectedCity
    ? [{ label: "Interior designers", href: "/interior-designers" }, { label: selectedCity }]
    : [{ label: "Interior designers" }];

  const rawDesigners = useMemo(() => data?.items || [], [data]);

  // Client-side filtering for search keyword, specific locality, brand, and design style
  const filteredDesigners = useMemo(() => {
    return rawDesigners.filter((d) => {
      // Locality check
      if (selectedLocality !== "ALL") {
        const matchesPrimary = d.primaryLocality?.toLowerCase() === selectedLocality.toLowerCase();
        const matchesBranches = d.branches?.some(
          (b) => b.locality?.toLowerCase() === selectedLocality.toLowerCase()
        );
        if (!matchesPrimary && !matchesBranches) return false;
      }

      // Design style check
      if (selectedStyle !== "ALL") {
        const styles = d.designStyles || [];
        if (!styles.some((s) => s.toLowerCase().includes(selectedStyle.toLowerCase()))) {
          return false;
        }
      }

      // Keyword check (Name, About, Tagline, Locality)
      if (searchKeyword.trim()) {
        const q = searchKeyword.toLowerCase();
        const inName = d.businessName?.toLowerCase().includes(q) || d.displayName?.toLowerCase().includes(q);
        const inLocality = d.primaryLocality?.toLowerCase().includes(q);
        const inTagline = d.tagline?.toLowerCase().includes(q);
        const inServices = d.servicesOffered?.some((s) => s.toLowerCase().includes(q));
        if (!inName && !inLocality && !inTagline && !inServices) return false;
      }

      return true;
    });
  }, [rawDesigners, selectedLocality, selectedStyle, searchKeyword]);

  // Reset filters
  const handleResetFilters = () => {
    setSelectedLocality("ALL");
    setProviderType("ALL");
    setSelectedService("ALL");
    setSelectedStyle("ALL");
    setSelectedBracket("ALL");
    setIsVerifiedOnly(false);
    setSearchKeyword("");
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
    setSelectedCity(city);
    setSelectedState(state);
    setSelectedLocality("ALL");
    // Keep the URL shareable (?city=Delhi) without a navigation.
    const url = new URL(window.location.href);
    if (city) url.searchParams.set("city", city);
    else url.searchParams.delete("city");
    window.history.replaceState(null, "", url.toString());
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

  const selectCls =
    "h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-800 focus:border-rose-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100";
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

          {/* Search + city + filters: one row on desktop, two on mobile */}
          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <div className="relative min-w-0 flex-1">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                placeholder="Search name, area or service"
                aria-label="Search interior designers"
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50/60 pl-10 pr-9 text-sm text-slate-900 placeholder-slate-400 focus:border-rose-500 focus:bg-white focus:outline-hidden dark:border-slate-700 dark:bg-slate-800/80 dark:text-white"
              />
              {searchKeyword && (
                <button
                  type="button"
                  onClick={() => setSearchKeyword("")}
                  aria-label="Clear search"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <div className="flex min-w-0 gap-2">
              <div className="min-w-0 flex-1 sm:w-60 sm:flex-none">
                <PropertyListingCitySelector
                  value={selectedCity}
                  selectedState={selectedState}
                  onChange={(c: CitySelection) => pickCity(c.name, c.state || "")}
                  placeholder="All cities"
                />
              </div>
              <button
                type="button"
                onClick={() => setMobileFilterOpen((o) => !o)}
                aria-expanded={mobileFilterOpen}
                className={`inline-flex h-11 shrink-0 items-center gap-2 rounded-xl border px-3.5 text-sm font-bold transition ${
                  mobileFilterOpen || activeChips.length > 0
                    ? "border-rose-400 bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300"
                    : "border-slate-200 text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300"
                }`}
              >
                <SlidersHorizontal className="h-4 w-4" />
                Filters{activeChips.length > 0 ? ` (${activeChips.length})` : ""}
              </button>
            </div>
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
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
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
                        className={`rounded-lg text-xs font-bold transition ${
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
                {selectedCity && (
                  <div className="min-w-0">
                    <span className={labelCls}>Locality</span>
                    <PropertyListingLocalitySelector
                      value={selectedLocality === "ALL" ? "" : selectedLocality}
                      cityName={selectedCity}
                      selectedState={selectedState}
                      onChange={(l: LocalitySelection) => setSelectedLocality(l.name || "ALL")}
                      placeholder={`Any area in ${selectedCity}`}
                    />
                  </div>
                )}
                <div className="min-w-0">
                  <label htmlFor="filter-service" className={labelCls}>Service</label>
                  <select id="filter-service" value={selectedService} onChange={(e) => setSelectedService(e.target.value)} className={selectCls}>
                    <option value="ALL">Any service</option>
                    {SERVICES_OFFERED.map((svc) => (
                      <option key={svc} value={svc}>{svc}</option>
                    ))}
                  </select>
                </div>
                <div className="min-w-0">
                  <label htmlFor="filter-budget" className={labelCls}>Budget</label>
                  <select id="filter-budget" value={selectedBracket} onChange={(e) => setSelectedBracket(e.target.value)} className={selectCls}>
                    <option value="ALL">Any budget</option>
                    <option value="ECONOMY">Economy (under {sym}1,400/sq.ft.)</option>
                    <option value="MID_RANGE">Standard ({sym}1,400–2,200/sq.ft.)</option>
                    <option value="PREMIUM">Premium ({sym}2,200–3,500/sq.ft.)</option>
                    <option value="LUXURY">Luxury ({sym}3,500+/sq.ft.)</option>
                  </select>
                </div>
                <div className="min-w-0">
                  <label htmlFor="filter-style" className={labelCls}>Design style</label>
                  <select id="filter-style" value={selectedStyle} onChange={(e) => setSelectedStyle(e.target.value)} className={selectCls}>
                    <option value="ALL">Any style</option>
                    {DESIGN_STYLES.map((st) => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </div>
                <div className="flex min-w-0 items-end">
                  <button
                    type="button"
                    onClick={() => setIsVerifiedOnly(!isVerifiedOnly)}
                    aria-pressed={isVerifiedOnly}
                    className={`inline-flex h-11 w-full items-center justify-center gap-1.5 rounded-xl border text-sm font-bold transition ${
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
            {isLoading ? "Loading…" : `${filteredDesigners.length} ${filteredDesigners.length === 1 ? "designer" : "designers"}`}
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
                  <InteriorDesignerCard
                    key={profile.id}
                    profile={profile}
                    priority={idx === 0}
                    onOpenInquiry={(p) => setInquiryProfile(p)}
                  />
                ))}
              </div>
            )
          ) : (
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
                        {project.propertyConfig} · {project.designStyle}
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
