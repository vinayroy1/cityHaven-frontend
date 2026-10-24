"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Camera,
  CheckCircle2,
  Crown,
  Globe2,
  Loader2,
  MapPin,
  Phone,
  Save,
  Send,
  ShieldCheck,
  Sparkles,
  UploadCloud,
  User,
  X,
  Zap,
} from "lucide-react";
import { HeaderNav } from "@/app/homePage/components/HeaderNav";
import {
  DEFAULT_PROFILE,
  getAgentProfile,
  saveAgentProfile,
  submitAgentForVerification,
  updateAgentSubscription,
  type AgentProfileData,
} from "@/lib/services/agentProfile";
import type { AgentSubscriptionTier } from "@/data/agents";
import { CitySelectorDropdown } from "@/components/search/CitySelectorDropdown";
import { AdvisorLocalitySelector } from "./components/AdvisorLocalitySelector";
import { useGetMyAdvisorProfileQuery } from "@/features/advisors/api";
import {
  useGetCreditPlatformConfigQuery,
  useGetMyCreditsQuery,
  useGetMyPromotionsQuery,
  useActivateCreditPromotionMutation,
} from "@/features/contactVerify/api";
import { CreditWalletModal } from "@/components/billing/CreditWalletModal";

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
  const { data: serverAdvisor } = useGetMyAdvisorProfileQuery();
  const [profile, setProfile] = useState<AgentProfileData>(DEFAULT_PROFILE);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"profile" | "boost">("profile");
  const [isProcessingPhoto, setIsProcessingPhoto] = useState(false);
  const [creditModalOpen, setCreditModalOpen] = useState(false);

  const { data: creditsData, refetch: refetchCredits } = useGetMyCreditsQuery();
  const { data: configData } = useGetCreditPlatformConfigQuery();
  const { data: promotionsData, refetch: refetchPromotions } = useGetMyPromotionsQuery();
  const [activatePromotion, { isLoading: isActivating }] = useActivateCreditPromotionMutation();

  const myCredits = creditsData?.data?.credits ?? 0;
  const configuredActions = (configData?.data?.actions ?? []).filter(
    (a) => a.isEnabled && a.key.startsWith("ADVISOR_BOOST_")
  );

  const fallbackActions = [
    { key: "ADVISOR_BOOST_7", durationDays: 7, creditAmount: 75, label: "7-Day City Spotlight" },
    { key: "ADVISOR_BOOST_15", durationDays: 15, creditAmount: 130, label: "15-Day City Spotlight" },
  ];

  const advisorBoostActions = configuredActions.length > 0 ? configuredActions : fallbackActions;

  // Check if current advisor has an active boost
  const activeAdvisorPromotion = (promotionsData?.data ?? []).find(
    (p) =>
      p.targetType === "ADVISOR" &&
      p.isActive !== false &&
      (serverAdvisor?.id ? Number(p.targetId) === Number(serverAdvisor.id) : true) &&
      new Date(p.endsAt) > new Date()
  );

  const daysRemaining = activeAdvisorPromotion
    ? Math.max(1, Math.ceil((new Date(activeAdvisorPromotion.endsAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0;

  const libraryInputRef = useRef<HTMLInputElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);

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

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showToast("Please select a valid image file (PNG, JPG, WEBP)");
      return;
    }

    setIsProcessingPhoto(true);

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new window.Image();
      img.onload = () => {
        // Optimize / compress to max 600px width/height for fast loading & smooth storage
        const maxDimension = 600;
        let width = img.width;
        let height = img.height;
        if (width > height) {
          if (width > maxDimension) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          }
        } else {
          if (height > maxDimension) {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL("image/jpeg", 0.88);
          handleFieldChange("avatar", dataUrl);
          showToast("Profile headshot updated successfully!");
        } else {
          handleFieldChange("avatar", event.target?.result as string);
          showToast("Profile headshot updated!");
        }
        setIsProcessingPhoto(false);
      };
      img.onerror = () => {
        setIsProcessingPhoto(false);
        showToast("Failed to process image. Please try another photo.");
      };
      img.src = event.target?.result as string;
    };
    reader.onerror = () => {
      setIsProcessingPhoto(false);
      showToast("Failed to read image file.");
    };
    reader.readAsDataURL(file);

    e.target.value = "";
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
    if (!profile.name?.trim()) {
      showToast("Please enter your Full Name.");
      return;
    }
    const updated = submitAgentForVerification(profile.id);
    setProfile(updated);
    showToast("Submitted advisor profile for verification!");
  };



  const handleActivateBoost = async (actionKey: string, creditAmount: number) => {
    if (!serverAdvisor?.id) {
      showToast("Please save and publish your advisor profile first before activating a boost.");
      return;
    }
    if (myCredits < creditAmount) {
      setCreditModalOpen(true);
      showToast(`You have ${myCredits} credits. ${creditAmount} credits needed for this spotlight boost.`);
      return;
    }

    try {
      const res = await activatePromotion({
        actionKey,
        targetType: "ADVISOR",
        targetId: Number(serverAdvisor.id),
      }).unwrap();
      void refetchCredits();
      void refetchPromotions();
      const endStr = new Date(res.data.promotion.endsAt).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
      showToast(`🎉 City Spotlight Boost activated until ${endStr}!`);
    } catch (err: any) {
      showToast(err?.data?.message || err?.message || "Could not activate boost. Please try again.");
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

  const handleAddLocality = (localityName: string) => {
    const trimmed = localityName?.trim();
    if (!trimmed) return;
    const currentAreas = profile.area ? profile.area.split(" & ").filter(Boolean) : [];
    if (!currentAreas.some((a) => a.toLowerCase() === trimmed.toLowerCase())) {
      const updated = [...currentAreas, trimmed].join(" & ");
      handleFieldChange("area", updated);
      showToast(`Added locality: ${trimmed}`);
    }
  };

  const handleRemoveArea = (item: string) => {
    const currentAreas = profile.area ? profile.area.split(" & ").filter(Boolean) : [];
    const updated = currentAreas.filter((a) => a.toLowerCase() !== item.toLowerCase()).join(" & ");
    handleFieldChange("area", updated);
    showToast(`Removed locality: ${item}`);
  };

  const handleClearAllAreas = () => {
    handleFieldChange("area", "");
    showToast("Cleared operating localities");
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
                onClick={() => setActiveTab("boost")}
                className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-bold transition ${
                  activeTab === "boost"
                    ? "bg-white text-rose-600 shadow-xs dark:bg-slate-900 dark:text-rose-400"
                    : "text-slate-500 hover:text-slate-800 dark:text-slate-400"
                }`}
              >
                <Sparkles className="h-3 w-3 text-amber-500" />
                <span>Spotlight &amp; Boost</span>
                {activeAdvisorPromotion ? (
                  <span className="rounded-full bg-emerald-100 px-1.5 py-0.2 text-[9px] font-black text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                    ⚡ Spotlight Active
                  </span>
                ) : (
                  <span className="rounded-full bg-amber-100 px-1 py-0.2 text-[9px] font-black text-amber-800 dark:bg-amber-900/60 dark:text-amber-300">
                    Boost
                  </span>
                )}
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
                    <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                      Profile Headshot Photo
                    </label>

                    {/* Hidden Native File Inputs */}
                    <input
                      ref={libraryInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileChange}
                      className="hidden"
                    />
                    <input
                      ref={cameraInputRef}
                      type="file"
                      accept="image/*"
                      capture="user"
                      onChange={handleImageFileChange}
                      className="hidden"
                    />

                    <div className="mt-2 flex flex-col xs:flex-row items-start xs:items-center gap-3 sm:gap-4">
                      {/* Avatar preview with upload overlay / status */}
                      <div className="relative group shrink-0">
                        <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-full overflow-hidden ring-2 ring-rose-200 dark:ring-slate-700 bg-slate-100 dark:bg-slate-800 shadow-sm flex items-center justify-center">
                          {profile.avatar ? (
                            <img
                              src={profile.avatar}
                              alt={profile.name || "Advisor"}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <User className="h-8 w-8 text-slate-400" />
                          )}
                        </div>

                        {isProcessingPhoto && (
                          <div className="absolute inset-0 rounded-full bg-black/60 flex items-center justify-center backdrop-blur-xs">
                            <Loader2 className="h-6 w-6 text-white animate-spin" />
                          </div>
                        )}

                        <span className="absolute bottom-0 right-0 flex h-6 w-6 items-center justify-center rounded-full bg-rose-600 text-white shadow-md border-2 border-white dark:border-slate-900">
                          <Camera className="h-3 w-3" />
                        </span>
                      </div>

                      {/* Upload Action Buttons */}
                      <div className="flex-1 space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          {/* Library Upload Button */}
                          <button
                            type="button"
                            onClick={() => libraryInputRef.current?.click()}
                            disabled={isProcessingPhoto}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800 shadow-xs hover:border-rose-400 hover:bg-rose-50/50 hover:text-rose-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-rose-500 dark:hover:text-rose-400 active:scale-95 transition"
                          >
                            <UploadCloud className="h-4 w-4 text-rose-500 shrink-0" />
                            <span>Upload from Library</span>
                          </button>

                          {/* Camera Upload Button */}
                          <button
                            type="button"
                            onClick={() => cameraInputRef.current?.click()}
                            disabled={isProcessingPhoto}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50/80 px-3 py-2 text-xs font-semibold text-rose-700 shadow-xs hover:bg-rose-100 hover:border-rose-300 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300 dark:hover:bg-rose-900/60 active:scale-95 transition"
                          >
                            <Camera className="h-4 w-4 text-rose-600 shrink-0" />
                            <span>Take Photo</span>
                          </button>
                        </div>

                        {/* Quick Presets */}
                        <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500">
                          <span className="font-medium text-slate-400">Sample photos:</span>
                          {SAMPLE_AVATARS.map((s, idx) => (
                            <button
                              key={s.label}
                              type="button"
                              onClick={() => {
                                handleFieldChange("avatar", s.url);
                                showToast(`Selected sample photo #${idx + 1}`);
                              }}
                              className="rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-medium hover:border-rose-300 dark:border-slate-700 dark:bg-slate-800"
                            >
                              Sample #{idx + 1}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 2: Operating Territory & Specialization */}
              <div className="rounded-2xl border border-slate-200/90 bg-white/95 p-3.5 sm:p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900/95 space-y-3">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5 dark:border-slate-800">
                  <span className="flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400 shrink-0">
                    <MapPin className="h-3.5 w-3.5" />
                  </span>
                  <div>
                    <h2 className="text-xs sm:text-sm font-bold text-slate-950 dark:text-white">2. Operating Territory & Specialization</h2>
                    <p className="text-[10px] sm:text-[11px] text-slate-500">Specify neighborhoods where you conduct in-person tours.</p>
                  </div>
                </div>

                <div className="space-y-3.5">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">Primary City *</label>
                    <div className="mt-1">
                      <CitySelectorDropdown
                        selectedCityName={profile.city}
                        onSelectCity={(cityItem) => {
                          handleFieldChange("city", cityItem.name);
                          showToast(`Primary city set to ${cityItem.name}`);
                        }}
                        className="w-full [&>button]:w-full [&>button]:h-10 [&>button]:justify-between [&>button]:text-xs [&>button]:bg-white dark:[&>button]:bg-slate-800 dark:[&>button]:border-slate-700 [&_span]:max-w-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                      Key Operating Localities / Neighborhoods *
                    </label>
                    <div className="mt-1.5">
                      <AdvisorLocalitySelector
                        cityName={profile.city}
                        selectedLocalities={localitiesList}
                        onAddLocality={handleAddLocality}
                        onRemoveLocality={handleRemoveArea}
                        onClearAll={handleClearAllAreas}
                      />
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2 pt-1 border-t border-slate-100 dark:border-slate-800/80">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">Years of Experience *</label>
                      <div className="relative mt-1">
                        <input
                          type="number"
                          min={0}
                          max={60}
                          required
                          value={profile.experienceYears || ""}
                          onChange={(e) => {
                            const val = e.target.value === "" ? 0 : parseInt(e.target.value, 10);
                            handleFieldChange("experienceYears", isNaN(val) ? 0 : Math.max(0, val));
                          }}
                          placeholder="e.g. 9"
                          className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3 pr-14 text-xs font-semibold text-slate-900 focus:border-rose-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                        />
                        <span className="pointer-events-none absolute right-3 top-2.5 text-xs font-medium text-slate-400">
                          years
                        </span>
                      </div>
                    </div>

                    <div>
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
              </div>

              {/* Section 3: Services Offered & Bio */}
              <div className="rounded-2xl border border-slate-200/90 bg-white/95 p-3.5 sm:p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900/95 space-y-3">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5 dark:border-slate-800">
                  <span className="flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-lg bg-sky-50 text-sky-600 dark:bg-sky-950/60 dark:text-sky-400 shrink-0">
                    <Globe2 className="h-3.5 w-3.5" />
                  </span>
                  <div>
                    <h2 className="text-xs sm:text-sm font-bold text-slate-950 dark:text-white">3. Services & About You</h2>
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
            TAB 2: SPOTLIGHT & VISIBILITY BOOSTS (Unified Credit Platform)
           ========================================================================= */}
        {activeTab === "boost" && (
          <div className="space-y-4">
            {/* Credit Balance Header Card */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50 via-amber-100/60 to-rose-50/50 p-4 dark:border-amber-900/60 dark:from-amber-950/40 dark:to-rose-950/30">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-500 text-white shadow-md">
                  <Zap className="h-6 w-6 fill-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-900 dark:text-amber-200">
                      Your Credit Balance
                    </span>
                    <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:text-emerald-300">
                      Universal Wallet
                    </span>
                  </div>
                  <div className="flex items-baseline gap-1.5 mt-0.5">
                    <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                      {myCredits}
                    </span>
                    <span className="text-xs font-bold text-amber-800 dark:text-amber-300">Available Credits</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setCreditModalOpen(true)}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-slate-950 px-4 py-2 text-xs font-bold text-white shadow hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100 transition"
              >
                <span>+ Add Credits / Redeem Code</span>
              </button>
            </div>

            {/* Active Promotion Status Banner */}
            {activeAdvisorPromotion ? (
              <div className="rounded-2xl border border-emerald-300 bg-emerald-50 p-4 dark:border-emerald-900/80 dark:bg-emerald-950/40 flex items-start gap-3 shadow-xs">
                <Crown className="h-5 w-5 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
                <div>
                  <p className="font-bold text-sm text-emerald-950 dark:text-emerald-100">
                    ⚡ City Spotlight Active — {daysRemaining} Day{daysRemaining === 1 ? "" : "s"} Remaining
                  </p>
                  <p className="text-xs text-emerald-800 dark:text-emerald-300 mt-0.5">
                    Your verified advisor profile is currently pinned in the Homepage Carousel and ranked at the top of city searches until{" "}
                    <strong>
                      {new Date(activeAdvisorPromotion.endsAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </strong>.
                  </p>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-900/40 flex items-start gap-3">
                <ShieldCheck className="h-5 w-5 text-slate-500 mt-0.5 shrink-0" />
                <div>
                  <p className="font-bold text-xs text-slate-900 dark:text-white">
                    Standard Directory Status Active
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Your profile is visible in the standard advisor directory (`/agents`). Activate a City Spotlight boost below using credits to be featured on the homepage and get up to 10x more walkthrough inquiries.
                  </p>
                </div>
              </div>
            )}

            {/* Boost Tiers Grid */}
            <div className="rounded-2xl border border-slate-200/90 bg-white/95 p-4 sm:p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900/95 space-y-4">
              <div>
                <div className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                  <Crown className="h-3.5 w-3.5" />
                  <span>Homepage &amp; Search Visibility Boosts</span>
                </div>
                <h2 className="mt-0.5 text-base font-bold text-slate-950 dark:text-white">
                  Get Maximum Direct Walkthrough Inquiries
                </h2>
                <p className="mt-0.5 text-xs text-slate-500">
                  Boost your verified profile to top rank in your city and appear in the Homepage Featured Carousel.
                </p>
              </div>

              <div className="grid gap-3.5 md:grid-cols-3">
                {/* Standard Free Base Tier */}
                <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4 flex flex-col justify-between dark:border-slate-800 dark:bg-slate-900/50">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Free Tier</span>
                      <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                        Base
                      </span>
                    </div>
                    <h3 className="mt-1 text-base font-extrabold text-slate-950 dark:text-white">Directory Listing</h3>
                    <p className="mt-0.5 text-xl font-black text-slate-900 dark:text-white">0 Credits</p>
                    <p className="text-[11px] text-slate-400">Always free for verified RERA advisors</p>

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

                  <div className="mt-4 rounded-xl border border-slate-200 bg-white py-2 text-center text-xs font-bold text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                    Included by Default ✓
                  </div>
                </div>

                {/* Dynamic Boost Options from Credit Platform */}
                {advisorBoostActions.map((action, idx) => {
                  const isPrimary = idx === 0;
                  return (
                    <div
                      key={action.key}
                      className={`relative rounded-2xl border p-4 flex flex-col justify-between transition ${
                        isPrimary
                          ? "border-rose-400 bg-rose-50/30 ring-2 ring-rose-500/10 dark:border-rose-700 dark:bg-rose-950/20"
                          : "border-amber-400 bg-amber-50/30 ring-2 ring-amber-500/10 dark:border-amber-700 dark:bg-amber-950/20"
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                            {action.durationDays} Days Spotlight
                          </span>
                          <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-bold text-rose-700 dark:bg-rose-900/60 dark:text-rose-300">
                            {isPrimary ? "Most Popular" : "Extended"}
                          </span>
                        </div>
                        <h3 className="mt-1 text-base font-extrabold text-slate-950 dark:text-white">
                          City Spotlight Boost
                        </h3>
                        <div className="flex items-baseline gap-1 mt-0.5">
                          <p className="text-xl font-black text-slate-950 dark:text-white">
                            {action.creditAmount}
                          </p>
                          <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
                            Credits / {action.durationDays} Days
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400">Instant activation with your credit balance</p>

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
                            <span>Direct Inquiries &amp; Site Tour Leads</span>
                          </li>
                        </ul>
                      </div>

                      <button
                        type="button"
                        disabled={isActivating}
                        onClick={() => handleActivateBoost(action.key, action.creditAmount)}
                        className={`mt-4 w-full rounded-xl py-2.5 text-xs font-bold transition shadow-xs flex items-center justify-center gap-1.5 ${
                          isPrimary
                            ? "bg-rose-600 text-white hover:bg-rose-700 active:scale-95"
                            : "bg-slate-900 text-white hover:bg-slate-800 dark:bg-rose-600 dark:hover:bg-rose-700 active:scale-95"
                        } disabled:opacity-60`}
                      >
                        {isActivating ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Sparkles className="h-3.5 w-3.5" />
                        )}
                        <span>
                          {activeAdvisorPromotion
                            ? `Extend +${action.durationDays} Days (${action.creditAmount} Credits)`
                            : `Activate Spotlight (${action.creditAmount} Credits)`}
                        </span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Credit Wallet Modal for Adding Credits or Redeeming Coupons */}
        <CreditWalletModal
          isOpen={creditModalOpen}
          onClose={() => setCreditModalOpen(false)}
          userProfile={{ name: profile.name, email: profile.email }}
        />
      </div>
    </main>
  );
}
