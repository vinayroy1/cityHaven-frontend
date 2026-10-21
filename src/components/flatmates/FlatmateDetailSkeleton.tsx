import React from "react";
import { HeaderNav } from "@/app/homePage/components/HeaderNav";

const Block = ({ className = "" }: { className?: string }) => (
  <div className={`animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800 ${className}`} />
);

export function FlatmateDetailSkeleton() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <HeaderNav />

      <main className="flex-1 px-4 pb-28 pt-5 sm:px-6 lg:px-8 lg:pb-8">
        <div className="mx-auto max-w-6xl space-y-5" aria-busy="true" aria-label="Loading flatmate details">
          <div className="flex items-center justify-between">
            <Block className="h-9 w-36 rounded-full" />
            <Block className="h-9 w-20 rounded-full" />
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="space-y-5 lg:col-span-2">
              <Block className="h-64 w-full rounded-3xl sm:h-96" />

              <section className="space-y-5 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
                <div className="flex gap-2">
                  <Block className="h-6 w-24 rounded-full" />
                  <Block className="h-6 w-20 rounded-full" />
                </div>
                <div className="space-y-2.5">
                  <Block className="h-7 w-11/12 sm:w-3/4" />
                  <Block className="h-4 w-2/3 sm:w-1/2" />
                </div>
                <div className="grid grid-cols-2 gap-3 border-y border-slate-100 py-4 dark:border-slate-800 sm:grid-cols-4">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <div key={index} className="space-y-2">
                      <Block className="h-3 w-16" />
                      <Block className="h-5 w-24 max-w-full" />
                    </div>
                  ))}
                </div>
                <div className="space-y-2">
                  <Block className="h-3 w-36" />
                  <Block className="h-4 w-full" />
                  <Block className="h-4 w-5/6" />
                </div>
              </section>

              <section className="space-y-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
                <Block className="h-5 w-64 max-w-full" />
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <Block key={index} className="h-16 rounded-2xl" />
                  ))}
                </div>
              </section>
            </div>

            <aside>
              <div className="space-y-5 rounded-3xl border border-slate-200 bg-white p-5 shadow-md dark:border-slate-800 dark:bg-slate-900 sm:p-6 lg:sticky lg:top-24">
                <div className="space-y-2">
                  <Block className="h-3 w-24" />
                  <Block className="h-9 w-48" />
                </div>
                <Block className="h-12 w-full rounded-full" />
                <Block className="mx-auto h-3 w-3/4" />
                <div className="flex items-center gap-3 border-t border-slate-100 pt-5 dark:border-slate-800">
                  <Block className="h-12 w-12 shrink-0 rounded-2xl" />
                  <div className="flex-1 space-y-2">
                    <Block className="h-4 w-28" />
                    <Block className="h-3 w-20" />
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
}
