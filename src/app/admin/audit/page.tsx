"use client";

import React, { useState } from "react";
import { useAdmin } from "@/features/admin/adminStore";
import { useIsMounted, formatDateSafe, formatTimeSafe } from "@/features/admin/dateUtils";
import {
  History,
  ShieldAlert,
  Search,
  User,
  CreditCard,
  Building2,
  FileCheck2,
  Lock,
} from "lucide-react";

export default function AdminAuditTrailPage() {
  const mounted = useIsMounted();
  const { auditLogs } = useAdmin();

  const [searchQuery, setSearchQuery] = useState("");
  const [targetTypeFilter, setTargetTypeFilter] = useState<string>("ALL");

  const filteredLogs = auditLogs.filter((log) => {
    if (targetTypeFilter !== "ALL" && log.targetType !== targetTypeFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        log.actorName.toLowerCase().includes(q) ||
        log.actorEmail.toLowerCase().includes(q) ||
        log.action.toLowerCase().includes(q) ||
        (log.reason && log.reason.toLowerCase().includes(q)) ||
        String(log.targetId).includes(q)
      );
    }
    return true;
  });

  const getTargetIcon = (type: string) => {
    switch (type) {
      case "PROPERTY":
        return <Building2 className="w-3.5 h-3.5 text-rose-500" />;
      case "ORGANIZATION":
        return <FileCheck2 className="w-3.5 h-3.5 text-indigo-500" />;
      case "USER":
        return <User className="w-3.5 h-3.5 text-emerald-500" />;
      case "BILLING":
        return <CreditCard className="w-3.5 h-3.5 text-amber-500" />;
      case "STAFF":
        return <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />;
      default:
        return <History className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <History className="w-6 h-6 text-rose-500" />
            Immutable System Audit Trail
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Cryptographically sealed operational audit events recording every staff action, moderation decision, allowance tweak, and financial approval.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-600 dark:text-emerald-400 font-mono flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5" />
            <span>Integrity: Append-Only Immutable</span>
          </div>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-1.5 bg-white dark:bg-slate-900/80 p-1.5 rounded-xl border border-slate-200 dark:border-slate-800/80 shadow-sm">
          {[
            { label: "All Events", value: "ALL" },
            { label: "Property Quality Control", value: "PROPERTY" },
            { label: "Organization KYC", value: "ORGANIZATION" },
            { label: "Customer Accounts", value: "USER" },
            { label: "Billing & Refunds", value: "BILLING" },
            { label: "Staff Access", value: "STAFF" },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setTargetTypeFilter(tab.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                targetTypeFilter === tab.value
                  ? "bg-gradient-to-r from-rose-600 to-indigo-600 text-white shadow-md font-semibold"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              {tab.label}
              <span className="ml-1.5 text-[10px] opacity-80 font-mono">
                (
                {tab.value === "ALL"
                  ? auditLogs.length
                  : auditLogs.filter((l) => l.targetType === tab.value).length}
                )
              </span>
            </button>
          ))}
        </div>

        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search audit trail by actor, action name, target ID, or reason keyword..."
            className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-rose-500 rounded-xl text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none transition shadow-sm"
          />
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-mono text-[11px]">
              <tr>
                <th className="py-3.5 px-4">Event ID & Timestamp</th>
                <th className="py-3.5 px-4">Staff Actor</th>
                <th className="py-3.5 px-4">Action</th>
                <th className="py-3.5 px-4">Target Scope</th>
                <th className="py-3.5 px-4">Audited Rationale / Reason</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-700 dark:text-slate-300">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400 dark:text-slate-500">
                    No audit records matching search filter.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-850/60 transition group">
                    <td className="py-3.5 px-4 font-mono">
                      <div className="font-semibold text-rose-600 dark:text-rose-300">{log.id}</div>
                      <div className="text-[10px] text-slate-400 dark:text-slate-500">
                        {mounted ? `${formatDateSafe(log.createdAt)} • ${formatTimeSafe(log.createdAt)}` : "Recently"}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900 dark:text-white">{log.actorName}</div>
                      <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                        {log.actorEmail} ({log.actorRole})
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-mono text-[11px] font-semibold text-rose-600 dark:text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded">
                        {log.action}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-mono text-[11px] border border-slate-200 dark:border-slate-700">
                        {getTargetIcon(log.targetType)}
                        <span>{log.targetType} #{log.targetId}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300">
                      <div className="line-clamp-2">{log.reason || "System executed without additional note"}</div>
                      {log.details && (
                        <div className="text-[10px] font-mono text-slate-400 dark:text-slate-500 mt-0.5">
                          {JSON.stringify(log.details)}
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
