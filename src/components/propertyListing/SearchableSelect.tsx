"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { Search, ChevronDown, Check, X, Plus } from "lucide-react";
import { cn } from "@/components/ui/utils";

export interface SearchableSelectOption {
  value: string;
  label: string;
  badge?: string;
  description?: string;
}

interface SearchableSelectProps {
  value: string;
  onChange: (val: string) => void;
  options: (string | SearchableSelectOption)[];
  placeholder?: string;
  searchPlaceholder?: string;
  disabled?: boolean;
  emptyMessage?: string;
  allowCustom?: boolean;
  customValue?: string;
  customLabel?: string;
  onCustomSelect?: (customVal: string) => void;
  className?: string;
  hasError?: boolean;
  maxDisplayResults?: number;
}

export function SearchableSelect({
  value,
  onChange,
  options,
  placeholder = "Select option",
  searchPlaceholder = "Type to search...",
  disabled = false,
  emptyMessage = "No results found",
  allowCustom = false,
  customValue = "__CUSTOM__",
  customLabel = "+ Enter Custom Locality",
  onCustomSelect,
  className = "",
  hasError = false,
  maxDisplayResults = 100,
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Normalize options to uniform { value, label } structure
  const normalizedOptions: SearchableSelectOption[] = useMemo(() => {
    return options.map((opt) => {
      if (typeof opt === "string") {
        return { value: opt, label: opt };
      }
      return opt;
    });
  }, [options]);

  // Find currently selected label
  const selectedLabel = useMemo(() => {
    if (!value) return "";
    if (value === customValue) return customLabel;
    const found = normalizedOptions.find(
      (o) => o.value.toLowerCase() === value.toLowerCase(),
    );
    return found ? found.label : value;
  }, [value, normalizedOptions, customValue, customLabel]);

  // Filter options based on search query
  const filteredOptions = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return normalizedOptions;

    // Prioritize options starting with search query, followed by contains
    const startsWith: SearchableSelectOption[] = [];
    const contains: SearchableSelectOption[] = [];

    for (const opt of normalizedOptions) {
      const lower = opt.label.toLowerCase();
      if (lower.startsWith(q)) {
        startsWith.push(opt);
      } else if (lower.includes(q)) {
        contains.push(opt);
      }
    }

    return [...startsWith, ...contains];
  }, [normalizedOptions, search]);

  const displayedOptions = useMemo(() => {
    return filteredOptions.slice(0, maxDisplayResults);
  }, [filteredOptions, maxDisplayResults]);

  // Handle outside clicks
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Reset search and highlight on open / close
  useEffect(() => {
    if (isOpen) {
      setSearch("");
      setHighlightedIndex(-1);
      // Auto-focus search input with small delay for animation / render
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === "Enter" || e.key === "ArrowDown" || e.key === " ") {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    if (e.key === "Escape") {
      e.preventDefault();
      setIsOpen(false);
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev < displayedOptions.length - 1 ? prev + 1 : 0,
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev > 0 ? prev - 1 : displayedOptions.length - 1,
      );
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (
        highlightedIndex >= 0 &&
        highlightedIndex < displayedOptions.length
      ) {
        handleSelect(displayedOptions[highlightedIndex].value);
      } else if (allowCustom && search.trim()) {
        handleCustom(search.trim());
      }
    }
  };

  const handleSelect = (val: string) => {
    onChange(val);
    setIsOpen(false);
  };

  const handleCustom = (customText?: string) => {
    if (onCustomSelect && customText) {
      onCustomSelect(customText);
    }
    onChange(customValue);
    setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("");
  };

  // Helper to highlight matching text
  const renderHighlightedLabel = (text: string, highlight: string) => {
    if (!highlight.trim()) return text;
    const parts = text.split(new RegExp(`(${highlight.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi"));
    return (
      <span>
        {parts.map((part, i) =>
          part.toLowerCase() === highlight.toLowerCase() ? (
            <strong key={i} className="font-bold text-rose-600 dark:text-rose-400">
              {part}
            </strong>
          ) : (
            part
          ),
        )}
      </span>
    );
  };

  return (
    <div
      ref={containerRef}
      className={cn("relative w-full", className)}
      onKeyDown={handleKeyDown}
    >
      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen((prev) => !prev)}
        className={cn(
          "flex h-10 w-full items-center justify-between rounded-xl border bg-white px-3 text-left text-sm text-slate-800 transition outline-none dark:bg-slate-900 dark:text-slate-100",
          hasError
            ? "border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-200 dark:border-rose-700"
            : "border-slate-200 hover:border-slate-300 focus:border-slate-400 focus:ring-2 focus:ring-slate-200 dark:border-slate-700 dark:hover:border-slate-600 dark:focus:ring-slate-800",
          disabled && "cursor-not-allowed opacity-50 bg-slate-50 dark:bg-slate-800",
          isOpen && "border-slate-400 ring-2 ring-slate-200 dark:border-slate-600 dark:ring-slate-800",
        )}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span
          className={cn(
            "truncate pr-2",
            !selectedLabel && "text-slate-400 dark:text-slate-500",
          )}
        >
          {selectedLabel || placeholder}
        </span>
        <div className="flex items-center gap-1 shrink-0 text-slate-400">
          {value && !disabled && (
            <span
              role="button"
              tabIndex={-1}
              onClick={handleClear}
              className="rounded p-0.5 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300 transition"
              title="Clear selection"
            >
              <X className="h-3.5 w-3.5" />
            </span>
          )}
          <ChevronDown
            className={cn(
              "h-4 w-4 transition-transform duration-200",
              isOpen && "rotate-180 text-slate-600 dark:text-slate-200",
            )}
          />
        </div>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1.5 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-950 animate-in fade-in-0 zoom-in-95 duration-150">
          {/* Sticky Search Header */}
          <div className="border-b border-slate-100 p-2 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/50">
            <div className="relative flex items-center">
              <Search className="pointer-events-none absolute left-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                ref={searchInputRef}
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setHighlightedIndex(0);
                }}
                placeholder={searchPlaceholder}
                className="w-full rounded-lg border border-slate-200 bg-white py-1.5 pl-8 pr-7 text-xs text-slate-800 outline-none placeholder:text-slate-400 focus:border-rose-400 focus:ring-1 focus:ring-rose-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Results count / info bar */}
            <div className="flex items-center justify-between px-1 pt-1.5 text-[11px] text-slate-400">
              <span>
                {filteredOptions.length === 0
                  ? "0 matches"
                  : `${filteredOptions.length} ${filteredOptions.length === 1 ? "option" : "options"}`}
              </span>
              {filteredOptions.length > maxDisplayResults && (
                <span className="text-[10px] text-slate-400">
                  Showing top {maxDisplayResults} (type to narrow)
                </span>
              )}
            </div>
          </div>

          {/* Options List */}
          <div
            ref={listRef}
            className="max-h-60 overflow-y-auto p-1.5 space-y-0.5 text-xs"
            role="listbox"
          >
            {displayedOptions.length > 0 ? (
              displayedOptions.map((opt, idx) => {
                const isSelected =
                  value && opt.value.toLowerCase() === value.toLowerCase();
                const isHighlighted = idx === highlightedIndex;

                return (
                  <button
                    key={`${opt.value}-${idx}`}
                    type="button"
                    aria-label={opt.label}
                    onClick={() => handleSelect(opt.value)}
                    className={cn(
                      "flex w-full items-center justify-between rounded-xl px-2.5 py-2 text-left text-xs transition",
                      isSelected
                        ? "bg-rose-50 font-semibold text-rose-700 dark:bg-rose-950/40 dark:text-rose-300"
                        : isHighlighted
                          ? "bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-100"
                          : "text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-900",
                    )}
                    role="option"
                    aria-selected={Boolean(isSelected)}
                  >
                    <span className="truncate pr-2">
                      {renderHighlightedLabel(opt.label, search)}
                    </span>
                    {isSelected && (
                      <Check className="h-3.5 w-3.5 shrink-0 text-rose-600 dark:text-rose-400" />
                    )}
                  </button>
                );
              })
            ) : (
              <div className="py-4 text-center text-xs text-slate-400">
                <p>{emptyMessage}</p>
                {search && (
                  <p className="mt-0.5 text-[11px] text-slate-400">
                    No results matching &ldquo;{search}&rdquo;
                  </p>
                )}
              </div>
            )}

            {/* Quick Custom Option if allowCustom is enabled */}
            {allowCustom && (
              <div className="border-t border-slate-100 pt-1 mt-1 dark:border-slate-800">
                {search.trim() ? (
                  <button
                    type="button"
                    onClick={() => handleCustom(search.trim())}
                    className="flex w-full items-center gap-1.5 rounded-xl bg-amber-50/80 px-2.5 py-2 text-left text-xs font-semibold text-amber-800 hover:bg-amber-100 dark:bg-amber-950/30 dark:text-amber-300 dark:hover:bg-amber-950/50 transition"
                  >
                    <Plus className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                    <span className="truncate">
                      Use &ldquo;<strong>{search.trim()}</strong>&rdquo; as custom locality
                    </span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleCustom()}
                    className={cn(
                      "flex w-full items-center gap-1.5 rounded-xl px-2.5 py-2 text-left text-xs font-semibold transition",
                      value === customValue
                        ? "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300"
                        : "text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-900",
                    )}
                  >
                    <Plus className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <span>{customLabel}</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
