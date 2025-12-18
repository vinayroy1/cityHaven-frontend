"use client";

import React, { useEffect, useMemo, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { AlertTriangle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { StateMessage } from "@/components/ui/state-message";
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
      propertySubType: searchParams.get("propertySubType") || undefined,
      postedBy: searchParams.get("postedBy") || undefined,
      constructionStatus: searchParams.get("constructionStatus") || undefined,
      furnishing: searchParams.get("furnishing") || undefined,
      investmentOptions: searchParams.get("investmentOptions") || undefined,
      amenities: searchParams.get("amenities") || undefined,
      occupancy: searchParams.get("occupancy") || undefined,
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

  const renderSkeletonCards = (count = 4) => (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, idx) => (
        <div key={idx} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-2">
              <Skeleton className="h-5 w-44" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
            <Skeleton className="h-20 w-28 rounded-xl" />
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {Array.from({ length: 3 }).map((_, pillIdx) => (
              <Skeleton key={pillIdx} className="h-6 w-20 rounded-full" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="flex-1 space-y-4">
      {isFetching && !items.length && renderSkeletonCards(4)}

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
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
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
              images={item.media?.map((media) => media.url).filter(Boolean) ?? []}
            />
          ))}
        </div>
      )}

      <div ref={sentinelRef} className="h-1 w-full" />

      {isFetchingNextPage && (
        <div className="space-y-2">
          <Skeleton className="h-3 w-24 rounded-full" />
          {renderSkeletonCards(2)}
        </div>
      )}
      {isError && (
        <StateMessage
          tone="error"
          title="We hit a snag loading properties"
          description="This section couldn’t refresh. Your filters are still applied—please retry."
          action={{ label: "Retry", onClick: () => refetch() }}
        />
      )}
    </div>
  );
}
