"use client";
import React from "react";
import { Search, Loader2 } from "lucide-react";
import { LocationSearchInput } from "./LocationSearchInput";
import { CitySelectorDropdown } from "./CitySelectorDropdown";
import { MobileSearchFlow } from "./MobileSearchFlow";
import { buildSearchHref, INTENT_CONFIG, INTENT_KEYS, clearAllFilters, type SearchState } from "./searchQuery";
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
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const draftRef = React.useRef(draft);
  const update = (next: SearchState) => { draftRef.current = next; setDraft(next); };

  // Sync draft when value prop changes externally (e.g. from filter chips or URL changes)
  React.useEffect(() => {
    draftRef.current = value;
    setDraft(value);
  }, [value]);

  const submit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      let next = draftRef.current;
      if (next.q && next.q.trim()) {
        next = await resolveSearchQueryToState(next.q, next);
        update(next);
      }
      await onSubmit(next);
    } finally {
      setTimeout(() => setIsSubmitting(false), 2500);
    }
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
            disabled={isSubmitting}
            className={`${primaryButton} shrink-0 w-full sm:w-auto h-11 font-semibold shadow-sm transition-all ${
              isSubmitting ? "opacity-75 cursor-not-allowed" : ""
            }`}
            onClick={submit}
          >
            {isSubmitting ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Searching...</span>
              </>
            ) : (
              <>
                <Search size={18} />
                <span>Search</span>
              </>
            )}
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
}: Props) {
  const [mobileSearchOpen, setMobileSearchOpen] = React.useState(false);
  const [isMobileSubmitting, setIsMobileSubmitting] = React.useState(false);

  const handleMobileSubmit = async () => {
    if (isMobileSubmitting) return;
    setIsMobileSubmitting(true);
    try {
      await onSubmit(value);
    } finally {
      setTimeout(() => setIsMobileSubmitting(false), 2500);
    }
  };

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
          <div className="flex h-12 w-full items-center gap-2 rounded-xl border border-slate-200 bg-white pl-3 pr-1.5 text-left shadow-xs transition hover:border-slate-300 dark:border-slate-700 dark:bg-slate-900">
            <button
              type="button"
              onClick={() => setMobileSearchOpen(true)}
              className="flex min-w-0 flex-1 items-center gap-2 text-left focus:outline-none"
              aria-label="Search by locality, project or landmark"
            >
              <Search size={18} className="shrink-0 text-slate-500" />
              <span className="min-w-0 flex-1 truncate text-sm font-medium text-slate-600 dark:text-slate-300">
                Search by locality, project or landmark
              </span>
            </button>
            <button
              type="button"
              disabled={isMobileSubmitting}
              onClick={handleMobileSubmit}
              className={`flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-lg bg-rose-600 px-3.5 text-xs font-bold text-white shadow-xs transition hover:bg-rose-700 active:scale-[0.98] ${
                isMobileSubmitting ? "opacity-80 cursor-not-allowed" : ""
              }`}
              aria-label="Search properties"
            >
              {isMobileSubmitting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Searching...</span>
                </>
              ) : (
                <span>Search</span>
              )}
            </button>
          </div>
        </div>

        <MobileSearchFlow
          open={mobileSearchOpen}
          onClose={() => setMobileSearchOpen(false)}
          value={value}
          onSubmit={onSubmit}
          submitHref={buildSearchHref}
          renderSearchEditor={(draft, setDraft) => (
            <SearchEditor variant="hero" value={draft} onSubmit={setDraft} onContextChange={setDraft} showSubmit={false} liveChanges />
          )}
        />
      </>
    );
  }

  return <SearchEditor variant="results" value={value} onSubmit={onSubmit} onContextChange={onChange} />;
}
