"use client";

import React from "react";
import { X } from "lucide-react";
import { cn } from "@/components/ui/utils";
import { Chip } from "./Chip";
import {
  clearAllFilters,
  countActiveFilters,
  type SearchState,
} from "./searchQuery";
import {
  AREA_PRESETS,
  budgetConfig,
  filterSectionsFor,
  type FilterSection,
} from "./searchConfig";
import { primaryButton, ghostButton, linkButton } from "./theme";

// --- pure helpers -----------------------------------------------------

function readRange(state: SearchState, budget: boolean): [number | undefined, number | undefined] {
  return budget ? [state.priceMin, state.priceMax] : [state.refine.areaMin, state.refine.areaMax];
}
function writeRange(
  state: SearchState,
  budget: boolean,
  next: [number | undefined, number | undefined],
): SearchState {
  return budget
    ? { ...state, priceMin: next[0], priceMax: next[1] }
    : { ...state, refine: { ...state.refine, areaMin: next[0], areaMax: next[1] } };
}
function toggleInArray(arr: string[], v: string): string[] {
  return arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v];
}

function sectionActiveCount(section: FilterSection, s: SearchState): number {
  switch (section.key) {
    case "budget":
      return s.priceMin != null || s.priceMax != null ? 1 : 0;
    case "area":
      return s.refine.areaMin != null || s.refine.areaMax != null ? 1 : 0;
    case "bathrooms":
      return s.refine.bathroomsMin != null ? 1 : 0;
    default:
      return ((s.refine[section.key] as string[]) || []).length;
  }
}

// --- range picker ---------------------------------------------------

function RangePicker({
  presets,
  format,
  label,
  lo,
  hi,
  onChange,
}: {
  presets: number[];
  format: (v: number) => string;
  label: string;
  lo: number | undefined;
  hi: number | undefined;
  onChange: (next: [number | undefined, number | undefined]) => void;
}) {
  const valueOf = (raw: string) => (raw === "" ? undefined : Number(raw));
  const rangeText = `${lo == null ? "No min" : format(lo)} - ${hi == null ? "No max" : format(hi)}`;
  const domainText = `${format(presets[0])} to ${format(presets[presets.length - 1])}`;
  const minOptions = presets.filter((value) => hi == null || value < hi);
  const maxOptions = presets.filter((value) => lo == null || value > lo);

  const setMin = (raw: string) => {
    const nextLo = valueOf(raw);
    onChange([nextLo, hi != null && nextLo != null && hi <= nextLo ? undefined : hi]);
  };
  const setMax = (raw: string) => {
    const nextHi = valueOf(raw);
    onChange([lo != null && nextHi != null && lo >= nextHi ? undefined : lo, nextHi]);
  };

  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-800/50">
        <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-slate-500 dark:text-slate-400">{label}</p>
        <div className="mt-1 flex flex-wrap items-end justify-between gap-3">
          <p className="text-sm font-semibold text-slate-950 dark:text-white">{rangeText}</p>
          <p className="shrink-0 text-[11px] text-slate-500 dark:text-slate-400">{domainText}</p>
        </div>
      </div>

      <div className="grid grid-cols-[1fr_auto_1fr] items-end gap-2">
        <RangeSelect label="Min" value={lo} placeholder="No min" options={minOptions} format={format} onChange={setMin} />
        <span className="pb-2 text-sm font-semibold text-slate-300 dark:text-slate-600">to</span>
        <RangeSelect label="Max" value={hi} placeholder="No max" options={maxOptions} format={format} onChange={setMax} />
      </div>
    </div>
  );
}

function RangeSelect({
  label,
  value,
  placeholder,
  options,
  format,
  onChange,
}: {
  label: string;
  value: number | undefined;
  placeholder: string;
  options: number[];
  format: (v: number) => string;
  onChange: (raw: string) => void;
}) {
  return (
    <label className="block space-y-1">
      <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">{label}</span>
      <select
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-900 outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {format(opt)}
          </option>
        ))}
      </select>
    </label>
  );
}

// --- section body ---------------------------------------------------

