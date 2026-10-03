"use client";

import React, { useState } from "react";
import { useAdmin } from "@/features/admin/adminStore";
import { AdminDisputeCase, DisputeStatus } from "@/features/admin/types";
import { useIsMounted, formatDateSafe } from "@/features/admin/dateUtils";
import {
  ShieldAlert,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  Search,
  Filter,
  Users2,
  KeyRound,
  RotateCcw,
  Building,
  User,
  ArrowRight,
  Sparkles,
  Phone,
} from "lucide-react";

const STATUS_FILTERS: { label: string; value: DisputeStatus | "ALL" }[] = [
  { label: "All Cases", value: "ALL" },
  { label: "Open", value: "OPEN" },
  { label: "Assigned", value: "ASSIGNED" },
  { label: "In Progress", value: "IN_PROGRESS" },
  { label: "Waiting On Info", value: "WAITING" },
  { label: "Resolved", value: "RESOLVED" },
  { label: "Closed", value: "CLOSED" },
];

export default function AdminDisputesPage() {
  const mounted = useIsMounted();
  const {
    disputeCases,
    contactUnlocks,
    updateDisputeStatus,
    assignDispute,
    requestRefund,
    currentStaff,
  } = useAdmin();

  const [activeTab, setActiveTab] = useState<"DISPUTES" | "CONTACT_TRACES">("DISPUTES");
  const [statusFilter, setStatusFilter] = useState<DisputeStatus | "ALL">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCase, setSelectedCase] = useState<AdminDisputeCase | null>(null);
  const [caseNotes, setCaseNotes] = useState("");
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const filteredDisputes = disputeCases.filter((d) => {
    if (statusFilter !== "ALL" && d.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        d.caseNumber.toLowerCase().includes(q) ||
        d.complainantName.toLowerCase().includes(q) ||
        (d.propertyTitle && d.propertyTitle.toLowerCase().includes(q)) ||
        d.type.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleUpdateStatus = (status: DisputeStatus) => {
    if (!selectedCase) return;
    updateDisputeStatus(selectedCase.id, status, caseNotes);
    setSuccessMsg(`Case ${selectedCase.caseNumber} updated to ${status}`);
    setTimeout(() => setSuccessMsg(null), 4000);
    setSelectedCase(null);
    setCaseNotes("");
  };

  const handleTriggerRefundFromDispute = () => {
    if (!selectedCase) return;
    requestRefund(
      `DISP-${selectedCase.caseNumber}`,
      selectedCase.complainantName,
      499,
      `Refund issued for dispute #${selectedCase.caseNumber}: ${selectedCase.notes}`
    );
    updateDisputeStatus(selectedCase.id, "RESOLVED", "Refund request queued for finance approver");
    setSuccessMsg(`Refund of ₹499 queued for Finance Approver on Case #${selectedCase.caseNumber}`);
    setTimeout(() => setSuccessMsg(null), 4000);
    setSelectedCase(null);
  };

  const getStatusBadge = (status: DisputeStatus) => {
    switch (status) {
      case "RESOLVED":
      case "CLOSED":
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border border-emerald-500/20 flex items-center gap-1 w-fit">
            <CheckCircle2 className="w-3.5 h-3.5" /> {status}
          </span>
        );
      case "IN_PROGRESS":
      case "ASSIGNED":
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-300 border border-blue-500/20 flex items-center gap-1 w-fit">
            <Clock className="w-3.5 h-3.5" /> {status.replace("_", " ")}
          </span>
        );
      case "WAITING":
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-300 border border-amber-500/20 flex items-center gap-1 w-fit">
            <AlertCircle className="w-3.5 h-3.5" /> Awaiting Info
          </span>
        );
      case "OPEN":
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-rose-500/10 text-rose-600 dark:text-rose-300 border border-rose-500/20 flex items-center gap-1 w-fit">
            <ShieldAlert className="w-3.5 h-3.5" /> Unassigned
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
            Contact Leads, Unlocks & Dispute Resolution Hub
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Trace phone unlock consumption, audit employee attribution, investigate invalid-contact complaints, and trigger dispute refunds.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 font-mono shadow-sm">
            Active Disputes: <span className="text-rose-600 dark:text-rose-400 font-bold">{disputeCases.filter((d) => d.status !== "RESOLVED" && d.status !== "CLOSED").length}</span>
          </div>
        </div>
      </div>

      {successMsg && (
        <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-700/60 text-xs text-emerald-700 dark:text-emerald-300 flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Primary Module Tabs */}
      <div className="flex items-center gap-2 bg-white dark:bg-slate-900/80 p-1.5 rounded-xl border border-slate-200 dark:border-slate-800/80 shadow-sm">
        <button
          onClick={() => setActiveTab("DISPUTES")}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-2 ${
            activeTab === "DISPUTES"
              ? "bg-gradient-to-r from-rose-600 to-indigo-600 text-white shadow-md"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <span>Dispute & Support Cases</span>
          <span className="w-5 h-5 rounded-full bg-white/20 text-white text-[10px] flex items-center justify-center font-bold">
            {disputeCases.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("CONTACT_TRACES")}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-2 ${
            activeTab === "CONTACT_TRACES"
              ? "bg-gradient-to-r from-indigo-600 to-rose-600 text-white shadow-md"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <span>Contact Unlocks & Deductions Ledger ({contactUnlocks.length})</span>
        </button>
      </div>

      {activeTab === "DISPUTES" ? (
        <div className="space-y-4">
          {/* Status Sub-filter & Search */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-1.5 bg-white dark:bg-slate-900/80 p-1.5 rounded-xl border border-slate-200 dark:border-slate-800/80 shadow-sm">
              {STATUS_FILTERS.map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => setStatusFilter(tab.value)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                    statusFilter === tab.value
                      ? "bg-slate-800 text-white dark:bg-rose-600 font-semibold shadow-sm"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                >
                  {tab.label}
                  <span className="ml-1 text-[10px] opacity-70 font-mono">
                    (
                    {tab.value === "ALL"
                      ? disputeCases.length
                      : disputeCases.filter((d) => d.status === tab.value).length}
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
                placeholder="Search cases by Case ID, complainant name, phone, or property title..."
                className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-rose-500 rounded-xl text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none transition shadow-sm"
              />
            </div>
          </div>

          {/* Cases Table */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                  <tr>
                    <th className="py-3.5 px-4">Case # & Priority</th>
                    <th className="py-3.5 px-4">Dispute Category</th>
                    <th className="py-3.5 px-4">Complainant & Account</th>
                    <th className="py-3.5 px-4">Property Context</th>
                    <th className="py-3.5 px-4">Case Status</th>
                    <th className="py-3.5 px-4 text-right">Investigation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-700 dark:text-slate-300">
                  {filteredDisputes.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400 dark:text-slate-500">
                        No dispute cases matching the current filter.
                      </td>
                    </tr>
                  ) : (
                    filteredDisputes.map((caseItem) => (
                      <tr key={caseItem.id} className="hover:bg-slate-50 dark:hover:bg-slate-850/60 transition group">
                        <td className="py-3.5 px-4 font-mono">
                          <div className="font-semibold text-slate-900 dark:text-white group-hover:text-rose-600 dark:group-hover:text-rose-300 transition flex items-center gap-1.5">
                            <span>{caseItem.caseNumber}</span>
                            {caseItem.priority === "URGENT" && (
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-rose-500/10 dark:bg-rose-500/20 text-rose-600 dark:text-rose-300 border border-rose-500/30 font-bold">
                                URGENT
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            Logged: {mounted ? formatDateSafe(caseItem.createdAt) : "Recently"}
                          </div>
                        </td>

                        <td className="py-3.5 px-4 font-semibold text-slate-800 dark:text-slate-200">
                          {caseItem.type.replace(/_/g, " ")}
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-slate-900 dark:text-white">{caseItem.complainantName}</div>
                          <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                            {caseItem.complainantPhone} • <span className="text-indigo-600 dark:text-indigo-400">{caseItem.chargedAccount}</span>
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="font-medium text-slate-800 dark:text-slate-200 truncate max-w-[200px]">
                            {caseItem.propertyTitle || "Direct Service Dispute"}
                          </div>
                          <div className="text-[10px] font-mono text-slate-400">
                            Assigned To: {caseItem.assignedTo || "Unassigned"}
                          </div>
                        </td>

                        <td className="py-3.5 px-4">{getStatusBadge(caseItem.status)}</td>

                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => {
                              setSelectedCase(caseItem);
                              setCaseNotes(caseItem.notes || "");
                            }}
                            className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700 text-xs font-semibold inline-flex items-center gap-1.5 transition cursor-pointer shadow-sm"
                          >
                            Triage Case
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* Contact Unlocks Ledger */
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="p-4 bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 text-xs flex items-center justify-between">
            <div className="text-slate-700 dark:text-slate-300 font-semibold flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-indigo-500" />
              Contact Unlock & Deduction Audit Trail (Prevents duplicate charges for re-viewing contacts)
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                <tr>
                  <th className="py-3.5 px-4">Trace ID & Time</th>
                  <th className="py-3.5 px-4">Buyer / Lead Entity</th>
                  <th className="py-3.5 px-4">Property Unlocked</th>
                  <th className="py-3.5 px-4">Charged Account Scope</th>
                  <th className="py-3.5 px-4">Attribution / Staff</th>
                  <th className="py-3.5 px-4 text-right">Deduction Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-700 dark:text-slate-300">
                {contactUnlocks.map((trace) => (
                  <tr key={trace.id} className="hover:bg-slate-50 dark:hover:bg-slate-850/60 transition">
                    <td className="py-3.5 px-4 font-mono font-semibold text-indigo-600 dark:text-indigo-400">
                      {trace.id}
                      <div className="text-[10px] text-slate-400 font-normal">
                        {mounted ? formatDateSafe(trace.unlockedAt) : "Recently"}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900 dark:text-white">{trace.buyerName}</div>
                      <div className="text-[10px] font-mono text-slate-400">{trace.buyerPhone}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-medium text-slate-800 dark:text-slate-200 truncate max-w-[200px]">
                        {trace.propertyTitle}
                      </div>
                      <div className="text-[10px] font-mono text-slate-400">Property #{trace.propertyId}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800 dark:text-slate-200">{trace.chargedEntityName}</div>
                      <div className="text-[10px] font-mono text-indigo-600 dark:text-indigo-400">{trace.chargedScope}</div>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-slate-600 dark:text-slate-400">
                      {trace.responsibleStaffOrMember || "Direct Lead"}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      {trace.isDuplicateSuppressed ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                          0 Credits (Duplicate Free)
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                          -1 Contact Credit
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Dispute Case Triage Modal */}
      {selectedCase && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-xl shadow-2xl p-6 relative animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => setSelectedCase(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 dark:hover:text-white"
            >
              ✕
            </button>

            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-rose-500" />
              Dispute Triage: {selectedCase.caseNumber}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 font-mono">
              Complainant: {selectedCase.complainantName} ({selectedCase.complainantPhone})
            </p>

            <div className="space-y-4 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Dispute Type:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{selectedCase.type.replace(/_/g, " ")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Associated Property:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{selectedCase.propertyTitle || "N/A"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Charged Wallet Scope:</span>
                  <span className="font-mono text-indigo-600 dark:text-indigo-400">{selectedCase.chargedAccount}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Investigation Notes & Rationale (Audited)
                </label>
                <textarea
                  rows={3}
                  value={caseNotes}
                  onChange={(e) => setCaseNotes(e.target.value)}
                  placeholder="Record customer support calls, broker verification findings, or resolution details..."
                  className="w-full p-2.5 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 focus:border-rose-500 rounded-xl text-xs text-slate-900 dark:text-white placeholder:text-slate-400 outline-none transition"
                />
              </div>

              {/* Action Pipeline Buttons */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-2">
                {selectedCase.refundRequested && (
                  <button
                    onClick={handleTriggerRefundFromDispute}
                    className="px-3 py-2 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-700/50 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Trigger Dispute Refund
                  </button>
                )}

                <div className="flex items-center gap-2 ml-auto">
                  <button
                    onClick={() => handleUpdateStatus("IN_PROGRESS")}
                    className="px-3 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-medium cursor-pointer"
                  >
                    Mark In Progress
                  </button>
                  <button
                    onClick={() => handleUpdateStatus("RESOLVED")}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl text-xs shadow-md cursor-pointer"
                  >
                    Resolve & Close Case
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
