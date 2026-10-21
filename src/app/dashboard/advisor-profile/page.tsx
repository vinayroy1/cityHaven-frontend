"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Building2,
  CheckCircle2,
  Clock,
  Crown,
  FileCheck2,
  FileText,
  Globe2,
  IdCard,
  MapPin,
  Phone,
  Save,
  Send,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Upload,
  User,
  X,
} from "lucide-react";
import { HeaderNav } from "@/app/homePage/components/HeaderNav";
import {
  DEFAULT_PROFILE,
  getAgentProfile,
  saveAgentProfile,
  submitAgentForVerification,
  setAgentVerificationStatus,
  updateAgentSubscription,
  type AgentProfileData,
} from "@/lib/services/agentProfile";
import type { AgentSubscriptionTier } from "@/data/agents";

const INDIAN_STATES = [
  "Delhi",
  "Haryana",
  "Uttar Pradesh",
  "Maharashtra",
  "Karnataka",
  "Telangana",
  "Tamil Nadu",
  "West Bengal",
];

const CITIES = ["Delhi", "Gurugram", "Noida", "Mumbai", "Bengaluru", "Pune", "Hyderabad"];

const AVAILABLE_SERVICES = [
  "Private site walkthroughs",
  "Price negotiation",
  "Title & document check",
  "Home loan assistance",
  "Registry & stamp duty support",
  "Investment portfolio advisory",
];

const ALL_LANGUAGES = ["English", "Hindi", "Punjabi", "Marathi", "Kannada", "Telugu", "Tamil", "Bengali"];

