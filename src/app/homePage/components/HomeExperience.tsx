"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, BadgeCheck, Building2, Calendar, Camera, CheckCircle2, ChevronLeft, ChevronRight, Home, Loader2, MapPin, Phone, PhoneCall, RotateCcw, ShieldCheck, Sparkles, Star, Users } from "lucide-react";
import { SearchBar } from "@/components/search/SearchBar";
import { buildSearchHref, initialSearchState, type SearchState } from "@/components/search/searchQuery";
import { usePropertySearchInfinite } from "@/features/propertyListing/useQueries";
import { ResultCard } from "@/app/propertySearch/components/ResultCard";
import { toResultCardProps } from "@/app/propertySearch/components/propertyCardAdapter";
import type { PropertySearchItem } from "@/types/propertySearch.types";

import { detectUserLocation, getCachedLocation, getUserPreferredCity } from "@/lib/geo/geoService";
import { useSearchProjectsQuery } from "@/features/projects/api";
import { useSearchFlatmatesQuery } from "@/features/flatmates/api";
import dynamic from "next/dynamic";
import { useSearchInteriorDesignersQuery } from "@/features/interiors/api";
import { RenderWhenNear, useNearViewport } from "./RenderWhenNear";
import { InteriorDesignerShowcaseSkeleton } from "./InteriorDesignerShowcaseSkeleton";
import { ViewAllCard } from "./ViewAllCard";
import { PromoStrip } from "./PromoStrip";
import { CitySparseCard } from "./CitySparseCard";
import { HomeBannerCarousel } from "./HomeBannerCarousel";
import { NearbySpotlight } from "./NearbySpotlight";
import type { SpotlightLocality } from "../lib/nearbySpotlight";
import { sizedImageUrl } from "../lib/homeImage";
import type { ProjectListing } from "@/types/project.types";

// Below-the-fold card components are split out of the initial homepage bundle.
const PreferredAgentsSection = dynamic(() => import("./PreferredAgentsSection"));
const FlatmateCard = dynamic(() => import("@/components/flatmates/FlatmateCard").then((m) => m.FlatmateCard));
const InteriorDesignerShowcaseCard = dynamic(() =>
  import("./InteriorDesignerShowcaseCard").then((m) => m.InteriorDesignerShowcaseCard),
  { loading: () => <InteriorDesignerShowcaseSkeleton /> }
);
import { useCardImageSwipe } from "@/components/common/useCardImageSwipe";
import { getSelectedCountry, useCountry } from "@/lib/country/countryStore";
import { getCountry } from "@/config/countries";

const portalCountryName = () => getCountry(typeof document !== "undefined" ? getSelectedCountry() : "IN").name;
import { formatMoney, formatMoneyShort } from "@/lib/money";
import { HomeStaysSection } from "@/components/stays/HomeStaysSection";

const normalizeR2Url = (url?: string | null): string => {
  if (!url) return "";
  return url.replace(/^https:\/\/pub-47ad872a9b3848e190cdf10b7ad7a298\.r2\.dev\//i, "/r2-cdn/");
};

const CITY_OPTIONS = ["Delhi", "Gurugram", "Noida", "Mumbai", "Bengaluru", "Pune", "Hyderabad"];
const STORAGE_KEY = "awasio.home.city";

function useIdleState(timeoutMs = 1200) {
  const [isIdle, setIsIdle] = React.useState(false);
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    if ("requestIdleCallback" in window) {
      const handle = (window as any).requestIdleCallback(() => setIsIdle(true), { timeout: timeoutMs + 300 });
      return () => (window as any).cancelIdleCallback(handle);
    } else {
      const timer = setTimeout(() => setIsIdle(true), timeoutMs);
      return () => clearTimeout(timer);
    }
  }, [timeoutMs]);
  return isIdle;
}

