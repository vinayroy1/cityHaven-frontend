"use client";

import React from "react";
import { X } from "lucide-react";
import {
  clearAllFilters,
  describeFilters,
  type SearchState,
} from "./searchQuery";
import { FURNISHING_OPTIONS, POSTED_BY_OPTIONS, budgetConfig } from "./searchConfig";
import { propertySubTypes } from "@/app/propertySearch/data";

const subTypeLabel = (slug: string) =>
  propertySubTypes.find((s) => s.slug === slug)?.name ?? slug;
const furnishingLabel = (v: string) => FURNISHING_OPTIONS.find((o) => o.value === v)?.label ?? v;
const postedAsLabel = (v: string) => POSTED_BY_OPTIONS.find((o) => o.value === v)?.label ?? v;

export function AppliedChips({
  state,
  onChange,
}: {
  state: SearchState;
  onChange: (next: SearchState) => void;
}) {
  const chips = describeFilters(state, {
    subType: subTypeLabel,
    furnishing: furnishingLabel,
    postedAs: postedAsLabel,
    money: (value) => `${budgetConfig(state).format(value)}${budgetConfig(state).monthly ? " / month" : ""}`,
  });

  if (!chips.length) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {chips.map((chip) => (
        <button
          key={chip.id}
          type="button"
          aria-label={`Remove ${chip.label}`}
          onClick={() => onChange(chip.remove(state))}
          className="group inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white py-1 pl-3 pr-2 text-[13px] font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
        >
          {chip.label}
          <X className="h-3.5 w-3.5 text-slate-400 transition group-hover:text-slate-700" />
        </button>
      ))}
      <button
        type="button"
        onClick={() => onChange(clearAllFilters(state))}
        className="text-[13px] font-semibold text-rose-600 hover:text-rose-700"
      >
        Clear all
      </button>
    </div>
  );
}
