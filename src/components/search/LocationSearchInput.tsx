"use client";

import React from "react";
import { MapPin, Search, X } from "lucide-react";
import {
  createPlacesSessionToken,
  fetchAutocompleteSuggestions,
  fetchPlaceDetails,
  type PlaceDetails,
} from "@/lib/googlePlaces";
import type { LocalityTag } from "./searchQuery";

type Suggestion = { description: string; place_id: string };

type Props = {
  localities: LocalityTag[];
  keyword: string;
  onChange: (next: { localities: LocalityTag[]; keyword: string }) => void;
  onSubmit?: () => void;
  autoFocus?: boolean;
  placeholder?: string;
};

export function LocationSearchInput({
  localities,
  keyword,
  onChange,
  onSubmit,
  autoFocus,
  placeholder = "Search city, locality, project or landmark",
}: Props) {
  const [text, setText] = React.useState(keyword);
  const [suggestions, setSuggestions] = React.useState<Suggestion[]>([]);
  const [loading, setLoading] = React.useState(false);
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
      return;
    }
    let token = sessionToken;
    if (!token) {
      token = createPlacesSessionToken();
      setSessionToken(token);
    }
    let cancelled = false;
    setLoading(true);
    const timer = setTimeout(async () => {
      const results = await fetchAutocompleteSuggestions(trimmed, token ?? undefined);
      if (!cancelled) {
        setSuggestions(results);
        setLoading(false);
      }
    }, 300);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [text, sessionToken]);

  const addLocality = async (s: Suggestion) => {
    setOpen(false);
    setSuggestions([]);
    setText("");
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
      <div className="flex flex-wrap items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-2 py-1.5 focus-within:border-slate-400 focus-within:ring-2 focus-within:ring-slate-200">
        <MapPin className="ml-1 h-4 w-4 shrink-0 text-rose-500" />

        {localities.map((l) => (
          <span
            key={l.label}
            className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-800"
          >
            {l.label}
            <button
              type="button"
              onClick={() => removeLocality(l.label)}
              aria-label={`Remove ${l.label}`}
              className="rounded-full p-0.5 text-slate-500 hover:bg-white hover:text-slate-800"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}

        <input
          ref={inputRef}
          className="min-w-[8rem] flex-1 bg-transparent px-1 py-1 text-sm text-slate-900 outline-none placeholder:text-slate-400"
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
        <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-50 max-h-72 overflow-auto rounded-xl border border-slate-200 bg-white py-1 shadow-xl">
          {loading && <p className="px-3 py-2 text-xs text-slate-500">Searching…</p>}
          {suggestions.map((s) => (
            <button
              key={s.place_id}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => void addLocality(s)}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-slate-50"
            >
              <MapPin className="h-3.5 w-3.5 shrink-0 text-slate-400" />
              <span className="text-slate-800">{s.description}</span>
            </button>
          ))}
          {text.trim().length >= 3 && (
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => { commitKeyword(); onSubmit?.(); }}
              className="flex w-full items-center gap-2 border-t border-slate-100 px-3 py-2 text-left text-sm hover:bg-slate-50"
            >
              <Search className="h-3.5 w-3.5 shrink-0 text-slate-400" />
              <span className="text-slate-800">
                Search <span className="font-semibold">&ldquo;{text.trim()}&rdquo;</span> as keyword
              </span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
