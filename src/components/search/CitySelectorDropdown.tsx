"use client";

import React from "react";
import { ChevronDown, Crosshair, Loader2, MapPin, Search, Check, Sparkles } from "lucide-react";
import { APP_CONFIG } from "@/constants/app-config";

export interface CityItem {
  id: number;
  name: string;
  slug: string;
  state?: string;
  latitude?: number | null;
  longitude?: number | null;
  isPopular?: boolean;
}

const DEFAULT_POPULAR_CITIES: CityItem[] = [
  { id: 19, name: "Bengaluru", slug: "bengaluru", state: "Karnataka", isPopular: true },
  { id: 1, name: "Mumbai", slug: "mumbai", state: "Maharashtra", isPopular: true },
  { id: 11, name: "Delhi", slug: "delhi", state: "Delhi", isPopular: true },
  { id: 1363, name: "Gurgaon", slug: "gurgaon", state: "Haryana", isPopular: true },
  { id: 13, name: "Noida", slug: "noida", state: "Uttar Pradesh", isPopular: true },
  { id: 25, name: "Hyderabad", slug: "hyderabad", state: "Telangana", isPopular: true },
  { id: 2, name: "Pune", slug: "pune", state: "Maharashtra", isPopular: true },
  { id: 29, name: "Chennai", slug: "chennai", state: "Tamil Nadu", isPopular: true },
  { id: 46, name: "Kolkata", slug: "kolkata", state: "West Bengal", isPopular: true },
  { id: 35, name: "Ahmedabad", slug: "ahmedabad", state: "Gujarat", isPopular: true },
];

interface Props {
  selectedCityName?: string;
  onSelectCity: (city: CityItem) => void;
  className?: string;
  compact?: boolean;
}

