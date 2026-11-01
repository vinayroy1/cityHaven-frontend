"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { DesignerGridSkeleton } from "@/components/interiors/skeletons";
import {
  Search,
  MapPin,
  Building2,
  User,
  SlidersHorizontal,
  Sparkles,
  Layers,
  ShieldCheck,
  ChevronDown,
  X,
  Check,
  RotateCcw,
  IndianRupee,
  PackageCheck,
  Award,
} from "lucide-react";
import { useSearchInteriorDesignersQuery } from "@/features/interiors/api";
import { InteriorDesignerCard } from "./components/InteriorDesignerCard";
import { InteriorInquiryModal } from "./components/InteriorInquiryModal";
import type { InteriorProfile, InteriorProviderType } from "@/types/interior.types";
import {
  INTERIOR_CITIES,
  CITY_LOCALITIES,
  BOARD_BRANDS,
  HARDWARE_BRANDS,
  DESIGN_STYLES,
  SERVICES_OFFERED,
} from "@/constants/interior-data";
import {
  PropertyListingCitySelector,
  type CitySelection,
} from "@/components/propertyListing/PropertyListingCitySelector";
import {
  PropertyListingLocalitySelector,
  type LocalitySelection,
} from "@/components/propertyListing/PropertyListingLocalitySelector";

