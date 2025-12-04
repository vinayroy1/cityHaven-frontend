"use client";

import React, { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { HeaderNav } from "../homePage/components/HeaderNav";
import { SearchToolbar } from "./components/SearchToolbar";
import { FiltersPanel } from "./components/FiltersPanel";
import { ResultsList } from "./components/ResultsList";
import { AppliedFilters } from "./components/AppliedFilters";
import { appliedFilters } from "./data";
import { requestLocationPermissionOnce } from "@/lib/permissions";
import { fetchReverseGeocode } from "@/lib/googlePlaces";

export function SearchPageClient() {
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentParams = useMemo(() => {
    const entries = Array.from(searchParams.entries());
    return Object.fromEntries(entries);
  }, [searchParams]);

  const updateSearchParams = (next: Record<string, string | number | null | undefined>) => {
    const params = new URLSearchParams();
    Object.entries(currentParams).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") params.set(key, value);
    });
    Object.entries(next).forEach(([key, value]) => {
      if (value === null || value === undefined || value === "") {
        params.delete(key);
      } else {
        params.set(key, String(value));
      }
    });
    router.push(`/propertySearch?${params.toString()}`);
  };

  const handleUseLocation = async () => {
    setLocationError(null);
    setLocating(true);
    const { position, error } = await requestLocationPermissionOnce({ storageKey: "propertySearchLocationPermission" });
    if (!position || error) {
      setLocating(false);
      if (error) setLocationError(error);
      return;
    }
    const details = await fetchReverseGeocode(position.coords.latitude, position.coords.longitude);
    setLocating(false);
    if (!details) {
      setLocationError("Could not fetch your location. Try again.");
      return;
    }
    const locality = details.locality || details.subLocality || "";
    const subLocality = details.subLocality || details.locality || "";
    const city = details.city || "";
    updateSearchParams({
      q: locality || city,
      cityName: city,
      locality: locality,
      subLocality,
      lat: details.location.lat ?? undefined,
      lng: details.location.lng ?? undefined,
    });
    setShowMap(false);
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <HeaderNav />
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-6 sm:px-6">
        <nav className="text-xs text-slate-500">Home › Commercial Property in T.N.H.B.Phase 1 Vellore for Sale</nav>
        <h1 className="text-xl font-semibold text-slate-900">Commercial Property in T.N.H.B.Phase 1 Vellore for Sale</h1>
        <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm lg:hidden">
          <AppliedFilters filters={appliedFilters} />
        </div>
        <SearchToolbar onOpenFilters={() => setShowMobileFilters(true)} onOpenMap={() => setShowMap(true)} />

        <div className="flex flex-col gap-4 lg:flex-row">
          <div className="hidden lg:block">
            <FiltersPanel />
          </div>
          <ResultsList />
        </div>

        {showMap && (
          <div className="fixed inset-0 z-40 flex items-end justify-center px-3">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowMap(false)} />
            <div className="relative w-full max-w-5xl overflow-hidden rounded-t-3xl border border-slate-200 bg-white shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
                <p className="text-sm font-semibold text-slate-900">Map view</p>
                <button
                  type="button"
                  className="text-xs font-semibold text-sky-600 hover:text-indigo-600"
                  onClick={() => setShowMap(false)}
                >
                  Close
                </button>
              </div>
              <div className="h-[70vh] w-full bg-gradient-to-br from-sky-100 via-white to-emerald-50">
                <div className="flex h-full flex-col items-center justify-center gap-3 p-4 text-center">
                  <p className="text-sm font-semibold text-slate-800">Use your current location to search nearby properties</p>
                  <p className="text-xs text-slate-600">We’ll fetch your city/locality and apply it to the search filters.</p>
                  <button
                    type="button"
                    onClick={handleUseLocation}
                    disabled={locating}
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-sky-600 px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:-translate-y-0.5 disabled:opacity-60"
                  >
                    {locating ? "Locating..." : "Use my location"}
                  </button>
                  {locationError && <p className="text-xs text-rose-600">{locationError}</p>}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      {showMobileFilters && (
        <div className="fixed inset-0 z-50 flex items-end justify-center px-3">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowMobileFilters(false)} />
          <div className="relative w-full max-w-xl rounded-t-3xl border border-slate-200 bg-white p-4 shadow-2xl">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-900">Filters</p>
              <button
                type="button"
                className="text-xs font-semibold text-sky-600 hover:text-indigo-600"
                onClick={() => setShowMobileFilters(false)}
              >
                Close
              </button>
            </div>
            <div className="max-h-[70vh] overflow-y-auto">
              <FiltersPanel asDrawer />
            </div>
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                className="w-full rounded-full border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-800 shadow-sm"
                onClick={() => setShowMobileFilters(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="w-full rounded-full bg-slate-900 px-3 py-2 text-sm font-semibold text-white shadow-sm"
                onClick={() => setShowMobileFilters(false)}
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
