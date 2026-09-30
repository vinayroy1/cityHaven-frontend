import React, { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Home, Building2, ShieldCheck } from "lucide-react";
import { HeaderNav } from "@/app/homePage/components/HeaderNav";
import { PropertyListingFlow } from "@/components/propertyListing/PropertyListingFlow";
import { Toaster } from "@/components/ui/sonner";
import { buildCanonical } from "@/constants/seo";

export const metadata: Metadata = {
  title: "Post your property - CityHaven",
  description: "List your property for rent or sale on CityHaven and reach verified buyers and tenants.",
  alternates: { canonical: buildCanonical("/propertyListing") },
  openGraph: {
    title: "Post your property - CityHaven",
    description: "List your property for rent or sale on CityHaven and reach verified buyers and tenants.",
    url: buildCanonical("/propertyListing"),
    type: "website",
  },
};

export default function PropertyListingPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 flex flex-col transition-colors duration-150">
      {/* Global Navigation Header */}
      <HeaderNav />

      {/* Main Content Area */}
      <main className="relative flex-1 bg-gradient-to-br from-rose-50/70 via-white to-emerald-50/50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_8%_12%,rgba(244,63,94,0.10),transparent_38%),radial-gradient(circle_at_92%_0%,rgba(16,185,129,0.10),transparent_34%)]" />

        <div className="relative mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
          {/* Top Breadcrumbs & Back Bar */}
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200/80 dark:border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <Link
                href="/dashboard/properties"
                className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-100 hover:text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-white"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Back to Dashboard</span>
              </Link>

              <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <span>/</span>
                <Link href="/homePage" className="hover:underline">Home</Link>
                <span>/</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">Post Property</span>
              </div>
            </div>

            <div className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 px-3 py-1 rounded-full w-fit">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>100% Free Listing • Direct Verified Inquiries</span>
            </div>
          </div>

          {/* Form Wizard Flow */}
          <Suspense fallback={<div className="py-20 text-center text-sm text-slate-500 dark:text-slate-400">Loading property editor…</div>}>
            <PropertyListingFlow />
          </Suspense>
        </div>
      </main>

      <Toaster richColors />
    </div>
  );
}

