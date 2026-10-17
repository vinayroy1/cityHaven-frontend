"use client";

import React, { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Building2,
  ChevronRight,
  MapPin,
  PhoneCall,
  RotateCcw,
  Search,
  ShieldCheck,
  Sparkles,
  SlidersHorizontal,
} from "lucide-react";
import type { ProjectListing } from "@/types/project.types";
import { CDN_ASSETS } from "@/config/cdn";
import { CitySelectorDropdown } from "@/components/search/CitySelectorDropdown";
import { LocationSearchInput } from "@/components/search/LocationSearchInput";
import {
  ProjectFilterSheet,
  type ProjectFilterState,
  STATUS_OPTIONS,
} from "./ProjectFilterSheet";
import { getUserPreferredCity, detectUserLocation } from "@/lib/geo/geoService";

function formatPrice(value?: number) {
  if (!value) return "Price on request";
  if (value >= 10000000) return `₹${(value / 10000000).toFixed(2)} Cr`;
  if (value >= 100000) return `₹${(value / 100000).toFixed(2)} L`;
  return `₹${value.toLocaleString("en-IN")}`;
}

function cityMatches(projectCity: string, searchCity: string) {
  if (!searchCity || searchCity === "All" || searchCity === "All Cities" || searchCity === "Select City") {
    return true;
  }
  const pCity = (projectCity || "").toLowerCase().trim();
  const sCity = searchCity.toLowerCase().trim();

  // Match common metro aliases & subregions
  if (/bengaluru|bangalore/i.test(sCity) && /bengaluru|bangalore/i.test(pCity)) return true;
  if (/mumbai|thane|navi mumbai/i.test(sCity) && /mumbai|thane|navi mumbai/i.test(pCity)) return true;
  if (/delhi/i.test(sCity) && /delhi/i.test(pCity)) return true;
  if (/noida/i.test(sCity) && /noida/i.test(pCity)) return true;
  if (/gurugram|gurgaon/i.test(sCity) && /gurugram|gurgaon/i.test(pCity)) return true;
  if (/pune/i.test(sCity) && /pune/i.test(pCity)) return true;
  if (/hyderabad/i.test(sCity) && /hyderabad/i.test(pCity)) return true;

  return pCity.includes(sCity) || sCity.includes(pCity);
}

function localityMatches(project: ProjectListing, localities: string[]) {
  if (!localities || localities.length === 0) return true;
  const pLoc = (project.locality || "").toLowerCase();
  const pSite = (project.siteAddress || "").toLowerCase();
  const pLandmark = (project.landmark || "").toLowerCase();

  return localities.some((loc) => {
    const l = loc.toLowerCase().trim();
    return pLoc.includes(l) || l.includes(pLoc) || pSite.includes(l) || pLandmark.includes(l);
  });
}

function keywordMatches(project: ProjectListing, keyword: string) {
  if (!keyword || !keyword.trim()) return true;
  const q = keyword.toLowerCase().trim();
  return (
    project.name.toLowerCase().includes(q) ||
    project.developerName.toLowerCase().includes(q) ||
    project.locality.toLowerCase().includes(q) ||
    project.city.toLowerCase().includes(q) ||
    Boolean(project.landmark && project.landmark.toLowerCase().includes(q))
  );
}

