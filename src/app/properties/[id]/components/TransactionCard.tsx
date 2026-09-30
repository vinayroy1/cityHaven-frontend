import React from "react";
import { CalendarClock, Sparkles } from "lucide-react";

type TransactionCardProps = {
  transactionType?: string | null;
  ownershipType?: string | null;
  listingType?: string | null;
  deposit?: number | null;
};

function formatEnum(value?: string | null) {
  if (!value) return "";
  return value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatMoney(value?: number | null) {
  if (!value && value !== 0) return null;
  if (value >= 10000000) return `₹${(value / 10000000).toFixed(value % 10000000 ? 2 : 0)} Cr`;
  if (value >= 100000) return `₹${(value / 100000).toFixed(value % 100000 ? 2 : 0)} L`;
  return `₹${value.toLocaleString("en-IN")}`;
}

export function TransactionCard({ transactionType, ownershipType, listingType, deposit }: TransactionCardProps) {
  const heading = [formatEnum(transactionType), formatEnum(ownershipType)].filter(Boolean).join(" · ") || "Transaction details";
  const depositText = formatMoney(deposit);

  return (
    <div className="border-t border-zinc-200 py-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Transaction</p>
          <p className="text-base font-semibold text-slate-900">{heading}</p>
          <p className="text-xs text-slate-600">{depositText ? `Deposit ${depositText}` : "Confirm charges and paperwork with owner"}</p>
        </div>
        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">{formatEnum(listingType) || "Listed"}</span>
      </div>
      <div className="mt-4 grid gap-3 text-sm text-slate-700">
        <div className="flex items-start gap-3">
          <Sparkles className="mt-1 h-4 w-4 text-amber-500" />
          <div>
            <p className="font-semibold text-slate-900">Before you decide</p>
            <p className="text-xs text-slate-600">Confirm the total charges and review ownership documents with the advertiser.</p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <CalendarClock className="mt-1 h-4 w-4 text-sky-600" />
          <div>
            <p className="font-semibold text-slate-900">Plan a visit</p>
            <p className="text-xs text-slate-600">Send an enquiry to verify availability, exact address, and visit timings.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
