import React, { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Home, Building2, ShieldCheck, Users, Sparkles, Gift } from "lucide-react";
import { HeaderNav } from "@/app/homePage/components/HeaderNav";
import { PropertyListingFlow } from "@/components/propertyListing/PropertyListingFlow";
import { buildCanonical } from "@/constants/seo";
import { BackButton } from "@/components/common/BackButton";

export const metadata: Metadata = {
  title: "Post Property Free - Get 1,000 Free Credits on Signup | Awasio",
  description:
    "Post your property for free on Awasio. Get 1,000 free credits on signup to list properties, unlock verified tenant & buyer contacts, and boost your listing with zero brokerage.",
  keywords: [
    "post property free",
    "free 1000 credits property",
    "list property online",
    "post property for rent",
    "sell house online",
    "unlock contact credits",
    "boost property listing",
    "zero brokerage real estate india",
  ],
  alternates: { canonical: buildCanonical("/propertyListing") },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    title: "Post Property Free - Get 1,000 Free Credits on Signup | Awasio",
    description:
      "Post your property for free on Awasio. Get 1,000 free credits on signup to list properties, unlock verified contacts, and boost listing visibility.",
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

        <div className="relative mx-auto max-w-6xl px-3 sm:px-6 lg:px-8 py-3 sm:py-6">
          {/* Top Breadcrumbs & Back Bar */}
          <div className="mb-3 sm:mb-4 flex flex-row items-center justify-between gap-2 border-b border-slate-200/80 dark:border-slate-800 pb-2.5 sm:pb-3">
            <div className="flex items-center gap-2 sm:gap-3">
              <BackButton fallbackHref="/dashboard/properties" label="Back" variant="pill" />

              <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <span>/</span>
                <Link href="/" className="hover:underline">Home</Link>
                <span>/</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">Post Property</span>
              </div>
            </div>

            <div className="inline-flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 px-2.5 sm:px-3 py-1 rounded-full shrink-0">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span className="hidden sm:inline">100% Free Listing • Direct Verified Inquiries</span>
              <span className="sm:hidden">100% Free Listing</span>
            </div>
          </div>

          {/* 1,000 Free Credits Signup Highlight */}
          <div className="mb-4 sm:mb-6 rounded-2xl border border-amber-200/90 bg-gradient-to-r from-amber-50/90 via-rose-50/40 to-emerald-50/50 p-3 sm:p-4 shadow-2xs dark:border-amber-900/40 dark:from-amber-950/20 dark:via-slate-900 dark:to-slate-900">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:bg-amber-400/10 dark:text-amber-400">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center rounded-md bg-amber-500 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-white shadow-2xs">
                      1,000 Free Credits
                    </span>
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      Instant Signup Bonus for All Users
                    </span>
                  </div>
                  <p className="mt-0.5 text-[11px] text-slate-600 dark:text-slate-400">
                    Use your 1,000 credits to list properties, unlock verified direct tenant &amp; buyer contacts, and boost your listing to the top of search results.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0 text-[11px] font-semibold text-amber-800 dark:text-amber-300">
                <span className="rounded-full bg-white dark:bg-slate-800 px-3 py-1 border border-amber-200 dark:border-amber-800/60 shadow-2xs">
                  Zero Brokerage • Instant Activation
                </span>
              </div>
            </div>
          </div>

          {/* Mobile View: Ultra-Compact 2-Column Quick Portal Switcher (~44px height) */}
          <div className="sm:hidden mb-3 grid grid-cols-2 gap-2">
            <Link
              href="/post-project"
              className="flex items-center gap-2 rounded-xl border border-rose-200/90 bg-gradient-to-r from-rose-50/90 via-white to-amber-50/60 p-2 shadow-2xs active:scale-[0.98] transition dark:border-rose-900/40 dark:bg-slate-900/90 dark:from-slate-900 dark:to-slate-900"
            >
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-rose-500 text-white shadow-2xs">
                <Building2 className="h-3.5 w-3.5" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="block text-[11px] font-bold text-slate-900 dark:text-white truncate leading-tight">
                  Post Project
                </span>
                <span className="block text-[9px] font-semibold text-rose-600 dark:text-rose-400 truncate mt-0.5">
                  For Builders →
                </span>
              </div>
            </Link>

            <Link
              href="/flatmates/post"
              className="flex items-center gap-2 rounded-xl border border-indigo-200/90 bg-gradient-to-r from-indigo-50/90 via-white to-purple-50/60 p-2 shadow-2xs active:scale-[0.98] transition dark:border-indigo-900/40 dark:bg-slate-900/90 dark:from-slate-900 dark:to-slate-900"
            >
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-2xs">
                <Users className="h-3.5 w-3.5" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="block text-[11px] font-bold text-slate-900 dark:text-white truncate leading-tight">
                  Post Flatmate
                </span>
                <span className="block text-[9px] font-semibold text-indigo-600 dark:text-indigo-400 truncate mt-0.5">
                  Find Roommate →
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop View: Symmetrical Side-by-Side 2-Column Banner Grid */}
          <div className="hidden sm:grid sm:grid-cols-2 sm:gap-4 mb-6">
            {/* Builder / Project Owner Card */}
            <div className="flex items-center justify-between gap-3 rounded-2xl border border-rose-200/90 bg-gradient-to-r from-rose-50/80 via-white to-amber-50/50 p-3.5 shadow-2xs dark:border-rose-900/40 dark:bg-slate-900 dark:from-slate-900 dark:to-slate-900">
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-rose-100 text-rose-600 dark:bg-rose-950 dark:text-rose-400">
                  <Building2 className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    Listing a Project or Township?
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                    For builders, towers, floor plans & RERA.
                  </p>
                </div>
              </div>
              <Link
                href="/post-project"
                className="inline-flex items-center justify-center gap-1 rounded-full bg-slate-950 px-3 py-1.5 text-xs font-bold text-white shadow-2xs transition hover:bg-slate-800 dark:bg-white dark:text-slate-950 shrink-0"
              >
                <span>Project Portal</span>
                <span aria-hidden="true">&rarr;</span>
              </Link>
            </div>

            {/* Flatmate / Roommate Card */}
            <div className="flex items-center justify-between gap-3 rounded-2xl border border-indigo-200/90 bg-gradient-to-r from-indigo-50/80 via-white to-purple-50/50 p-3.5 shadow-2xs dark:border-indigo-900/40 dark:bg-slate-900 dark:from-slate-900 dark:to-slate-900">
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
                  <Users className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    Looking for Flatmates or Sharing?
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                    Post room requirements with habits & 0 brokerage.
                  </p>
                </div>
              </div>
              <Link
                href="/flatmates/post"
                className="inline-flex items-center justify-center gap-1 rounded-full bg-indigo-600 hover:bg-indigo-700 px-3 py-1.5 text-xs font-bold text-white shadow-2xs transition shrink-0"
              >
                <span>Post Flatmate</span>
                <span aria-hidden="true">&rarr;</span>
              </Link>
            </div>
          </div>

          {/* Form Wizard Flow */}
          <Suspense fallback={<div className="py-20 text-center text-sm text-slate-500 dark:text-slate-400">Loading property editor…</div>}>
            <PropertyListingFlow />
          </Suspense>
        </div>
      </main>
    </div>
  );
}

