"use client";

import React from "react";
import { createPortal } from "react-dom";
import { ArrowLeft, RotateCcw, Search, SlidersHorizontal } from "lucide-react";
import { FilterSectionsEditor } from "./FilterSheet";
import { clearAllFilters, countActiveFilters, type SearchState } from "./searchQuery";

type Props = {
  open: boolean;
  onClose: () => void;
  value: SearchState;
  onSubmit: (next: SearchState) => void;
  resultCount?: number;
  renderSearchEditor: (draft: SearchState, setDraft: (next: SearchState) => void) => React.ReactNode;
};

export function MobileSearchFlow({ open, onClose, value, onSubmit, resultCount, renderSearchEditor }: Props) {
  const [mounted, setMounted] = React.useState(false);
  const [draft, setDraft] = React.useState(value);
  const [viewportStyle, setViewportStyle] = React.useState<React.CSSProperties>({});

  React.useEffect(() => setMounted(true), []);
  React.useEffect(() => {
    if (open) setDraft(value);
  }, [open, value]);

  React.useEffect(() => {
    if (!open || typeof window === "undefined") return;

    const scrollY = window.scrollY;
    const previous = {
      position: document.body.style.position,
      top: document.body.style.top,
      width: document.body.style.width,
      overflow: document.body.style.overflow,
    };
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = "100%";
    document.body.style.overflow = "hidden";

    // Preserve the layout viewport while the keyboard overlays lower content.
    setViewportStyle({
      position: "fixed",
      inset: 0,
      width: "100%",
    });
    return () => {
      document.body.style.position = previous.position;
      document.body.style.top = previous.top;
      document.body.style.width = previous.width;
      document.body.style.overflow = previous.overflow;
      window.scrollTo(0, scrollY);
    };
  }, [open]);

  if (!open || !mounted || typeof document === "undefined") return null;

  const activeCount = countActiveFilters(draft);
  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Search and filter properties"
      data-mobile-search-flow="true"
      style={viewportStyle}
      className="fixed inset-0 z-[9000] flex h-[100svh] w-full flex-col overflow-hidden bg-slate-50 text-slate-900 sm:hidden dark:bg-slate-950 dark:text-white"
    >
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-3 dark:border-slate-800 dark:bg-slate-900">
        <button type="button" onClick={onClose} aria-label="Back" className="flex h-10 w-10 items-center justify-center rounded-full text-slate-700 active:bg-slate-100 dark:text-slate-200 dark:active:bg-slate-800">
          <ArrowLeft size={20} />
        </button>
        <div className="text-center">
          <p className="text-sm font-bold">Search properties</p>
          <p className="text-[10px] text-slate-500 dark:text-slate-400">Choose location and filters</p>
        </div>
        <button
          type="button"
          onClick={() => setDraft(clearAllFilters(draft))}
          className="flex h-10 items-center gap-1 rounded-full px-2 text-xs font-semibold text-slate-500 active:bg-slate-100 dark:text-slate-400 dark:active:bg-slate-800"
        >
          <RotateCcw size={13} /> Reset
        </button>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-8 pt-4">
        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          {renderSearchEditor(draft, setDraft)}
        </section>

        <div className="mb-1 mt-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <SlidersHorizontal size={16} className="text-rose-600" />
            <h2 className="text-sm font-bold">Property filters</h2>
          </div>
          {activeCount > 0 && <span className="rounded-full bg-rose-50 px-2 py-1 text-[10px] font-bold text-rose-700 dark:bg-rose-950/50 dark:text-rose-300">{activeCount} selected</span>}
        </div>
        <FilterSectionsEditor draft={draft} setDraft={setDraft} />
      </div>

      <footer className="relative z-20 shrink-0 border-t border-slate-200 bg-white p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-[0_-8px_30px_-20px_rgba(15,23,42,0.5)] dark:border-slate-800 dark:bg-slate-900">
        <button
          type="button"
          onClick={() => onSubmit(draft)}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-rose-600 px-5 text-sm font-bold text-white shadow-lg shadow-rose-600/20 active:scale-[0.99]"
        >
          <Search size={18} />
          {resultCount == null ? "Search properties" : "Apply & search"}
        </button>
      </footer>
    </div>,
    document.body,
  );
}
