"use client";

import React from "react";
import {
  usePropertySearchInfinite,
  useFlatmatesSearchInfinite,
} from "@/features/propertyListing/useQueries";
import type { PropertySearchItem } from "@/types/propertySearch.types";
import type { FlatmateListing } from "@/types/flatmate.types";
import {
  applyClientRefinements,
  applyFlatmateRefinements,
  hasClientRefinements,
  toApiParams,
  type SearchState,
} from "./searchQuery";
import { subTypeSlugToId } from "./searchConfig";

const BASE_PAGE_SIZE = 12;
const REFINE_PAGE_SIZE = 30;
const MAX_AUTO_PAGES = 5;
const MIN_VISIBLE_TARGET = 6;

export type SearchResults = {
  visible: (PropertySearchItem | FlatmateListing)[];
  fetchedCount: number;
  total?: number;
  refining: boolean;
  isLoading: boolean;
  isFetchingNextPage: boolean;
  hasNextPage: boolean;
  isError: boolean;
  errorMessage?: string;
  fetchNextPage: () => void;
  refetch: () => void;
  isFlatmate: boolean;
};

export function useSearchResults(state: SearchState): SearchResults {
  const isFlatmate = state.intent === "FLATMATE";
  const refining = hasClientRefinements(state);

  const propertyApiParams = React.useMemo(
    () => toApiParams(state, refining ? REFINE_PAGE_SIZE : BASE_PAGE_SIZE),
    [state, refining],
  );

  const flatmateApiParams = React.useMemo(() => {
    if (!isFlatmate) return undefined;
    const params: Record<string, any> = {
      pageSize: 30,
    };
    if (state.cityName) params.city = state.cityName;
    if (state.localities.length > 0) params.locality = state.localities[0].label;
    if (state.priceMin != null) params.budgetMin = state.priceMin;
    if (state.priceMax != null) params.budgetMax = state.priceMax;
    if (state.refine.flatmateMode?.length === 1) params.mode = state.refine.flatmateMode[0];
    if (state.refine.roomType?.length === 1) params.roomType = state.refine.roomType[0];
    if (state.refine.gender?.length === 1) params.gender = state.refine.gender[0];
    if (state.refine.diet?.length === 1) params.preferredDiet = state.refine.diet[0];
    if (state.refine.furnishing?.length === 1) params.furnishing = state.refine.furnishing[0];
    if (state.refine.bhkTypes?.length === 1) {
      const match = state.refine.bhkTypes[0].match(/\d+/);
      if (match) params.bhk = Number(match[0]);
    }
    if (state.refine.lifestyle?.length === 1) {
      const rule = state.refine.lifestyle[0];
      if (rule === "PET_FRIENDLY") params.petsAllowed = true;
      if (rule === "NON_SMOKER") params.smokingAllowed = false;
      if (rule === "SMOKING_ALLOWED") params.smokingAllowed = true;
      if (rule === "DRINKING_ALLOWED") params.drinkingAllowed = true;
    }
    return params;
  }, [isFlatmate, state]);

  const propertyQuery = usePropertySearchInfinite(propertyApiParams, { enabled: !isFlatmate });
  const flatmateQuery = useFlatmatesSearchInfinite(flatmateApiParams, { enabled: isFlatmate });

  const activeQuery = isFlatmate ? flatmateQuery : propertyQuery;

  const visible = React.useMemo(() => {
    if (isFlatmate) {
      const items = (flatmateQuery.items || []) as FlatmateListing[];
      return refining ? applyFlatmateRefinements(items, state) : items;
    }
    const items = (propertyQuery.items || []) as PropertySearchItem[];
    return refining
      ? applyClientRefinements(items, state, subTypeSlugToId)
      : items;
  }, [isFlatmate, flatmateQuery.items, propertyQuery.items, refining, state]);

  // When client refinement hides most of a page, pull more pages automatically
  // (bounded) so the user doesn't see a near-empty list.
  const autoPagesRef = React.useRef(0);
  React.useEffect(() => {
    autoPagesRef.current = 0;
  }, [propertyApiParams, flatmateApiParams]);

  React.useEffect(() => {
    if (!refining || !activeQuery.hasNextPage || activeQuery.isFetchingNextPage || activeQuery.isFetching) return;
    if (visible.length >= MIN_VISIBLE_TARGET) return;
    if (autoPagesRef.current >= MAX_AUTO_PAGES) return;
    autoPagesRef.current += 1;
    activeQuery.fetchNextPage();
  }, [refining, activeQuery.hasNextPage, activeQuery.isFetchingNextPage, activeQuery.isFetching, visible.length, activeQuery.fetchNextPage]);

  return {
    visible,
    fetchedCount: activeQuery.items.length,
    total: activeQuery.total,
    refining,
    isLoading: activeQuery.isFetching && !activeQuery.isFetchingNextPage && activeQuery.items.length === 0,
    isFetchingNextPage: activeQuery.isFetchingNextPage,
    hasNextPage: activeQuery.hasNextPage,
    isError: activeQuery.isError,
    errorMessage: activeQuery.error instanceof Error ? activeQuery.error.message : undefined,
    fetchNextPage: activeQuery.fetchNextPage,
    refetch: activeQuery.refetch,
    isFlatmate,
  };
}
