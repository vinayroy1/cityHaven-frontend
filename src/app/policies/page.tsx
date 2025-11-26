import React from "react";
import Link from "next/link";

export default function PoliciesPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 space-y-8">
        <header>
          <h1 className="text-2xl font-semibold">Policies & Safety</h1>
          <p className="mt-2 text-slate-600">
            High-level placeholders for safety, cancellation, and hosting policies. Replace with your real terms or CMS content.
          </p>
        </header>

        <section id="cancellation" className="space-y-2 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-lg font-semibold">Cancellation options</h2>
          <p className="text-sm text-slate-700">Outline refund timelines, deductions, and escalation paths.</p>
        </section>

        <section id="hosting" className="space-y-2 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-lg font-semibold">Responsible hosting</h2>
          <p className="text-sm text-slate-700">Summarize guest verification, safety checks, and community rules.</p>
        </section>

        <div className="flex flex-wrap gap-3 text-sm">
          <Link href="/contact" className="rounded-full border border-slate-200 px-4 py-2 font-semibold text-slate-800 shadow-sm transition hover:-translate-y-0.5">
            Contact support
          </Link>
          <Link href="/homePage" className="rounded-full bg-red-500 px-4 py-2 font-semibold text-white shadow-sm transition hover:-translate-y-0.5">
            Back to home
          </Link>
        </div>
      </div>
    </main>
  );
}
