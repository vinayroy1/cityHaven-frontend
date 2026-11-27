"use client";

/**
 * People who asked for a signup OTP but never finished (often the email never arrived).
 * The same person may retry with another email, so rows sharing a mobile are flagged.
 */
import React, { useCallback, useEffect, useState } from "react";
import { AlertTriangle, Loader2, Mail, MessageCircle, Phone } from "lucide-react";
import { adminApi, type AdminPendingSignupsResponse } from "@/features/admin/api";
import { cn } from "@/lib/utils";

const fmt = (iso: string) =>
  new Date(iso).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit", hour12: true, timeZone: "Asia/Kolkata" });

export function PendingSignups({ days, query }: { days: number; query: string }) {
  const [status, setStatus] = useState("dropped");
  const [data, setData] = useState<AdminPendingSignupsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await adminApi.listPendingSignups({ days, status, q: query || undefined }));
    } catch (e) {
      setError((e as { message?: string })?.message || "Couldn't load unfinished signups");
    } finally {
      setLoading(false);
    }
  }, [days, status, query]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch on filter change
    void load();
  }, [load]);

  return (
    <section className="space-y-3 rounded-2xl border border-amber-200 bg-amber-50/40 p-4 dark:border-amber-900/60 dark:bg-amber-950/10">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="font-bold text-slate-900 dark:text-white">
            Didn&apos;t finish signup {data ? <span className="text-slate-500">({data.matched})</span> : null}
          </h2>
          <p className="text-xs text-slate-500">Asked for the email code but never verified. Usually the email didn&apos;t arrive: call them.</p>
        </div>
        <div className="inline-flex rounded-lg border border-slate-200 bg-white p-0.5 dark:border-slate-700 dark:bg-slate-900">
          {[["dropped", "Not finished"], ["completed", "Finished"], ["all", "All"]].map(([v, l]) => (
            <button key={v} type="button" onClick={() => setStatus(v)} className={cn("rounded-md px-3 py-1.5 text-xs font-semibold", status === v ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900" : "text-slate-600 dark:text-slate-300")}>
              {l}
            </button>
          ))}
        </div>
      </div>

      {loading && !data ? (
        <div className="flex justify-center py-6"><Loader2 className="h-5 w-5 animate-spin text-slate-400" /></div>
      ) : error ? (
        <p className="text-sm text-rose-700">{error}</p>
      ) : !data?.items.length ? (
        <p className="text-sm text-slate-500">Nobody in this period.</p>
      ) : (
        <ul className="divide-y divide-amber-100 dark:divide-slate-800">
          {data.items.map((p) => {
            const digits = p.mobileNumber.replace(/\D/g, "");
            const intl = digits.length === 10 ? `91${digits}` : digits;
            return (
              <li key={p.id} className="flex flex-wrap items-start justify-between gap-3 py-3">
                <div className="min-w-0 text-xs">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{p.name}</p>
                    {p.completedAt ? (
                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-800">Finished</span>
                    ) : p.accountIdForMobile ? (
                      <span className="rounded-full bg-sky-100 px-2 py-0.5 text-[11px] font-bold text-sky-800">Has account #{p.accountIdForMobile}</span>
                    ) : null}
                    {p.emailsTriedWithMobile > 1 && (
                      <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[11px] font-bold text-violet-800">Tried {p.emailsTriedWithMobile} emails</span>
                    )}
                  </div>
                  <p className="mt-0.5 text-slate-500">
                    Last code requested {fmt(p.lastRequestedAt)} · {p.otpRequestCount} request{p.otpRequestCount > 1 ? "s" : ""}
                    {p.lastUniqueId ? <> · MSG91 id <span className="font-mono">{p.lastUniqueId}</span></> : null}
                  </p>
                  {p.lastSendError && (
                    <p className="mt-1 inline-flex items-center gap-1 text-rose-700"><AlertTriangle className="h-3.5 w-3.5" /> Email failed: {p.lastSendError}</p>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  <a href={`tel:+${intl}`} className="inline-flex h-8 items-center gap-1 rounded-lg bg-emerald-600 px-2.5 text-xs font-bold text-white hover:bg-emerald-700"><Phone className="h-3.5 w-3.5" /> {p.mobileNumber}</a>
                  <a href={`https://wa.me/${intl}`} target="_blank" rel="noopener noreferrer" className="inline-flex h-8 items-center gap-1 rounded-lg border border-emerald-300 px-2.5 text-xs font-bold text-emerald-700 hover:bg-emerald-50 dark:border-emerald-800"><MessageCircle className="h-3.5 w-3.5" /> WhatsApp</a>
                  <a href={`mailto:${p.email}`} className="inline-flex h-8 items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"><Mail className="h-3.5 w-3.5" /> {p.email}</a>
                </div>
              </li>
            );
          })}
        </ul>
      )}
      {data && data.matched > data.items.length && (
        <p className="text-xs text-slate-500">Showing latest {data.items.length} of {data.matched}. Narrow the period or search to see others.</p>
      )}
    </section>
  );
}
