"use client";

import React, { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Building2,
  Camera,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  Layers3,
  Loader2,
  Images,
  MapPin,
  PhoneCall,
  Search,
  ShieldCheck,
  Sparkles,
  SlidersHorizontal,
  X,
  Copy,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import { CDN_ASSETS } from "@/config/cdn";
import { useCardImageSwipe } from "@/components/common/useCardImageSwipe";
import { CitySelectorDropdown } from "@/components/search/CitySelectorDropdown";
import { LocationSearchInput } from "@/components/search/LocationSearchInput";
import {
  ProjectFilterSheet,
  ProjectFilterRail,
  type ProjectFilterState,
} from "./ProjectFilterSheet";
import { getUserPreferredCity, detectUserLocation } from "@/lib/geo/geoService";
import { useSearchProjectsQuery } from "@/features/projects/api";
import type { ProjectListing, ProjectStatus } from "@/types/project.types";
import { toSearchSlug } from "@/components/search/searchQuery";

function formatPrice(value?: number) {
  if (!value) return "Price on request";
  if (value >= 10000000) return `₹${(value / 10000000).toFixed(2)} Cr`;
  if (value >= 100000) return `₹${(value / 100000).toFixed(2)} L`;
  return `₹${value.toLocaleString("en-IN")}`;
}

const buildProjectSearchHref = (city: string, localities: string[] = []) => {
  const segments = [city, ...localities.slice(0, 2)].map(toSearchSlug).filter(Boolean);
  return segments.length ? `/new-projects/${segments.join("/")}` : "/new-projects";
};

const normalizeR2Url = (url?: string | null): string => {
  if (!url) return "";
  return url.replace(/^https:\/\/pub-47ad872a9b3848e190cdf10b7ad7a298\.r2\.dev\//i, "/r2-cdn/");
};

function ProjectGridCard({
  project,
  idx,
  onContactClick,
}: {
  project: ProjectListing;
  idx: number;
  onContactClick: (project: ProjectListing) => void;
}) {
  const router = useRouter();
  const safeImages = (project.images || []).map(normalizeR2Url).filter(Boolean);
  const {
    activeImage,
    nextImage,
    prevImage,
    hasCarousel,
    hasInteracted,
    handleMouseEnter,
    containerRef: imageContainerRef,
    handleClickCapture,
    handleCardTouchStart,
    handleCardTouchMove,
    handleCardTouchEnd,
    isCardDragged,
  } = useCardImageSwipe({
    images: safeImages,
    totalImages: safeImages.length,
  });

  const projectImage = safeImages[activeImage] || safeImages[0] || CDN_ASSETS.placeholderWebp;
  const projectHref = `/new-projects/${project.slug}`;

  const openDetails = () => {
    if (isCardDragged()) return;
    router.push(projectHref);
  };

  return (
    <article
      tabIndex={0}
      role="link"
      onClick={openDetails}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          router.push(projectHref);
        }
      }}
      onTouchStart={handleCardTouchStart}
      onTouchMove={handleCardTouchMove}
      onTouchEnd={handleCardTouchEnd}
      onMouseEnter={handleMouseEnter}
      className="group flex w-full min-w-0 cursor-pointer flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-0.5 hover:border-rose-300 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 dark:border-slate-800 dark:bg-slate-900 sm:rounded-3xl"
    >
      {/* Project Image */}
      <div
        ref={imageContainerRef}
        onClickCapture={handleClickCapture}
        className="relative h-40 w-full overflow-hidden select-none touch-pan-y bg-slate-100 sm:h-44 xl:h-40 dark:bg-slate-800"
      >
        <img
          src={projectImage}
          alt={project.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 pointer-events-none"
          fetchPriority={idx === 0 || hasInteracted ? "high" : "auto"}
          loading={idx === 0 || hasInteracted ? "eager" : "lazy"}
          decoding="async"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-slate-950/15" />

        {/* Desktop Prev / Next Buttons */}
        {hasCarousel && (
          <>
            <button
              type="button"
              aria-label="Previous photo"
              onClick={prevImage}
              className="absolute left-2 top-1/2 z-20 hidden sm:inline-flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-zinc-800 shadow-md transition hover:bg-white focus:opacity-100 sm:left-2.5 sm:opacity-0 sm:group-hover:opacity-100"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              aria-label="Next photo"
              onClick={nextImage}
              className="absolute right-2 top-1/2 z-20 hidden sm:inline-flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-zinc-800 shadow-md transition hover:bg-white focus:opacity-100 sm:right-2.5 sm:opacity-0 sm:group-hover:opacity-100"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </>
        )}

        {/* Badges */}
        <div className="absolute left-2.5 top-2.5 z-10 flex flex-wrap gap-1.5 pointer-events-none sm:left-3 sm:top-3">
          <span className="inline-flex items-center gap-1 rounded-full border border-white/70 bg-white/95 px-2 py-1 text-[9px] font-black text-emerald-700 shadow-sm backdrop-blur-md sm:px-2.5 sm:text-[10px]">
            <ShieldCheck className="h-3 w-3 text-emerald-600 sm:h-3.5 sm:w-3.5" />
            <span>RERA Verified</span>
          </span>
        </div>

        <div className="absolute right-2.5 top-2.5 z-10 pointer-events-none sm:right-3 sm:top-3">
          <span className="rounded-full border border-white/15 bg-slate-950/80 px-2 py-1 text-[9px] font-bold uppercase tracking-wide text-white backdrop-blur-md sm:px-2.5 sm:text-[10px]">
            {project.status.replace(/_/g, " ")}
          </span>
        </div>

        <div className="absolute inset-x-2.5 bottom-2.5 z-10 flex items-end justify-between gap-2 pointer-events-none sm:inset-x-3 sm:bottom-3">
          <div className="rounded-xl bg-slate-950/85 px-3 py-1.5 text-white shadow-lg backdrop-blur-md">
            <p className="text-[8px] font-semibold uppercase tracking-wider text-slate-300">Starting from</p>
            <p className="text-base font-black leading-tight sm:text-lg">{formatPrice(project.priceMin)}</p>
          </div>
          {hasCarousel && (
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-950/80 px-2 py-1 text-[9px] font-bold text-white backdrop-blur-md">
              <Camera className="h-3 w-3" /> {activeImage + 1} of {safeImages.length}
            </span>
          )}
        </div>
      </div>

      {/* Card Body */}
      <div className="flex flex-1 flex-col p-3 sm:p-4">
        <p className="text-[9px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 sm:text-[10px]">
          By {project.developerName}
        </p>
        <h3 className="mt-0.5 line-clamp-1 text-base font-black tracking-tight text-slate-950 transition-colors group-hover:text-rose-600 dark:text-white sm:text-lg">
          {project.name}
        </h3>
        <div className="mt-1 flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 sm:text-xs">
          <MapPin className="h-3.5 w-3.5 shrink-0 text-rose-500" />
          <span className="truncate">
            {project.locality ? `${project.locality}, ` : ""}
            {typeof project.city === "string" ? project.city : (project.cityName || (project.city as any)?.name || "")}
          </span>
        </div>

        {/* Specs Pill Strip */}
        <div className="mt-2.5 grid grid-cols-2 gap-1.5 text-[10px] font-semibold text-slate-600 dark:text-slate-300 sm:text-[11px]">
          {project.totalLandArea && (
            <span className="inline-flex min-w-0 items-center gap-1 rounded-lg bg-slate-100 px-2 py-1.5 dark:bg-slate-800">
              <Layers3 className="h-3 w-3" /> {project.totalLandArea}
            </span>
          )}
          {project.totalTowers && (
            <span className="inline-flex min-w-0 items-center gap-1 rounded-lg bg-slate-100 px-2 py-1.5 dark:bg-slate-800">
              <Building2 className="h-3 w-3" /> {project.totalTowers} Towers
            </span>
          )}
        </div>

        {/* Configurations Chips */}
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {project.configurations.slice(0, 3).map((cfg) => (
            <span
              key={cfg.id}
              className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-[10px] font-bold text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 sm:text-[11px]"
            >
              {cfg.bhkType}<span className="hidden sm:inline"> · {cfg.carpetArea} sq.ft</span>
            </span>
          ))}
        </div>

        {/* Price & Action CTA */}
        <div className="mt-3 flex items-center justify-between gap-3 border-t border-slate-100 pt-2.5 dark:border-slate-800 sm:mt-auto">
          <div className="min-w-0">
            <span className="flex items-center gap-1 text-[9px] font-semibold text-slate-500 sm:text-[10px]">
              <CalendarDays className="h-3 w-3 text-slate-400" /> Possession {project.possessionDate}
            </span>
            {project.priceMax && project.priceMin && project.priceMax > project.priceMin ? (
              <span className="mt-0.5 block truncate text-[10px] font-bold text-slate-700 dark:text-slate-300">
                Up to {formatPrice(project.priceMax)}
              </span>
            ) : null}
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {project.salesPhone && (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onContactClick(project);
                }}
                className="inline-flex items-center gap-1 rounded-full border border-rose-200 bg-rose-50 px-2.5 py-1 text-[11px] font-bold text-rose-700 transition hover:bg-rose-100 hover:border-rose-300 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300"
              >
                <PhoneCall className="h-3 w-3 text-rose-600" />
                <span>View Contact</span>
              </button>
            )}
            <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-rose-50 text-rose-600 transition group-hover:bg-rose-600 group-hover:text-white dark:bg-rose-950/40 dark:text-rose-400">
              <ArrowRight className="h-4 w-4" />
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}

