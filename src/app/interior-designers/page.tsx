"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Search,
  MapPin,
  Building2,
  User,
  SlidersHorizontal,
  Sparkles,
  Layers,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { useSearchInteriorDesignersQuery } from "@/features/interiors/api";
import { InteriorDesignerCard } from "./components/InteriorDesignerCard";
import { InteriorInquiryModal } from "./components/InteriorInquiryModal";
import type { InteriorProfile, InteriorProviderType } from "@/types/interior.types";

const MAJOR_METROS = ["Mumbai", "Delhi", "Bengaluru", "Gurugram", "Noida", "Pune", "Hyderabad", "Kolkata"];

export default function InteriorDesignersDirectoryPage() {
  const [selectedCity, setSelectedCity] = useState("Mumbai");
  const [providerType, setProviderType] = useState<InteriorProviderType | "ALL">("ALL");
  const [selectedService, setSelectedService] = useState("ALL");
  const [selectedBracket, setSelectedBracket] = useState("ALL");
  const [isVerifiedOnly, setIsVerifiedOnly] = useState(false);
  const [viewTab, setViewTab] = useState<"DIRECTORY" | "INSPIRATION">("DIRECTORY");

  // Selected profile for inquiry quote modal
  const [inquiryProfile, setInquiryProfile] = useState<InteriorProfile | null>(null);

  const { data, isLoading, isFetching } = useSearchInteriorDesignersQuery({
    city: selectedCity,
    providerType: providerType === "ALL" ? undefined : providerType,
    service: selectedService === "ALL" ? undefined : selectedService,
    budgetBracket: selectedBracket === "ALL" ? undefined : (selectedBracket as any),
    isVerified: isVerifiedOnly ? true : undefined,
    limit: 24,
  });

  const designers = data?.items || [];

  // Flatten portfolio project photos for the Inspiration Gallery Tab
  const allProjects = designers.flatMap((d) =>
    (d.projects || []).map((p) => ({
      ...p,
      designerName: d.businessName,
      designerSlug: d.slug,
      designerCity: d.primaryCity,
      designerLogo: d.logo,
    }))
  );

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950">
      {/* Hero Header Section */}
      <section className="border-b border-slate-200/80 bg-gradient-to-b from-rose-50/70 via-white to-slate-50/80 pt-8 pb-10 dark:border-slate-800 dark:from-slate-950 dark:via-slate-900/60 dark:to-slate-950">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-rose-100/80 px-3 py-1 text-xs font-bold text-rose-700 dark:bg-rose-950/60 dark:text-rose-400">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Awasio Verified Interior Network</span>
            </div>
            <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl dark:text-white">
              Find Verified Interior Designers & Studios in{" "}
              <span className="text-rose-600 dark:text-rose-400">{selectedCity}</span>
            </h1>
            <p className="mt-2 text-sm sm:text-base text-slate-600 dark:text-slate-400">
              Transform your apartment, builder floor, or villa with vetted interior firms, transparent material standards, and guaranteed warranties.
            </p>
          </div>

          {/* Quick City Selector Bar */}
          <div className="mt-6 flex flex-wrap gap-2">
            {MAJOR_METROS.map((city) => (
              <button
                key={city}
                type="button"
                onClick={() => setSelectedCity(city)}
                className={`rounded-full px-3.5 py-1 text-xs font-semibold transition ${
                  selectedCity.toLowerCase() === city.toLowerCase()
                    ? "bg-slate-900 text-white shadow-xs dark:bg-rose-600 dark:text-white"
                    : "bg-white text-slate-700 border border-slate-200 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
                }`}
              >
                {city}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Main Filter & Content Container */}
      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        {/* Filter Controls Row */}
        <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Provider Type Segmented control */}
            <div className="inline-flex rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
              <button
                type="button"
                onClick={() => setProviderType("ALL")}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                  providerType === "ALL"
                    ? "bg-white text-slate-900 shadow-xs dark:bg-slate-900 dark:text-white"
                    : "text-slate-600 dark:text-slate-400"
                }`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setProviderType("COMPANY")}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                  providerType === "COMPANY"
                    ? "bg-white text-slate-900 shadow-xs dark:bg-slate-900 dark:text-white"
                    : "text-slate-600 dark:text-slate-400"
                }`}
              >
                Companies / Studios
              </button>
              <button
                type="button"
                onClick={() => setProviderType("INDIVIDUAL")}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                  providerType === "INDIVIDUAL"
                    ? "bg-white text-slate-900 shadow-xs dark:bg-slate-900 dark:text-white"
                    : "text-slate-600 dark:text-slate-400"
                }`}
              >
                Architects
              </button>
            </div>

            {/* Scope Filter */}
            <select
              value={selectedService}
              onChange={(e) => setSelectedService(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              <option value="ALL">All Services</option>
              <option value="Full Home Turnkey">Full Home Turnkey</option>
              <option value="Modular Kitchen">Modular Kitchen</option>
              <option value="Full Renovation">Renovation</option>
              <option value="3D Visualization">3D Design Only</option>
            </select>

            {/* Verified Filter Toggle */}
            <button
              type="button"
              onClick={() => setIsVerifiedOnly(!isVerifiedOnly)}
              className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition ${
                isVerifiedOnly
                  ? "border-emerald-600 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                  : "border-slate-200 bg-white text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
              }`}
            >
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
              Verified Only
            </button>
          </div>

          {/* Dual View Tabs (Studios Directory vs. Inspiration Gallery) */}
          <div className="flex items-center gap-1 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setViewTab("DIRECTORY")}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                viewTab === "DIRECTORY"
                  ? "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300"
                  : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              }`}
            >
              Studios & Designers ({designers.length})
            </button>
            <button
              type="button"
              onClick={() => setViewTab("INSPIRATION")}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                viewTab === "INSPIRATION"
                  ? "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300"
                  : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              }`}
            >
              Inspiration Photos ({allProjects.length})
            </button>
          </div>
        </div>

        {/* Results Area */}
        <div className="mt-6">
          {isLoading ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-80 animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800" />
              ))}
            </div>
          ) : viewTab === "DIRECTORY" ? (
            designers.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 p-12 text-center dark:border-slate-800">
                <Building2 className="mx-auto h-12 w-12 text-slate-400" />
                <h3 className="mt-3 text-lg font-bold text-slate-900 dark:text-white">
                  No interior designers found in {selectedCity} with these filters
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Try clearing some filters or switching to another major city like Mumbai, Delhi, or Bengaluru.
                </p>
                <div className="mt-6">
                  <Link
                    href="/dashboard/interior-profile"
                    className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-5 py-2.5 text-xs font-bold text-white shadow-md transition hover:bg-rose-700"
                  >
                    Are you an Interior Designer? List Your Business
                  </Link>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {designers.map((profile) => (
                  <InteriorDesignerCard
                    key={profile.id}
                    profile={profile}
                    onOpenInquiry={(p) => setInquiryProfile(p)}
                  />
                ))}
              </div>
            )
          ) : (
            /* Inspiration Project Gallery View (Pinterest-style room feed) */
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {allProjects.map((project, idx) => (
                <div
                  key={`${project.id}-${idx}`}
                  className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900"
                >
                  <img
                    src={project.coverImage || project.images?.[0]}
                    alt={project.title}
                    className="aspect-[4/3] w-full object-cover transition duration-300 group-hover:scale-105"
                  />
                  <div className="p-3.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                      {project.propertyConfig} · {project.designStyle}
                    </span>
                    <h4 className="line-clamp-1 text-sm font-bold text-slate-900 dark:text-white">
                      {project.title}
                    </h4>
                    <div className="mt-2 flex items-center justify-between border-t border-slate-100 pt-2 text-xs text-slate-500 dark:border-slate-800">
                      <span>By {project.designerName}</span>
                      <Link
                        href={`/interior-designers/${encodeURIComponent(project.designerCity.toLowerCase())}/${project.designerSlug}`}
                        className="font-bold text-rose-600 hover:underline dark:text-rose-400"
                      >
                        View Studio &rarr;
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Inquiry Quote Modal */}
      <InteriorInquiryModal
        profile={inquiryProfile}
        isOpen={Boolean(inquiryProfile)}
        onClose={() => setInquiryProfile(null)}
      />
    </div>
  );
}

