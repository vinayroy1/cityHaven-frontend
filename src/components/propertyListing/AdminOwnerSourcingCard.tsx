"use client";

import React, { useMemo } from "react";
import { useFormContext } from "react-hook-form";
import { useAdmin } from "@/features/admin/adminStore";
import type { PropertyListingFormValues } from "@/types/propertyListing.types";
import {
  UserCheck,
  UserPlus,
  ShieldCheck,
  Sparkles,
  Phone,
  User,
  Globe,
  BellRing,
  FileText,
  BadgeAlert,
  CheckCircle2,
} from "lucide-react";

const SOURCING_CHANNELS = [
  { value: "GOOGLE_SOURCED", label: "Google Maps / Google Business / Search" },
  { value: "OFFLINE_FIELD_SCOUT", label: "Field Scout / Offline To-Let Board" },
  { value: "DIRECT_INBOUND_CALL", label: "Inbound Helpline / Owner Call" },
  { value: "PORTAL_AGGREGATOR", label: "Classifieds / External Portal Intake" },
  { value: "OTHER", label: "Other Assisted Channel" },
];

export function AdminOwnerSourcingCard() {
  const { register, watch, setValue } = useFormContext<PropertyListingFormValues>();
  const { userList, currentStaff } = useAdmin();

  const ownerName = watch("context.ownerName") || "";
  const ownerContact = watch("context.ownerContact") || "";
  const source = watch("context.source") || "GOOGLE_SOURCED";
  const sendOwnerNotification = watch("context.sendOwnerNotification") ?? true;
  const publishStatus = watch("publishOptions.status") || "ACTIVE";
  const qcRequired = watch("publishOptions.qcRequired") ?? false;

  // Clean the phone number for 10-digit matching
  const cleanPhone = useMemo(() => {
    return ownerContact.replace(/\D/g, "").slice(-10);
  }, [ownerContact]);

  const matchedUser = useMemo(() => {
    if (cleanPhone.length !== 10) return null;
    return userList.find((u) => {
      const uPhone = (u.mobileNumber || "").replace(/\D/g, "").slice(-10);
      return uPhone === cleanPhone;
    }) || null;
  }, [cleanPhone, userList]);

  // When a matched user is found, auto-fill or offer their details
  const handleUseMatchedUser = () => {
    if (matchedUser) {
      if (matchedUser.name && !ownerName) {
        setValue("context.ownerName", matchedUser.name, { shouldDirty: true });
      }
      setValue("context.ownerId", matchedUser.id, { shouldDirty: true });
    }
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border-2 border-indigo-500/30 bg-gradient-to-br from-indigo-500/[0.04] via-slate-50 to-emerald-500/[0.04] p-5 shadow-sm dark:border-indigo-500/20 dark:from-indigo-950/20 dark:via-slate-900/40 dark:to-emerald-950/20">
      {/* Decorative staff indicator bar */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200/80 pb-4 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-rose-600 text-white shadow-sm shadow-indigo-500/20">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Admin Sourcing &amp; Owner Handover Portal
              </h2>
              <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-700 ring-1 ring-inset ring-indigo-600/20 dark:bg-indigo-950/60 dark:text-indigo-300">
                <Sparkles className="h-3 w-3 text-indigo-500" />
                Staff Mode
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              List on behalf of the real property owner. Auto-links or provisions a shadow account for one-click OTP login handover.
            </p>
          </div>
        </div>

        {currentStaff && (
          <div className="inline-flex items-center gap-1.5 self-start sm:self-auto rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600 dark:bg-slate-800/80 dark:text-slate-300">
            <span>Staff ID:</span>
            <span className="font-semibold text-slate-900 dark:text-white">
              {currentStaff.name || currentStaff.email}
            </span>
          </div>
        )}
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {/* Owner Mobile Number */}
        <div className="space-y-1.5">
          <label className="flex items-center justify-between text-xs font-semibold text-slate-800 dark:text-slate-200">
            <span className="flex items-center gap-1.5">
              <Phone className="h-3.5 w-3.5 text-indigo-500" />
              Owner Contact Number (10 Digits) *
            </span>
            {cleanPhone.length === 10 && (
              <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                10 Digits Valid
              </span>
            )}
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 dark:text-slate-500">
              +91
            </span>
            <input
              type="tel"
              maxLength={10}
              placeholder="e.g. 9876543210"
              {...register("context.ownerContact", {
                required: "Owner mobile number is required in Admin Sourcing mode",
                pattern: {
                  value: /^[6-9]\d{9}$/,
                  message: "Please enter a valid 10-digit Indian mobile number",
                },
              })}
              className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-12 pr-4 text-sm font-medium text-slate-900 shadow-sm transition placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
            />
          </div>

          {/* Real-time Phone Lookup Status Banner */}
          {cleanPhone.length === 10 && (
            <div className="mt-1.5">
              {matchedUser ? (
                <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50/80 px-3 py-2 text-xs text-emerald-900 dark:border-emerald-800/80 dark:bg-emerald-950/40 dark:text-emerald-300">
                  <div className="flex items-center gap-1.5">
                    <UserCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    <span>
                      Registered User Found: <strong>{matchedUser.name || "Owner"}</strong> (ID: #{matchedUser.id})
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleUseMatchedUser}
                    className="rounded-lg bg-emerald-600 px-2 py-0.5 text-[11px] font-semibold text-white hover:bg-emerald-700"
                  >
                    Link ID
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50/70 px-3 py-2 text-xs text-indigo-900 dark:border-indigo-800/60 dark:bg-indigo-950/30 dark:text-indigo-300">
                  <UserPlus className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                  <span>
                    New Owner Mobile: Shadow account will be auto-created. Owner can log in via OTP to claim.
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Owner Full Name */}
        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200">
            <User className="h-3.5 w-3.5 text-indigo-500" />
            Owner Full Name
          </label>
          <input
            type="text"
            placeholder="e.g. Ramesh Kumar Sharma"
            {...register("context.ownerName")}
            className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm font-medium text-slate-900 shadow-sm transition placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
          />
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Name displayed on listing contacts or verified badge.
          </p>
        </div>

        {/* Sourcing Channel */}
        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200">
            <Globe className="h-3.5 w-3.5 text-indigo-500" />
            Sourcing Origin Channel *
          </label>
          <select
            {...register("context.source")}
            className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-900 shadow-sm transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
          >
            {SOURCING_CHANNELS.map((ch) => (
              <option key={ch.value} value={ch.value}>
                {ch.label}
              </option>
            ))}
          </select>
        </div>

        {/* Publication & Approval Policy */}
        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200">
            <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
            Publishing Authority
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                setValue("publishOptions.status", "ACTIVE", { shouldDirty: true });
                setValue("publishOptions.qcRequired", false, { shouldDirty: true });
              }}
              className={`flex items-center justify-center gap-1.5 rounded-xl border p-2.5 text-xs font-semibold transition ${
                publishStatus === "ACTIVE" && !qcRequired
                  ? "border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:border-emerald-400 dark:text-emerald-300 shadow-sm"
                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400"
              }`}
            >
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
              Direct Live (Active)
            </button>

            <button
              type="button"
              onClick={() => {
                setValue("publishOptions.status", "DRAFT", { shouldDirty: true });
                setValue("publishOptions.qcRequired", true, { shouldDirty: true });
              }}
              className={`flex items-center justify-center gap-1.5 rounded-xl border p-2.5 text-xs font-semibold transition ${
                publishStatus === "DRAFT" || qcRequired
                  ? "border-amber-500 bg-amber-500/10 text-amber-700 dark:border-amber-400 dark:text-amber-300 shadow-sm"
                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400"
              }`}
            >
              <BadgeAlert className="h-3.5 w-3.5 text-amber-500" />
              Save for QC Queue
            </button>
          </div>
        </div>
      </div>

      {/* Handover notification & Internal staff notes */}
      <div className="mt-4 flex flex-col gap-3 rounded-xl border border-slate-200/90 bg-white/80 p-3.5 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800/90 dark:bg-slate-900/60">
        <label className="flex items-center gap-2.5 cursor-pointer text-xs font-medium text-slate-700 dark:text-slate-300">
          <input
            type="checkbox"
            {...register("context.sendOwnerNotification")}
            className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 dark:border-slate-700"
          />
          <BellRing className="h-4 w-4 text-indigo-500" />
          <span>
            Send handover SMS / WhatsApp notification to owner with claim link upon publishing
          </span>
        </label>

        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Staff internal sourcing note (optional)..."
            {...register("context.adminNotes")}
            className="h-8 rounded-lg border border-slate-200 bg-slate-50 px-2.5 text-xs text-slate-800 placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
          />
        </div>
      </div>
    </div>
  );
}
