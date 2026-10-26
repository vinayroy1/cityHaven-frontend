import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Users, ShieldCheck, HeartHandshake, Sparkles } from "lucide-react";
import { HeaderNav } from "@/app/homePage/components/HeaderNav";
import { FlatmateListingWizard } from "@/components/flatmates/FlatmateListingWizard";
import { buildCanonical } from "@/constants/seo";
import { BackButton } from "@/components/common/BackButton";

export const metadata: Metadata = {
  title: "Post Flatmate Requirement | Find Roommates with Zero Brokerage - Awasio",
  description:
    "List your available room or search for flatmates with shared lifestyle habits, diet, and sleep preferences on Awasio.",
  alternates: { canonical: buildCanonical("/flatmates/post") },
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
    title: "Post Flatmate Requirement | Find Roommates with Zero Brokerage - Awasio",
    description:
      "List your available room or search for flatmates with shared lifestyle habits, diet, and sleep preferences on Awasio.",
    url: buildCanonical("/flatmates/post"),
    type: "website",
  },
};

export default function PostFlatmatePage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 flex flex-col transition-colors duration-150">
      {/* Global Navigation Header */}
      <HeaderNav />

      {/* Main Content Area */}
      <main className="relative flex-1 bg-gradient-to-br from-rose-50/60 via-white to-amber-50/40 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_10%,rgba(244,63,94,0.08),transparent_38%),radial-gradient(circle_at_88%_0%,rgba(245,158,11,0.08),transparent_34%)]" />

        <div className="relative mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
          {/* Top Breadcrumbs & Back Navigation */}
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200/80 dark:border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <BackButton fallbackHref="/flatmate" label="Back to Flatmates" variant="pill" />

              <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <span>/</span>
                <Link href="/" className="hover:underline">Home</Link>
                <span>/</span>
                <Link href="/flatmate" className="hover:underline">Flatmates</Link>
                <span>/</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">Post Requirement</span>
              </div>
            </div>

            <div className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 px-3 py-1 rounded-full w-fit">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>100% Free • Direct Roommate Chat • Zero Brokerage</span>
            </div>
          </div>

          {/* Header Highlight Banner */}
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-3xl border border-rose-200/80 bg-gradient-to-r from-rose-50/90 via-white to-amber-50/60 p-5 shadow-sm dark:border-rose-900/40 dark:bg-slate-900 dark:from-slate-900 dark:to-slate-900">
            <div className="flex items-center gap-3.5">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-600 text-white shadow-md shadow-rose-600/30 shrink-0">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white">
                  Find Your Ideal Roommate or Share Your Flat
                </h1>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Whether you have an empty room, need a bed, or want to buddy up to rent together.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Link
                href="/propertyListing"
                className="text-xs font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white underline underline-offset-4"
              >
                Looking to list entire property?
              </Link>
            </div>
          </div>

          {/* Listing Wizard */}
          <FlatmateListingWizard />
        </div>
      </main>
    </div>
  );
}
