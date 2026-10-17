"use client";

import React, { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Building2,
  ChevronRight,
  CalendarDays,
  Layers3,
  Loader2,
  MapPin,
  PhoneCall,
  Search,
  ShieldCheck,
  Sparkles,
  SlidersHorizontal,
} from "lucide-react";
import { CDN_ASSETS } from "@/config/cdn";
import { CitySelectorDropdown } from "@/components/search/CitySelectorDropdown";
import { LocationSearchInput } from "@/components/search/LocationSearchInput";
import {
  ProjectFilterSheet,
  ProjectFilterRail,
  type ProjectFilterState,
} from "./ProjectFilterSheet";
import { getUserPreferredCity, detectUserLocation } from "@/lib/geo/geoService";
import { useSearchProjectsQuery } from "@/features/projects/api";
import type { ProjectStatus } from "@/types/project.types";

function formatPrice(value?: number) {
  if (!value) return "Price on request";
  if (value >= 10000000) return `₹${(value / 10000000).toFixed(2)} Cr`;
  if (value >= 100000) return `₹${(value / 100000).toFixed(2)} L`;
  return `₹${value.toLocaleString("en-IN")}`;
}

export function NewProjectsClient() {
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

  const resetProjectFilters = () => {
    setFilterState({
      status: "ALL",
      bhk: "All",
      budgetMin: undefined,
      budgetMax: undefined,
      sortBy: "featured",
      verifiedOnly: false,
    });
  };

  const { data, isLoading, isFetching, isError, refetch } = useSearchProjectsQuery({
    city: appliedCity && appliedCity !== "All" ? appliedCity : undefined,
    locality: appliedLocalities.length ? appliedLocalities.join(",") : undefined,
    q: appliedKeyword || undefined,
    status: filterState.status === "ALL" ? undefined : filterState.status as ProjectStatus,
    bhk: filterState.bhk === "All" ? undefined : filterState.bhk,
    budgetMin: filterState.budgetMin,
    budgetMax: filterState.budgetMax,
    verifiedOnly: filterState.verifiedOnly || undefined,
    sortBy: filterState.sortBy,
    page: 1,
    pageSize: 24,
  });
  const projects = data?.items || [];
  const totalProjects = data?.total || 0;

  return (
    <div className="pb-16 min-w-0">
      {/* Hero Header & Search Section */}
      <div className="relative z-20 overflow-visible border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/60">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(244,63,94,0.08),transparent_50%),radial-gradient(circle_at_80%_80%,rgba(16,185,129,0.06),transparent_50%)]" />

        <div className="relative mx-auto max-w-7xl px-3 py-3 sm:px-6 sm:py-7 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div className="max-w-3xl">
              <div className="hidden items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 sm:flex">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Verified Real Estate Developments</span>
              </div>
              <h1 className="text-xl font-black tracking-tight text-slate-950 dark:text-white sm:mt-1.5 sm:text-4xl">
                New Projects & Townships
              </h1>
              <p className="mt-1.5 hidden text-sm text-slate-600 dark:text-slate-300 sm:block">
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
          <div className="mt-2.5 flex flex-col gap-2 rounded-2xl border border-slate-200/90 bg-white p-2 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:mt-5 sm:rounded-3xl sm:p-4">
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

          </div>
        </div>
      </div>

      {/* Filter Bottom Sheet / Slide-over Dialog */}
      <ProjectFilterSheet
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        state={filterState}
        onApply={(next) => setFilterState(next)}
        totalResultsCount={totalProjects}
      />

      {/* Results Section */}
      <div className="mx-auto max-w-7xl px-3 py-3 sm:px-6 sm:py-6 lg:px-8">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2 sm:mb-4 sm:gap-3">
          <div className="flex items-center gap-2">
            <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
              Showing <span className="text-rose-600 font-extrabold">{totalProjects}</span> Verified Projects
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
            className="hidden text-xs font-bold text-rose-600 hover:text-rose-700 dark:text-rose-400 sm:inline-flex sm:items-center sm:gap-1"
          >
            <span>Search individual flats & rentals</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="flex items-start gap-6">
          <div className="min-w-0 flex-1">
        {/* Project Cards Grid */}
        {isLoading || isFetching ? (
          <div className="flex min-h-64 items-center justify-center rounded-3xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
            <Loader2 className="h-7 w-7 animate-spin text-rose-600" />
          </div>
        ) : isError ? (
          <div className="rounded-3xl border border-dashed border-rose-300 p-8 text-center dark:border-rose-900">
            <h3 className="font-bold text-slate-900 dark:text-white">Projects could not be loaded</h3>
            <button type="button" onClick={() => refetch()} className="mt-4 rounded-full bg-rose-600 px-5 py-2 text-xs font-bold text-white">Try again</button>
          </div>
        ) : projects.length > 0 ? (
          <div className="grid gap-4 xl:grid-cols-2">
            {projects.map((project) => (
              <Link
                key={project.id}
                href={`/new-projects/${project.slug}`}
                className="group flex cursor-pointer flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-rose-300 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 dark:border-slate-800 dark:bg-slate-900"
              >
                {/* Project Image */}
                <div className="relative h-40 w-full overflow-hidden bg-slate-100 sm:h-52 dark:bg-slate-800">
                  <img
                    src={project.images[0] || CDN_ASSETS.placeholderWebp}
                    alt={project.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

                  {/* Badges */}
                  <div className="absolute left-2.5 top-2.5 flex flex-wrap gap-1.5 sm:left-3 sm:top-3">
                    <span className="inline-flex items-center gap-1 rounded-full bg-white/95 px-2 py-1 text-[10px] font-black text-emerald-700 shadow-sm backdrop-blur-md sm:px-2.5 sm:text-[11px]">
                      <ShieldCheck className="h-3 w-3 text-emerald-600 sm:h-3.5 sm:w-3.5" />
                      <span>RERA Verified</span>
                    </span>
                  </div>

                  <div className="absolute right-2.5 top-2.5 sm:right-3 sm:top-3">
                    <span className="rounded-full bg-slate-950/80 px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-white backdrop-blur-md sm:px-2.5 sm:text-[10px]">
                      {project.status.replace(/_/g, " ")}
                    </span>
                  </div>

                  <div className="absolute bottom-2.5 left-3 right-3 text-white sm:bottom-3">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-rose-300 sm:text-[11px]">
                      By {project.developerName}
                    </div>
                    <h3 className="line-clamp-1 text-lg font-black tracking-tight drop-shadow-sm sm:line-clamp-2 sm:text-xl">
                      {project.name}
                    </h3>
                  </div>
                </div>

                {/* Card Body */}
                <div className="flex flex-1 flex-col p-3 sm:p-5">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                    <MapPin className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                    <span className="truncate">{project.locality}, {project.city}</span>
                  </div>

                  {/* Specs Pill Strip */}
                  <div className="mt-2 flex flex-wrap gap-1.5 text-[10px] font-semibold text-slate-600 dark:text-slate-300 sm:mt-3 sm:text-[11px]">
                    {project.totalLandArea && (
                      <span className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2 py-1 dark:bg-slate-800">
                        <Layers3 className="h-3 w-3" /> {project.totalLandArea}
                      </span>
                    )}
                    {project.totalTowers && (
                      <span className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2 py-1 dark:bg-slate-800">
                        <Building2 className="h-3 w-3" /> {project.totalTowers} Towers
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2 py-1 dark:bg-slate-800">
                      <CalendarDays className="h-3 w-3" /> {project.possessionDate}
                    </span>
                  </div>

                  {/* Configurations Chips */}
                  <div className="mt-2.5 border-t border-slate-100 pt-2.5 dark:border-slate-800 sm:mt-4 sm:pt-3">
                    <div className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 sm:mb-2 sm:text-[11px]">
                      Configurations
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {project.configurations.slice(0, 3).map((cfg) => (
                        <span
                          key={cfg.id}
                          className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-[10px] font-bold text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 sm:px-2.5 sm:text-[11px]"
                        >
                          <span>{cfg.bhkType}</span><span className="hidden sm:inline"> ({cfg.carpetArea} sq.ft)</span>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Price & Action CTA */}
                  <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-800 sm:mt-auto sm:pt-5">
                    <div>
                      <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Price Range
                      </span>
                      <span className="text-sm font-black text-slate-950 dark:text-white sm:text-base">
                        {formatPrice(project.priceMin)} – {formatPrice(project.priceMax)}
                      </span>
                    </div>

                    <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-600 px-3 py-2 text-[11px] font-bold text-white shadow-sm transition group-hover:bg-rose-700 sm:px-4 sm:text-xs">
                      <span>Explore</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </div>
              </Link>
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
          </div>
          <ProjectFilterRail state={filterState} onChange={setFilterState} onReset={resetProjectFilters} />
        </div>

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