export function CitySelectorDropdown({ selectedCityName = "Bengaluru", onSelectCity, className = "", compact = false }: Props) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const [popularCities, setPopularCities] = React.useState<CityItem[]>(DEFAULT_POPULAR_CITIES);
  const [searchResults, setSearchResults] = React.useState<CityItem[]>([]);
  const [isDetecting, setIsDetecting] = React.useState(false);
  const [placement, setPlacement] = React.useState<"bottom" | "top">("bottom");
  const [dropdownMaxHeight, setDropdownMaxHeight] = React.useState<number>(360);

  const containerRef = React.useRef<HTMLDivElement>(null);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  // 1. Fetch live popular cities on mount
  React.useEffect(() => {
    const fetchPopular = async () => {
      try {
        const url = `${APP_CONFIG.API.BASE_URL}/v1/cities?popular=true`;
        const res = await fetch(url);
        const resJson = await res.json();
        if (resJson?.data && Array.isArray(resJson.data) && resJson.data.length > 0) {
          const seen = new Set<string>();
          const unique: CityItem[] = [];
          for (const c of resJson.data) {
            const key = c.name.toLowerCase();
            if (!seen.has(key)) {
              seen.add(key);
              unique.push(c);
            }
          }
          if (unique.length > 0) {
            setPopularCities(unique.slice(0, 16));
          }
        }
      } catch {
        // Fallback to default popular cities
      }
    };
    void fetchPopular();
  }, []);

  // 2. Search cities when user types in the city search box
  React.useEffect(() => {
    if (!search.trim()) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(() => {
      const runSearch = async () => {
        try {
          const query = encodeURIComponent(search.trim());
          const url = `${APP_CONFIG.API.BASE_URL}/v1/cities?search=${query}&limit=20`;
          const res = await fetch(url);
          const resJson = await res.json();
          if (resJson?.data && Array.isArray(resJson.data)) {
            setSearchResults(resJson.data);
          }
        } catch {
          // ignore error
        }
      };
      void runSearch();
    }, 150);

    return () => clearTimeout(timer);
  }, [search]);

  // 3. Viewport Boundary / Prevent dropdown going below UI
  React.useEffect(() => {
    if (!isOpen) return;

    const updatePosition = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const spaceBelow = viewportHeight - rect.bottom;
      const spaceAbove = rect.top;

      // Dynamically calculate exact pixel height so dropdown menu NEVER exceeds viewport bottom
      const margin = 20;
      const minHeight = 160;
      const preferredMaxHeight = 280;

      if (spaceBelow < preferredMaxHeight && spaceAbove > spaceBelow) {
        setPlacement("top");
        const available = spaceAbove - margin;
        setDropdownMaxHeight(Math.max(minHeight, Math.min(preferredMaxHeight, available)));
      } else {
        setPlacement("bottom");
        const available = spaceBelow - margin;
        setDropdownMaxHeight(Math.max(minHeight, Math.min(preferredMaxHeight, available)));
      }
    };

    updatePosition();
    window.addEventListener("scroll", updatePosition, { passive: true });
    window.addEventListener("resize", updatePosition);

    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("scroll", updatePosition);
      window.removeEventListener("resize", updatePosition);
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  // 4. GPS Auto-detect city
  const handleDetectLocation = () => {
    if (!("geolocation" in navigator)) {
      alert("Geolocation is not supported by your browser");
      return;
    }
    setIsDetecting(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const detectCity = async () => {
          try {
            const { latitude, longitude } = pos.coords;
            const url = `${APP_CONFIG.API.BASE_URL}/v1/detect-city?lat=${latitude}&lng=${longitude}`;
            const res = await fetch(url);
            const json = await res.json();
            if (json?.data) {
              onSelectCity(json.data);
              setIsOpen(false);
            }
          } catch (e) {
            console.error("Detect city failed", e);
          } finally {
            setIsDetecting(false);
          }
        };
        void detectCity();
      },
      (err) => {
        console.warn("Geolocation permission denied/timed out", err);
        setIsDetecting(false);
      },
      { timeout: 7000 }
    );
  };

  const currentDisplay = selectedCityName || "Bengaluru";

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex h-11 items-center justify-between sm:justify-start gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 sm:px-3.5 text-xs sm:text-sm font-bold text-slate-800 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-rose-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700/80 ${
          compact ? "w-full sm:w-auto" : "w-full"
        }`}
        aria-expanded={isOpen}
        aria-label="Select City"
      >
        <div className="flex items-center gap-1.5 min-w-0">
          <MapPin className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0 text-rose-500" />
          <span className="truncate max-w-[200px] xs:max-w-none sm:max-w-[130px]">{currentDisplay}</span>
        </div>
        <ChevronDown className={`h-3.5 w-3.5 shrink-0 text-slate-500 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {/* Dropdown Floating Menu with Viewport Boundary Clamping */}
      {isOpen && (
        <div
          ref={dropdownRef}
          style={{ maxHeight: `${dropdownMaxHeight}px` }}
          className={`absolute left-0 z-[70] w-72 sm:w-80 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-3 shadow-2xl transition-all dark:border-slate-700 dark:bg-slate-900 ${
            placement === "top"
              ? "bottom-[calc(100%+8px)] shadow-slate-950/20"
              : "top-[calc(100%+8px)] shadow-slate-950/15"
          }`}
        >
          {/* Search box inside dropdown */}
          <div className="relative mb-2.5">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search Indian city..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-1.5 pl-8 pr-3 text-xs text-slate-800 placeholder-slate-400 outline-none focus:border-rose-500 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            />
          </div>

          {/* Quick Action: Use GPS Location */}
          <button
            type="button"
            onClick={handleDetectLocation}
            disabled={isDetecting}
            className="mb-2.5 flex w-full items-center gap-2 rounded-xl bg-rose-50/80 px-2.5 py-2 text-xs font-semibold text-rose-700 transition hover:bg-rose-100/90 active:scale-[0.99] disabled:opacity-50 dark:bg-rose-950/40 dark:text-rose-300 dark:hover:bg-rose-950/70"
          >
            {isDetecting ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Crosshair className="h-3.5 w-3.5 text-rose-600 dark:text-rose-400" />
            )}
            <span>{isDetecting ? "Detecting nearest city..." : "Detect my current location"}</span>
          </button>

          {/* If searching: show search results */}
          {search.trim().length > 0 ? (
            <div className="space-y-1">
              <p className="px-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Search Results</p>
              {searchResults.length === 0 ? (
                <p className="py-3 text-center text-xs text-slate-500">No cities found matching &quot;{search}&quot;</p>
              ) : (
                searchResults.map((c) => (
                  <button
                    key={`search_${c.id}_${c.name}`}
                    type="button"
                    onClick={() => {
                      onSelectCity(c);
                      setIsOpen(false);
                      setSearch("");
                    }}
                    className="flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-xs font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                  >
                    <span>{c.name} {c.state ? `(${c.state})` : ""}</span>
                    {selectedCityName?.toLowerCase() === c.name.toLowerCase() && (
                      <Check className="h-3.5 w-3.5 text-rose-600" />
                    )}
                  </button>
                ))
              )}
            </div>
          ) : (
            /* Default: Popular Metro Cities Grid */
            <div>
              <p className="mb-1.5 flex items-center gap-1 px-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <Sparkles className="h-3 w-3 text-amber-500" />
                Popular Cities
              </p>
              <div className="grid grid-cols-2 gap-1.5">
                {popularCities.map((c) => {
                  const isSelected = selectedCityName?.toLowerCase() === c.name.toLowerCase();
                  return (
                    <button
                      key={`pop_${c.id}_${c.name}`}
                      type="button"
                      onClick={() => {
                        onSelectCity(c);
                        setIsOpen(false);
                      }}
                      className={`flex items-center justify-between rounded-xl px-2.5 py-2 text-left text-xs font-semibold transition ${
                        isSelected
                          ? "bg-rose-600 text-white shadow-xs"
                          : "bg-slate-50 text-slate-700 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                      }`}
                    >
                      <span className="truncate">{c.name}</span>
                      {isSelected && <Check className="h-3 w-3 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
