"use client";

import React from "react";
import { Flame } from "lucide-react";
import { HeaderNav } from "@/app/homePage/components/HeaderNav";
import { PageBreadcrumbs } from "@/components/common/PageBreadcrumbs";
import { BackButton } from "@/components/common/BackButton";
import { ConstructionSkeleton } from "@/components/construction/ConstructionSkeleton";
import { PanditDashboard } from "@/components/pandit/PanditDashboard";

export default function PanditProfilePage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <HeaderNav />
      <div className="mx-auto w-full max-w-4xl px-4 pb-32 pt-4 sm:px-6 sm:pb-12 sm:pt-8">
        <div className="mb-5">
          <div className="mb-2 flex min-w-0 items-center gap-2">
            <BackButton variant="icon" fallbackHref="/dashboard" ariaLabel="Back to dashboard" className="sm:hidden" />
            <PageBreadcrumbs items={[{ label: "Dashboard", href: "/dashboard" }, { label: "Pandit & Vastu" }]} includeHome={false} renderJsonLd={false} className="min-w-0" />
          </div>
          <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-rose-600 sm:text-xs">
            <Flame className="h-3.5 w-3.5" /> Pandit & Vastu services
          </div>
          <h1 className="mt-0.5 text-xl font-black tracking-tight text-slate-950 sm:text-3xl dark:text-white">Your puja & vastu listing</h1>
        </div>
        <React.Suspense fallback={<ConstructionSkeleton />}>
          <PanditDashboard />
        </React.Suspense>
      </div>
    </div>
  );
}
