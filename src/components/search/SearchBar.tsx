"use client";
import React from "react";
import { ArrowLeft, Search, SlidersHorizontal } from "lucide-react";
import { LocationSearchInput } from "./LocationSearchInput";
import { CitySelectorDropdown } from "./CitySelectorDropdown";
import { SearchDialog } from "./SearchDialog";
import { INTENT_CONFIG, INTENT_KEYS, clearAllFilters, locationSummary, type SearchState } from "./searchQuery";
import { primaryButton } from "./theme";

import { resolveSearchQueryToState } from "@/lib/search/intentParser";

type Props = {
  variant: "hero" | "results";
  value: SearchState;
  onChange: (next: SearchState) => void;
  onSubmit: (next: SearchState) => void;
  resultCount?: number;
  activeFilterCount?: number;
  onOpenFilters?: () => void;
  compact?: boolean;
  onBack?: () => void;
};

function SearchEditor({ variant, value, onSubmit, onContextChange }: { variant?: "hero" | "results"; value: SearchState; onSubmit: (next: SearchState) => void; onContextChange?: (next: SearchState) => void }) {
  const [draft, setDraft] = React.useState(value);
  const draftRef = React.useRef(draft);
  const update = (next: SearchState) => { draftRef.current = next; setDraft(next); };

  // Sync draft when value prop changes externally (e.g. from filter chips or URL changes)
  React.useEffect(() => {
    draftRef.current = value;
    setDraft(value);
  }, [value]);

  const submit = async () => {
    let next = draftRef.current;
    if (next.q && next.q.trim()) {
      next = await resolveSearchQueryToState(next.q, next);
      update(next);
    }
    onSubmit(next);
  };
  const changeContext = (next: SearchState) => { update(next); onContextChange?.(next); };

  return (
    <div className="space-y-4">
      <div className="no-scrollbar flex gap-5 overflow-x-auto border-b border-zinc-200 dark:border-slate-800" aria-label="Property category">
        {INTENT_KEYS.map((intent) => (
          <button
            key={intent}
            type="button"
            aria-pressed={draft.intent === intent}
            onClick={() => changeContext(intent === draft.intent ? draft : clearAllFilters({ ...draft, intent, transaction: "SELL" }))}
            className={`shrink-0 border-b-2 pb-3 text-sm font-bold transition ${
              draft.intent === intent
                ? "border-rose-600 text-rose-600 dark:text-rose-400 dark:border-rose-400"
                : "border-transparent text-zinc-500 hover:text-zinc-900 dark:text-slate-400 dark:hover:text-white"
            }`}
          >
            {INTENT_CONFIG[intent].label}
          </button>
        ))}
      </div>

      {draft.intent === "COMMERCIAL" && (
        <div className="flex gap-2" aria-label="Commercial transaction">
          {(["SELL", "RENT"] as const).map((transaction) => (
            <button
              key={transaction}
              type="button"
              aria-pressed={(draft.transaction ?? "SELL") === transaction}
              onClick={() => changeContext({ ...draft, transaction, priceMin: undefined, priceMax: undefined })}
              className={`rounded-xl border px-4 py-2 text-sm font-semibold transition ${
                (draft.transaction ?? "SELL") === transaction
                  ? "border-rose-600 bg-rose-50 text-rose-700 dark:bg-rose-950 dark:border-rose-500 dark:text-rose-300"
                  : "border-zinc-200 bg-white text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
              }`}
            >
              {transaction === "SELL" ? "Buy" : "Rent / Lease"}
            </button>
          ))}
        </div>
      )}

      {/* Search Input Container: Stacked on mobile with generous touch targets, inline row on sm+ */}
      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-start">
        <div className="flex flex-col gap-2 sm:flex-row sm:min-w-0 sm:flex-1 sm:items-start sm:gap-2">
          {/* City selector: full width on mobile so selected city is clear and easily tapped; compact pill on desktop */}
          <div className="w-full sm:w-auto sm:shrink-0">
            <CitySelectorDropdown
              compact
              selectedCityName={draft.cityName}
              onSelectCity={(city) => {
                const next = {
                  ...draftRef.current,
                  cityName: city.name,
                  localities: [], // Reset locality chips when city changes to avoid cross-city search conflicts
                };
                update(next);
                if (variant === "results") {
                  onContextChange?.(next);
                }
              }}
            />
          </div>

          {/* Location search input: gets 100% width on both mobile and desktop */}
          <div className="min-w-0 flex-1">
            <LocationSearchInput
              cityName={draft.cityName}
              localities={draft.localities}
              keyword={draft.q}
              activeIntent={draft.intent}
              listingType={draft.intent === "RENT" || draft.intent === "PG" ? draft.intent : "SELL"}
              onChange={({ localities, keyword }) => {
                const localitiesChanged =
                  localities.length !== draftRef.current.localities.length ||
                  localities.some((l, i) => l.label !== draftRef.current.localities[i]?.label);
                const next = { ...draftRef.current, localities, q: keyword };
                update(next);
                // Only notify context change if locality chips were added/removed, NOT on typing characters
                if (variant === "results" && localitiesChanged) {
                  onContextChange?.(next);
                }
              }}
              onSelectIntent={(p) => {
                const currentLocs = draftRef.current.localities;
                const targetCity = p.cityName;
                let nextLocs = currentLocs;
                if (targetCity) {
                  if (!currentLocs.some((l) => l.label.toLowerCase() === targetCity.toLowerCase())) {
                    nextLocs = [...currentLocs, { label: targetCity, city: targetCity }];
                  }
                }
                const next: SearchState = {
                  ...draftRef.current,
                  cityName: targetCity || draftRef.current.cityName,
                  intent: p.intent,
                  transaction: p.transaction ?? draftRef.current.transaction,
                  bedroomsMin: p.bedrooms ?? draftRef.current.bedroomsMin,
                  refine: {
                    ...draftRef.current.refine,
                    subType: p.subType ? [p.subType] : draftRef.current.refine.subType,
                  },
                  localities: nextLocs,
                  q: "",
                };
                update(next);
                onSubmit(next);
              }}
              onSubmit={submit}
            />
          </div>
        </div>

        {/* Search submit button */}
        <button
          type="button"
          className={`${primaryButton} shrink-0 w-full sm:w-auto h-11 font-semibold shadow-sm`}
          onClick={submit}
        >
          <Search size={18} />
          Search
        </button>
      </div>
    </div>
  );
}

