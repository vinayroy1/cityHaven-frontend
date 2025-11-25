import React from 'react';
import { PropertyListingFlow } from '@/components/propertyListing/PropertyListingFlow';
import { Toaster } from '@/components/ui/sonner';

export default function PropertyListingPage() {
  return (
    <main className="relative min-h-screen bg-gradient-to-br from-slate-50 via-sky-50 to-white">
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_10%_20%,rgba(14,165,233,0.12),transparent_35%),radial-gradient(circle_at_80%_0%,rgba(99,102,241,0.12),transparent_28%)]" />
      <div className="relative mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8 space-y-6">
        <div className="rounded-[28px] border border-slate-200/70 bg-white/80 p-6 shadow-2xl backdrop-blur">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">CityHaven Studio</p>
          <div className="mt-2 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <h1 className="text-3xl font-semibold text-slate-900">Property Listing Wizard</h1>
              <p className="text-slate-600">Lean, visually rich 5-step flow with redux + react-hook-form.</p>
            </div>
            <div className="flex gap-2">
              <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold text-sky-700">Redux Toolkit</span>
              <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700">React Hook Form</span>
            </div>
          </div>
        </div>
        <PropertyListingFlow />
      </div>
      <Toaster richColors />
    </main>
  );
}
