"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  MapPin,
  Search,
  X,
  Plus,
  Check,
  ChevronDown,
  Loader2,
  Trash2,
} from "lucide-react";
import {
  fetchAwasioSuggestions,
  type AwasioSuggestion,
} from "@/lib/awasioSuggestions";

export const POPULAR_CITY_LOCALITIES: Record<string, string[]> = {
  delhi: [
    "South Delhi",
    "Saket",
    "Vasant Kunj",
    "Greater Kailash",
    "Hauz Khas",
    "Chhatarpur",
    "Dwarka",
    "Rohini",
    "Defence Colony",
    "Lajpat Nagar",
    "Connaught Place",
    "Vasant Vihar",
    "Janakpuri",
    "New Friends Colony",
    "Gulmohar Park",
  ],
  "new delhi": [
    "South Delhi",
    "Saket",
    "Vasant Kunj",
    "Greater Kailash",
    "Hauz Khas",
    "Chhatarpur",
    "Dwarka",
    "Rohini",
    "Defence Colony",
    "Lajpat Nagar",
    "Connaught Place",
    "Vasant Vihar",
    "Janakpuri",
  ],
  gurugram: [
    "DLF Phase 5",
    "Golf Course Road",
    "Sector 54",
    "Sector 57",
    "Sohna Road",
    "Cyber City",
    "Golf Course Extension",
    "Sector 82",
    "Sector 48",
    "Sushant Lok 1",
    "Nirvana Country",
    "South City 1",
    "Sector 65",
  ],
  gurgaon: [
    "DLF Phase 5",
    "Golf Course Road",
    "Sector 54",
    "Sector 57",
    "Sohna Road",
    "Cyber City",
    "Golf Course Extension",
    "Sector 82",
    "Sector 48",
    "Sushant Lok 1",
    "Nirvana Country",
  ],
  noida: [
    "Sector 62",
    "Sector 137",
    "Sector 150",
    "Sector 75",
    "Sector 78",
    "Sector 128",
    "Sector 18",
    "Noida Expressway",
    "Sector 44",
    "Sector 76",
    "Sector 104",
  ],
  mumbai: [
    "Bandra West",
    "Andheri West",
    "Juhu",
    "Worli",
    "Powai",
    "Bandra Kurla Complex (BKC)",
    "Goregaon East",
    "Malad West",
    "Khar West",
    "Lower Parel",
    "Chembur",
    "Dadar",
  ],
  bengaluru: [
    "Indiranagar",
    "Koramangala",
    "Whitefield",
    "HSR Layout",
    "Bellandur",
    "JP Nagar",
    "Marathahalli",
    "Electronic City",
    "Sarjapur Road",
    "Hebbal",
    "Yelahanka",
    "Jayanagar",
  ],
  bangalore: [
    "Indiranagar",
    "Koramangala",
    "Whitefield",
    "HSR Layout",
    "Bellandur",
    "JP Nagar",
    "Marathahalli",
    "Electronic City",
    "Sarjapur Road",
    "Hebbal",
    "Yelahanka",
    "Jayanagar",
  ],
  pune: [
    "Koregaon Park",
    "Kalyani Nagar",
    "Viman Nagar",
    "Baner",
    "Hinjewadi",
    "Wakad",
    "Aundh",
    "Kothrud",
    "Hadapsar",
    "Magarpatta",
    "Bavdhan",
  ],
  hyderabad: [
    "Hitec City",
    "Gachibowli",
    "Jubilee Hills",
    "Banjara Hills",
    "Madhapur",
    "Kondapur",
    "Financial District",
    "Kukatpally",
    "Manikonda",
    "Tellapur",
  ],
  kolkata: [
    "Salt Lake",
    "New Town",
    "Ballygunge",
    "Alipore",
    "Park Street",
    "Rajarhat",
    "Garia",
    "Behala",
    "Howrah",
  ],
  chennai: [
    "Adyar",
    "Besant Nagar",
    "Anna Nagar",
    "T Nagar",
    "OMR",
    "Velachery",
    "Thiruvanmiyur",
    "Nungambakkam",
    "Mylapore",
  ],
  ahmedabad: [
    "SG Highway",
    "Bodakdev",
    "Vastrapur",
    "Satellite",
    "Prahlad Nagar",
    "Thaltej",
    "Science City Road",
    "Bopal",
  ],
  chandigarh: [
    "Sector 17",
    "Sector 35",
    "Sector 8",
    "Sector 9",
    "Sector 43",
    "Mohali Phase 7",
    "Panchkula Sector 20",
    "Zirakpur",
  ],
  jaipur: [
    "Malviya Nagar",
    "Vaishali Nagar",
    "C-Scheme",
    "Mansarovar",
    "Jagatpura",
    "Tonk Road",
    "Raja Park",
  ],
  lucknow: [
    "Gomti Nagar",
    "Hazratganj",
    "Indira Nagar",
    "Aliganj",
    "Vibhuti Khand",
    "Sushant Golf City",
    "Mahanagar",
  ],
};

