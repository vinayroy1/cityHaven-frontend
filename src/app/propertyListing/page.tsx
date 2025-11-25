import React from 'react';
import { PropertyListingFlow } from '@/components/propertyListing/PropertyListingFlow';
import { Toaster } from '@/components/ui/sonner';

export default function PropertyListingPage() {
  return (
    <main className="relative min-h-screen bg-gradient-to-br from-slate-50 via-sky-50 to-white">
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_10%_20%,rgba(14,165,233,0.12),transparent_35%),radial-gradient(circle_at_80%_0%,rgba(99,102,241,0.12),transparent_28%)]" />
      <div className="relative mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <PropertyListingFlow />
      </div>
      <Toaster richColors />
    </main>
  );
}