export function HomeExperience({
  initialFreshListings = [],
  initialProjects = [],
  nearbySpotlight = {},
}: {
  initialFreshListings?: PropertySearchItem[];
  initialProjects?: ProjectListing[];
  nearbySpotlight?: Record<string, SpotlightLocality[]>;
} = {}) {
  const router = useRouter();
  const isIdle = useIdleState(1000);
  // Server and first client render must match. Browser preferences are restored
  // in the effect below after hydration.
  const [selectedCity, setSelectedCity] = React.useState("");
  const [isExplicitCity, setIsExplicitCity] = React.useState(false);
  // City detected by geo on this visit. It personalises below-the-fold sections but
  // must not swap the above-the-fold projects carousel (that would move the LCP late).
  const [isGeoCity, setIsGeoCity] = React.useState(false);
  const [belowFoldRef, isBelowFoldNear] = useNearViewport<HTMLDivElement>();
  const [searchState, setSearchState] = React.useState<SearchState>(() => initialSearchState(""));
  // Portal country (header switcher / auto-detected). India keeps the original behaviour.
  const country = useCountry();
  const isIndia = country.code === "IN";

  React.useEffect(() => {
    let cancelled = false;

    // 0. Outside India: saved city, else a detected city in that country, else the capital.
    if (!isIndia) {
      let saved = "";
      try {
        saved = window.localStorage.getItem(STORAGE_KEY)?.trim() || "";
      } catch {
        // ignore
      }
      const geo = getCachedLocation();
      const city = saved || (geo?.country === country.code ? geo.city : "") || country.defaultCity;
      setSelectedCity(city);
      setIsExplicitCity(true);
      setSearchState((prev) => ({ ...prev, cityName: city }));
      return;
    }

    // 1. Restore the saved home city or cached geo city after hydration.
    const preferredCity = getUserPreferredCity()?.trim();
    if (preferredCity) {
      setSelectedCity(preferredCity);
      setSearchState((prev) => ({ ...prev, cityName: preferredCity }));
      return;
    }

    // Back in India with no saved city: clear a city left over from another country.
    setSelectedCity("");
    setIsExplicitCity(false);
    setSearchState((prev) => ({ ...prev, cityName: undefined }));

    // 2. Otherwise detect current location dynamically (GPS first, then IP API) only once idle
    if (!isIdle) return;

    void detectUserLocation().then((profile) => {
      if (!cancelled && profile?.city && profile.city.trim() && (profile.country || "IN") === "IN") {
        const matched = profile.city.trim();
        setIsGeoCity(true);
        setSelectedCity(matched);
        setSearchState((prev) => ({ ...prev, cityName: matched }));
        try {
          window.localStorage.setItem(STORAGE_KEY, matched);
        } catch {
          // ignore
        }
      }
    });

    return () => {
      cancelled = true;
    };
  }, [isIdle, isIndia, country]);

  const updateCity = (city: string) => {
    setIsExplicitCity(true);
    setIsGeoCity(false);
    setSelectedCity(city);
    setSearchState((prev) => ({ ...prev, cityName: city || undefined }));
    try {
      if (city) window.localStorage.setItem(STORAGE_KEY, city);
      else window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Storage may be unavailable in private/restricted browser contexts.
      // Search and navigation must remain functional without persistence.
    }
  };

  const submit = (next: SearchState) => {
    setIsExplicitCity(true);
    const targetCity = next.cityName || selectedCity || undefined;
    const state = { ...next, cityName: targetCity };
    router.push(buildSearchHref(state));
    setSearchState(state);
    if (targetCity) {
      updateCity(targetCity);
    }
  };

  // Normalize city name for API (matches database entries like 'New Delhi' when 'Delhi' is selected)
  const normalizedCity = selectedCity?.toLowerCase().includes("delhi")
    ? "New Delhi"
    : (selectedCity || undefined);

  // Intent-based listing type (if user explicitly chooses RENT or PG in search bar)
  const queryListingType = searchState.intent === "RENT" || searchState.intent === "PG" || searchState.intent === "FLATMATE"
    ? searchState.intent === "FLATMATE" ? "PG" : searchState.intent
    : undefined;

  // 1. Dedicated query for fresh new listings in the selected city (only if user explicitly chose a city)
  const freshQuery = usePropertySearchInfinite(
    {
      listingType: queryListingType,
      cityName: normalizedCity,
      countryCode: country.code,
      sort: "newest",
      pageSize: 8,
    },
    { enabled: Boolean(normalizedCity) }
  );

  // 2. Nationwide trending query fallback (only needed if SSR items were empty)
  const trendingFallbackQuery = usePropertySearchInfinite(
    {
      countryCode: country.code,
      sort: "newest",
      pageSize: 12,
    },
    { enabled: initialFreshListings.length === 0 || !isIndia }
  );

  // 3. Dedicated query for budget homes / rentals (strictly separated)
  const isRentSearch = searchState.intent === "RENT";
  const budgetListingType = isRentSearch ? "RENT" : "SELL";
  const budgetMax = isRentSearch ? 50000 : 10000000;

  // Helpers to ensure "Homes" sections show only actual residential homes, not plots or commercial land
  const isPlotOrLand = (item: PropertySearchItem): boolean => {
    const subSlug = (item.propertySubType?.slug || item.propertySubTypeSlug || "").toLowerCase();
    const subName = (item.propertySubTypeName || item.propertySubType?.name || "").toLowerCase();
    const typeSlug = (item.propertyTypeSlug || item.propertyType?.slug || "").toLowerCase();
    const typeName = (item.propertyTypeName || item.propertyType?.name || "").toLowerCase();
    const title = (item.title || "").toLowerCase();

    return (
      subSlug.includes("plot") ||
      subSlug.includes("land") ||
      subName.includes("plot") ||
      subName.includes("land") ||
      typeSlug.includes("plot") ||
      typeSlug.includes("land") ||
      typeName.includes("plot") ||
      typeName.includes("land") ||
      /\b(plot|plots|land|lands|farm\s*land)\b/i.test(title) ||
      Boolean(item.plotArea && (!item.bedrooms || item.bedrooms === 0) && !item.builtUpArea && !item.carpetArea)
    );
  };

  const isHomeListing = (item: PropertySearchItem): boolean => {
    if (isPlotOrLand(item)) return false;
    if ((item.resCom ?? "").toUpperCase() === "COMMERCIAL") return false;
    return true;
  };

  // Local city budget query
  const budgetQuery = usePropertySearchInfinite(
    {
      listingType: budgetListingType,
      cityName: normalizedCity,
      countryCode: country.code,
      priceMax: budgetMax,
      sort: "newest",
      pageSize: 16,
    },
    { enabled: isIdle && isBelowFoldNear && Boolean(normalizedCity) }
  );

  // Nationwide fallback budget query (only needed if no city selected)
  const budgetFallbackQuery = usePropertySearchInfinite(
    {
      listingType: budgetListingType,
      countryCode: country.code,
      priceMax: budgetMax,
      sort: "newest",
      pageSize: 16,
    },
    { enabled: isIdle && isBelowFoldNear && !normalizedCity }
  );

  // 4. Dedicated query for owner-posted listings
  const ownerQuery = usePropertySearchInfinite(
    {
      listingType: queryListingType,
      cityName: normalizedCity,
      countryCode: country.code,
      sort: "newest",
      pageSize: 16,
    },
    { enabled: isIdle && isBelowFoldNear }
  );

  const rawFresh = (freshQuery.items as PropertySearchItem[]) ?? [];
  const trendingListings = (trendingFallbackQuery.items as PropertySearchItem[]) ?? [];

  // Keep the preloaded SSR listings stable across hydration to prevent hero image thrashing.
  // Only swap to a specific city if the user explicitly picked one.
  const freshListings = (
    isExplicitCity && selectedCity && rawFresh.length > 0
      ? rawFresh
      : isIndia && initialFreshListings.length > 0
      ? initialFreshListings
      : rawFresh.length > 0
      ? rawFresh
      : trendingListings
  ).slice(0, 4);

  const rawOwnerListings = (ownerQuery.items as PropertySearchItem[]) ?? [];
  const filteredOwnerListings = rawOwnerListings.filter(
    (item) =>
      isHomeListing(item) &&
      ((item.postedAs ?? "")?.toUpperCase() === "OWNER" ||
       ((item as any).ownerType ?? "")?.toUpperCase() === "USER")
  );
  const ownerListings = (
    filteredOwnerListings.length > 0
      ? filteredOwnerListings
      : rawOwnerListings.filter(isHomeListing).length > 0
      ? rawOwnerListings.filter(isHomeListing)
      : trendingListings.filter(isHomeListing)
  ).slice(0, 4);

  const rawBudgetListings = (budgetQuery.items as PropertySearchItem[]) ?? [];
  const rawBudgetFallbackListings = (budgetFallbackQuery.items as PropertySearchItem[]) ?? [];

  // Strictly show matching listingType properties (Sale under 1Cr or Rent under 50k) that are actual HOMES
  const budgetListings = (
    rawBudgetListings.filter(isHomeListing).length > 0
      ? rawBudgetListings.filter(isHomeListing)
      : rawBudgetFallbackListings.filter((item) => item.listingType === budgetListingType && isHomeListing(item))
  ).slice(0, 4);

  // Small city: fewer than MIN_SECTION_ITEMS local listings, so sections below fall back to all-India data.
  const citySparse =
    Boolean(selectedCity) && !freshQuery.isLoading && !freshQuery.isError && freshQuery.isFetched && rawFresh.length < MIN_SECTION_ITEMS;

  return (
    <>
      <section className="relative z-20 border-b border-slate-200/80 bg-gradient-to-b from-rose-50/60 via-white to-slate-50/70 pt-3 pb-4 sm:py-10 dark:border-slate-800 dark:from-slate-950 dark:via-slate-900/50 dark:to-slate-950">
        {/* Subtle ambient background glow */}
        <div className="pointer-events-none absolute -top-24 left-1/2 -z-10 h-64 w-[500px] -translate-x-1/2 overflow-hidden rounded-full bg-rose-500/10 blur-[90px] dark:bg-rose-600/15" />

        <div className="mx-auto max-w-4xl px-4 sm:px-6 text-center">
          {/* Heading */}
          <h1 className="mt-0 text-base font-extrabold leading-snug tracking-tight text-slate-950 min-[380px]:text-lg sm:text-4xl md:text-5xl dark:text-white">
            Find your perfect space with{" "}
            <span className="bg-gradient-to-r from-rose-600 via-rose-500 to-amber-600 bg-clip-text text-transparent">
              Awasio
            </span>
          </h1>

          {/* Short concise subtitle - visible on desktop/tablet, hidden on mobile */}
          <p className="hidden sm:block mx-auto mt-1 sm:mt-2 max-w-xl text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Verified rental homes, apartments, and commercial spaces across {country.name}.
          </p>

          {/* Centered Elevated Search Bar */}
          <div className="relative z-20 mt-2.5 w-full rounded-2xl border border-slate-200/90 bg-white/95 p-2 text-left shadow-[0_16px_40px_-15px_rgba(15,23,42,0.1)] backdrop-blur-md transition sm:mt-6 sm:p-5 dark:border-slate-800 dark:bg-slate-900/95 dark:shadow-[0_16px_40px_-15px_rgba(0,0,0,0.5)]">
            <SearchBar
              variant="hero"
              value={{ ...searchState, cityName: selectedCity || undefined }}
              onChange={(next) => {
                setSearchState(next);
                if (next.cityName !== selectedCity) {
                  updateCity(next.cityName || "");
                }
              }}
              onSubmit={submit}
            />
          </div>
            <PromoStrip />

          
        </div>
      </section>

      <div className="bg-gradient-to-b from-slate-50/80 via-white to-white dark:from-slate-900/45 dark:via-slate-950 dark:to-slate-950">
      <main className="mx-auto max-w-6xl overflow-x-clip px-4 pt-2 pb-5 sm:pt-3 sm:pb-6 sm:px-6">
        {citySparse && (
          <CitySparseCard
            city={selectedCity}
            searchHref={buildSearchHref({ ...initialSearchState(), cityName: selectedCity })}
          />
        )}

        <HomeBannerCarousel />

        <NearbySpotlight byCountry={nearbySpotlight} />

        <FeaturedProjectsSection
          selectedCity={isGeoCity && !isExplicitCity ? "" : selectedCity}
          initialProjects={initialProjects}
        />

        <ListingBlock
          isFirstBlock
          title={
            isExplicitCity && selectedCity && rawFresh.length > 0
              ? `Fresh listings in ${selectedCity}`
              : "Featured Verified Listings"
          }
          href={buildSearchHref({ ...initialSearchState(), cityName: (isExplicitCity ? selectedCity : undefined), sort: "newest" })}
          loading={Boolean(isExplicitCity && freshQuery.isLoading && freshListings.length === 0)}
          error={Boolean(isExplicitCity && freshQuery.isError && freshListings.length === 0)}
          onRetry={() => {
            freshQuery.refetch();
            trendingFallbackQuery.refetch();
          }}
          listings={freshListings}
        />

        <div ref={belowFoldRef} aria-hidden />

        <RenderWhenNear minHeight={260}>
          <PreferredAgentsSection selectedCity={selectedCity} />
        </RenderWhenNear>

        <ListingBlock
          title={
            selectedCity && rawOwnerListings.filter(isHomeListing).length < MIN_SECTION_ITEMS
              ? `Popular homes across ${portalCountryName()}`
              : filteredOwnerListings.length > 0
              ? (selectedCity ? `Owner-listed homes in ${selectedCity}` : "Owner-listed homes")
              : selectedCity ? `Verified homes in ${selectedCity}` : "Verified Direct-Connect Homes"
          }
          href={buildSearchHref({
            ...initialSearchState(),
            cityName: selectedCity || undefined,
            refine: { ...initialSearchState().refine, postedAs: ["OWNER"] },
          })}
          loading={ownerQuery.isLoading && trendingFallbackQuery.isLoading}
          error={ownerQuery.isError && trendingFallbackQuery.isError}
          onRetry={() => {
            ownerQuery.refetch();
            trendingFallbackQuery.refetch();
          }}
          listings={ownerListings}
        />

        <ListingBlock
          title={
            `${
              isIndia
                ? searchState.intent === "RENT" ? "Rentals under ₹50,000/month" : "Homes under ₹1 crore"
                : searchState.intent === "RENT"
                  ? `Rentals under ${formatMoney(budgetMax, country.code)}/month`
                  : `Homes under ${formatMoneyShort(budgetMax, country.code, { units: "long" })}`
            }${
              selectedCity
                ? rawBudgetListings.filter(isHomeListing).length > 0 ? ` in ${selectedCity}` : ` across ${country.name}`
                : ""
            }`
          }
          href={buildSearchHref({
            ...initialSearchState(),
            cityName: selectedCity || undefined,
            intent: searchState.intent === "RENT" ? "RENT" : "BUY",
            priceMax: budgetMax,
          })}
          loading={budgetQuery.isLoading && budgetFallbackQuery.isLoading}
          error={budgetQuery.isError && budgetFallbackQuery.isError}
          onRetry={() => {
            budgetQuery.refetch();
            budgetFallbackQuery.refetch();
          }}
          listings={budgetListings}
        />

        <RenderWhenNear minHeight={360}>
          <FeaturedFlatAvailableSection selectedCity={selectedCity} />
        </RenderWhenNear>

        <RenderWhenNear minHeight={360}>
          <FeaturedSeekersBuddyUpSection selectedCity={selectedCity} />
        </RenderWhenNear>

        <RenderWhenNear minHeight={420}>
          <InteriorDesignersSection selectedCity={selectedCity} />
        </RenderWhenNear>

        <RenderWhenNear minHeight={420}>
          <HomeStaysSection selectedCity={selectedCity} />
        </RenderWhenNear>

      </main>
      </div>
    </>
  );
}


