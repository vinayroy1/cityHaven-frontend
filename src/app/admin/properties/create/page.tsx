"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, Building2, Sparkles, UserPlus, ShieldCheck } from "lucide-react";
import { PropertyListingFlow } from "@/components/propertyListing/PropertyListingFlow";
import { BackButton } from "@/components/common/BackButton";

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

        <BackButton
          fallbackHref="/admin/properties"
          label="Back to QC Queue"
          variant="button"
          className="self-start sm:self-auto"
        />
      </div>

      {/* Embedded Full-Scope Property Listing Flow in Admin Mode */}
      <PropertyListingFlow adminMode={true} onSuccessRedirect="/admin/properties" />
    </div>
  );
}
