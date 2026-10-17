"use client";

import React from "react";
import { createPortal } from "react-dom";
import { ChevronDown, MapPin, Search, Check, Sparkles } from "lucide-react";
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

// Curated Top Indian Real Estate Markets (Prevents foreign cities like Auckland/Austin from polluting popular cities)
const DEFAULT_POPULAR_CITIES: CityItem[] = [
  { id: 12, name: "New Delhi", slug: "new-delhi", state: "Delhi", isPopular: true },
  { id: 16, name: "Gurugram", slug: "gurugram", state: "Haryana", isPopular: true },
  { id: 13, name: "Noida", slug: "noida", state: "Uttar Pradesh", isPopular: true },
  { id: 1, name: "Mumbai", slug: "mumbai", state: "Maharashtra", isPopular: true },
  { id: 19, name: "Bengaluru", slug: "bengaluru", state: "Karnataka", isPopular: true },
  { id: 2, name: "Pune", slug: "pune", state: "Maharashtra", isPopular: true },
  { id: 25, name: "Hyderabad", slug: "hyderabad", state: "Telangana", isPopular: true },
  { id: 29, name: "Chennai", slug: "chennai", state: "Tamil Nadu", isPopular: true },
  { id: 46, name: "Kolkata", slug: "kolkata", state: "West Bengal", isPopular: true },
  { id: 35, name: "Ahmedabad", slug: "ahmedabad", state: "Gujarat", isPopular: true },
  { id: 14, name: "Chandigarh", slug: "chandigarh", state: "Punjab", isPopular: true },
  { id: 38, name: "Jaipur", slug: "jaipur", state: "Rajasthan", isPopular: true },
];

const KNOWN_INDIAN_METROS = new Set([
  "delhi", "new delhi", "gurugram", "gurgaon", "noida", "greater noida", "ghaziabad", "faridabad",
  "mumbai", "navi mumbai", "thane", "bengaluru", "bangalore", "pune", "hyderabad",
  "chennai", "kolkata", "ahmedabad", "jaipur", "chandigarh", "lucknow", "surat", "indore", "kochi",
  "ranchi", "patna", "bhopal", "dehradun"
]);

const CITY_CANONICAL_NAMES: Record<string, Pick<CityItem, "name" | "slug" | "state">> = {
  delhi: { name: "New Delhi", slug: "new-delhi", state: "Delhi" },
  "new delhi": { name: "New Delhi", slug: "new-delhi", state: "Delhi" },
  gurgaon: { name: "Gurugram", slug: "gurugram", state: "Haryana" },
  gurugram: { name: "Gurugram", slug: "gurugram", state: "Haryana" },
  bangalore: { name: "Bengaluru", slug: "bengaluru", state: "Karnataka" },
  bengaluru: { name: "Bengaluru", slug: "bengaluru", state: "Karnataka" },
};

export function canonicalizeCity(city: CityItem): CityItem {
  const canonical = CITY_CANONICAL_NAMES[city.name?.trim().toLowerCase()];
  return canonical ? { ...city, ...canonical } : city;
}

export function dedupeCities(cities: CityItem[]): CityItem[] {
  const unique = new Map<string, CityItem>();
  for (const rawCity of cities) {
    const city = canonicalizeCity(rawCity);
    const key = `${city.name.trim().toLowerCase()}|${(city.state || "").trim().toLowerCase()}`;
    if (!unique.has(key)) unique.set(key, city);
  }
  return Array.from(unique.values());
}

interface Props {
  selectedCityName?: string;
  onSelectCity: (city: CityItem) => void;
  className?: string;
  compact?: boolean;
}

