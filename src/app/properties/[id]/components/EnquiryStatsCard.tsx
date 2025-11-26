import React from "react";

type EnquiryStatsCardProps = {
  viewsThisWeek: number | string;
  responseRate: string;
};

export function EnquiryStatsCard({ viewsThisWeek, responseRate }: EnquiryStatsCardProps) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-slate-900 text-white shadow-sm">
      <div className="space-y-3 p-4 sm:p-5">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold">Enquiry tracker</p>
          <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold">High response</span>
        </div>
        <div className="grid grid-cols-2 gap-3 text-center text-sm">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
            <p className="text-xs text-white/60">Views this week</p>
            <p className="text-xl font-semibold">{viewsThisWeek}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
            <p className="text-xs text-white/60">Owner responses</p>
            <p className="text-xl font-semibold">{responseRate}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="flex-1 rounded-xl bg-white px-3 py-2 text-sm font-semibold text-slate-900 shadow-sm transition hover:-translate-y-0.5">
            Get phone number
          </button>
          <button className="flex-1 rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5">
            Schedule visit
          </button>
        </div>
        <p className="text-[11px] text-white/60">Securely share your details. We never reveal them without consent.</p>
      </div>
    </div>
  );
}
