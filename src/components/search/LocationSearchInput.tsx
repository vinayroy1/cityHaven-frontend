"use client";

import React from "react";
import { MapPin, Search, X } from "lucide-react";
import {
  createPlacesSessionToken,
  fetchAutocompleteSuggestions,
  fetchPlaceDetails,
  type PlaceDetails,
} from "@/lib/googlePlaces";
import { API_ENDPOINTS } from "@/constants/api-endpoints";
import { apiFetch } from "@/lib/api/query";
import type { PropertySearchItem, PropertySearchResponse } from "@/types/propertySearch.types";
import type { LocalityTag } from "./searchQuery";

type Suggestion =
  | { type: "place"; description: string; place_id: string }
  | { type: "inventory"; description: string; keyword: string; meta?: string };

type Props = {
  localities: LocalityTag[];
  keyword: string;
  cityName?: string;
  onChange: (next: { localities: LocalityTag[]; keyword: string }) => void;
  onSubmit?: () => void;
  autoFocus?: boolean;
  placeholder?: string;
};

export function LocationSearchInput({
  localities,
  keyword,
  cityName,
  onChange,
  onSubmit,
  autoFocus,
  placeholder = "Search city, locality, project or landmark",
}: Props) {
  const [text, setText] = React.useState(keyword);
  const [suggestions, setSuggestions] = React.useState<Suggestion[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [open, setOpen] = React.useState(false);
  const [sessionToken, setSessionToken] = React.useState<string | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
  }, [autoFocus]);

  React.useEffect(() => {
    const trimmed = text.trim();
    if (trimmed.length < 3) {
      setSuggestions([]);
      setLoading(false);
      setError(null);
      return;
    }
    let token = sessionToken;
    if (!token) {
      token = createPlacesSessionToken();
      setSessionToken(token);
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    const timer = setTimeout(async () => {
      try {
        const [placeResults, inventoryResults] = await Promise.allSettled([
          fetchAutocompleteSuggestions(trimmed, token ?? undefined),
          apiFetch<PropertySearchResponse>({
            url: API_ENDPOINTS.propertyListing.search,
            params: { q: trimmed, cityName, pageSize: 6 },
          }),
        ]);
        if (!cancelled) {
          const inventory = inventoryResults.status === "fulfilled" ? inventorySuggestions(inventoryResults.value.items ?? [], trimmed) : [];
          const places = placeResults.status === "fulfilled" ? placeResults.value.map((item) => ({ ...item, type: "place" as const })) : [];
          setSuggestions([...inventory, ...places].slice(0, 8));
        }
      } catch (err) {
        if (!cancelled) {
          setSuggestions([]);
          setError(err instanceof Error ? err.message : "Could not load location suggestions.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }, 300);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [text, sessionToken]);

  const addSuggestion = async (s: Suggestion) => {
    setOpen(false);
    setSuggestions([]);
    setText("");
    if (s.type === "inventory") {
      onChange({ localities, keyword: s.keyword });
      onSubmit?.();
      return;
    }
    const details: PlaceDetails | null = await fetchPlaceDetails(s.place_id, sessionToken ?? undefined);
    setSessionToken(null);
    const locality = details?.locality || details?.subLocality || "";
    const city = details?.city || "";
    const base = locality || city || s.description;
    const label = city && base && !base.toLowerCase().includes(city.toLowerCase()) ? `${base}, ${city}` : base;
    if (localities.some((l) => l.label.toLowerCase() === label.toLowerCase())) return;
    onChange({
      keyword: "",
      localities: [...localities, { label, placeId: s.place_id, city: city || undefined, locality: locality || undefined }],
    });
  };

  const removeLocality = (label: string) => {
    onChange({ keyword, localities: localities.filter((l) => l.label !== label) });
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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      commitKeyword();
      onSubmit?.();
    }
    if (e.key === "Backspace" && !text && localities.length) {
      removeLocality(localities[localities.length - 1].label);
    }
  };

  return (
    <div className="relative">
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
          onChange={(e) => {
            setText(e.target.value);
            onChange({ localities, keyword: e.target.value });
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          onKeyDown={handleKeyDown}
          aria-label="Search location or keyword"
        />
      </div>

      {open && text.trim().length >= 2 && (
        <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-50 max-h-72 overflow-auto rounded-xl border border-slate-200 bg-white py-1 shadow-xl dark:border-slate-800 dark:bg-slate-900">
          {loading && <p className="px-3 py-2 text-xs text-slate-500 dark:text-slate-400">Searching…</p>}
          {!loading && error && <p className="px-3 py-2 text-xs text-rose-600 dark:text-rose-400">{error}</p>}
          {suggestions.map((s) => (
            <button
              key={`${s.type}:${s.description}`}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => void addSuggestion(s)}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              {s.type === "inventory" ? <Search className="h-3.5 w-3.5 shrink-0 text-rose-500" /> : <MapPin className="h-3.5 w-3.5 shrink-0 text-slate-400" />}
              <span className="min-w-0">
                <span className="block truncate text-slate-800 dark:text-slate-200">{s.description}</span>
                {s.type === "inventory" && s.meta && <span className="block truncate text-xs text-slate-500 dark:text-slate-400">{s.meta}</span>}
              </span>
            </button>
          ))}
          {text.trim().length >= 3 && (
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => { commitKeyword(); onSubmit?.(); }}
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
