"use client";

import React, { useEffect, useMemo, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { AlertTriangle, Loader2 } from "lucide-react";
import { ResultCard } from "./ResultCard";
import { usePropertySearchInfinite } from "@/features/propertyListing/useQueries";
import type { PropertySearchItem } from "@/types/propertySearch.types";

export function ResultsList() {
  const searchParams = useSearchParams();
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const filters = useMemo(() => {
    return {
      q: searchParams.get("q") || undefined,
      cityId: searchParams.get("cityId") || undefined,
      listingType: searchParams.get("listingType") || undefined,
      bedrooms: searchParams.get("bedrooms") || undefined,
      priceMin: searchParams.get("priceMin") || undefined,
      priceMax: searchParams.get("priceMax") || undefined,
      sort: searchParams.get("sort") || undefined,
      pageSize: 10,
    };
  }, [searchParams]);

  const { items, isFetching, isFetchingNextPage, hasNextPage, fetchNextPage, isError, refetch } = usePropertySearchInfinite(filters);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
          void fetchNextPage();
        }
      },
      { rootMargin: "200px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const showNoResults = !isFetching && !items.length && !isError;

  return (
    <div className="flex-1 space-y-4">
      {isFetching && !items.length && (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
            <Loader2 className="h-4 w-4 animate-spin text-sky-500" />
            Loading properties...
          </div>
        </div>
      )}

      {showNoResults && (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            No results matching your search
          </div>
          <p className="mt-1 text-xs text-slate-600">Try removing some filters to get more results.</p>
        </div>
      )}

      {!!items.length && (
        <div className="space-y-3">
          {items.map((item: PropertySearchItem) => (
            <ResultCard
              key={item.id}
              title={item.title}
              subtitle={[item.locality, item.subLocality, item.cityName].filter(Boolean).join(" · ")}
              price={item.price ? `₹${item.price.toLocaleString("en-IN")}` : "Price on request"}
              area={
                item.carpetArea && item.areaUnit
                  ? `${item.carpetArea} ${item.areaUnit.replace("_", " ")}`
                  : item.areaUnit
                  ? item.areaUnit
                  : "Area NA"
              }
              age={item.createdAt ? new Date(item.createdAt).toDateString() : "New"}
              owner={item.listingType || "Listing"}
              image={item.media?.[0]?.url ?? "/placeholder.png"}
            />
          ))}
        </div>
      )}

      <div ref={sentinelRef} className="h-1 w-full" />

      {isFetchingNextPage && (
        <div className="flex items-center justify-center gap-2 text-xs text-slate-600">
          <Loader2 className="h-4 w-4 animate-spin text-sky-500" />
          Loading more...
        </div>
      )}
      {isError && (
        <div className="text-xs text-rose-600">
          Something went wrong.{" "}
          <button type="button" onClick={() => refetch()} className="font-semibold underline">
            Retry
          </button>
        </div>
      )}
    </div>
  );
}
