"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Building2,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Filter,
  IndianRupee,
  Layers,
  MapPin,
  PhoneCall,
  RotateCcw,
  Search,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";
import type { ProjectListing } from "@/types/project.types";

const CITIES = ["All", "Noida", "Gurugram", "Mumbai MMR", "Bengaluru", "Delhi"];
const STATUSES = [
  { label: "All Status", value: "ALL" },
  { label: "Under Construction", value: "UNDER_CONSTRUCTION" },
  { label: "Ready to Move", value: "READY_TO_MOVE" },
  { label: "New Launch", value: "NEW_LAUNCH" },
];
const BHK_OPTIONS = ["All", "1 BHK", "2 BHK", "3 BHK", "4 BHK"];

function formatPrice(value?: number) {
  if (!value) return "Price on request";
  if (value >= 10000000) return `₹${(value / 10000000).toFixed(2)} Cr`;
  if (value >= 100000) return `₹${(value / 100000).toFixed(2)} L`;
  return `₹${value.toLocaleString("en-IN")}`;
}

export function NewProjectsClient({ initialProjects }: { initialProjects: ProjectListing[] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [selectedBhk, setSelectedBhk] = useState("All");
  const [maxBudget, setMaxBudget] = useState<number | "ALL">("ALL");
  const [sortBy, setSortBy] = useState<"featured" | "price_asc" | "price_desc">("featured");

  const filteredProjects = useMemo(() => {
    return initialProjects.filter((project) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = project.name.toLowerCase().includes(q);
        const matchesDev = project.developerName.toLowerCase().includes(q);
        const matchesLoc = project.locality.toLowerCase().includes(q);
        const matchesCity = project.city.toLowerCase().includes(q);
        if (!matchesName && !matchesDev && !matchesLoc && !matchesCity) return false;
      }

      // City
      if (selectedCity !== "All" && !project.city.toLowerCase().includes(selectedCity.toLowerCase())) {
        return false;
      }

      // Status
      if (selectedStatus !== "ALL" && project.status !== selectedStatus) {
        return false;
      }

      // BHK
      if (selectedBhk !== "All") {
        const hasBhk = project.configurations.some((c) =>
          c.bhkType.toLowerCase().includes(selectedBhk.toLowerCase())
        );
        if (!hasBhk) return false;
      }

      // Budget
      if (maxBudget !== "ALL") {
        if (project.priceMin > maxBudget) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === "price_asc") return a.priceMin - b.priceMin;
      if (sortBy === "price_desc") return b.priceMin - a.priceMin;
      return 0;
    });
  }, [initialProjects, searchQuery, selectedCity, selectedStatus, selectedBhk, maxBudget, sortBy]);

  return (
    <div className="pb-16">
      {/* Hero Search Section */}
      <div className="relative border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/60 overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(244,63,94,0.08),transparent_50%),radial-gradient(circle_at_80%_80%,rgba(16,185,129,0.06),transparent_50%)]" />

        <div className="relative mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div className="max-w-3xl">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                <Sparkles className="h-4 w-4" />
                <span>Verified Real Estate Developments</span>
              </div>
              <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950 dark:text-white sm:text-5xl">
                New Projects & Townships
              </h1>
              <p className="mt-3 text-base text-slate-600 dark:text-slate-300">
                Browse government RERA-approved residential projects, luxury gated societies, and builder launches with transparent floor-plan configurations.
              </p>
            </div>

            <div className="flex shrink-0 gap-3">
              <Link
                href="/post-project"
                className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-5 py-2.5 text-xs font-bold text-white shadow-md transition hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100"
              >
                <Building2 className="h-4 w-4" />
                <span>List your project</span>
              </Link>
            </div>
          </div>

          {/* Elevated Wide Search Bar Container */}
          <div className="mt-8 rounded-3xl border border-slate-200/90 bg-white p-3.5 sm:p-5 shadow-lg shadow-slate-900/5 dark:border-slate-800 dark:bg-slate-900 dark:shadow-black/20">
            {/* Primary Search Input Row + Dedicated Search Button */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-rose-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search project name, builder, or sector (e.g. Godrej Woods, Thane, Whitefield)..."
                  className="w-full rounded-2xl border border-slate-200/80 bg-slate-50/80 pl-11 pr-10 py-3 sm:py-3.5 text-xs sm:text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:border-rose-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800/80 dark:text-white dark:focus:bg-slate-800 transition"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    aria-label="Clear search"
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/* Dedicated Search Action Button */}
              <button
                type="button"
                className="inline-flex items-center justify-center gap-2 rounded-2xl sm:rounded-full bg-rose-600 px-6 py-3 sm:py-3.5 text-xs sm:text-sm font-bold text-white shadow-md shadow-rose-600/25 hover:bg-rose-700 active:scale-95 transition shrink-0"
              >
                <Search className="h-4 w-4 shrink-0" />
                <span>Search Projects</span>
              </button>
            </div>

            {/* Filter Controls Row */}
            <div className="mt-4 pt-3.5 border-t border-slate-100 dark:border-slate-800 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              {/* City Quick Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 no-scrollbar">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider pl-1 shrink-0">
                  City:
                </span>
                {CITIES.map((city) => {
                  const active = selectedCity === city;
                  return (
                    <button
                      key={city}
                      type="button"
                      onClick={() => setSelectedCity(city)}
                      className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition shrink-0 ${
                        active
                          ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
                      }`}
                    >
                      {city}
                    </button>
                  );
                })}
              </div>

              {/* Dropdown Filters (Spacious on mobile and desktop) */}
              <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 shrink-0">
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="rounded-xl sm:rounded-full border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 focus:outline-none"
                >
                  {STATUSES.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>

                <select
                  value={selectedBhk}
                  onChange={(e) => setSelectedBhk(e.target.value)}
                  className="rounded-xl sm:rounded-full border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 focus:outline-none"
                >
                  {BHK_OPTIONS.map((bhk) => (
                    <option key={bhk} value={bhk}>
                      {bhk === "All" ? "All BHKs" : bhk}
                    </option>
                  ))}
                </select>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as "featured" | "price_asc" | "price_desc")}
                  className="col-span-2 sm:col-span-1 rounded-xl sm:rounded-full border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 focus:outline-none"
                >
                  <option value="featured">Featured First</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                </select>

                {(searchQuery || selectedCity !== "All" || selectedStatus !== "ALL" || selectedBhk !== "All") && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedCity("All");
                      setSelectedStatus("ALL");
                      setSelectedBhk("All");
                      setMaxBudget("ALL");
                    }}
                    className="col-span-2 sm:col-span-1 inline-flex items-center justify-center gap-1 text-xs font-bold text-rose-600 hover:text-rose-700 dark:text-rose-400 py-1.5"
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

      {/* Results Section */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Showing {filteredProjects.length} Verified Projects
          </p>

          <Link
            href="/propertySearch"
            className="text-xs font-bold text-rose-600 hover:text-rose-700 dark:text-rose-400 inline-flex items-center gap-1"
          >
            <span>Search individual flats & rentals</span>
            <ChevronRight className="h-3 w-3" />
          </Link>
        </div>

        {/* Project Cards Grid */}
        {filteredProjects.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredProjects.map((project) => (
              <div
                key={project.id}
                className="group flex flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:shadow-xl dark:border-slate-800 dark:bg-slate-900"
              >
                {/* Project Image */}
                <div className="relative h-56 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                  <img
                    src={project.images[0] || "/property-placeholder.webp"}
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
                    <h3 className="text-xl font-black tracking-tight drop-shadow-sm truncate">
                      {project.name}
                    </h3>
                  </div>
                </div>

                {/* Card Body */}
                <div className="flex flex-1 flex-col p-5">
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
                      className="inline-flex items-center gap-1.5 rounded-full bg-rose-600 px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-rose-700"
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
          <div className="rounded-3xl border border-dashed border-slate-300 p-12 text-center dark:border-slate-800">
            <Building2 className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-700" />
            <h3 className="mt-4 text-base font-bold text-slate-900 dark:text-white">
              No matching projects found
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              Try adjusting your city or budget filters to explore other verified developments.
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCity("All");
                setSelectedStatus("ALL");
                setSelectedBhk("All");
              }}
              className="mt-4 rounded-full bg-slate-900 px-4 py-2 text-xs font-bold text-white dark:bg-white dark:text-slate-900"
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* Builder Promotion Callout */}
        <div className="mt-16 overflow-hidden rounded-3xl bg-gradient-to-r from-rose-600 to-rose-700 p-8 sm:p-10 text-white shadow-xl">
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
