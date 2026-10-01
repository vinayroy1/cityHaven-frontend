"use client";

import React, { useState } from "react";
import { useAdmin } from "@/features/admin/adminStore";
import { OrgVerificationItem, OrgVerificationStatus } from "@/features/admin/types";
import { useIsMounted, formatDateSafe } from "@/features/admin/dateUtils";
import {
  FileCheck2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  Eye,
  Search,
  Building,
  FileText,
  ShieldCheck,
  Ban,
  Users,
  ExternalLink,
  Edit3,
} from "lucide-react";

export default function AdminOrgVerificationPage() {
  const mounted = useIsMounted();
  const { orgVerificationList, reviewOrgVerification, updateOrgAllowance, currentStaff } = useAdmin();

  const [activeFilter, setActiveFilter] = useState<OrgVerificationStatus | "ALL">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrg, setSelectedOrg] = useState<OrgVerificationItem | null>(null);
  const [reviewNotes, setReviewNotes] = useState("");
  const [editingAllowance, setEditingAllowance] = useState(false);
  const [newSeats, setNewSeats] = useState(5);
  const [newCredits, setNewCredits] = useState(100);
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);
  const [actionErrorMessage, setActionErrorMessage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const filteredOrgs = orgVerificationList.filter((item) => {
    if (activeFilter !== "ALL" && item.verificationStatus !== activeFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        item.name.toLowerCase().includes(q) ||
        item.ownerName.toLowerCase().includes(q) ||
        item.ownerPhone.includes(q) ||
        (item.ownerEmail && item.ownerEmail.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const handleDecision = async (status: OrgVerificationStatus) => {
    if (!selectedOrg || isProcessing) return;
    if ((status === "CHANGES_REQUESTED" || status === "REJECTED" || status === "SUSPENDED") && !reviewNotes.trim()) {
      alert("Please provide specific verification notes or rationale for the decision.");
      return;
    }

    setIsProcessing(true);
    setActionErrorMessage(null);
    try {
      await reviewOrgVerification(selectedOrg.id, status, reviewNotes);
      setActionSuccessMessage(`Organization "${selectedOrg.name}" updated to verification status: ${status}`);
      setTimeout(() => setActionSuccessMessage(null), 4000);
      setSelectedOrg(null);
      setReviewNotes("");
    } catch (err: any) {
      console.error("Failed to update organization verification:", err);
      setActionErrorMessage(err?.response?.data?.message || err?.message || "Failed to update organization status. Please check network.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveAllowance = () => {
    if (!selectedOrg) return;
    updateOrgAllowance(selectedOrg.id, { seatsLimit: newSeats, contactCredits: newCredits });
    setSelectedOrg({ ...selectedOrg, seatsLimit: newSeats, contactCredits: newCredits });
    setEditingAllowance(false);
    setActionSuccessMessage(`Allowances updated for ${selectedOrg.name}: ${newSeats} Seats, ${newCredits} Credits`);
    setTimeout(() => setActionSuccessMessage(null), 4000);
  };

  const getStatusBadge = (status: OrgVerificationStatus) => {
    switch (status) {
      case "VERIFIED":
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border border-emerald-500/20 flex items-center gap-1.5 w-fit">
            <CheckCircle2 className="w-3.5 h-3.5" /> Verified Org
          </span>
        );
      case "PENDING_REVIEW":
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-300 border border-amber-500/20 flex items-center gap-1.5 w-fit">
            <Clock className="w-3.5 h-3.5" /> Under Review
          </span>
        );
      case "CHANGES_REQUESTED":
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-orange-500/10 text-orange-600 dark:text-orange-300 border border-orange-500/20 flex items-center gap-1.5 w-fit">
            <AlertCircle className="w-3.5 h-3.5" /> Docs Resubmit
          </span>
        );
      case "REJECTED":
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-rose-500/10 text-rose-600 dark:text-rose-300 border border-rose-500/20 flex items-center gap-1.5 w-fit">
            <XCircle className="w-3.5 h-3.5" /> Rejected
          </span>
        );
      case "SUSPENDED":
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-red-900/10 dark:bg-red-900/40 text-red-600 dark:text-red-300 border border-red-500/30 flex items-center gap-1.5 w-fit">
            <Ban className="w-3.5 h-3.5" /> Revoked
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 w-fit">
            Unverified
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FileCheck2 className="w-6 h-6 text-indigo-500" />
            Organization KYC Verification Studio
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Inspect RERA certificates, GSTIN registrations, and company incorporation deeds before awarding official Verified Badges.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 font-mono shadow-sm">
            Total Organizations: <span className="text-indigo-600 dark:text-indigo-400 font-bold">{orgVerificationList.length}</span>
          </div>
        </div>
      </div>

      {actionSuccessMessage && (
        <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-700/60 text-xs text-emerald-700 dark:text-emerald-300 flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>{actionSuccessMessage}</span>
        </div>
      )}

      {/* Filter Tabs & Search */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-1.5 bg-white dark:bg-slate-900/80 p-1.5 rounded-xl border border-slate-200 dark:border-slate-800/80 shadow-sm">
          {[
            { label: "All Organizations", value: "ALL" },
            { label: "Pending Review", value: "PENDING_REVIEW" },
            { label: "Verified", value: "VERIFIED" },
            { label: "Docs Requested", value: "CHANGES_REQUESTED" },
            { label: "Rejected", value: "REJECTED" },
            { label: "Suspended", value: "SUSPENDED" },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveFilter(tab.value as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                activeFilter === tab.value
                  ? "bg-gradient-to-r from-indigo-600 to-rose-600 text-white shadow-md font-semibold"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              {tab.label}
              <span className="ml-1.5 text-[10px] opacity-80 font-mono">
                (
                {tab.value === "ALL"
                  ? orgVerificationList.length
                  : orgVerificationList.filter((o) => o.verificationStatus === tab.value).length}
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
            placeholder="Search organizations by business name, owner name, mobile or email..."
            className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 rounded-xl text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none transition shadow-sm"
          />
        </div>
      </div>

      {/* Organizations Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-mono text-[11px]">
              <tr>
                <th className="py-3.5 px-4">Organization & Owner</th>
                <th className="py-3.5 px-4">Type & Plan</th>
                <th className="py-3.5 px-4">Seats & Allowance</th>
                <th className="py-3.5 px-4">KYC Documents</th>
                <th className="py-3.5 px-4">Verification Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-700 dark:text-slate-300">
              {filteredOrgs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 dark:text-slate-500">
                    No organizations found matching the selected filter.
                  </td>
                </tr>
              ) : (
                filteredOrgs.map((org) => (
                  <tr key={org.id} className="hover:bg-slate-50 dark:hover:bg-slate-850/60 transition group">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition flex items-center gap-2">
                        <span>{org.name}</span>
                        {org.verificationStatus === "VERIFIED" && (
                          <ShieldCheck className="w-4 h-4 text-emerald-500" />
                        )}
                      </div>
                      <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400 mt-0.5">
                        Owner: {org.ownerName} ({org.ownerPhone})
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-medium text-slate-800 dark:text-slate-200">{org.type}</div>
                      <div className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400">
                        {org.activePlan || "Free Plan"} • {org.listingsCount} Listings
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="text-slate-800 dark:text-slate-200">
                        <span className="font-semibold">{org.seatsUsed}</span> / {org.seatsLimit} Seats
                      </div>
                      <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                        {org.contactCredits} Contact Credits
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px] font-mono text-slate-700 dark:text-slate-300">
                        <FileText className="w-3.5 h-3.5 text-indigo-500" />
                        {org.documents.length} Docs Attached
                      </div>
                    </td>

                    <td className="py-3.5 px-4">{getStatusBadge(org.verificationStatus)}</td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => {
                          setSelectedOrg(org);
                          setReviewNotes(org.verificationNotes || "");
                          setNewSeats(org.seatsLimit);
                          setNewCredits(org.contactCredits);
                          setEditingAllowance(false);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700 text-xs font-semibold inline-flex items-center gap-1.5 transition cursor-pointer shadow-sm"
                      >
                        <Eye className="w-3.5 h-3.5 text-indigo-500" />
                        Inspect Dossier
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Organization KYC Dossier Inspector Modal */}
      {selectedOrg && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-3xl shadow-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950/60">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 flex items-center justify-center">
                  <Building className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    {selectedOrg.name}
                    {getStatusBadge(selectedOrg.verificationStatus)}
                  </h3>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                    Org ID: #{selectedOrg.id} • Registered: {mounted ? formatDateSafe(selectedOrg.createdAt) : "Recently"}
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSelectedOrg(null)}
                className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 text-xs"
              >
                ✕ Close
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 overflow-y-auto flex-1">
              {/* Organization Profile Details */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-50 dark:bg-slate-950/60 p-4 rounded-xl border border-slate-200 dark:border-slate-800/80 text-xs">
                <div>
                  <div className="text-slate-500 text-[10px]">Business Type</div>
                  <div className="font-semibold text-slate-900 dark:text-white">{selectedOrg.type}</div>
                </div>
                <div>
                  <div className="text-slate-500 text-[10px]">Primary Contact</div>
                  <div className="font-semibold text-slate-800 dark:text-slate-200">{selectedOrg.ownerName}</div>
                  <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400">{selectedOrg.ownerPhone}</div>
                </div>
                <div>
                  <div className="text-slate-500 text-[10px]">Active Subscription</div>
                  <div className="font-semibold text-emerald-600 dark:text-emerald-400">{selectedOrg.activePlan || "Free"}</div>
                </div>
                <div>
                  <div className="text-slate-500 text-[10px]">Assigned Specialist</div>
                  <div className="font-semibold text-slate-800 dark:text-slate-200">{selectedOrg.assignedSpecialistName || "Pending Triage"}</div>
                </div>
                <div>
                  <div className="text-slate-500 text-[10px]">Verified Date</div>
                  <div className="font-semibold text-slate-800 dark:text-slate-200">
                    {selectedOrg.verifiedAt ? (mounted ? formatDateSafe(selectedOrg.verifiedAt) : "Verified") : "Not yet verified"}
                  </div>
                </div>
                <div>
                  <div className="text-slate-500 text-[10px]">Published Properties</div>
                  <div className="font-semibold text-indigo-600 dark:text-indigo-400">{selectedOrg.listingsCount} Listings</div>
                </div>
              </div>

              {/* Allowance & Seat Quota Controller */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                    <Users className="w-4 h-4 text-indigo-500" />
                    <span>Seat Quota & Contact Credits Allowance</span>
                  </div>
                  {!editingAllowance ? (
                    <button
                      onClick={() => setEditingAllowance(true)}
                      className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 font-semibold cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" /> Edit Allowance
                    </button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleSaveAllowance}
                        className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingAllowance(false)}
                        className="px-2.5 py-1 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-400 rounded-lg text-xs"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>

                {editingAllowance ? (
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div>
                      <label className="block text-[11px] text-slate-500 dark:text-slate-400 mb-1">Max Team Seats</label>
                      <input
                        type="number"
                        value={newSeats}
                        onChange={(e) => setNewSeats(Number(e.target.value))}
                        className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-500 dark:text-slate-400 mb-1">Contact Unlock Credits</label>
                      <input
                        type="number"
                        value={newCredits}
                        onChange={(e) => setNewCredits(Number(e.target.value))}
                        className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4 text-xs font-mono">
                    <div className="bg-white dark:bg-slate-900/60 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800">
                      <span className="text-slate-500 dark:text-slate-400">Seats in Use:</span>{" "}
                      <span className="text-slate-900 dark:text-white font-bold">{selectedOrg.seatsUsed}</span> / {selectedOrg.seatsLimit}
                    </div>
                    <div className="bg-white dark:bg-slate-900/60 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800">
                      <span className="text-slate-500 dark:text-slate-400">Available Credits:</span>{" "}
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold">{selectedOrg.contactCredits} Credits</span>
                    </div>
                  </div>
                )}
              </div>

              {/* KYC Documents Inspector */}
              <div>
                <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase font-mono tracking-wider mb-2">
                  Official Verification Documents ({selectedOrg.documents.length})
                </h4>
                <div className="space-y-2">
                  {selectedOrg.documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-white dark:bg-slate-900 flex items-center justify-center text-indigo-500 border border-slate-200 dark:border-slate-800">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900 dark:text-white">{doc.type.replace(/_/g, " ")}</div>
                          <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                            Doc Number: {doc.documentNumber || "N/A"} • Expires: {doc.expiresAt || "Perpetual"}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => window.open(doc.fileUrl, "_blank")}
                          className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs flex items-center gap-1 border border-slate-200 dark:border-slate-700 transition cursor-pointer shadow-sm"
                        >
                          <ExternalLink className="w-3.5 h-3.5" /> View PDF / Doc
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Error Banner */}
              {actionErrorMessage && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
                  <XCircle className="w-4 h-4 text-rose-500 shrink-0" />
                  <span>{actionErrorMessage}</span>
                </div>
              )}

              {/* Reviewer Notes */}
              <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200">
                  Verification Specialist Notes & Decision Justification (Audited)
                </label>
                <textarea
                  rows={3}
                  value={reviewNotes}
                  disabled={isProcessing}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="Record verification checklist results (RERA registration checked on state portal, GSTIN active on portal)..."
                  className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 rounded-xl text-xs text-slate-900 dark:text-white placeholder:text-slate-400 outline-none transition disabled:opacity-50"
                />
              </div>
            </div>

            {/* Modal Footer Decisions */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/80 flex flex-wrap items-center justify-between gap-3">
              <div className="text-[11px] text-slate-500 font-mono">
                Assigned Specialist: <span className="text-indigo-600 dark:text-indigo-400 font-semibold">{currentStaff?.name}</span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  disabled={isProcessing}
                  onClick={() => handleDecision("CHANGES_REQUESTED")}
                  className="px-3 py-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-700/50 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
                >
                  <AlertCircle className="w-3.5 h-3.5" /> Request Re-upload
                </button>

                <button
                  disabled={isProcessing}
                  onClick={() => handleDecision("REJECTED")}
                  className="px-3 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-700/50 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
                >
                  <XCircle className="w-3.5 h-3.5" /> Reject KYC
                </button>

                {selectedOrg.verificationStatus === "VERIFIED" ? (
                  <button
                    disabled={isProcessing}
                    onClick={() => handleDecision("SUSPENDED")}
                    className="px-3 py-2 rounded-xl bg-red-600 dark:bg-red-900/60 hover:bg-red-700 text-white text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
                  >
                    <Ban className="w-3.5 h-3.5" /> {isProcessing ? "Updating..." : "Revoke Verification"}
                  </button>
                ) : (
                  <button
                    disabled={isProcessing}
                    onClick={() => handleDecision("VERIFIED")}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md transition cursor-pointer disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-4 h-4" /> {isProcessing ? "Saving to Database..." : "Verify & Grant Badge"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
