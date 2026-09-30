"use client";

import React from "react";
import { ChevronDown, X } from "lucide-react";
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
import { primaryButton, ghostButton, linkButton, muted } from "./theme";

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
    case "bedrooms":
      return s.bedroomsMin != null ? 1 : 0;
    case "bathrooms":
      return s.refine.bathroomsMin != null ? 1 : 0;
    default:
      return (s.refine[section.key] as string[]).length;
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
  const quickRanges = buildQuickRanges(presets, format);

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
      <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-800/50">
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

      <div className="flex flex-wrap gap-2">
        {quickRanges.map((range) => (
          <Chip
            key={range.label}
            size="sm"
            showCheck={false}
            selected={lo === range.lo && hi === range.hi}
            onClick={() => onChange([range.lo, range.hi])}
          >
            {range.label}
          </Chip>
        ))}
        {(lo != null || hi != null) && (
          <Chip size="sm" showCheck={false} selected={false} onClick={() => onChange([undefined, undefined])}>
            Clear
          </Chip>
        )}
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
    <label className="block">
      <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-slate-500 dark:text-slate-400">{label}</span>
      <select
        value={value ?? ""}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-900 outline-none transition focus:border-rose-300 focus:ring-2 focus:ring-rose-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:border-rose-500 dark:focus:ring-rose-500/20"
      >
        <option value="" className="bg-white text-slate-900 dark:bg-slate-800 dark:text-white">{placeholder}</option>
        {options.map((option) => (
          <option key={option} value={option} className="bg-white text-slate-900 dark:bg-slate-800 dark:text-white">
            {format(option)}
          </option>
        ))}
      </select>
    </label>
  );
}

function buildQuickRanges(presets: number[], format: (v: number) => string) {
  if (presets.length < 4) return [];
  const first = presets[0];
  const low = presets[Math.min(2, presets.length - 1)];
  const midLo = presets[Math.floor(presets.length * 0.35)];
  const midHi = presets[Math.floor(presets.length * 0.65)];
  const high = presets[Math.max(presets.length - 3, 0)];
  return [
    { label: `Under ${format(low)}`, lo: undefined, hi: low },
    { label: `${format(midLo)} - ${format(midHi)}`, lo: midLo, hi: midHi },
    { label: `${format(high)}+`, lo: high, hi: undefined },
  ].filter((range, index, arr) => index === arr.findIndex((item) => item.label === range.label));
}

// --- section body -------------------------------------------------

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
    const config = budgetConfig(draft);
    const presets = budget ? config.presets : AREA_PRESETS;
    const fmt = budget ? config.format : (v: number) => `${v.toLocaleString("en-IN")} sq.ft`;
    const [lo, hi] = readRange(draft, budget);
    const label = budget ? config.label : section.title;
    return (
      <RangePicker
        presets={presets}
        format={fmt}
        label={label}
        lo={lo}
        hi={hi}
        onChange={(next) => setDraft(writeRange(draft, budget, next))}
      />
    );
  }

  if (section.kind === "min-chips") {
    const current = section.key === "bedrooms" ? draft.bedroomsMin : draft.refine.bathroomsMin;
    return (
      <div className="flex flex-wrap gap-2">
        {section.options.map((o) => (
          <Chip
            key={o.value}
            size="sm"
            showCheck={false}
            selected={current === o.value}
            onClick={() => {
              const val = current === o.value ? undefined : o.value;
              setDraft(
                section.key === "bedrooms"
                  ? { ...draft, bedroomsMin: val }
                  : { ...draft, refine: { ...draft.refine, bathroomsMin: val } },
              );
            }}
          >
            {o.label}
          </Chip>
        ))}
      </div>
    );
  }

  const arr = draft.refine[section.key] as string[];
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

// --- accordion section ------------------------------------------

function AccordionSection({
  section,
  draft,
  setDraft,
  open,
  onToggle,
}: {
  section: FilterSection;
  draft: SearchState;
  setDraft: (s: SearchState) => void;
  open: boolean;
  onToggle: () => void;
}) {
  const count = sectionActiveCount(section, draft);
  return (
    <section data-section={section.key} className="border-b border-slate-100 last:border-0 dark:border-slate-800">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between py-3.5 text-left"
        aria-expanded={open}
      >
        <span className="flex items-center gap-2 text-[15px] font-semibold text-slate-900 dark:text-white">
          {section.title}
          {count > 0 && (
            <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-slate-900 px-1.5 text-[11px] font-semibold text-white dark:bg-slate-100 dark:text-slate-900">
              {count}
            </span>
          )}
        </span>
        <ChevronDown className={cn("h-4 w-4 shrink-0 text-slate-400 transition", open && "rotate-180")} />
      </button>
      {open && (
        <div className="pb-4">
          <SectionBody section={section} draft={draft} setDraft={setDraft} />
        </div>
      )}
    </section>
  );
}

