"use client";

import { FilterSelect } from "@/components/common/FilterSelect";
import { AgentContactButtons } from "./AgentContactButtons";
import { useAutoLoadMore } from "@/lib/hooks/useAutoLoadMore";
import { advisorPhoto } from "@/features/advisors/avatar";
import React, { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Compass,
  Filter,
  MapPin,
  Mail,
  Phone,
  RotateCcw,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
} from "lucide-react";
import { ALL_AGENTS, type Agent } from "@/data/agents";
import { BookVisitModal } from "@/components/agents/BookVisitModal";
import { getMergedAgentsList } from "@/lib/services/agentProfile";
import { CitySelectorDropdown } from "@/components/search/CitySelectorDropdown";
import { LocationSearchInput } from "@/components/search/LocationSearchInput";
import { useGetAdvisorsQuery } from "@/features/advisors/api";
import { useRouter } from "next/navigation";
import { agentPath, agentsListPath } from "@/features/advisors/paths";
import { getSelectedCountry } from "@/lib/country/countryStore";
import { useCountryCode } from "@/lib/country/useCountry";
import { CountryResultsBanner, useUrlCountry } from "@/components/country/CountryResultsBanner";
import { getUserPreferredCity, setUserPreferredCity } from "@/lib/geo/geoService";
import { CompanyAvatar } from "@/components/construction/public/CompanyAvatar";

const SPECIALTIES = [
  "All Specialties",
  "Builder floors",
  "High-rises",
  "Villas",
  "Flats",
  "Sea-facing",
];

interface AgentsDirectoryClientProps {
  initialCity?: string;
  /** Area from the URL (/agents/<city>/<area>); "" = whole city. */
  initialLocality?: string;
  /** Country from the URL prefix (/agents/ae/dubai); null = India / no prefix. */
  country?: string | null;
}

// Static agents carry text ("12 yrs"); backend advisors send `experienceYears`
// and numeric `tours`. A NaN here made the sort a no-op for backend advisors.
const toCount = (value: unknown): number => {
  const n = typeof value === "number" ? value : Number.parseInt(String(value ?? ""), 10);
  return Number.isFinite(n) ? n : 0;
};
const experienceYears = (agent: Agent): number =>
  toCount((agent as Agent & { experienceYears?: number }).experienceYears ?? agent.experience);

const PAGE_SIZE = 12; // the API serves at most 12 per request

