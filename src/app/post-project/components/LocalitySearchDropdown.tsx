"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Building2, Check, Loader2, MapPin, Plus, Sparkles, X } from "lucide-react";
import { fetchAwasioSuggestions, type AwasioSuggestion } from "@/lib/awasioSuggestions";

interface LocalitySearchDropdownProps {
  value: string;
  onChange: (locality: string, metadata?: { pincode?: string; lat?: number; lng?: number }) => void;
  city: string;
  popularLocalities?: string[];
  placeholder?: string;
  error?: string;
}

export function LocalitySearchDropdown({
  value,
  onChange,
  city,
  popularLocalities = [],
  placeholder = "e.g. Sector 43, Whitefield",
  error,
}: LocalitySearchDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState(value);
  const [suggestions, setSuggestions] = useState<AwasioSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync external value changes into input query
  useEffect(() => {
    setQuery(value);
  }, [value]);

  // Handle outside clicks to close the dropdown
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

  // Real-time suggestions search like property search flow
  useEffect(() => {
    if (!isOpen) return;

    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setSuggestions([]);
      setLoading(false);
      return;
    }

    let isCancelled = false;
    setLoading(true);

    const timer = setTimeout(async () => {
      try {
        const resp = await fetchAwasioSuggestions(trimmed, {
          city: city || undefined,
          types: ["LOCALITY", "PROJECT"],
          limit: 15,
        });

        if (!isCancelled) {
          const list = resp.data || [];
          setSuggestions(list);
          setHighlightedIndex(-1);
        }
      } catch (err) {
        if (!isCancelled) {
          setSuggestions([]);
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    }, 120);

    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [query, city, isOpen]);

  // Filter popular localities for current query when short or matching
  const filteredPopular = useMemo(() => {
    if (!popularLocalities.length) return [];
    const q = query.trim().toLowerCase();
    if (!q) return popularLocalities.slice(0, 10);
    return popularLocalities
      .filter((loc) => loc.toLowerCase().includes(q))
      .slice(0, 8);
  }, [popularLocalities, query]);

  const handleSelectSuggestion = (s: AwasioSuggestion) => {
    const localityName = s.location.locality || s.title;
    setQuery(localityName);
    onChange(localityName, {
      pincode: s.location.pincode ? String(s.location.pincode) : undefined,
      lat: s.location.lat,
      lng: s.location.lng,
    });
    setIsOpen(false);
  };

  const handleSelectPopular = (locName: string) => {
    setQuery(locName);
    onChange(locName);
    setIsOpen(false);
  };

  const handleUseCustom = (customText: string) => {
    const clean = customText.trim();
    if (!clean) return;
    setQuery(clean);
    onChange(clean);
    setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setQuery("");
    onChange("");
    setSuggestions([]);
    inputRef.current?.focus();
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) {
      if (e.key === "ArrowDown" || e.key === "Enter") {
        setIsOpen(true);
      }
      return;
    }

    const totalCount =
      query.trim().length >= 2
        ? suggestions.length + 1 // +1 for custom option
        : filteredPopular.length;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev < totalCount - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : totalCount - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (query.trim().length >= 2) {
        if (highlightedIndex >= 0 && highlightedIndex < suggestions.length) {
          handleSelectSuggestion(suggestions[highlightedIndex]);
        } else {
          // Select custom or typed text
          handleUseCustom(query);
        }
      } else if (highlightedIndex >= 0 && highlightedIndex < filteredPopular.length) {
        handleSelectPopular(filteredPopular[highlightedIndex]);
      } else if (query.trim()) {
        handleUseCustom(query);
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      setIsOpen(false);
    }
  };

  return (
    <div className="relative" ref={containerRef}>
      <div className="relative flex items-center">
        <MapPin className="pointer-events-none absolute left-3.5 h-4 w-4 text-rose-500" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            const nextVal = e.target.value;
            setQuery(nextVal);
            onChange(nextVal);
            if (!isOpen) setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={`w-full rounded-xl border bg-slate-50 pl-10 pr-9 py-2.5 text-sm font-semibold text-slate-900 placeholder:text-slate-400 transition focus:bg-white focus:outline-none dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500 ${
            error
              ? "border-rose-400 focus:border-rose-500 ring-1 ring-rose-200"
              : "border-slate-200 focus:border-rose-500 dark:border-slate-700 dark:focus:border-rose-400"
          }`}
          autoComplete="off"
        />

        {loading ? (
          <Loader2 className="absolute right-3 h-4 w-4 animate-spin text-slate-400" />
        ) : query ? (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 rounded-full p-0.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700 dark:hover:bg-slate-700 dark:hover:text-white transition"
            aria-label="Clear locality"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        ) : null}
      </div>

      {/* Floating Suggestions Dropdown */}
      {isOpen && (
        <div className="absolute left-0 right-0 z-50 mt-1.5 max-h-72 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-1.5 shadow-2xl transition dark:border-slate-700 dark:bg-slate-900">
          {/* 1. When user typed >= 2 characters */}
          {query.trim().length >= 2 ? (
            <div className="space-y-0.5">
              {/* Option to use custom typed text */}
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => handleUseCustom(query)}
                className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs font-semibold transition ${
                  highlightedIndex === suggestions.length
                    ? "bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300"
                    : "text-rose-600 hover:bg-rose-50/70 dark:text-rose-400 dark:hover:bg-rose-950/40"
                }`}
              >
                <Plus className="h-4 w-4 shrink-0 text-rose-500" />
                <span className="truncate">
                  Use custom: <strong className="font-bold underline">{query.trim()}</strong>
                </span>
              </button>

              <div className="px-3 pt-1 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 border-t border-slate-100 dark:border-slate-800">
                Suggestions in {city || "India"}
              </div>

              {suggestions.length > 0 ? (
                suggestions.map((s, idx) => {
                  const isHighlighted = highlightedIndex === idx;
                  const Icon = s.type === "PROJECT" ? Building2 : MapPin;
                  const isCurrent = (s.location.locality || s.title).toLowerCase() === value.toLowerCase();

                  return (
                    <button
                      key={s.id || `sug-${idx}`}
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => handleSelectSuggestion(s)}
                      className={`group flex w-full items-center justify-between gap-2.5 rounded-xl px-3 py-2 text-left transition ${
                        isHighlighted
                          ? "bg-slate-100 dark:bg-slate-800"
                          : "hover:bg-slate-50 dark:hover:bg-slate-800/70"
                      }`}
                    >
                      <div className="flex min-w-0 items-center gap-2.5">
                        <Icon className="h-3.5 w-3.5 shrink-0 text-slate-400 group-hover:text-rose-500 dark:text-slate-500 transition-colors" />
                        <div className="min-w-0">
                          <span className="block truncate text-sm font-semibold text-slate-900 dark:text-white">
                            {s.title}
                          </span>
                          <span className="block truncate text-xs text-slate-400 dark:text-slate-500">
                            {s.subtitle || `${city}, India`}
                          </span>
                        </div>
                      </div>

                      <div className="flex shrink-0 items-center gap-1.5">
                        <span className="rounded-md border border-emerald-200/60 bg-emerald-50 px-2 py-0.5 text-[10px] font-bold uppercase text-emerald-700 dark:border-emerald-800/60 dark:bg-emerald-950/40 dark:text-emerald-400">
                          {s.badge || (s.type === "PROJECT" ? "Project" : "Sector")}
                        </span>
                        {isCurrent && <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />}
                      </div>
                    </button>
                  );
                })
              ) : !loading ? (
                <div className="px-3 py-3 text-center">
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    No matching master localities found for &quot;{query}&quot;.
                  </p>
                  <p className="mt-1 text-[11px] font-semibold text-rose-600 dark:text-rose-400">
                    Click &quot;Use custom&quot; above to keep your exact locality name.
                  </p>
                </div>
              ) : null}
            </div>
          ) : (
            /* 2. When query is empty or 1 char: show popular sectors for current city */
            <div className="space-y-0.5">
              <div className="flex items-center justify-between px-3 py-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1">
                  <Sparkles className="h-3 w-3 text-amber-500" /> Popular Sectors in {city || "India"}
                </span>
                <span className="text-[10px] text-slate-400">or type custom</span>
              </div>

              {filteredPopular.length > 0 ? (
                filteredPopular.map((loc, idx) => {
                  const isHighlighted = highlightedIndex === idx;
                  const isCurrent = loc.toLowerCase() === value.toLowerCase();

                  return (
                    <button
                      key={loc}
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => handleSelectPopular(loc)}
                      className={`group flex w-full items-center justify-between gap-2.5 rounded-xl px-3 py-2 text-left transition ${
                        isHighlighted
                          ? "bg-slate-100 dark:bg-slate-800"
                          : "hover:bg-slate-50 dark:hover:bg-slate-800/70"
                      }`}
                    >
                      <div className="flex min-w-0 items-center gap-2.5">
                        <MapPin className="h-3.5 w-3.5 shrink-0 text-slate-400 group-hover:text-rose-500 dark:text-slate-500 transition-colors" />
                        <span className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                          {loc}
                        </span>
                      </div>
                      <div className="flex shrink-0 items-center gap-1.5">
                        <span className="text-[11px] text-slate-400">{city}</span>
                        {isCurrent && <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />}
                      </div>
                    </button>
                  );
                })
              ) : (
                <div className="px-3 py-3 text-center text-xs text-slate-400">
                  Type any locality or sector name (e.g. Sector 43, Whitefield)
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
