"use client";

import React from "react";
import { ChevronDown, X } from "lucide-react";
import { cn } from "@/components/ui/utils";
import { Slider } from "@/components/ui/slider";
import { Chip } from "./Chip";
import {
  clearAllFilters,
  countActiveFilters,
  type SearchState,
} from "./searchQuery";
import {
  AREA_PRESETS,
  BUDGET_PRESETS,
  filterSectionsFor,
  formatMoney,
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

// --- range slider ---------------------------------------------------

function RangeSlider({
  presets,
  format,
  lo,
  hi,
  onChange,
}: {
  presets: number[];
  format: (v: number) => string;
  lo: number | undefined;
  hi: number | undefined;
  onChange: (next: [number | undefined, number | undefined]) => void;
}) {
  const N = presets.length;
  // positions: 0 = "no min", 1..N = presets[pos-1], N+1 = "no max"
  const toPos = (v: number | undefined, end: "lo" | "hi") => {
    if (v == null) return end === "lo" ? 0 : N + 1;
    const i = presets.indexOf(v);
    return i >= 0 ? i + 1 : end === "lo" ? 0 : N + 1;
  };
  const [pos, setPos] = React.useState<[number, number]>([toPos(lo, "lo"), toPos(hi, "hi")]);
  React.useEffect(() => {
    setPos([toPos(lo, "lo"), toPos(hi, "hi")]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lo, hi]);

  const label = (p: number) => (p === 0 ? "No min" : p === N + 1 ? "No max" : format(presets[p - 1]));
  const commit = (p: [number, number]) =>
    onChange([p[0] === 0 ? undefined : presets[p[0] - 1], p[1] === N + 1 ? undefined : presets[p[1] - 1]]);

  return (
    <div className="space-y-3 pt-1">
      <div className="flex items-center justify-between text-sm font-semibold text-slate-900">
        <span>{label(pos[0])}</span>
        <span className="text-slate-300">—</span>
        <span>{label(pos[1])}</span>
      </div>
      <Slider
        min={0}
        max={N + 1}
        step={1}
        minStepsBetweenThumbs={1}
        value={pos}
        onValueChange={(v) => setPos(v as [number, number])}
        onValueCommit={(v) => commit(v as [number, number])}
        className="py-1"
      />
    </div>
  );
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
    const presets = budget ? BUDGET_PRESETS[draft.intent] : AREA_PRESETS;
    const fmt = budget ? formatMoney : (v: number) => `${v.toLocaleString("en-IN")}`;
    const [lo, hi] = readRange(draft, budget);
    return (
      <RangeSlider
        presets={presets}
        format={fmt}
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
    <section data-section={section.key} className="border-b border-slate-100 last:border-0">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between py-3.5 text-left"
        aria-expanded={open}
      >
        <span className="flex items-center gap-2 text-[15px] font-semibold text-slate-900">
          {section.title}
          {count > 0 && (
            <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-slate-900 px-1.5 text-[11px] font-semibold text-white">
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
          <p className="flex items-center gap-2 pb-1 pt-5 text-[11px] font-semibold uppercase tracking-[0.06em] text-slate-400">
            More filters
            <span className="h-px flex-1 bg-slate-100" />
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
    <aside className="sticky top-[8.5rem] hidden h-fit max-h-[calc(100vh-10rem)] w-[300px] shrink-0 flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)] lg:flex">
      <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-5 py-4">
        <p className="text-[15px] font-semibold text-slate-900">
          Filters{count > 0 && <span className="ml-1.5 text-rose-600">{count}</span>}
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
      <div className="relative z-10 flex max-h-[90vh] flex-col rounded-t-[20px] bg-white shadow-[0_-8px_40px_-12px_rgba(15,23,42,0.25)]">
        <div className="shrink-0 px-4 pb-2 pt-3">
          <div className="mx-auto h-1 w-9 rounded-full bg-slate-200" />
          <div className="mt-3 flex items-center justify-between">
            <p className="text-base font-semibold text-slate-900">
              Filters{count > 0 && <span className="ml-1.5 text-rose-600">{count}</span>}
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
                className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-600"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto border-t border-slate-100 px-4">
          <FilterSections draft={draft} setDraft={setDraft} focusKey={focusKey} />
        </div>

        <div className="flex shrink-0 gap-2 border-t border-slate-200 p-4">
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
