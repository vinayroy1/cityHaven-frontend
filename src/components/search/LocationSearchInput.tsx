"use client";

import React from "react";
import { Building2, LocateFixed, MapPin, Search, Sparkles, X } from "lucide-react";
import {
  fetchAwasioSuggestions,
  type AwasioSuggestion,
} from "@/lib/awasioSuggestions";
import { API_ENDPOINTS } from "@/constants/api-endpoints";
import { apiFetch } from "@/lib/api/query";
import type { PropertySearchItem, PropertySearchResponse } from "@/types/propertySearch.types";
import type { IntentKey, LocalityTag } from "./searchQuery";
import { detectUserLocation, getCurrentCluster, requestGpsLocation } from "@/lib/geo/geoService";
import { generateIntentSuggestions, type IntentSuggestion } from "@/lib/search/intentParser";
import { getClusterCities } from "@/config/regionalClusters";

type Suggestion =
  | { type: "intent"; id: string; title: string; meta?: string; params: IntentSuggestion["params"] }
  | { type: "awasio"; suggestion: AwasioSuggestion }
  | { type: "inventory"; description: string; keyword: string; meta?: string };

type Props = {
  localities: LocalityTag[];
  keyword: string;
  cityName?: string;
  activeIntent?: IntentKey;
  listingType?: string;
  onChange: (next: { localities: LocalityTag[]; keyword: string }) => void;
  onSelectIntent?: (params: IntentSuggestion["params"]) => void;
  onSubmit?: () => void;
  autoFocus?: boolean;
  placeholder?: string;
};

