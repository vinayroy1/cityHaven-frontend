import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export const SearchSkeleton: React.FC = () => (
  <main className="min-h-screen bg-slate-50 text-slate-900">
    <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-6 sm:px-6">
      <div className="flex items-center justify-between gap-3">
        <div className="space-y-2">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-6 w-72" />
        </div>
        <Skeleton className="hidden h-10 w-40 rounded-full sm:block" />
      </div>

      <div className="flex flex-col gap-3 lg:flex-row">
        <div className="hidden w-80 lg:block">
          <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <Skeleton className="h-5 w-32" />
            {Array.from({ length: 6 }).map((_, idx) => (
              <div key={idx} className="space-y-2 rounded-xl bg-slate-50 p-3">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-3/4" />
              </div>
            ))}
          </div>
        </div>

        <div className="flex-1 space-y-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
            <Skeleton className="h-10 w-full" />
            <div className="mt-3 flex flex-wrap gap-2">
              {Array.from({ length: 4 }).map((_, idx) => (
                <Skeleton key={idx} className="h-8 w-24 rounded-full" />
              ))}
            </div>
          </div>

          {Array.from({ length: 5 }).map((_, idx) => (
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
      </div>
    </div>
  </main>
);
