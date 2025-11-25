import React from 'react';
import Link from 'next/link';

export default function DashboardPage() {
  return (
    <main className="container mx-auto max-w-5xl px-4 py-6">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link href="/dashboard/properties" className="rounded border p-4">Properties</Link>
        <Link href="/dashboard/profile" className="rounded border p-4">Profile</Link>
        <Link href="/dashboard/settings" className="rounded border p-4">Settings</Link>
      </div>
    </main>
  );
}