function SectionBody({
  section,
  draft,
  setDraft,
}: {
  section: FilterSection;
  draft: SearchState;
  setDraft: (s: SearchState) => void;
}) {
  if (section.kind === "range") {
    const budget = section.key === "budget";
    const cfg = budgetConfig(draft);
    const presets = budget ? cfg.presets : AREA_PRESETS;
    const format = budget ? cfg.format : (v: number) => `${v.toLocaleString("en-IN")} sq.ft`;
    const label = budget ? cfg.label : section.title;
    const [lo, hi] = readRange(draft, budget);
    return (
      <RangePicker
        presets={presets}
        format={format}
        label={label}
        lo={lo}
        hi={hi}
        onChange={(next) => setDraft(writeRange(draft, budget, next))}
      />
    );
  }

  if (section.kind === "min-chips") {
    const current = draft.refine.bathroomsMin;
    return (
      <div className="flex flex-wrap gap-2">
        {section.options.map((o) => (
          <Chip
            key={o.value}
            size="sm"
            showCheck={false}
            selected={current === o.value}
            onClick={() => {
              const val = current === o.value ? undefined : (o.value as number);
              setDraft({ ...draft, refine: { ...draft.refine, bathroomsMin: val } });
            }}
          >
            {o.label}
          </Chip>
        ))}
      </div>
    );
  }

  const arr = (draft.refine[section.key] as string[]) || [];
  return (
    <div className="flex flex-wrap gap-2">
      {section.options.map((o) => (
        <Chip
          key={o.value}
          size="sm"
          selected={arr.includes(o.value)}
          onClick={() =>
            setDraft({ ...draft, refine: { ...draft.refine, [section.key]: toggleInArray(arr, o.value) } })
          }
        >
          {o.label}
        </Chip>
      ))}
    </div>
  );
}

// --- open section view (Square Yards style: all sections open by default) ---

function OpenSection({
  section,
  draft,
  setDraft,
}: {
  section: FilterSection;
  draft: SearchState;
  setDraft: (s: SearchState) => void;
}) {
  const count = sectionActiveCount(section, draft);
  return (
    <section data-section={section.key} className="border-b border-slate-100 py-4 last:border-0 dark:border-slate-800">
      <div className="mb-3 flex items-center justify-between">
        <span className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
          {section.title}
          {count > 0 && (
            <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-600 px-1.5 text-[10px] font-bold text-white">
              {count}
            </span>
          )}
        </span>
      </div>
      <div>
        <SectionBody section={section} draft={draft} setDraft={setDraft} />
      </div>
    </section>
  );
}

function FilterSections({
  draft,
  setDraft,
}: {
  draft: SearchState;
  setDraft: (s: SearchState) => void;
}) {
  const sections = filterSectionsFor(draft.intent);
  return (
    <div>
      {sections.map((section) => (
        <OpenSection key={section.key} section={section} draft={draft} setDraft={setDraft} />
      ))}
    </div>
  );
}

// --- desktop rail --------------------------------------------

export function FilterRail({
  state,
  onChange,
}: {
  state: SearchState;
  onChange: (next: SearchState) => void;
}) {
  const count = countActiveFilters(state);
  return (
    <aside className="sticky top-[8.5rem] hidden h-fit max-h-[calc(100vh-10rem)] w-[300px] shrink-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 md:flex">
      <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-slate-800">
        <p className="text-base font-bold text-slate-900 dark:text-white">
          Filters {count > 0 && <span className="ml-1 text-rose-600 dark:text-rose-400">({count})</span>}
        </p>
        {count > 0 && (
          <button type="button" onClick={() => onChange(clearAllFilters(state))} className={linkButton}>
            Clear all
          </button>
        )}
      </div>
      <div className="overflow-y-auto px-5 py-2">
        <FilterSections draft={state} setDraft={onChange} />
      </div>
    </aside>
  );
}

// --- mobile sheet ---------------------------------------------

export function FilterSheet({
  open,
  onClose,
  state,
  onSubmit,
  onApply,
}: {
  open: boolean;
  onClose: () => void;
  state: SearchState;
  onSubmit?: (next: SearchState) => void;
  onApply?: (next: SearchState) => void;
  focusKey?: string | null;
  resultCount?: number;
}) {
  const [draft, setDraft] = React.useState(state);

  React.useEffect(() => {
    if (open) setDraft(state);
  }, [open, state]);

  if (!open) return null;

  const count = countActiveFilters(draft);

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/40 backdrop-blur-xs">
      <div className="flex h-full w-full max-w-md flex-col bg-white shadow-2xl dark:bg-slate-900">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-slate-800">
          <p className="text-base font-bold text-slate-900 dark:text-white">
            Filters {count > 0 && <span className="text-rose-600">({count})</span>}
          </p>
          <div className="flex items-center gap-3">
            {count > 0 && (
              <button
                type="button"
                onClick={() => setDraft(clearAllFilters(draft))}
                className="text-xs font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              >
                Reset
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-2">
          <FilterSections draft={draft} setDraft={setDraft} />
        </div>

        {/* Footer */}
        <div className="flex gap-3 border-t border-slate-100 p-4 dark:border-slate-800">
          <button type="button" className={ghostButton} onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className={primaryButton}
            onClick={() => {
              (onSubmit || onApply)?.(draft);
              onClose();
            }}
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
}