export default function InteriorDesignersDirectoryPage() {
  const [selectedCity, setSelectedCity] = useState("Mumbai");
  const [selectedState, setSelectedState] = useState("Maharashtra");
  const [selectedLocality, setSelectedLocality] = useState("ALL");
  const [providerType, setProviderType] = useState<InteriorProviderType | "ALL">("ALL");
  const [selectedService, setSelectedService] = useState("ALL");
  const [selectedStyle, setSelectedStyle] = useState("ALL");
  const [selectedBrand, setSelectedBrand] = useState("ALL");
  const [selectedBracket, setSelectedBracket] = useState("ALL");
  const [isVerifiedOnly, setIsVerifiedOnly] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [viewTab, setViewTab] = useState<"DIRECTORY" | "INSPIRATION">("DIRECTORY");
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Selected profile for inquiry quote modal
  const [inquiryProfile, setInquiryProfile] = useState<InteriorProfile | null>(null);

  // Dynamic localities based on selected city
  const availableLocalities = useMemo(() => {
    return CITY_LOCALITIES[selectedCity] || [];
  }, [selectedCity]);

  // Combined Brands (Board + Hardware) for dropdown filter
  const allBrands = useMemo(() => {
    return Array.from(new Set([...HARDWARE_BRANDS, ...BOARD_BRANDS]));
  }, []);

  const { data, isLoading, isFetching } = useSearchInteriorDesignersQuery({
    city: selectedCity,
    providerType: providerType === "ALL" ? undefined : providerType,
    service: selectedService === "ALL" ? undefined : selectedService,
    budgetBracket: selectedBracket === "ALL" ? undefined : (selectedBracket as any),
    isVerified: isVerifiedOnly ? true : undefined,
    limit: 30,
  });

  const rawDesigners = data?.items || [];

  // Client-side filtering for search keyword, specific locality, brand, and design style
  const filteredDesigners = useMemo(() => {
    return rawDesigners.filter((d) => {
      // Locality check
      if (selectedLocality !== "ALL") {
        const matchesPrimary = d.primaryLocality?.toLowerCase() === selectedLocality.toLowerCase();
        const matchesBranches = d.branches?.some(
          (b) => b.locality?.toLowerCase() === selectedLocality.toLowerCase()
        );
        if (!matchesPrimary && !matchesBranches) return false;
      }

      // Design style check
      if (selectedStyle !== "ALL") {
        const styles = d.designStyles || [];
        if (!styles.some((s) => s.toLowerCase().includes(selectedStyle.toLowerCase()))) {
          return false;
        }
      }

      // Brand check
      if (selectedBrand !== "ALL") {
        const brands = [...(d.hardwareBrands || []), ...(d.boardBrands || []), ...(d.finishBrands || [])];
        if (!brands.some((b) => b.toLowerCase().includes(selectedBrand.toLowerCase()))) {
          return false;
        }
      }

      // Keyword check (Name, About, Tagline, Locality)
      if (searchKeyword.trim()) {
        const q = searchKeyword.toLowerCase();
        const inName = d.businessName?.toLowerCase().includes(q) || d.displayName?.toLowerCase().includes(q);
        const inLocality = d.primaryLocality?.toLowerCase().includes(q);
        const inTagline = d.tagline?.toLowerCase().includes(q);
        const inServices = d.servicesOffered?.some((s) => s.toLowerCase().includes(q));
        if (!inName && !inLocality && !inTagline && !inServices) return false;
      }

      return true;
    });
  }, [rawDesigners, selectedLocality, selectedStyle, selectedBrand, searchKeyword]);

  // Reset filters
  const handleResetFilters = () => {
    setSelectedLocality("ALL");
    setProviderType("ALL");
    setSelectedService("ALL");
    setSelectedStyle("ALL");
    setSelectedBrand("ALL");
    setSelectedBracket("ALL");
    setIsVerifiedOnly(false);
    setSearchKeyword("");
  };

  const activeFiltersCount =
    (selectedLocality !== "ALL" ? 1 : 0) +
    (providerType !== "ALL" ? 1 : 0) +
    (selectedService !== "ALL" ? 1 : 0) +
    (selectedStyle !== "ALL" ? 1 : 0) +
    (selectedBrand !== "ALL" ? 1 : 0) +
    (selectedBracket !== "ALL" ? 1 : 0) +
    (isVerifiedOnly ? 1 : 0) +
    (searchKeyword.trim() ? 1 : 0);

  // Inspiration Gallery feed
  const allProjects = useMemo(() => {
    return filteredDesigners.flatMap((d) =>
      (d.projects || []).map((p) => ({
        ...p,
        designerName: d.businessName,
        designerSlug: d.slug,
        designerCity: d.primaryCity,
        designerLogo: d.logo,
      }))
    );
  }, [filteredDesigners]);

  return (
    <div className="min-h-screen bg-slate-50/70 dark:bg-slate-950">
      {/* Top Hero Banner */}
      <section className="relative overflow-hidden border-b border-slate-200/80 bg-gradient-to-b from-rose-50/80 via-white to-slate-50/60 pt-7 pb-8 dark:border-slate-800 dark:from-slate-950 dark:via-slate-900/40 dark:to-slate-950">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-rose-200 bg-white/90 px-3 py-1 text-xs font-bold text-rose-700 shadow-2xs backdrop-blur-xs dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300">
                <Sparkles className="h-3.5 w-3.5 fill-rose-500 text-rose-500" />
                <span>Vetted Interior Directory & Material Guarantee</span>
              </div>
              <h1 className="mt-3 text-2xl font-black tracking-tight text-slate-900 sm:text-4xl dark:text-white">
                Best Interior Designers & Studios in{" "}
                <span className="text-rose-600 dark:text-rose-400">{selectedCity}</span>
              </h1>
              <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Connect with verified architects, modular factories & turnkey contractors. Compare verified material specifications (CenturyPly, Hafele, Blum) and transparent square-foot pricing.
              </p>
            </div>

            {/* Quick Action: List Your Studio */}
            <div className="shrink-0 flex items-center gap-3">
              <Link
                href="/dashboard/interior-profile"
                className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white shadow-md transition hover:bg-slate-800 active:scale-95 dark:bg-rose-600 dark:hover:bg-rose-500"
              >
                <Building2 className="h-4 w-4" />
                <span>List Your Interior Business</span>
              </Link>
            </div>
          </div>

          {/* City Chips Selector Row (Scrollable on mobile) */}
          <div className="mt-6 -mx-4 px-4 sm:mx-0 sm:px-0 flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 shrink-0 mr-1 flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5 text-rose-500" /> Popular Cities:
            </span>
            {INTERIOR_CITIES.slice(0, 10).map((city) => (
              <button
                key={city}
                type="button"
                onClick={() => {
                  setSelectedCity(city);
                  setSelectedLocality("ALL");
                }}
                className={`shrink-0 rounded-full px-3.5 py-1 text-xs font-bold transition ${
                  selectedCity.toLowerCase() === city.toLowerCase()
                    ? "bg-rose-600 text-white shadow-xs"
                    : "bg-white text-slate-700 border border-slate-200/90 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
                }`}
              >
                {city}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Main Directory & Filter Grid */}
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Comprehensive Filter Control Panel */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          {/* Top Search & Primary Filters Row */}
          <div className="grid grid-cols-1 gap-3 md:grid-cols-12 items-center">
            {/* Search Input Box */}
            <div className="relative md:col-span-3">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                placeholder="Search by studio name, locality, or style..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50/60 pl-10 pr-4 py-2.5 text-xs font-medium text-slate-900 placeholder-slate-400 focus:border-rose-500 focus:bg-white focus:outline-hidden dark:border-slate-700 dark:bg-slate-800/80 dark:text-white"
              />
              {searchKeyword && (
                <button
                  type="button"
                  onClick={() => setSearchKeyword("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* City Dropdown (Property Listing Nationwide Search) */}
            <div className="md:col-span-3">
              <label className="sr-only">City</label>
              <PropertyListingCitySelector
                value={selectedCity}
                selectedState={selectedState}
                onChange={(cityData: CitySelection) => {
                  setSelectedCity(cityData.name);
                  if (cityData.state) setSelectedState(cityData.state);
                  setSelectedLocality("ALL");
                }}
                placeholder="Search city across India..."
              />
            </div>

            {/* Locality Dropdown (Property Listing Locality Search) */}
            <div className="md:col-span-3">
              <label className="sr-only">Locality</label>
              <PropertyListingLocalitySelector
                value={selectedLocality === "ALL" ? "" : selectedLocality}
                cityName={selectedCity}
                selectedState={selectedState}
                onChange={(locData: LocalitySelection) => {
                  setSelectedLocality(locData.name);
                }}
                placeholder={`All localities in ${selectedCity || "city"}...`}
              />
            </div>

            {/* Mobile Filter Toggle & Quick Actions */}
            <div className="flex items-center gap-2 md:col-span-3 justify-end">
              <button
                type="button"
                onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
                className={`inline-flex md:hidden items-center gap-2 rounded-xl border px-3.5 py-2.5 text-xs font-bold transition ${
                  activeFiltersCount > 0
                    ? "border-rose-400 bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300"
                    : "border-slate-200 text-slate-700 dark:border-slate-700 dark:text-slate-300"
                }`}
              >
                <SlidersHorizontal className="h-3.5 w-3.5" />
                <span>Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}</span>
              </button>

              {/* Provider Type Segment (Desktop) */}
              <div className="hidden md:inline-flex rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
                <button
                  type="button"
                  onClick={() => setProviderType("ALL")}
                  className={`rounded-lg px-2.5 py-1.5 text-xs font-bold transition ${
                    providerType === "ALL"
                      ? "bg-white text-slate-900 shadow-2xs dark:bg-slate-900 dark:text-white"
                      : "text-slate-600 dark:text-slate-400"
                  }`}
                >
                  All
                </button>
                <button
                  type="button"
                  onClick={() => setProviderType("COMPANY")}
                  className={`rounded-lg px-2.5 py-1.5 text-xs font-bold transition ${
                    providerType === "COMPANY"
                      ? "bg-white text-slate-900 shadow-2xs dark:bg-slate-900 dark:text-white"
                      : "text-slate-600 dark:text-slate-400"
                  }`}
                >
                  Studios
                </button>
                <button
                  type="button"
                  onClick={() => setProviderType("INDIVIDUAL")}
                  className={`rounded-lg px-2.5 py-1.5 text-xs font-bold transition ${
                    providerType === "INDIVIDUAL"
                      ? "bg-white text-slate-900 shadow-2xs dark:bg-slate-900 dark:text-white"
                      : "text-slate-600 dark:text-slate-400"
                  }`}
                >
                  Architects
                </button>
              </div>
            </div>
          </div>

          {/* Secondary Filter Bar (Always visible on desktop, expandable on mobile) */}
          <div
            className={`mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 ${
              mobileFilterOpen ? "block" : "hidden md:block"
            }`}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {/* Service Scope Dropdown */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">Service Required</label>
                <select
                  value={selectedService}
                  onChange={(e) => setSelectedService(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                >
                  <option value="ALL">All Services</option>
                  {SERVICES_OFFERED.map((svc) => (
                    <option key={svc} value={svc}>
                      {svc}
                    </option>
                  ))}
                </select>
              </div>

              {/* Design Style Dropdown */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">Design Style</label>
                <select
                  value={selectedStyle}
                  onChange={(e) => setSelectedStyle(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                >
                  <option value="ALL">All Design Styles</option>
                  {DESIGN_STYLES.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>

              {/* Verified Hardware / Board Brand Partner Dropdown */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">Material Brand</label>
                <select
                  value={selectedBrand}
                  onChange={(e) => setSelectedBrand(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                >
                  <option value="ALL">Any Brand Partner</option>
                  {allBrands.map((brand) => (
                    <option key={brand} value={brand}>
                      {brand}
                    </option>
                  ))}
                </select>
              </div>

              {/* Budget Range Bracket */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">Budget Tier</label>
                <select
                  value={selectedBracket}
                  onChange={(e) => setSelectedBracket(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                >
                  <option value="ALL">All Price Tiers</option>
                  <option value="ECONOMY">Economy (Under ₹1,400/sq.ft.)</option>
                  <option value="STANDARD">Standard (₹1,400 - ₹2,200/sq.ft.)</option>
                  <option value="PREMIUM">Premium (₹2,200 - ₹3,500/sq.ft.)</option>
                  <option value="LUXURY">Ultra Luxury (₹3,500+/sq.ft.)</option>
                </select>
              </div>

              {/* Verified Pro Only Toggle & Reset */}
              <div className="flex items-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsVerifiedOnly(!isVerifiedOnly)}
                  className={`flex-1 rounded-xl border py-2 px-3 text-xs font-bold inline-flex items-center justify-center gap-1.5 transition ${
                    isVerifiedOnly
                      ? "border-emerald-600 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                      : "border-slate-200 bg-white text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                  }`}
                >
                  <ShieldCheck className="h-4 w-4 text-emerald-600" />
                  <span>Verified Only</span>
                </button>

                {activeFiltersCount > 0 && (
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="rounded-xl border border-slate-200 bg-slate-100 p-2 text-slate-600 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                    title="Reset all filters"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Directory Bar: Count + View Selector */}
        <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200/80 pb-4 dark:border-slate-800">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              {filteredDesigners.length}{" "}
              {filteredDesigners.length === 1 ? "Interior Designer" : "Interior Designers & Studios"}{" "}
              available in {selectedLocality !== "ALL" ? `${selectedLocality}, ` : ""}{selectedCity}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              100% genuine completed projects with verified hardware & 10-year warranty compliance
            </p>
          </div>

          {/* Dual View Toggle */}
          <div className="inline-flex rounded-xl bg-slate-200/70 p-1 dark:bg-slate-800 shrink-0 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setViewTab("DIRECTORY")}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                viewTab === "DIRECTORY"
                  ? "bg-white text-slate-900 shadow-2xs dark:bg-slate-900 dark:text-white"
                  : "text-slate-600 dark:text-slate-400"
              }`}
            >
              Studios Directory ({filteredDesigners.length})
            </button>
            <button
              type="button"
              onClick={() => setViewTab("INSPIRATION")}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                viewTab === "INSPIRATION"
                  ? "bg-white text-slate-900 shadow-2xs dark:bg-slate-900 dark:text-white"
                  : "text-slate-600 dark:text-slate-400"
              }`}
            >
              Inspiration Photos ({allProjects.length})
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="mt-6">
          {isLoading ? (
            <DesignerGridSkeleton />
          ) : viewTab === "DIRECTORY" ? (
            filteredDesigners.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center dark:border-slate-800 dark:bg-slate-900/50">
                <Building2 className="mx-auto h-12 w-12 text-slate-400" />
                <h3 className="mt-3 text-lg font-bold text-slate-900 dark:text-white">
                  No interior designers found with these exact filters
                </h3>
                <p className="mt-1 text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
                  Try clearing the locality or brand filter, or choose a different city to see vetted professionals.
                </p>
                <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300"
                  >
                    Clear All Filters
                  </button>
                  <Link
                    href="/dashboard/interior-profile"
                    className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-rose-700"
                  >
                    Are you a Designer? Create Your Profile
                  </Link>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {filteredDesigners.map((profile) => (
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
            allProjects.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-300 p-12 text-center dark:border-slate-800">
                <p className="text-sm text-slate-500">No project inspiration photos found matching these criteria.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {allProjects.map((project, idx) => (
                  <div
                    key={`${project.id}-${idx}`}
                    className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs transition hover:shadow-lg dark:border-slate-800 dark:bg-slate-900"
                  >
                    <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                      <img
                        src={project.coverImage || project.images?.[0]}
                        alt={project.title}
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                        loading="lazy"
                      />
                      <div className="absolute top-2.5 left-2.5 rounded-full bg-slate-900/80 px-2.5 py-0.5 text-[10px] font-bold text-white backdrop-blur-xs">
                        {project.propertyConfig} · {project.designStyle}
                      </div>
                    </div>
                    <div className="p-4">
                      <h4 className="line-clamp-1 text-sm font-bold text-slate-900 dark:text-white">
                        {project.title}
                      </h4>
                      <p className="mt-1 line-clamp-1 text-xs text-slate-500 dark:text-slate-400">
                        {project.locality ? `${project.locality}, ` : ""}{project.cityName}
                      </p>
                      <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2.5 text-xs text-slate-600 dark:border-slate-800 dark:text-slate-400">
                        <span className="font-semibold truncate max-w-[150px]">By {project.designerName}</span>
                        <Link
                          href={`/interior-designers/${encodeURIComponent(project.designerCity.toLowerCase())}/${project.designerSlug}`}
                          className="font-bold text-rose-600 hover:underline dark:text-rose-400 shrink-0"
                        >
                          View Studio &rarr;
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
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
