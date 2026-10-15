"use client";

import React, { useState, useEffect, useRef } from "react";
import { ChevronDown, MapPin, Search, X, Loader2, Plus, Check } from "lucide-react";
import {
  fetchAwasioSuggestions,
  type AwasioSuggestion,
} from "@/lib/awasioSuggestions";

const LOCALITY_PAGE_SIZE = 30;

export interface LocalitySelection {
  name: string;
  pincode?: string;
  lat?: number | null;
  lng?: number | null;
  isCustom?: boolean;
}

interface Props {
  value: string;
  cityName: string;
  selectedState?: string;
  onChange: (loc: LocalitySelection) => void;
  hasError?: boolean;
  placeholder?: string;
}

export function PropertyListingLocalitySelector({
  value,
  cityName,
  selectedState,
  onChange,
  hasError = false,
  placeholder,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [localities, setLocalities] = useState<AwasioSuggestion[]>([]);
  const [prefetchedLocalities, setPrefetchedLocalities] = useState<AwasioSuggestion[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const activeReqRef = useRef(0);

  const isCitySelected = Boolean(cityName?.trim());

  // 1. Prefetch localities as soon as cityName is selected or changed
  useEffect(() => {
    const cleanCity = cityName?.trim();
    if (!cleanCity) {
      setPrefetchedLocalities([]);
      setLocalities([]);
      setHasMore(false);
      setLoading(false);
      return;
    }

    let cancelled = false;
    const reqId = ++activeReqRef.current;
    setLoading(true);

    const fetchInitial = async () => {
      try {
        const res = await fetchAwasioSuggestions(cleanCity, {
          city: cleanCity,
          state: selectedState?.trim() || undefined,
          types: ["LOCALITY"],
          page: 1,
          pageSize: LOCALITY_PAGE_SIZE,
          maxPerGroup: LOCALITY_PAGE_SIZE,
        });

        if (cancelled || reqId !== activeReqRef.current) return;

        const results = (res.data || []).filter((s) => s.type === "LOCALITY");
        setPrefetchedLocalities(results);
        if (!search.trim()) {
          setLocalities(results);
          setHasMore(res.pagination?.hasNextPage ?? results.length >= LOCALITY_PAGE_SIZE);
          setPage(2);
        }
      } catch {
        if (!cancelled && reqId === activeReqRef.current) {
          setPrefetchedLocalities([]);
          if (!search.trim()) setLocalities([]);
          setHasMore(false);
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
  }, [cityName, selectedState]);

  // 2. Debounced search when user types in locality field
  useEffect(() => {
    if (!isOpen || !isCitySelected) return;

    const trimmed = search.trim();
    if (!trimmed) {
      setLocalities(prefetchedLocalities);
      setHasMore(prefetchedLocalities.length >= LOCALITY_PAGE_SIZE);
      setPage(2);
      setLoading(false);
      return;
    }

    let cancelled = false;
    const reqId = ++activeReqRef.current;
    setLoading(true);

    const timer = setTimeout(async () => {
      try {
        const res = await fetchAwasioSuggestions(trimmed, {
          city: cityName.trim(),
          state: selectedState?.trim() || undefined,
          types: ["LOCALITY"],
          page: 1,
          pageSize: LOCALITY_PAGE_SIZE,
          maxPerGroup: LOCALITY_PAGE_SIZE,
        });

        if (cancelled || reqId !== activeReqRef.current) return;

        const results = (res.data || []).filter((s) => s.type === "LOCALITY");
        setLocalities(results);
        setHasMore(res.pagination?.hasNextPage ?? results.length >= LOCALITY_PAGE_SIZE);
        setPage(2);
      } catch {
        if (!cancelled && reqId === activeReqRef.current) {
          setLocalities([]);
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
  }, [search, isOpen, isCitySelected, cityName, selectedState, prefetchedLocalities]);

  // 3. Infinite scroll pagination for localities
  const loadMoreLocalities = async () => {
    if (loading || loadingMore || !hasMore || !isCitySelected) return;

    setLoadingMore(true);
    const query = search.trim() || cityName.trim();

    try {
      const res = await fetchAwasioSuggestions(query, {
        city: cityName.trim(),
        state: selectedState?.trim() || undefined,
        types: ["LOCALITY"],
        page,
        pageSize: LOCALITY_PAGE_SIZE,
        maxPerGroup: LOCALITY_PAGE_SIZE,
      });

      const nextResults = (res.data || []).filter((s) => s.type === "LOCALITY");
      const map = new Map<string, AwasioSuggestion>();
      for (const item of localities) map.set(item.id, item);
      for (const item of nextResults) map.set(item.id, item);

      const merged = Array.from(map.values());
      setLocalities(merged);
      setPage((prev) => prev + 1);
      setHasMore(res.pagination?.hasNextPage ?? nextResults.length >= LOCALITY_PAGE_SIZE);
    } catch {
      setHasMore(false);
    } finally {
      setLoadingMore(false);
    }
  };

  // Close on outside click
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

  const handleSelectLocality = (s: AwasioSuggestion) => {
    setIsOpen(false);
    setSearch("");
    const locName = s.location.locality || s.title;
    onChange({
      name: locName,
      pincode: s.location.pincode ? String(s.location.pincode) : undefined,
      lat: s.location.lat ?? null,
      lng: s.location.lng ?? null,
      isCustom: false,
    });
  };

  const handleCustomLocality = (customName: string) => {
    setIsOpen(false);
    setSearch("");
    const cleanName = customName.trim();
    if (!cleanName) return;
    onChange({
      name: cleanName,
      isCustom: true,
    });
  };

  const dynamicPlaceholder = !isCitySelected
    ? "Select City first"
    : placeholder || `Select Locality in ${cityName}`;

  return (
    <div className="relative" ref={containerRef}>
      {/* Trigger Bar */}
      <div
        onClick={() => {
          if (!isCitySelected) return;
          setIsOpen(true);
          inputRef.current?.focus();
        }}
        className={`flex h-11 items-center gap-1.5 overflow-hidden rounded-xl border bg-white px-2.5 transition-colors dark:bg-slate-800 ${
          !isCitySelected
            ? "cursor-not-allowed opacity-60 border-slate-200 dark:border-slate-800"
            : hasError
            ? "border-rose-500 ring-1 ring-rose-500/20"
            : isOpen
            ? "border-rose-500 ring-2 ring-rose-500/20 dark:border-rose-400"
            : "border-slate-200 hover:border-slate-300 dark:border-slate-700 dark:hover:border-slate-600"
        }`}
      >
        <MapPin
          className={`ml-0.5 h-4 w-4 shrink-0 transition-colors ${
            value ? "text-rose-500" : "text-slate-400"
          }`}
        />

        {value && !isOpen ? (
          <div className="flex min-w-0 flex-1 items-center justify-between gap-1">
            <span className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
              {value}
            </span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onChange({ name: "", pincode: undefined, lat: null, lng: null });
                setSearch("");
              }}
              className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-700 dark:hover:text-slate-200"
              aria-label="Clear locality"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : (
          <input
            ref={inputRef}
            type="text"
            disabled={!isCitySelected}
            value={isOpen ? search : ""}
            onChange={(e) => setSearch(e.target.value)}
            onFocus={() => {
              if (isCitySelected) setIsOpen(true);
            }}
            placeholder={value || dynamicPlaceholder}
            className="min-w-0 flex-1 bg-transparent px-1.5 py-0.5 text-sm text-slate-900 outline-none placeholder:text-slate-400 dark:text-slate-100 dark:placeholder:text-slate-500 disabled:cursor-not-allowed"
          />
        )}

        <ChevronDown
          className={`h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200 ${
            isOpen ? "rotate-180 text-rose-500" : ""
          }`}
        />
      </div>

      {/* Dropdown Panel */}
      {isOpen && isCitySelected && (
        <div
          className="absolute left-0 right-0 top-[calc(100%+6px)] z-50 max-h-72 overflow-y-auto rounded-xl border border-slate-200 bg-white py-1 shadow-xl transition-all dark:border-slate-700 dark:bg-slate-900"
          onScroll={(e) => {
            const el = e.currentTarget;
            if (el.scrollHeight - el.scrollTop - el.clientHeight <= 48) {
              void loadMoreLocalities();
            }
          }}
        >
          {loading && localities.length === 0 && (
            <div className="flex items-center justify-center gap-2 py-6 text-xs text-slate-500 dark:text-slate-400">
              <Loader2 className="h-4 w-4 animate-spin text-rose-500" />
              <span>Searching localities in {cityName}…</span>
            </div>
          )}

          {!loading && localities.length === 0 && (
            <div className="px-4 py-4 text-center text-xs text-slate-500 dark:text-slate-400">
              <p>No matching locality found in {cityName}</p>
              {search.trim() && (
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => handleCustomLocality(search)}
                  className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-100 dark:bg-rose-950/40 dark:text-rose-400"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Use &quot;{search.trim()}&quot; as custom locality</span>
                </button>
              )}
            </div>
          )}

          {/* Render locality items */}
          {localities.map((sg) => {
            const title = sg.title;
            const subtitle = sg.subtitle || `${cityName} (${sg.location.pincode || ""})`;
            const isSelected = value.toLowerCase() === title.toLowerCase();

            return (
              <button
                key={sg.id}
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => handleSelectLocality(sg)}
                className={`group flex w-full items-center justify-between gap-2 px-3 py-2 text-left transition-colors ${
                  isSelected
                    ? "bg-rose-50/80 text-rose-900 dark:bg-rose-950/40 dark:text-rose-300"
                    : "hover:bg-slate-50 text-slate-800 dark:text-slate-200 dark:hover:bg-slate-800/80"
                }`}
              >
                <div className="flex min-w-0 items-center gap-2.5">
                  <MapPin
                    className={`h-3.5 w-3.5 shrink-0 transition-colors ${
                      isSelected
                        ? "text-rose-600 dark:text-rose-400"
                        : "text-slate-400 group-hover:text-rose-500 dark:text-slate-500"
                    }`}
                  />
                  <div className="min-w-0">
                    <span className="block truncate text-sm font-medium">
                      {title}
                    </span>
                    <span className="block truncate text-xs text-slate-400 dark:text-slate-500">
                      {subtitle}
                    </span>
                  </div>
                </div>

                <div className="flex shrink-0 flex-col items-end gap-0.5">
                  <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60">
                    {sg.badge || "Locality"}
                  </span>
                  {sg.metrics?.formattedPriceSqft && (
                    <span className="text-[10px] text-slate-400 dark:text-slate-500">
                      {sg.metrics.formattedPriceSqft}
                    </span>
                  )}
                </div>
              </button>
            );
          })}

          {/* Custom Locality Action at bottom */}
          {search.trim() && localities.length > 0 && (
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => handleCustomLocality(search)}
              className="flex w-full items-center gap-2 border-t border-slate-100 px-3 py-2 text-left text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:border-slate-800 dark:text-rose-400 dark:hover:bg-rose-950/40"
            >
              <Plus className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">Enter &quot;{search.trim()}&quot; as Custom Locality</span>
            </button>
          )}

          {loadingMore && (
            <div className="flex items-center justify-center gap-1.5 border-t border-slate-100 py-2.5 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
              <Loader2 className="h-3 w-3 animate-spin text-rose-500" />
              <span>Loading more localities…</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
