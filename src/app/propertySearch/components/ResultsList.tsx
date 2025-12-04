"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AlertTriangle, Loader2 } from "lucide-react";
import { ResultCard } from "./ResultCard";
import { useLazySearchPropertiesQuery } from "@/features/propertyListing/api";
import type { PropertySearchItem } from "@/types/propertySearch.types";

export function ResultsList() {
  const searchParams = useSearchParams();
  const [items, setItems] = useState<PropertySearchItem[]>([]);
  const [cursor, setCursor] = useState<number | null>(null);
  const [trigger, { data, isFetching, isError }] = useLazySearchPropertiesQuery();

  const filters = useMemo(() => {
    return {
      q: searchParams.get("q") || undefined,
      cityId: searchParams.get("cityId") || undefined,
      listingType: searchParams.get("listingType") || undefined,
      bedrooms: searchParams.get("bedrooms") || undefined,
      priceMin: searchParams.get("priceMin") || undefined,
      priceMax: searchParams.get("priceMax") || undefined,
      sort: searchParams.get("sort") || undefined,
    };
  }, [searchParams]);

  useEffect(() => {
    setItems([]);
    setCursor(null);
    void trigger({ ...filters, pageSize: 10, cursor: null });
  }, [filters, trigger]);

  useEffect(() => {
    if (data?.items) {
      setItems((prev) => (cursor ? [...prev, ...data.items] : data.items));
      setCursor(data.nextCursor ?? null);
    }
  }, [data]); // eslint-disable-line react-hooks/exhaustive-deps

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
          {items.map((item) => (
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

      {cursor && (
        <button
          type="button"
          onClick={() => trigger({ ...filters, pageSize: 10, cursor })}
          disabled={isFetching}
          className="w-full rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm hover:-translate-y-0.5 disabled:opacity-60"
        >
          {isFetching ? "Loading..." : "Load more"}
        </button>
      )}
    </div>
  );
}
