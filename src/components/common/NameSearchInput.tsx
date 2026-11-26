"use client";

import React from "react";
import { Search, X } from "lucide-react";

/**
 * Search-by-name box for directory pages. Searches as you type (debounced), on Enter, and on blur;
 * the clear button resets it. `value` is the applied search, so a parent "Reset" also clears the box.
 */
export function NameSearchInput({
  value,
  onSearch,
  placeholder = "Search by name",
  ariaLabel = "Search by name",
  className = "",
}: {
  value: string;
  onSearch: (q: string) => void;
  placeholder?: string;
  ariaLabel?: string;
  className?: string;
}) {
  const [text, setText] = React.useState(value);
  const onSearchRef = React.useRef(onSearch);
  React.useEffect(() => {
    onSearchRef.current = onSearch;
  }, [onSearch]);

  // Parent cleared or changed the applied search (e.g. "Reset filters"): mirror it in the box.
  const [lastValue, setLastValue] = React.useState(value);
  if (value !== lastValue) {
    setLastValue(value);
    if (value !== text.trim()) setText(value);
  }

  React.useEffect(() => {
    const next = text.trim();
    if (next === value) return;
    const t = window.setTimeout(() => onSearchRef.current(next), next ? 400 : 0);
    return () => window.clearTimeout(t);
  }, [text, value]);

  return (
    <form
      role="search"
      className={`relative ${className}`}
      onSubmit={(e) => {
        e.preventDefault();
        onSearch(text.trim());
        (document.activeElement as HTMLElement | null)?.blur?.();
      }}
    >
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden />
      <input
        type="search"
        enterKeyHint="search"
        aria-label={ariaLabel}
        placeholder={placeholder}
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-9 text-sm outline-none placeholder:text-slate-400 focus:border-rose-400 focus:ring-2 focus:ring-rose-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:ring-rose-900/40 [&::-webkit-search-cancel-button]:hidden"
      />
      {text && (
        <button
          type="button"
          aria-label="Clear search"
          onClick={() => {
            setText("");
            onSearch("");
          }}
          className="absolute right-1.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-700"
        >
          <X className="h-4 w-4" aria-hidden />
        </button>
      )}
    </form>
  );
}
