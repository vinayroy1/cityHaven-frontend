import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Landmark, ArrowRight } from "lucide-react";
import { buildCanonical, OG_IMAGE_URL } from "@/constants/seo";
import { HeaderNav } from "@/app/homePage/components/HeaderNav";
import { FooterLinks } from "@/app/homePage/components/FooterLinks";
import { PageBreadcrumbs } from "@/components/common/PageBreadcrumbs";
import { BankOffers } from "./BankOffers";

export const metadata: Metadata = {
  title: { absolute: "Home Loans - Awasio" },
  description: "Compare home loan options, calculate interest rates, and start your property journey with Awasio.",
  alternates: { canonical: buildCanonical("/home-loans") },
  openGraph: {
    title: "Home Loans - Awasio",
    description: "Compare home loan options, calculate interest rates, and start your property journey with Awasio.",
    url: buildCanonical("/home-loans"),
    type: "website",
    images: [{ url: OG_IMAGE_URL, width: 1200, height: 630, alt: "Awasio" }],
  },
};

export default function HomeLoansPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 flex flex-col transition-colors duration-150">
      <HeaderNav />

      <main className="flex-1">
        {/* Hero Section */}
        <div className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/50">
          <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 transition-colors"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Back to Home</span>
              </Link>
              <PageBreadcrumbs items={[{ label: "Home Loans" }]} renderJsonLd={true} />
            </div>

            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
              <Landmark className="h-4 w-4" />
              <span>Financing & Mortgages</span>
            </div>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950 dark:text-white sm:text-4xl">
              Home Loans Made Simple
            </h1>
            <p className="mt-2 max-w-2xl text-base text-slate-600 dark:text-slate-300">
              Compare indicative interest rates, check your eligibility, and get pre-approved loan assistance from leading banking partners.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/emi-calculator"
                className="inline-flex items-center gap-2 rounded-full bg-rose-600 px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-rose-200 transition hover:bg-rose-700 hover:shadow-lg active:scale-95"
              >
                <span>Calculate EMI</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/propertySearch"
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              >
                <span>Browse properties</span>
              </Link>
            </div>
          </div>
        </div>

        <React.Suspense fallback={null}>
          <BankOffers />
        </React.Suspense>

      </main>

      <FooterLinks />
    </div>
  );
}
