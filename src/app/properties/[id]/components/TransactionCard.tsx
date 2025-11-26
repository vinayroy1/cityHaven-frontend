import React from "react";
import { CalendarClock, Sparkles } from "lucide-react";

export function TransactionCard() {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Transaction</p>
          <p className="text-base font-semibold text-slate-900">Resale · Freehold</p>
          <p className="text-xs text-slate-600">Clean mother deed with EC</p>
        </div>
        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">RERA not applicable</span>
      </div>
      <div className="mt-4 grid gap-3 text-sm text-slate-700">
        <div className="flex items-start gap-3">
          <Sparkles className="mt-1 h-4 w-4 text-amber-500" />
          <div>
            <p className="font-semibold text-slate-900">Best for agri investment</p>
            <p className="text-xs text-slate-600">Low density micro market with upcoming warehousing demand.</p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <CalendarClock className="mt-1 h-4 w-4 text-sky-600" />
          <div>
            <p className="font-semibold text-slate-900">Flexible visit slots</p>
            <p className="text-xs text-slate-600">Plan weekday or weekend site visits; owner will assist with directions.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