export function NewProjectsClient({ initialProjects }: { initialProjects: ProjectListing[] }) {
  // Search inputs state (draft)
  const [cityDraft, setCityDraft] = useState<string>("");
  const [localityDrafts, setLocalityDrafts] = useState<string[]>([]);
  const [keywordDraft, setKeywordDraft] = useState<string>("");

  // Applied search state
  const [appliedCity, setAppliedCity] = useState<string>("");
  const [appliedLocalities, setAppliedLocalities] = useState<string[]>([]);
  const [appliedKeyword, setAppliedKeyword] = useState<string>("");

  // Filter drawer state
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filterState, setFilterState] = useState<ProjectFilterState>({
    status: "ALL",
    bhk: "All",
    budgetMin: undefined,
    budgetMax: undefined,
    sortBy: "featured",
    verifiedOnly: false,
  });

  // Auto-detect user preferred city on initial mount if available
  useEffect(() => {
    let cancelled = false;
    const preferred = getUserPreferredCity();
    if (preferred && preferred.trim()) {
      setCityDraft(preferred.trim());
      setAppliedCity(preferred.trim());
      return;
    }

    void detectUserLocation().then((loc) => {
      if (!cancelled && loc?.city) {
        setCityDraft(loc.city.trim());
        setAppliedCity(loc.city.trim());
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const runSearch = () => {
    setAppliedCity(cityDraft);
    setAppliedLocalities(localityDrafts);
    setAppliedKeyword(keywordDraft);
  };

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filterState.status !== "ALL") count++;
    if (filterState.bhk !== "All") count++;
    if (filterState.budgetMin !== undefined || filterState.budgetMax !== undefined) count++;
    if (filterState.verifiedOnly) count++;
    if (filterState.sortBy !== "featured") count++;
    return count;
  }, [filterState]);

  const hasActiveFilters = Boolean(
    appliedCity ||
    appliedLocalities.length > 0 ||
    appliedKeyword.trim() ||
    activeFilterCount > 0
  );

  const resetAll = () => {
    setCityDraft("");
    setLocalityDrafts([]);
    setKeywordDraft("");
    setAppliedCity("");
    setAppliedLocalities([]);
    setAppliedKeyword("");
    setFilterState({
      status: "ALL",
      bhk: "All",
      budgetMin: undefined,
      budgetMax: undefined,
      sortBy: "featured",
      verifiedOnly: false,
    });
  };

  const filteredProjects = useMemo(() => {
    return initialProjects
      .filter((project) => {
        // 1. City Filter
        if (!cityMatches(project.city, appliedCity)) return false;

        // 2. Locality Filter
        if (!localityMatches(project, appliedLocalities)) return false;

        // 3. Keyword Filter
        if (!keywordMatches(project, appliedKeyword)) return false;

        // 4. Status Filter
        if (filterState.status !== "ALL" && project.status !== filterState.status) {
          return false;
        }

        // 5. BHK Filter
        if (filterState.bhk !== "All") {
          const hasBhk = project.configurations.some((c) =>
            c.bhkType.toLowerCase().includes(filterState.bhk.toLowerCase())
          );
          if (!hasBhk) return false;
        }

        // 6. Budget Min / Max Filter
        if (filterState.budgetMin !== undefined && project.priceMax < filterState.budgetMin) {
          return false;
        }
        if (filterState.budgetMax !== undefined && project.priceMin > filterState.budgetMax) {
          return false;
        }

        // 7. RERA Verified Only
        if (filterState.verifiedOnly && !project.reraId) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (filterState.sortBy === "price_asc") return a.priceMin - b.priceMin;
        if (filterState.sortBy === "price_desc") return b.priceMin - a.priceMin;
        return 0;
      });
  }, [initialProjects, appliedCity, appliedLocalities, appliedKeyword, filterState]);

  return (
    <div className="pb-16 min-w-0">
      {/* Hero Header & Search Section */}
      <div className="relative border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/60 overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(244,63,94,0.08),transparent_50%),radial-gradient(circle_at_80%_80%,rgba(16,185,129,0.06),transparent_50%)]" />

        <div className="relative mx-auto max-w-7xl px-3 py-6 sm:px-6 sm:py-8 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div className="max-w-3xl">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                <Sparkles className="h-4 w-4" />
                <span>Verified Real Estate Developments</span>
              </div>
              <h1 className="mt-1.5 text-2xl font-black tracking-tight text-slate-950 dark:text-white sm:text-4xl">
                New Projects & Townships
              </h1>
              <p className="mt-1.5 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                Browse government RERA-approved residential projects, luxury gated societies, and builder launches across India.
              </p>
            </div>

            <div className="hidden shrink-0 sm:flex">
              <Link
                href="/post-project"
                className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-5 py-2.5 text-xs font-bold text-white shadow-md transition hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100"
              >
                <Building2 className="h-4 w-4" />
                <span>List your project</span>
              </Link>
            </div>
          </div>

          {/* Elevated Wide Search Bar Container (matches flatmate & property search) */}
          <div className="mt-5 flex flex-col gap-2 rounded-2xl border border-slate-200/90 bg-white p-2.5 shadow-xs dark:border-slate-800 dark:bg-slate-900 sm:gap-3.5 sm:rounded-3xl sm:p-4">
            {/* Row 1: City Dropdown + Locality/Project Search + Search Button */}
            <div className="grid grid-cols-[auto_minmax(0,1fr)] gap-2 min-w-0 md:grid-cols-[auto_minmax(12rem,1fr)_auto]">
              <CitySelectorDropdown
                compact
                selectedCityName={cityDraft}
                onSelectCity={(selectedCity) => {
                  setCityDraft(selectedCity.name);
                  setLocalityDrafts([]);
                  setAppliedCity(selectedCity.name);
                  setAppliedLocalities([]);
                }}
              />
              <LocationSearchInput
                cityName={cityDraft}
                localities={localityDrafts.map((label) => ({ label, city: cityDraft }))}
                keyword={keywordDraft}
                maxLocalities={2}
                placeholder={cityDraft ? `Locality or project in ${cityDraft}` : "Search city, locality, project..."}
                onChange={({ localities, keyword }) => {
                  const labels = localities.map((item) => item.label);
                  setLocalityDrafts(labels);
                  setKeywordDraft(keyword);
                  setAppliedLocalities(labels);
                  setAppliedKeyword(keyword);
                }}
              />
              <button
                type="button"
                onClick={runSearch}
                className="hidden h-11 items-center justify-center gap-2 rounded-xl bg-rose-600 px-6 text-sm font-bold text-white shadow-md shadow-rose-600/20 transition hover:bg-rose-700 active:scale-[0.98] md:flex"
              >
                <Search className="h-4 w-4" />
                <span>Search</span>
              </button>
            </div>

            {/* Mobile Actions: Filters & Search side-by-side (matches flatmate & property search) */}
            <div className="grid grid-cols-2 gap-2 md:hidden">
              <button
                type="button"
                onClick={() => setFiltersOpen(true)}
                className="flex h-10 w-full items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-2 text-xs font-bold text-slate-800 transition active:scale-[0.98] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              >
                <SlidersHorizontal className="h-3.5 w-3.5 text-rose-600" />
                <span>Filters</span>
                {activeFilterCount > 0 && (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-600 px-1.5 text-[9px] font-bold text-white">
                    {activeFilterCount}
                  </span>
                )}
              </button>
              <button
                type="button"
                onClick={runSearch}
                className="flex h-10 w-full items-center justify-center gap-1.5 rounded-xl bg-rose-600 px-3 text-xs font-bold text-white shadow-xs transition active:scale-[0.98]"
              >
                <Search className="h-3.5 w-3.5" />
                <span>Search</span>
              </button>
            </div>

            {/* Desktop Quick Filters & Sort Bar */}
            <div className="hidden md:flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-800">
              <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 no-scrollbar">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider pl-1 shrink-0">
                  Status:
                </span>
                {STATUS_OPTIONS.map((s) => {
                  const active = filterState.status === s.value;
                  return (
                    <button
                      key={s.value}
                      type="button"
                      onClick={() => setFilterState((prev) => ({ ...prev, status: s.value }))}
                      className={`rounded-full px-3 py-1 text-xs font-bold transition shrink-0 ${
                        active
                          ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
                      }`}
                    >
                      {s.label}
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setFiltersOpen(true)}
                  className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 transition"
                >
                  <SlidersHorizontal className="h-3.5 w-3.5 text-rose-600" />
                  <span>More Filters</span>
                  {activeFilterCount > 0 && (
                    <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-600 px-1 text-[9px] font-bold text-white">
                      {activeFilterCount}
                    </span>
                  )}
                </button>

                <select
                  value={filterState.sortBy}
                  onChange={(e) =>
                    setFilterState((prev) => ({
                      ...prev,
                      sortBy: e.target.value as any,
                    }))
                  }
                  className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
                >
                  <option value="featured">Featured First</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                </select>

                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={resetAll}
                    className="inline-flex items-center gap-1 text-xs font-bold text-rose-600 hover:text-rose-700 dark:text-rose-400 px-1"
                  >
                    <RotateCcw className="h-3 w-3" />
                    <span>Reset</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Bottom Sheet / Slide-over Dialog */}
      <ProjectFilterSheet
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        state={filterState}
        onApply={(next) => setFilterState(next)}
        totalResultsCount={filteredProjects.length}
      />

      {/* Results Section */}
      <div className="mx-auto max-w-7xl px-3 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-2">
            <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
              Showing <span className="text-rose-600 font-extrabold">{filteredProjects.length}</span> Verified Projects
              {appliedCity ? ` in ${appliedCity}` : " across India"}
            </p>
            {activeFilterCount > 0 && (
              <span className="rounded-full bg-rose-50 px-2.5 py-0.5 text-[10px] font-bold text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200/60 dark:border-rose-900/40">
                {activeFilterCount} {activeFilterCount === 1 ? "filter" : "filters"}
              </span>
            )}
          </div>

          <Link
            href="/propertySearch"
            className="text-xs font-bold text-rose-600 hover:text-rose-700 dark:text-rose-400 inline-flex items-center gap-1"
          >
            <span>Search individual flats & rentals</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Project Cards Grid */}
        {filteredProjects.length > 0 ? (
          <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredProjects.map((project) => (
              <div
                key={project.id}
                className="group flex flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:shadow-xl dark:border-slate-800 dark:bg-slate-900"
              >
                {/* Project Image */}
                <div className="relative h-48 sm:h-56 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                  <img
                    src={project.images[0] || CDN_ASSETS.placeholderWebp}
                    alt={project.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

                  {/* Badges */}
                  <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                    <span className="inline-flex items-center gap-1 rounded-full bg-white/95 backdrop-blur-md px-2.5 py-1 text-[11px] font-black text-emerald-700 shadow-sm">
                      <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                      <span>RERA: {project.reraId.split("-")[0] || project.reraId}</span>
                    </span>
                  </div>

                  <div className="absolute top-3 right-3">
                    <span className="rounded-full bg-slate-950/80 backdrop-blur-md px-2.5 py-1 text-[10px] font-bold text-white uppercase tracking-wider">
                      {project.status.replace(/_/g, " ")}
                    </span>
                  </div>

                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-rose-300">
                      By {project.developerName}
                    </div>
                    <h3 className="text-lg sm:text-xl font-black tracking-tight drop-shadow-sm truncate">
                      {project.name}
                    </h3>
                  </div>
                </div>

                {/* Card Body */}
                <div className="flex flex-1 flex-col p-4 sm:p-5">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                    <MapPin className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                    <span className="truncate">{project.locality}, {project.city}</span>
                  </div>

                  {/* Specs Pill Strip */}
                  <div className="mt-3 flex flex-wrap gap-2 text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                    {project.totalLandArea && (
                      <span className="rounded-lg bg-slate-100 px-2 py-0.5 dark:bg-slate-800">
                        📐 {project.totalLandArea}
                      </span>
                    )}
                    {project.totalTowers && (
                      <span className="rounded-lg bg-slate-100 px-2 py-0.5 dark:bg-slate-800">
                        🏢 {project.totalTowers} Towers
                      </span>
                    )}
                    <span className="rounded-lg bg-slate-100 px-2 py-0.5 dark:bg-slate-800">
                      ⏳ {project.possessionDate}
                    </span>
                  </div>

                  {/* Configurations Chips */}
                  <div className="mt-4 border-t border-slate-100 pt-3 dark:border-slate-800">
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                      Available Configurations:
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {project.configurations.map((cfg) => (
                        <span
                          key={cfg.id}
                          className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-bold text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                        >
                          {cfg.bhkType} ({cfg.carpetArea} sq.ft)
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Price & Action CTA */}
                  <div className="mt-auto pt-5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Price Range
                      </span>
                      <span className="text-base font-black text-slate-950 dark:text-white">
                        {formatPrice(project.priceMin)} – {formatPrice(project.priceMax)}
                      </span>
                    </div>

                    <Link
                      href={`/new-projects/${project.slug}`}
                      className="inline-flex items-center gap-1.5 rounded-full bg-rose-600 px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-rose-700 active:scale-95"
                    >
                      <span>Explore</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-slate-300 p-8 sm:p-12 text-center dark:border-slate-800">
            <Building2 className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-700" />
            <h3 className="mt-4 text-base font-bold text-slate-900 dark:text-white">
              No matching projects found
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              Try adjusting your city, locality, or budget filters to explore other verified developments.
            </p>
            <button
              onClick={resetAll}
              className="mt-4 rounded-full bg-rose-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-rose-700 transition"
            >
              Reset All Filters
            </button>
          </div>
        )}

        {/* Builder Promotion Callout */}
        <div className="mt-12 sm:mt-16 overflow-hidden rounded-3xl bg-gradient-to-r from-rose-600 to-rose-700 p-6 sm:p-10 text-white shadow-xl">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-bold uppercase tracking-wider backdrop-blur-md">
              <Building2 className="h-3.5 w-3.5" />
              <span>Developer Partnership</span>
            </span>
            <h2 className="mt-4 text-2xl sm:text-3xl font-black tracking-tight">
              Are you a Builder or Real Estate Developer?
            </h2>
            <p className="mt-2 text-sm text-rose-100">
              List your entire project, towers, and configuration pricing matrix in under 5 minutes. Connect directly with verified, high-budget property buyers without intermediary friction.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/post-project"
                className="rounded-full bg-white px-6 py-2.5 text-xs font-bold text-rose-700 shadow-md transition hover:bg-rose-50"
              >
                List Your Project
              </Link>
              <a
                href="tel:+918848510629"
                className="inline-flex items-center gap-1.5 rounded-full border border-white/30 bg-white/10 px-5 py-2.5 text-xs font-bold text-white backdrop-blur-md transition hover:bg-white/20"
              >
                <PhoneCall className="h-3.5 w-3.5" />
                <span>Call Builder Desk: +91-8848510629</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
