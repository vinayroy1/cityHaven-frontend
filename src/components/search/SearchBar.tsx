"use client";
import React from "react";
import { ArrowLeft, Search, SlidersHorizontal } from "lucide-react";
import { LocationSearchInput } from "./LocationSearchInput";
import { CitySelectorDropdown } from "./CitySelectorDropdown";
import { MobileSearchFlow } from "./MobileSearchFlow";
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

export function SearchEditor({ variant, value, onSubmit, onContextChange, showSubmit = true, liveChanges = false }: { variant?: "hero" | "results"; value: SearchState; onSubmit: (next: SearchState) => void; onContextChange?: (next: SearchState) => void; showSubmit?: boolean; liveChanges?: boolean }) {
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
                if (liveChanges || variant === "results") {
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
              onChange={({ localities, keyword }) => {
                const localitiesChanged =
                  localities.length !== draftRef.current.localities.length ||
                  localities.some((l, i) => l.label !== draftRef.current.localities[i]?.label);
                const next = { ...draftRef.current, localities, q: keyword };
                update(next);
                // Only notify context change if locality chips were added/removed, NOT on typing characters
                if (liveChanges || (variant === "results" && localitiesChanged)) {
                  onContextChange?.(next);
                }
              }}
            />
          </div>
        </div>

        {/* Search submit button */}
        {showSubmit && (
          <button
            type="button"
            className={`${primaryButton} shrink-0 w-full sm:w-auto h-11 font-semibold shadow-sm`}
            onClick={submit}
          >
            <Search size={18} />
            Search
          </button>
        )}
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
  onBack,
}: Props) {
  const [mobileSearchOpen, setMobileSearchOpen] = React.useState(false);
  const [tabletSearchOpen, setTabletSearchOpen] = React.useState(false);

  if (variant === "hero") {
    return (
      <>
        {/* Desktop Hero Search: Inline */}
        <div className="hidden sm:block">
          <SearchEditor variant="hero" value={value} onSubmit={onSubmit} onContextChange={onChange} />
        </div>

        {/* Mobile Hero Search: High-end compact search card (NoBroker style) that launches the full search drawer */}
        <div className="sm:hidden">
          <div className="no-scrollbar mb-2 flex gap-5 overflow-x-auto border-b border-slate-200 px-1 dark:border-slate-800" aria-label="Property category">
            {INTENT_KEYS.map((intent) => (
              <button
                key={intent}
                type="button"
                aria-pressed={value.intent === intent}
                onClick={() => onChange(intent === value.intent ? value : clearAllFilters({ ...value, intent, transaction: "SELL" }))}
                className={`shrink-0 border-b-2 px-1 pb-2 text-xs font-bold transition ${
                  value.intent === intent
                    ? "border-rose-600 text-rose-600 dark:border-rose-400 dark:text-rose-400"
                    : "border-transparent text-slate-400 dark:text-slate-500"
                }`}
              >
                {INTENT_CONFIG[intent].label}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setMobileSearchOpen(true)}
            className="flex h-12 w-full items-center gap-2 rounded-xl border border-slate-200 bg-white pl-3 pr-1.5 text-left shadow-xs transition hover:border-slate-300 active:scale-[0.99] dark:border-slate-700 dark:bg-slate-900"
          >
            <Search size={18} className="shrink-0 text-slate-400" />
            <span className="min-w-0 flex-1 truncate text-sm font-medium text-slate-400 dark:text-slate-500">
              Search by locality, project or landmark
            </span>
            <span className="flex h-9 shrink-0 items-center rounded-lg bg-rose-600 px-3 text-xs font-bold text-white shadow-xs">Search</span>
          </button>
        </div>

        <MobileSearchFlow
          open={mobileSearchOpen}
          onClose={() => setMobileSearchOpen(false)}
          value={value}
          renderSearchEditor={(draft, setDraft) => (
            <SearchEditor variant="hero" value={draft} onSubmit={setDraft} onContextChange={setDraft} showSubmit={false} liveChanges />
          )}
          onSubmit={(next) => {
            setMobileSearchOpen(false);
            onChange(next);
            onSubmit(next);
          }}
        />
      </>
    );
  }

  return (
    <div>
      {/* Desktop View: Full inline search editor */}
      <div className="hidden lg:block">
        <SearchEditor variant="results" value={value} onSubmit={onSubmit} onContextChange={onChange} />
      </div>

      {/* Mobile View: NoBroker-style compact single-line bar with Back button, Tap-to-search summary pill, and Filter button */}
      <div className="flex items-center gap-2 lg:hidden">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            aria-label="Back"
            className="flex h-11 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-xs transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 active:scale-95"
          >
            <ArrowLeft size={18} />
          </button>
        )}

        {/* Compact Search Trigger Pill: Displays category + city + localities */}
        <button
          type="button"
          onClick={() => {
            if (window.innerWidth < 640) setMobileSearchOpen(true);
            else setTabletSearchOpen(true);
          }}
          className="flex min-w-0 flex-1 items-center gap-2.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-left shadow-xs transition hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 active:scale-[0.99]"
        >
          <Search size={16} className="shrink-0 text-rose-600 dark:text-rose-400" />
          <span className="min-w-0 flex-1">
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
          </span>
          {resultCount !== undefined && (
            <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              {resultCount}
            </span>
          )}
        </button>

        {/* Sliders Filter Button */}
        <button
          type="button"
          aria-label={`Filters, ${activeFilterCount} active`}
          onClick={onOpenFilters}
          className={`relative flex h-11 shrink-0 items-center justify-center gap-1.5 rounded-xl border px-3 text-xs font-bold transition active:scale-95 shadow-xs ${
            activeFilterCount > 0
              ? "border-rose-500 bg-rose-50 text-rose-700 dark:border-rose-600 dark:bg-rose-950/40 dark:text-rose-300"
              : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
          }`}
        >
          <SlidersHorizontal size={16} />
          {activeFilterCount > 0 && (
            <span className="flex h-4 min-w-[16px] items-center justify-center rounded-full bg-rose-600 px-1 text-[10px] font-black text-white">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      <MobileSearchFlow
        open={mobileSearchOpen}
        onClose={() => setMobileSearchOpen(false)}
        value={value}
        resultCount={resultCount}
        renderSearchEditor={(draft, setDraft) => (
          <SearchEditor variant="hero" value={draft} onSubmit={setDraft} onContextChange={setDraft} showSubmit={false} liveChanges />
        )}
        onSubmit={(next) => {
          setMobileSearchOpen(false);
          onSubmit(next);
        }}
      />

      <SearchDialog open={tabletSearchOpen} onClose={() => setTabletSearchOpen(false)} title="Search properties">
        <SearchEditor
          variant="results"
          value={value}
          onSubmit={(next) => {
            setTabletSearchOpen(false);
            onSubmit(next);
          }}
          onContextChange={onChange}
        />
      </SearchDialog>
    </div>
  );
}
