"use client";

import React, { useState } from "react";
import { useAdmin } from "@/features/admin/adminStore";
import { AdminBillingOrder, AdminRefundCase } from "@/features/admin/types";
import { useIsMounted, formatDateSafe } from "@/features/admin/dateUtils";
import {
  CreditCard,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Receipt,
  RotateCcw,
  ShieldCheck,
} from "lucide-react";

export default function AdminBillingPage() {
  const mounted = useIsMounted();
  const {
    billingOrders,
    refundCases,
    requestRefund,
    decideRefund,
    currentStaff,
    canApproveRefund,
  } = useAdmin();

  const [activeTab, setActiveTab] = useState<"ORDERS" | "REFUND_QUEUE">("ORDERS");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<AdminBillingOrder | null>(null);
  const [refundReason, setRefundReason] = useState("");
  const [refundAmount, setRefundAmount] = useState(0);
  const [refundModalOpen, setRefundModalOpen] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const isApprover =
    currentStaff?.roles.includes("FINANCE_APPROVER") ||
    currentStaff?.roles.includes("SUPER_ADMIN");

  const filteredOrders = billingOrders.filter((order) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        order.orderNumber.toLowerCase().includes(q) ||
        order.targetName.toLowerCase().includes(q) ||
        order.planName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleCreateRefundRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;
    if (!refundReason.trim()) {
      alert("Please specify a reason for the refund request.");
      return;
    }

    requestRefund(
      selectedOrder.orderNumber,
      selectedOrder.targetName,
      refundAmount > 0 ? refundAmount : selectedOrder.amount,
      refundReason
    );

    setSuccessMsg(`Refund request submitted for Order #${selectedOrder.orderNumber}. Queued for Finance Approver.`);
    setTimeout(() => setSuccessMsg(null), 4000);

    setRefundModalOpen(false);
    setSelectedOrder(null);
    setRefundReason("");
    setActiveTab("REFUND_QUEUE");
  };

  const handleApproveRefund = (caseItem: AdminRefundCase) => {
    if (!canApproveRefund(caseItem)) {
      alert("Two-person rule: refund approval requires an authorized approver different from the requester.");
      return;
    }
    decideRefund(caseItem.id, "APPROVED");
    setSuccessMsg(`Refund case #${caseItem.id} (₹${caseItem.amount}) approved & marked for gateway settlement.`);
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  const handleRejectRefund = (caseItem: AdminRefundCase) => {
    if (!canApproveRefund(caseItem)) {
      alert("Two-person rule: refund rejection requires an authorized approver different from the requester.");
      return;
    }
    decideRefund(caseItem.id, "REJECTED");
    setSuccessMsg(`Refund case #${caseItem.id} rejected.`);
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-emerald-500" />
            Commercial Operations & Billing Ledger
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Audit subscription orders, personal vs organization wallet allowances, GST invoices, and 2-person refund workflows.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 font-mono shadow-sm">
            Approver Role:{" "}
            <span className={isApprover ? "text-emerald-600 dark:text-emerald-400 font-bold" : "text-amber-600 dark:text-amber-400 font-bold"}>
              {isApprover ? "AUTHORIZED" : "REQUEST ONLY"}
            </span>
          </div>
        </div>
      </div>

      {successMsg && (
        <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-700/60 text-xs text-emerald-700 dark:text-emerald-300 flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 bg-white dark:bg-slate-900/80 p-1.5 rounded-xl border border-slate-200 dark:border-slate-800/80 shadow-sm">
        <button
          onClick={() => setActiveTab("ORDERS")}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition cursor-pointer ${
            activeTab === "ORDERS"
              ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          Orders & Transactions Ledger ({billingOrders.length})
        </button>

        <button
          onClick={() => setActiveTab("REFUND_QUEUE")}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-2 ${
            activeTab === "REFUND_QUEUE"
              ? "bg-gradient-to-r from-rose-600 to-indigo-600 text-white shadow-md"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <span>Refund Approvals Queue</span>
          {refundCases.filter((r) => r.status === "PENDING_APPROVAL").length > 0 && (
            <span className="w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] flex items-center justify-center font-bold">
              {refundCases.filter((r) => r.status === "PENDING_APPROVAL").length}
            </span>
          )}
        </button>
      </div>

      {activeTab === "ORDERS" ? (
        <div className="space-y-4">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by order number (#ORD), customer or company name, plan tier..."
              className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-emerald-500 rounded-xl text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none transition shadow-sm"
            />
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                  <tr>
                    <th className="py-3.5 px-4">Order # & Timestamp</th>
                    <th className="py-3.5 px-4">Account Scope & Target</th>
                    <th className="py-3.5 px-4">Plan & Entitlements</th>
                    <th className="py-3.5 px-4">Amount & Gateway</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-700 dark:text-slate-300">
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-slate-50 dark:hover:bg-slate-850/60 transition group">
                      <td className="py-3.5 px-4 font-mono">
                        <div className="font-semibold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-300 transition">
                          {order.orderNumber}
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400">
                          {mounted ? formatDateSafe(order.createdAt) : "Recently"}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900 dark:text-white">{order.targetName}</div>
                        <div className="text-[10px] font-mono text-indigo-600 dark:text-indigo-400">
                          Scope: {order.scope} (ID #{order.targetId})
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-medium text-slate-800 dark:text-slate-200">{order.planName}</div>
                        <div className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400">
                          +{order.creditsAdded} Contact Credits
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 dark:text-white text-sm">
                          ₹{order.amount.toLocaleString("en-IN")}
                        </div>
                        <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                          {order.paymentMethod} {order.gatewayPaymentId ? `(${order.gatewayPaymentId.slice(0, 10)}...)` : ""}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        {order.status === "SUCCESS" ? (
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border border-emerald-500/20">
                            Success
                          </span>
                        ) : order.status === "REFUNDED" ? (
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-rose-500/10 text-rose-600 dark:text-rose-300 border border-rose-500/20">
                            Refunded
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-300 border border-amber-500/20">
                            {order.status}
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {order.invoiceUrl && (
                            <button
                              onClick={() => window.open(order.invoiceUrl, "_blank")}
                              className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs flex items-center gap-1 border border-slate-200 dark:border-slate-700 cursor-pointer shadow-sm"
                            >
                              <Receipt className="w-3.5 h-3.5" /> Invoice
                            </button>
                          )}
                          {order.status === "SUCCESS" && (
                            <button
                              onClick={() => {
                                setSelectedOrder(order);
                                setRefundAmount(order.amount);
                                setRefundModalOpen(true);
                              }}
                              className="px-2.5 py-1 rounded-lg bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-300 border border-rose-200 dark:border-rose-700/50 text-xs font-semibold cursor-pointer"
                            >
                              Request Refund
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* Refund Approvals Queue */
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="p-4 bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 text-xs flex items-center justify-between">
            <div className="text-slate-700 dark:text-slate-300 font-semibold flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-rose-500" />
              Two-Person Approval Rule: Refund requests must be approved by a Finance Approver or Super Admin before dispatch.
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                <tr>
                  <th className="py-3.5 px-4">Refund Case ID</th>
                  <th className="py-3.5 px-4">Order & Customer</th>
                  <th className="py-3.5 px-4">Amount</th>
                  <th className="py-3.5 px-4">Initiated By & Reason</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Approval Decision</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-700 dark:text-slate-300">
                {refundCases.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400 dark:text-slate-500">
                      No refund cases recorded.
                    </td>
                  </tr>
                ) : (
                  refundCases.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-850/60 transition">
                      <td className="py-3.5 px-4 font-mono font-semibold text-rose-600 dark:text-rose-300">
                        #{c.id}
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 font-normal">
                          {mounted ? formatDateSafe(c.createdAt) : "Recently"}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900 dark:text-white">{c.targetName}</div>
                        <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400">Order: {c.orderNumber}</div>
                      </td>

                      <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white text-sm">
                        ₹{c.amount.toLocaleString("en-IN")}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="text-slate-800 dark:text-slate-200">{c.reason}</div>
                        <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400">By: {c.requestedBy}</div>
                      </td>

                      <td className="py-3.5 px-4">
                        {c.status === "PENDING_APPROVAL" ? (
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-300 border border-amber-500/20 flex items-center gap-1 w-fit">
                            <Clock className="w-3 h-3" /> Awaiting Approval
                          </span>
                        ) : c.status === "APPROVED" ? (
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border border-emerald-500/20 flex items-center gap-1 w-fit">
                            <CheckCircle2 className="w-3 h-3" /> Approved & Executed
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-rose-500/10 text-rose-600 dark:text-rose-300 border border-rose-500/20 flex items-center gap-1 w-fit">
                            <XCircle className="w-3.5 h-3.5" /> Rejected
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        {c.status === "PENDING_APPROVAL" ? (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleRejectRefund(c)}
                              className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold cursor-pointer shadow-sm"
                            >
                              Reject
                            </button>
                            <button
                              onClick={() => handleApproveRefund(c)}
                              className="px-3 py-1 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-semibold shadow-md cursor-pointer"
                            >
                              Approve Refund
                            </button>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400 font-mono">Case Closed</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Request Refund Modal */}
      {refundModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md shadow-2xl p-6 relative animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
              <RotateCcw className="w-5 h-5 text-rose-500" />
              Initiate Refund Request
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 font-mono">
              Order: {selectedOrder.orderNumber} ({selectedOrder.targetName})
            </p>

            <form onSubmit={handleCreateRefundRequest} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Refund Amount (INR)
                </label>
                <input
                  type="number"
                  required
                  value={refundAmount}
                  onChange={(e) => setRefundAmount(Number(e.target.value))}
                  max={selectedOrder.amount}
                  className="w-full p-2.5 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 focus:border-rose-500 rounded-xl text-xs text-slate-900 dark:text-white"
                />
                <p className="text-[10px] text-slate-500 mt-1">Maximum eligible: ₹{selectedOrder.amount.toLocaleString("en-IN")}</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Refund Justification / Dispute Reason (Audited)
                </label>
                <textarea
                  rows={3}
                  required
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  placeholder="e.g. Accidental duplicate subscription charge, customer requested cancellation within policy window"
                  className="w-full p-2.5 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 focus:border-rose-500 rounded-xl text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRefundModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-semibold rounded-xl text-xs shadow-md"
                >
                  Submit for Approval
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
