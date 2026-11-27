"use client";

import { useState } from "react";
import { PhoneCall } from "lucide-react";
import { toast } from "sonner";
import { getCountry } from "@/config/countries";

/**
 * Sales numbers come from many sources: "9876543210", "+91 98765 43210", "+9779801234567", and some
 * imported with a "+" but no country code ("+9799499575" for a Nepal desk). Show each with the
 * project's country code once; a number that already carries another country's code is kept as is.
 */
export function salesPhone(raw: string, countryCode?: string | null): { display: string; tel: string } {
  const c = getCountry(countryCode);
  const code = c.phoneCode.replace("+", "");
  let d = raw.replace(/[^\d+]/g, "").replace(/^00/, "+");
  const hadPlus = d.startsWith("+");
  d = d.replace(/\+/g, "");
  if (d.startsWith(code) && d.length > c.phoneDigits) d = d.slice(code.length);
  else if (hadPlus && d.length > c.phoneDigits + 1) return { display: `+${d}`, tel: `+${d}` };
  d = d.replace(/^0+/, "");
  return { display: `${c.phoneCode} ${d}`, tel: `${c.phoneCode}${d}` };
}

/** Every sales desk number of a project (primary first), each with Copy and Call. */
export function SalesPhoneList({ phones, countryCode }: { phones: string[]; countryCode?: string | null }) {
  const [copied, setCopied] = useState<number | null>(null);
  if (!phones.length) return null;
  return (
    <div className="mt-4 space-y-2.5">
      {phones.map((phone, i) => {
        const { display, tel } = salesPhone(phone, countryCode);
        return (
        <div key={`${phone}-${i}`} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/60">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            {i === 0 ? "Official Sales Desk Phone" : `Sales Number ${i + 1}`}
          </span>
          <div className="mt-1 flex items-center justify-between gap-2">
            <span className="text-lg font-black text-slate-950 dark:text-white">{display}</span>
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(display);
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
            href={`tel:${tel}`}
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
        );
      })}
    </div>
  );
}
