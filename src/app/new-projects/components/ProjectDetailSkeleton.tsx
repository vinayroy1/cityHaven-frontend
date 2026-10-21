import React from "react";
import { HeaderNav } from "@/app/homePage/components/HeaderNav";

const Block = ({ className = "" }: { className?: string }) => (
  <div className={`animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800 ${className}`} />
);

export function ProjectDetailSkeleton() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <HeaderNav />

      <main className="flex-1 pb-20">
        <div className="mx-auto max-w-7xl space-y-6 px-4 py-5 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between" aria-busy="true" aria-label="Loading project details">
            <Block className="h-9 w-40 rounded-full" />
            <Block className="hidden h-4 w-72 sm:block" />
          </div>

          <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="grid gap-2 p-3 lg:grid-cols-12">
              <Block className="h-72 rounded-2xl sm:h-96 lg:col-span-8" />
              <div className="hidden gap-2 lg:col-span-4 lg:grid lg:grid-rows-2">
                <Block className="h-[188px] rounded-2xl" />
                <Block className="h-[188px] rounded-2xl" />
              </div>
            </div>

            <div className="flex flex-col gap-4 border-t border-slate-100 p-5 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-2">
                <Block className="h-3 w-24" />
                <Block className="h-8 w-64 max-w-full" />
                <Block className="h-3 w-36" />
              </div>
              <div className="flex gap-2">
                <Block className="h-9 w-20 rounded-full" />
                <Block className="h-9 flex-1 rounded-full sm:w-36" />
                <Block className="h-9 flex-1 rounded-full sm:w-40" />
              </div>
            </div>
          </section>

          <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="space-y-2 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <Block className="h-3 w-24 max-w-full" />
                <Block className="h-5 w-32 max-w-full" />
              </div>
            ))}
          </section>

          <section className="space-y-5 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8">
            <div className="flex flex-col gap-3 border-b border-slate-100 pb-5 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-2">
                <Block className="h-6 w-52" />
                <Block className="h-4 w-72 max-w-full" />
              </div>
              <div className="flex gap-2">
                {Array.from({ length: 3 }).map((_, index) => (
                  <Block key={index} className="h-8 w-16 rounded-full" />
                ))}
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="space-y-3 rounded-2xl border border-slate-100 p-4 dark:border-slate-800">
                  <Block className="h-5 w-24" />
                  <Block className="h-4 w-full" />
                  <Block className="h-4 w-3/4" />
                  <Block className="h-10 w-full rounded-full" />
                </div>
              ))}
            </div>
          </section>

          <div className="grid gap-6 lg:grid-cols-3">
            <Block className="h-52 rounded-3xl lg:col-span-2" />
            <Block className="h-52 rounded-3xl" />
          </div>
        </div>
      </main>
    </div>
  );
}