export function CitySelectorDropdown({ selectedCityName, onSelectCity, className = "", compact = false }: Props) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const [popularCities, setPopularCities] = React.useState<CityItem[]>(DEFAULT_POPULAR_CITIES);
  const [searchResults, setSearchResults] = React.useState<CityItem[]>([]);
  const [dropdownMaxHeight, setDropdownMaxHeight] = React.useState<number>(360);
  const [dropdownCoords, setDropdownCoords] = React.useState<{ top?: number; bottom?: number; left: number }>({ left: 0 });
  const containerRef = React.useRef<HTMLDivElement>(null);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // 1. Fetch live popular cities from API, filtering strictly for Indian metro cities
  React.useEffect(() => {
    const fetchPopular = async () => {
      try {
        const url = `${APP_CONFIG.API.BASE_URL}/v1/cities?popular=true`;
        const res = await fetch(url);
        const resJson = await res.json();
        if (resJson?.data && Array.isArray(resJson.data) && resJson.data.length > 0) {
          const eligible: CityItem[] = [];
          for (const rawCity of resJson.data) {
            const c = canonicalizeCity(rawCity);
            const key = c.name?.toLowerCase().trim();
            // Strictly exclude foreign cities (Auckland, Austin, Christchurch, etc.)
            if (key && KNOWN_INDIAN_METROS.has(key)) {
              eligible.push(c);
            }
          }
          const unique = dedupeCities(eligible);
          if (unique.length >= 4) {
            setPopularCities(unique.slice(0, 14));
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
            setSearchResults(dedupeCities(resJson.data));
          }
        } catch {
          // ignore error
        }
      };
      void runSearch();
    }, 150);

    return () => clearTimeout(timer);
  }, [search]);

  // 3. Dropdown Placement & Viewport Boundary calculation (Portaled directly to document.body)
  React.useEffect(() => {
    if (!isOpen) return;

    const updatePosition = () => {
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;
      const spaceBelow = viewportHeight - rect.bottom;
      const spaceAbove = rect.top;

      const margin = 12;
      const minHeight = 160;
      const preferredMaxHeight = 360;

      const isMobile = viewportWidth < 640;
      // On mobile, center the dropdown horizontally across the screen
      const left = isMobile
        ? Math.max(12, Math.round((viewportWidth - Math.min(360, viewportWidth - 24)) / 2))
        : Math.max(12, Math.min(rect.left, viewportWidth - 320 - 12));

      if (spaceBelow < 260 && spaceAbove > spaceBelow) {
        const available = spaceAbove - margin;
        setDropdownMaxHeight(Math.max(minHeight, Math.min(preferredMaxHeight, available)));
        setDropdownCoords({
          bottom: viewportHeight - rect.top + 6,
          left,
        });
      } else {
        const available = spaceBelow - margin;
        setDropdownMaxHeight(Math.max(minHeight, Math.min(preferredMaxHeight, available)));
        setDropdownCoords({
          top: rect.bottom + 6,
          left,
        });
      }
    };

    updatePosition();
    window.addEventListener("scroll", updatePosition, { passive: true, capture: true });
    window.addEventListener("resize", updatePosition);

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        containerRef.current &&
        !containerRef.current.contains(target) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  // Keep render output deterministic for SSR. The owning search flow restores
  // any saved/detected city after hydration and passes it through this prop.
  const currentDisplay = selectedCityName || "Select City";

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

      {/* =========================================================================
          UNIFIED DROPDOWN (Mobile & Desktop): Compact Floating Menu anchored to button
          ========================================================================= */}
      {mounted && isOpen && typeof document !== "undefined"
        ? createPortal(
            <div
              ref={dropdownRef}
              data-city-modal="true"
              style={{
                position: "fixed",
                top: dropdownCoords.top !== undefined ? `${dropdownCoords.top}px` : undefined,
                bottom: dropdownCoords.bottom !== undefined ? `${dropdownCoords.bottom}px` : undefined,
                left: `${dropdownCoords.left}px`,
                width: typeof window !== "undefined" && window.innerWidth < 640 ? "calc(100vw - 24px)" : "320px",
                maxWidth: "360px",
                maxHeight: `${dropdownMaxHeight}px`,
                zIndex: 9999,
              }}
              className="overflow-y-auto rounded-2xl border border-slate-200 bg-white p-3 shadow-2xl transition-all dark:border-slate-700 dark:bg-slate-900 shadow-slate-950/20 animate-in fade-in zoom-in-95 duration-150"
            >
              {/* Search box inside dropdown */}
              <div className="relative mb-2.5">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search Indian city..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-1.5 pl-8 pr-3 text-base text-slate-800 placeholder-slate-400 outline-none focus:border-rose-500 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 sm:text-xs"
                />
              </div>

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
                    Popular Indian Cities
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
            </div>,
            document.body
          )
        : null}
    </div>
  );
}
