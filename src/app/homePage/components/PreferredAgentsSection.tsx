"use client";
/* eslint-disable @typescript-eslint/no-explicit-any -- moved verbatim from HomeExperience */

// Split out of HomeExperience so the large static advisor dataset (@/data/agents)
// only downloads when this below-the-fold section is about to render.
import React from "react";
import Link from "next/link";
import { ViewAllCard } from "./ViewAllCard";
import { ArrowRight, BadgeCheck, MapPin, ShieldCheck, Sparkles } from "lucide-react";
// Type-only: the agents dataset (~700 KB) must not be bundled into the home page.
import type { Agent } from "@/data/agents";
import { useGetAdvisorsQuery } from "@/features/advisors/api";
import { sizedImageUrl } from "../lib/homeImage";

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

export default function PreferredAgentsSection({
  selectedCity,
  initialAgents = [],
}: {
  selectedCity: string;
  /** Featured agents computed on the server, so the dataset stays out of the client bundle. */
  initialAgents?: Agent[];
}) {
  const isIdle = useIdleState(1200);
  const { data: apiAdvisors, isLoading } = useGetAdvisorsQuery(
    {
      city: selectedCity,
      featured: true,
      limit: 8,
    },
    { skip: !isIdle }
  );

  const [staticAgents, setStaticAgents] = React.useState<Agent[]>(initialAgents);

  React.useEffect(() => {
    if (!isIdle) return;
    let cancelled = false;
    const byCity = () => {
      const inCity = initialAgents.filter((a) => !selectedCity || a.city.toLowerCase() === selectedCity.toLowerCase());
      return inCity.length ? inCity : initialAgents;
    };
    // Locally edited agent profiles (agentProfile service) are merged in lazily, after first paint.
    const refreshFeatured = () => {
      import("@/lib/services/agentProfile")
        .then(({ getMergedHomepageFeaturedAgents }) => {
          if (cancelled) return;
          const featured = getMergedHomepageFeaturedAgents(selectedCity);
          setStaticAgents(featured.length ? featured : byCity());
        })
        .catch(() => {
          if (!cancelled) setStaticAgents(byCity());
        });
    };

    refreshFeatured();
    window.addEventListener("awasio:agent-profile-updated", refreshFeatured);
    return () => {
      cancelled = true;
      window.removeEventListener("awasio:agent-profile-updated", refreshFeatured);
    };
  }, [selectedCity, isIdle, initialAgents]);

  // Use dynamic API advisors if available, fallback gracefully to static/local
  const allAgents = (apiAdvisors && apiAdvisors.length > 0) ? apiAdvisors : staticAgents;
  // "Local agents" must be local: with a city chosen, never show agents from other cities.
  const cityKey = selectedCity.trim().toLowerCase().replace(/^new\s+/, "");
  const agents = cityKey
    ? allAgents.filter((a: any) => String(a.city ?? "").toLowerCase().replace(/^new\s+/, "") === cityKey)
    : allAgents;

  if (!isLoading && (!agents || agents.length < 3)) return null;

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
            prefetch={false}
            className="inline-flex items-center gap-1 text-xs sm:text-sm font-semibold text-rose-600 hover:text-rose-700 dark:text-rose-400"
          >
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {isLoading && staticAgents.length === 0 ? (
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
                prefetch={false}
                className="group flex w-[285px] shrink-0 snap-start flex-col rounded-2xl border border-slate-200/90 bg-white p-3.5 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-rose-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700 sm:w-[310px]"
              >
                <div>
                  {/* Agent Headshot & Identification */}
                  <div className="flex items-start gap-3.5">
                    <div className="relative shrink-0">
                      {agent.avatar ? (
                        <img
                          src={sizedImageUrl(agent.avatar, 128)}
                          alt={agent.name}
                          width={56}
                          height={56}
                          loading="lazy"
                          decoding="async"
                          className="h-14 w-14 rounded-full object-cover ring-2 ring-slate-100 shadow-xs dark:ring-slate-800 group-hover:ring-rose-200 transition"
                        />
                      ) : (
                        <span
                          aria-hidden
                          className="flex h-14 w-14 items-center justify-center rounded-full bg-rose-100 text-lg font-bold text-rose-700 ring-2 ring-slate-100 dark:bg-rose-950/50 dark:text-rose-300 dark:ring-slate-800"
                        >
                          {(agent.name || "A").trim().charAt(0).toUpperCase()}
                        </span>
                      )}
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
                    <span className="flex items-center gap-1 whitespace-nowrap text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
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
          <div className="flex w-[285px] shrink-0 snap-start sm:w-[310px]">
            <ViewAllCard href="/agents" title="View all agents" subtitle="Verified local advisors near you" />
          </div>
        </div>
      )}
    </section>
  );
}
