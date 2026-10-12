"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, Building2, Sparkles, UserPlus, ShieldCheck } from "lucide-react";
import { PropertyListingFlow } from "@/components/propertyListing/PropertyListingFlow";

export default function AdminPropertyCreatePage() {
  return (
    <div className="space-y-6">
      {/* Top Header & Navigation */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-rose-500">
            <Link
              href="/admin/properties"
              className="inline-flex items-center gap-1 hover:text-rose-600 transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Property Quality Control
            </Link>
            <span className="text-slate-300 dark:text-slate-700">/</span>
            <span className="text-slate-500 dark:text-slate-400">Assisted Sourcing</span>
          </div>

          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Building2 className="h-6 w-6 text-rose-500" />
            List Property on Behalf of Owner
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5 max-w-3xl leading-relaxed">
            Company employee assisted listing flow. Uses the full Awasio property engine with real-time deduplication checking across Residential, Commercial, PG &amp; Plot categories, with automatic owner shadow account linking.
          </p>
        </div>

        <Link
          href="/admin/properties"
          className="inline-flex items-center gap-1.5 self-start sm:self-auto rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to QC Queue
        </Link>
      </div>

      {/* Embedded Full-Scope Property Listing Flow in Admin Mode */}
      <PropertyListingFlow adminMode={true} onSuccessRedirect="/admin/properties" />
    </div>
  );
}
