"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, BadgeCheck, Building2, Calendar, CheckCircle2, ChevronLeft, ChevronRight, Loader2, MapPin, Phone, PhoneCall, RotateCcw, SearchX, ShieldCheck, Sparkles, Star } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { SearchBar } from "@/components/search/SearchBar";
import { buildSearchHref, buildSearchParams, initialSearchState, type SearchState } from "@/components/search/searchQuery";
import { usePropertySearchInfinite } from "@/features/propertyListing/useQueries";
import { ResultCard } from "@/app/propertySearch/components/ResultCard";
import { toResultCardProps } from "@/app/propertySearch/components/propertyCardAdapter";
import type { PropertySearchItem } from "@/types/propertySearch.types";

import { ALL_AGENTS, type Agent } from "@/data/agents";
import { getMergedHomepageFeaturedAgents } from "@/lib/services/agentProfile";

const CITY_OPTIONS = ["Delhi", "Gurugram", "Noida", "Mumbai", "Bengaluru", "Pune", "Hyderabad"];
const STORAGE_KEY = "awasio.home.city";

export function HomeExperience() {
  const [selectedCity, setSelectedCity] = React.useState("");
  const [searchState, setSearchState] = React.useState<SearchState>(() => initialSearchState());

  React.useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved && CITY_OPTIONS.includes(saved)) setSelectedCity(saved);
  }, []);

  const updateCity = (city: string) => {
    setSelectedCity(city);
    if (city) window.localStorage.setItem(STORAGE_KEY, city);
    else window.localStorage.removeItem(STORAGE_KEY);
  };

  const submit = (next: SearchState) => {
    const state = { ...next, cityName: selectedCity || undefined };
    setSearchState(state);
    window.location.href = `/propertySearch?${buildSearchParams(state).toString()}`;
  };

  // 1. Dedicated query for fresh new listings
  const freshQuery = usePropertySearchInfinite({
    listingType: searchState.intent === "RENT" || searchState.intent === "PG" ? searchState.intent : "SELL",
    cityName: selectedCity || undefined,
    sort: "newest",
    pageSize: 4,
  });

  // 2. Dedicated query for budget homes (under 1 Cr or 50k rent)
  const budgetMax = searchState.intent === "RENT" ? 50000 : 10000000;
  const budgetQuery = usePropertySearchInfinite({
    listingType: searchState.intent === "RENT" || searchState.intent === "PG" ? searchState.intent : "SELL",
    cityName: selectedCity || undefined,
    priceMax: budgetMax,
    sort: "newest",
    pageSize: 4,
  });

  // 3. Dedicated query for owner-posted listings
  const ownerQuery = usePropertySearchInfinite({
    listingType: searchState.intent === "RENT" || searchState.intent === "PG" ? searchState.intent : "SELL",
    cityName: selectedCity || undefined,
    sort: "newest",
    pageSize: 16,
  });

  const freshListings = (freshQuery.items as PropertySearchItem[]) ?? [];
  const rawOwnerListings = (ownerQuery.items as PropertySearchItem[]) ?? [];
  const filteredOwnerListings = rawOwnerListings.filter(
    (item) =>
      (item.postedAs ?? "")?.toUpperCase() === "OWNER" ||
      ((item as any).ownerType ?? "")?.toUpperCase() === "USER"
  );
  // Show filtered owner listings if present, else fallback to verified items so section remains visible
  const ownerListings = (filteredOwnerListings.length > 0 ? filteredOwnerListings : rawOwnerListings).slice(0, 4);

  const rawBudgetListings = (budgetQuery.items as PropertySearchItem[]) ?? [];
  const budgetListings = (rawBudgetListings.length > 0 ? rawBudgetListings : freshListings).slice(0, 4);

  return (
    <>
      <section className="relative border-b border-slate-200/80 bg-gradient-to-b from-rose-50/60 via-white to-slate-50/70 py-6 sm:py-10 dark:border-slate-800 dark:from-slate-950 dark:via-slate-900/50 dark:to-slate-950">
        {/* Subtle ambient background glow */}
        <div className="pointer-events-none absolute -top-24 left-1/2 -z-10 h-64 w-[500px] -translate-x-1/2 overflow-hidden rounded-full bg-rose-500/10 blur-[90px] dark:bg-rose-600/15" />

        <div className="mx-auto max-w-4xl px-4 sm:px-6 text-center">
          {/* Top Pill Badge (desktop / tablet) */}
          <div className="hidden sm:inline-flex items-center gap-2 rounded-full border border-rose-200/80 bg-rose-50/90 px-3 py-0.5 text-xs font-semibold text-rose-700 shadow-2xs backdrop-blur-xs dark:border-rose-900/60 dark:bg-rose-950/50 dark:text-rose-300">
            <Sparkles className="h-3.5 w-3.5 text-rose-600 dark:text-rose-400" />
            <span>Verified Homes • Direct Owner Connect • Zero Brokerage Options</span>
          </div>

          {/* Heading */}
          <h1 className="mt-1 sm:mt-3 text-2xl font-extrabold tracking-tight text-slate-950 sm:text-4xl md:text-5xl dark:text-white">
            Find your perfect space with{" "}
            <span className="bg-gradient-to-r from-rose-600 via-rose-500 to-amber-600 bg-clip-text text-transparent">
              Awasio
            </span>
          </h1>

          {/* Short concise subtitle */}
          <p className="mx-auto mt-1 sm:mt-2 max-w-xl text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Verified rental homes, apartments, and commercial spaces across India.
          </p>

          {/* Centered Elevated Search Bar */}
          <div className="mt-4 sm:mt-6 w-full rounded-2xl sm:rounded-3xl border border-slate-200/90 bg-white/95 p-3.5 sm:p-5 shadow-[0_16px_40px_-15px_rgba(15,23,42,0.1)] backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95 dark:shadow-[0_16px_40px_-15px_rgba(0,0,0,0.5)] text-left transition">
            <SearchBar
              variant="hero"
              value={{ ...searchState, cityName: selectedCity || undefined }}
              onChange={setSearchState}
              onSubmit={submit}
            />
          </div>

          {/* Active City Selector: Single row horizontal scroll on mobile, centered wrap on desktop */}
          <div className="mt-3.5 sm:mt-4 flex w-full items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar py-1 sm:flex-wrap sm:justify-center">
            <span className="inline-flex shrink-0 items-center gap-1 text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mr-0.5">
              <MapPin className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-rose-500" />
              City:
            </span>
            <button
              type="button"
              onClick={() => updateCity("")}
              className={`shrink-0 rounded-full px-2.5 sm:px-3 py-1 text-xs font-semibold transition-all duration-150 active:scale-95 ${
                !selectedCity
                  ? "bg-slate-950 text-white shadow-xs dark:bg-white dark:text-slate-950"
                  : "border border-slate-200 bg-white/90 text-slate-700 hover:border-slate-300 hover:bg-white hover:text-slate-950 dark:border-slate-800 dark:bg-slate-900/90 dark:text-slate-300 dark:hover:border-slate-700 dark:hover:bg-slate-900"
              }`}
            >
              All Cities
            </button>
            {CITY_OPTIONS.map((city) => (
              <button
                key={city}
                type="button"
                onClick={() => updateCity(city)}
                className={`shrink-0 rounded-full px-2.5 sm:px-3 py-1 text-xs font-semibold transition-all duration-150 active:scale-95 ${
                  selectedCity === city
                    ? "bg-rose-600 text-white shadow-xs shadow-rose-600/30 scale-[1.03]"
                    : "border border-slate-200 bg-white/90 text-slate-700 hover:border-slate-300 hover:bg-white hover:text-slate-950 dark:border-slate-800 dark:bg-slate-900/90 dark:text-slate-300 dark:hover:border-slate-700 dark:hover:bg-slate-900"
                }`}
              >
                {city}
              </button>
            ))}
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-6xl overflow-x-clip px-4 py-7 sm:px-6">
        <ListingBlock
          title={selectedCity ? `Fresh listings in ${selectedCity}` : "Fresh listings"}
          href={buildSearchHref({ ...initialSearchState(), cityName: selectedCity || undefined, sort: "newest" })}
          loading={freshQuery.isLoading}
          error={freshQuery.isError}
          onRetry={() => freshQuery.refetch()}
          listings={freshListings}
        />

        <PreferredAgentsSection selectedCity={selectedCity} />

        <ListingBlock
          title={filteredOwnerListings.length > 0 ? "Owner-listed homes" : "Verified Direct-Connect Homes"}
          href={buildSearchHref({
            ...initialSearchState(),
            cityName: selectedCity || undefined,
            refine: { ...initialSearchState().refine, postedAs: ["OWNER"] },
          })}
          loading={ownerQuery.isLoading}
          error={ownerQuery.isError}
          onRetry={() => ownerQuery.refetch()}
          listings={ownerListings}
        />

        <ListingBlock
          title={
            rawBudgetListings.length > 0
              ? searchState.intent === "RENT"
                ? "Rentals under Rs 50,000/month"
                : "Homes under Rs 1 crore"
              : searchState.intent === "RENT"
              ? "Popular Value Rentals"
              : "Best Value Homes"
          }
          href={buildSearchHref({
            ...initialSearchState(),
            cityName: selectedCity || undefined,
            intent: searchState.intent,
            priceMax: budgetMax,
          })}
          loading={budgetQuery.isLoading}
          error={budgetQuery.isError}
          onRetry={() => budgetQuery.refetch()}
          listings={budgetListings}
        />

      </main>
    </>
  );
}

