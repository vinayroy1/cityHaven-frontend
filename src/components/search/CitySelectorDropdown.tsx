"use client";

import React from "react";
import { createPortal } from "react-dom";
import { ChevronDown, Crosshair, Loader2, MapPin, Search, Check, Sparkles, X } from "lucide-react";
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
  { id: 11, name: "Delhi", slug: "delhi", state: "Delhi", isPopular: true },
  { id: 1363, name: "Gurugram", slug: "gurugram", state: "Haryana", isPopular: true },
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

interface Props {
  selectedCityName?: string;
  onSelectCity: (city: CityItem) => void;
  className?: string;
  compact?: boolean;
}

export function CitySelectorDropdown({ selectedCityName = "Bengaluru", onSelectCity, className = "", compact = false }: Props) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const [popularCities, setPopularCities] = React.useState<CityItem[]>(DEFAULT_POPULAR_CITIES);
  const [searchResults, setSearchResults] = React.useState<CityItem[]>([]);
  const [isDetecting, setIsDetecting] = React.useState(false);
  const [placement, setPlacement] = React.useState<"bottom" | "top">("bottom");
  const [dropdownMaxHeight, setDropdownMaxHeight] = React.useState<number>(360);
  const [dropdownCoords, setDropdownCoords] = React.useState<{ top?: number; bottom?: number; left: number }>({ left: 0 });
  const [mobileViewportStyle, setMobileViewportStyle] = React.useState<React.CSSProperties>({});
  const mobileSheetHeightRef = React.useRef<number>(0);

  const containerRef = React.useRef<HTMLDivElement>(null);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Bulletproof mobile sheet positioning with visualViewport
  React.useEffect(() => {
    if (!isOpen || typeof window === "undefined" || window.innerWidth >= 640) return;

    // Prevent background scrolling while modal is open
    const prevOverflow = document.body.style.overflow;
    const prevTouchAction = document.body.style.touchAction;
    document.body.style.overflow = "hidden";
    document.body.style.touchAction = "none";

    const updateMobileViewport = () => {
      const vv = window.visualViewport;
      if (vv) {
        setMobileViewportStyle({
          position: "fixed",
          top: `${vv.offsetTop}px`,
          left: `${vv.offsetLeft}px`,
          width: `${vv.width}px`,
          height: `${vv.height}px`,
        });
      } else {
        setMobileViewportStyle({
          position: "fixed",
          top: "0px",
          left: "0px",
          width: "100%",
          height: "100dvh",
        });
      }
    };

    updateMobileViewport();
    const vv = window.visualViewport;
    if (vv) {
      vv.addEventListener("resize", updateMobileViewport);
      vv.addEventListener("scroll", updateMobileViewport);
    }
    window.addEventListener("resize", updateMobileViewport);

    return () => {
      document.body.style.overflow = prevOverflow;
      document.body.style.touchAction = prevTouchAction;

      if (vv) {
        vv.removeEventListener("resize", updateMobileViewport);
        vv.removeEventListener("scroll", updateMobileViewport);
      }
      window.removeEventListener("resize", updateMobileViewport);
    };
  }, [isOpen]);

  // 1. Fetch live popular cities from API, filtering strictly for Indian metro cities
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
            const key = c.name?.toLowerCase().trim();
            // Strictly exclude foreign cities (Auckland, Austin, Christchurch, etc.)
            if (key && KNOWN_INDIAN_METROS.has(key) && !seen.has(key)) {
              seen.add(key);
              unique.push(c);
            }
          }
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

  // 3. Desktop Placement & Viewport Boundary calculation (Escaped directly to document.body)
  React.useEffect(() => {
    if (!isOpen) return;

    const updatePosition = () => {
      if (!containerRef.current) return;
      if (typeof window === "undefined" || window.innerWidth < 640) return; // Mobile uses fixed bottom sheet drawer

      const rect = containerRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const spaceBelow = viewportHeight - rect.bottom;
      const spaceAbove = rect.top;

      const margin = 16;
      const minHeight = 160;
      const preferredMaxHeight = 360;

      // Keep within left/right viewport boundaries
      const left = Math.max(12, Math.min(rect.left, window.innerWidth - 336));

      if (spaceBelow < 280 && spaceAbove > spaceBelow) {
        setPlacement("top");
        const available = spaceAbove - margin;
        setDropdownMaxHeight(Math.max(minHeight, Math.min(preferredMaxHeight, available)));
        setDropdownCoords({
          bottom: viewportHeight - rect.top + 8,
          left,
        });
      } else {
        setPlacement("bottom");
        const available = spaceBelow - margin;
        setDropdownMaxHeight(Math.max(minHeight, Math.min(preferredMaxHeight, available)));
        setDropdownCoords({
          top: rect.bottom + 8,
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
        window.innerWidth >= 640 &&
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

      {/* =========================================================================
          MOBILE VIEW (< 640px): Native Bottom Sheet Drawer with Backdrop (Portaled to body)
          ========================================================================= */}
      {mounted && isOpen && typeof document !== "undefined"
        ? createPortal(
            <div
              style={mobileViewportStyle}
              className="fixed left-0 top-0 z-[9999] flex h-full w-full flex-col justify-end overflow-hidden sm:hidden"
            >
              {/* Backdrop */}
              <div
                className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-150"
                onClick={() => setIsOpen(false)}
                aria-hidden="true"
              />

              {/* Bottom Sheet Container: sized to visualViewport */}
              <div
                data-city-modal="true"
                className="relative z-10 flex max-h-[88%] w-full shrink-0 flex-col rounded-t-3xl border-t border-slate-200 bg-white p-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] shadow-2xl dark:border-slate-800 dark:bg-slate-900 animate-in slide-in-from-bottom duration-200"
              >
                {/* Grab handle indicator */}
                <div className="mx-auto mb-3 h-1.5 w-12 shrink-0 rounded-full bg-slate-300 dark:bg-slate-700" />

                {/* Mobile Header */}
                <div className="mb-3.5 flex shrink-0 items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-rose-500" />
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">Choose Your City</h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:text-slate-400"
                    aria-label="Close"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Search input with quick clear button */}
                <div className="relative mb-3 shrink-0">
                  <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search Indian city..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-9 text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-rose-500 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  />
                  {search.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setSearch("")}
                      className="absolute right-3 top-3 rounded-full p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                      aria-label="Clear search"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>

                {/* GPS Detect Action */}
                <button
                  type="button"
                  onClick={handleDetectLocation}
                  disabled={isDetecting}
                  className="mb-3.5 flex shrink-0 w-full items-center gap-2.5 rounded-2xl bg-rose-50 px-3.5 py-2.5 text-xs font-semibold text-rose-700 transition hover:bg-rose-100 active:scale-[0.99] disabled:opacity-50 dark:bg-rose-950/40 dark:text-rose-300"
                >
                  {isDetecting ? (
                    <Loader2 className="h-4 w-4 animate-spin text-rose-600" />
                  ) : (
                    <Crosshair className="h-4 w-4 text-rose-600 dark:text-rose-400" />
                  )}
                  <span>{isDetecting ? "Detecting nearest city..." : "Detect my current location"}</span>
                </button>

                {/* Scrollable Content Body (stable height, scrolls internally without resizing container) */}
                <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain pr-0.5">
                  {search.trim().length > 0 ? (
                    <div className="space-y-1">
                      <p className="px-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">Search Results</p>
                      {searchResults.length === 0 ? (
                        <div className="py-8 text-center">
                          <p className="text-xs text-slate-500">No cities found matching &quot;{search}&quot;</p>
                          <p className="mt-1 text-[11px] text-slate-400">Try typing another Indian metro or capital</p>
                        </div>
                      ) : (
                        searchResults.map((c) => (
                          <button
                            key={`m_search_${c.id}_${c.name}`}
                            type="button"
                            onClick={() => {
                              onSelectCity(c);
                              setIsOpen(false);
                              setSearch("");
                            }}
                            className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                          >
                            <span>{c.name} {c.state ? `(${c.state})` : ""}</span>
                            {selectedCityName?.toLowerCase() === c.name.toLowerCase() && (
                              <Check className="h-4 w-4 text-rose-600" />
                            )}
                          </button>
                        ))
                      )}
                    </div>
                  ) : (
                    /* Popular Indian Metros Grid */
                    <div>
                      <p className="mb-2 flex items-center gap-1.5 px-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                        Popular Indian Cities
                      </p>
                      <div className="grid grid-cols-2 gap-2 pb-2">
                        {popularCities.map((c) => {
                          const isSelected = selectedCityName?.toLowerCase() === c.name.toLowerCase();
                          return (
                            <button
                              key={`m_pop_${c.id}_${c.name}`}
                              type="button"
                              onClick={() => {
                                onSelectCity(c);
                                setIsOpen(false);
                              }}
                              className={`flex items-center justify-between rounded-2xl px-3.5 py-3 text-left text-xs font-bold transition ${
                                isSelected
                                  ? "bg-rose-600 text-white shadow-xs"
                                  : "bg-slate-50 text-slate-800 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                              }`}
                            >
                              <span className="truncate">{c.name}</span>
                              {isSelected && <Check className="h-3.5 w-3.5 shrink-0" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>,
            document.body
          )
        : null}

      {/* =========================================================================
          DESKTOP VIEW (sm+): Compact Floating Dropdown Menu (Portaled to body)
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
                maxHeight: `${dropdownMaxHeight}px`,
                zIndex: 9999,
              }}
              className="hidden sm:block w-80 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-3 shadow-2xl transition-all dark:border-slate-700 dark:bg-slate-900 shadow-slate-950/20 animate-in fade-in zoom-in-95 duration-150"
            >
              {/* Search box inside dropdown */}
              <div className="relative mb-2.5">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search Indian city..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
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