interface LocalityItem {
  name: string;
  subtitle?: string;
  isCustom?: boolean;
}

interface AdvisorLocalitySelectorProps {
  cityName: string;
  selectedLocalities: string[];
  onAddLocality: (locality: string) => void;
  onRemoveLocality: (locality: string) => void;
  onClearAll?: () => void;
  className?: string;
}

export function AdvisorLocalitySelector({
  cityName,
  selectedLocalities,
  onAddLocality,
  onRemoveLocality,
  onClearAll,
  className = "",
}: AdvisorLocalitySelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [apiSuggestions, setApiSuggestions] = useState<LocalityItem[]>([]);
  const [loading, setLoading] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const activeReqRef = useRef(0);

  const cleanCity = (cityName || "").trim();
  const cityKey = cleanCity.toLowerCase();
  const popularInCity = POPULAR_CITY_LOCALITIES[cityKey] || [];

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside, {
      passive: true,
    });
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, []);

  // Live search debounced
  useEffect(() => {
    if (!cleanCity || !isOpen) return;

    const trimmed = search.trim();
    if (!trimmed) {
      setApiSuggestions([]);
      setLoading(false);
      return;
    }

    const reqId = ++activeReqRef.current;
    setLoading(true);

    const timer = setTimeout(async () => {
      try {
        const res = await fetchAwasioSuggestions(trimmed, {
          city: cleanCity,
          types: ["LOCALITY"],
          limit: 15,
        });

        if (activeReqRef.current !== reqId) return;

        const results: LocalityItem[] = (res.data || [])
          .filter((item) => item.type === "LOCALITY")
          .map((item) => ({
            name: item.location.locality || item.title,
            subtitle:
              item.subtitle ||
              (item.location.pincode
                ? `${cleanCity} (${item.location.pincode})`
                : cleanCity),
          }));

        // Dedupe by lowercase name
        const seen = new Set<string>();
        const deduped: LocalityItem[] = [];
        for (const r of results) {
          const k = r.name.toLowerCase();
          if (!seen.has(k)) {
            seen.add(k);
            deduped.push(r);
          }
        }

        setApiSuggestions(deduped);
      } catch {
        // Fallback search in popular list if API fails
        if (activeReqRef.current === reqId) {
          const lower = trimmed.toLowerCase();
          const filtered = popularInCity
            .filter((p) => p.toLowerCase().includes(lower))
            .map((p) => ({ name: p, subtitle: cleanCity }));
          setApiSuggestions(filtered);
        }
      } finally {
        if (activeReqRef.current === reqId) {
          setLoading(false);
        }
      }
    }, 180);

    return () => clearTimeout(timer);
  }, [search, cleanCity, isOpen, popularInCity]);

  // Derived display items
  const isSearching = search.trim().length > 0;
  const currentQuery = search.trim();

  // Combine suggestions:
  let displayList: LocalityItem[] = [];
  if (isSearching) {
    displayList = apiSuggestions;
    // If api suggestions are empty, filter popular localities
    if (displayList.length === 0) {
      const lower = currentQuery.toLowerCase();
      displayList = popularInCity
        .filter((name) => name.toLowerCase().includes(lower))
        .map((name) => ({ name, subtitle: cleanCity }));
    }
  } else {
    // Show popular localities for this city
    displayList = popularInCity.map((name) => ({
      name,
      subtitle: cleanCity,
    }));
  }

  // Check if current search query exactly matches an existing item
  const hasExactMatch = displayList.some(
    (item) => item.name.toLowerCase() === currentQuery.toLowerCase()
  );

  const isLocalitySelected = (name: string) =>
    selectedLocalities.some((s) => s.toLowerCase() === name.toLowerCase());

  const handleSelect = (item: LocalityItem) => {
    if (isLocalitySelected(item.name)) {
      onRemoveLocality(item.name);
    } else {
      onAddLocality(item.name);
    }
    setSearch("");
    inputRef.current?.focus();
  };

  const handleAddCustom = () => {
    if (!currentQuery) return;
    if (!isLocalitySelected(currentQuery)) {
      onAddLocality(currentQuery);
    }
    setSearch("");
    inputRef.current?.focus();
  };

  return (
    <div className={`space-y-2.5 ${className}`} ref={containerRef}>
      {/* Selected Localities Chips */}
      <div className="flex flex-wrap items-center gap-1.5 min-h-[28px]">
        {selectedLocalities.length === 0 ? (
          <span className="text-xs text-slate-400 dark:text-slate-500 italic">
            No operating localities added yet. Pick from the dropdown below.
          </span>
        ) : (
          selectedLocalities.map((loc) => (
            <span
              key={loc}
              className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-800 shadow-2xs transition hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-slate-600"
            >
              <MapPin className="h-3 w-3 text-rose-500 shrink-0" />
              <span className="max-w-[140px] truncate">{loc}</span>
              <button
                type="button"
                onClick={() => onRemoveLocality(loc)}
                className="ml-0.5 rounded-full p-0.5 text-slate-400 hover:bg-slate-200 hover:text-rose-600 dark:hover:bg-slate-700 dark:hover:text-rose-400"
                aria-label={`Remove ${loc}`}
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))
        )}

        {selectedLocalities.length > 1 && onClearAll && (
          <button
            type="button"
            onClick={onClearAll}
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-400 hover:text-rose-600 dark:text-slate-500 dark:hover:text-rose-400 ml-1"
          >
            <Trash2 className="h-3 w-3" />
            <span>Clear all</span>
          </button>
        )}
      </div>

      {/* Interactive Dropdown Search Trigger */}
      <div className="relative">
        <div
          onClick={() => {
            if (!cleanCity) return;
            setIsOpen(true);
            inputRef.current?.focus();
          }}
          className={`flex h-10 items-center gap-2 rounded-xl border bg-white px-3 text-xs transition-colors dark:bg-slate-800 ${
            !cleanCity
              ? "cursor-not-allowed opacity-60 border-slate-200 dark:border-slate-800"
              : isOpen
              ? "border-rose-500 ring-2 ring-rose-500/20 dark:border-rose-500"
              : "border-slate-200 hover:border-slate-300 dark:border-slate-700 dark:hover:border-slate-600"
          }`}
        >
          <MapPin
            className={`h-3.5 w-3.5 shrink-0 ${
              cleanCity ? "text-rose-500" : "text-slate-400"
            }`}
          />

          <input
            ref={inputRef}
            type="text"
            disabled={!cleanCity}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              if (cleanCity && !isOpen) setIsOpen(true);
            }}
            onFocus={() => {
              if (cleanCity) setIsOpen(true);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                if (currentQuery) {
                  // If single exact or first match exists, add it or add custom
                  if (displayList.length === 1) {
                    handleSelect(displayList[0]);
                  } else {
                    handleAddCustom();
                  }
                }
              } else if (e.key === "Escape") {
                setIsOpen(false);
              }
            }}
            placeholder={
              cleanCity
                ? `Search & select localities in ${cleanCity}...`
                : "Select a Primary City first"
            }
            className="min-w-0 flex-1 bg-transparent text-xs text-slate-900 outline-none placeholder:text-slate-400 dark:text-white dark:placeholder:text-slate-500 disabled:cursor-not-allowed"
          />

          {search && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setSearch("");
                inputRef.current?.focus();
              }}
              className="rounded-full p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="h-3 w-3" />
            </button>
          )}

          {loading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin text-rose-500 shrink-0" />
          ) : (
            <ChevronDown
              className={`h-3.5 w-3.5 text-slate-400 shrink-0 transition-transform duration-200 ${
                isOpen ? "rotate-180 text-rose-500" : ""
              }`}
            />
          )}
        </div>

        {/* Dropdown Floating Panel */}
        {isOpen && cleanCity && (
          <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-40 max-h-72 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-1.5 shadow-xl transition-all dark:border-slate-700 dark:bg-slate-900 shadow-slate-950/10">
            {/* Header / Subtitle */}
            <div className="flex items-center justify-between px-2.5 py-1.5 border-b border-slate-100 dark:border-slate-800">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {isSearching
                  ? `Search Results in ${cleanCity}`
                  : `Popular Localities in ${cleanCity}`}
              </span>
              <span className="text-[10px] text-slate-400">
                {selectedLocalities.length} selected
              </span>
            </div>

            {/* Empty State */}
            {!loading && displayList.length === 0 && (
              <div className="px-3 py-4 text-center">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  No localities found matching &quot;{currentQuery}&quot;
                </p>
                {currentQuery && (
                  <button
                    type="button"
                    onClick={handleAddCustom}
                    className="mt-2.5 inline-flex items-center gap-1.5 rounded-xl bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-700 hover:bg-rose-100 dark:bg-rose-950/60 dark:text-rose-300 dark:hover:bg-rose-900/60"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Add &quot;{currentQuery}&quot; as custom locality</span>
                  </button>
                )}
              </div>
            )}

            {/* Suggestions List */}
            <div className="py-1 divide-y divide-slate-50 dark:divide-slate-800/60">
              {displayList.map((item) => {
                const selected = isLocalitySelected(item.name);
                return (
                  <button
                    key={item.name}
                    type="button"
                    onClick={() => handleSelect(item)}
                    className={`group flex w-full items-center justify-between gap-2.5 rounded-xl px-2.5 py-2 text-left transition-colors ${
                      selected
                        ? "bg-rose-50/70 text-rose-900 dark:bg-rose-950/40 dark:text-rose-200"
                        : "hover:bg-slate-50 text-slate-800 dark:text-slate-200 dark:hover:bg-slate-800/80"
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg ${
                          selected
                            ? "bg-rose-600 text-white"
                            : "bg-slate-100 text-slate-500 group-hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400"
                        }`}
                      >
                        <MapPin className="h-3 w-3" />
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-xs font-semibold">
                          {item.name}
                        </p>
                        {item.subtitle && (
                          <p className="truncate text-[10px] text-slate-400">
                            {item.subtitle}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="shrink-0">
                      {selected ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800">
                          <Check className="h-3 w-3" />
                          <span>Added</span>
                        </span>
                      ) : (
                        <span className="text-[11px] font-medium text-slate-400 group-hover:text-rose-600 dark:group-hover:text-rose-400">
                          + Add
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Custom Locality Action at bottom if query doesn't exactly match */}
            {currentQuery && !hasExactMatch && displayList.length > 0 && (
              <div className="border-t border-slate-100 pt-1 mt-1 dark:border-slate-800">
                <button
                  type="button"
                  onClick={handleAddCustom}
                  className="flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-left text-xs font-bold text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/50"
                >
                  <Plus className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">
                    Add &quot;{currentQuery}&quot; as custom locality
                  </span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