/** A carousel with only one or two cards looks empty, so homepage sections need at least this many items to show. */
const MIN_SECTION_ITEMS = 3;

function ListingBlock({
  title,
  href,
  listings,
  loading,
  error,
  onRetry,
  isFirstBlock = false,
}: {
  title: string;
  href: string;
  listings: PropertySearchItem[];
  loading?: boolean;
  error?: boolean;
  onRetry?: () => void;
  isFirstBlock?: boolean;
}) {
  if (!loading && (!listings || listings.length < MIN_SECTION_ITEMS)) {
    return null;
  }

  return (
    <section className="mt-3 sm:mt-5 first:mt-0">
      <div className="mb-2 sm:mb-3 flex items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-slate-950 dark:text-white">{title}</h2>
        <Link href={href} prefetch={false} className="inline-flex items-center gap-1 text-sm font-semibold text-rose-700 dark:text-rose-400">
          View all <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
      {loading ? (
        <div className="flex w-full gap-3 overflow-x-auto pb-4 pt-1 no-scrollbar snap-x snap-mandatory">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="w-[78vw] max-w-[310px] shrink-0 snap-start sm:w-[calc((100%-0.75rem)/2)] sm:max-w-none lg:w-[calc((100%-2.25rem)/4)]">
              <PropertyCardSkeleton />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="rounded-lg border border-rose-200 bg-rose-50 p-5 text-sm text-rose-800 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-200">
          Could not load listings.
          {onRetry && (
            <button type="button" onClick={onRetry} className="ml-3 inline-flex items-center gap-1 font-semibold">
              <RotateCcw className="h-3.5 w-3.5" /> Retry
            </button>
          )}
        </div>
      ) : listings.length ? (
        <div className="flex w-full gap-3 overflow-x-auto pb-4 pt-1 no-scrollbar snap-x snap-mandatory">
          {listings.slice(0, 10).map((item, idx) => (
            <div key={item.id} className="w-[78vw] max-w-[310px] shrink-0 snap-start sm:w-[calc((100%-0.75rem)/2)] sm:max-w-none lg:w-[calc((100%-2.25rem)/4)]">
              <ResultCard
                {...toResultCardProps(item)}
                compact
                priority={false}
                // Below the projects carousel: keep these out of the LCP bandwidth window.
                deferImage
              />
            </div>
          ))}
          <div className="w-[78vw] max-w-[310px] shrink-0 snap-start sm:w-[calc((100%-0.75rem)/2)] sm:max-w-none lg:w-[calc((100%-2.25rem)/4)]">
            <ViewAllCard href={href} title={`View all ${title.toLowerCase()}`} subtitle="Browse every matching listing" />
          </div>
        </div>
      ) : null}
    </section>
  );
}

