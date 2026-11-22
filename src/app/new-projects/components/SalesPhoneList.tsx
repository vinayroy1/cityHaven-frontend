"use client";

import { useState } from "react";
import { PhoneCall } from "lucide-react";
import { toast } from "sonner";

const local = (p: string) => p.replace(/^\+?91\s*[-]?\s*/, "");

/** Every sales desk number of a project (primary first), each with Copy and Call. */
export function SalesPhoneList({ phones }: { phones: string[] }) {
  const [copied, setCopied] = useState<number | null>(null);
  if (!phones.length) return null;
  return (
    <div className="mt-4 space-y-2.5">
      {phones.map((phone, i) => (
        <div key={`${phone}-${i}`} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/60">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            {i === 0 ? "Official Sales Desk Phone" : `Sales Number ${i + 1}`}
          </span>
          <div className="mt-1 flex items-center justify-between gap-2">
            <span className="text-lg font-black text-slate-950 dark:text-white">+91 {local(phone)}</span>
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(`+91-${local(phone)}`);
                setCopied(i);
                toast.success("Phone number copied!");
                setTimeout(() => setCopied((c) => (c === i ? null : c)), 2000);
              }}
              className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200"
            >
              {copied === i ? "Copied!" : "Copy"}
            </button>
          </div>
          <a
            href={`tel:+91${local(phone).replace(/\D/g, "")}`}
            className={`mt-3 flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold transition active:scale-95 ${
              i === 0
                ? "bg-rose-600 text-white shadow-md shadow-rose-200 hover:bg-rose-700 dark:shadow-none"
                : "border border-rose-200 bg-white text-rose-700 hover:bg-rose-50 dark:border-rose-900 dark:bg-slate-900 dark:text-rose-300"
            }`}
          >
            <PhoneCall className="h-4 w-4" />
            <span>{i === 0 ? "Call Sales Desk Now" : "Call this number"}</span>
          </a>
        </div>
      ))}
    </div>
  );
}
