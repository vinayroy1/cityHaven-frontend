"use client";

import React, { useState } from "react";
import { useAdmin } from "@/features/admin/adminStore";
import { useIsMounted, formatDateSafe } from "@/features/admin/dateUtils";
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Eye,
  Search,
  Lock,
  Zap,
  RotateCcw,
  Building2,
  User,
  Users2,
} from "lucide-react";

export default function AdminFraudCenterPage() {
  const mounted = useIsMounted();
  const { fraudAlerts, resolveFraudAlert, currentStaff } = useAdmin();

  const [filterSeverity, setFilterSeverity] = useState<string>("ALL");
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const filteredAlerts = fraudAlerts.filter((alert) => {
    if (filterSeverity !== "ALL" && alert.severity !== filterSeverity) return false;
    return true;
  });

  const handleResolve = (alertId: string, status: "RESOLVED" | "DISMISSED") => {
    resolveFraudAlert(alertId, status);
    setSuccessMsg(`Fraud alert #${alertId} marked as ${status}`);
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "CRITICAL":
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30 animate-pulse">
            CRITICAL
          </span>
        );
      case "HIGH":
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-orange-500/20 text-orange-600 dark:text-orange-400 border border-orange-500/30">
            HIGH
          </span>
        );
      case "MEDIUM":
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30">
            MEDIUM
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
            LOW
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-rose-500" />
            Security Operations & Fraud Threat Monitor
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Automated anomaly detection for coordinate spoofing, listing scraping bot velocity, and unauthorized seat sharing.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-600 dark:text-emerald-400 font-mono flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5" />
            <span>Anti-Scraping Shield: ARMED</span>
          </div>
        </div>
      </div>

      {successMsg && (
        <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-700/60 text-xs text-emerald-700 dark:text-emerald-300 flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Active Threat Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 font-mono">
              Active Security Signals ({filteredAlerts.length})
            </h2>
          </div>

          <div className="flex items-center gap-1 bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm text-xs">
            {["ALL", "CRITICAL", "HIGH", "MEDIUM"].map((sev) => (
              <button
                key={sev}
                onClick={() => setFilterSeverity(sev)}
                className={`px-3 py-1 rounded-lg font-semibold transition cursor-pointer ${
                  filterSeverity === sev
                    ? "bg-slate-800 text-white dark:bg-rose-600"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                {sev}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {filteredAlerts.map((alert) => (
            <div
              key={alert.id}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-1.5 max-w-2xl">
                <div className="flex items-center gap-2.5">
                  {getSeverityBadge(alert.severity)}
                  <span className="font-bold text-slate-900 dark:text-white text-sm">{alert.title}</span>
                  <span className="text-[10px] font-mono text-slate-400">
                    Detected: {mounted ? formatDateSafe(alert.detectedAt) : "Recently"}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {alert.description}
                </p>
                <div className="text-[11px] font-mono text-indigo-600 dark:text-indigo-400 flex items-center gap-2">
                  <span>Target: {alert.targetType} #{alert.targetId}</span>
                  <span>•</span>
                  <span className="text-slate-500">Status: {alert.status}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {alert.status === "INVESTIGATING" || alert.status === "OPEN" ? (
                  <>
                    <button
                      onClick={() => handleResolve(alert.id, "DISMISSED")}
                      className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold cursor-pointer"
                    >
                      Dismiss (False Positive)
                    </button>
                    <button
                      onClick={() => handleResolve(alert.id, "RESOLVED")}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-md cursor-pointer"
                    >
                      Enforce & Quarantine
                    </button>
                  </>
                ) : (
                  <span className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 font-mono text-xs">
                    Case Resolved
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
