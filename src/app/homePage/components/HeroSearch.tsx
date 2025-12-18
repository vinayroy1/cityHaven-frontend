"use client";

import React from "react";
import { Building2, User, Search, Home, SlidersHorizontal, TreePine } from "lucide-react";
import { useRouter } from "next/navigation";
import { createPlacesSessionToken, fetchAutocompleteSuggestions, fetchPlaceDetails, type PlaceDetails } from "@/lib/googlePlaces";

export type ListingType = "SELL" | "RENT" | "PG" | "COMMERCIAL" | "PLOT";

type HeroSearchProps = {
  initialLocation?: string;
  initialListingType?: ListingType;
  onSearch?: (params: { location: string; listingType: ListingType }) => void;
  onListingTypeChange?: (listingType: ListingType) => void;
  variant?: "default" | "embedded";
  eyebrowText?: string | null;
  className?: string;
  trailingActionDesktop?: React.ReactNode;
  trailingActionMobile?: React.ReactNode;
  enableFiltersButton?: boolean;
  onFiltersClick?: (params: { location: string; listingType: ListingType }) => void;
};

type LocationSuggestion = { description: string; place_id: string };
type LocationTag = { label: string; placeId: string; city?: string; locality?: string };

const TABS: { key: ListingType; label: string }[] = [
  { key: "SELL", label: "Buy" },
  { key: "RENT", label: "Rent" },
  { key: "COMMERCIAL", label: "Commercial" },
  { key: "PLOT", label: "Plot" },
  { key: "PG", label: "PG / Co-living" },
];

const TAB_ICONS: Record<ListingType, React.ReactNode> = {
  SELL: <Home className="h-4 w-4 text-red-500" />,
  RENT: <Home className="h-4 w-4 text-amber-500" />,
  COMMERCIAL: <Building2 className="h-4 w-4 text-sky-600" />,
  PLOT: <TreePine className="h-4 w-4 text-emerald-600" />,
  PG: <User className="h-4 w-4 text-indigo-500" />,
};

