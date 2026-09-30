import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Users, MessageSquare, Sparkles, HelpCircle, ArrowRight } from "lucide-react";
import { buildCanonical } from "@/constants/seo";
import { HeaderNav } from "@/app/homePage/components/HeaderNav";
import { FooterLinks } from "@/app/homePage/components/FooterLinks";

export const metadata: Metadata = {
  title: "Community Forum - CityHaven",
  description: "Join the CityHaven real estate community to swap hosting tips, ask buying questions, and get expert help.",
  alternates: { canonical: buildCanonical("/community") },
  openGraph: {
    title: "Community Forum - CityHaven",
    description: "Discuss hosting, renting, and buying with the CityHaven community.",
    url: buildCanonical("/community"),
    type: "website",
  },
};

export default function CommunityPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 flex flex-col transition-colors duration-150">
      <HeaderNav />

      <main className="flex-1">
        {/* Hero Banner */}
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
              <Users className="h-4 w-4" />
              <span>Community & Discussion</span>
            </div>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950 dark:text-white sm:text-4xl">
              CityHaven Community Forum
            </h1>
            <p className="mt-2 max-w-2xl text-base text-slate-600 dark:text-slate-300">
              Connect with thousands of property owners, tenants, brokers, and real estate experts to ask questions, share insights, and discuss local trends.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 rounded-full bg-rose-600 px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-rose-200 transition hover:bg-rose-700 hover:shadow-lg active:scale-95"
              >
                <span>Ask a Question</span>
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

        {/* Discussion Categories */}
        <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
          <div className="grid gap-6 sm:grid-cols-3">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 dark:bg-rose-950 dark:text-rose-400">
                <MessageSquare className="h-6 w-6" />
              </div>
              <h2 className="mt-4 text-lg font-bold text-slate-950 dark:text-white">Tenant & Buyer Advice</h2>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                Tips on lease negotiations, rental agreement clauses, security deposit safety, and house hunting best practices.
              </p>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
                <Sparkles className="h-6 w-6" />
              </div>
              <h2 className="mt-4 text-lg font-bold text-slate-950 dark:text-white">Owner & Host Hub</h2>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                Property management strategies, staging tips to boost rental income, tenant vetting, and maintenance vendor recommendations.
              </p>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-50 text-sky-600 dark:bg-sky-950 dark:text-sky-400">
                <HelpCircle className="h-6 w-6" />
              </div>
              <h2 className="mt-4 text-lg font-bold text-slate-950 dark:text-white">Legal & RERA Q&A</h2>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                Discuss title deeds, khata verification, RERA complaint procedures, and property tax guidelines with peers.
              </p>
            </div>
          </div>
        </div>
      </main>

      <FooterLinks />
    </div>
  );
}
