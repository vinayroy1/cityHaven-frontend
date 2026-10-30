import React from "react";
import { HeaderNav } from "@/app/homePage/components/HeaderNav";

const Block = ({ className = "" }: { className?: string }) => (
  <div className={`animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800 ${className}`} />
);

export function FlatmateDetailSkeleton() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <HeaderNav />

      <main className="flex-1 px-4 pb-28 pt-5 sm:px-6 lg:px-8 lg:pb-8">
        <div className="mx-auto max-w-6xl space-y-6" aria-busy="true" aria-label="Loading flatmate details">
          {/* Top Bar Skeleton */}
          <div className="flex items-center justify-between">
            <Block className="h-9 w-36 rounded-full" />
            <Block className="h-9 w-20 rounded-full" />
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 items-start">
            {/* Left 2 Columns: Main Details */}
            <div className="space-y-6 lg:col-span-2">
              {/* Profile / Hero Banner Skeleton */}
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 sm:p-7">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
                  <Block className="h-28 w-28 sm:h-36 sm:w-36 rounded-3xl shrink-0" />
                  <div className="flex-1 space-y-3 w-full">
                    <Block className="h-6 w-36 rounded-full" />
                    <Block className="h-8 w-3/4 rounded-xl" />
                    <Block className="h-4 w-1/2 rounded-lg" />
                    <Block className="h-4 w-2/3 rounded-lg" />
                  </div>
                </div>
              </div>

              {/* 4 Stats Cards Skeleton */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-2">
                    <Block className="h-3 w-16" />
                    <Block className="h-6 w-24" />
                    <Block className="h-3 w-20" />
                  </div>
                ))}
              </div>

              {/* Preferences Section Skeleton */}
              <section className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                <Block className="h-5 w-48 rounded-lg" />
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <Block key={index} className="h-16 rounded-2xl" />
                  ))}
                </div>
              </section>

              {/* Bio Section Skeleton */}
              <section className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                <Block className="h-5 w-36 rounded-lg" />
                <Block className="h-20 w-full rounded-2xl" />
              </section>
            </div>

            {/* Right Column: Sticky Action Card Skeleton */}
            <aside>
              <div className="space-y-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-md dark:border-slate-800 dark:bg-slate-900 lg:sticky lg:top-24">
                <div className="space-y-2">
                  <Block className="h-3 w-24" />
                  <Block className="h-9 w-44" />
                </div>
                <Block className="h-12 w-full rounded-full" />
                <div className="space-y-2 border-t border-slate-100 pt-4 dark:border-slate-800">
                  <Block className="h-4 w-full rounded-lg" />
                  <Block className="h-4 w-5/6 rounded-lg" />
                  <Block className="h-4 w-3/4 rounded-lg" />
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
}
