import React from "react";
import Link from "next/link";

export default function DashboardSettingsPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 space-y-4">
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="text-slate-600">Notification, privacy, and alert settings placeholder. Swap in your real controls.</p>
        <Link href="/dashboard" className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm transition hover:-translate-y-0.5">
          Back to dashboard
        </Link>
      </div>
    </main>
  );
}
