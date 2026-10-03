"use client";

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

const CITIES = ["All Cities", "Delhi", "Gurugram", "Noida", "Mumbai", "Bengaluru", "Pune"];
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
}

export function AgentsDirectoryClient({ initialCity = "All Cities" }: AgentsDirectoryClientProps) {
  const [selectedCity, setSelectedCity] = useState(initialCity);
  const [selectedSpecialty, setSelectedSpecialty] = useState("All Specialties");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"experience" | "tours">("experience");
  const [bookingAgent, setBookingAgent] = useState<Agent | null>(null);
  const [agentsList, setAgentsList] = useState<Agent[]>(ALL_AGENTS);

  React.useEffect(() => {
    const updateList = () => {
      setAgentsList(getMergedAgentsList());
    };
    updateList();
    window.addEventListener("awasio:agent-profile-updated", updateList);
    return () => window.removeEventListener("awasio:agent-profile-updated", updateList);
  }, []);

  const filteredAgents = useMemo(() => {
    return agentsList.filter((agent) => {
      const matchCity =
        selectedCity === "All Cities" || agent.city.toLowerCase() === selectedCity.toLowerCase();
      const matchSpecialty =
        selectedSpecialty === "All Specialties" ||
        agent.focus.toLowerCase().includes(selectedSpecialty.toLowerCase());
      const query = searchQuery.trim().toLowerCase();
      const matchQuery =
        !query ||
        agent.name.toLowerCase().includes(query) ||
        agent.agency.toLowerCase().includes(query) ||
        agent.area.toLowerCase().includes(query) ||
        agent.city.toLowerCase().includes(query);

      return matchCity && matchSpecialty && matchQuery;
    }).sort((a, b) => {
      // Primary sort: Spotlight/Pro subscribers appear on top!
      const tierRank: Record<string, number> = {
        PRO_ADVISOR: 2,
        CITY_SPOTLIGHT: 1,
        FREE_VERIFIED: 0,
      };
      const rankDiff = (tierRank[b.subscriptionTier] ?? 0) - (tierRank[a.subscriptionTier] ?? 0);
      if (rankDiff !== 0) return rankDiff;

      if (sortBy === "tours") return parseInt(b.tours) - parseInt(a.tours);
      return parseInt(b.experience) - parseInt(a.experience);
    });
  }, [agentsList, selectedCity, selectedSpecialty, searchQuery, sortBy]);

  const resetFilters = () => {
    setSelectedCity("All Cities");
    setSelectedSpecialty("All Specialties");
    setSearchQuery("");
    setSortBy("experience");
  };

  return (
    <div>
      {/* Filter & Search Bar */}
      <section className="sticky top-14 z-30 border-b border-slate-200/80 bg-white/95 backdrop-blur dark:border-slate-800 dark:bg-slate-900/95 py-3 shadow-xs">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by agent name, agency, or locality (e.g., Bandra, South Delhi)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/80 py-2.5 pl-10 pr-4 text-xs sm:text-sm text-slate-900 outline-none transition focus:border-rose-500 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Specialty & Sort */}
            <div className="flex items-center gap-2 shrink-0">
              <select
                value={selectedSpecialty}
                onChange={(e) => setSelectedSpecialty(e.target.value)}
                aria-label="Filter by property type"
                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-800 outline-none transition focus:border-rose-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              >
                {SPECIALTIES.map((sp) => (
                  <option key={sp} value={sp}>
                    {sp}
                  </option>
                ))}
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                aria-label="Sort advisors"
                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-800 outline-none transition focus:border-rose-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              >
                <option value="experience">Most Experienced</option>
                <option value="tours">Most Walkthroughs</option>
              </select>
            </div>
          </div>

          {/* City Selection Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar text-xs">
            <span className="font-semibold text-slate-500 shrink-0">City:</span>
            {CITIES.map((city) => (
              <button
                key={city}
                type="button"
                onClick={() => setSelectedCity(city)}
                className={`rounded-full px-3 py-1 font-semibold whitespace-nowrap transition ${
                  selectedCity === city
                    ? "bg-rose-600 text-white shadow-xs"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                }`}
              >
                {city}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Directory Results */}
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="mb-6 flex items-center justify-between">
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            Showing <span className="font-bold text-slate-950 dark:text-white">{filteredAgents.length}</span> verified advisors
            {selectedCity !== "All Cities" && ` in ${selectedCity}`}
          </p>
          {(selectedCity !== "All Cities" || selectedSpecialty !== "All Specialties" || searchQuery) && (
            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 hover:text-rose-700 dark:text-rose-400"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset filters
            </button>
          )}
        </div>

        {/* Advisor Partner Network Banner */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-2xl border border-rose-100 bg-linear-to-r from-rose-50/70 via-white to-amber-50/70 p-4 dark:border-slate-800 dark:from-slate-900 dark:to-slate-900/70 shadow-xs">
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
            href="/dashboard/advisor-profile"
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
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredAgents.map((agent) => (
              <article
                key={agent.id}
                className="flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs transition-all duration-200 hover:border-rose-200 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
              >
                <div>
                  {/* Header */}
                  <div className="flex items-start gap-4">
                    <div className="relative shrink-0">
                      <img
                        src={agent.avatar}
                        alt={agent.name}
                        className="h-16 w-16 rounded-full object-cover ring-2 ring-slate-100 shadow-xs dark:ring-slate-800"
                      />
                      <span
                        title="Available for in-person tours"
                        className="absolute bottom-0 right-0 h-4 w-4 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900"
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <Link
                          href={`/agents/${agent.id}`}
                          className="truncate text-base font-bold text-slate-950 hover:text-rose-600 transition dark:text-white dark:hover:text-rose-400"
                        >
                          {agent.name}
                        </Link>
                        <BadgeCheck className="h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400" />
                      </div>
                      <p className="truncate text-xs font-semibold text-slate-600 dark:text-slate-400">
                        {agent.role}
                      </p>
                      <p className="truncate text-xs text-slate-400 dark:text-slate-500">
                        {agent.agency}
                      </p>
                    </div>
                  </div>

                  {/* Badge & Verification */}
                  <div className="mt-3.5 flex items-center justify-between border-t border-slate-100 pt-2.5 dark:border-slate-800/80">
                    <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-0.5 text-[11px] font-bold text-rose-700 dark:bg-rose-950/60 dark:text-rose-300">
                      <Sparkles className="h-3 w-3" />
                      {agent.badge}
                    </span>

                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      RERA Verified
                    </span>
                  </div>

                  {/* Area & RERA */}
                  <div className="mt-3 space-y-1">
                    <p className="flex items-center gap-1 text-xs text-slate-700 dark:text-slate-300 font-medium truncate">
                      <MapPin className="h-3.5 w-3.5 shrink-0 text-rose-500" />
                      <span className="truncate">{agent.area}, {agent.city}</span>
                    </p>
                    <p className="text-[10px] text-slate-400 font-mono">
                      RERA: {agent.reraId}
                    </p>
                  </div>

                  {/* Services Chips */}
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {agent.services.slice(0, 3).map((srv) => (
                      <span
                        key={srv}
                        className="inline-flex items-center rounded-md bg-slate-100/90 px-2 py-0.5 text-[11px] font-medium text-slate-700 dark:bg-slate-800/80 dark:text-slate-300"
                      >
                        • {srv}
                      </span>
                    ))}
                  </div>

                  {/* Stats Matrix */}
                  <div className="mt-4 grid grid-cols-3 gap-1.5 text-center">
                    <div className="rounded-xl bg-slate-50 py-2 px-1 dark:bg-slate-800/60">
                      <p className="text-xs font-bold text-slate-950 dark:text-white">{agent.experience}</p>
                      <p className="text-[10px] text-slate-500">Experience</p>
                    </div>
                    <div className="rounded-xl bg-slate-50 py-2 px-1 dark:bg-slate-800/60">
                      <p className="text-xs font-bold text-slate-950 dark:text-white">{agent.tours}</p>
                      <p className="text-[10px] text-slate-500">Walkthroughs</p>
                    </div>
                    <div className="rounded-xl bg-slate-50 py-2 px-1 dark:bg-slate-800/60">
                      <p className="text-xs font-bold text-slate-950 dark:text-white">{agent.listingsCount}</p>
                      <p className="text-[10px] text-slate-500">Active Homes</p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-5 space-y-2 border-t border-slate-100 pt-3 dark:border-slate-800/80">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setBookingAgent(agent)}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-rose-600 px-3 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-rose-700 active:scale-95"
                    >
                      <Calendar className="h-3.5 w-3.5" />
                      Book Site Visit
                    </button>
                    <a
                      href={`tel:${agent.phone.replace(/\s+/g, "")}`}
                      aria-label={`Call ${agent.name}`}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 text-slate-700 transition hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 shrink-0"
                    >
                      <Phone className="h-3.5 w-3.5" />
                    </a>
                  </div>
                  <Link
                    href={`/agents/${agent.id}`}
                    className="block text-center text-xs font-semibold text-rose-600 hover:text-rose-700 dark:text-rose-400 py-1"
                  >
                    View full advisor profile & listings →
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
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