export function SearchBar({
  variant,
  value,
  onChange,
  onSubmit,
  resultCount,
  activeFilterCount = 0,
  onOpenFilters,
  compact = false,
  onBack,
}: Props) {
  const [open, setOpen] = React.useState(false);
  if (variant === "hero") return <SearchEditor variant="hero" value={value} onSubmit={onSubmit} onContextChange={onChange} />;
  return (
    <>
      <div className="hidden lg:block">
        <SearchEditor variant="results" value={value} onSubmit={onSubmit} onContextChange={onChange} />
      </div>
      <div className="flex items-center gap-2 lg:hidden">
        {compact && onBack && (
          <button
            type="button"
            onClick={onBack}
            aria-label="Back"
            className="flex h-10 w-9 shrink-0 items-center justify-center rounded-xl border border-zinc-200 bg-white text-slate-700 shadow-xs transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 active:scale-95"
          >
            <ArrowLeft size={18} />
          </button>
        )}
        <button
          type="button"
          onClick={() => setOpen(true)}
          className={`flex min-w-0 flex-1 items-center gap-2.5 rounded-xl border border-zinc-200 bg-white text-left shadow-xs transition hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 active:scale-[0.99] ${
            compact ? "px-3 py-2" : "px-3 py-2.5 sm:py-3"
          }`}
        >
          <Search size={compact ? 16 : 18} className="shrink-0 text-rose-600 dark:text-rose-400" />
          <span className="min-w-0 flex-1">
            {compact ? (
              <span className="flex items-center gap-1.5 truncate">
                <span className="text-xs font-bold text-rose-600 dark:text-rose-400 shrink-0">
                  {INTENT_CONFIG[value.intent].label}
                  {value.intent === "COMMERCIAL" ? (value.transaction === "RENT" ? " / Rent" : " / Buy") : ""}
                </span>
                <span className="text-slate-300 dark:text-slate-700 text-xs">•</span>
                <span className="truncate text-xs font-semibold text-slate-900 dark:text-white">
                  {locationSummary(value)}
                </span>
              </span>
            ) : (
              <>
                <span className="block text-[11px] font-semibold text-zinc-500 dark:text-slate-400">
                  {INTENT_CONFIG[value.intent].label}
                  {value.intent === "COMMERCIAL" ? (value.transaction === "RENT" ? " / Rent" : " / Buy") : ""}
                </span>
                <span className="block truncate text-xs sm:text-sm font-semibold text-slate-900 dark:text-white">
                  {locationSummary(value)}
                </span>
              </>
            )}
          </span>
          {compact && resultCount !== undefined && (
            <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              {resultCount}
            </span>
          )}
        </button>
        <button
          type="button"
          aria-label={`Filters, ${activeFilterCount} active`}
          onClick={onOpenFilters}
          className={`relative flex shrink-0 items-center justify-center rounded-xl border border-zinc-200 bg-white text-slate-700 shadow-xs transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 active:scale-95 ${
            compact ? "h-10 w-10" : "h-11 w-11 sm:w-12"
          }`}
        >
          <SlidersHorizontal size={compact ? 17 : 19} />
          {activeFilterCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-rose-600 px-1 text-[10px] font-black text-white shadow-xs">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>
      <SearchDialog open={open} onClose={() => setOpen(false)} title="Search properties">
        <div className="min-h-0 flex-1 overflow-y-auto p-5">
          {open && (
            <SearchEditor
              variant="results"
              value={value}
              onSubmit={(next) => {
                onSubmit(next);
                setOpen(false);
              }}
            />
          )}
        </div>
      </SearchDialog>
    </>
  );
}
