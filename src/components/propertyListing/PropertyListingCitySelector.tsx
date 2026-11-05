"use client";

import React, { useState, useEffect, useRef, useTransition } from "react";
import { ChevronDown, MapPin, Search, X, Loader2, Check } from "lucide-react";
import {
  fetchAwasioSuggestions,
  type AwasioSuggestion,
} from "@/lib/awasioSuggestions";
import { APP_CONFIG } from "@/constants/app-config";

const PAGE_SIZE = 30;

// Curated top popular cities for India shown by default when no search query is entered
const DEFAULT_TOP_INDIAN_CITIES: Array<{ id: string; name: string; state: string }> = [
  { id: "CT1", name: "Mumbai", state: "Maharashtra" },
  { id: "CT19", name: "Bengaluru", state: "Karnataka" },
  { id: "CT12", name: "New Delhi", state: "Delhi" },
  { id: "CT16", name: "Gurugram", state: "Haryana" },
  { id: "CT13", name: "Noida", state: "Uttar Pradesh" },
  { id: "CT2", name: "Pune", state: "Maharashtra" },
  { id: "CT25", name: "Hyderabad", state: "Telangana" },
  { id: "CT29", name: "Chennai", state: "Tamil Nadu" },
  { id: "CT46", name: "Kolkata", state: "West Bengal" },
  { id: "CT35", name: "Ahmedabad", state: "Gujarat" },
  { id: "CT40", name: "Jaipur", state: "Rajasthan" },
  { id: "CT14", name: "Greater Noida", state: "Uttar Pradesh" },
  { id: "CT15", name: "Ghaziabad", state: "Uttar Pradesh" },
  { id: "CT17", name: "Faridabad", state: "Haryana" },
  { id: "CT5", name: "Thane", state: "Maharashtra" },
  { id: "CT3519", name: "Navi Mumbai", state: "Maharashtra" },
  { id: "CT51", name: "Lucknow", state: "Uttar Pradesh" },
  { id: "CT14313", name: "Chandigarh", state: "Chandigarh" },
  { id: "CT4217", name: "Mohali", state: "Punjab" },
  { id: "CT66", name: "Indore", state: "Madhya Pradesh" },
];

function buildSuggestionFromCity(
  id: string,
  name: string,
  state: string,
  countryCode = "IN"
): AwasioSuggestion {
  const subtitle = state ? `${state}, ${countryCode}` : countryCode;
  return {
    id,
    type: "CITY",
    title: name,
    subtitle,
    displayText: `${name}, ${countryCode}`,
    badge: "City",
    badgeColor: "#1565C0",
    location: {
      city: name,
      state: state || "",
      countryCode,
    },
    filterPayload: {
      cityName: name,
      stateName: state || undefined,
      type: "CITY",
    },
    score: 200,
  };
}

export interface CitySelection {
  name: string;
  state?: string;
  lat?: number | null;
  lng?: number | null;
  id?: string;
}

interface Props {
  value: string;
  selectedState?: string;
  /** ISO country; cities are limited to it. India keeps the old "Delhi" default list. */
  countryCode?: string;
  onChange: (city: CitySelection) => void;
  hasError?: boolean;
  placeholder?: string;
}

