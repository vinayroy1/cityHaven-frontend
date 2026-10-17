"use client";

import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export function FlatmateCardSkeleton() {
  return (
    <div className="relative flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-3 shadow-xs dark:border-slate-800 dark:bg-slate-900 overflow-hidden sm:p-3.5">
      <div className="space-y-2.5">
        {/* Card Media Banner */}
        <div className="relative h-32 w-full overflow-hidden rounded-xl bg-gradient-to-tr from-slate-200/70 via-rose-50/50 to-slate-200/70 sm:h-36 dark:from-slate-800 dark:via-slate-850 dark:to-slate-800 animate-pulse">
          {/* Mode tag placeholder */}
          <div className="absolute left-2.5 top-2.5">
            <Skeleton className="h-5 w-24 rounded-full bg-white/80 dark:bg-slate-700/80 shadow-xs" />
          </div>
          {/* Price badge placeholder */}
          <div className="absolute bottom-2 left-2.5">
            <Skeleton className="h-6 w-24 rounded-lg bg-slate-900/60 dark:bg-slate-950/80" />
          </div>
        </div>

        {/* Title & Location */}
        <div className="space-y-1.5 px-0.5">
          <Skeleton className="h-4 w-4/5 rounded dark:bg-slate-800" />
          <div className="flex items-center gap-1">
            <Skeleton className="h-3 w-3 rounded-full dark:bg-slate-800" />
            <Skeleton className="h-3 w-28 rounded dark:bg-slate-800" />
          </div>
        </div>

        {/* Specifications row */}
        <div className="flex flex-wrap items-center gap-1 px-0.5 pt-0.5">
          <Skeleton className="h-5 w-16 rounded-md dark:bg-slate-800" />
          <Skeleton className="h-5 w-14 rounded-md dark:bg-slate-800" />
          <Skeleton className="h-5 w-20 rounded-md dark:bg-slate-800" />
        </div>

        {/* Decision details box */}
        <div className="rounded-lg bg-slate-50/90 p-2 dark:bg-slate-800/60 space-y-1">
          <Skeleton className="h-2.5 w-40 rounded dark:bg-slate-700/70" />
        </div>

        {/* Compatibility badge */}
        <div className="px-0.5">
          <Skeleton className="h-4 w-24 rounded-full dark:bg-slate-800" />
        </div>
      </div>

      {/* Poster Footer */}
      <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2 dark:border-slate-800/80">
        <div className="flex items-center gap-2">
          <Skeleton className="h-7 w-7 rounded-full dark:bg-slate-800" />
          <div className="space-y-0.5">
            <Skeleton className="h-3 w-16 rounded dark:bg-slate-800" />
            <Skeleton className="h-2 w-24 rounded dark:bg-slate-800" />
          </div>
        </div>
        <Skeleton className="h-7 w-16 rounded-full bg-rose-200/80 dark:bg-rose-950/60" />
      </div>
    </div>
  );
}

export function FlatmateGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 sm:gap-4.5">
      {Array.from({ length: count }).map((_, i) => (
        <FlatmateCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function FlatmateSearchPageSkeleton() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 flex flex-col">
      {/* Hero Header Area */}
      <section className="relative overflow-hidden border-b border-slate-200/80 bg-white px-4 py-5 dark:border-slate-800 dark:bg-slate-900/60 sm:px-6 sm:py-8 lg:px-8">
        <div className="relative mx-auto max-w-7xl">
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-2">
              <Skeleton className="h-5 w-32 rounded-full bg-rose-100 dark:bg-rose-950/60" />
              <Skeleton className="h-8 w-80 sm:w-96 rounded-xl dark:bg-slate-800" />
              <Skeleton className="h-4 w-60 sm:w-80 rounded-md dark:bg-slate-800" />
            </div>
            <Skeleton className="hidden h-11 w-44 rounded-2xl bg-rose-100 sm:block dark:bg-rose-950/60" />
          </div>
        </div>
      </section>

      {/* Search Bar + Controls */}
      <section className="mx-auto max-w-7xl px-3 py-3 sm:px-6 sm:py-6 lg:px-8 w-full">
        <div className="flex flex-col gap-3 rounded-2xl border border-slate-200/90 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:gap-4 sm:rounded-3xl sm:p-5">
          <div className="grid grid-cols-1 gap-2 md:grid-cols-[auto_minmax(12rem,1fr)_auto]">
            <Skeleton className="h-11 w-40 rounded-xl dark:bg-slate-800" />
            <Skeleton className="h-11 w-full rounded-xl dark:bg-slate-800" />
            <Skeleton className="hidden h-11 w-28 rounded-xl bg-rose-200 md:block dark:bg-rose-950/60" />
          </div>
        </div>

        {/* Content Area with Filter Rail and Cards Grid */}
        <div className="mt-6 flex items-start gap-6">
          <div className="min-w-0 flex-1">
            <div className="mb-5 flex items-center justify-between">
              <Skeleton className="h-4 w-48 rounded dark:bg-slate-800" />
              <Skeleton className="h-4 w-24 rounded dark:bg-slate-800" />
            </div>
            <FlatmateGridSkeleton count={6} />
          </div>

          {/* Filter Rail on Desktop */}
          <div className="hidden pt-5 md:block">
            <div className="sticky top-[8.5rem] w-[300px] shrink-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
              <Skeleton className="h-5 w-28 rounded dark:bg-slate-800" />
              <div className="space-y-3 pt-2">
                {Array.from({ length: 4 }).map((_, idx) => (
                  <div key={idx} className="space-y-2 rounded-xl bg-slate-50 p-3 dark:bg-slate-800/50">
                    <Skeleton className="h-4 w-24 rounded dark:bg-slate-800" />
                    <Skeleton className="h-3 w-full rounded dark:bg-slate-800" />
                    <Skeleton className="h-3 w-3/4 rounded dark:bg-slate-800" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
