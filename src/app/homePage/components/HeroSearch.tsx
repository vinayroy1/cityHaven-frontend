"use client";

import React from "react";
import { Building2, User, Search, Home, SlidersHorizontal, TreePine, ChevronDown, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { createPlacesSessionToken, fetchAutocompleteSuggestions, fetchPlaceDetails, type PlaceDetails } from "@/lib/googlePlaces";

export type ListingType = "SELL" | "RENT" | "PG" | "COMMERCIAL" | "PLOT";

type HeroSearchProps = {
  initialLocation?: string;
  initialListingType?: ListingType;
  onSearch?: (params: {
    location: string;
    listingType: ListingType;
    propertyType?: string;
    budgetMin?: string;
    budgetMax?: string;
    bhk?: string | null;
    furnished?: boolean;
    parking?: boolean;
  }) => void;
  onListingTypeChange?: (listingType: ListingType) => void;
  variant?: "default" | "embedded";
  eyebrowText?: string | null;
  className?: string;
  trailingActionDesktop?: React.ReactNode;
  trailingActionMobile?: React.ReactNode;
  enableFiltersButton?: boolean;
  onFiltersClick?: (params: {
    location: string;
    listingType: ListingType;
    propertyType?: string;
    budgetMin?: string;
    budgetMax?: string;
    bhk?: string | null;
    furnished?: boolean;
    parking?: boolean;
  }) => void;
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

const PROPERTY_TYPES = ["Any", "Apartment", "Independent House", "Builder Floor", "Villa", "Studio", "Office", "Retail"];

const BUDGET_OPTIONS = [
  { label: "Any", value: "" },
  { label: "₹10 L", value: "1000000" },
  { label: "₹25 L", value: "2500000" },
  { label: "₹50 L", value: "5000000" },
  { label: "₹1 Cr", value: "10000000" },
  { label: "₹2 Cr", value: "20000000" },
  { label: "₹5 Cr", value: "50000000" },
];

const BHK_OPTIONS = ["1 BHK", "2 BHK", "3 BHK", "4+ BHK"];

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
  const [propertyType, setPropertyType] = React.useState(PROPERTY_TYPES[0]);
  const [budgetMin, setBudgetMin] = React.useState("");
  const [budgetMax, setBudgetMax] = React.useState("");
  const [selectedBhk, setSelectedBhk] = React.useState<string | null>(null);
  const [isFurnished, setIsFurnished] = React.useState(false);
  const [hasParking, setHasParking] = React.useState(false);
  const [showMobileSheet, setShowMobileSheet] = React.useState(false);

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

  const performSearch = () => {
    const normalizedLocation = resolveLocation();
    if (normalizedLocation === null) return false;

    const payload = {
      location: normalizedLocation,
      listingType: activeTab,
      propertyType: propertyType !== "Any" ? propertyType : undefined,
      budgetMin: budgetMin || undefined,
      budgetMax: budgetMax || undefined,
      bhk: selectedBhk,
      furnished: isFurnished || undefined,
      parking: hasParking || undefined,
    };

    if (onSearch) {
      onSearch(payload);
      return true;
    }

    const params = new URLSearchParams();
    if (normalizedLocation) params.set("q", normalizedLocation);
    params.set("listingType", activeTab);
    if (payload.propertyType) params.set("propertyType", payload.propertyType);
    if (payload.budgetMin) params.set("budgetMin", payload.budgetMin);
    if (payload.budgetMax) params.set("budgetMax", payload.budgetMax);
    if (payload.bhk) params.set("bhk", payload.bhk);
    if (payload.furnished) params.set("furnished", "1");
    if (payload.parking) params.set("parking", "1");
    router.push(`/propertySearch?${params.toString()}`);
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch();
  };

  const handleOpenFilters = () => {
    const normalizedLocation = resolveLocation();
    if (normalizedLocation === null) return;
    const payload = {
      location: normalizedLocation,
      listingType: activeTab,
      propertyType: propertyType !== "Any" ? propertyType : undefined,
      budgetMin: budgetMin || undefined,
      budgetMax: budgetMax || undefined,
      bhk: selectedBhk,
      furnished: isFurnished || undefined,
      parking: hasParking || undefined,
    };
    if (onFiltersClick) {
      onFiltersClick(payload);
      return;
    }
    const params = new URLSearchParams();
    if (normalizedLocation) params.set("q", normalizedLocation);
    params.set("listingType", activeTab);
    if (payload.propertyType) params.set("propertyType", payload.propertyType);
    if (payload.budgetMin) params.set("budgetMin", payload.budgetMin);
    if (payload.budgetMax) params.set("budgetMax", payload.budgetMax);
    if (payload.bhk) params.set("bhk", payload.bhk);
    if (payload.furnished) params.set("furnished", "1");
    if (payload.parking) params.set("parking", "1");
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
        className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-800 shadow-sm transition hover:-translate-y-0.5"
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

  const getBudgetLabel = (value: string) => BUDGET_OPTIONS.find((option) => option.value === value)?.label ?? "";
  const budgetSummary = () => {
    if (!budgetMin && !budgetMax) return "Budget";
    if (budgetMin && budgetMax) return `${getBudgetLabel(budgetMin)} - ${getBudgetLabel(budgetMax)}`;
    if (budgetMin) return `Min ${getBudgetLabel(budgetMin)}`;
    return `Max ${getBudgetLabel(budgetMax)}`;
  };
  const appliedQuickFiltersCount =
    (selectedBhk ? 1 : 0) + (isFurnished ? 1 : 0) + (hasParking ? 1 : 0) + (propertyType !== "Any" ? 1 : 0) + (budgetMin || budgetMax ? 1 : 0);

  const handleBudgetMinChange = (value: string) => {
    setBudgetMin(value);
    if (budgetMax && value && Number(value) > Number(budgetMax)) {
      setBudgetMax("");
    }
  };

  const handleBudgetMaxChange = (value: string) => {
    if (budgetMin && value && Number(value) < Number(budgetMin)) {
      setBudgetMin("");
    }
    setBudgetMax(value);
  };

  const renderLocationInput = (context: "desktop" | "mobileSheet") => {
    const wrapperStyles =
      context === "desktop"
        ? "min-h-[56px] rounded-2xl border border-slate-200/80 bg-white/90 px-4"
        : "min-h-[48px] rounded-2xl border border-slate-200 bg-white px-3";
    return (
      <div className="relative">
        <label className={`${wrapperStyles} flex w-full items-center gap-2 shadow-[0_15px_35px_-25px_rgba(15,23,42,0.35)]`}>
          <Building2 className="h-4 w-4 text-rose-500" />
          <div className="flex flex-1 flex-col">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Location</span>
            <input
              className="w-full bg-transparent text-sm font-semibold text-slate-900 outline-none placeholder:font-normal placeholder:text-slate-400"
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
          </div>
        </label>
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
      </div>
    );
  };

  const closeMobileSheet = () => {
    setShowMobileSheet(false);
    setShowSuggestions(false);
  };

  const handleMobileApply = () => {
    const success = performSearch();
    if (success) closeMobileSheet();
  };

  const handleClearFilters = () => {
    setPropertyType(PROPERTY_TYPES[0]);
    setBudgetMin("");
    setBudgetMax("");
    setSelectedBhk(null);
    setIsFurnished(false);
    setHasParking(false);
  };

  return (
    <>
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

            <div className="space-y-4">
              <div className="md:hidden">
                <button
                  type="button"
                  onClick={() => setShowMobileSheet(true)}
                  className="flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left shadow-[0_18px_45px_-28px_rgba(15,23,42,0.45)] transition hover:-translate-y-0.5"
                >
                  <div className="flex flex-col">
                    <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Location</span>
                    <span className="text-base font-semibold text-slate-900">
                      {selectedTags.length > 0 ? selectedTags[0].label : "Search locality / society / landmark"}
                    </span>
                  </div>
                  <Search className="h-5 w-5 text-slate-500" />
                </button>
                <div className="mt-3 flex items-center gap-2">
                  <div className="flex flex-1 gap-2 overflow-x-auto pb-1">
                    {[
                      { key: "budget", label: budgetSummary(), active: Boolean(budgetMin || budgetMax) },
                      { key: "bhk", label: selectedBhk ?? "BHK", active: Boolean(selectedBhk) },
                      { key: "type", label: propertyType !== "Any" ? propertyType : "Type", active: propertyType !== "Any" },
                      { key: "furnished", label: "Furnished", active: isFurnished, onToggle: () => setIsFurnished((prev) => !prev) },
                      {
                        key: "more",
                        label: appliedQuickFiltersCount > 0 ? `Filters (${appliedQuickFiltersCount})` : "More",
                        active: appliedQuickFiltersCount > 0,
                      },
                    ].map((chip) => (
                      <button
                        key={chip.key}
                        type="button"
                        onClick={() => {
                          if (chip.key === "furnished") {
                            chip.onToggle?.();
                            return;
                          }
                          setShowMobileSheet(true);
                        }}
                        className={`inline-flex min-h-[36px] items-center rounded-full border px-3 text-sm font-semibold ${
                          chip.active ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 bg-white text-slate-800"
                        }`}
                      >
                        {chip.label}
                      </button>
                    ))}
                  </div>
                  {(trailingActionMobile ?? defaultMobileFiltersButton) && (
                    <div className="shrink-0">{trailingActionMobile ?? defaultMobileFiltersButton}</div>
                  )}
                </div>
              </div>

              <div className="hidden flex-col gap-3 md:flex">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="min-w-[240px] flex-1">{renderLocationInput("desktop")}</div>
                  <div className="flex min-w-[180px] flex-1 flex-col gap-1">
                    <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Property Type</span>
                    <div className="relative">
                      <select
                        className="h-14 w-full rounded-2xl border border-slate-200 bg-white px-4 pr-10 text-sm font-semibold text-slate-900 outline-none"
                        value={propertyType}
                        onChange={(e) => setPropertyType(e.target.value)}
                      >
                        {PROPERTY_TYPES.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                    </div>
                  </div>
                  <div className="flex min-w-[260px] flex-1 flex-col gap-1">
                    <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Budget</span>
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <select
                          className="h-14 w-full rounded-2xl border border-slate-200 bg-white px-4 pr-10 text-sm font-semibold text-slate-900 outline-none"
                          value={budgetMin}
                          onChange={(e) => handleBudgetMinChange(e.target.value)}
                        >
                          {BUDGET_OPTIONS.map((option) => (
                            <option key={option.label} value={option.value}>
                              {option.value ? `Min ${option.label}` : "No min"}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                      </div>
                      <span className="text-slate-400">-</span>
                      <div className="relative flex-1">
                        <select
                          className="h-14 w-full rounded-2xl border border-slate-200 bg-white px-4 pr-10 text-sm font-semibold text-slate-900 outline-none"
                          value={budgetMax}
                          onChange={(e) => handleBudgetMaxChange(e.target.value)}
                        >
                          {BUDGET_OPTIONS.map((option) => (
                            <option key={`${option.label}-max`} value={option.value}>
                              {option.value ? `Max ${option.label}` : "No max"}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="submit"
                      className="inline-flex h-14 items-center justify-center gap-2 rounded-full bg-slate-900 px-6 text-sm font-semibold text-white shadow-[0_18px_45px_-20px_rgba(15,23,42,0.45)] transition hover:-translate-y-0.5 hover:shadow-[0_20px_50px_-22px_rgba(15,23,42,0.6)]"
                    >
                      <Search className="h-4 w-4" />
                      Search
                    </button>
                    {(trailingActionDesktop ?? defaultDesktopFiltersButton) && (
                      <div className="shrink-0">{trailingActionDesktop ?? defaultDesktopFiltersButton}</div>
                    )}
                  </div>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-semibold text-slate-600">
                  <button
                    type="button"
                    onClick={handleOpenFilters}
                    className="inline-flex items-center gap-1 text-rose-600 transition hover:text-rose-700"
                  >
                    Advanced filters
                    <ChevronDown className="h-3 w-3" />
                  </button>
                  <div className="flex flex-wrap gap-2">
                    {[
                      {
                        key: "2bhk",
                        label: "2 BHK",
                        active: selectedBhk === "2 BHK",
                        onClick: () => setSelectedBhk((prev) => (prev === "2 BHK" ? null : "2 BHK")),
                      },
                      {
                        key: "furnished",
                        label: "Furnished",
                        active: isFurnished,
                        onClick: () => setIsFurnished((prev) => !prev),
                      },
                      {
                        key: "parking",
                        label: "Parking",
                        active: hasParking,
                        onClick: () => setHasParking((prev) => !prev),
                      },
                    ].map((chip) => (
                      <button
                        key={chip.key}
                        type="button"
                        onClick={chip.onClick}
                        className={`inline-flex items-center rounded-full px-4 py-1.5 text-xs ${
                          chip.active ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {chip.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

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
            </form>
          </div>
        </div>
      </section>

      {showMobileSheet && (
        <div className="fixed inset-0 z-50 flex flex-col bg-slate-900/40 backdrop-blur-[1px] md:hidden" role="dialog" aria-modal>
          <div className="absolute inset-0" onClick={closeMobileSheet} aria-hidden="true" />
          <div className="relative z-10 mt-auto rounded-t-[28px] bg-white p-5 shadow-2xl">
            <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-slate-200" />
            <div className="flex items-center justify-between">
              <p className="text-base font-semibold text-slate-900">Refine search</p>
              <div className="flex items-center gap-2">
                <button type="button" onClick={handleClearFilters} className="text-sm font-semibold text-slate-500">
                  Clear
                </button>
                <button
                  type="button"
                  onClick={closeMobileSheet}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-700"
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="mt-4 space-y-4">
              {renderLocationInput("mobileSheet")}
              <div className="space-y-2">
                <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Budget</span>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <select
                        className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 pr-8 text-sm font-semibold text-slate-900 outline-none"
                        value={budgetMin}
                        onChange={(e) => handleBudgetMinChange(e.target.value)}
                      >
                        {BUDGET_OPTIONS.map((option) => (
                          <option key={`mobile-${option.label}`} value={option.value}>
                            {option.value ? `Min ${option.label}` : "No min"}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                    </div>
                    <div className="relative flex-1">
                      <select
                        className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 pr-8 text-sm font-semibold text-slate-900 outline-none"
                        value={budgetMax}
                        onChange={(e) => handleBudgetMaxChange(e.target.value)}
                      >
                        {BUDGET_OPTIONS.map((option) => (
                          <option key={`mobile-${option.label}-max`} value={option.value}>
                            {option.value ? `Max ${option.label}` : "No max"}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {["₹25 L", "₹50 L", "₹1 Cr", "₹2 Cr"].map((preset) => {
                      const presetValue = BUDGET_OPTIONS.find((option) => option.label === preset)?.value ?? "";
                      return (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => {
                            setBudgetMin("");
                            setBudgetMax(presetValue);
                          }}
                          className="flex-1 rounded-2xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700"
                        >
                          Up to {preset}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">BHK preference</span>
                <div className="flex flex-wrap gap-2">
                  {BHK_OPTIONS.map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setSelectedBhk((prev) => (prev === option ? null : option))}
                      className={`flex-1 min-w-[90px] rounded-2xl border px-3 py-2 text-sm font-semibold ${
                        selectedBhk === option ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 bg-white text-slate-800"
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Property type</span>
                <div className="relative">
                  <select
                    className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 pr-8 text-sm font-semibold text-slate-900 outline-none"
                    value={propertyType}
                    onChange={(e) => setPropertyType(e.target.value)}
                  >
                    {PROPERTY_TYPES.map((type) => (
                      <option key={`mobile-${type}`} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                </div>
              </div>
              <div className="space-y-3">
                <label className="flex cursor-pointer items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3">
                  <span className="text-sm font-semibold text-slate-800">Furnished homes only</span>
                  <button
                    type="button"
                    onClick={() => setIsFurnished((prev) => !prev)}
                    className={`flex h-6 w-11 items-center rounded-full p-1 transition ${
                      isFurnished ? "bg-slate-900" : "bg-slate-200"
                    }`}
                    aria-pressed={isFurnished}
                  >
                    <span
                      className={`h-4 w-4 rounded-full bg-white transition ${isFurnished ? "translate-x-5" : ""}`}
                    />
                  </button>
                </label>
                <label className="flex cursor-pointer items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3">
                  <span className="text-sm font-semibold text-slate-800">With parking</span>
                  <button
                    type="button"
                    onClick={() => setHasParking((prev) => !prev)}
                    className={`flex h-6 w-11 items-center rounded-full p-1 transition ${hasParking ? "bg-slate-900" : "bg-slate-200"}`}
                    aria-pressed={hasParking}
                  >
                    <span className={`h-4 w-4 rounded-full bg-white transition ${hasParking ? "translate-x-5" : ""}`} />
                  </button>
                </label>
              </div>
              <button
                type="button"
                onClick={handleMobileApply}
                className="w-full rounded-2xl bg-slate-900 py-3 text-base font-semibold text-white shadow-lg shadow-slate-900/20 transition hover:-translate-y-0.5"
              >
                Apply search
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
