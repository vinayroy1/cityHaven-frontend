"use client";

import React from "react";
import Link from "next/link";
import { useAdmin } from "@/features/admin/adminStore";
import { useIsMounted, formatTimeSafe } from "@/features/admin/dateUtils";
import {
  Building2,
  FileCheck2,
  Users2,
  UserCog,
  CreditCard,
  History,
  ShieldCheck,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  TrendingUp,
  ShieldAlert,
} from "lucide-react";

export default function AdminOverviewPage() {
  const mounted = useIsMounted();
  const {
    currentStaff,
    propertyQcList,
    orgVerificationList,
    userList,
    staffList,
    billingOrders,
    refundCases,
    disputeCases,
    fraudAlerts,
    auditLogs,
  } = useAdmin();

  // Calculated metrics
  const pendingQcItems = propertyQcList.filter((p) => p.qcStatus === "SUBMITTED" || p.qcStatus === "UNDER_REVIEW");
  const approvedQcCount = propertyQcList.filter((p) => p.qcStatus === "APPROVED").length;
  const pendingOrgVerifs = orgVerificationList.filter((o) => o.verificationStatus === "PENDING_REVIEW");
  const verifiedOrgCount = orgVerificationList.filter((o) => o.verificationStatus === "VERIFIED").length;
  const pendingRefunds = refundCases.filter((r) => r.status === "PENDING_APPROVAL");
  const activeDisputes = disputeCases.filter((d) => d.status !== "RESOLVED" && d.status !== "CLOSED");
  const activeFraud = fraudAlerts.filter((f) => f.status === "INVESTIGATING" || f.status === "OPEN");

  const totalRevenue = billingOrders
    .filter((b) => b.status === "SUCCESS")
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalListingInventoryValue = propertyQcList.reduce((acc, curr) => acc + curr.price, 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/90 to-rose-950/80 border border-slate-800 text-white p-6 sm:p-8 shadow-md">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-rose-500/20 border border-rose-500/30 text-[11px] font-mono text-rose-300 mb-3">
              <ShieldCheck className="w-3.5 h-3.5 text-rose-400" />
              <span>Operations Console Active • Audit Trail v2.4</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Welcome back, {currentStaff?.name || "Operations Lead"}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
              You are authenticated with <span className="font-semibold text-rose-400">{currentStaff?.roles[0]}</span> privileges. Review incoming property listings, organization KYC dossiers, dispute cases, and financial health below.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              href="/admin/analytics"
              className="px-3.5 py-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 flex items-center gap-1.5 transition"
            >
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span>Executive Analytics</span>
            </Link>
            <Link
              href="/admin/properties"
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-lg shadow-rose-950/50 flex items-center gap-2 transition"
            >
              <span>Quality Control</span>
              <span className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center text-[10px]">
                {pendingQcItems.length}
              </span>
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Pending Property Quality Control */}
        <Link
          href="/admin/properties"
          className="group p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-amber-500/50 hover:bg-slate-50 dark:hover:bg-slate-850 transition relative overflow-hidden shadow-sm"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/10 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/20 dark:border-amber-500/30 flex items-center gap-1 font-semibold">
              <Clock className="w-3 h-3" /> ACTION REQ
            </span>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-300 transition">
            {pendingQcItems.length}
          </div>
          <div className="text-xs font-medium text-slate-600 dark:text-slate-400 mt-1 flex items-center justify-between">
            <span>Pending Quality Control</span>
            <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-amber-500 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 font-mono">
            {approvedQcCount} approved & live
          </div>
        </Link>

        {/* Pending Org Verifications */}
        <Link
          href="/admin/organizations"
          className="group p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-500/50 hover:bg-slate-50 dark:hover:bg-slate-850 transition relative overflow-hidden shadow-sm"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border border-indigo-500/20 dark:border-indigo-500/30 font-semibold">
              KYC DOSSIER
            </span>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition">
            {pendingOrgVerifs.length}
          </div>
          <div className="text-xs font-medium text-slate-600 dark:text-slate-400 mt-1 flex items-center justify-between">
            <span>Pending Org Verifications</span>
            <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-500 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 font-mono">
            {verifiedOrgCount} verified businesses
          </div>
        </Link>

        {/* Active Disputes & Complaints */}
        <Link
          href="/admin/disputes"
          className="group p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-rose-500/50 hover:bg-slate-50 dark:hover:bg-slate-850 transition relative overflow-hidden shadow-sm"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <ShieldAlert className="w-5 h-5" />
            </div>
            {activeDisputes.length > 0 ? (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-500/10 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-500/20 dark:border-rose-500/30 font-semibold">
                {activeDisputes.length} OPEN
              </span>
            ) : (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
                RESOLVED
              </span>
            )}
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white group-hover:text-rose-600 dark:group-hover:text-rose-300 transition">
            {activeDisputes.length}
          </div>
          <div className="text-xs font-medium text-slate-600 dark:text-slate-400 mt-1 flex items-center justify-between">
            <span>Customer Disputes & Leads</span>
            <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-rose-500 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 font-mono">
            {disputeCases.length} total lifetime cases
          </div>
        </Link>

        {/* Revenue & Refunds */}
        <Link
          href="/admin/billing"
          className="group p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/50 hover:bg-slate-50 dark:hover:bg-slate-850 transition relative overflow-hidden shadow-sm"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CreditCard className="w-5 h-5" />
            </div>
            {pendingRefunds.length > 0 ? (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-500/10 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-500/20 dark:border-rose-500/30 font-semibold">
                {pendingRefunds.length} REFUND REQ
              </span>
            ) : (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 dark:border-emerald-500/30 font-semibold">
                SETTLED
              </span>
            )}
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-300 transition">
            ₹{totalRevenue.toLocaleString("en-IN")}
          </div>
          <div className="text-xs font-medium text-slate-600 dark:text-slate-400 mt-1 flex items-center justify-between">
            <span>Verified Revenue</span>
            <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-500 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 font-mono">
            {billingOrders.length} processed orders
          </div>
        </Link>
      </div>

      {/* Real-time Business & Inventory Highlights Bar */}
      <div className="p-4 rounded-2xl bg-slate-900 text-white border border-slate-800 flex flex-wrap items-center justify-between gap-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-6 text-xs">
          <div>
            <div className="text-slate-400 text-[10px]">Managed GMV:</div>
            <div className="font-bold text-white text-sm">₹{(totalListingInventoryValue / 10000000).toFixed(2)} Cr</div>
          </div>
          <div className="hidden sm:block border-l border-slate-800 pl-6">
            <div className="text-slate-400 text-[10px]">Avg Quality Control SLA:</div>
            <div className="font-bold text-emerald-400 text-sm">1.8 hrs <span className="text-[10px] font-normal text-slate-400">(&lt; 4h target)</span></div>
          </div>
          <div className="hidden md:block border-l border-slate-800 pl-6">
            <div className="text-slate-400 text-[10px]">Security Threats:</div>
            <div className="font-bold text-rose-400 text-sm">{activeFraud.length} Signals Monitored</div>
          </div>
        </div>

        <Link
          href="/admin/analytics"
          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-rose-300 text-xs font-semibold flex items-center gap-1 transition"
        >
          <span>Open Full Intelligence Hub</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Two Columns: Actionable Queues & Live Audit Trail */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Priority Operational Queues */}
        <div className="lg:col-span-2 space-y-6">
          {/* Property Quality Control Action Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <Building2 className="w-5 h-5 text-rose-500" />
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">Priority Quality Control Queue</h2>
              </div>
              <Link
                href="/admin/properties"
                className="text-xs font-medium text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1"
              >
                View all queue →
              </Link>
            </div>

            {pendingQcItems.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500 dark:text-slate-400 flex flex-col items-center">
                <CheckCircle2 className="w-8 h-8 text-emerald-500/60 mb-2" />
                <span>All submitted listings have been moderated. Queue is clean!</span>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {pendingQcItems.slice(0, 3).map((item) => (
                  <div key={item.id} className="py-3 flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-slate-900 dark:text-white truncate">{item.title}</span>
                        {item.duplicateSuspected && (
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-rose-500/10 dark:bg-rose-500/20 text-rose-600 dark:text-rose-300 border border-rose-500/20 dark:border-rose-500/30">
                            DUPLICATE ALERT
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-2">
                        <span>{item.locality}, {item.cityName}</span>
                        <span>•</span>
                        <span className="font-semibold text-slate-700 dark:text-slate-300">₹{(item.price / 100000).toFixed(1)} Lakh</span>
                        <span>•</span>
                        <span className="font-mono text-indigo-600 dark:text-indigo-400">{item.ownerType}</span>
                      </div>
                    </div>
                    <Link
                      href={`/admin/properties`}
                      className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-medium shrink-0 transition"
                    >
                      Inspect & Review
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Org KYC Action Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <FileCheck2 className="w-5 h-5 text-indigo-500" />
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">Pending Organization KYC Verifications</h2>
              </div>
              <Link
                href="/admin/organizations"
                className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
              >
                View all dossier queue →
              </Link>
            </div>

            {pendingOrgVerifs.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500 dark:text-slate-400 flex flex-col items-center">
                <CheckCircle2 className="w-8 h-8 text-emerald-500/60 mb-2" />
                <span>No organization verifications pending review.</span>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {pendingOrgVerifs.slice(0, 3).map((org) => (
                  <div key={org.id} className="py-3 flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-slate-900 dark:text-white truncate">{org.name}</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-2">
                        <span>Owner: {org.ownerName}</span>
                        <span>•</span>
                        <span>{org.documents.length} KYC Docs</span>
                        <span>•</span>
                        <span className="font-mono text-emerald-600 dark:text-emerald-400">{org.activePlan || "Free"}</span>
                      </div>
                    </div>
                    <Link
                      href={`/admin/organizations`}
                      className="px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-900/40 hover:bg-indigo-100 dark:hover:bg-indigo-800/60 text-indigo-700 dark:text-indigo-200 border border-indigo-200 dark:border-indigo-700/50 text-xs font-medium shrink-0 transition"
                    >
                      Verify Documents
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Live System Audit Activity */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex flex-col shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-rose-500" />
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">Live Audit Feed</h2>
            </div>
            <Link href="/admin/audit" className="text-xs font-medium text-rose-600 dark:text-rose-400 hover:underline">
              Full Logs →
            </Link>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto max-h-96 pr-1">
            {auditLogs.slice(0, 6).map((log) => (
              <div key={log.id} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 text-xs">
                <div className="flex items-center justify-between text-[11px] mb-1">
                  <span className="font-semibold text-slate-700 dark:text-slate-300 truncate max-w-[140px]">{log.actorName}</span>
                  <span className="text-slate-400 dark:text-slate-500 font-mono text-[10px]">
                    {mounted ? formatTimeSafe(log.createdAt) : "00:00"}
                  </span>
                </div>
                <div className="font-mono text-[11px] text-rose-600 dark:text-rose-400 font-semibold mb-1 truncate">
                  {log.action}
                </div>
                <div className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2">
                  {log.reason || `Modified ${log.targetType} #${log.targetId}`}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 font-mono flex items-center justify-between">
            <span>Audit Integrity: ENFORCED</span>
            <span className="text-emerald-600 dark:text-emerald-400">● 100% Immutable</span>
          </div>
        </div>
      </div>
    </div>
  );
}