function PreferredAgentsSection({ selectedCity }: { selectedCity: string }) {
  const scrollRef = React.useRef<HTMLDivElement>(null);

  const scrollAgents = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 320;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const [agents, setAgents] = React.useState<Agent[]>(() => {
    return ALL_AGENTS.filter((agent) => agent.isHomepageFeatured);
  });

  React.useEffect(() => {
    const refreshFeatured = () => {
      try {
        const featured = getMergedHomepageFeaturedAgents(selectedCity);
        setAgents(featured.length ? featured : ALL_AGENTS.filter((a) => a.isHomepageFeatured));
      } catch {
        const cityAgents = ALL_AGENTS.filter(
          (agent) => agent.isHomepageFeatured && (!selectedCity || agent.city.toLowerCase() === selectedCity.toLowerCase())
        );
        setAgents(cityAgents.length ? cityAgents : ALL_AGENTS.filter((a) => a.isHomepageFeatured));
      }
    };

    refreshFeatured();
    window.addEventListener("awasio:agent-profile-updated", refreshFeatured);
    return () => window.removeEventListener("awasio:agent-profile-updated", refreshFeatured);
  }, [selectedCity]);

  return (
    <section className="mt-10 sm:mt-12">
      <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 sm:gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>In-Person Real Estate Advisors</span>
          </div>
          <h2 className="mt-1 text-xl sm:text-2xl font-bold tracking-tight text-slate-950 dark:text-white">
            Meet Verified Local Agents
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-2xl">
            Certified local specialists available for private property walkthroughs, pricing negotiation, and on-ground assistance.
          </p>
        </div>
        <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
          <Link
            href="/agents"
            className="inline-flex items-center gap-1 text-xs sm:text-sm font-semibold text-rose-600 hover:text-rose-700 dark:text-rose-400"
          >
            View all advisors <ArrowRight className="h-4 w-4" />
          </Link>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => scrollAgents("left")}
              aria-label="Scroll left"
              className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-xs transition hover:border-slate-300 hover:bg-slate-50 active:scale-95 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => scrollAgents("right")}
              aria-label="Scroll right"
              className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-xs transition hover:border-slate-300 hover:bg-slate-50 active:scale-95 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex w-full gap-4 overflow-x-auto pb-4 pt-1 no-scrollbar snap-x snap-mandatory scroll-smooth"
      >
        {agents.map((agent) => (
          <Link
            key={agent.id}
            href={`/agents/${agent.id}`}
            className="group w-[285px] sm:w-[310px] shrink-0 snap-start flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs transition-all duration-200 hover:border-rose-300 hover:shadow-md hover:-translate-y-0.5 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700 cursor-pointer block"
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
                  <p className="truncate text-xs font-medium text-slate-500 dark:text-slate-400">
                    {agent.role}
                  </p>
                  <p className="truncate text-[11px] text-slate-400 dark:text-slate-500">
                    {agent.agency}
                  </p>
                </div>
              </div>

              {/* Badges & Verification */}
              <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2.5 dark:border-slate-800/80">
                <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-700 dark:bg-rose-950/50 dark:text-rose-300">
                  <Sparkles className="h-3 w-3 text-rose-500" />
                  {agent.badge}
                </span>
                <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  RERA Verified
                </span>
              </div>

              {/* Operating Location */}
              <p className="mt-2.5 flex items-center gap-1 text-xs text-slate-600 dark:text-slate-300 font-medium truncate">
                <MapPin className="h-3.5 w-3.5 shrink-0 text-rose-500" />
                <span className="truncate">{agent.area}</span>
              </p>

              {/* Service Highlights */}
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {agent.services.slice(0, 2).map((srv) => (
                  <span
                    key={srv}
                    className="inline-flex items-center rounded-md bg-slate-50 px-2 py-0.5 text-[11px] font-medium text-slate-600 dark:bg-slate-800/70 dark:text-slate-300"
                  >
                    • {srv}
                  </span>
                ))}
              </div>

              {/* Stats Grid */}
              <div className="mt-3.5 grid grid-cols-3 gap-1.5 text-center">
                <div className="rounded-lg bg-slate-50/90 py-1.5 px-1 dark:bg-slate-800/60">
                  <p className="text-xs font-bold text-slate-950 dark:text-white">{agent.experience}</p>
                  <p className="text-[10px] text-slate-500">Exp</p>
                </div>
                <div className="rounded-lg bg-slate-50/90 py-1.5 px-1 dark:bg-slate-800/60">
                  <p className="text-xs font-bold text-slate-950 dark:text-white">{agent.tours}</p>
                  <p className="text-[10px] text-slate-500">Tours</p>
                </div>
                <div className="rounded-lg bg-slate-50/90 py-1.5 px-1 dark:bg-slate-800/60">
                  <p className="text-xs font-bold text-slate-950 dark:text-white">{agent.listingsCount}</p>
                  <p className="text-[10px] text-slate-500">Homes</p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-800/80">
              <span className="text-xs font-bold text-rose-600 group-hover:text-rose-700 dark:text-rose-400">
                View Profile & Details
              </span>
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-rose-50 text-rose-600 group-hover:bg-rose-600 group-hover:text-white transition dark:bg-rose-950/60 dark:text-rose-400 dark:group-hover:bg-rose-600 dark:group-hover:text-white">
                <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </div>
          </Link>
        ))}
      </div>
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
    <section className="mt-9">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-slate-950 dark:text-white">{title}</h2>
        <Link href={href} className="inline-flex items-center gap-1 text-sm font-semibold text-rose-700 dark:text-rose-400">
          View all <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
      {loading ? (
        <div className="flex w-full gap-3.5 overflow-x-auto pb-4 pt-1 no-scrollbar snap-x snap-mandatory sm:grid sm:grid-cols-2 sm:gap-3 sm:overflow-visible sm:pb-0 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="w-[76vw] max-w-[295px] shrink-0 snap-start sm:w-auto sm:max-w-none">
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
        <div className="flex w-full gap-3.5 overflow-x-auto pb-4 pt-1 no-scrollbar snap-x snap-mandatory sm:grid sm:grid-cols-2 sm:gap-3 sm:overflow-visible sm:pb-0 lg:grid-cols-4">
          {listings.map((item) => (
            <div key={item.id} className="w-[76vw] max-w-[295px] shrink-0 snap-start sm:w-auto sm:max-w-none">
              <ResultCard {...toResultCardProps(item)} />
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
      <div className="relative aspect-[16/10] w-full bg-slate-200 dark:bg-slate-800 sm:aspect-[4/3]">
        {/* Badge skeletons */}
        <div className="absolute left-3 top-3 flex gap-1.5">
          <div className="h-5 w-16 rounded-md bg-slate-300 dark:bg-slate-700" />
          <div className="h-5 w-12 rounded-md bg-slate-300 dark:bg-slate-700" />
        </div>
        {/* Heart icon skeleton */}
        <div className="absolute right-3 top-3 h-8 w-8 rounded-full bg-slate-300/80 dark:bg-slate-700/80" />
      </div>

      {/* Summary skeleton */}
      <div className="flex flex-1 flex-col gap-2.5 p-3 sm:gap-3 sm:p-4">
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

        {/* Specs 4-cell grid */}
        <div className="grid grid-cols-2 gap-1.5 pt-1 sm:grid-cols-4">
          <div className="h-9 rounded-lg bg-slate-100 dark:bg-slate-800/60" />
          <div className="h-9 rounded-lg bg-slate-100 dark:bg-slate-800/60" />
          <div className="h-9 rounded-lg bg-slate-100 dark:bg-slate-800/60" />
          <div className="h-9 rounded-lg bg-slate-100 dark:bg-slate-800/60" />
        </div>

        {/* Action button skeleton */}
        <div className="mt-auto pt-2">
          <div className="h-9 w-full rounded-xl bg-slate-200 dark:bg-slate-800" />
        </div>
      </div>
    </div>
  );
}
