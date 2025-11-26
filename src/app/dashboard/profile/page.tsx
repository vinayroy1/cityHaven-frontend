import React from "react";
import Link from "next/link";

export default function DashboardProfilePage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 space-y-4">
        <h1 className="text-2xl font-semibold">Profile</h1>
        <p className="text-slate-600">Edit your profile, KYC, and notification preferences. Replace this stub with your real profile form.</p>
        <Link href="/dashboard" className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm transition hover:-translate-y-0.5">
          Back to dashboard
        </Link>
      </div>
    </main>
  );
}