export function HeroSearch({
  initialLocation = "",
  initialListingType = "SELL",
  onSearch,
  onListingTypeChange,
  variant = "default",
  eyebrowText = "Find your perfect home, PG, land or workspace in your city",
  className = "",
  trailingActionDesktop,
  trailingActionMobile,
  enableFiltersButton = false,
  onFiltersClick,
}: HeroSearchProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = React.useState<ListingType>(initialListingType);
  const [location, setLocation] = React.useState(initialLocation);
  const [suggestions, setSuggestions] = React.useState<LocationSuggestion[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = React.useState(false);
  const [showSuggestions, setShowSuggestions] = React.useState(false);
  const [selectionError, setSelectionError] = React.useState<string | null>(null);
  const [selectedTags, setSelectedTags] = React.useState<LocationTag[]>(initialLocation ? [{ label: initialLocation, placeId: "" }] : []);
  const [showMoreTags, setShowMoreTags] = React.useState(false);
  const [sessionToken, setSessionToken] = React.useState<string | null>(null);

  React.useEffect(() => {
    setLocation(initialLocation);
    if (initialLocation) {
      setSelectedTags((prev) => (prev.length ? prev : [{ label: initialLocation, placeId: "" }]));
    } else {
      setSelectedTags([]);
    }
  }, [initialLocation]);

  React.useEffect(() => {
    setActiveTab(initialListingType);
  }, [initialListingType]);

  React.useEffect(() => {
    const trimmed = location.trim();
    if (!trimmed || trimmed.length < 3) {
      setSuggestions([]);
      setLoadingSuggestions(false);
      return;
    }

    if (!sessionToken) {
      setSessionToken(createPlacesSessionToken());
    }

    let cancelled = false;
    setLoadingSuggestions(true);
    const timer = setTimeout(async () => {
      const token = sessionToken || createPlacesSessionToken();
      if (!sessionToken) setSessionToken(token);
      const results = await fetchAutocompleteSuggestions(trimmed, token);
      if (!cancelled) {
        setSuggestions(results);
        setLoadingSuggestions(false);
      }
    }, 350);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [location, sessionToken]);

  const buildQueryFromTags = () => selectedTags.map((tag) => tag.label).join(", ");

  const resolveLocation = () => {
    const normalizedLocation = location.trim();
    if (normalizedLocation) {
      setSelectionError("Please select from suggestions before searching.");
      setShowSuggestions(true);
      return null;
    }
    setSelectionError(null);
    return buildQueryFromTags();
  };

  const handleSelectSuggestion = async (suggestion: LocationSuggestion) => {
    setSelectionError(null);
    setShowSuggestions(false);
    setSuggestions([]);
    setLocation(suggestion.description);

    const details: PlaceDetails | null = await fetchPlaceDetails(suggestion.place_id, sessionToken ?? undefined);
    const locality = details?.locality || details?.subLocality || "";
    const city = details?.city || "";
    const label = locality || city || suggestion.description;
    const display = city && label && !label.toLowerCase().includes(city.toLowerCase()) ? `${label}, ${city}` : label;

    const finalLabel = display || suggestion.description;
    setSelectedTags((prev) => {
      const exists = prev.some((item) => item.placeId === suggestion.place_id || item.label.toLowerCase() === finalLabel.toLowerCase());
      if (exists) return prev;
      return [...prev, { label: finalLabel, placeId: suggestion.place_id, city: city || undefined, locality: locality || undefined }];
    });
    setLocation("");
    setSessionToken(null); // end session after place details call
  };

  const handleRemoveTag = (placeId: string, label: string) => {
    setSelectedTags((prev) => prev.filter((tag) => tag.placeId !== placeId && tag.label !== label));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const normalizedLocation = resolveLocation();
    if (normalizedLocation === null) return;
    if (onSearch) {
      onSearch({ location: normalizedLocation, listingType: activeTab });
      return;
    }

    const params = new URLSearchParams();
    if (normalizedLocation) params.set("q", normalizedLocation);
    params.set("listingType", activeTab);
    router.push(`/propertySearch?${params.toString()}`);
  };

  const handleOpenFilters = () => {
    const normalizedLocation = resolveLocation();
    if (normalizedLocation === null) return;
    if (onFiltersClick) {
      onFiltersClick({ location: normalizedLocation, listingType: activeTab });
      return;
    }
    const params = new URLSearchParams();
    if (normalizedLocation) params.set("q", normalizedLocation);
    params.set("listingType", activeTab);
    params.set("openFilters", "1");
    router.push(`/propertySearch?${params.toString()}`);
  };

  const handleTabChange = (tab: ListingType) => {
    setActiveTab(tab);
    onListingTypeChange?.(tab);
  };

  const isEmbedded = variant === "embedded";
  const sectionClasses = `${
    isEmbedded ? "relative z-30 w-full" : "relative z-30 mx-auto mt-10 max-w-5xl px-4 md:px-6"
  } ${className}`.trim();
  const cardClasses = isEmbedded
    ? "relative overflow-visible rounded-2xl border border-white/70 bg-white px-3 py-4 shadow-[0_24px_70px_-42px_rgba(15,23,42,0.45)] sm:px-4"
    : "relative overflow-visible rounded-[28px] border border-white/60 bg-white/90 shadow-[0_30px_90px_-40px_rgba(15,23,42,0.6)] backdrop-blur";
  const innerPadding = isEmbedded ? "px-2 py-3 sm:px-3" : "px-4 py-5 md:px-6";

  const defaultMobileFiltersButton =
    enableFiltersButton && !trailingActionMobile ? (
      <button
        type="button"
        onClick={handleOpenFilters}
        className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-800 shadow-sm transition hover:-translate-y-0.5"
        aria-label="Open filters"
      >
        <SlidersHorizontal className="h-4 w-4" />
      </button>
    ) : null;

  const defaultDesktopFiltersButton =
    enableFiltersButton && !trailingActionDesktop ? (
      <button
        type="button"
        onClick={handleOpenFilters}
        className="relative inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm transition hover:-translate-y-0.5"
      >
        <SlidersHorizontal className="h-4 w-4 text-slate-500" />
        Filters
      </button>
    ) : null;

  return (
    <section className={sectionClasses}>
      {!isEmbedded && (
        <div
          className="absolute inset-x-8 -top-10 h-40 rounded-[28px] bg-gradient-to-r from-rose-500/25 via-amber-400/20 to-emerald-400/25 blur-3xl"
          aria-hidden
        />
      )}
      <div className={cardClasses}>
        <div
          className="pointer-events-none absolute inset-0 opacity-90"
          style={{
            backgroundImage:
              "radial-gradient(circle at 12% 25%, rgba(244,63,94,0.12), transparent 28%), radial-gradient(circle at 80% 8%, rgba(248,113,113,0.18), transparent 24%), radial-gradient(circle at 82% 86%, rgba(16,185,129,0.14), transparent 26%)",
          }}
          aria-hidden
        />
        <div className={`relative z-10 ${innerPadding}`}>
          {eyebrowText && (
            <div className="flex flex-col gap-2">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-rose-600">{eyebrowText}</p>
            </div>
          )}

          <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
            <div className="flex items-center gap-2 overflow-x-auto pb-1 text-sm font-semibold text-slate-700">
              {TABS.map((tab) => {
                const icon = TAB_ICONS[tab.key];
                return (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => handleTabChange(tab.key)}
                    className={`flex items-center gap-2 rounded-full px-4 py-2 transition ${
                      activeTab === tab.key
                        ? "bg-slate-900 text-white shadow-md shadow-slate-900/20"
                        : "bg-white text-slate-800 hover:bg-slate-100"
                    }`}
                  >
                    {icon}
                    <span className="whitespace-nowrap">{tab.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="flex flex-col gap-3 md:flex-row md:items-start">
              <div className="flex-1 space-y-2">
                <label className="relative flex w-full items-center gap-2 rounded-2xl border border-slate-200/80 bg-white/80 px-4 py-3 shadow-[0_15px_35px_-25px_rgba(15,23,42,0.4)] transition hover:-translate-y-0.5 hover:border-rose-200">
                  <Building2 className="h-4 w-4 text-rose-500" />
                  <input
                    className="w-full bg-transparent pr-20 text-sm font-semibold text-slate-900 outline-none placeholder:font-normal placeholder:text-slate-400 md:pr-0"
                    placeholder={selectedTags.length ? "Add more areas" : "Search city, locality or landmark"}
                    value={location}
                    onChange={(e) => {
                      setLocation(e.target.value);
                      setSelectionError(null);
                      setShowSuggestions(true);
                    }}
                    onFocus={() => setShowSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 120)}
                    aria-label="Search locality, project, builder or landmark"
                  />
                  {showSuggestions && (suggestions.length > 0 || loadingSuggestions) && (
                    <div className="absolute left-0 right-0 top-[calc(100%+12px)] z-50 max-h-72 overflow-auto rounded-2xl border border-slate-200 bg-white shadow-2xl">
                      {loadingSuggestions && <p className="px-3 py-2 text-xs text-slate-500">Searching…</p>}
                      {!loadingSuggestions && suggestions.length === 0 && <p className="px-3 py-2 text-xs text-slate-500">No matches found</p>}
                      {suggestions.map((suggestion) => (
                        <button
                          key={suggestion.place_id}
                          type="button"
                          className="flex w-full flex-col border-b border-slate-100 px-3 py-2 text-left text-sm last:border-b-0 hover:bg-slate-50"
                          onMouseDown={(event) => event.preventDefault()}
                          onClick={() => handleSelectSuggestion(suggestion)}
                        >
                          <span className="font-semibold text-slate-900">{suggestion.description}</span>
                          <span className="text-xs text-slate-500">Pick from Google Maps</span>
                        </button>
                      ))}
                    </div>
                  )}
                  <div className="absolute right-2 flex items-center gap-2 md:hidden">
                    <button
                      type="submit"
                      className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow"
                      aria-label="Search"
                    >
                      <Search className="h-4 w-4" />
                    </button>
                    {trailingActionMobile ?? defaultMobileFiltersButton}
                  </div>
                </label>

                {selectedTags.length > 0 && (
                  <div className="relative inline-flex flex-wrap items-center gap-2 rounded-2xl bg-white/80 px-2 py-1">
                    <span
                      key={`${selectedTags[0].placeId}-${selectedTags[0].label}`}
                      className="group inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-800"
                    >
                      {selectedTags[0].label}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(selectedTags[0].placeId, selectedTags[0].label)}
                        className="rounded-full bg-white/70 p-1 text-slate-500 transition hover:bg-white hover:text-slate-800"
                        aria-label={`Remove ${selectedTags[0].label}`}
                      >
                        ×
                      </button>
                    </span>
                    {selectedTags.length > 1 && (
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setShowMoreTags((open) => !open)}
                          onBlur={() => setTimeout(() => setShowMoreTags(false), 100)}
                          className="inline-flex items-center rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white shadow-sm transition hover:-translate-y-0.5"
                          aria-label={`View ${selectedTags.length - 1} more locations`}
                        >
                          +{selectedTags.length - 1} more
                        </button>
                        {showMoreTags && (
                          <div className="absolute z-50 mt-2 min-w-[220px] rounded-xl border border-slate-200 bg-white p-2 shadow-2xl">
                            {selectedTags.slice(1).map((tag) => (
                              <div
                                key={`${tag.placeId}-${tag.label}`}
                                className="flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50"
                              >
                                <span className="line-clamp-1">{tag.label}</span>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveTag(tag.placeId, tag.label)}
                                  className="rounded-full bg-slate-100 px-2 py-1 text-slate-600 transition hover:bg-slate-200"
                                  aria-label={`Remove ${tag.label}`}
                                >
                                  Remove
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {selectionError && <p className="px-1 text-xs font-medium text-rose-600">{selectionError}</p>}
              </div>

              <div className="hidden items-center gap-2 md:flex">
                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_45px_-20px_rgba(15,23,42,0.45)] transition hover:-translate-y-0.5 hover:shadow-[0_20px_50px_-22px_rgba(15,23,42,0.6)]"
                >
                  <Search className="h-4 w-4" />
                  <span className="hidden md:inline">Search</span>
                </button>
                {trailingActionDesktop ?? defaultDesktopFiltersButton}
              </div>
            </div>

          </form>
        </div>
      </div>
    </section>
  );
}
