"use client";

import dynamic from "next/dynamic";

/** The generator restores a draft from localStorage, so it renders on the client only. */
const RentReceiptGenerator = dynamic(
  () => import("./RentReceiptGenerator").then((m) => m.RentReceiptGenerator),
  {
    ssr: false,
    loading: () => (
      <div className="grid gap-6 lg:grid-cols-[1.05fr_1fr]">
        <div className="h-[560px] animate-pulse rounded-3xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900" />
        <div className="hidden h-[420px] animate-pulse rounded-2xl border border-slate-200 bg-white lg:block dark:border-slate-800 dark:bg-slate-900" />
      </div>
    ),
  },
);

export function RentReceiptTool() {
  return <RentReceiptGenerator />;
}
