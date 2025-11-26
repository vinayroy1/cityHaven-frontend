import React from "react";
import Link from "next/link";

export default function PriceTrendsPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <h1 className="text-2xl font-semibold">Price Trends</h1>
        <p className="mt-3 text-slate-600">
          Track locality-level price movements, absorption, and time-on-market. Replace this placeholder with your charts or analytics widgets.
        </p>
        <div className="mt-6 flex flex-wrap gap-3 text-sm">
          <Link href="/propertySearch" className="rounded-full bg-red-500 px-4 py-2 font-semibold text-white shadow-sm transition hover:-translate-y-0.5">
            Browse listings
          </Link>
          <Link href="/homePage" className="rounded-full border border-slate-200 px-4 py-2 font-semibold text-slate-800 shadow-sm transition hover:-translate-y-0.5">
            Back to home
          </Link>
        </div>
      </div>
    </main>
  );
}