const SAMPLE_AVATARS = [
  { label: "Male Professional 1", url: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=600&q=80" },
  { label: "Female Professional 1", url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80" },
  { label: "Male Professional 2", url: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=600&q=80" },
  { label: "Female Professional 2", url: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=600&q=80" },
];

export default function AdvisorProfilePage() {
  const [profile, setProfile] = useState<AgentProfileData>(DEFAULT_PROFILE);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [newLocality, setNewLocality] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [activeTab, setActiveTab] = useState<"profile" | "plans">("profile");

  useEffect(() => {
    const data = getAgentProfile();
    setProfile(data);

    const handleUpdate = () => {
      setProfile(getAgentProfile());
    };
    window.addEventListener("awasio:agent-profile-updated", handleUpdate);
    return () => window.removeEventListener("awasio:agent-profile-updated", handleUpdate);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleFieldChange = (field: keyof AgentProfileData, val: any) => {
    setProfile((prev) => ({ ...prev, [field]: val }));
  };

  const handleSave = () => {
    saveAgentProfile(profile);
    showToast("Profile details saved successfully.");
  };

  const handleSubmitVerification = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile.reraId.trim()) {
      showToast("Please enter a valid RERA Registration Number.");
      return;
    }
    const updated = submitAgentForVerification(profile.id);
    setProfile(updated);
    showToast("Submitted for RERA compliance verification!");
  };

  const handleSimulateApproval = () => {
    const updated = setAgentVerificationStatus(profile.id, "VERIFIED");
    setProfile(updated);
    showToast("Admin Action: Advisor successfully verified and listed!");
  };

  const handleSimulateReject = () => {
    const updated = setAgentVerificationStatus(
      profile.id,
      "REJECTED",
      "RERA Certificate blurred or license registration expired. Please re-upload current year cert."
    );
    setProfile(updated);
    showToast("Admin Action: Status set to Rejected.");
  };

  const handleSimulateReset = () => {
    const updated = setAgentVerificationStatus(profile.id, "DRAFT");
    setProfile(updated);
    showToast("Reset to Draft state.");
  };

  const handleSelectTier = (tier: AgentSubscriptionTier) => {
    const updated = updateAgentSubscription(profile.id, tier);
    setProfile(updated);
    if (tier === "FREE_VERIFIED") {
      showToast("Subscription set to Free Verified Directory Listing.");
    } else if (tier === "CITY_SPOTLIGHT") {
      showToast("Activated City Spotlight! Featured on Homepage.");
    } else {
      showToast("Upgraded to Pro Advisor! #1 Homepage placement active.");
    }
  };

  const toggleService = (srv: string) => {
    const current = profile.services || [];
    const updated = current.includes(srv)
      ? current.filter((s) => s !== srv)
      : [...current, srv];
    handleFieldChange("services", updated);
  };

  const toggleLanguage = (lang: string) => {
    const current = profile.languages || [];
    const updated = current.includes(lang)
      ? current.filter((l) => l !== lang)
      : [...current, lang];
    handleFieldChange("languages", updated);
  };

  const handleAddLocality = () => {
    if (!newLocality.trim()) return;
    const currentAreas = profile.area ? profile.area.split(" & ") : [];
    if (!currentAreas.includes(newLocality.trim())) {
      const updated = [...currentAreas, newLocality.trim()].join(" & ");
      handleFieldChange("area", updated);
    }
    setNewLocality("");
  };

  const handleRemoveArea = (item: string) => {
    const currentAreas = profile.area ? profile.area.split(" & ") : [];
    const updated = currentAreas.filter((a) => a !== item).join(" & ");
    handleFieldChange("area", updated);
  };

  const handleMockUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    setTimeout(() => {
      setIsUploading(false);
      handleFieldChange("reraDocumentName", file.name);
      showToast(`Uploaded document: ${file.name}`);
    }, 900);
  };

  const localitiesList = profile.area ? profile.area.split(" & ").filter(Boolean) : [];

  return (
    <main className="min-h-screen w-full overflow-x-hidden bg-gradient-to-b from-rose-50/50 via-white to-amber-50/40 text-slate-900 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 dark:text-slate-100 transition-colors duration-150">
      <HeaderNav />

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-50 flex items-center gap-2 rounded-2xl border border-slate-800 bg-slate-950/95 px-4 py-2.5 text-xs font-semibold text-white shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-bottom-3 duration-200 max-w-[90vw]">
          <Sparkles className="h-4 w-4 text-amber-400 shrink-0" />
          <span className="truncate">{toastMessage}</span>
        </div>
      )}

      <div className="w-full max-w-5xl mx-auto flex flex-col gap-3 sm:gap-5 px-3 sm:px-6 pt-2.5 sm:pt-6 pb-28 sm:pb-12 min-w-0">
        
        {/* =========================================================================
            UNIFIED COMPACT HEADER CARD (Replaces previous 4 bloated top banners)
            Takes only ~75px on mobile, giving immediate access to profile form
           ========================================================================= */}
        <section className="w-full rounded-2xl border border-slate-200/90 bg-white/95 p-3 sm:p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900/95 space-y-2.5">
          {/* Top Row: Back Link + Quick Actions */}
          <div className="flex items-center justify-between gap-2">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Dashboard</span>
            </Link>

            <div className="flex items-center gap-1.5 shrink-0">
              {/* RERA Status Pill */}
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                  profile.status === "VERIFIED"
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800"
                    : profile.status === "PENDING_VERIFICATION"
                    ? "bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800"
                    : "bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-300"
                }`}
              >
                <ShieldCheck className="h-3 w-3 shrink-0" />
                <span>{profile.status === "VERIFIED" ? "RERA Verified" : profile.status.replace("_", " ")}</span>
              </span>

              {/* View Live Profile Link */}
              <Link
                href={`/agents/${profile.id}`}
                target="_blank"
                className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              >
                <span>Live</span>
                <ArrowRight className="h-3 w-3" />
              </Link>

              {/* Quick Save Draft Button */}
              <button
                type="button"
                onClick={handleSave}
                className="inline-flex items-center gap-1 rounded-full bg-rose-600 px-3 py-1 text-[11px] font-bold text-white shadow-xs hover:bg-rose-700 active:scale-95 transition"
              >
                <Save className="h-3 w-3" />
                <span>Save</span>
              </button>
            </div>
          </div>

          {/* Bottom Row: Page Title + Minimal Segmented Switcher */}
          <div className="flex items-center justify-between border-t border-slate-100 pt-2 dark:border-slate-800">
            <div className="min-w-0 pr-2">
              <h1 className="text-sm sm:text-lg font-bold text-slate-950 dark:text-white truncate">
                Advisor Profile & RERA
              </h1>
            </div>

            {/* Segmented View Switcher */}
            <div className="inline-flex items-center rounded-xl bg-slate-100 p-0.5 dark:bg-slate-800 shrink-0">
              <button
                type="button"
                onClick={() => setActiveTab("profile")}
                className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition ${
                  activeTab === "profile"
                    ? "bg-white text-slate-900 shadow-xs dark:bg-slate-900 dark:text-white"
                    : "text-slate-500 hover:text-slate-800 dark:text-slate-400"
                }`}
              >
                Profile Form
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("plans")}
                className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-bold transition ${
                  activeTab === "plans"
                    ? "bg-white text-rose-600 shadow-xs dark:bg-slate-900 dark:text-rose-400"
                    : "text-slate-500 hover:text-slate-800 dark:text-slate-400"
                }`}
              >
                <Crown className="h-3 w-3 text-amber-500" />
                <span>Plans</span>
                <span className="rounded-full bg-amber-100 px-1 py-0.2 text-[9px] font-black text-amber-800 dark:bg-amber-900/60 dark:text-amber-300">
                  {profile.subscriptionTier === "PRO_ADVISOR" ? "Pro" : profile.subscriptionTier === "CITY_SPOTLIGHT" ? "Spotlight" : "Free"}
                </span>
              </button>
            </div>
          </div>
        </section>

        {/* =========================================================================
            TAB 1: ADVISOR PROFILE FORM (Immediate Access, No Overhead)
           ========================================================================= */}
        {activeTab === "profile" && (
          <div className="space-y-3 sm:space-y-5">
            <form onSubmit={handleSubmitVerification} className="space-y-3 sm:space-y-5">
              
              {/* Section 1: Identity & Brokerage Firm */}
              <div className="rounded-2xl border border-slate-200/90 bg-white/95 p-3.5 sm:p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900/95 space-y-3">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5 dark:border-slate-800">
                  <span className="flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-lg bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400 shrink-0">
                    <User className="h-3.5 w-3.5" />
                  </span>
                  <div>
                    <h2 className="text-xs sm:text-sm font-bold text-slate-950 dark:text-white">1. Identity & Brokerage Firm</h2>
                    <p className="text-[10px] sm:text-[11px] text-slate-500">Public identity displayed to property buyers and investors.</p>
                  </div>
                </div>

                <div className="grid gap-2.5 sm:gap-3 sm:grid-cols-2">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={profile.name}
                      onChange={(e) => handleFieldChange("name", e.target.value)}
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-rose-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      placeholder="e.g. Aarav Kapoor"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">Designation / Role *</label>
                    <input
                      type="text"
                      required
                      value={profile.role}
                      onChange={(e) => handleFieldChange("role", e.target.value)}
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-rose-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      placeholder="e.g. Senior Property Advisor"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">Agency / Brokerage Firm *</label>
                    <div className="relative mt-1">
                      <Building2 className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                      <input
                        type="text"
                        required
                        value={profile.agency}
                        onChange={(e) => handleFieldChange("agency", e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-white pl-8 pr-3 py-2 text-xs text-slate-900 focus:border-rose-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                        placeholder="e.g. Urban Nest Realty"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">Direct Phone (Site Visit WhatsApp) *</label>
                    <div className="relative mt-1">
                      <Phone className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                      <input
                        type="tel"
                        required
                        value={profile.phone}
                        onChange={(e) => handleFieldChange("phone", e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-white pl-8 pr-3 py-2 text-xs text-slate-900 focus:border-rose-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                        placeholder="+91 98101 24590"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">Profile Headshot Photo</label>
                    <div className="mt-1.5 flex flex-col xs:flex-row items-start xs:items-center gap-2.5 sm:gap-3.5">
                      <img
                        src={profile.avatar}
                        alt={profile.name}
                        className="h-12 w-12 sm:h-14 sm:w-14 rounded-full object-cover ring-2 ring-rose-200 dark:ring-slate-700 shadow-xs shrink-0"
                      />
                      <div className="w-full flex-1 space-y-1.5">
                        <input
                          type="url"
                          value={profile.avatar}
                          onChange={(e) => handleFieldChange("avatar", e.target.value)}
                          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 focus:border-rose-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                          placeholder="Image URL or pick sample below"
                        />
                        <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500">
                          <span className="font-medium text-slate-400">Quick avatars:</span>
                          {SAMPLE_AVATARS.map((s, idx) => (
                            <button
                              key={s.label}
                              type="button"
                              onClick={() => handleFieldChange("avatar", s.url)}
                              className="rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] hover:border-rose-300 dark:border-slate-700 dark:bg-slate-800"
                            >
                              Photo #{idx + 1}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 2: Government RERA Compliance */}
              <div className="rounded-2xl border border-slate-200/90 bg-white/95 p-3.5 sm:p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900/95 space-y-3">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5 dark:border-slate-800">
                  <span className="flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 shrink-0">
                    <ShieldCheck className="h-3.5 w-3.5" />
                  </span>
                  <div>
                    <h2 className="text-xs sm:text-sm font-bold text-slate-950 dark:text-white">2. Government RERA Legal Compliance</h2>
                    <p className="text-[10px] sm:text-[11px] text-slate-500">Mandatory under Real Estate (Regulation and Development) Act.</p>
                  </div>
                </div>

                <div className="grid gap-2.5 sm:gap-3 sm:grid-cols-2">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">RERA Authority State *</label>
                    <select
                      value={profile.reraState || profile.city}
                      onChange={(e) => handleFieldChange("reraState", e.target.value)}
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-rose-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    >
                      {INDIAN_STATES.map((st) => (
                        <option key={st} value={st}>
                          {st} RERA
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                      RERA Registration Number *
                    </label>
                    <div className="relative mt-1">
                      <IdCard className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                      <input
                        type="text"
                        required
                        value={profile.reraId}
                        onChange={(e) => handleFieldChange("reraId", e.target.value.toUpperCase())}
                        className="w-full uppercase tracking-wider rounded-xl border border-slate-200 bg-white pl-8 pr-3 py-2 text-xs font-semibold text-slate-900 focus:border-rose-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                        placeholder="e.g. DLRERA2021A0042"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                      RERA Certificate Document (PDF / JPG)
                    </label>
                    <div className="mt-1.5 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/70 p-3 sm:p-5 text-center transition hover:border-rose-300 dark:border-slate-700 dark:bg-slate-800/40">
                      {profile.reraDocumentName ? (
                        <div className="flex items-center gap-2.5 rounded-xl bg-white p-2.5 shadow-xs dark:bg-slate-800 border border-slate-100 dark:border-slate-700 w-full min-w-0">
                          <FileText className="h-5 w-5 text-emerald-600 shrink-0" />
                          <div className="min-w-0 flex-1 text-left">
                            <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{profile.reraDocumentName}</p>
                            <p className="text-[10px] text-emerald-600 font-medium flex items-center gap-1">
                              <CheckCircle2 className="h-3 w-3 shrink-0" /> Document attached
                            </p>
                          </div>
                          <label className="shrink-0 ml-2 cursor-pointer text-xs font-semibold text-rose-600 hover:underline">
                            Replace
                            <input type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={handleMockUpload} />
                          </label>
                        </div>
                      ) : (
                        <label className="cursor-pointer py-1.5">
                          <Upload className="mx-auto h-6 w-6 text-slate-400" />
                          <p className="mt-1 text-xs font-bold text-slate-800 dark:text-slate-200">
                            {isUploading ? "Uploading certificate..." : "Tap to upload RERA Certificate"}
                          </p>
                          <p className="mt-0.5 text-[10px] text-slate-400">PDF, JPG, PNG up to 10MB</p>
                          <input type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={handleMockUpload} />
                        </label>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 3: Operating Territory & Specialization */}
              <div className="rounded-2xl border border-slate-200/90 bg-white/95 p-3.5 sm:p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900/95 space-y-3">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5 dark:border-slate-800">
                  <span className="flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400 shrink-0">
                    <MapPin className="h-3.5 w-3.5" />
                  </span>
                  <div>
                    <h2 className="text-xs sm:text-sm font-bold text-slate-950 dark:text-white">3. Operating Territory & Specialization</h2>
                    <p className="text-[10px] sm:text-[11px] text-slate-500">Specify neighborhoods where you conduct in-person tours.</p>
                  </div>
                </div>

                <div className="grid gap-2.5 sm:gap-3 sm:grid-cols-2">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">Primary City *</label>
                    <select
                      value={profile.city}
                      onChange={(e) => handleFieldChange("city", e.target.value)}
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-rose-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    >
                      {CITIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">Years of Experience *</label>
                    <div className="mt-1 flex items-center gap-2.5">
                      <input
                        type="range"
                        min={1}
                        max={25}
                        value={profile.experienceYears}
                        onChange={(e) => handleFieldChange("experienceYears", parseInt(e.target.value))}
                        className="flex-1 accent-rose-600"
                      />
                      <span className="min-w-[60px] rounded-lg bg-rose-50 px-2 py-1 text-center text-xs font-bold text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 shrink-0">
                        {profile.experienceYears}+ yrs
                      </span>
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                      Key Operating Localities / Neighborhoods
                    </label>
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {localitiesList.map((loc) => (
                        <span
                          key={loc}
                          className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-800 dark:bg-slate-800 dark:text-slate-200"
                        >
                          <MapPin className="h-3 w-3 text-rose-500 shrink-0" />
                          <span>{loc}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveArea(loc)}
                            className="rounded-full hover:text-rose-600 ml-0.5"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>

                    <div className="mt-2 flex items-center gap-2">
                      <input
                        type="text"
                        value={newLocality}
                        onChange={(e) => setNewLocality(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddLocality();
                          }
                        }}
                        placeholder="Add locality (e.g. Vasant Kunj)"
                        className="flex-1 min-w-0 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 focus:border-rose-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      />
                      <button
                        type="button"
                        onClick={handleAddLocality}
                        className="shrink-0 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                      >
                        Add
                      </button>
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">Languages Spoken</label>
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {ALL_LANGUAGES.map((lang) => {
                        const isSelected = (profile.languages || []).includes(lang);
                        return (
                          <button
                            key={lang}
                            type="button"
                            onClick={() => toggleLanguage(lang)}
                            className={`rounded-full px-2.5 py-0.5 text-xs font-medium transition ${
                              isSelected
                                ? "bg-rose-600 text-white"
                                : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
                            }`}
                          >
                            {lang}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 4: Services Offered & Bio */}
              <div className="rounded-2xl border border-slate-200/90 bg-white/95 p-3.5 sm:p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900/95 space-y-3">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5 dark:border-slate-800">
                  <span className="flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-lg bg-sky-50 text-sky-600 dark:bg-sky-950/60 dark:text-sky-400 shrink-0">
                    <Globe2 className="h-3.5 w-3.5" />
                  </span>
                  <div>
                    <h2 className="text-xs sm:text-sm font-bold text-slate-950 dark:text-white">4. Services & About You</h2>
                    <p className="text-[10px] sm:text-[11px] text-slate-500">Highlight on-ground services you provide during site visits.</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">Select Services Offered</label>
                    <div className="mt-1.5 grid gap-2 sm:grid-cols-2">
                      {AVAILABLE_SERVICES.map((srv) => {
                        const active = (profile.services || []).includes(srv);
                        return (
                          <label
                            key={srv}
                            onClick={() => toggleService(srv)}
                            className={`flex cursor-pointer items-center gap-2 rounded-xl border p-2.5 text-xs font-medium transition ${
                              active
                                ? "border-rose-400 bg-rose-50/60 text-rose-950 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-200"
                                : "border-slate-200 bg-slate-50/50 text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-850 dark:text-slate-300"
                            }`}
                          >
                            <span
                              className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-md border ${
                                active
                                  ? "border-rose-600 bg-rose-600 text-white"
                                  : "border-slate-300 dark:border-slate-600"
                              }`}
                            >
                              {active && <CheckCircle2 className="h-3.5 w-3.5" />}
                            </span>
                            <span className="truncate">{srv}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                      Professional Bio / About *
                    </label>
                    <textarea
                      rows={3}
                      required
                      value={profile.bio}
                      onChange={(e) => handleFieldChange("bio", e.target.value)}
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs leading-relaxed text-slate-900 focus:border-rose-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      placeholder="Describe your background, deals handled, and in-person walkthrough assistance..."
                    />
                  </div>
                </div>
              </div>

              {/* Form Submit Footer - Guaranteed Single Row on Mobile */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-2xl border border-slate-200 bg-white/95 p-3.5 sm:p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>Back to Dashboard</span>
                </Link>

                <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={handleSave}
                    className="rounded-full border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-xs transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 text-center"
                  >
                    Save Draft
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center justify-center gap-1 rounded-full bg-rose-600 px-3.5 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-rose-700 text-center"
                  >
                    <Send className="h-3 w-3 shrink-0" />
                    <span className="truncate">Submit Verification</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* =========================================================================
            TAB 2: PLACEMENT & HOMEPAGE VISIBILITY TIERS
           ========================================================================= */}
        {activeTab === "plans" && (
          <div className="rounded-2xl border border-slate-200/90 bg-white/95 p-4 sm:p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900/95 space-y-3.5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 pb-3 dark:border-slate-800">
              <div className="min-w-0 flex-1">
                <div className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                  <Crown className="h-3.5 w-3.5" />
                  <span>Placement & Monetization Tiers</span>
                </div>
                <h2 className="mt-0.5 text-base font-bold text-slate-950 dark:text-white break-words">
                  Homepage Featured Carousel & Lead Boost
                </h2>
                <p className="mt-0.5 text-xs text-slate-500 break-words">
                  Upgrade to City Spotlight or Pro Advisor to be featured on the homepage carousel.
                </p>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto shrink-0 pt-1 sm:pt-0">
                <span className="text-xs font-semibold text-slate-500">Current Plan:</span>
                <span className="rounded-full bg-slate-900 px-2.5 py-0.5 text-xs font-bold text-white dark:bg-rose-600">
                  {profile.subscriptionTier === "PRO_ADVISOR"
                    ? "👑 Pro Advisor"
                    : profile.subscriptionTier === "CITY_SPOTLIGHT"
                    ? "⭐ City Spotlight"
                    : "Free Verified"}
                </span>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-3 pt-1">
              {/* Tier 1: Free Verified */}
              <div
                className={`rounded-2xl border p-4 flex flex-col justify-between transition ${
                  profile.subscriptionTier === "FREE_VERIFIED"
                    ? "border-slate-900 bg-slate-50/80 ring-2 ring-slate-900/10 dark:border-slate-100 dark:bg-slate-800/80"
                    : "border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Free Tier</span>
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                      Standard
                    </span>
                  </div>
                  <h3 className="mt-1 text-base font-extrabold text-slate-950 dark:text-white">Directory Only</h3>
                  <p className="mt-0.5 text-xl font-black text-slate-900 dark:text-white">₹0</p>
                  <p className="text-[11px] text-slate-400">Free forever for RERA agents</p>

                  <ul className="mt-3 space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                      <span>Public Profile Page (`/agents/[id]`)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                      <span>Search Directory (`/agents`) listing</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                      <span>RERA Verified Seal</span>
                    </li>
                    <li className="flex items-center gap-2 text-slate-400 line-through">
                      <X className="h-3.5 w-3.5 text-slate-300 shrink-0" />
                      <span>Homepage Carousel Placement</span>
                    </li>
                  </ul>
                </div>

                <button
                  type="button"
                  onClick={() => handleSelectTier("FREE_VERIFIED")}
                  className={`mt-4 w-full rounded-xl py-2 text-xs font-bold transition ${
                    profile.subscriptionTier === "FREE_VERIFIED"
                      ? "bg-slate-200 text-slate-700 cursor-default dark:bg-slate-800 dark:text-slate-300"
                      : "border border-slate-300 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300"
                  }`}
                >
                  {profile.subscriptionTier === "FREE_VERIFIED" ? "Current Plan ✓" : "Switch to Free"}
                </button>
              </div>

              {/* Tier 2: City Spotlight */}
              <div
                className={`rounded-2xl border p-4 flex flex-col justify-between relative transition ${
                  profile.subscriptionTier === "CITY_SPOTLIGHT"
                    ? "border-rose-500 bg-rose-50/40 ring-2 ring-rose-500/20 dark:border-rose-600 dark:bg-rose-950/20"
                    : "border-rose-200 bg-white hover:border-rose-300 dark:border-slate-800 dark:bg-slate-900"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                      City Spotlight
                    </span>
                    <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-bold text-rose-700 dark:bg-rose-900/60 dark:text-rose-300">
                      Popular
                    </span>
                  </div>
                  <h3 className="mt-1 text-base font-extrabold text-slate-950 dark:text-white">Homepage Feature</h3>
                  <p className="mt-0.5 text-xl font-black text-rose-600 dark:text-rose-400">₹4,999<span className="text-xs font-normal text-slate-500">/mo</span></p>
                  <p className="text-[11px] text-slate-400">Billed monthly or quarterly</p>

                  <ul className="mt-3 space-y-1.5 text-xs text-slate-700 dark:text-slate-200 font-medium">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                      <span><strong>Featured on Homepage</strong> Carousel</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                      <span>Top-Pinned in City Search (`/agents`)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                      <span>&quot;City Spotlight&quot; Golden Badge</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                      <span>Direct Visitor Leads to CRM</span>
                    </li>
                  </ul>
                </div>

                <button
                  type="button"
                  onClick={() => handleSelectTier("CITY_SPOTLIGHT")}
                  className={`mt-4 w-full rounded-xl py-2 text-xs font-bold transition shadow-xs ${
                    profile.subscriptionTier === "CITY_SPOTLIGHT"
                      ? "bg-rose-600 text-white cursor-default"
                      : "bg-slate-900 text-white hover:bg-slate-800 dark:bg-rose-600 dark:hover:bg-rose-700"
                  }`}
                >
                  {profile.subscriptionTier === "CITY_SPOTLIGHT" ? "Active on Homepage ✓" : "Activate City Spotlight"}
                </button>
              </div>

              {/* Tier 3: Pro Advisor */}
              <div
                className={`rounded-2xl border p-4 flex flex-col justify-between relative transition ${
                  profile.subscriptionTier === "PRO_ADVISOR"
                    ? "border-amber-500 bg-amber-50/40 ring-2 ring-amber-500/20 dark:border-amber-600 dark:bg-amber-950/20"
                    : "border-slate-200 bg-white hover:border-amber-300 dark:border-slate-800 dark:bg-slate-900"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                      Pro Advisor
                    </span>
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800 dark:bg-amber-900/60 dark:text-amber-300">
                      Maximum Leads
                    </span>
                  </div>
                  <h3 className="mt-1 text-base font-extrabold text-slate-950 dark:text-white">Elite Showcase</h3>
                  <p className="mt-0.5 text-xl font-black text-amber-600 dark:text-amber-400">₹9,999<span className="text-xs font-normal text-slate-500">/mo</span></p>
                  <p className="text-[11px] text-slate-400">Includes all VIP partner perks</p>

                  <ul className="mt-3 space-y-1.5 text-xs text-slate-700 dark:text-slate-200 font-medium">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                      <span><strong>#1 Priority Rank</strong> on Homepage</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                      <span>Multi-City Micro-market Presence</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                      <span>Instant WhatsApp Walkthrough Alerts</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                      <span>&quot;Pro Advisor&quot; Gold Seal on all cards</span>
                    </li>
                  </ul>
                </div>

                <button
                  type="button"
                  onClick={() => handleSelectTier("PRO_ADVISOR")}
                  className={`mt-4 w-full rounded-xl py-2 text-xs font-bold transition shadow-xs ${
                    profile.subscriptionTier === "PRO_ADVISOR"
                      ? "bg-amber-600 text-white cursor-default"
                      : "bg-slate-900 text-white hover:bg-slate-800 dark:bg-rose-600 dark:hover:bg-rose-700"
                  }`}
                >
                  {profile.subscriptionTier === "PRO_ADVISOR" ? "Active VIP Pro ✓" : "Upgrade to Pro Advisor"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Collapsible Sandbox Simulation (Non-intrusive testing tool) */}
        <details className="group rounded-xl border border-dashed border-slate-300 bg-slate-50/70 p-2.5 text-xs dark:border-slate-800 dark:bg-slate-900/60">
          <summary className="cursor-pointer font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center justify-between list-none">
            <span className="flex items-center gap-1.5">
              <BadgeCheck className="h-3.5 w-3.5 text-rose-500 shrink-0" />
              <span>Compliance Sandbox Simulation (Dev Tools)</span>
            </span>
            <span className="text-[10px] text-slate-400 group-open:rotate-180 transition">▼</span>
          </summary>
          <div className="mt-2.5 flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-200 dark:border-slate-800">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Status:</span>
            <button
              type="button"
              onClick={handleSimulateApproval}
              className="rounded-md bg-emerald-600 px-2 py-0.5 text-[10px] font-bold text-white hover:bg-emerald-700 shadow-xs"
            >
              ✓ Verify
            </button>
            <button
              type="button"
              onClick={handleSimulateReject}
              className="rounded-md bg-rose-600 px-2 py-0.5 text-[10px] font-bold text-white hover:bg-rose-700 shadow-xs"
            >
              ✕ Reject
            </button>
            <button
              type="button"
              onClick={handleSimulateReset}
              className="rounded-md border border-slate-300 bg-white px-2 py-0.5 text-[10px] font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
            >
              Draft
            </button>

            <span className="text-[10px] font-bold text-slate-400 uppercase ml-1 sm:ml-2">Tier:</span>
            <button
              type="button"
              onClick={() => handleSelectTier("FREE_VERIFIED")}
              className={`rounded-md px-2 py-0.5 text-[10px] font-semibold transition ${
                profile.subscriptionTier === "FREE_VERIFIED"
                  ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
                  : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
              }`}
            >
              Free
            </button>
            <button
              type="button"
              onClick={() => handleSelectTier("CITY_SPOTLIGHT")}
              className={`rounded-md px-2 py-0.5 text-[10px] font-bold transition ${
                profile.subscriptionTier === "CITY_SPOTLIGHT"
                  ? "bg-rose-600 text-white shadow-xs"
                  : "border border-rose-300 bg-white text-rose-700 hover:bg-rose-50 dark:border-rose-800 dark:bg-slate-800 dark:text-rose-400"
              }`}
            >
              Spotlight
            </button>
            <button
              type="button"
              onClick={() => handleSelectTier("PRO_ADVISOR")}
              className={`rounded-md px-2 py-0.5 text-[10px] font-bold transition ${
                profile.subscriptionTier === "PRO_ADVISOR"
                  ? "bg-amber-600 text-white shadow-xs"
                  : "border border-amber-300 bg-white text-amber-800 hover:bg-amber-50 dark:border-amber-800 dark:bg-slate-800 dark:text-amber-400"
              }`}
            >
              Pro
            </button>
          </div>
        </details>
      </div>
    </main>
  );
}