// --- the section list -------------------------------------------

const DEFAULT_OPEN = new Set(["budget", "bedrooms", "subType"]);

function FilterSections({
  draft,
  setDraft,
  focusKey,
}: {
  draft: SearchState;
  setDraft: (s: SearchState) => void;
  focusKey?: string | null;
}) {
  const sections = filterSectionsFor(draft.intent);
  const server = sections.filter((s) => s.server);
  const client = sections.filter((s) => !s.server);
  const refRoot = React.useRef<HTMLDivElement>(null);

  const [openKeys, setOpenKeys] = React.useState<Set<string>>(() => {
    const set = new Set(DEFAULT_OPEN);
    sections.forEach((s) => {
      if (sectionActiveCount(s, draft) > 0) set.add(s.key);
    });
    if (focusKey) set.add(focusKey);
    return set;
  });

  React.useEffect(() => {
    if (!focusKey) return;
    setOpenKeys((prev) => new Set(prev).add(focusKey));
    const t = setTimeout(() => {
      refRoot.current
        ?.querySelector(`[data-section="${focusKey}"]`)
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 60);
    return () => clearTimeout(t);
  }, [focusKey]);

  const toggle = (key: string) =>
    setOpenKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  const renderGroup = (group: FilterSection[]) =>
    group.map((section) => (
      <AccordionSection
        key={section.key}
        section={section}
        draft={draft}
        setDraft={setDraft}
        open={openKeys.has(section.key)}
        onToggle={() => toggle(section.key)}
      />
    ));

  return (
    <div ref={refRoot}>
      {renderGroup(server)}
      {client.length > 0 && (
        <>
          <p className="flex items-center gap-2 pb-1 pt-5 text-[11px] font-semibold uppercase tracking-[0.06em] text-slate-400 dark:text-slate-500">
            More filters
            <span className="h-px flex-1 bg-slate-100 dark:bg-slate-800" />
          </p>
          {renderGroup(client)}
        </>
      )}
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
    <aside className="sticky top-[8.5rem] hidden h-fit max-h-[calc(100vh-10rem)] w-[300px] shrink-0 flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)] dark:border-slate-800 dark:bg-slate-900 lg:flex">
      <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-slate-800">
        <p className="text-[15px] font-semibold text-slate-900 dark:text-white">
          Filters{count > 0 && <span className="ml-1.5 text-rose-600 dark:text-rose-400">{count}</span>}
        </p>
        {count > 0 && (
          <button type="button" onClick={() => onChange(clearAllFilters(state))} className={linkButton}>
            Clear all
          </button>
        )}
      </div>
      <div className="overflow-y-auto px-5 py-1">
        <FilterSections draft={state} setDraft={onChange} />
      </div>
    </aside>
  );
}

// --- mobile bottom sheet ------------------------------------

export function FilterSheet({
  open,
  onClose,
  state,
  onApply,
  focusKey,
  resultCount,
}: {
  open: boolean;
  onClose: () => void;
  state: SearchState;
  onApply: (next: SearchState) => void;
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
    <div className="fixed inset-0 z-[60] flex flex-col justify-end bg-slate-900/40 lg:hidden">
      <div className="absolute inset-0" onClick={onClose} aria-hidden />
      <div className="relative z-10 flex max-h-[90vh] flex-col rounded-t-[20px] bg-white shadow-[0_-8px_40px_-12px_rgba(15,23,42,0.25)] dark:border-t dark:border-slate-800 dark:bg-slate-900">
        <div className="shrink-0 px-4 pb-2 pt-3">
          <div className="mx-auto h-1 w-9 rounded-full bg-slate-200 dark:bg-slate-700" />
          <div className="mt-3 flex items-center justify-between">
            <p className="text-base font-semibold text-slate-900 dark:text-white">
              Filters{count > 0 && <span className="ml-1.5 text-rose-600 dark:text-rose-400">{count}</span>}
            </p>
            <div className="flex items-center gap-3">
              {count > 0 && (
                <button type="button" onClick={() => setDraft(clearAllFilters(draft))} className={linkButton}>
                  Clear
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto border-t border-slate-100 px-4 dark:border-slate-800">
          <FilterSections draft={draft} setDraft={setDraft} focusKey={focusKey} />
        </div>

        <div className="flex shrink-0 gap-2 border-t border-slate-200 p-4 dark:border-slate-800">
          <button type="button" onClick={onClose} className={cn(ghostButton, "flex-1")}>
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              onApply(draft);
              onClose();
            }}
            className={cn(primaryButton, "flex-[2]")}
          >
            {typeof resultCount === "number" ? `Apply filters` : "Apply filters"}
          </button>
        </div>
      </div>
    </div>
  );
}

export { FilterSections };