export function LocationSearchInput({
  localities,
  keyword,
  cityName,
  activeIntent,
  listingType,
  onChange,
  onSelectIntent,
  onSubmit,
  autoFocus,
  placeholder = "Search city, locality, project or landmark",
}: Props) {
  const [text, setText] = React.useState(keyword);
  const [suggestions, setSuggestions] = React.useState<Suggestion[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [open, setOpen] = React.useState(false);

  const [cluster, setCluster] = React.useState(getCurrentCluster());
  const [detectingGps, setDetectingGps] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
  }, [autoFocus]);

  React.useEffect(() => {
    setText(keyword);
  }, [keyword]);

  // Detect location in background on mount (zero-friction IP detection)
  React.useEffect(() => {
    detectUserLocation().then(() => {
      setCluster(getCurrentCluster());
    });
  }, []);

  React.useEffect(() => {
    // Only search autocomplete suggestions when the user is actively interacting with the input
    if (!open) return;

    const trimmed = text.trim();
    if (trimmed.length < 2) {
      setSuggestions([]);
      setLoading(false);
      setError(null);
      return;
    }

    const effectiveCity = cityName?.trim() || "Bengaluru";
    const currentIntent: IntentKey = activeIntent ?? (listingType === "RENT" ? "RENT" : listingType === "PG" ? "PG" : "BUY");
    // 1. Generate intent suggestions ONLY for the selected city
    const intentItems = generateIntentSuggestions(trimmed, currentIntent, cluster, 6)
      .filter((item) => !effectiveCity || item.params.cityName?.toLowerCase() === effectiveCity.toLowerCase());
    if (intentItems.length > 0) {
      setSuggestions(intentItems.map((item) => ({ ...item, description: item.title })));
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    const timer = setTimeout(async () => {
      try {
        const suggestResults = await fetchAwasioSuggestions(trimmed, { limit: 20, maxPerGroup: 20, city: effectiveCity, types: ["LOCALITY", "PROJECT"] });

        if (!cancelled) {
          const chSuggestions: Suggestion[] = (suggestResults.data || [])
            .filter((s: AwasioSuggestion) => s.type !== "CITY")
            .map((s: AwasioSuggestion) => ({ type: "awasio" as const, suggestion: s }));

          // Instant Merge: Intent templates → Awasio local master dataset suggestions
          setSuggestions([...intentItems, ...chSuggestions].slice(0, 20));
        }
      } catch (err) {
        if (!cancelled) {
          if (intentItems.length === 0) {
            setSuggestions([]);
            setError(err instanceof Error ? err.message : "Could not load location suggestions.");
          }
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }, 60);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [text, activeIntent, listingType, cluster, cityName, open]);

  const handleSelectIntent = (s: Suggestion & { type: "intent" }) => {
    setOpen(false);
    setSuggestions([]);
    setText("");

    if (onSelectIntent) {
      onSelectIntent(s.params);
      return;
    }

    const targetCity = s.params.cityName;
    if (targetCity && !localities.some((l) => l.label.toLowerCase() === targetCity.toLowerCase())) {
      onChange({
        keyword: "",
        localities: [...localities, { label: targetCity, city: targetCity }],
      });
    }
    onSubmit?.();
  };

  const addSuggestion = (s: Suggestion) => {
    if (s.type === "intent") {
      handleSelectIntent(s);
      return;
    }

    setOpen(false);
    setSuggestions([]);
    setText("");

    let label = "";
    if (s.type === "awasio") {
      // Prefer locality name, then city name
      label = s.suggestion.location.locality || s.suggestion.title || "";
    } else if (s.type === "inventory") {
      label = s.keyword || s.description;
    }

    if (!label) return;

    if (localities.some((l) => l.label.toLowerCase() === label.toLowerCase())) {
      inputRef.current?.focus();
      return;
    }

    onChange({
      keyword: "",
      localities: [
        ...localities,
        {
          label,
          city: s.type === "awasio" ? (s.suggestion.location.city || undefined) : undefined,
        },
      ],
    });

    inputRef.current?.focus();
  };

  const handleDetectCurrentLocation = async () => {
    setDetectingGps(true);
    try {
      const profile = await requestGpsLocation();
      if (profile && profile.city) {
        setCluster(getCurrentCluster());
        const label = profile.city;
        if (!localities.some((l) => l.label.toLowerCase() === label.toLowerCase())) {
          onChange({
            keyword: "",
            localities: [...localities, { label, city: label }],
          });
        }
        setOpen(false);
        setText("");
      }
    } finally {
      setDetectingGps(false);
    }
  };

  const removeLocality = (label: string) => {
    onChange({ keyword, localities: localities.filter((l) => l.label !== label) });
  };

  const addMultipleLocalityChips = (labels: string[]) => {
    const cleanList = labels
      .map((l) => l.trim())
      .filter((l) => l.length > 0 && !localities.some((existing) => existing.label.toLowerCase() === l.toLowerCase()));
    if (!cleanList.length) return;
    const newItems = cleanList.map((label) => ({ label, city: label }));
    onChange({
      keyword: "",
      localities: [...localities, ...newItems],
    });
  };

  const commitKeyword = () => {
    const trimmed = text.trim();
    if (trimmed) {
      onChange({ localities, keyword: trimmed });
      setOpen(false);
      return true;
    }
    return false;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val.includes(",")) {
      const parts = val.split(",");
      const chipsToAdd = parts.slice(0, -1).map((s) => s.trim()).filter(Boolean);
      const remainingText = parts[parts.length - 1];
      if (chipsToAdd.length > 0) {
        addMultipleLocalityChips(chipsToAdd);
      }
      setText(remainingText);
      return;
    }
    setText(val);
    onChange({ localities, keyword: val });
    setOpen(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const trimmed = text.trim();
      if (trimmed.includes(",")) {
        const parts = trimmed.split(",").map((s) => s.trim()).filter(Boolean);
        addMultipleLocalityChips(parts);
        setText("");
        setOpen(false);
        onSubmit?.();
        return;
      }
      if (trimmed) {
        const clean = trimmed;
        if (!localities.some((l) => l.label.toLowerCase() === clean.toLowerCase())) {
          onChange({
            keyword: "",
            localities: [...localities, { label: clean, city: clean }],
          });
        }
        setText("");
        setOpen(false);
        onSubmit?.();
        return;
      }
      commitKeyword();
      onSubmit?.();
    }
    if (e.key === "Backspace" && !text && localities.length) {
      removeLocality(localities[localities.length - 1].label);
    }
  };

  const [placement, setPlacement] = React.useState<"bottom" | "top">("bottom");
  const [dropdownMaxHeight, setDropdownMaxHeight] = React.useState<number>(320);
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!open) return;
    const calculatePosition = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const spaceBelow = viewportHeight - rect.bottom;
      const spaceAbove = rect.top;

      if (spaceBelow < 260 && spaceAbove > spaceBelow) {
        setPlacement("top");
        setDropdownMaxHeight(Math.min(320, Math.max(140, spaceAbove - 16)));
      } else {
        setPlacement("bottom");
        setDropdownMaxHeight(Math.min(320, Math.max(140, spaceBelow - 16)));
      }
    };

    calculatePosition();
    window.addEventListener("scroll", calculatePosition, { passive: true });
    window.addEventListener("resize", calculatePosition);
    return () => {
      window.removeEventListener("scroll", calculatePosition);
      window.removeEventListener("resize", calculatePosition);
    };
  }, [open]);

  const clusterCities = getClusterCities(cluster, 5);

  return (
    <div className="relative" ref={containerRef}>
      <div className="flex flex-wrap items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-2 py-1.5 focus-within:border-slate-400 focus-within:ring-2 focus-within:ring-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:focus-within:border-rose-400 dark:focus-within:ring-rose-500/20">
        <MapPin className="ml-1 h-4 w-4 shrink-0 text-rose-500" />

        {localities.map((l) => (
          <span
            key={l.label}
            className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-800 dark:bg-slate-700 dark:text-slate-200"
          >
            {l.label}
            <button
              type="button"
              onClick={() => removeLocality(l.label)}
              aria-label={`Remove ${l.label}`}
              className="rounded-full p-0.5 text-slate-500 hover:bg-white hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-600 dark:hover:text-white"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}

        <input
          ref={inputRef}
          className="min-w-[8rem] flex-1 bg-transparent px-1 py-1 text-sm text-slate-900 outline-none placeholder:text-slate-400 dark:text-slate-100 dark:placeholder:text-slate-500"
          placeholder={localities.length || keyword ? "Add another area" : placeholder}
          value={text}
          onChange={handleInputChange}
          onFocus={() => {
            setOpen(true);
            setTimeout(() => {
              containerRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
            }, 100);
          }}
          onBlur={() => setTimeout(() => setOpen(false), 200)}
          onKeyDown={handleKeyDown}
          autoComplete="off"
        />
      </div>

      {open && (
        <div
          style={{ maxHeight: `${dropdownMaxHeight}px` }}
          className={`absolute left-0 right-0 z-50 overflow-y-auto rounded-xl border border-slate-200 bg-white py-1 shadow-xl transition-all dark:border-slate-700 dark:bg-slate-900 ${
            placement === "top"
              ? "bottom-[calc(100%+6px)] shadow-slate-950/20"
              : "top-[calc(100%+6px)] shadow-slate-950/15"
          }`}
        >
          {/* Empty text state: GPS Location & Regional Popular Cities */}
          {text.trim().length < 2 && (
            <div className="p-2 space-y-2">
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={handleDetectCurrentLocation}
                className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-xs font-semibold text-rose-600 hover:bg-rose-50/80 dark:text-rose-400 dark:hover:bg-rose-950/40 transition"
              >
                <LocateFixed className={`h-4 w-4 shrink-0 ${detectingGps ? "animate-spin" : ""}`} />
                <span>{detectingGps ? "Detecting location..." : "Use my current location"}</span>
              </button>

              
            </div>
          )}

          {loading && suggestions.length === 0 && (
            <p className="px-3 py-2 text-xs text-slate-500 dark:text-slate-400">Searching locations…</p>
          )}

          {!loading && error && suggestions.length === 0 && (
            <p className="px-3 py-2 text-xs text-rose-600 dark:text-rose-400">{error}</p>
          )}

          {/* Render suggestions */}
          {suggestions.map((s, idx) => {
            if (s.type === "intent") {
              return (
                <button
                  key={`intent:${s.id || idx}`}
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => handleSelectIntent(s)}
                  className="group flex w-full items-center justify-between gap-2 px-3 py-2.5 text-left text-sm hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors"
                >
                  <div className="flex min-w-0 items-center gap-2.5">
                    <Search className="h-3.5 w-3.5 shrink-0 text-slate-400 group-hover:text-rose-600 dark:text-slate-500 dark:group-hover:text-rose-400 transition-colors" />
                    <span className="truncate text-slate-800 dark:text-slate-200">{s.title}</span>
                  </div>
                  <Sparkles className="h-3 w-3 shrink-0 text-amber-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              );
            }

            if (s.type === "awasio") {
              const sg = s.suggestion;
              const Icon = sg.type === "CITY" ? Building2 : sg.type === "PROJECT" ? Building2 : MapPin;
              return (
                <button
                  key={sg.id}
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => void addSuggestion(s)}
                  className="group flex w-full items-center justify-between gap-2 px-3 py-2 text-left hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors"
                >
                  <div className="flex min-w-0 items-center gap-2">
                    <Icon className="h-3.5 w-3.5 shrink-0 text-slate-400 group-hover:text-rose-500 dark:text-slate-500 transition-colors" />
                    <span className="min-w-0">
                      <span className="block truncate text-sm text-slate-800 dark:text-slate-200">{sg.title}</span>
                      <span className="block truncate text-xs text-slate-400 dark:text-slate-500">{sg.subtitle}</span>
                    </span>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-0.5">
                    <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60">
                      {sg.badge}
                    </span>
                    {sg.metrics?.formattedPriceSqft && (
                      <span className="text-[10px] text-slate-400 dark:text-slate-500">
                        {sg.metrics.formattedPriceSqft}
                      </span>
                    )}
                  </div>
                </button>
              );
            }

            return (
              <button
                key={`inventory:${s.description}`}
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => void addSuggestion(s)}
                className="group flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors"
              >
                <div className="flex min-w-0 items-center gap-2">
                  <Building2 className="h-3.5 w-3.5 shrink-0 text-rose-500" />
                  <span className="min-w-0">
                    <span className="block truncate text-slate-800 dark:text-slate-200">{s.description}</span>
                    {s.meta && <span className="block truncate text-xs text-slate-500 dark:text-slate-400">{s.meta}</span>}
                  </span>
                </div>
                <span className="shrink-0 text-[10px] font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  Project
                </span>
              </button>
            );
          })}

          {text.trim().length >= 2 && (
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                commitKeyword();
                onSubmit?.();
              }}
              className="flex w-full items-center gap-2 border-t border-slate-100 px-3 py-2 text-left text-sm hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800"
            >
              <Search className="h-3.5 w-3.5 shrink-0 text-slate-400" />
              <span className="text-slate-800 dark:text-slate-200">
                Search <span className="font-semibold text-rose-600 dark:text-rose-400">&ldquo;{text.trim()}&rdquo;</span> as keyword
              </span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function inventorySuggestions(items: PropertySearchItem[], query: string): Suggestion[] {
  const seen = new Set<string>();
  const output: Suggestion[] = [];
  const normalizedQuery = query.toLowerCase();

  for (const item of items) {
    const candidates = [
      { label: item.societyOrProjectName, meta: [item.locality, item.cityName].filter(Boolean).join(", ") },
      { label: item.locality, meta: item.cityName || undefined },
      { label: item.subLocality, meta: [item.locality, item.cityName].filter(Boolean).join(", ") },
      { label: item.title, meta: [item.locality, item.cityName].filter(Boolean).join(", ") },
    ];

    for (const candidate of candidates) {
      const label = candidate.label?.trim();
      if (!label) continue;
      const key = label.toLowerCase();
      if (seen.has(key)) continue;
      if (!key.includes(normalizedQuery) && !normalizedQuery.includes(key)) continue;
      seen.add(key);
      output.push({
        type: "inventory",
        description: label,
        keyword: label,
        meta: candidate.meta,
      });
      break;
    }
  }

  return output;
}

export function cleanPlaceLabel(description: string): string {
  if (!description) return "";
  const parts = description.split(",").map((p) => p.trim()).filter(Boolean);
  // Strip trailing "India" if present
  if (parts.length > 1 && parts[parts.length - 1].toLowerCase() === "india") {
    parts.pop();
  }
  // If there are 3 or more parts remaining (e.g. ["DLF Phase 2", "Sector 25", "Gurugram"]),
  // keep the first 2 parts (locality + city/area) for a concise chip label
  if (parts.length > 2) {
    return parts.slice(0, 2).join(", ");
  }
  return parts.join(", ");
}