function formatProjectPrice(value?: number) {
  if (!value) return "Price on request";
  if (value >= 10000000) return `₹${(value / 10000000).toFixed(2).replace(/\.?0+$/, "")} Cr`;
  if (value >= 100000) return `₹${(value / 100000).toFixed(2).replace(/\.?0+$/, "")} L`;
  return `₹${value.toLocaleString("en-IN")}`;
}

function FeaturedProjectCard({ project, priority = false }: { project: any; priority?: boolean }) {
  const router = useRouter();
  // Size before dedupe so the swipe hook preloads 640px renditions, not the API's 1200px originals.
  const safeImages: string[] = Array.from(
    new Set<string>((project.images || []).map((u: string) => sizedImageUrl(normalizeR2Url(u), 640)).filter(Boolean))
  );
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

  const projectImage = safeImages[activeImage] || safeImages[0];
  const projectHref = `/new-projects/${project.slug}`;

  const openDetails = () => {
    if (isCardDragged()) return;
    router.push(projectHref);
  };

  return (
    <article
      tabIndex={0}
      aria-label={`View project details for ${project.name}`}
      onClick={openDetails}
      onMouseEnter={handleMouseEnter}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          router.push(projectHref);
        }
      }}
      onTouchStart={handleCardTouchStart}
      onTouchMove={handleCardTouchMove}
      onTouchEnd={handleCardTouchEnd}
      className="group flex h-full cursor-pointer flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-xs transition duration-200 hover:-translate-y-0.5 hover:border-rose-300 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 dark:border-slate-800 dark:bg-slate-900"
    >
      <div
        ref={imageContainerRef}
        onClickCapture={handleClickCapture}
        className="relative aspect-[16/10] w-full overflow-hidden select-none touch-pan-y bg-slate-100 dark:bg-slate-800"
      >
        {projectImage ? (
          <img
            src={projectImage}
            alt={project.name}
            width={640}
            height={400}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105 pointer-events-none"
            loading={priority || hasInteracted ? "eager" : "lazy"}
            fetchPriority={priority || hasInteracted ? "high" : "auto"}
            decoding={priority ? "sync" : "async"}
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-slate-200 via-slate-100 to-slate-300 dark:from-slate-800 dark:via-slate-900 dark:to-slate-800" />
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-slate-950/10" />

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

        <div className="absolute left-2.5 top-2.5 z-10 flex items-center gap-1 pointer-events-none">
          <span className="inline-flex items-center gap-1 rounded-full border border-white/60 bg-white/95 px-2 py-0.5 text-[9px] font-black text-emerald-700 shadow-xs backdrop-blur-md">
            <ShieldCheck className="h-3 w-3 text-emerald-600" />
            RERA
          </span>
        </div>

        <div className="absolute right-2.5 top-2.5 z-10 pointer-events-none">
          <span className="rounded-full bg-slate-950/80 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white backdrop-blur-md">
            {project.status?.replace(/_/g, " ") || "NEW LAUNCH"}
          </span>
        </div>

        <div className="absolute inset-x-2.5 bottom-2.5 z-10 flex items-end justify-between pointer-events-none">
          <div>
            <span className="text-[9px] font-bold uppercase text-slate-300 drop-shadow-xs">Starts at</span>
            <p className="text-sm font-black text-white drop-shadow-md">{formatProjectPrice(project.priceMin)}</p>
          </div>

          {hasCarousel && (
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-950/80 px-2 py-0.5 text-[9px] font-semibold text-white shadow-xs backdrop-blur-md">
              <Camera className="h-2.5 w-2.5" />
              {activeImage + 1} of {safeImages.length}
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-3">
        <p className="text-[10px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
          {project.developerName || "Featured Developer"}
        </p>
        <h3 className="line-clamp-1 text-sm font-bold text-slate-950 group-hover:text-rose-600 transition dark:text-white">
          {project.name}
        </h3>
        <p className="mt-1 flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 truncate">
          <MapPin className="h-3 w-3 shrink-0 text-rose-500" />
          <span className="truncate">
            {project.locality ? `${project.locality}, ` : ""}
            {typeof project.city === "string" ? project.city : (project.cityName || (project.city as any)?.name || "Top Metros")}
          </span>
        </p>

        {project.configurations && project.configurations.length > 0 && (
          <div className="mt-2.5 flex flex-wrap gap-1">
            {project.configurations.slice(0, 3).map((config: any) => (
              <span
                key={config.id}
                className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300"
              >
                {config.bhkType}
              </span>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}

const MUMBAI_FALLBACK_PROJECTS: any[] = [
  {
    id: 355,
    slug: "mayfair-vishwaraja-titwala",
    name: "Mayfair Vishwaraja",
    developerName: "Mayfair Housing",
    locality: "Titwala East",
    cityName: "Mumbai",
    status: "READY_TO_MOVE",
    priceMin: 2200000,
    priceMax: 4800000,
    images: [
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=640&auto=format&fit=crop&q=70",
      "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=640&auto=format&fit=crop&q=70",
    ],
    configurations: [
      { id: 1050, bhkType: "1 RK" },
      { id: 1051, bhkType: "1 BHK" },
      { id: 1052, bhkType: "2 BHK" },
    ],
  },
  {
    id: 356,
    slug: "unnathi-woods-thane",
    name: "Unnathi Woods",
    developerName: "Raunak Group",
    locality: "Ghodbunder Road, Thane West",
    cityName: "Mumbai",
    status: "READY_TO_MOVE",
    priceMin: 5200000,
    priceMax: 9200000,
    images: [
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=640&auto=format&fit=crop&q=70",
      "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=640&auto=format&fit=crop&q=70",
    ],
    configurations: [
      { id: 1053, bhkType: "1 BHK" },
      { id: 1054, bhkType: "2 BHK" },
    ],
  },
  {
    id: 225,
    slug: "oberoi-sky-city-borivali-east-mumbai",
    name: "Oberoi Sky City",
    developerName: "Oberoi Realty",
    locality: "Borivali East",
    cityName: "Mumbai",
    status: "UNDER_CONSTRUCTION",
    priceMin: 35000000,
    priceMax: 68000000,
    images: [
      "https://pub-47ad872a9b3848e190cdf10b7ad7a298.r2.dev/projects/photos/oberoi-sky-city-borivali-east-mumbai/photo_1.webp",
      "https://pub-47ad872a9b3848e190cdf10b7ad7a298.r2.dev/projects/photos/oberoi-sky-city-borivali-east-mumbai/photo_2.webp",
      "https://pub-47ad872a9b3848e190cdf10b7ad7a298.r2.dev/projects/photos/oberoi-sky-city-borivali-east-mumbai/photo_3.webp",
    ],
    configurations: [
      { id: 660, bhkType: "3 BHK Compact" },
      { id: 661, bhkType: "3 BHK Large" },
      { id: 662, bhkType: "4 BHK" },
    ],
  },
  {
    id: 224,
    slug: "piramal-mahalaxmi-mahalaxmi-mumbai",
    name: "Piramal Mahalaxmi",
    developerName: "Piramal Realty",
    locality: "Mahalaxmi",
    cityName: "Mumbai",
    status: "UNDER_CONSTRUCTION",
    priceMin: 62000000,
    priceMax: 125000000,
    images: [
      "https://pub-47ad872a9b3848e190cdf10b7ad7a298.r2.dev/projects/photos/piramal-mahalaxmi-mahalaxmi-mumbai/photo_1.webp",
      "https://pub-47ad872a9b3848e190cdf10b7ad7a298.r2.dev/projects/photos/piramal-mahalaxmi-mahalaxmi-mumbai/photo_2.webp",
      "https://pub-47ad872a9b3848e190cdf10b7ad7a298.r2.dev/projects/photos/piramal-mahalaxmi-mahalaxmi-mumbai/photo_3.webp",
    ],
    configurations: [
      { id: 657, bhkType: "2 BHK" },
      { id: 658, bhkType: "3 BHK" },
      { id: 659, bhkType: "4 BHK" },
    ],
  },
  {
    id: 223,
    slug: "kalpataru-avana-parel-mumbai",
    name: "Kalpataru Avana",
    developerName: "Kalpataru Limited",
    locality: "Parel",
    cityName: "Mumbai",
    status: "READY_TO_MOVE",
    priceMin: 85000000,
    priceMax: 145000000,
    images: [
      "https://pub-47ad872a9b3848e190cdf10b7ad7a298.r2.dev/projects/photos/kalpataru-avana-parel-mumbai/photo_1.webp",
      "https://pub-47ad872a9b3848e190cdf10b7ad7a298.r2.dev/projects/photos/kalpataru-avana-parel-mumbai/photo_2.webp",
      "https://pub-47ad872a9b3848e190cdf10b7ad7a298.r2.dev/projects/photos/kalpataru-avana-parel-mumbai/photo_3.webp",
    ],
    configurations: [
      { id: 654, bhkType: "3 BHK" },
      { id: 655, bhkType: "4 BHK" },
      { id: 656, bhkType: "5 BHK Duplex" },
    ],
  },
  {
    id: 222,
    slug: "rustomjee-crown-prabhadevi-mumbai",
    name: "Rustomjee Crown",
    developerName: "Rustomjee Group",
    locality: "Prabhadevi",
    cityName: "Mumbai",
    status: "UNDER_CONSTRUCTION",
    priceMin: 75000000,
    priceMax: 155000000,
    images: [
      "https://pub-47ad872a9b3848e190cdf10b7ad7a298.r2.dev/projects/photos/rustomjee-crown-prabhadevi-mumbai/photo_1.webp",
      "https://pub-47ad872a9b3848e190cdf10b7ad7a298.r2.dev/projects/photos/rustomjee-crown-prabhadevi-mumbai/photo_2.webp",
      "https://pub-47ad872a9b3848e190cdf10b7ad7a298.r2.dev/projects/photos/rustomjee-crown-prabhadevi-mumbai/photo_3.webp",
    ],
    configurations: [
      { id: 651, bhkType: "3 BHK" },
      { id: 652, bhkType: "4 BHK" },
      { id: 653, bhkType: "5 BHK" },
    ],
  },
];

function FeaturedProjectsSection({
  selectedCity,
  initialProjects = [],
}: {
  selectedCity: string;
  initialProjects?: ProjectListing[];
}) {
  const effectiveCity = selectedCity || "Mumbai";
  const normalizedCity = effectiveCity.toLowerCase().includes("delhi")
    ? "New Delhi"
    : effectiveCity;

  // Try local city projects first (defaults to Mumbai projects)
  // The default (Mumbai) list is fetched on the server; only refetch when a city is chosen.
  const useServerProjects = !selectedCity && initialProjects.length > 0;
  const { data: cityData, isLoading: isCityLoading } = useSearchProjectsQuery(
    { city: normalizedCity, pageSize: 6 },
    { skip: useServerProjects }
  );

  // Keep showing the server list while a city-specific list loads (no empty flash).
  const apiProjects: ProjectListing[] = useServerProjects
    ? initialProjects
    : (cityData?.items ?? (isCityLoading ? initialProjects : []));
  const projects = apiProjects.length > 0
    ? apiProjects
    : (effectiveCity.toLowerCase() === "mumbai" ? MUMBAI_FALLBACK_PROJECTS : []);
  const isLoading = isCityLoading && projects.length === 0;

  const displayCity = projects.length > 0
    ? (typeof projects[0].city === "string" ? projects[0].city : (projects[0].cityName || effectiveCity))
    : effectiveCity;

  // Like the other carousels: no projects for this city -> no section (not a lone "View all" tile).
  if (!isLoading && projects.length < MIN_SECTION_ITEMS) return null;

  return (
    <section className="mt-2 sm:mt-4">
      <div className="mb-2.5 flex items-end justify-between gap-3 sm:mb-3.5 sm:gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
            <Building2 className="h-3.5 w-3.5" />
            <span>Direct From Top Developers</span>
          </div>
          <h2 className="mt-1 text-xl sm:text-2xl font-bold tracking-tight text-slate-950 dark:text-white">
            {`New Projects in ${displayCity}`}
          </h2>
        </div>
        <Link
          href={`/new-projects${displayCity ? `?city=${encodeURIComponent(displayCity)}` : ""}`}
          prefetch={false}
          className="inline-flex items-center gap-1 text-xs sm:text-sm font-semibold text-rose-600 hover:text-rose-700 dark:text-rose-400 shrink-0"
        >
          View all <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {isLoading ? (
        <div className="flex w-full gap-3 overflow-x-auto pb-4 pt-1 no-scrollbar snap-x snap-mandatory">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="w-[78vw] max-w-[310px] shrink-0 snap-start sm:w-[calc((100%-0.75rem)/2)] sm:max-w-none lg:w-[calc((100%-2.25rem)/4)]">
              <PropertyCardSkeleton />
            </div>
          ))}
        </div>
      ) : (
        <div className="flex w-full gap-3 overflow-x-auto pb-4 pt-1 no-scrollbar snap-x snap-mandatory">
          {projects.slice(0, 6).map((project, idx) => (
            <div
              key={project.id}
              className="w-[78vw] max-w-[310px] shrink-0 snap-start sm:w-[calc((100%-0.75rem)/2)] sm:max-w-none lg:w-[calc((100%-2.25rem)/4)]"
            >
              <FeaturedProjectCard project={project} priority={idx === 0} />
            </div>
          ))}
          <div className="w-[78vw] max-w-[310px] shrink-0 snap-start sm:w-[calc((100%-0.75rem)/2)] sm:max-w-none lg:w-[calc((100%-2.25rem)/4)]">
            <ViewAllCard
              href={`/new-projects${displayCity ? `?city=${encodeURIComponent(displayCity)}` : ""}`}
              title="View all new projects"
              subtitle="Compare builders, floor plans and prices"
            />
          </div>
        </div>
      )}
    </section>
  );
}

function FeaturedFlatAvailableSection({ selectedCity }: { selectedCity: string }) {
  const isIdle = useIdleState(1200);
  const normalizedCity = selectedCity?.toLowerCase().includes("delhi")
    ? "Delhi"
    : (selectedCity || undefined);

  // Try local city first, then fallback
  const { data: cityData, isLoading: isCityLoading } = useSearchFlatmatesQuery(
    { city: normalizedCity, pageSize: 24 },
    { skip: !isIdle || !normalizedCity }
  );
  const { data: fallbackData, isLoading: isFallbackLoading } = useSearchFlatmatesQuery(
    { pageSize: 24, countryCode: getSelectedCountry() },
    { skip: !isIdle }
  );

  const cityItems = (cityData?.items ?? []).filter((item) => item.mode === "HAVE_ROOM");
  const fallbackItems = (fallbackData?.items ?? []).filter((item) => item.mode === "HAVE_ROOM");

  const listings = [...cityItems];
  if (listings.length < 4 && fallbackItems.length > 0) {
    const existingIds = new Set(listings.map((x) => x.id));
    for (const item of fallbackItems) {
      if (!existingIds.has(item.id)) {
        listings.push(item);
      }
    }
  }

  const isLoading = normalizedCity ? isCityLoading : isFallbackLoading;

  if (!isLoading && listings.length < MIN_SECTION_ITEMS) return null;

  return (
    <section className="mt-6 sm:mt-10">
      <div className="mb-2.5 flex items-end justify-between gap-3 sm:mb-3.5 sm:gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
            <Home className="h-3.5 w-3.5 text-rose-600" />
            <span>Zero Brokerage Shared Flats</span>
          </div>
          <h2 className="mt-1 text-xl sm:text-2xl font-bold tracking-tight text-slate-950 dark:text-white">
            {selectedCity && cityItems.length < MIN_SECTION_ITEMS
              ? `Available rooms across ${portalCountryName()}`
              : cityItems.length > 0 && selectedCity
              ? `Available Rooms in ${selectedCity}`
              : "Available Rooms in Shared Flats"}
          </h2>
        </div>
        <Link
          href="/flatmates?mode=HAVE_ROOM"
          prefetch={false}
          className="inline-flex items-center gap-1 text-xs sm:text-sm font-semibold text-rose-600 hover:text-rose-700 dark:text-rose-400 shrink-0"
        >
          View all <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {isLoading ? (
        <div className="flex w-full gap-3 overflow-x-auto pb-4 pt-1 no-scrollbar snap-x snap-mandatory">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="w-[78vw] max-w-[310px] shrink-0 snap-start sm:w-[calc((100%-0.75rem)/2)] sm:max-w-none lg:w-[calc((100%-2.25rem)/4)]">
              <PropertyCardSkeleton />
            </div>
          ))}
        </div>
      ) : (
        <div className="flex w-full gap-3 overflow-x-auto pb-4 pt-1 no-scrollbar snap-x snap-mandatory items-stretch">
          {listings.slice(0, 8).map((item) => (
            <div
              key={item.id}
              className="flex h-full w-[78vw] max-w-[310px] shrink-0 snap-start sm:w-[calc((100%-0.75rem)/2)] sm:max-w-none lg:w-[calc((100%-2.25rem)/4)]"
            >
              <FlatmateCard listing={item} layout="vertical" />
            </div>
          ))}
          <div className="flex w-[78vw] max-w-[310px] shrink-0 snap-start sm:w-[calc((100%-0.75rem)/2)] sm:max-w-none lg:w-[calc((100%-2.25rem)/4)]">
            <ViewAllCard href="/flatmates?mode=HAVE_ROOM" title="View all rooms" subtitle="Flats with a room available to share" />
          </div>
        </div>
      )}
    </section>
  );
}

function FeaturedSeekersBuddyUpSection({ selectedCity }: { selectedCity: string }) {
  const isIdle = useIdleState(1200);
  const normalizedCity = selectedCity?.toLowerCase().includes("delhi")
    ? "Delhi"
    : (selectedCity || undefined);

  // Try local city first, then fallback
  const { data: cityData, isLoading: isCityLoading } = useSearchFlatmatesQuery(
    { city: normalizedCity, pageSize: 24 },
    { skip: !isIdle || !normalizedCity }
  );
  const { data: fallbackData, isLoading: isFallbackLoading } = useSearchFlatmatesQuery(
    { pageSize: 24, countryCode: getSelectedCountry() },
    { skip: !isIdle }
  );

  const cityItems = (cityData?.items ?? []).filter(
    (item) => item.mode === "NEED_ROOM" || item.mode === "BUDDY_UP"
  );
  const fallbackItems = (fallbackData?.items ?? []).filter(
    (item) => item.mode === "NEED_ROOM" || item.mode === "BUDDY_UP"
  );

  const listings = [...cityItems];
  if (listings.length < 4 && fallbackItems.length > 0) {
    const existingIds = new Set(listings.map((x) => x.id));
    for (const item of fallbackItems) {
      if (!existingIds.has(item.id)) {
        listings.push(item);
      }
    }
  }

  const isLoading = normalizedCity ? isCityLoading : isFallbackLoading;

  if (!isLoading && listings.length < MIN_SECTION_ITEMS) return null;

  return (
    <section className="mt-6 sm:mt-10">
      <div className="mb-2.5 flex items-end justify-between gap-3 sm:mb-3.5 sm:gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
            <Users className="h-3.5 w-3.5 text-rose-600 dark:text-rose-400" />
            <span>Room Seekers & Co-Living</span>
          </div>
          <h2 className="mt-1 text-xl sm:text-2xl font-bold tracking-tight text-slate-950 dark:text-white">
            {selectedCity && cityItems.length < MIN_SECTION_ITEMS
              ? `Room seekers & buddy-up across ${portalCountryName()}`
              : cityItems.length > 0 && selectedCity
              ? `Room Seekers & Buddy Up in ${selectedCity}`
              : "Room Seekers & Buddy-Up Groups"}
          </h2>
        </div>
        <Link
          href="/flatmates?mode=NEED_ROOM"
          prefetch={false}
          className="inline-flex items-center gap-1 text-xs sm:text-sm font-semibold text-rose-600 hover:text-rose-700 dark:text-rose-400 shrink-0"
        >
          View all <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {isLoading ? (
        <div className="flex w-full gap-3 overflow-x-auto pb-4 pt-1 no-scrollbar snap-x snap-mandatory">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-[174px] w-[88vw] max-w-[370px] shrink-0 snap-start sm:w-[calc((100%-1rem)/2)] sm:max-w-none lg:w-[calc((100%-1.5rem)/3)]">
              <PropertyCardSkeleton />
            </div>
          ))}
        </div>
      ) : (
        <div className="flex w-full gap-3 overflow-x-auto pb-4 pt-1 no-scrollbar snap-x snap-mandatory items-stretch">
          {listings.slice(0, 8).map((item) => (
            <div
              key={item.id}
              className="flex h-[174px] w-[88vw] max-w-[370px] shrink-0 snap-start sm:w-[calc((100%-1rem)/2)] sm:max-w-none lg:w-[calc((100%-1.5rem)/3)]"
            >
              <FlatmateCard listing={item} layout="horizontal" />
            </div>
          ))}
          <div className="flex h-[174px] w-[88vw] max-w-[370px] shrink-0 snap-start sm:w-[calc((100%-1rem)/2)] sm:max-w-none lg:w-[calc((100%-1.5rem)/3)]">
            <ViewAllCard href="/flatmates?mode=NEED_ROOM" title="View all flatmate seekers" subtitle="People looking for a room or a buddy" compact />
          </div>
        </div>
      )}
    </section>
  );
}

