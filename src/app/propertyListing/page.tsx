import React from 'react';
import { PropertyListingFlow } from '@/components/propertyListing/flow/PropertyListingFlow';
import { Toaster } from '@/components/ui/sonner';

export default function PropertyListingPage() {
  return (
    <main className="relative min-h-screen bg-gradient-to-r from-rose-50 via-white to-indigo-50">
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_10%_20%,rgba(244,63,94,0.08),transparent_35%),radial-gradient(circle_at_80%_0%,rgba(79,70,229,0.12),transparent_28%)]" />
      <div className="relative mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <PropertyListingFlow />
      </div>
      <Toaster richColors />
    </main>
  );
}
