"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, BadgeCheck, Building2, Calendar, CheckCircle2, Loader2, MapPin, Phone, PhoneCall, RotateCcw, SearchX, ShieldCheck, Sparkles, Star } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { SearchBar } from "@/components/search/SearchBar";
import { buildSearchHref, initialSearchState, type SearchState } from "@/components/search/searchQuery";
import { usePropertySearchInfinite } from "@/features/propertyListing/useQueries";
import { ResultCard } from "@/app/propertySearch/components/ResultCard";
import { toResultCardProps } from "@/app/propertySearch/components/propertyCardAdapter";
import type { PropertySearchItem } from "@/types/propertySearch.types";

import { ALL_AGENTS, type Agent } from "@/data/agents";
import { getMergedHomepageFeaturedAgents } from "@/lib/services/agentProfile";
import { detectUserLocation, getUserPreferredCity } from "@/lib/geo/geoService";
import { useGetAdvisorsQuery } from "@/features/advisors/api";

const CITY_OPTIONS = ["Delhi", "Gurugram", "Noida", "Mumbai", "Bengaluru", "Pune", "Hyderabad"];
const STORAGE_KEY = "awasio.home.city";

export function HomeExperience() {
  // Server and first client render must match. Browser preferences are restored
  // in the effect below after hydration.
  const [selectedCity, setSelectedCity] = React.useState("");
  const [searchState, setSearchState] = React.useState<SearchState>(() => initialSearchState(""));

  React.useEffect(() => {
    let cancelled = false;

    // 1. Restore the saved home city or cached geo city after hydration.
    const preferredCity = getUserPreferredCity()?.trim();
    if (preferredCity) {
      setSelectedCity(preferredCity);
      setSearchState((prev) => ({ ...prev, cityName: preferredCity }));
      return;
    }

    // 2. Otherwise detect current location dynamically (GPS first, then IP API)
    void detectUserLocation().then((profile) => {
      if (!cancelled && profile?.city && profile.city.trim()) {
        const matched = profile.city.trim();
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
  }, []);

  const updateCity = (city: string) => {
    setSelectedCity(city);
    setSearchState((prev) => ({ ...prev, cityName: city || undefined }));
    if (city) window.localStorage.setItem(STORAGE_KEY, city);
    else window.localStorage.removeItem(STORAGE_KEY);
  };

  const submit = (next: SearchState) => {
    const targetCity = next.cityName || selectedCity || undefined;
    const state = { ...next, cityName: targetCity };
    setSearchState(state);
    if (targetCity) {
      updateCity(targetCity);
    }
    window.location.href = buildSearchHref(state);
  };

  // Normalize city name for API (matches database entries like 'New Delhi' when 'Delhi' is selected)
  const normalizedCity = selectedCity?.toLowerCase().includes("delhi")
    ? "New Delhi"
    : (selectedCity || undefined);

  // Intent-based listing type (if user explicitly chooses RENT or PG in search bar)
  const queryListingType = searchState.intent === "RENT" || searchState.intent === "PG" || searchState.intent === "FLATMATE"
    ? searchState.intent === "FLATMATE" ? "PG" : searchState.intent
    : undefined;

  // 1. Dedicated query for fresh new listings in the selected city
  const freshQuery = usePropertySearchInfinite({
    listingType: queryListingType,
    cityName: normalizedCity,
    sort: "newest",
    pageSize: 8,
  });

  // 2. Nationwide trending query fallback so the home page is NEVER blank
  const trendingFallbackQuery = usePropertySearchInfinite({
    sort: "newest",
    pageSize: 12,
  });

  // 3. Dedicated query for budget homes / rentals (strictly separated)
  const isRentSearch = searchState.intent === "RENT";
  const budgetListingType = isRentSearch ? "RENT" : "SELL";
  const budgetMax = isRentSearch ? 50000 : 10000000;

  // Local city budget query
  const budgetQuery = usePropertySearchInfinite({
    listingType: budgetListingType,
    cityName: normalizedCity,
    priceMax: budgetMax,
    sort: "newest",
    pageSize: 8,
  });

  // Nationwide fallback budget query (strictly matching the same listingType)
  const budgetFallbackQuery = usePropertySearchInfinite({
    listingType: budgetListingType,
    priceMax: budgetMax,
    sort: "newest",
    pageSize: 8,
  });

  // 4. Dedicated query for owner-posted listings
  const ownerQuery = usePropertySearchInfinite({
    listingType: queryListingType,
    cityName: normalizedCity,
    sort: "newest",
    pageSize: 16,
  });

  const rawFresh = (freshQuery.items as PropertySearchItem[]) ?? [];
  const trendingListings = (trendingFallbackQuery.items as PropertySearchItem[]) ?? [];

  // If local city has items, show them; otherwise fallback to top trending across metros
  const freshListings = (rawFresh.length > 0 ? rawFresh : trendingListings).slice(0, 4);

  const rawOwnerListings = (ownerQuery.items as PropertySearchItem[]) ?? [];
  const filteredOwnerListings = rawOwnerListings.filter(
    (item) =>
      (item.postedAs ?? "")?.toUpperCase() === "OWNER" ||
      ((item as any).ownerType ?? "")?.toUpperCase() === "USER"
  );
  const ownerListings = (
    filteredOwnerListings.length > 0
      ? filteredOwnerListings
      : rawOwnerListings.length > 0
      ? rawOwnerListings
      : trendingListings
  ).slice(0, 4);

  const rawBudgetListings = (budgetQuery.items as PropertySearchItem[]) ?? [];
  const rawBudgetFallbackListings = (budgetFallbackQuery.items as PropertySearchItem[]) ?? [];

  // Strictly show matching listingType properties (Sale under 1Cr or Rent under 50k).
  // NEVER fall back to freshListings (which may contain rental rooms or PGs).
  const budgetListings = (
    rawBudgetListings.length > 0
      ? rawBudgetListings
      : rawBudgetFallbackListings.filter((item) => item.listingType === budgetListingType)
  ).slice(0, 4);

  return (
    <>
      <section className="relative z-20 border-b border-slate-200/80 bg-gradient-to-b from-rose-50/60 via-white to-slate-50/70 pt-3 pb-4 sm:py-10 dark:border-slate-800 dark:from-slate-950 dark:via-slate-900/50 dark:to-slate-950">
        {/* Subtle ambient background glow */}
        <div className="pointer-events-none absolute -top-24 left-1/2 -z-10 h-64 w-[500px] -translate-x-1/2 overflow-hidden rounded-full bg-rose-500/10 blur-[90px] dark:bg-rose-600/15" />

        <div className="mx-auto max-w-4xl px-4 sm:px-6 text-center">
          {/* Heading */}
          <h1 className="mt-0 text-2xl font-extrabold tracking-tight text-slate-950 sm:text-4xl md:text-5xl dark:text-white">
            Find your perfect space with{" "}
            <span className="bg-gradient-to-r from-rose-600 via-rose-500 to-amber-600 bg-clip-text text-transparent">
              Awasio
            </span>
          </h1>

          {/* Short concise subtitle - visible on desktop/tablet, hidden on mobile */}
          <p className="hidden sm:block mx-auto mt-1 sm:mt-2 max-w-xl text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Verified rental homes, apartments, and commercial spaces across India.
          </p>

          {/* Centered Elevated Search Bar */}
          <div className="relative z-20 mt-2.5 w-full rounded-2xl border border-slate-200/90 bg-white/95 p-2 text-left shadow-[0_16px_40px_-15px_rgba(15,23,42,0.1)] backdrop-blur-md transition sm:mt-6 sm:rounded-3xl sm:p-5 dark:border-slate-800 dark:bg-slate-900/95 dark:shadow-[0_16px_40px_-15px_rgba(0,0,0,0.5)]">
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

          
        </div>
      </section>

      <div className="bg-gradient-to-b from-slate-50/80 via-white to-white dark:from-slate-900/45 dark:via-slate-950 dark:to-slate-950">
      <main className="mx-auto max-w-6xl overflow-x-clip px-4 pt-2 pb-5 sm:pt-3 sm:pb-6 sm:px-6">
        <ListingBlock
          title={
            rawFresh.length > 0
              ? (selectedCity ? `Fresh listings in ${selectedCity}` : "Fresh listings")
              : "Featured Verified Listings"
          }
          href={buildSearchHref({ ...initialSearchState(), cityName: selectedCity || undefined, sort: "newest" })}
          loading={freshQuery.isLoading && trendingFallbackQuery.isLoading}
          error={freshQuery.isError && trendingFallbackQuery.isError}
          onRetry={() => {
            freshQuery.refetch();
            trendingFallbackQuery.refetch();
          }}
          listings={freshListings}
        />

        <PreferredAgentsSection selectedCity={selectedCity} />

        <ListingBlock
          title={
            filteredOwnerListings.length > 0
              ? "Owner-listed homes"
              : rawOwnerListings.length > 0
              ? (selectedCity ? `Verified homes in ${selectedCity}` : "Verified Direct-Connect Homes")
              : "Direct-Connect Verified Homes"
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
            searchState.intent === "RENT"
              ? "Rentals under ₹50,000/month"
              : "Homes under ₹1 crore"
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

      </main>
      </div>
    </>
  );
}

function PreferredAgentsSection({ selectedCity }: { selectedCity: string }) {
  const { data: apiAdvisors, isLoading } = useGetAdvisorsQuery({
    city: selectedCity,
    featured: true,
    limit: 8,
  });

  const [staticAgents, setStaticAgents] = React.useState<Agent[]>(() => {
    return ALL_AGENTS.filter((agent) => agent.isHomepageFeatured);
  });

  React.useEffect(() => {
    const refreshFeatured = () => {
      try {
        const featured = getMergedHomepageFeaturedAgents(selectedCity);
        setStaticAgents(featured.length ? featured : ALL_AGENTS.filter((a) => a.isHomepageFeatured));
      } catch {
        const cityAgents = ALL_AGENTS.filter(
          (agent) => agent.isHomepageFeatured && (!selectedCity || agent.city.toLowerCase() === selectedCity.toLowerCase())
        );
        setStaticAgents(cityAgents.length ? cityAgents : ALL_AGENTS.filter((a) => a.isHomepageFeatured));
      }
    };

    refreshFeatured();
    window.addEventListener("awasio:agent-profile-updated", refreshFeatured);
    return () => window.removeEventListener("awasio:agent-profile-updated", refreshFeatured);
  }, [selectedCity]);

  // Use dynamic API advisors if available, fallback gracefully to static/local
  const agents = (apiAdvisors && apiAdvisors.length > 0) ? apiAdvisors : staticAgents;

  return (
    <section className="mt-4 sm:mt-6">
      <div className="mb-2.5 flex items-end justify-between gap-3 sm:mb-3.5 sm:gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>In-Person Real Estate Advisors</span>
          </div>
          <h2 className="mt-1 text-xl sm:text-2xl font-bold tracking-tight text-slate-950 dark:text-white">
            Meet Verified Local Agents
          </h2>
        </div>
        <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
          <Link
            href="/agents"
            className="inline-flex items-center gap-1 text-xs sm:text-sm font-semibold text-rose-600 hover:text-rose-700 dark:text-rose-400"
          >
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {isLoading ? (
        <div className="flex w-full gap-4 overflow-x-auto pb-4 pt-1 no-scrollbar snap-x snap-mandatory">
          {[1, 2, 3].map((i) => (
            <div key={i} className="w-[285px] sm:w-[310px] shrink-0 rounded-2xl border border-slate-200/80 bg-white p-3.5 animate-pulse dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-start gap-3.5">
                <div className="h-14 w-14 rounded-full bg-slate-200 dark:bg-slate-800 shrink-0" />
                <div className="flex-1 space-y-2 pt-1">
                  <div className="h-4 w-3/4 rounded bg-slate-200 dark:bg-slate-800" />
                  <div className="h-3 w-1/2 rounded bg-slate-150 dark:bg-slate-850" />
                </div>
              </div>
              <div className="mt-4 h-3 w-full rounded bg-slate-200 dark:bg-slate-800" />
              <div className="mt-2 h-3 w-4/5 rounded bg-slate-150 dark:bg-slate-850" />
            </div>
          ))}
        </div>
      ) : (
        <div
          className="flex w-full gap-4 overflow-x-auto pb-4 pt-1 no-scrollbar snap-x snap-mandatory scroll-smooth"
        >
          {agents.map((agent: any) => {
            const expText = agent.experienceYears ? `${agent.experienceYears}+ yrs` : (agent.experience || "5+ yrs");
            const toursText = agent.tours || agent.totalToursDone || "50+ visits";
            const homesText = agent.listingsCount || agent.activePropertiesCount || "10+";
            const servicesList = Array.isArray(agent.services) ? agent.services : ["Private site visits", "Price negotiation"];
            const agentKey = agent.slug || agent.id;

            return (
              <Link
                key={agentKey}
                href={`/agents/${agentKey}`}
                className="group flex w-[285px] shrink-0 snap-start flex-col rounded-2xl border border-slate-200/90 bg-white p-3.5 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-rose-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700 sm:w-[310px]"
              >
                <div>
                  {/* Agent Headshot & Identification */}
                  <div className="flex items-start gap-3.5">
                    <div className="relative shrink-0">
                      <img
                        src={agent.avatar}
                        alt={agent.name}
                        className="h-14 w-14 rounded-full object-cover ring-2 ring-slate-100 shadow-xs dark:ring-slate-800 group-hover:ring-rose-200 transition"
                      />
                      {/* Active / In-Person tour availability indicator */}
                      <span
                        title="Available for in-person tours"
                        className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900"
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <h3 className="truncate text-sm font-bold text-slate-950 group-hover:text-rose-600 transition dark:text-white dark:group-hover:text-rose-400">
                          {agent.name}
                        </h3>
                        <BadgeCheck className="h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400" />
                      </div>
                      <p className="truncate text-[11px] font-medium text-slate-500 dark:text-slate-400">
                        {agent.role || agent.title || "Property Advisor"} <span className="text-slate-300 dark:text-slate-600">•</span> {agent.agency}
                      </p>
                    </div>
                  </div>

                  {/* Badges & Verification */}
                  <div className="mt-3 flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-700 dark:bg-rose-950/50 dark:text-rose-300">
                      <Sparkles className="h-3 w-3 text-rose-500" />
                      {agent.badge || "Top Rated"}
                    </span>
                    <span className="flex items-center gap-1 whitespace-nowrap text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      RERA Verified
                    </span>
                  </div>

                  {/* Operating Location */}
                  <p className="mt-2.5 flex items-center gap-1 text-xs font-semibold text-slate-700 dark:text-slate-300 truncate">
                    <MapPin className="h-3.5 w-3.5 shrink-0 text-rose-500" />
                    <span className="truncate">{agent.area || agent.primaryArea || agent.city}</span>
                  </p>

                  {/* Service Highlights */}
                  <p className="mt-2 truncate text-[11px] font-medium text-slate-500 dark:text-slate-400">
                    {servicesList.slice(0, 2).join(" · ")}
                  </p>

                  {/* Compact stats row */}
                  <div className="mt-3 grid grid-cols-3 divide-x divide-slate-200 rounded-lg bg-slate-50/90 py-2 text-center dark:divide-slate-700 dark:bg-slate-800/60">
                    <p className="text-[10px] text-slate-500"><strong className="mr-1 text-xs text-slate-950 dark:text-white">{expText}</strong>Exp</p>
                    <p className="text-[10px] text-slate-500"><strong className="mr-1 text-xs text-slate-950 dark:text-white">{toursText}</strong>Tours</p>
                    <p className="text-[10px] text-slate-500"><strong className="mr-1 text-xs text-slate-950 dark:text-white">{homesText}</strong>Homes</p>
                  </div>
                </div>

              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}

function ListingBlock({
  title,
  href,
  listings,
  loading,
  error,
  onRetry,
}: {
  title: string;
  href: string;
  listings: PropertySearchItem[];
  loading?: boolean;
  error?: boolean;
  onRetry?: () => void;
}) {
  return (
    <section className="mt-3 sm:mt-5 first:mt-0">
      <div className="mb-2 sm:mb-3 flex items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-slate-950 dark:text-white">{title}</h2>
        <Link href={href} className="inline-flex items-center gap-1 text-sm font-semibold text-rose-700 dark:text-rose-400">
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
          {listings.slice(0, 10).map((item) => (
            <div key={item.id} className="w-[78vw] max-w-[310px] shrink-0 snap-start sm:w-[calc((100%-0.75rem)/2)] sm:max-w-none lg:w-[calc((100%-2.25rem)/4)]">
              <ResultCard {...toResultCardProps(item)} compact />
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-slate-200 bg-white p-8 text-center dark:border-slate-800 dark:bg-slate-900">
          <SearchX className="mx-auto h-7 w-7 text-slate-400" />
          <p className="mt-2 text-sm font-semibold text-slate-800 dark:text-slate-200">No approved listings found here yet</p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Try another city or search a nearby locality.</p>
        </div>
      )}
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