export function AgentsDirectoryClient({ initialCity = "", initialLocality = "", country = null }: AgentsDirectoryClientProps) {
  const router = useRouter();
  const portalCountry = useCountryCode();
  useUrlCountry(country);
  // City and area live in the URL (/agents/patna/boring-road, same as every directory) so refresh and
  // back/forward keep them; the page remounts this component per place, so paging below is per place.
  const [offset, setOffset] = useState(0);
  const { data: serverAgents = [], isFetching: loadingPage, isSuccess } = useGetAdvisorsQuery({
    city: initialCity || undefined,
    locality: initialLocality || undefined,
    // Without a city: the site's selected country; with one, the city decides.
    countryCode: initialCity ? undefined : portalCountry,
    strict: !!initialCity,
    limit: PAGE_SIZE,
    offset,
  });
  // A full last page means there may be more (the API returns at most PAGE_SIZE per call).
  const hasMore = serverAgents.length >= offset + PAGE_SIZE;
  // Infinite scroll; the "Load more advisors" button stays as a fallback.
  const sentinelRef = useAutoLoadMore(() => setOffset(serverAgents.length), hasMore && serverAgents.length > 0, loadingPage, serverAgents.length);

  // No city in the URL: open on the visitor's saved city (same one the other search pages use).
  React.useEffect(() => {
    if (initialCity) return;
    const preferred = getUserPreferredCity();
    if (preferred) router.replace(agentsListPath(preferred, null, getSelectedCountry()), { scroll: false });
  }, [initialCity, router]);
  // Draft state (user selections before pressing Search)
  const [cityDraft, setCityDraft] = useState(
    initialCity && initialCity !== "All Cities" ? initialCity : ""
  );
  const [localitiesDraft, setLocalitiesDraft] = useState<string[]>(initialLocality ? [initialLocality] : []);
  const [specialtyDraft, setSpecialtyDraft] = useState("All Specialties");
  const [queryDraft, setQueryDraft] = useState("");
  const [sortBy, setSortBy] = useState<"experience" | "tours">("experience");

  // Applied state (only updated on clicking dedicated Search button or Reset)
  const [appliedCity, setAppliedCity] = useState(cityDraft);
  const [appliedLocalities, setAppliedLocalities] = useState<string[]>(initialLocality ? [initialLocality] : []);
  const [appliedSpecialty, setAppliedSpecialty] = useState("All Specialties");
  const [appliedQuery, setAppliedQuery] = useState("");

  const [bookingAgent, setBookingAgent] = useState<Agent | null>(null);
  const [agentsList, setAgentsList] = useState<Agent[]>(ALL_AGENTS);

  React.useEffect(() => {
    const updateList = () => {
      // Demo dataset only when the API has answered with nothing (never while it is still loading).
      setAgentsList(serverAgents.length ? serverAgents : isSuccess ? getMergedAgentsList() : []);
    };
    updateList();
    window.addEventListener("awasio:agent-profile-updated", updateList);
    return () => window.removeEventListener("awasio:agent-profile-updated", updateList);
  }, [serverAgents, isSuccess]);

  const handleSearch = () => {
    const nextArea = localitiesDraft[0] || "";
    const sameCity = (cityDraft || "").toLowerCase() === (initialCity || "").toLowerCase();
    if (!sameCity || (cityDraft && nextArea.toLowerCase() !== initialLocality.toLowerCase())) {
      // New city / area: load it from the API (not just filter the current page) and remember the city.
      setUserPreferredCity(cityDraft);
      // Same city keeps the URL's country; a newly picked city is in the site's selected country.
      router.push(agentsListPath(cityDraft || null, nextArea || null, sameCity ? country : getSelectedCountry()), { scroll: false });
    }
    setAppliedCity(cityDraft);
    setAppliedLocalities(localitiesDraft);
    setAppliedSpecialty(specialtyDraft);
    setAppliedQuery(queryDraft);
  };

  const filteredAgents = useMemo(() => {
    return agentsList.filter((agent) => {
      // City match
      const matchCity =
        !appliedCity ||
        appliedCity === "All Cities" ||
        agent.city.toLowerCase().includes(appliedCity.toLowerCase()) ||
        appliedCity.toLowerCase().includes(agent.city.toLowerCase());

      // Locality match
      const matchLocality =
        appliedLocalities.length === 0 ||
        appliedLocalities.some(
          (loc) =>
            agent.area.toLowerCase().includes(loc.toLowerCase()) ||
            loc.toLowerCase().includes(agent.area.toLowerCase()) ||
            agent.city.toLowerCase().includes(loc.toLowerCase())
        );

      const matchSpecialty =
        appliedSpecialty === "All Specialties" ||
        (agent.focus ?? "").toLowerCase().includes(appliedSpecialty.toLowerCase());

      const query = appliedQuery.trim().toLowerCase();
      const matchQuery =
        !query ||
        agent.name.toLowerCase().includes(query) ||
        (agent.agency ?? "").toLowerCase().includes(query) ||
        agent.area.toLowerCase().includes(query) ||
        agent.city.toLowerCase().includes(query) ||
        (agent.focus ?? "").toLowerCase().includes(query);

      return matchCity && matchLocality && matchSpecialty && matchQuery;
    }).sort((a, b) => {
      const boostDiff = Number(Boolean(b.isBoosted)) - Number(Boolean(a.isBoosted));
      if (boostDiff !== 0) return boostDiff;
      // Primary sort: Spotlight/Pro subscribers appear on top!
      const tierRank: Record<string, number> = {
        PRO_ADVISOR: 2,
        CITY_SPOTLIGHT: 1,
        FREE_VERIFIED: 0,
      };
      const rankDiff = (tierRank[b.subscriptionTier] ?? 0) - (tierRank[a.subscriptionTier] ?? 0);
      if (rankDiff !== 0) return rankDiff;

      if (sortBy === "tours") return toCount(b.tours) - toCount(a.tours);
      return experienceYears(b) - experienceYears(a);
    });
  }, [agentsList, appliedCity, appliedLocalities, appliedSpecialty, appliedQuery, sortBy]);

  const resetFilters = () => {
    setCityDraft("");
    setLocalitiesDraft([]);
    setSpecialtyDraft("All Specialties");
    setQueryDraft("");
    setSortBy("experience");

    setAppliedCity("");
    setAppliedLocalities([]);
    setAppliedSpecialty("All Specialties");
    setAppliedQuery("");
    if (initialCity) router.push("/agents", { scroll: false });
  };

  const hasActiveFilters =
    Boolean(appliedCity) ||
    appliedLocalities.length > 0 ||
    appliedSpecialty !== "All Specialties" ||
    Boolean(appliedQuery) ||
    Boolean(cityDraft) ||
    localitiesDraft.length > 0 ||
    specialtyDraft !== "All Specialties" ||
    Boolean(queryDraft);

  return (
    <div>
      {/* Search & Location Bar matching other search pages */}
      <section className="sticky top-14 z-30 border-b border-slate-200/80 bg-white/95 backdrop-blur dark:border-slate-800 dark:bg-slate-900/95 py-2 sm:py-2.5 shadow-xs">
        <div className="mx-auto max-w-6xl px-3 sm:px-6">
          <div
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSearch();
              }
            }}
            className="flex flex-col gap-2 rounded-2xl border border-slate-200/90 bg-white p-2 shadow-xs dark:border-slate-800 dark:bg-slate-900 sm:rounded-2xl sm:p-2.5"
          >
            {/* Row 1: City Dropdown + Locality Search Input + Desktop Controls */}
            <div className="grid grid-cols-[auto_minmax(0,1fr)] gap-2 min-w-0 md:grid-cols-[auto_minmax(10rem,1fr)_auto_auto_auto]">
              <CitySelectorDropdown
                compact
                className="[&>button]:h-9 sm:[&>button]:h-9.5 [&>button]:text-[11px] sm:[&>button]:text-xs [&>button]:font-medium [&>button]:px-2.5 shrink-0"
                selectedCityName={cityDraft}
                onSelectCity={(city) => {
                  setCityDraft(city.name);
                  setLocalitiesDraft([]);
                }}
              />
              <div className="min-w-0 flex-1 [&>div]:h-9 sm:[&>div]:h-9.5 [&_input]:text-[11px] sm:[&_input]:text-xs [&_input]:placeholder:text-[11px] sm:[&_input]:placeholder:text-xs">
                <LocationSearchInput
                  cityName={cityDraft}
                  localities={localitiesDraft.map((label) => ({ label, city: cityDraft }))}
                  keyword={queryDraft}
                  maxLocalities={2}
                  placeholder={cityDraft ? `Locality or advisor in ${cityDraft}...` : "Search locality, advisor, agency..."}
                  onChange={({ localities, keyword }) => {
                    setLocalitiesDraft(localities.map((item) => item.label));
                    setQueryDraft(keyword);
                  }}
                />
              </div>

              {/* Desktop Filters & Dedicated Search Button */}
              <div className="hidden md:flex items-center gap-1.5 shrink-0">
                <FilterSelect size="sm" className="w-40" ariaLabel="Filter by property type" value={specialtyDraft} onChange={setSpecialtyDraft}
                  options={SPECIALTIES.map((sp) => ({ value: sp, label: sp }))} />

                <FilterSelect size="sm" className="w-44" ariaLabel="Sort advisors" value={sortBy} onChange={(v) => setSortBy(v as typeof sortBy)}
                  options={[{ value: "experience", label: "Most experienced" }, { value: "tours", label: "Most walkthroughs" }]} />

                {/* Dedicated Desktop Search Button */}
                <button
                  type="button"
                  onClick={handleSearch}
                  className="inline-flex h-9 sm:h-9.5 items-center justify-center gap-1.5 rounded-xl bg-rose-600 px-4 text-xs font-bold text-white shadow-xs hover:bg-rose-700 active:scale-95 transition"
                >
                  <Search className="h-3.5 w-3.5" />
                  <span>Search</span>
                </button>
              </div>
            </div>

            {/* Row 2 on Mobile: Specialty + Sort Filters + Dedicated Mobile Search Button */}
            <div className="flex md:hidden items-center gap-1.5 pt-0.5">
              <FilterSelect size="sm" className="h-9 flex-1" ariaLabel="Filter by property type" value={specialtyDraft} onChange={setSpecialtyDraft}
                options={SPECIALTIES.map((sp) => ({ value: sp, label: sp }))} />

              <FilterSelect size="sm" className="h-9 flex-1" ariaLabel="Sort advisors" value={sortBy} onChange={(v) => setSortBy(v as typeof sortBy)}
                options={[{ value: "experience", label: "Most experienced" }, { value: "tours", label: "Most tours" }]} />

              {/* Dedicated Mobile Search Button */}
              <button
                type="button"
                onClick={handleSearch}
                className="inline-flex h-8 items-center justify-center gap-1 rounded-xl bg-rose-600 px-3 text-[11px] font-bold text-white shadow-xs hover:bg-rose-700 active:scale-95 transition shrink-0"
              >
                <Search className="h-3 w-3" />
                <span>Search</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Directory Results */}
      <main className="mx-auto max-w-6xl px-4 pt-2.5 pb-8 sm:py-8 sm:px-6">
        <CountryResultsBanner countryCode={initialCity ? country ?? "IN" : null} what="advisors" className="mb-3" />
        <div className="mb-2.5 sm:mb-6 flex items-center justify-between text-xs sm:text-sm">
          <p className="font-semibold text-slate-700 dark:text-slate-300">
            Showing <span className="font-bold text-slate-950 dark:text-white">{filteredAgents.length}</span> verified advisors
            {appliedCity ? ` in ${appliedCity}` : ""}
            {appliedLocalities.length > 0 ? ` (${appliedLocalities.join(", ")})` : ""}
          </p>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex items-center gap-1 text-[11px] sm:text-xs font-semibold text-rose-600 hover:text-rose-700 dark:text-rose-400"
            >
              <RotateCcw className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              Reset filters
            </button>
          )}
        </div>

        {/* Advisor Partner Network Banner (Desktop View: Above Cards) */}
        <div className="hidden sm:flex sm:mb-6 sm:flex-row sm:items-center sm:justify-between gap-3 rounded-2xl border border-rose-100 bg-linear-to-r from-rose-50/70 via-white to-amber-50/70 p-4 dark:border-slate-800 dark:from-slate-900 dark:to-slate-900/70 shadow-xs">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-rose-600 text-white shadow-xs">
              <ShieldCheck className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xs font-bold text-slate-950 dark:text-white">
                Are you a Government RERA-Registered Property Advisor?
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Join our certified advisor network to receive verified in-person buyer and tenant walkthrough requests.
              </p>
            </div>
          </div>
          <Link
            href="/become-property-advisor"
            className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-full bg-slate-900 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-slate-800 transition dark:bg-rose-600 dark:hover:bg-rose-700"
          >
            <span>Join Advisor Network</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {filteredAgents.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center dark:border-slate-800 dark:bg-slate-900">
            <Compass className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-600 mb-3" />
            <h3 className="text-base font-bold text-slate-950 dark:text-white">No advisors match your search</h3>
            <p className="mt-1 text-xs text-slate-500 max-w-md mx-auto">
              Try selecting &quot;All Cities&quot; or clearing your filter to view verified advisors in other areas.
            </p>
            <button
              type="button"
              onClick={resetFilters}
              className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-rose-700 transition"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="grid gap-3 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredAgents.map((agent, idx) => (
              <React.Fragment key={agent.id}>
              <article
                className="flex flex-col justify-between rounded-xl sm:rounded-2xl border border-slate-200/90 bg-white p-3.5 sm:p-5 shadow-xs transition-all duration-200 hover:border-rose-200 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
              >
                <div>
                  {/* Header */}
                  <div className="flex items-start gap-3 sm:gap-4">
                    <div className="relative shrink-0">
                      <CompanyAvatar
                        name={agent.name}
                        logo={advisorPhoto(agent.avatar)}
                        alt={agent.name}
                        className="h-12 w-12 sm:h-16 sm:w-16 rounded-full text-xs sm:text-base font-bold ring-2 ring-slate-100 shadow-xs dark:ring-slate-800"
                        imageClassName="h-full w-full rounded-full object-cover"
                      />
                      <span
                        title="Available for in-person tours"
                        className="absolute bottom-0 right-0 h-3 w-3 sm:h-4 sm:w-4 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900"
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <Link
                          href={agentPath(agent)}
                          className="truncate text-sm sm:text-base font-bold text-slate-950 hover:text-rose-600 transition dark:text-white dark:hover:text-rose-400"
                        >
                          {agent.name}
                        </Link>
                        <BadgeCheck className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0 text-rose-600 dark:text-rose-400" />
                      </div>
                      <p className="truncate text-[11px] sm:text-xs font-semibold text-slate-600 dark:text-slate-400">
                        {agent.role}
                      </p>
                      <p className="truncate text-[10px] sm:text-xs text-slate-400 dark:text-slate-500">
                        {agent.agency}
                      </p>
                    </div>
                  </div>

                  {/* Badge & Verification */}
                  <div className="mt-2 sm:mt-3 flex items-center justify-between border-t border-slate-100 pt-1.5 sm:pt-2.5 dark:border-slate-800/80">
                    <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-[10px] sm:text-[11px] font-bold text-rose-700 dark:bg-rose-950/60 dark:text-rose-300">
                      <Sparkles className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                      {agent.isBoosted ? "👑 TOP ADVISOR" : agent.badge}
                    </span>

                    <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                      <ShieldCheck className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                      RERA Verified
                    </span>
                  </div>

                  {/* Area & RERA */}
                  <div className="mt-1.5 sm:mt-2.5 flex items-center justify-between gap-1 text-xs">
                    <p className="flex items-center gap-1 text-[11px] sm:text-xs text-slate-700 dark:text-slate-300 font-medium truncate">
                      <MapPin className="h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0 text-rose-500" />
                      <span className="truncate">{agent.area}, {agent.city}</span>
                    </p>
                    <p className="text-[9px] sm:text-[10px] text-slate-400 font-mono shrink-0">
                      RERA: {agent.reraId}
                    </p>
                  </div>

                  {/* Services Chips */}
                  <div className="mt-1.5 sm:mt-2.5 flex flex-wrap gap-1 sm:gap-1.5">
                    {agent.services.slice(0, 3).map((srv) => (
                      <span
                        key={srv}
                        className="inline-flex items-center rounded-md bg-slate-100/90 px-1.5 sm:px-2 py-0.5 text-[10px] sm:text-[11px] font-medium text-slate-700 dark:bg-slate-800/80 dark:text-slate-300"
                      >
                        • {srv}
                      </span>
                    ))}
                  </div>

                  {/* Stats Matrix */}
                  <div className="mt-2 sm:mt-3.5 grid grid-cols-3 gap-1 sm:gap-1.5 text-center">
                    <div className="rounded-lg sm:rounded-xl bg-slate-50 py-1 sm:py-2 px-1 dark:bg-slate-800/60">
                      <p className="text-[11px] sm:text-xs font-bold text-slate-950 dark:text-white">{agent.experience || `${experienceYears(agent)} yrs`}</p>
                      <p className="text-[9px] sm:text-[10px] text-slate-500">Experience</p>
                    </div>
                    <div className="rounded-lg sm:rounded-xl bg-slate-50 py-1 sm:py-2 px-1 dark:bg-slate-800/60">
                      <p className="text-[11px] sm:text-xs font-bold text-slate-950 dark:text-white">{agent.tours}</p>
                      <p className="text-[9px] sm:text-[10px] text-slate-500">Walkthroughs</p>
                    </div>
                    <div className="rounded-lg sm:rounded-xl bg-slate-50 py-1 sm:py-2 px-1 dark:bg-slate-800/60">
                      <p className="text-[11px] sm:text-xs font-bold text-slate-950 dark:text-white">{agent.listingsCount}</p>
                      <p className="text-[9px] sm:text-[10px] text-slate-500">Active Homes</p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-2.5 sm:mt-4 space-y-1 sm:space-y-1.5 border-t border-slate-100 pt-2 sm:pt-2.5 dark:border-slate-800/80">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <button
                      type="button"
                      onClick={() => setBookingAgent(agent)}
                      className="flex-1 inline-flex items-center justify-center gap-1 sm:gap-1.5 rounded-lg sm:rounded-xl bg-rose-600 px-2.5 sm:px-3 py-1.5 sm:py-2 text-[11px] sm:text-xs font-bold text-white shadow-xs transition hover:bg-rose-700 active:scale-95"
                    >
                      <Calendar className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                      Book Site Visit
                    </button>
                    <AgentContactButtons agent={agent} variant="card" />
                  </div>
                  <Link
                    href={agentPath(agent)}
                    className="block text-center text-[10px] sm:text-xs font-semibold text-rose-600 hover:text-rose-700 dark:text-rose-400 py-0.5"
                  >
                    View full advisor profile & listings →
                  </Link>
                </div>
              </article>
              </React.Fragment>
            ))}
          </div>
        )}

        {hasMore && serverAgents.length > 0 && (
          <div ref={sentinelRef} className="mt-6 flex justify-center">
            <button
              type="button"
              onClick={() => setOffset(serverAgents.length)}
              disabled={loadingPage}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-800 shadow-xs transition hover:border-rose-300 hover:text-rose-600 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
            >
              {loadingPage ? "Loading…" : `Load more advisors${initialCity ? ` in ${initialCity}` : ""}`}
            </button>
          </div>
        )}

        {/* Advisor Partner Network Banner (Mobile View: Below Cards) */}
        <div className="mt-6 flex flex-col sm:hidden gap-3 rounded-2xl border border-rose-100 bg-linear-to-r from-rose-50/70 via-white to-amber-50/70 p-4 dark:border-slate-800 dark:from-slate-900 dark:to-slate-900/70 shadow-xs">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-rose-600 text-white shadow-xs">
              <ShieldCheck className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xs font-bold text-slate-950 dark:text-white">
                Are you a Government RERA-Registered Property Advisor?
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Join our certified advisor network to receive verified in-person buyer and tenant walkthrough requests.
              </p>
            </div>
          </div>
          <Link
            href="/become-property-advisor"
            className="inline-flex items-center justify-center gap-1.5 rounded-full bg-slate-900 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-slate-800 transition dark:bg-rose-600 dark:hover:bg-rose-700"
          >
            <span>Join Advisor Network</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </main>

      {/* Book Site Visit Modal */}
      <BookVisitModal
        agent={bookingAgent}
        isOpen={!!bookingAgent}
        onClose={() => setBookingAgent(null)}
      />
    </div>
  );
}
