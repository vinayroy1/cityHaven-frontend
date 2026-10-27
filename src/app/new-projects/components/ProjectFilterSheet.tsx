"use client";

import React from "react";
import { createPortal } from "react-dom";
import { X, SlidersHorizontal, Check, RotateCcw, Loader2 } from "lucide-react";

export interface ProjectFilterState {
  status: string;
  bhk: string;
  budgetMin?: number;
  budgetMax?: number;
  sortBy: "featured" | "price_asc" | "price_desc";
  verifiedOnly: boolean;
}

export const STATUS_OPTIONS = [
  { label: "All Status", value: "ALL" },
  { label: "Under Construction", value: "UNDER_CONSTRUCTION" },
  { label: "Ready to Move", value: "READY_TO_MOVE" },
  { label: "New Launch", value: "NEW_LAUNCH" },
];

export const BHK_OPTIONS = ["All", "1 BHK", "2 BHK", "3 BHK", "4 BHK", "5+ BHK"];

export const BUDGET_MIN_PRESETS = [
  { label: "No Min", value: undefined },
  { label: "₹50 L", value: 5000000 },
  { label: "₹1 Cr", value: 10000000 },
  { label: "₹1.5 Cr", value: 15000000 },
  { label: "₹2 Cr", value: 20000000 },
  { label: "₹3 Cr", value: 30000000 },
  { label: "₹5 Cr", value: 50000000 },
];

export const BUDGET_MAX_PRESETS = [
  { label: "No Max", value: undefined },
  { label: "₹1 Cr", value: 10000000 },
  { label: "₹1.5 Cr", value: 15000000 },
  { label: "₹2 Cr", value: 20000000 },
  { label: "₹3 Cr", value: 30000000 },
  { label: "₹5 Cr", value: 50000000 },
  { label: "₹10 Cr+", value: 100000000 },
];

interface ProjectFilterSheetProps {
  open: boolean;
  onClose: () => void;
  state: ProjectFilterState;
  onApply: (next: ProjectFilterState) => void;
  totalResultsCount?: number;
}

export function ProjectFilterRail({
  state,
  onChange,
  onReset,
}: {
  state: ProjectFilterState;
  onChange: (next: ProjectFilterState) => void;
  onReset: () => void;
}) {
  const activeCount = Number(state.status !== "ALL") + Number(state.bhk !== "All") + Number(state.budgetMin !== undefined || state.budgetMax !== undefined) + Number(state.verifiedOnly) + Number(state.sortBy !== "featured");

  return (
    <aside className="sticky top-24 hidden max-h-[calc(100vh-7rem)] w-72 shrink-0 flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 md:flex">
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-slate-800">
        <div className="flex items-center gap-2"><SlidersHorizontal className="h-4 w-4 text-rose-500" /><h2 className="font-bold">Filters {activeCount > 0 && <span className="text-rose-600">({activeCount})</span>}</h2></div>
        {activeCount > 0 && <button type="button" onClick={onReset} className="text-xs font-semibold text-rose-600">Reset</button>}
      </div>
      <div className="space-y-5 overflow-y-auto p-5">
        <FilterChoice label="Project Status" options={STATUS_OPTIONS} value={state.status} onChange={(status) => onChange({ ...state, status })} />
        <FilterChoice label="Unit Configuration" options={BHK_OPTIONS.map((value) => ({ label: value, value }))} value={state.bhk} onChange={(bhk) => onChange({ ...state, bhk })} compact />
        <div>
          <FilterLabel>Budget Range</FilterLabel>
          <div className="grid grid-cols-2 gap-2">
            <BudgetSelect label="Min" value={state.budgetMin} options={BUDGET_MIN_PRESETS} onChange={(budgetMin) => onChange({ ...state, budgetMin })} />
            <BudgetSelect label="Max" value={state.budgetMax} options={BUDGET_MAX_PRESETS} onChange={(budgetMax) => onChange({ ...state, budgetMax })} />
          </div>
        </div>
        <FilterChoice label="Sort By" options={[{ label: "Featured", value: "featured" }, { label: "Price: Low to High", value: "price_asc" }, { label: "Price: High to Low", value: "price_desc" }]} value={state.sortBy} onChange={(sortBy) => onChange({ ...state, sortBy: sortBy as ProjectFilterState["sortBy"] })} />
        <label className="flex cursor-pointer items-start justify-between gap-3 rounded-xl bg-slate-50 p-3 dark:bg-slate-800/70">
          <span><span className="block text-xs font-bold">RERA approved only</span><span className="mt-0.5 block text-[10px] leading-4 text-slate-500">Show projects with valid registration</span></span>
          <input type="checkbox" checked={state.verifiedOnly} onChange={(event) => onChange({ ...state, verifiedOnly: event.target.checked })} className="mt-0.5 h-4 w-4 accent-rose-600" />
        </label>
      </div>
    </aside>
  );
}