function InteriorDesignersSection({ selectedCity }: { selectedCity: string }) {
  const isIdle = useIdleState(1200);
  const scrollerRef = React.useRef<HTMLDivElement>(null);
  const normalizedCity = selectedCity?.toLowerCase().includes("delhi") ? "Delhi" : (selectedCity || undefined);

  const { data: cityData, isLoading: isCityLoading } = useSearchInteriorDesignersQuery(
    { city: normalizedCity, sort: "recommended", limit: 8 },
    { skip: !isIdle || !normalizedCity }
  );
  const { data: fallbackData, isLoading: isFallbackLoading } = useSearchInteriorDesignersQuery(
    { sort: "recommended", limit: 8, countryCode: getSelectedCountry() },
    { skip: !isIdle }
  );

  const cityItems = cityData?.items ?? [];
  const items = [...cityItems];
  if (items.length < 4) {
    const seen = new Set(items.map((x) => x.id));
    for (const item of fallbackData?.items ?? []) {
      if (!seen.has(item.id)) items.push(item);
    }
  }
  const isCityScoped = cityItems.length > 0 && !!selectedCity;
  // Wait for the fallback top-up too when the city has < 4 results, so cards don't pop in late.
  const isLoading =
    !isIdle ||
    (normalizedCity ? isCityLoading || (cityItems.length < 4 && isFallbackLoading) : isFallbackLoading);
  // Directory has no /interior-designers/[city] index route (only [city]/[slug]), so link the directory.
  const viewAllHref = "/interior-designers";

  if (!isLoading && items.length < MIN_SECTION_ITEMS) return null;

  const scrollBy = (dir: 1 | -1) => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.9, behavior: "smooth" });
  };

  const itemClass =
    "flex w-[78vw] max-w-[310px] shrink-0 snap-start sm:w-[calc((100%-0.75rem)/2)] sm:max-w-none lg:w-[calc((100%-2.25rem)/4)]";

  return (
    <section className="mt-6 sm:mt-10" aria-labelledby="home-interior-designers-heading">
      <div className="mb-2.5 flex items-end justify-between gap-3 sm:mb-3.5 sm:gap-4">
        <div className="min-w-0">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
            <Sparkles className="h-3.5 w-3.5 text-rose-600" />
            <span>Design your dream home</span>
          </div>
          <h2 id="home-interior-designers-heading" className="mt-1 text-xl sm:text-2xl font-bold tracking-tight text-slate-950 dark:text-white">
            {isCityScoped && cityItems.length >= MIN_SECTION_ITEMS
              ? `Top interior designers in ${selectedCity}`
              : selectedCity
              ? `Top interior designers across ${portalCountryName()}`
              : "Top interior designers near you"}
          </h2>
          <p className="mt-0.5 hidden text-sm text-slate-500 sm:block dark:text-slate-400">
            Verified studios and architects with real, approved project portfolios.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Link
            href={viewAllHref}
            prefetch={false}
            className="inline-flex items-center gap-1 text-xs sm:text-sm font-semibold text-rose-600 hover:text-rose-700 dark:text-rose-400"
          >
            View all <ArrowRight className="h-4 w-4" />
          </Link>
          <div className="hidden items-center gap-1.5 lg:flex">
            <button
              type="button"
              onClick={() => scrollBy(-1)}
              aria-label="Scroll interior designers left"
              className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:border-rose-300 hover:text-rose-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => scrollBy(1)}
              aria-label="Scroll interior designers right"
              className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:border-rose-300 hover:text-rose-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <div
        ref={scrollerRef}
        className="flex w-full gap-3 overflow-x-auto pb-4 pt-1 no-scrollbar snap-x snap-mandatory items-stretch"
      >
        {isLoading
          ? [1, 2, 3, 4].map((i) => (
              <div key={i} className={itemClass}>
                <InteriorDesignerShowcaseSkeleton />
              </div>
            ))
          : (
            <>
              {items.slice(0, 8).map((profile) => (
                <div key={profile.id} className={itemClass}>
                  <InteriorDesignerShowcaseCard profile={profile} />
                </div>
              ))}
              <div className={itemClass}>
                <ViewAllCard href={viewAllHref} title="View all interior designers" subtitle="Compare portfolios, rates and reviews" />
              </div>
            </>
          )}
      </div>
    </section>
  );
}

