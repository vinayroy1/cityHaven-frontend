"use client";

import React, { useState } from "react";
import { X, CheckCircle2, Calculator, Sparkles, Building2, User } from "lucide-react";
import type { InteriorProfile } from "@/types/interior.types";
import { useSubmitInteriorInquiryMutation } from "@/features/interiors/api";

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
  const [bhkType, setBhkType] = useState("2 BHK");
  const [carpetAreaSqft, setCarpetAreaSqft] = useState("950");
  const [projectScope, setProjectScope] = useState("Full Home Turnkey");
  const [finishTier, setFinishTier] = useState("PREMIUM");
  const [possessionStatus, setPossessionStatus] = useState("Ready to Move");
  const [siteVisitRequested, setSiteVisitRequested] = useState(true);
  const [notes, setNotes] = useState("");

  const [submitInquiry, { isLoading }] = useSubmitInteriorInquiryMutation();

  if (!isOpen || !profile) return null;

  // Approximate ballpark calculator
  const area = Number(carpetAreaSqft) || 900;
  const multiplier = finishTier === "ESSENTIAL" ? 1400 : finishTier === "PREMIUM" ? 1900 : 2600;
  const estimatedTotal = area * multiplier;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await submitInquiry({
        profileId: profile.id,
        data: {
          clientName,
          clientPhone,
          clientEmail,
          cityName: profile.primaryCity,
          locality: profile.primaryLocality,
          bhkType,
          carpetAreaSqft: area,
          projectScope,
          finishTier,
          budgetMin: Math.round(estimatedTotal * 0.9),
          budgetMax: Math.round(estimatedTotal * 1.15),
          possessionStatus,
          siteVisitRequested,
          notes,
        },
      }).unwrap();

      setStep("success");
    } catch (err: any) {
      alert(err?.data?.message || "Failed to submit request");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs">
      <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 max-h-[92vh] overflow-y-auto">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
        >
          <X className="h-5 w-5" />
        </button>

        {step === "success" ? (
          <div className="py-6 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <h3 className="mt-4 text-xl font-bold text-slate-900 dark:text-white">Estimate Request Sent!</h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              <strong className="text-slate-900 dark:text-white">{profile.businessName}</strong> has received your project details. Their team will contact you shortly to confirm your consultation.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-6 w-full rounded-xl bg-slate-900 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-rose-600 dark:hover:bg-rose-500"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                Get Free Estimate & Consultation
              </span>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                {profile.businessName}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Share your space details to get a customized price estimate and schedule a walkthrough.
              </p>
            </div>

            {/* Estimated Price Range Preview Card */}
            <div className="rounded-xl border border-rose-200 bg-rose-50/70 p-3.5 text-slate-900 dark:border-rose-900/50 dark:bg-rose-950/20 dark:text-white">
              <div className="flex items-center justify-between text-xs font-bold text-rose-700 dark:text-rose-400">
                <span className="inline-flex items-center gap-1">
                  <Calculator className="h-3.5 w-3.5" />
                  Estimated Ballpark Budget
                </span>
                <span>{finishTier} Finish</span>
              </div>
              <p className="mt-1 text-xl font-black text-slate-950 dark:text-white">
                ₹{(estimatedTotal / 100000).toFixed(2)} Lakhs
                <span className="text-xs font-normal text-slate-500 dark:text-slate-400 ml-1">
                  (₹{multiplier}/sq.ft. approx)
                </span>
              </p>
            </div>

            {/* BHK & Carpet Area */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Space Type
                </label>
                <select
                  value={bhkType}
                  onChange={(e) => setBhkType(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  <option value="1 BHK">1 BHK</option>
                  <option value="2 BHK">2 BHK</option>
                  <option value="3 BHK">3 BHK</option>
                  <option value="4 BHK+">4 BHK+</option>
                  <option value="Villa">Villa / Bungalow</option>
                  <option value="Commercial">Commercial / Office</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Carpet Area (sq.ft.)
                </label>
                <input
                  type="number"
                  value={carpetAreaSqft}
                  onChange={(e) => setCarpetAreaSqft(e.target.value)}
                  placeholder="e.g. 950"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
            </div>

            {/* Scope & Finish Tier */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Project Scope
                </label>
                <select
                  value={projectScope}
                  onChange={(e) => setProjectScope(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  <option value="Full Home Turnkey">Full Home Turnkey</option>
                  <option value="Modular Kitchen & Wardrobes">Modular Kitchen & Wardrobes</option>
                  <option value="Full Renovation">Full Renovation</option>
                  <option value="Design & 3D Only">Design & 3D Only</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Finish Quality
                </label>
                <select
                  value={finishTier}
                  onChange={(e) => setFinishTier(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  <option value="ESSENTIAL">Essential (BWR Ply + Laminate)</option>
                  <option value="PREMIUM">Premium (Marine Ply + Acrylic)</option>
                  <option value="LUXE">Luxe (Veneer / PU + Automation)</option>
                </select>
              </div>
            </div>

            {/* Contact Details */}
            <div className="border-t border-slate-100 pt-3 dark:border-slate-800 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Your Name *
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

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Mobile Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    placeholder="10-digit phone"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                    placeholder="name@email.com"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="siteVisit"
                  checked={siteVisitRequested}
                  onChange={(e) => setSiteVisitRequested(e.target.checked)}
                  className="h-4 w-4 rounded text-rose-600 focus:ring-rose-500"
                />
                <label htmlFor="siteVisit" className="text-xs text-slate-700 dark:text-slate-300">
                  Request an in-person site visit / walkthrough
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="mt-4 w-full rounded-xl bg-rose-600 py-3 text-center text-xs font-bold text-white shadow-md transition hover:bg-rose-700 disabled:opacity-50"
            >
              {isLoading ? "Submitting..." : "Get Detailed Estimate & Quote"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