type NewProjectsClientProps = {
  initialCity?: string;
  initialLocalities?: string[];
  initialProjects?: ProjectListing[];
  initialTotal?: number;
};

export function NewProjectsClient({
  initialCity = "",
  initialLocalities = [],
  initialProjects = [],
  initialTotal,
}: NewProjectsClientProps = {}) {
  const router = useRouter();
  const initialLocalitiesKey = initialLocalities.join("\u001f");
  // Search inputs state (draft)
  const [cityDraft, setCityDraft] = useState<string>(initialCity);
  const [localityDrafts, setLocalityDrafts] = useState<string[]>(initialLocalities);
  const [keywordDraft, setKeywordDraft] = useState<string>("");

  // Applied search state
  const [appliedCity, setAppliedCity] = useState<string>(initialCity);
  const [appliedLocalities, setAppliedLocalities] = useState<string[]>(initialLocalities);
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

  const [contactModalProject, setContactModalProject] = useState<ProjectListing | null>(null);
  const [copiedCardPhone, setCopiedCardPhone] = useState(false);

  useEffect(() => {
    const routeLocalities = initialLocalitiesKey ? initialLocalitiesKey.split("\u001f") : [];
    setCityDraft(initialCity);
    setAppliedCity(initialCity);
    setLocalityDrafts(routeLocalities);
    setAppliedLocalities(routeLocalities);
  }, [initialCity, initialLocalitiesKey]);

  // Auto-detect user preferred city on initial mount if available
  useEffect(() => {
    let cancelled = false;
    if (initialCity) return;
    const preferred = getUserPreferredCity();
    if (preferred && preferred.trim()) {
      setCityDraft(preferred.trim());
      setAppliedCity(preferred.trim());
      router.replace(buildProjectSearchHref(preferred.trim()), { scroll: false });
      return;
    }

    void detectUserLocation().then((loc) => {
      if (!cancelled && loc?.city) {
        setCityDraft(loc.city.trim());
        setAppliedCity(loc.city.trim());
        router.replace(buildProjectSearchHref(loc.city.trim()), { scroll: false });
      }
    });

    return () => {
      cancelled = true;
    };
  }, [initialCity, router]);

  const runSearch = () => {
    setAppliedCity(cityDraft);
    setAppliedLocalities(localityDrafts);
    setAppliedKeyword(keywordDraft);
    router.push(buildProjectSearchHref(cityDraft, localityDrafts), { scroll: false });
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
    router.push("/new-projects", { scroll: false });
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
  const projects = (data?.items && data.items.length > 0)
    ? data.items
    : (data?.items ? [] : (initialProjects.length > 0 ? initialProjects : []));
  const totalProjects = data?.total ?? initialTotal ?? projects.length;

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
                disabled={isLoading || isFetching}
                onClick={runSearch}
                className={`hidden h-11 items-center justify-center gap-2 rounded-xl bg-rose-600 px-6 text-sm font-bold text-white shadow-md shadow-rose-600/20 transition hover:bg-rose-700 active:scale-[0.98] md:flex ${
                  isLoading || isFetching ? "opacity-75 cursor-not-allowed" : ""
                }`}
              >
                {isLoading || isFetching ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Searching...</span>
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4" />
                    <span>Search</span>
                  </>
                )}
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
                disabled={isLoading || isFetching}
                onClick={runSearch}
                className={`flex h-10 w-full items-center justify-center gap-1.5 rounded-xl bg-rose-600 px-3 text-xs font-bold text-white shadow-xs transition active:scale-[0.98] ${
                  isLoading || isFetching ? "opacity-75 cursor-not-allowed" : ""
                }`}
              >
                {isLoading || isFetching ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Searching...</span>
                  </>
                ) : (
                  <>
                    <Search className="h-3.5 w-3.5" />
                    <span>Search</span>
                  </>
                )}
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
        {(isLoading || isFetching) && projects.length === 0 ? (
          <div className="flex min-h-64 items-center justify-center rounded-3xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
            <Loader2 className="h-7 w-7 animate-spin text-rose-600" />
          </div>
        ) : isError && projects.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-rose-300 p-8 text-center dark:border-rose-900">
            <h3 className="font-bold text-slate-900 dark:text-white">Projects could not be loaded</h3>
            <button type="button" onClick={() => refetch()} className="mt-4 rounded-full bg-rose-600 px-5 py-2 text-xs font-bold text-white">Try again</button>
          </div>
        ) : projects.length > 0 ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3 xl:gap-4">
            {projects.map((project, idx) => (
              <ProjectGridCard
                key={project.id}
                project={project}
                idx={idx}
                onContactClick={(p) => setContactModalProject(p)}
              />
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

      {/* Contact Details Modal for Listing Cards */}
      {contactModalProject && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Contact details for ${contactModalProject.name}`}
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-0 backdrop-blur-sm sm:items-center sm:p-4"
        >
          <div className="relative flex max-h-[calc(100dvh-0.5rem)] w-full max-w-md flex-col overflow-hidden rounded-t-3xl bg-white p-6 shadow-2xl dark:border dark:border-slate-800 dark:bg-slate-900 sm:rounded-3xl">
            <button
              onClick={() => setContactModalProject(null)}
              className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500 shadow-sm hover:text-slate-800 dark:bg-slate-800 dark:text-slate-300"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-2 text-rose-600 font-bold text-xs uppercase tracking-wider">
              <PhoneCall className="h-4 w-4" />
              <span>Direct Sales Contact</span>
            </div>

            <h3 className="mt-1.5 text-xl font-black text-slate-950 dark:text-white">
              {contactModalProject.name}
            </h3>
            <p className="text-xs font-semibold text-rose-600 dark:text-rose-400">
              By {contactModalProject.developerName}
            </p>

            <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/60">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Official Sales Desk Phone
              </span>
              <div className="mt-1 flex items-center justify-between">
                <span className="text-lg font-black text-slate-950 dark:text-white">
                  +91 {(contactModalProject.salesPhone || "8848510629").replace(/^\+?91\s*[-]?\s*/, "")}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    const raw = (contactModalProject.salesPhone || "8848510629").replace(/^\+?91\s*[-]?\s*/, "");
                    navigator.clipboard.writeText(`+91-${raw}`);
                    setCopiedCardPhone(true);
                    toast.success("Phone number copied!");
                    setTimeout(() => setCopiedCardPhone(false), 2000);
                  }}
                  className="rounded-lg bg-white px-2.5 py-1 text-xs font-bold text-slate-700 shadow-sm border border-slate-200 transition hover:bg-slate-50 dark:bg-slate-700 dark:text-slate-200 dark:border-slate-600"
                >
                  {copiedCardPhone ? "Copied!" : "Copy"}
                </button>
              </div>
              <a
                href={`tel:+91${(contactModalProject.salesPhone || "").replace(/\D/g, "")}`}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-rose-600 py-2.5 text-xs font-bold text-white shadow-md shadow-rose-200 transition hover:bg-rose-700 active:scale-95 dark:shadow-none"
              >
                <PhoneCall className="h-4 w-4" />
                <span>Call Sales Desk Now</span>
              </a>
            </div>

            {contactModalProject.salesEmail && (
              <div className="mt-3 rounded-2xl border border-slate-100 bg-slate-50 p-3 text-xs dark:border-slate-800 dark:bg-slate-800/40">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Sales Email
                </span>
                <div className="mt-0.5 font-bold text-slate-800 dark:text-slate-200">
                  <a href={`mailto:${contactModalProject.salesEmail}`} className="hover:underline">
                    {contactModalProject.salesEmail}
                  </a>
                </div>
              </div>
            )}

            <div className="mt-3 space-y-1 text-xs text-slate-500">
              <p>📍 {contactModalProject.siteAddress || `${contactModalProject.locality}, ${typeof contactModalProject.city === "string" ? contactModalProject.city : contactModalProject.cityName}`}</p>
              {contactModalProject.siteVisitTimings && (
                <p>⏰ Office Timings: {contactModalProject.siteVisitTimings}</p>
              )}
            </div>

            <Link
              href={`/new-projects/${contactModalProject.slug}`}
              className="mt-4 block w-full text-center rounded-xl border border-slate-200 py-2.5 text-xs font-bold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              View Full Floor Plans & Pricing
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