function FilterLabel({ children }: { children: React.ReactNode }) {
  return <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">{children}</p>;
}

function FilterChoice({ label, options, value, onChange, compact = false }: { label: string; options: { label: string; value: string }[]; value: string; onChange: (value: string) => void; compact?: boolean }) {
  return <div><FilterLabel>{label}</FilterLabel><div className={compact ? "flex flex-wrap gap-1.5" : "grid gap-1.5"}>{options.map((option) => <button key={option.value} type="button" onClick={() => onChange(option.value)} className={`rounded-xl border px-3 py-2 text-left text-xs font-semibold transition ${value === option.value ? "border-rose-500 bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-300" : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"}`}>{option.label}</button>)}</div></div>;
}

function BudgetSelect({ label, value, options, onChange }: { label: string; value?: number; options: { label: string; value: number | undefined }[]; onChange: (value?: number) => void }) {
  return <label><span className="mb-1 block text-[10px] font-semibold text-slate-400">{label}</span><select value={value ?? ""} onChange={(event) => onChange(event.target.value ? Number(event.target.value) : undefined)} className="h-9 w-full rounded-xl border border-slate-200 bg-slate-50 px-2 text-xs font-semibold outline-none dark:border-slate-700 dark:bg-slate-800">{options.map((option) => <option key={option.label} value={option.value ?? ""}>{option.label}</option>)}</select></label>;
}

