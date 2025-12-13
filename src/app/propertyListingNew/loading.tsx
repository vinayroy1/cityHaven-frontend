import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function LoadingPropertyListingNew() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 p-4 md:p-6">
      <div className="rounded-3xl border border-slate-200/80 bg-white/80 p-4 shadow-sm shadow-blue-50">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <div>
            <Skeleton className="mb-2 h-6 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-6 w-24 rounded-full" />
        </div>
        <Skeleton className="h-2 w-full" />
      </div>

      <div className="rounded-3xl border border-slate-200/80 bg-white/90 p-5 shadow-sm">
        <Skeleton className="mb-3 h-6 w-56" />
        <Skeleton className="mb-4 h-4 w-72" />
        <div className="grid gap-3 md:grid-cols-2">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div key={idx} className="space-y-2 rounded-2xl border border-slate-100/80 bg-slate-50/60 p-4">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap justify-end gap-2">
          <Skeleton className="h-10 w-20 rounded-full" />
          <Skeleton className="h-10 w-24 rounded-full" />
        </div>
      </div>
    </div>
  );
}
