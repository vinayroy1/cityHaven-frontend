import React from "react";
import { HeaderNav } from "@/app/homePage/components/HeaderNav";

export default function PropertyDetailLoading() {
  return (
    <main className="min-h-screen bg-white text-zinc-900 dark:bg-slate-950 dark:text-slate-100 transition-colors duration-150">
      <HeaderNav />

      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-5 sm:px-6 lg:py-7">
        {/* Breadcrumb Skeleton */}
        <div className="flex gap-2 items-center">
          <div className="h-4 w-12 rounded bg-slate-200 dark:bg-slate-800 animate-pulse" />
          <span className="text-slate-300 dark:text-slate-700">/</span>
          <div className="h-4 w-20 rounded bg-slate-200 dark:bg-slate-800 animate-pulse" />
          <span className="text-slate-300 dark:text-slate-700">/</span>
          <div className="h-4 w-40 rounded bg-slate-200 dark:bg-slate-800 animate-pulse" />
        </div>

        {/* Hero Section Skeleton */}
        <section className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="h-8 w-80 max-w-full rounded-lg bg-slate-200 dark:bg-slate-800 animate-pulse" />
              <div className="h-4 w-48 rounded bg-slate-100 dark:bg-slate-800/60 animate-pulse" />
            </div>
            <div className="h-10 w-32 rounded-xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
          </div>

          {/* Quick Facts Grid Skeleton */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 pt-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-20 rounded-2xl border border-slate-100 bg-slate-50/70 p-3 dark:border-slate-800/80 dark:bg-slate-900/40 animate-pulse space-y-2">
                <div className="h-3 w-16 rounded bg-slate-200 dark:bg-slate-800" />
                <div className="h-5 w-24 rounded bg-slate-300 dark:bg-slate-700" />
              </div>
            ))}
          </div>
        </section>

        {/* Two-Column Body Skeleton */}
        <section className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start pt-2">
          {/* Main Gallery & Details Column */}
          <div className="space-y-6">
            {/* Gallery Strip Skeleton */}
            <div className="h-80 sm:h-96 w-full rounded-3xl bg-slate-200 dark:bg-slate-800 animate-pulse" />

            {/* Navigation Tabs Skeleton */}
            <div className="flex gap-6 border-b border-zinc-200 pb-3 dark:border-slate-800">
              <div className="h-4 w-20 rounded bg-slate-200 dark:bg-slate-800 animate-pulse" />
              <div className="h-4 w-28 rounded bg-slate-200 dark:bg-slate-800 animate-pulse" />
              <div className="h-4 w-20 rounded bg-slate-200 dark:bg-slate-800 animate-pulse" />
            </div>

            {/* Content Cards Skeleton */}
            <div className="space-y-4">
              <div className="h-44 rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 animate-pulse space-y-3">
                <div className="h-5 w-36 rounded bg-slate-200 dark:bg-slate-800" />
                <div className="h-3 w-full rounded bg-slate-100 dark:bg-slate-800/60" />
                <div className="h-3 w-5/6 rounded bg-slate-100 dark:bg-slate-800/60" />
                <div className="h-3 w-2/3 rounded bg-slate-100 dark:bg-slate-800/60" />
              </div>
            </div>
          </div>

          {/* Sticky Sidebar Skeleton */}
          <aside className="space-y-4">
            <div className="h-72 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 animate-pulse space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-slate-200 dark:bg-slate-800" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 w-28 rounded bg-slate-200 dark:bg-slate-800" />
                  <div className="h-3 w-20 rounded bg-slate-100 dark:bg-slate-800/60" />
                </div>
              </div>
              <div className="h-11 w-full rounded-2xl bg-emerald-100 dark:bg-emerald-950/40" />
              <div className="h-11 w-full rounded-2xl bg-slate-100 dark:bg-slate-800/60" />
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}
