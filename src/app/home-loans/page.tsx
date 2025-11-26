import React from "react";
import Link from "next/link";

export default function HomeLoansPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <h1 className="text-2xl font-semibold">Home Loans</h1>
        <p className="mt-3 text-slate-600">
          Compare indicative offers, eligibility, and documentation. This is a placeholder screen—wire up to your loan partners or calculators.
        </p>
        <div className="mt-6 flex flex-wrap gap-3 text-sm">
          <Link href="/propertySearch" className="rounded-full bg-red-500 px-4 py-2 font-semibold text-white shadow-sm transition hover:-translate-y-0.5">
            Start property search
          </Link>
          <Link href="/homePage" className="rounded-full border border-slate-200 px-4 py-2 font-semibold text-slate-800 shadow-sm transition hover:-translate-y-0.5">
            Back to home
          </Link>
        </div>
      </div>
    </main>
  );
}
