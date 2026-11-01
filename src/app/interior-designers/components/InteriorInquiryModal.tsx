"use client";

import React, { useState, useMemo } from "react";
import { X, CheckCircle2, Calculator, Sparkles, Building2, User, MapPin, IndianRupee, ShieldCheck } from "lucide-react";
import type { InteriorProfile } from "@/types/interior.types";
import { useSubmitInteriorInquiryMutation } from "@/features/interiors/api";
import { CITY_LOCALITIES, PROPERTY_TYPES, SERVICES_OFFERED } from "@/constants/interior-data";

interface InquiryModalProps {
  profile: InteriorProfile | null;
  isOpen: boolean;
  onClose: () => void;
}

export function InteriorInquiryModal({ profile, isOpen, onClose }: InquiryModalProps) {
  const [step, setStep] = useState<"form" | "success">("form");
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [cityName, setCityName] = useState("");
  const [locality, setLocality] = useState("");
  const [bhkType, setBhkType] = useState("3 BHK Apartment");
  const [carpetAreaSqft, setCarpetAreaSqft] = useState("1200");
  const [projectScope, setProjectScope] = useState("Full Home Interior (Turnkey)");
  const [finishTier, setFinishTier] = useState<"ESSENTIAL" | "PREMIUM" | "LUXE">("PREMIUM");
  const [possessionStatus, setPossessionStatus] = useState("Ready to Move");
  const [siteVisitRequested, setSiteVisitRequested] = useState(true);
  const [notes, setNotes] = useState("");

  const [submitInquiry, { isLoading }] = useSubmitInteriorInquiryMutation();

  // Populate city and locality from profile once opened
  React.useEffect(() => {
    if (profile) {
      setCityName(profile.primaryCity || "Mumbai");
      setLocality(profile.primaryLocality || "");
    }
  }, [profile]);

  // Dynamic localities for city
  const availableLocalities = useMemo(() => {
    return CITY_LOCALITIES[cityName] || [];
  }, [cityName]);

  if (!isOpen || !profile) return null;

  // Approximate ballpark calculator
  const area = Number(carpetAreaSqft) || 1000;
  const multiplier = finishTier === "ESSENTIAL" ? 1400 : finishTier === "PREMIUM" ? 1950 : 2800;
  const estimatedTotal = area * multiplier;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim() || !clientPhone.trim()) {
      alert("Please provide your name and phone number");
      return;
    }

    try {
      await submitInquiry({
        profileId: profile.id,
        data: {
          clientName,
          clientPhone,
          clientEmail: clientEmail.trim() || undefined,
          cityName: cityName || profile.primaryCity,
          locality: locality || profile.primaryLocality,
          bhkType,
          carpetAreaSqft: area,
          projectScope,
          finishTier,
          budgetMin: Math.round(estimatedTotal * 0.9),
          budgetMax: Math.round(estimatedTotal * 1.15),
          possessionStatus,
          siteVisitRequested,
          notes: notes.trim() || undefined,
        },
      }).unwrap();

      setStep("success");
    } catch (err: any) {
      alert(err?.data?.message || "Failed to submit request. Please try again.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-3 sm:p-4 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-lg rounded-3xl bg-white p-5 sm:p-7 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 my-auto">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        {step === "success" ? (
          <div className="py-6 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
              <CheckCircle2 className="h-9 w-9" />
            </div>
            <h3 className="mt-4 text-xl font-black text-slate-900 dark:text-white">Estimate Request Sent!</h3>
            <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              <strong className="text-slate-900 dark:text-white">{profile.businessName}</strong> has received your project details. A dedicated interior architect will contact you within 24 hours to review your floor plan.
            </p>
            <div className="mt-6 rounded-2xl bg-slate-50 p-4 border border-slate-200 dark:border-slate-800 dark:bg-slate-800/60 text-left text-xs space-y-1">
              <div className="flex justify-between text-slate-500 dark:text-slate-400">
                <span>Estimated Budget:</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  ₹{(estimatedTotal / 100000).toFixed(2)} Lakhs
                </span>
              </div>
              <div className="flex justify-between text-slate-500 dark:text-slate-400">
                <span>Space & Area:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {bhkType} ({area} sq.ft.)
                </span>
              </div>
              <div className="flex justify-between text-slate-500 dark:text-slate-400">
                <span>Location:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {locality ? `${locality}, ` : ""}{cityName}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="mt-6 w-full rounded-2xl bg-rose-600 py-3 text-sm font-bold text-white shadow-md transition hover:bg-rose-700 active:scale-98"
            >
              Done & Return to Directory
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <div className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-0.5 text-[11px] font-bold text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">
                <Sparkles className="h-3 w-3" />
                <span>Instant Consultation & Estimate</span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white mt-1">
                {profile.businessName}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Get an accurate price breakdown for your apartment or commercial space.
              </p>
            </div>

            {/* Price Preview Estimator Card */}
            <div className="rounded-2xl border border-rose-200 bg-gradient-to-r from-rose-50/80 via-white to-rose-50/80 p-3.5 text-slate-900 dark:border-rose-900/40 dark:bg-rose-950/20 dark:text-white">
              <div className="flex items-center justify-between text-xs font-bold text-rose-700 dark:text-rose-400">
                <span className="inline-flex items-center gap-1.5">
                  <Calculator className="h-3.5 w-3.5" />
                  Estimated Turnkey Cost
                </span>
                <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-extrabold uppercase dark:bg-rose-900/50">
                  {finishTier} Tier
                </span>
              </div>
              <div className="mt-1 flex items-baseline justify-between">
                <p className="text-2xl font-black text-slate-950 dark:text-white tracking-tight">
                  ₹{(estimatedTotal / 100000).toFixed(2)} Lakhs
                </p>
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                  ₹{multiplier}/sq.ft. (All Inclusive)
                </span>
              </div>
            </div>

            {/* Location: Locality Dropdown */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  City
                </label>
                <input
                  type="text"
                  value={cityName}
                  disabled
                  className="w-full rounded-xl border border-slate-200 bg-slate-100 px-3 py-2 text-xs font-bold text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Locality
                </label>
                {availableLocalities.length > 0 ? (
                  <select
                    value={locality}
                    onChange={(e) => setLocality(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-800 shadow-2xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    <option value="">Select Locality</option>
                    {availableLocalities.map((loc) => (
                      <option key={loc} value={loc}>
                        {loc}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={locality}
                    onChange={(e) => setLocality(e.target.value)}
                    placeholder="e.g. Bandra West"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                )}
              </div>
            </div>

            {/* BHK & Carpet Area */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Configuration
                </label>
                <select
                  value={bhkType}
                  onChange={(e) => setBhkType(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  {PROPERTY_TYPES.map((pt) => (
                    <option key={pt} value={pt}>
                      {pt}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Carpet Area (sq.ft.)
                </label>
                <input
                  type="number"
                  value={carpetAreaSqft}
                  onChange={(e) => setCarpetAreaSqft(e.target.value)}
                  placeholder="e.g. 1200"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
            </div>

            {/* Scope & Material Quality Tier */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Project Scope
                </label>
                <select
                  value={projectScope}
                  onChange={(e) => setProjectScope(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  {SERVICES_OFFERED.map((svc) => (
                    <option key={svc} value={svc}>
                      {svc}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Material Finish Tier
                </label>
                <select
                  value={finishTier}
                  onChange={(e) => setFinishTier(e.target.value as any)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  <option value="ESSENTIAL">Essential (MR Ply, 1mm Laminate)</option>
                  <option value="PREMIUM">Premium (BWP 710, Acrylic, Soft-close)</option>
                  <option value="LUXE">Luxe (Italian Marble, PU, Veneer, Blum)</option>
                </select>
              </div>
            </div>

            {/* Name & Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Your Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Mobile Number *
                </label>
                <input
                  type="tel"
                  required
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  placeholder="e.g. +91 98765 43210"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
            </div>

            {/* Free Site Visit & Consultation Checkbox */}
            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="siteVisitRequested"
                checked={siteVisitRequested}
                onChange={(e) => setSiteVisitRequested(e.target.checked)}
                className="h-4 w-4 rounded-md border-slate-300 text-rose-600 focus:ring-rose-500"
              />
              <label
                htmlFor="siteVisitRequested"
                className="text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer"
              >
                Request complimentary site measurement & 3D layout consultation
              </label>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-2xl bg-rose-600 py-3 text-xs sm:text-sm font-bold text-white shadow-md transition hover:bg-rose-700 active:scale-98 disabled:opacity-50"
              >
                {isLoading ? "Submitting Inquiry..." : "Get Free Estimate & Schedule Walkthrough"}
              </button>
              <p className="mt-2 text-center text-[11px] text-slate-400">
                No spam. Your contact details are shared strictly with this verified studio.
              </p>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