export function PropertyListingCitySelector({
  value,
  selectedState,
  countryCode = "IN",
  onChange,
  hasError = false,
  placeholder,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [cities, setCities] = useState<AwasioSuggestion[]>([]);
  const [prefetchedCities, setPrefetchedCities] = useState<AwasioSuggestion[]>([]);
  const [prefetchedHasMore, setPrefetchedHasMore] = useState(false);
  const [prefetchedPage, setPrefetchedPage] = useState(2);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const isIndia = countryCode === "IN";
  const defaultQuery = isIndia ? "all" : "all";

  // On small screens the list can open under the bottom nav: scroll the field up so it fits.
  useEffect(() => {
    if (!isOpen || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const needed = rect.bottom + 320;
    const limit = window.innerHeight - (window.innerWidth < 1024 ? 90 : 16);
    if (needed > limit) window.scrollBy({ top: needed - limit, behavior: "smooth" });
  }, [isOpen]);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const activeReqRef = useRef(0);

  // 1. Prefetch cities when selectedState changes or on initial mount
  useEffect(() => {
    let cancelled = false;
    const reqId = ++activeReqRef.current;
    setLoading(true);

    const query = selectedState?.trim() || "";

    const fetchInitial = async () => {
      try {
        let results: AwasioSuggestion[] = [];
        let canLoadMore = false;

        // If no search and no selectedState, load curated top popular cities for India or active country
        if (!query) {
          try {
            const qs = countryCode && countryCode !== "IN" ? `?country=${encodeURIComponent(countryCode)}` : "";
            const guideRes = await fetch(`${APP_CONFIG.API.BASE_URL}/v1/locations/locality-guide/cities${qs}`);
            if (guideRes.ok) {
              const guideData = await guideRes.json();
              if (Array.isArray(guideData?.data) && guideData.data.length > 0) {
                results = guideData.data.slice(0, PAGE_SIZE).map((c: { id: number | string; name: string; state: string | null }) =>
                  buildSuggestionFromCity(String(c.id), c.name, c.state || "", countryCode)
                );
                canLoadMore = guideData.data.length > PAGE_SIZE;
              }
            }
          } catch {
            // fallback handled below
          }

          // In case API fails or returns empty, fallback to local curated list
          if (results.length === 0 && isIndia) {
            results = DEFAULT_TOP_INDIAN_CITIES.map((c) =>
              buildSuggestionFromCity(c.id, c.name, c.state, "IN")
            );
          }
        }

        // If query or state is specified, query suggestion engine
        if (results.length === 0) {
          const res = await fetchAwasioSuggestions(query || defaultQuery, {
            state: selectedState?.trim() || undefined,
            country: countryCode,
            types: ["CITY"],
            page: 1,
            pageSize: PAGE_SIZE,
          });

          if (cancelled || reqId !== activeReqRef.current) return;

          results = (res.data || []).filter((s) => s.type === "CITY");
          if (selectedState?.trim()) {
            const sLower = selectedState.trim().toLowerCase();
            results = results.sort((a, b) => {
              const aMatch = a.location.state?.toLowerCase() === sLower ? 1 : 0;
              const bMatch = b.location.state?.toLowerCase() === sLower ? 1 : 0;
              return bMatch - aMatch;
            });
          }
          canLoadMore = res.pagination?.hasNextPage ?? results.length >= PAGE_SIZE;
        }

        if (cancelled || reqId !== activeReqRef.current) return;

        setPrefetchedCities(results);
        setPrefetchedHasMore(canLoadMore);
        setPrefetchedPage(2);

        if (!search.trim()) {
          setCities(results);
          setHasMore(canLoadMore);
          setPage(2);
        }
      } catch (err) {
        if (!cancelled && reqId === activeReqRef.current) {
          const fallback = isIndia
            ? DEFAULT_TOP_INDIAN_CITIES.map((c) => buildSuggestionFromCity(c.id, c.name, c.state, "IN"))
            : [];
          setPrefetchedCities(fallback);
          setPrefetchedHasMore(false);
          setPrefetchedPage(2);
          if (!search.trim()) setCities(fallback);
        }
      } finally {
        if (!cancelled && reqId === activeReqRef.current) {
          setLoading(false);
        }
      }
    };

    void fetchInitial();

    return () => {
      cancelled = true;
    };
  }, [selectedState, countryCode, defaultQuery, isIndia]);

  // 2. Search cities with debounce
  useEffect(() => {
    if (!isOpen) return;

    const trimmed = search.trim();
    if (!trimmed) {
      setCities(prefetchedCities);
      setHasMore(prefetchedHasMore);
      setPage(prefetchedPage);
      setLoading(false);
      return;
    }

    let cancelled = false;
    const reqId = ++activeReqRef.current;
    setLoading(true);

    const timer = setTimeout(async () => {
      try {
        const res = await fetchAwasioSuggestions(trimmed, {
          state: selectedState?.trim() || undefined,
          country: countryCode,
          types: ["CITY"],
          page: 1,
          pageSize: PAGE_SIZE,
        });

        if (cancelled || reqId !== activeReqRef.current) return;

        const results = (res.data || []).filter((s) => s.type === "CITY");
        const canLoadMore = res.pagination?.hasNextPage ?? results.length >= PAGE_SIZE;
        setCities(results);
        setHasMore(canLoadMore);
        setPage(2);
      } catch {
        if (!cancelled && reqId === activeReqRef.current) {
          setCities([]);
          setHasMore(false);
        }
      } finally {
        if (!cancelled && reqId === activeReqRef.current) {
          setLoading(false);
        }
      }
    }, 180);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [search, isOpen, prefetchedCities, prefetchedHasMore, prefetchedPage, selectedState, countryCode]);

  // 3. Load more cities on scroll (Pagination)
  const loadMoreCities = async () => {
    if (loading || loadingMore || !hasMore) return;

    setLoadingMore(true);
    const trimmed = search.trim();
    const query = trimmed || (isIndia ? selectedState?.trim() : "") || defaultQuery;
    const currentPage = page;

    try {
      const res = await fetchAwasioSuggestions(query, {
        state: selectedState?.trim() || undefined,
        country: countryCode,
        types: ["CITY"],
        page: currentPage,
        pageSize: PAGE_SIZE,
      });

      const nextResults = (res.data || []).filter((s) => s.type === "CITY");
      const map = new Map<string, AwasioSuggestion>();
      for (const c of cities) map.set(c.id, c);
      for (const c of nextResults) map.set(c.id, c);

      const merged = Array.from(map.values());
      const canLoadMore = res.pagination?.hasNextPage ?? nextResults.length >= PAGE_SIZE;

      setCities(merged);
      setPage(currentPage + 1);
      setHasMore(canLoadMore);

      if (!trimmed) {
        setPrefetchedCities(merged);
        setPrefetchedHasMore(canLoadMore);
        setPrefetchedPage(currentPage + 1);
      }
    } catch {
      setHasMore(false);
    } finally {
      setLoadingMore(false);
    }
  };

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Auto-focus search input when opened
  useEffect(() => {
    if (isOpen) {
      setSearch("");
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  const handleSelectCity = (c: AwasioSuggestion) => {
    setIsOpen(false);
    setSearch("");
    onChange({
      name: c.location.city || c.title,
      state: c.location.state || undefined,
      lat: c.location.lat ?? null,
      lng: c.location.lng ?? null,
      id: c.id,
    });
  };

  const dynamicPlaceholder =
    placeholder ||
    (selectedState ? `Select City in ${selectedState}` : "Select City (or search across India)");

  return (
    <div className="relative" ref={containerRef}>
      {/* Trigger Bar */}
      <div
        onClick={() => setIsOpen((prev) => !prev)}
        className={`flex h-11 cursor-pointer items-center justify-between gap-2 rounded-xl border bg-white px-3 transition-colors dark:bg-slate-800 ${
          hasError
            ? "border-rose-500 ring-1 ring-rose-500/20"
            : isOpen
            ? "border-rose-500 ring-2 ring-rose-500/20 dark:border-rose-400"
            : "border-slate-200 hover:border-slate-300 dark:border-slate-700 dark:hover:border-slate-600"
        }`}
      >
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <MapPin
            className={`h-4 w-4 shrink-0 transition-colors ${
              value ? "text-rose-500" : "text-slate-400"
            }`}
          />
          {value ? (
            <span className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
              {value}
            </span>
          ) : (
            <span className="truncate text-sm text-slate-400 dark:text-slate-500">
              {dynamicPlaceholder}
            </span>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          {value && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onChange({ name: "", state: undefined, lat: null, lng: null });
              }}
              className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-700 dark:hover:text-slate-200"
              aria-label="Clear city selection"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
          <ChevronDown
            className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${
              isOpen ? "rotate-180 text-rose-500" : ""
            }`}
          />
        </div>
      </div>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-50 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-900">
          {/* Search Header */}
          <div className="flex items-center gap-2 border-b border-slate-100 px-3 py-2.5 dark:border-slate-800">
            <Search className="h-4 w-4 shrink-0 text-slate-400" />
            <input
              ref={searchInputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={
                selectedState
                  ? `Search cities in ${selectedState}...`
                  : "Search city across India..."
              }
              className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400 dark:text-slate-100 dark:placeholder:text-slate-500"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* City Items List */}
          <div
            className="max-h-64 overflow-y-auto py-1"
            onScroll={(e) => {
              const el = e.currentTarget;
              if (el.scrollHeight - el.scrollTop - el.clientHeight <= 48) {
                void loadMoreCities();
              }
            }}
          >
            {loading && cities.length === 0 && (
              <div className="flex items-center justify-center gap-2 py-6 text-xs text-slate-500 dark:text-slate-400">
                <Loader2 className="h-4 w-4 animate-spin text-rose-500" />
                <span>Searching cities…</span>
              </div>
            )}

            {!loading && cities.length === 0 && (
              <div className="px-4 py-6 text-center text-xs text-slate-500 dark:text-slate-400">
                No matching cities found in extended dataset
              </div>
            )}

            {cities
              .filter((c, i, arr) => arr.findIndex((x) => x.id === c.id) === i)
              .map((c, idx) => {
              const cityName = c.location.city || c.title;
              const isSelected = value.toLowerCase() === cityName.toLowerCase();

              return (
                <button
                  key={`${c.id}-${idx}`}
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => handleSelectCity(c)}
                  className={`group flex w-full items-center justify-between gap-2 px-3 py-2.5 text-left transition-colors ${
                    isSelected
                      ? "bg-rose-50/80 text-rose-900 dark:bg-rose-950/40 dark:text-rose-300"
                      : "hover:bg-slate-50 text-slate-800 dark:text-slate-200 dark:hover:bg-slate-800/80"
                  }`}
                >
                  <div className="flex min-w-0 items-center gap-2.5">
                    <MapPin
                      className={`h-4 w-4 shrink-0 transition-colors ${
                        isSelected
                          ? "text-rose-600 dark:text-rose-400"
                          : "text-slate-400 group-hover:text-rose-500 dark:text-slate-500"
                      }`}
                    />
                    <div className="min-w-0">
                      <span className="block truncate text-sm font-medium">
                        {cityName}
                      </span>
                      {c.location.state && (
                        <span className="block truncate text-xs text-slate-400 dark:text-slate-500">
                          {c.location.state}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-medium text-blue-700 dark:bg-blue-950/40 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/60">
                      City
                    </span>
                    {isSelected && <Check className="h-4 w-4 text-rose-600 dark:text-rose-400" />}
                  </div>
                </button>
              );
            })}

            {loadingMore && (
              <div className="flex items-center justify-center gap-1.5 border-t border-slate-100 py-2.5 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
                <Loader2 className="h-3 w-3 animate-spin text-rose-500" />
                <span>Loading more cities…</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
