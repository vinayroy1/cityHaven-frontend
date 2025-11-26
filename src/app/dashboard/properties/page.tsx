import React from "react";
import Link from "next/link";

export default function DashboardPropertiesPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 space-y-4">
        <h1 className="text-2xl font-semibold">Your Properties</h1>
        <p className="text-slate-600">Manage listed properties, leads, and visibility. Replace with real dashboard widgets.</p>
        <Link href="/propertyListing" className="inline-flex rounded-full bg-red-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5">
          Post a property
        </Link>
      </div>
    </main>
  );
}
