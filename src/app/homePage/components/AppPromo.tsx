import React from "react";
import { Smartphone } from "lucide-react";

export function AppPromo() {
  return (
    <section className="mx-auto mt-12 max-w-6xl px-6">
      <div className="grid gap-6 rounded-[24px] border border-slate-200 bg-gradient-to-r from-rose-50 via-white to-indigo-50 p-8 shadow-lg md:grid-cols-[1.2fr_0.8fr] md:items-center">
        <div className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-600">CityHaven App</p>
          <h3 className="text-2xl font-semibold text-slate-900">Search, shortlist, and list your property on the go.</h3>
          <p className="text-slate-600">Instant alerts, site-visit slots, digital agreements, and loan offers in one place.</p>
          <div className="flex flex-wrap gap-3">
            <button className="rounded-full border border-slate-200 bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm">Get on Play Store</button>
            <button className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm">Get on App Store</button>
          </div>
        </div>
        <div className="relative">
          <div className="absolute inset-0 -z-10 rounded-[24px] bg-gradient-to-tr from-red-100 via-white to-indigo-100 blur-2xl" />
          <div className="flex items-center justify-center rounded-[24px] border border-slate-200 bg-white p-6 shadow-xl">
            <Smartphone className="h-16 w-16 text-red-500" />
          </div>
        </div>
      </div>
    </section>
  );
}