export function ProjectFilterSheet({
  open,
  onClose,
  state,
  onApply,
  totalResultsCount,
}: ProjectFilterSheetProps) {
  const [draft, setDraft] = React.useState<ProjectFilterState>(state);
  const [mounted, setMounted] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    if (open) {
      setDraft(state);
      setIsSubmitting(false);
    }
  }, [open]);

  // Lock body scroll on mobile while sheet is open
  React.useEffect(() => {
    if (!open || typeof window === "undefined") return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  if (!open || !mounted || typeof document === "undefined") return null;

  const countActive = () => {
    let count = 0;
    if (draft.status !== "ALL") count++;
    if (draft.bhk !== "All") count++;
    if (draft.budgetMin !== undefined || draft.budgetMax !== undefined) count++;
    if (draft.verifiedOnly) count++;
    if (draft.sortBy !== "featured") count++;
    return count;
  };

  const activeCount = countActive();

  const handleReset = () => {
    setDraft({
      status: "ALL",
      bhk: "All",
      budgetMin: undefined,
      budgetMax: undefined,
      sortBy: "featured",
      verifiedOnly: false,
    });
  };

  const handleApply = () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    onApply(draft);
    setTimeout(() => {
      onClose();
      setIsSubmitting(false);
    }, 500);
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex h-full w-full flex-col justify-end overflow-hidden md:flex-row md:justify-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-150"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sheet Content: Bottom sheet on mobile, slide-over panel on desktop */}
      <div
        data-filter-modal="true"
        className="relative z-10 flex max-h-[90%] w-full shrink-0 flex-col rounded-t-3xl border-t border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900 animate-in slide-in-from-bottom duration-200 md:max-h-full md:w-full md:max-w-md md:rounded-none md:border-t-0 md:border-l md:slide-in-from-right"
      >
        {/* Grab handle indicator on mobile */}
        <div className="mx-auto mt-3 mb-1.5 h-1.5 w-12 shrink-0 rounded-full bg-slate-300 dark:bg-slate-700 md:hidden" />

        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-rose-500" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Project Filters {activeCount > 0 && <span className="text-rose-600">({activeCount})</span>}
            </h2>
          </div>
          <div className="flex items-center gap-3">
            {activeCount > 0 && (
              <button
                type="button"
                onClick={handleReset}
                className="text-xs font-semibold text-rose-600 hover:text-rose-700 dark:text-rose-400"
              >
                Reset All
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
              aria-label="Close filters"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Filter Options */}
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6">
          {/* 1. Development / Construction Status */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2.5">
              Project Status
            </label>
            <div className="grid grid-cols-2 gap-2">
              {STATUS_OPTIONS.map((opt) => {
                const isSelected = draft.status === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setDraft((d) => ({ ...d, status: opt.value }))}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-xl border text-xs font-bold transition text-left ${
                      isSelected
                        ? "border-rose-600 bg-rose-50 text-rose-700 dark:border-rose-500 dark:bg-rose-950/40 dark:text-rose-300"
                        : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800/80 dark:text-slate-300"
                    }`}
                  >
                    <span>{opt.label}</span>
                    {isSelected && <Check className="h-3.5 w-3.5 text-rose-600 dark:text-rose-400 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. BHK Configurations */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2.5">
              Unit Configuration (BHK)
            </label>
            <div className="flex flex-wrap gap-2">
              {BHK_OPTIONS.map((bhk) => {
                const isSelected = draft.bhk === bhk;
                return (
                  <button
                    key={bhk}
                    type="button"
                    onClick={() => setDraft((d) => ({ ...d, bhk }))}
                    className={`px-3.5 py-2 rounded-xl border text-xs font-bold transition ${
                      isSelected
                        ? "border-rose-600 bg-rose-600 text-white shadow-xs"
                        : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300"
                    }`}
                  >
                    {bhk}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Budget Range */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2.5">
              Budget Range
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="block text-[11px] font-semibold text-slate-400 mb-1">Min Price</span>
                <select
                  value={draft.budgetMin !== undefined ? String(draft.budgetMin) : ""}
                  onChange={(e) =>
                    setDraft((d) => ({
                      ...d,
                      budgetMin: e.target.value ? Number(e.target.value) : undefined,
                    }))
                  }
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs font-bold text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 focus:outline-none"
                >
                  {BUDGET_MIN_PRESETS.map((p) => (
                    <option key={p.label} value={p.value !== undefined ? String(p.value) : ""}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <span className="block text-[11px] font-semibold text-slate-400 mb-1">Max Price</span>
                <select
                  value={draft.budgetMax !== undefined ? String(draft.budgetMax) : ""}
                  onChange={(e) =>
                    setDraft((d) => ({
                      ...d,
                      budgetMax: e.target.value ? Number(e.target.value) : undefined,
                    }))
                  }
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs font-bold text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 focus:outline-none"
                >
                  {BUDGET_MAX_PRESETS.map((p) => (
                    <option key={p.label} value={p.value !== undefined ? String(p.value) : ""}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* 4. Sort Order */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2.5">
              Sort By
            </label>
            <div className="grid grid-cols-1 gap-2">
              {[
                { label: "Featured & Popular First", value: "featured" },
                { label: "Price: Low to High", value: "price_asc" },
                { label: "Price: High to Low", value: "price_desc" },
              ].map((opt) => {
                const isSelected = draft.sortBy === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setDraft((d) => ({ ...d, sortBy: opt.value as any }))}
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl border text-xs font-bold transition text-left ${
                      isSelected
                        ? "border-rose-600 bg-rose-50 text-rose-700 dark:border-rose-500 dark:bg-rose-950/40 dark:text-rose-300"
                        : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800/80 dark:text-slate-300"
                    }`}
                  >
                    <span>{opt.label}</span>
                    {isSelected && <Check className="h-3.5 w-3.5 text-rose-600 dark:text-rose-400 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 5. Verified / RERA Only Toggle */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <label className="flex items-center justify-between cursor-pointer py-1">
              <div>
                <span className="block text-xs font-bold text-slate-900 dark:text-slate-100">
                  RERA Approved Only
                </span>
                <span className="block text-[11px] text-slate-500 dark:text-slate-400">
                  Only show verified projects with valid RERA numbers
                </span>
              </div>
              <input
                type="checkbox"
                checked={draft.verifiedOnly}
                onChange={(e) => setDraft((d) => ({ ...d, verifiedOnly: e.target.checked }))}
                className="h-4 w-4 rounded text-rose-600 focus:ring-rose-500"
              />
            </label>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="border-t border-slate-100 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 flex items-center gap-3">
          <button
            type="button"
            onClick={handleReset}
            disabled={isSubmitting}
            className="flex-1 h-11 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 transition"
          >
            Clear All
          </button>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleApply}
            className={`flex-1 h-11 rounded-xl bg-rose-600 text-xs font-bold text-white shadow-md shadow-rose-600/20 hover:bg-rose-700 transition flex items-center justify-center gap-1.5 ${
              isSubmitting ? "opacity-80 cursor-not-allowed" : ""
            }`}
          >
            {isSubmitting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Applying...</span>
              </>
            ) : (
              <span>Apply Filters {totalResultsCount !== undefined && `(${totalResultsCount})`}</span>
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
