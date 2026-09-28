"use client";

import React from "react";
import { SlidersHorizontal, ChevronDown } from "lucide-react";
import { Chip } from "./Chip";
import { countActiveFilters, type SearchState } from "./searchQuery";
import { filterSectionsFor, formatMoney } from "./searchConfig";

type Props = {
  state: SearchState;
  onOpenFilters: (focusKey?: string) => void;
};

function summarise(state: SearchState, key: string): string | null {
  switch (key) {
    case "budget": {
      if (state.priceMin == null && state.priceMax == null) return null;
      const lo = state.priceMin != null ? formatMoney(state.priceMin) : "Any";
      const hi = state.priceMax != null ? formatMoney(state.priceMax) : "Any";
      return `${lo}–${hi}`;
    }
    case "bedrooms":
      return state.bedroomsMin != null ? `${state.bedroomsMin}+ BHK` : null;
    case "bathrooms":
      return state.refine.bathroomsMin != null ? `${state.refine.bathroomsMin}+ Bath` : null;
    case "area":
      return state.refine.areaMin != null || state.refine.areaMax != null ? "Area" : null;
    case "subType":
      return state.refine.subType.length ? `Type · ${state.refine.subType.length}` : null;
    case "furnishing":
      return state.refine.furnishing.length ? `Furnishing · ${state.refine.furnishing.length}` : null;
    case "postedAs":
      return state.refine.postedAs.length ? `Posted by · ${state.refine.postedAs.length}` : null;
    default:
      return null;
  }
}

const DEFAULT_LABELS: Record<string, string> = {
  budget: "Budget",
  bedrooms: "BHK",
  bathrooms: "Bathrooms",
  area: "Area",
  subType: "Property type",
  furnishing: "Furnishing",
  postedAs: "Posted by",
};

export function QuickFilterChips({ state, onOpenFilters }: Props) {
  const sections = filterSectionsFor(state.intent);
  const count = countActiveFilters(state);

  return (
    <div className="-mx-4 flex items-center gap-2 overflow-x-auto px-4 pb-0.5 sm:mx-0 sm:px-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <Chip size="sm" showCheck={false} selected={count > 0} onClick={() => onOpenFilters()}>
        <SlidersHorizontal className="h-3.5 w-3.5" />
        All filters{count > 0 ? ` · ${count}` : ""}
      </Chip>

      {sections.map((section) => {
        const active = summarise(state, section.key);
        return (
          <Chip
            key={section.key}
            size="sm"
            showCheck={false}
            selected={!!active}
            onClick={() => onOpenFilters(section.key)}
          >
            {active ?? DEFAULT_LABELS[section.key] ?? section.title}
            <ChevronDown className="h-3.5 w-3.5 opacity-50" />
          </Chip>
        );
      })}
    </div>
  );
}
