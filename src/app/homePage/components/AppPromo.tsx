import React from "react";
import { Smartphone } from "lucide-react";

export function AppPromo() {
  return (
    <section className="mx-auto mt-12 max-w-6xl px-6">
      <div className="grid gap-6 rounded-[24px] border border-slate-200 bg-gradient-to-r from-rose-50 via-white to-indigo-50 p-8 shadow-lg dark:border-slate-800 dark:from-slate-900 dark:via-slate-900 dark:to-slate-900 md:grid-cols-[1.2fr_0.8fr] md:items-center">
        <div className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-600 dark:text-slate-400">CityHaven App</p>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Search, shortlist, and list your property on the go.</h3>
          <p className="text-slate-600 dark:text-slate-300">Instant alerts, site-visit slots, digital agreements, and loan offers in one place.</p>
          <div className="flex flex-wrap gap-3">
            <button className="rounded-full border border-slate-200 bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm dark:border-slate-700 dark:bg-rose-600">Get on Play Store</button>
            <button className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">Get on App Store</button>
          </div>
        </div>
        <div className="relative">
          <div className="absolute inset-0 -z-10 rounded-[24px] bg-gradient-to-tr from-red-100 via-white to-indigo-100 blur-2xl dark:from-rose-950/20 dark:to-indigo-950/20" />
          <div className="flex items-center justify-center rounded-[24px] border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-800">
            <Smartphone className="h-16 w-16 text-rose-500" />
          </div>
        </div>
      </div>
    </section>
  );
}
