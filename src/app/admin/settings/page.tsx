"use client";

import React, { useEffect, useState } from "react";
import { useAdmin } from "@/features/admin/adminStore";
import { useIsMounted } from "@/features/admin/dateUtils";
import type { PropertyReviewPolicy, OrgReviewPolicy, WorkloadRoutingStrategy } from "@/features/admin/types";
import {
  Sliders,
  ShieldCheck,
  Zap,
  Users2,
  Building2,
  FileCheck2,
  CheckCircle2,
  AlertTriangle,
  RotateCw,
  Scale,
  DollarSign,
  Sparkles,
  Lock,
} from "lucide-react";

export default function AdminSettingsPage() {
  const mounted = useIsMounted();
  const {
    currentStaff,
    governanceSettings,
    updateGovernanceSettings,
    autoDistributeWorkload,
    staffList,
    propertyQcList,
    orgVerificationList,
    disputeCases,
  } = useAdmin();

  const isSuperAdmin = currentStaff?.roles.includes("SUPER_ADMIN");
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [distributeMsg, setDistributeMsg] = useState<string | null>(null);

  // Local state for editing
  const [propertyPolicy, setPropertyPolicy] = useState<PropertyReviewPolicy>(governanceSettings.propertyReviewPolicy);
  const [orgPolicy, setOrgPolicy] = useState<OrgReviewPolicy>(governanceSettings.orgReviewPolicy);
  const [autoAssign, setAutoAssign] = useState<boolean>(governanceSettings.autoAssignEnabled);
  const [routingStrategy, setRoutingStrategy] = useState<WorkloadRoutingStrategy>(governanceSettings.routingStrategy);
  const [maxTickets, setMaxTickets] = useState<number>(governanceSettings.maxActiveTicketsPerAgent);
  const [geofenceRadius, setGeofenceRadius] = useState<number>(governanceSettings.duplicateGeofenceRadiusMeters);
  const [anomalyThreshold, setAnomalyThreshold] = useState<number>(governanceSettings.rateAnomalyThresholdPercent);
  const [refundLimitHours, setRefundLimitHours] = useState<number>(governanceSettings.autoDisputeLeadRefundLimitHours);
  const [requireDualRefund, setRequireDualRefund] = useState<boolean>(governanceSettings.requireTwoPersonRefundApproval);
  const [justificationReason, setJustificationReason] = useState<string>("");

  useEffect(() => {
    setPropertyPolicy(governanceSettings.propertyReviewPolicy);
    setOrgPolicy(governanceSettings.orgReviewPolicy);
    setAutoAssign(governanceSettings.autoAssignEnabled);
    setRoutingStrategy(governanceSettings.routingStrategy);
    setMaxTickets(governanceSettings.maxActiveTicketsPerAgent);
    setGeofenceRadius(governanceSettings.duplicateGeofenceRadiusMeters);
    setAnomalyThreshold(governanceSettings.rateAnomalyThresholdPercent);
    setRefundLimitHours(governanceSettings.autoDisputeLeadRefundLimitHours);
    setRequireDualRefund(governanceSettings.requireTwoPersonRefundApproval);
  }, [governanceSettings]);

  const handleSavePolicy = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSuperAdmin) return;

    updateGovernanceSettings(
      {
        propertyReviewPolicy: propertyPolicy,
        orgReviewPolicy: orgPolicy,
        autoAssignEnabled: autoAssign,
        routingStrategy: routingStrategy,
        maxActiveTicketsPerAgent: maxTickets,
        duplicateGeofenceRadiusMeters: geofenceRadius,
        rateAnomalyThresholdPercent: anomalyThreshold,
        autoDisputeLeadRefundLimitHours: refundLimitHours,
        requireTwoPersonRefundApproval: requireDualRefund,
      },
      justificationReason || "Governance policies updated by Super Admin"
    );

    setSuccessToast("Platform governance policies updated and logged to audit trail successfully.");
    setJustificationReason("");
    setTimeout(() => setSuccessToast(null), 4000);
  };

  const handleRunAutoDistribution = () => {
    const res = autoDistributeWorkload("ALL");
    setDistributeMsg(res.message);
    setTimeout(() => setDistributeMsg(null), 5000);
  };

  const unassignedPropertyCount = propertyQcList.filter(
    (p) => (!p.qcReviewerId || p.qcReviewerName === "Unassigned") && (p.qcStatus === "SUBMITTED" || p.qcStatus === "UNDER_REVIEW")
  ).length;

  const unassignedOrgCount = orgVerificationList.filter(
    (o) => (!o.assignedSpecialistName || o.assignedSpecialistName === "Unassigned") && (o.verificationStatus === "UNVERIFIED" || o.verificationStatus === "PENDING_REVIEW")
  ).length;

  const unassignedDisputesCount = disputeCases.filter(
    (d) => (!d.assignedTo || d.assignedTo === "Unassigned") && (d.status === "OPEN" || d.status === "ASSIGNED")
  ).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Sliders className="w-6 h-6 text-rose-500" />
            Platform Governance & Moderation Policies
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Configure listing moderation enforcement, auto-split review workload among team members, and tune fraud thresholds.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 font-mono shadow-sm flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-amber-500" />
            <span>Super Admin Controlled</span>
          </div>
        </div>
      </div>

      {/* Success Notifications */}
      {successToast && (
        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-700/60 text-xs text-emerald-700 dark:text-emerald-300 flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>{successToast}</span>
        </div>
      )}

      {distributeMsg && (
        <div className="p-3.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-700/60 text-xs text-indigo-700 dark:text-indigo-300 flex items-center gap-2 animate-in fade-in duration-200">
          <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <span>{distributeMsg}</span>
        </div>
      )}

      {!isSuperAdmin && (
        <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-700/60 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <div className="font-semibold">View-Only Permission</div>
            <div>Only staff with the <strong>SUPER_ADMIN</strong> role have authorization to modify platform governance switches and review thresholds.</div>
          </div>
        </div>
      )}

      <form onSubmit={handleSavePolicy} className="space-y-6">
        {/* 1. Property Listing Moderation Policy Switch */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100 dark:border-slate-800">
            <Building2 className="w-5 h-5 text-rose-500" />
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">Property Listing Review Switch</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Control when user-submitted properties require human Quality Control vs instant publishing.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            {/* Mandatory Review */}
            <label
              className={`p-4 rounded-xl border cursor-pointer transition flex flex-col justify-between ${
                propertyPolicy === "MANDATORY_REVIEW"
                  ? "border-rose-500 bg-rose-50/40 dark:bg-rose-950/20 ring-1 ring-rose-500"
                  : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-rose-500" /> Mandatory 100% Review
                  </span>
                  <input
                    type="radio"
                    name="propertyPolicy"
                    value="MANDATORY_REVIEW"
                    checked={propertyPolicy === "MANDATORY_REVIEW"}
                    onChange={() => setPropertyPolicy("MANDATORY_REVIEW")}
                    disabled={!isSuperAdmin}
                    className="accent-rose-600"
                  />
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                  Every submitted property is held in <strong>UNDER_REVIEW</strong> status. Nothing goes live on Awasio until an authorized Quality Control staff member manually inspects and approves it.
                </p>
              </div>
              <div className="mt-3 text-[10px] font-mono text-rose-600 dark:text-rose-400 font-semibold">
                Maximum Quality & Security
              </div>
            </label>

            {/* AI Smart Risk Triage */}
            <label
              className={`p-4 rounded-xl border cursor-pointer transition flex flex-col justify-between ${
                propertyPolicy === "AI_SMART_TRIAGE"
                  ? "border-indigo-500 bg-indigo-50/40 dark:bg-indigo-950/20 ring-1 ring-indigo-500"
                  : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-indigo-500" /> AI Smart Risk Triage
                  </span>
                  <input
                    type="radio"
                    name="propertyPolicy"
                    value="AI_SMART_TRIAGE"
                    checked={propertyPolicy === "AI_SMART_TRIAGE"}
                    onChange={() => setPropertyPolicy("AI_SMART_TRIAGE")}
                    disabled={!isSuperAdmin}
                    className="accent-indigo-600"
                  />
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                  Low-risk listings (&lt;20 score from verified accounts) are <strong>auto-published live instantly</strong>. High-risk listings (rate anomalies, duplicate alerts) are queued for team review.
                </p>
              </div>
              <div className="mt-3 text-[10px] font-mono text-indigo-600 dark:text-indigo-400 font-semibold">
                Recommended for Millions of Listings
              </div>
            </label>

            {/* Instant Publish Bypass */}
            <label
              className={`p-4 rounded-xl border cursor-pointer transition flex flex-col justify-between ${
                propertyPolicy === "INSTANT_PUBLISH_BYPASS"
                  ? "border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/20 ring-1 ring-emerald-500"
                  : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-emerald-500" /> Instant Publish (Review Off)
                  </span>
                  <input
                    type="radio"
                    name="propertyPolicy"
                    value="INSTANT_PUBLISH_BYPASS"
                    checked={propertyPolicy === "INSTANT_PUBLISH_BYPASS"}
                    onChange={() => setPropertyPolicy("INSTANT_PUBLISH_BYPASS")}
                    disabled={!isSuperAdmin}
                    className="accent-emerald-600"
                  />
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                  Pre-moderation is completely bypassed. All listings go live immediately upon submission. Moderation team conducts post-publish audits only when reported.
                </p>
              </div>
              <div className="mt-3 text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                Instant Velocity / Low Friction
              </div>
            </label>
          </div>
        </div>

        {/* 2. Automated Team Workload Auto-Split Engine */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              <Users2 className="w-5 h-5 text-indigo-500" />
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">Automated Team Workload Routing</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">Auto-split review tasks evenly among team members so work does not pile on a single staff member.</p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleRunAutoDistribution}
              className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition cursor-pointer self-start sm:self-auto"
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span>⚡ Auto-Distribute Backlog Now</span>
            </button>
          </div>

          {/* Current Queue Status */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs">
            <div>
              <div className="text-slate-500 dark:text-slate-400 text-[11px]">Unassigned Quality Control:</div>
              <div className="text-sm font-bold text-rose-600 dark:text-rose-400 font-mono">{unassignedPropertyCount} listings</div>
            </div>
            <div>
              <div className="text-slate-500 dark:text-slate-400 text-[11px]">Unassigned Org KYC:</div>
              <div className="text-sm font-bold text-indigo-600 dark:text-indigo-400 font-mono">{unassignedOrgCount} dossiers</div>
            </div>
            <div>
              <div className="text-slate-500 dark:text-slate-400 text-[11px]">Unassigned Disputes:</div>
              <div className="text-sm font-bold text-amber-600 dark:text-amber-400 font-mono">{unassignedDisputesCount} cases</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Auto Assignment Toggle */}
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">Auto-Assign on Submission</div>
                  <div className="text-[11px] text-slate-500">Automatically assign new tasks immediately to active team members.</div>
                </div>
                <input
                  type="checkbox"
                  checked={autoAssign}
                  onChange={(e) => setAutoAssign(e.target.checked)}
                  disabled={!isSuperAdmin}
                  className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
                />
              </div>
            </div>

            {/* Routing Strategy */}
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
              <label className="block text-xs font-bold text-slate-900 dark:text-white">Work Distribution Strategy</label>
              <select
                value={routingStrategy}
                onChange={(e) => setRoutingStrategy(e.target.value as WorkloadRoutingStrategy)}
                disabled={!isSuperAdmin}
                className="w-full p-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-white outline-none focus:border-indigo-500"
              >
                <option value="LEAST_LOADED">Least Loaded (Assign to agent with lowest active count)</option>
                <option value="ROUND_ROBIN">Round-Robin (Rotate sequentially among active agents)</option>
                <option value="MANUAL_CLAIM">Manual Claim (Reviewers pick from unassigned pool)</option>
              </select>
            </div>

            {/* Max Active Tickets per Agent */}
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="font-bold text-slate-900 dark:text-white">Max Active Queue per Reviewer</span>
                <span className="font-mono text-indigo-600 dark:text-indigo-400 font-bold">{maxTickets} tickets</span>
              </div>
              <input
                type="range"
                min={5}
                max={30}
                step={1}
                value={maxTickets}
                onChange={(e) => setMaxTickets(Number(e.target.value))}
                disabled={!isSuperAdmin}
                className="w-full accent-indigo-600 cursor-pointer"
              />
              <div className="text-[10px] text-slate-400">Prevents overloading any single team member beyond their capacity.</div>
            </div>

            {/* Org KYC Policy */}
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
              <label className="block text-xs font-bold text-slate-900 dark:text-white">Organization KYC Enforcement</label>
              <select
                value={orgPolicy}
                onChange={(e) => setOrgPolicy(e.target.value as OrgReviewPolicy)}
                disabled={!isSuperAdmin}
                className="w-full p-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-white outline-none focus:border-indigo-500"
              >
                <option value="MANDATORY_KYC">Mandatory KYC (GSTIN/RERA approval required before publishing)</option>
                <option value="INSTANT_PROVISIONAL">Provisional Allowed (Post up to 3 listings during review)</option>
              </select>
            </div>
          </div>
        </div>

        {/* 3. Platform Risk & SLA Thresholds */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100 dark:border-slate-800">
            <Scale className="w-5 h-5 text-amber-500" />
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">Risk Sensitivity & Financial Thresholds</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Set automatic flags for price fraud, duplicate coordinates, and refund approvals.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Geofence Sensitivity */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1.5">
              <div className="flex justify-between text-xs font-medium text-slate-800 dark:text-slate-200">
                <span>Duplicate Geofence Radius</span>
                <span className="font-mono text-rose-600 dark:text-rose-400 font-bold">{geofenceRadius} meters</span>
              </div>
              <input
                type="range"
                min={25}
                max={300}
                step={25}
                value={geofenceRadius}
                onChange={(e) => setGeofenceRadius(Number(e.target.value))}
                disabled={!isSuperAdmin}
                className="w-full accent-rose-600 cursor-pointer"
              />
              <div className="text-[10px] text-slate-500">Flags listings with matching unit specs within this geographical radius.</div>
            </div>

            {/* Rate Anomaly */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1.5">
              <div className="flex justify-between text-xs font-medium text-slate-800 dark:text-slate-200">
                <span>Rate Anomaly Threshold</span>
                <span className="font-mono text-amber-600 dark:text-amber-400 font-bold">±{anomalyThreshold}%</span>
              </div>
              <input
                type="range"
                min={15}
                max={60}
                step={5}
                value={anomalyThreshold}
                onChange={(e) => setAnomalyThreshold(Number(e.target.value))}
                disabled={!isSuperAdmin}
                className="w-full accent-amber-600 cursor-pointer"
              />
              <div className="text-[10px] text-slate-500">Holds listings priced dramatically below/above locality benchmark for review.</div>
            </div>

            {/* Dual Approval for Refunds */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">Two-Person Dual Refund Approval</div>
                  <div className="text-[10px] text-slate-500">Finance Executive requests + Approver signs off.</div>
                </div>
                <input
                  type="checkbox"
                  checked={requireDualRefund}
                  onChange={(e) => setRequireDualRefund(e.target.checked)}
                  disabled={!isSuperAdmin}
                  className="w-4 h-4 accent-emerald-600 rounded cursor-pointer"
                />
              </div>
              <div className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                Protects against unauthorized balance drains
              </div>
            </div>
          </div>
        </div>

        {/* Audit Justification & Save Button */}
        {isSuperAdmin && (
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200">
              Audit Justification for Policy Change (Required)
            </label>
            <input
              type="text"
              value={justificationReason}
              onChange={(e) => setJustificationReason(e.target.value)}
              placeholder="e.g. Switched to AI Smart Triage for Diwali festive listing surge..."
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-rose-500 rounded-xl text-xs text-slate-900 dark:text-white outline-none"
            />
            <div className="flex items-center justify-between pt-2">
              <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                Last updated: {mounted ? new Date(governanceSettings.updatedAt).toLocaleString() : "Recently"} by {governanceSettings.updatedByStaffName}
              </div>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-md transition cursor-pointer"
              >
                Save & Apply Platform Policies
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
