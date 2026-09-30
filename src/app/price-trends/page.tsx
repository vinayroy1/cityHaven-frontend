import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, TrendingUp, BarChart3, MapPin, ArrowRight } from "lucide-react";
import { buildCanonical } from "@/constants/seo";
import { HeaderNav } from "@/app/homePage/components/HeaderNav";
import { FooterLinks } from "@/app/homePage/components/FooterLinks";

export const metadata: Metadata = {
  title: "Price Trends - CityHaven",
  description: "Track property price trends, rental yields, and time-on-market analytics across top localities.",
  alternates: { canonical: buildCanonical("/price-trends") },
  openGraph: {
    title: "Price Trends - CityHaven",
    description: "Track property price trends, rental yields, and time-on-market analytics across top localities.",
    url: buildCanonical("/price-trends"),
    type: "website",
  },
};

export default function PriceTrendsPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 flex flex-col transition-colors duration-150">
      <HeaderNav />

      <main className="flex-1">
        {/* Hero Section */}
        <div className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/50">
          <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 transition-colors mb-4"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Home</span>
            </Link>

            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
              <TrendingUp className="h-4 w-4" />
              <span>Market Intelligence</span>
            </div>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950 dark:text-white sm:text-4xl">
              Locality Price Trends & Analytics
            </h1>
            <p className="mt-2 max-w-2xl text-base text-slate-600 dark:text-slate-300">
              Track real-time sq.ft price trends, rental yields, and micro-market absorption across major metropolitan areas.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/propertySearch"
                className="inline-flex items-center gap-2 rounded-full bg-rose-600 px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-rose-200 transition hover:bg-rose-700 hover:shadow-lg active:scale-95"
              >
                <span>Browse properties in hot areas</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/emi-calculator"
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              >
                <span>Calculate loan EMI</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
          <div className="grid gap-6 sm:grid-cols-3">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 dark:bg-rose-950 dark:text-rose-400">
                <BarChart3 className="h-6 w-6" />
              </div>
              <h2 className="mt-4 text-lg font-bold text-slate-950 dark:text-white">Quarterly Growth</h2>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                Historical property appreciation rates mapped across 3-year, 5-year, and 10-year timelines.
              </p>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
                <TrendingUp className="h-6 w-6" />
              </div>
              <h2 className="mt-4 text-lg font-bold text-slate-950 dark:text-white">Rental Yield Insights</h2>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                Compare gross rental yields between apartments, villas, and commercial spaces to maximize returns.
              </p>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-50 text-sky-600 dark:bg-sky-950 dark:text-sky-400">
                <MapPin className="h-6 w-6" />
              </div>
              <h2 className="mt-4 text-lg font-bold text-slate-950 dark:text-white">Locality Heatmaps</h2>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                Identify high-demand micro-markets close to upcoming metro lines, tech parks, and commercial hubs.
              </p>
            </div>
          </div>
        </div>
      </main>

      <FooterLinks />
    </div>
  );
}