export function PropertyCardSkeleton() {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 animate-pulse">
      {/* Media skeleton */}
      <div className="relative aspect-[16/9] w-full bg-slate-200 dark:bg-slate-800">
        {/* Badge skeletons */}
        <div className="absolute left-3 top-3 flex gap-1.5">
          <div className="h-5 w-16 rounded-md bg-slate-300 dark:bg-slate-700" />
          <div className="h-5 w-12 rounded-md bg-slate-300 dark:bg-slate-700" />
        </div>
        {/* Heart icon skeleton */}
        <div className="absolute right-3 top-3 h-8 w-8 rounded-full bg-slate-300/80 dark:bg-slate-700/80" />
      </div>

      {/* Summary skeleton */}
      <div className="flex flex-1 flex-col gap-2 p-3">
        {/* Category tag skeleton */}
        <div className="flex gap-1.5">
          <div className="h-4 w-14 rounded bg-slate-200 dark:bg-slate-800" />
          <div className="h-4 w-12 rounded bg-slate-200 dark:bg-slate-800" />
        </div>

        {/* Title skeleton */}
        <div className="space-y-1.5 pt-0.5">
          <div className="h-4 w-4/5 rounded bg-slate-200 dark:bg-slate-800" />
          <div className="h-3 w-1/2 rounded bg-slate-150 dark:bg-slate-850" />
        </div>

        {/* Price skeleton */}
        <div className="h-5 w-28 rounded bg-slate-200 dark:bg-slate-800 mt-0.5" />

        {/* Compact specs row */}
        <div className="grid grid-cols-3 gap-1.5 pt-1">
          <div className="h-8 rounded-lg bg-slate-100 dark:bg-slate-800/60" />
          <div className="h-8 rounded-lg bg-slate-100 dark:bg-slate-800/60" />
          <div className="h-8 rounded-lg bg-slate-100 dark:bg-slate-800/60" />
        </div>

        {/* Action button skeleton */}
        <div className="mt-auto pt-2">
          <div className="h-8 w-full rounded-xl bg-slate-200 dark:bg-slate-800" />
        </div>
      </div>
    </div>
  );
}
