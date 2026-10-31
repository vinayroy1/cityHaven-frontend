import React from "react";
import type { Metadata } from "next";
import { buildCanonical } from "@/constants/seo";
import { HeaderNav } from "@/app/homePage/components/HeaderNav";
import { DashboardClient } from "./components/DashboardClient";

export const metadata: Metadata = {
  title: "Dashboard | Awasio",
  description: "Monitor listings, leads, properties, flatmates, and documents from your Awasio control center.",
  alternates: { canonical: buildCanonical("/dashboard") },
  openGraph: {
    title: "Dashboard | Awasio",
    description: "Manage Awasio listings, leads, properties, and documents in one place.",
    url: buildCanonical("/dashboard"),
    type: "website",
  },
};

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-rose-50/70 via-white to-amber-50/50 text-slate-900 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 dark:text-slate-100 transition-colors duration-150">
      <HeaderNav />
      <DashboardClient />
    </main>
  );
}
