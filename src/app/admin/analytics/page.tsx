"use client";

/**
 * Business & inventory analytics. Every figure is computed from live admin data loaded by the
 * admin store; the range switcher filters records by their created/unlocked date.
 */
import React, { useMemo, useState } from "react";
import { useAdmin } from "@/features/admin/adminStore";
import { BarChart3, Building2, CheckCircle2, Clock, CreditCard, IndianRupee, KeyRound, MapPin, ShieldCheck, TrendingUp, Users } from "lucide-react";

type Range = "7D" | "30D" | "90D" | "ALL";
const RANGE_DAYS: Record<Range, number | null> = { "7D": 7, "30D": 30, "90D": 90, ALL: null };

const inr = (n: number) => `₹${Math.round(n).toLocaleString("en-IN")}`;
const crore = (n: number) => (n >= 1e7 ? `₹${(n / 1e7).toFixed(2)} Cr` : n >= 1e5 ? `₹${(n / 1e5).toFixed(1)} L` : inr(n));
const pct = (part: number, whole: number) => (whole > 0 ? `${Math.round((part / whole) * 100)}%` : "—");
const hours = (ms: number[]) => (ms.length ? `${(ms.reduce((a, b) => a + b, 0) / ms.length / 3.6e6).toFixed(1)} hrs` : "—");

function Stat({ label, value, hint, icon: Icon }: { label: string; value: string | number; hint?: string; icon: typeof TrendingUp }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-2 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <span>{label}</span>
        <Icon className="h-4 w-4 text-rose-500" />
      </div>
      <div className="text-2xl font-bold text-slate-900 dark:text-white">{value}</div>
      {hint && <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">{hint}</div>}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4">
      <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">{title}</h2>
      {children}
    </section>
  );
}

