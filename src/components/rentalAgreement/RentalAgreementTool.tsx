"use client";

import dynamic from "next/dynamic";

/** The wizard restores a draft from localStorage, so it renders on the client only. */
const RentalAgreementWizard = dynamic(
  () => import("./RentalAgreementWizard").then((m) => m.RentalAgreementWizard),
  {
    ssr: false,
    loading: () => (
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="h-[520px] animate-pulse rounded-3xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900" />
        <div className="hidden h-[520px] animate-pulse rounded-2xl border border-slate-200 bg-white lg:block dark:border-slate-800 dark:bg-slate-900" />
      </div>
    ),
  }
);

export function RentalAgreementTool() {
  return <RentalAgreementWizard />;
}
