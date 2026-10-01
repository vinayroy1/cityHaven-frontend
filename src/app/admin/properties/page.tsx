"use client";

import React, { useState } from "react";
import { useAdmin } from "@/features/admin/adminStore";
import { PropertyQcItem, PropertyQcStatus } from "@/features/admin/types";
import { useIsMounted, formatDateSafe } from "@/features/admin/dateUtils";
import {
  Building2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  Eye,
  Search,
  Ban,
  AlertTriangle,
  RotateCw,
  UserCheck,
  Users2,
} from "lucide-react";

const STATUS_FILTERS: { label: string; value: PropertyQcStatus | "ALL" }[] = [
  { label: "All Listings", value: "ALL" },
  { label: "Submitted", value: "SUBMITTED" },
  { label: "Under Review", value: "UNDER_REVIEW" },
  { label: "Approved (Live)", value: "APPROVED" },
  { label: "Changes Requested", value: "CHANGES_REQUESTED" },
  { label: "Rejected", value: "REJECTED" },
  { label: "Suspended", value: "SUSPENDED" },
];

export default function AdminPropertyQcPage() {
  const mounted = useIsMounted();
  const {
    propertyQcList,
    reviewPropertyQc,
    suspendProperty,
    currentStaff,
    staffList,
    autoDistributeWorkload,
    assignTicketToStaff,
  } = useAdmin();

  const [activeFilter, setActiveFilter] = useState<PropertyQcStatus | "ALL">("ALL");
  const [assignmentScope, setAssignmentScope] = useState<"ALL" | "MINE" | "UNASSIGNED">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProperty, setSelectedProperty] = useState<PropertyQcItem | null>(null);
  const [reviewNotes, setReviewNotes] = useState("");
  const [selectedAssigneeId, setSelectedAssigneeId] = useState<number | "">("");
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);
  const [actionErrorMessage, setActionErrorMessage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const isOpsOrSuperAdmin = currentStaff?.roles.includes("SUPER_ADMIN") || currentStaff?.roles.includes("OPERATIONS_MANAGER");
  const qcEligibleStaff = staffList.filter((s) => s.status === "ACTIVE" && (s.roles.includes("QC_REVIEWER") || s.roles.includes("OPERATIONS_MANAGER")));

  // Filter listings
  const filteredListings = propertyQcList.filter((item) => {
    if (activeFilter !== "ALL" && item.qcStatus !== activeFilter) return false;
    
    // Assignment scope filtering
    if (assignmentScope === "MINE" && currentStaff && item.qcReviewerId !== currentStaff.id) return false;
    if (assignmentScope === "UNASSIGNED" && (item.qcReviewerId && item.qcReviewerName !== "Unassigned")) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        item.title.toLowerCase().includes(q) ||
        item.cityName.toLowerCase().includes(q) ||
        item.locality.toLowerCase().includes(q) ||
        (item.organizationName && item.organizationName.toLowerCase().includes(q)) ||
        (item.creatorName && item.creatorName.toLowerCase().includes(q)) ||
        (item.qcReviewerName && item.qcReviewerName.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const handleAction = async (status: PropertyQcStatus) => {
    if (!selectedProperty || isProcessing) return;
    if ((status === "CHANGES_REQUESTED" || status === "REJECTED" || status === "SUSPENDED") && !reviewNotes.trim()) {
      alert("Please provide specific reviewer notes or rationale for changes/rejection/suspension.");
      return;
    }

    setIsProcessing(true);
    setActionErrorMessage(null);
    try {
      if (status === "SUSPENDED") {
        await suspendProperty(selectedProperty.id, reviewNotes || "Suspended by admin review");
      } else {
        await reviewPropertyQc(selectedProperty.id, status, reviewNotes);
      }

      setActionSuccessMessage(`Listing #${selectedProperty.id} successfully updated to status: ${status}`);
      setTimeout(() => setActionSuccessMessage(null), 4000);
      setSelectedProperty(null);
      setReviewNotes("");
    } catch (err: any) {
      console.error("Failed to update property status:", err);
      const msg = err?.response?.data?.message || err?.message || "Failed to update property status. Please check network.";
      setActionErrorMessage(msg);
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusBadge = (status: PropertyQcStatus) => {
    switch (status) {
      case "APPROVED":
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border border-emerald-500/20 flex items-center gap-1.5 w-fit">
            <CheckCircle2 className="w-3.5 h-3.5" /> Approved
          </span>
        );
      case "SUBMITTED":
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-300 border border-amber-500/20 flex items-center gap-1.5 w-fit">
            <Clock className="w-3.5 h-3.5" /> Submitted
          </span>
        );
      case "UNDER_REVIEW":
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-300 border border-blue-500/20 flex items-center gap-1.5 w-fit">
            <Clock className="w-3.5 h-3.5" /> Under Review
          </span>
        );
      case "CHANGES_REQUESTED":
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-orange-500/10 text-orange-600 dark:text-orange-300 border border-orange-500/20 flex items-center gap-1.5 w-fit">
            <AlertCircle className="w-3.5 h-3.5" /> Changes Req
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
            <Ban className="w-3.5 h-3.5" /> Suspended
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
            <Building2 className="w-6 h-6 text-rose-500" />
            Property Quality Control (QC) Studio
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Review submitted real estate listings, inspect photo legitimacy, verify coordinates, and detect duplicate listings.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isOpsOrSuperAdmin && (
            <button
              onClick={() => {
                const res = autoDistributeWorkload("PROPERTY");
                setActionSuccessMessage(res.message);
                setTimeout(() => setActionSuccessMessage(null), 4000);
              }}
              className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm flex items-center gap-1.5 transition cursor-pointer"
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span>⚡ Auto-Distribute Work</span>
            </button>
          )}

          <div className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 font-mono shadow-sm">
            Total in Queue: <span className="text-rose-600 dark:text-rose-400 font-bold">{propertyQcList.length}</span>
          </div>
        </div>
      </div>

      {actionSuccessMessage && (
        <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-700/60 text-xs text-emerald-700 dark:text-emerald-300 flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>{actionSuccessMessage}</span>
        </div>
      )}

      {/* Scope Switcher & Status Filters */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          {/* Assignment Scope */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
            <button
              onClick={() => setAssignmentScope("ALL")}
              className={`px-3 py-1 rounded-lg font-medium transition cursor-pointer ${
                assignmentScope === "ALL"
                  ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm font-semibold"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              All Team Pool
            </button>
            <button
              onClick={() => setAssignmentScope("MINE")}
              className={`px-3 py-1 rounded-lg font-medium transition cursor-pointer flex items-center gap-1 ${
                assignmentScope === "MINE"
                  ? "bg-white dark:bg-slate-800 text-rose-600 dark:text-rose-400 shadow-sm font-semibold"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" /> Assigned to Me
            </button>
            <button
              onClick={() => setAssignmentScope("UNASSIGNED")}
              className={`px-3 py-1 rounded-lg font-medium transition cursor-pointer flex items-center gap-1 ${
                assignmentScope === "UNASSIGNED"
                  ? "bg-white dark:bg-slate-800 text-amber-600 dark:text-amber-400 shadow-sm font-semibold"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Users2 className="w-3.5 h-3.5" /> Unassigned Backlog
            </button>
          </div>

          <div className="text-[11px] font-mono text-slate-500">
            Showing <strong className="text-slate-900 dark:text-white">{filteredListings.length}</strong> matching listings
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 bg-white dark:bg-slate-900/80 p-1.5 rounded-xl border border-slate-200 dark:border-slate-800/80 shadow-sm">
          {STATUS_FILTERS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveFilter(tab.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                activeFilter === tab.value
                  ? "bg-gradient-to-r from-rose-600 to-indigo-600 text-white shadow-md font-semibold"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              {tab.label}
              <span className="ml-1.5 text-[10px] opacity-80 font-mono">
                (
                {tab.value === "ALL"
                  ? propertyQcList.length
                  : propertyQcList.filter((p) => p.qcStatus === tab.value).length}
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
            placeholder="Search listings by title, locality, city, owner name, organization, or reviewer..."
            className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-rose-500 rounded-xl text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none transition shadow-sm"
          />
        </div>
      </div>

      {/* Listings Table / Cards */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-mono text-[11px]">
              <tr>
                <th className="py-3.5 px-4">Listing & ID</th>
                <th className="py-3.5 px-4">Price & Type</th>
                <th className="py-3.5 px-4">Location</th>
                <th className="py-3.5 px-4">Posted By / Scope</th>
                <th className="py-3.5 px-4">Quality Control Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-700 dark:text-slate-300">
              {filteredListings.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 dark:text-slate-500">
                    No listings found matching the selected filter.
                  </td>
                </tr>
              ) : (
                filteredListings.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-850/60 transition group">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900 dark:text-white group-hover:text-rose-600 dark:group-hover:text-rose-300 transition flex items-center gap-2">
                        <span>{item.title}</span>
                        {item.duplicateSuspected && (
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-rose-500/10 dark:bg-rose-500/20 text-rose-600 dark:text-rose-300 border border-rose-500/20 dark:border-rose-500/30">
                            DUPLICATE ALERT
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400 mt-0.5">
                        ID: #{item.id} • {item.media.length} media files • Updated {mounted ? formatDateSafe(item.updatedAt) : "Recently"}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900 dark:text-white">
                        ₹{(item.price / 100000).toFixed(2)} Lakh
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                        {item.listingType} • {item.resCom}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-medium text-slate-800 dark:text-slate-200">{item.locality}</div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400">{item.cityName}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-medium text-slate-800 dark:text-slate-200">
                        {item.ownerType === "ORGANIZATION" ? item.organizationName : item.creatorName || "Personal Owner"}
                      </div>
                      <div className="text-[10px] font-mono text-indigo-600 dark:text-indigo-400">
                        {item.ownerType} {item.creatorPhone ? `• ${item.creatorPhone}` : ""}
                      </div>
                      <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
                        <Users2 className="w-3 h-3 text-slate-400" />
                        <span>Reviewer: {item.qcReviewerName || <span className="text-amber-500 font-semibold">Unassigned</span>}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">{getStatusBadge(item.qcStatus)}</td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => {
                          setSelectedProperty(item);
                          setReviewNotes(item.qcNotes || "");
                          setSelectedAssigneeId(item.qcReviewerId || "");
                          setActivePhotoIndex(0);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700 text-xs font-semibold inline-flex items-center gap-1.5 transition cursor-pointer shadow-sm"
                      >
                        <Eye className="w-3.5 h-3.5 text-rose-500" />
                        Inspect & Verify
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Property Inspection & Moderation Modal */}
      {selectedProperty && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-4xl shadow-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950/60">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center justify-center">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    {selectedProperty.title}
                    {getStatusBadge(selectedProperty.qcStatus)}
                  </h3>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                    Listing ID: #{selectedProperty.id} • Posted by: {selectedProperty.creatorName} ({selectedProperty.ownerType})
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSelectedProperty(null)}
                className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 text-xs"
              >
                ✕ Close
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 overflow-y-auto flex-1">
              {selectedProperty.duplicateSuspected && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 text-xs text-rose-700 dark:text-rose-300 flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Duplicate Risk Detected:</span> Similar address, square footage, and price already indexed within 200m radius. Please verify original ownership deeds.
                  </div>
                </div>
              )}

              {/* Photos Gallery */}
              <div>
                <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase font-mono tracking-wider mb-2">
                  Uploaded Media Inspector ({selectedProperty.media.length} files)
                </h4>
                {selectedProperty.media.length > 0 ? (
                  <div className="space-y-3">
                    <div className="relative aspect-video rounded-xl bg-slate-100 dark:bg-slate-950 overflow-hidden border border-slate-200 dark:border-slate-800">
                      <img
                        src={selectedProperty.media[activePhotoIndex]?.url}
                        alt="Property preview"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute bottom-2 right-2 px-2.5 py-1 rounded-lg bg-slate-950/80 text-[10px] font-mono text-slate-300 border border-slate-700">
                        Media {activePhotoIndex + 1} of {selectedProperty.media.length}
                      </div>
                    </div>

                    <div className="flex gap-2 overflow-x-auto pb-2">
                      {selectedProperty.media.map((img, idx) => (
                        <button
                          key={img.id}
                          onClick={() => setActivePhotoIndex(idx)}
                          className={`w-20 h-14 rounded-lg overflow-hidden shrink-0 border-2 transition cursor-pointer ${
                            activePhotoIndex === idx ? "border-rose-500 scale-95" : "border-slate-200 dark:border-slate-800 opacity-60 hover:opacity-100"
                          }`}
                        >
                          <img src={img.url} alt="thumbnail" className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-400 text-xs text-center">
                    No media uploaded for this listing.
                  </div>
                )}
              </div>

              {/* Property Details Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 dark:bg-slate-950/60 p-4 rounded-xl border border-slate-200 dark:border-slate-800/80 text-xs">
                <div>
                  <div className="text-slate-500 text-[10px]">Price</div>
                  <div className="font-bold text-slate-900 dark:text-white text-sm">₹{(selectedProperty.price / 100000).toFixed(2)} L</div>
                </div>
                <div>
                  <div className="text-slate-500 text-[10px]">Carpet Area</div>
                  <div className="font-semibold text-slate-800 dark:text-slate-200">
                    {selectedProperty.carpetArea || "N/A"} {selectedProperty.carpetAreaUnit || "sq.ft"}
                  </div>
                </div>
                <div>
                  <div className="text-slate-500 text-[10px]">Bedrooms & Bath</div>
                  <div className="font-semibold text-slate-800 dark:text-slate-200">
                    {selectedProperty.bedrooms || 0} BHK / {selectedProperty.bathrooms || 0} Bath
                  </div>
                </div>
                <div>
                  <div className="text-slate-500 text-[10px]">Furnishing</div>
                  <div className="font-semibold text-slate-800 dark:text-slate-200">{selectedProperty.furnishing || "Unfurnished"}</div>
                </div>
                <div>
                  <div className="text-slate-500 text-[10px]">Location</div>
                  <div className="font-semibold text-slate-800 dark:text-slate-200">{selectedProperty.locality}, {selectedProperty.cityName}</div>
                </div>
                <div>
                  <div className="text-slate-500 text-[10px]">Ownership Type</div>
                  <div className="font-semibold text-slate-800 dark:text-slate-200">{selectedProperty.postedAs} ({selectedProperty.ownerType})</div>
                </div>
                <div>
                  <div className="text-slate-500 text-[10px]">Availability</div>
                  <div className="font-semibold text-emerald-600 dark:text-emerald-400">{selectedProperty.availabilityStatus || "Ready to move"}</div>
                </div>
                <div>
                  <div className="text-slate-500 text-[10px]">Last Reviewed By</div>
                  <div className="font-semibold text-slate-800 dark:text-slate-200">{selectedProperty.qcReviewerName || "Pending Review"}</div>
                </div>
              </div>

              {/* Description */}
              <div>
                <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase font-mono tracking-wider mb-1.5">
                  Listing Description & Owner Notes
                </h4>
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs leading-relaxed">
                  {selectedProperty.description || "No specific owner description provided."}
                </div>
              </div>

              {/* Re-assignment and Reviewer info */}
              {isOpsOrSuperAdmin && (
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">Reassign Reviewer / Team Member</div>
                    <div className="text-[10px] text-slate-500">Currently: {selectedProperty.qcReviewerName || "Unassigned"}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      value={selectedAssigneeId}
                      onChange={(e) => {
                        const val = e.target.value ? Number(e.target.value) : "";
                        setSelectedAssigneeId(val);
                        if (val) {
                          assignTicketToStaff("PROPERTY", selectedProperty.id, val);
                          const assignedMember = staffList.find((s) => s.id === val);
                          setSelectedProperty({ ...selectedProperty, qcReviewerId: val, qcReviewerName: assignedMember?.name });
                          setActionSuccessMessage(`Reassigned listing #${selectedProperty.id} to ${assignedMember?.name}`);
                          setTimeout(() => setActionSuccessMessage(null), 3000);
                        }
                      }}
                      className="p-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-white outline-none focus:border-rose-500"
                    >
                      <option value="">Choose Reviewer...</option>
                      {qcEligibleStaff.map((staff) => (
                        <option key={staff.id} value={staff.id}>
                          {staff.name} ({staff.roles.join(", ")})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* Action Error Banner */}
              {actionErrorMessage && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
                  <XCircle className="w-4 h-4 text-rose-500 shrink-0" />
                  <span>{actionErrorMessage}</span>
                </div>
              )}

              {/* QC Decision & Notes Input */}
              <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200">
                  Reviewer Notes & Action Rationale (Audited)
                </label>
                <textarea
                  rows={3}
                  value={reviewNotes}
                  disabled={isProcessing}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="Record justification for approval, requested changes (e.g. upload high-res photo), or reason for rejection/suspension..."
                  className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-rose-500 rounded-xl text-xs text-slate-900 dark:text-white placeholder:text-slate-400 outline-none transition disabled:opacity-50"
                />
              </div>
            </div>

            {/* Modal Actions Footer */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/80 flex flex-wrap items-center justify-between gap-3">
              <div className="text-[11px] text-slate-500 font-mono">
                Staff Reviewer: <span className="text-rose-600 dark:text-rose-400 font-semibold">{currentStaff?.name}</span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  disabled={isProcessing}
                  onClick={() => handleAction("CHANGES_REQUESTED")}
                  className="px-3 py-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-700/50 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
                >
                  <AlertCircle className="w-3.5 h-3.5" /> Request Changes
                </button>

                <button
                  disabled={isProcessing}
                  onClick={() => handleAction("REJECTED")}
                  className="px-3 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-700/50 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
                >
                  <XCircle className="w-3.5 h-3.5" /> Reject
                </button>

                {selectedProperty.qcStatus === "APPROVED" ? (
                  <button
                    disabled={isProcessing}
                    onClick={() => handleAction("SUSPENDED")}
                    className="px-3 py-2 rounded-xl bg-red-600 dark:bg-red-900/60 hover:bg-red-700 text-white text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
                  >
                    <Ban className="w-3.5 h-3.5" /> {isProcessing ? "Updating..." : "Suspend Listing"}
                  </button>
                ) : (
                  <button
                    disabled={isProcessing}
                    onClick={() => handleAction("APPROVED")}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md transition cursor-pointer disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-4 h-4" /> {isProcessing ? "Saving to Database..." : "Approve & Publish Live"}
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