export default function AdminAnalyticsPage() {
  const { propertyQcList, orgVerificationList, billingOrders, refundCases, contactUnlocks, userList } = useAdmin();
  const [range, setRange] = useState<Range>("30D");
  const [now] = useState(() => Date.now());

  const m = useMemo(() => {
    const days = RANGE_DAYS[range];
    const since = days ? now - days * 864e5 : 0;
    const inRange = (iso?: string | null) => !!iso && new Date(iso).getTime() >= since;

    const orders = billingOrders.filter((o) => inRange(o.createdAt));
    const paid = orders.filter((o) => o.status === "SUCCESS");
    const revenue = paid.reduce((a, o) => a + o.amount, 0);
    const orgRevenue = paid.filter((o) => o.scope === "ORGANIZATION").reduce((a, o) => a + o.amount, 0);
    const attempted = orders.filter((o) => o.status === "SUCCESS" || o.status === "FAILED").length;

    const refunds = refundCases.filter((r) => inRange(r.createdAt));
    const refunded = refunds.filter((r) => r.status === "APPROVED").reduce((a, r) => a + r.amount, 0);
    const refundTimes = refunds.filter((r) => r.decidedAt).map((r) => new Date(r.decidedAt!).getTime() - new Date(r.createdAt).getTime());

    const listings = propertyQcList.filter((p) => inRange(p.createdAt));
    const live = propertyQcList.filter((p) => p.qcStatus === "APPROVED");
    const queue = propertyQcList.filter((p) => p.qcStatus === "SUBMITTED" || p.qcStatus === "UNDER_REVIEW");
    const needsChanges = propertyQcList.filter((p) => p.qcStatus === "REJECTED" || p.qcStatus === "CHANGES_REQUESTED");
    const qcTimes = listings.filter((p) => p.reviewedAt).map((p) => new Date(p.reviewedAt!).getTime() - new Date(p.createdAt).getTime());

    const byLocality = new Map<string, { count: number; value: number }>();
    for (const p of live) {
      const key = [p.locality, p.cityName].filter(Boolean).join(", ") || "Unknown";
      const cur = byLocality.get(key) ?? { count: 0, value: 0 };
      byLocality.set(key, { count: cur.count + 1, value: cur.value + (p.price || 0) });
    }
    const topLocalities = [...byLocality.entries()].sort((a, b) => b[1].count - a[1].count).slice(0, 6);

    return {
      revenue,
      orgRevenue,
      personalRevenue: revenue - orgRevenue,
      paidCount: paid.length,
      aov: paid.length ? revenue / paid.length : 0,
      paymentSuccess: pct(paid.length, attempted),
      refundRate: pct(refunded, revenue),
      refundTime: hours(refundTimes),
      unlocks: contactUnlocks.filter((u) => inRange(u.unlockedAt)).length,
      newUsers: userList.filter((u) => inRange(u.createdAt)).length,
      newListings: listings.length,
      live: live.length,
      liveValue: live.reduce((a, p) => a + (p.price || 0), 0),
      queue: queue.length,
      needsChanges: needsChanges.length,
      qcTime: hours(qcTimes),
      residential: propertyQcList.filter((p) => p.resCom === "RESIDENTIAL").length,
      commercial: propertyQcList.filter((p) => p.resCom === "COMMERCIAL").length,
      sell: propertyQcList.filter((p) => p.listingType === "SELL").length,
      rent: propertyQcList.filter((p) => p.listingType === "RENT").length,
      kyc: pct(orgVerificationList.filter((o) => o.verificationStatus === "VERIFIED").length, orgVerificationList.length),
      activePlans: orgVerificationList.filter((o) => o.activePlan).length,
      topLocalities,
      maxLocality: topLocalities[0]?.[1].count ?? 0,
    };
  }, [range, now, billingOrders, refundCases, propertyQcList, contactUnlocks, userList, orgVerificationList]);

  const rangeLabel = range === "ALL" ? "all time" : `last ${RANGE_DAYS[range]} days`;

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-bold text-slate-900 dark:text-white">
            <TrendingUp className="h-6 w-6 text-rose-500" /> Analytics
          </h1>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">Revenue, listings and moderation, computed from live data ({rangeLabel}).</p>
        </div>
        <div className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white p-1 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          {(Object.keys(RANGE_DAYS) as Range[]).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`rounded-lg px-3 py-1 text-xs font-semibold transition ${
                range === r ? "bg-rose-600 text-white shadow-sm" : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              }`}
            >
              {r === "ALL" ? "All" : r}
            </button>
          ))}
        </div>
      </div>

      <Section title="Revenue">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Stat label="Revenue (successful payments)" value={inr(m.revenue)} hint={`${m.paidCount} paid order(s)`} icon={IndianRupee} />
          <Stat label="Average order value" value={m.paidCount ? inr(m.aov) : "—"} hint="Successful orders only" icon={CreditCard} />
          <Stat label="Payment success rate" value={m.paymentSuccess} hint="Successful ÷ (successful + failed)" icon={CheckCircle2} />
          <Stat label="Contact unlocks" value={m.unlocks} hint={`${m.newUsers} new user(s) in range`} icon={KeyRound} />
        </div>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">Revenue by account type</h3>
            {[
              { label: "Organizations", value: m.orgRevenue, bar: "bg-rose-600" },
              { label: "Individual accounts", value: m.personalRevenue, bar: "bg-amber-500" },
            ].map((row) => (
              <div key={row.label}>
                <div className="mb-1 flex justify-between text-xs">
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{row.label}</span>
                  <span className="font-mono text-slate-600 dark:text-slate-400">
                    {inr(row.value)} ({pct(row.value, m.revenue)})
                  </span>
                </div>
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                  <div className={`h-full rounded-full ${row.bar}`} style={{ width: m.revenue ? `${(row.value / m.revenue) * 100}%` : "0%" }} />
                </div>
              </div>
            ))}
            <p className="border-t border-slate-100 pt-2 text-[11px] text-slate-500 dark:border-slate-800 dark:text-slate-400">
              Organizations with an active plan: {m.activePlans}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 rounded-2xl border border-slate-200 bg-white p-5 text-xs shadow-sm dark:border-slate-800 dark:bg-slate-900">
            {[
              { label: "Refunded share of revenue", value: m.refundRate },
              { label: "Avg refund decision time", value: m.refundTime },
              { label: "Organizations KYC-verified", value: m.kyc },
              { label: "Avg QC turnaround", value: m.qcTime },
            ].map((s) => (
              <div key={s.label} className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950/60">
                <div className="text-[10px] text-slate-500">{s.label}</div>
                <div className="mt-0.5 text-lg font-bold text-slate-900 dark:text-white">{s.value}</div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      <Section title="Listings & moderation">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Stat label="Live listings" value={m.live} hint={`${crore(m.liveValue)} total asking value`} icon={Building2} />
          <Stat label="Awaiting review" value={m.queue} hint={`Avg QC turnaround: ${m.qcTime}`} icon={Clock} />
          <Stat label="Rejected / changes requested" value={m.needsChanges} hint="Waiting on the owner" icon={ShieldCheck} />
          <Stat label="New listings" value={m.newListings} hint={`Submitted in the ${rangeLabel}`} icon={Users} />
        </div>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              <MapPin className="h-4 w-4 text-rose-500" /> Top localities (live listings)
            </h3>
            {m.topLocalities.length === 0 ? (
              <p className="text-xs text-slate-500">No live listings yet.</p>
            ) : (
              m.topLocalities.map(([name, v]) => (
                <div key={name} className="space-y-1 text-xs">
                  <div className="flex justify-between font-medium text-slate-800 dark:text-slate-200">
                    <span className="truncate pr-2">{name}</span>
                    <span className="shrink-0 font-mono text-slate-500 dark:text-slate-400">
                      {v.count} · {crore(v.value)}
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                    <div className="h-full rounded-full bg-rose-500" style={{ width: `${(v.count / Math.max(m.maxLocality, 1)) * 100}%` }} />
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              <BarChart3 className="h-4 w-4 text-rose-500" /> Inventory mix (all listings)
            </h3>
            <div className="grid grid-cols-2 gap-3 text-xs">
              {[
                { label: "For sale", value: m.sell, of: m.sell + m.rent },
                { label: "For rent", value: m.rent, of: m.sell + m.rent },
                { label: "Residential", value: m.residential, of: m.residential + m.commercial },
                { label: "Commercial", value: m.commercial, of: m.residential + m.commercial },
              ].map((s) => (
                <div key={s.label} className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950">
                  <div className="text-[10px] text-slate-500">{s.label}</div>
                  <div className="mt-0.5 text-lg font-bold text-slate-900 dark:text-white">{s.value}</div>
                  <div className="font-mono text-[10px] text-slate-400">{pct(s.value, s.of)}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>
    </div>
  );
}
