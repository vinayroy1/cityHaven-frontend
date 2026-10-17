"use client";

import React from "react";
import { ChevronDown, MapPin, X } from "lucide-react";
import {
  fetchAwasioSuggestions,
  type AwasioSuggestion,
} from "@/lib/awasioSuggestions";
import type { LocalityTag } from "./searchQuery";

type Suggestion = { type: "awasio"; suggestion: AwasioSuggestion };

const LOCALITY_PAGE_SIZE = 30;

type Props = {
  localities: LocalityTag[];
  keyword: string;
  cityName?: string;
  onChange: (next: { localities: LocalityTag[]; keyword: string }) => void;
  autoFocus?: boolean;
  placeholder?: string;
  maxLocalities?: number;
};

export function LocationSearchInput({
  localities,
  keyword,
  cityName,
  onChange,
  autoFocus,
  placeholder = "Search city, locality, project or landmark",
  maxLocalities = 2,
}: Props) {
  const [text, setText] = React.useState(keyword);
  const [suggestions, setSuggestions] = React.useState<Suggestion[]>([]);
  const [prefetchedSuggestions, setPrefetchedSuggestions] = React.useState<Suggestion[]>([]);
  const [prefetchedHasMore, setPrefetchedHasMore] = React.useState(false);
  const [prefetchedNextPage, setPrefetchedNextPage] = React.useState(2);
  const [nextPage, setNextPage] = React.useState(2);
  const [loading, setLoading] = React.useState(false);
  const [loadingMore, setLoadingMore] = React.useState(false);
  const [hasMore, setHasMore] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [open, setOpen] = React.useState(false);

  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
  }, [autoFocus]);

  React.useEffect(() => {
    if (!open) setText("");
  }, [keyword, open]);

  // Warm the dropdown when the user opens/focuses the input so the panel
  // contains useful locality choices for the selected city.
  React.useEffect(() => {
    if (!open) return;

    const selectedCity = cityName?.trim();
    let cancelled = false;

    setPrefetchedSuggestions([]);
    setPrefetchedHasMore(false);
    setPrefetchedNextPage(2);
    setNextPage(2);
    setHasMore(false);
    if (!selectedCity) return;

    void fetchAwasioSuggestions(selectedCity, {
      city: selectedCity,
      types: ["LOCALITY"],
      page: 1,
      pageSize: LOCALITY_PAGE_SIZE,
      maxPerGroup: LOCALITY_PAGE_SIZE,
    })
      .then((response) => {
        if (cancelled) return;
        const next = (response.data || [])
          .filter((suggestion) => suggestion.type === "LOCALITY")
          .map((suggestion) => ({ type: "awasio" as const, suggestion }));
        setPrefetchedSuggestions(next);
        const canLoadMore = response.pagination?.hasNextPage ?? next.length >= LOCALITY_PAGE_SIZE;
        setPrefetchedHasMore(canLoadMore);
        setHasMore(canLoadMore);
      })
      .catch(() => {
        if (!cancelled) {
          setPrefetchedSuggestions([]);
          setPrefetchedHasMore(false);
          setHasMore(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [cityName, open]);

  React.useEffect(() => {
    // Only search autocomplete suggestions when the user is actively interacting with the input
    if (!open) return;

    const trimmed = text.trim();
    if (trimmed.length < 2) {
      setSuggestions(prefetchedSuggestions);
      setHasMore(prefetchedHasMore);
      setNextPage(prefetchedNextPage);
      setLoading(false);
      setError(null);
      return;
    }

    const effectiveCity = cityName?.trim() || undefined;
    let cancelled = false;
    setLoading(true);
    setError(null);

    const timer = setTimeout(async () => {
      try {
        const suggestResults = await fetchAwasioSuggestions(trimmed, {
          page: 1,
          pageSize: LOCALITY_PAGE_SIZE,
          maxPerGroup: LOCALITY_PAGE_SIZE,
          city: effectiveCity,
          types: ["LOCALITY"],
        });

        if (!cancelled) {
          const chSuggestions: Suggestion[] = (suggestResults.data || [])
            .filter((s: AwasioSuggestion) => s.type !== "CITY")
            .map((s: AwasioSuggestion) => ({ type: "awasio" as const, suggestion: s }));

          setSuggestions(chSuggestions);
          setNextPage(2);
          setHasMore(suggestResults.pagination?.hasNextPage ?? chSuggestions.length >= LOCALITY_PAGE_SIZE);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Could not load location suggestions.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }, 180);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [text, cityName, open, prefetchedSuggestions, prefetchedHasMore, prefetchedNextPage]);

  const loadMoreSuggestions = async () => {
    if (loading || loadingMore || !hasMore || localities.length >= maxLocalities) return;

    const trimmed = text.trim();
    const selectedCity = cityName?.trim();
    const query = trimmed.length >= 2 ? trimmed : selectedCity;
    if (!query) return;

    setLoadingMore(true);

    try {
      const response = await fetchAwasioSuggestions(query, {
        city: selectedCity,
        types: ["LOCALITY"],
        page: nextPage,
        pageSize: LOCALITY_PAGE_SIZE,
        maxPerGroup: LOCALITY_PAGE_SIZE,
      });
      const merged = new Map<string, Suggestion>();
      for (const item of suggestions) merged.set(item.suggestion.id, item);
      for (const suggestion of response.data || []) {
        if (suggestion.type === "LOCALITY") {
          merged.set(suggestion.id, { type: "awasio", suggestion });
        }
      }
      const next = Array.from(merged.values());
      const canLoadMore = response.pagination?.hasNextPage ?? (response.data || []).length >= LOCALITY_PAGE_SIZE;
      setSuggestions(next);
      setNextPage((page) => page + 1);
      setHasMore(canLoadMore);
      if (trimmed.length < 2) {
        setPrefetchedSuggestions(next);
        setPrefetchedHasMore(canLoadMore);
        setPrefetchedNextPage(nextPage + 1);
      }
    } catch {
      setHasMore(false);
    } finally {
      setLoadingMore(false);
    }
  };

  const addSuggestion = (s: Suggestion) => {
    setOpen(false);
    setSuggestions([]);
    setText("");

    const label = s.suggestion.location.locality || s.suggestion.title || "";

    if (!label) return;

    if (localities.some((l) => l.label.toLowerCase() === label.toLowerCase())) {
      inputRef.current?.focus();
      return;
    }

    onChange({
      keyword: "",
      localities: [...localities, { label, city: s.suggestion.location.city || undefined }].slice(0, maxLocalities),
    });

    inputRef.current?.focus();
  };

  const removeLocality = (label: string) => {
    onChange({ keyword, localities: localities.filter((l) => l.label !== label) });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setText(val);
    if (keyword) onChange({ localities, keyword: "" });
    setOpen(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const firstSuggestion = suggestions[0];
      if (firstSuggestion) addSuggestion(firstSuggestion);
      return;
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
      const viewport = window.visualViewport;
      const viewportTop = viewport?.offsetTop ?? 0;
      const viewportBottom = viewportTop + (viewport?.height ?? window.innerHeight);
      const spaceBelow = viewportBottom - rect.bottom;
      const spaceAbove = rect.top - viewportTop;

      const isMobile = window.innerWidth < 768;
      if (isMobile) {
        // On mobile, flipping upside down covers tabs, city selectors, and squishes input.
        // Always place below the input, and allow dropdown to scroll smoothly.
        setPlacement("bottom");
        setDropdownMaxHeight(Math.min(280, Math.max(160, spaceBelow - 12)));
        return;
      }

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
    const vv = window.visualViewport;
    if (vv) {
      vv.addEventListener("resize", calculatePosition);
    }
    return () => {
      window.removeEventListener("scroll", calculatePosition);
      window.removeEventListener("resize", calculatePosition);
      if (vv) {
        vv.removeEventListener("resize", calculatePosition);
      }
    };
  }, [open]);

  return (
    <div className="relative" ref={containerRef}>
      <div className="flex h-11 items-center gap-1.5 overflow-hidden rounded-xl border border-slate-200 bg-white px-2.5 focus-within:border-slate-400 focus-within:ring-2 focus-within:ring-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:focus-within:border-rose-400 dark:focus-within:ring-rose-500/20">
        <MapPin className="ml-0.5 h-4 w-4 shrink-0 text-rose-500" />

        {/* Selected localities remain inside the field, like a multi-select dropdown. */}
        {localities.map((l) => (
          <span
            key={l.label}
            className="inline-flex min-w-0 max-w-28 shrink items-center gap-1 rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-800 dark:bg-slate-700 dark:text-slate-200 sm:max-w-40"
          >
            <span className="max-w-28 truncate sm:max-w-40">{l.label}</span>
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

        {localities.length < maxLocalities ? (
          <>
            <input
              ref={inputRef}
              className="min-w-0 flex-1 bg-transparent px-1.5 py-0.5 text-base text-slate-900 outline-none placeholder:text-slate-400 dark:text-slate-100 dark:placeholder:text-slate-500 sm:text-sm"
              placeholder={localities.length === 1 ? "Add one more locality..." : placeholder}
              value={text}
              onChange={handleInputChange}
              onFocus={() => {
                setOpen(true);
                // Mobile browsers already pan the focused input above the keyboard.
                // A second smooth scroll while visualViewport is resizing pushes a
                // containing bottom sheet upward and causes visible flicker.
                if (window.innerWidth >= 768) {
                  setTimeout(() => {
                    containerRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
                  }, 100);
                }
              }}
              onBlur={() => setTimeout(() => setOpen(false), 200)}
              onKeyDown={handleKeyDown}
              autoComplete="off"
            />
            <ChevronDown
              className={`h-4 w-4 shrink-0 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`}
            />
          </>
        ) : (
          <span className="ml-auto shrink-0 text-[10px] font-semibold text-slate-400 dark:text-slate-500">
            {localities.length}/{maxLocalities}
          </span>
        )}
      </div>

      {open && (text.trim().length >= 2 || loading || suggestions.length > 0 || Boolean(error)) && (
        <div
          style={{ maxHeight: `${dropdownMaxHeight}px` }}
          onScroll={(event) => {
            const element = event.currentTarget;
            if (element.scrollHeight - element.scrollTop - element.clientHeight <= 48) {
              void loadMoreSuggestions();
            }
          }}
          className={`absolute left-0 right-0 z-50 overflow-y-auto rounded-xl border border-slate-200 bg-white py-1 shadow-xl transition-all dark:border-slate-700 dark:bg-slate-900 ${
            placement === "top"
              ? "bottom-[calc(100%+6px)] shadow-slate-950/20"
              : "top-[calc(100%+6px)] shadow-slate-950/15"
          }`}
        >
          {loading && suggestions.length === 0 && (
            <p className="px-3 py-2 text-xs text-slate-500 dark:text-slate-400">Searching locations…</p>
          )}

          {!loading && error && suggestions.length === 0 && (
            <p className="px-3 py-2 text-xs text-rose-600 dark:text-rose-400">{error}</p>
          )}

          {/* Render suggestions */}
          {suggestions.map((s) => {
              const sg = s.suggestion;
              return (
                <button
                  key={sg.id}
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => void addSuggestion(s)}
                  className="group flex w-full items-center justify-between gap-2 px-3 py-2 text-left hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors"
                >
                  <div className="flex min-w-0 items-center gap-2">
                    <MapPin className="h-3.5 w-3.5 shrink-0 text-slate-400 group-hover:text-rose-500 dark:text-slate-500 transition-colors" />
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
          })}

          {loadingMore && (
            <p className="border-t border-slate-100 px-3 py-2 text-center text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
              Loading more localities…
            </p>
          )}
        </div>
      )}
    </div>
  );
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
