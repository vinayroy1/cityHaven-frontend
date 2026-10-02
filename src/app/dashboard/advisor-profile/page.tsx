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
  HelpCircle,
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
  Zap,
} from "lucide-react";
import { HeaderNav } from "@/app/homePage/components/HeaderNav";
import { PageHeader } from "../components/PageHeader";
import {
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
  const [profile, setProfile] = useState<AgentProfileData | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [newLocality, setNewLocality] = useState("");
  const [isUploading, setIsUploading] = useState(false);

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

  if (!profile) return null;

  const handleFieldChange = (field: keyof AgentProfileData, val: any) => {
    setProfile((prev) => (prev ? { ...prev, [field]: val } : null));
  };

  const handleSave = () => {
    if (!profile) return;
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
    if (!profile) return;
    const updated = updateAgentSubscription(profile.id, tier);
    setProfile(updated);
    if (tier === "FREE_VERIFIED") {
      showToast("Subscription set to Free Verified Directory Listing.");
    } else if (tier === "CITY_SPOTLIGHT") {
      showToast("Activated City Spotlight! You are now featured on the Homepage.");
    } else {
      showToast("Upgraded to Pro Advisor! #1 Homepage placement & Priority leads active.");
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
    <main className="min-h-screen bg-gradient-to-b from-rose-50/50 via-white to-amber-50/40 text-slate-900 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 dark:text-slate-100 transition-colors duration-150">
      <HeaderNav />

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-2xl border border-slate-800 bg-slate-950/95 px-5 py-3 text-xs font-semibold text-white shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-bottom-3 duration-200">
          <Sparkles className="h-4 w-4 text-amber-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-3.5 py-6 sm:px-6 sm:py-8 overflow-hidden sm:overflow-visible">
        <PageHeader
          tag="Advisor Verification Program"
          title="Advisor Profile & RERA Compliance"
          subtitle="Manage your certified advisor profile, RERA registration, operating zones, and public walkthrough services."
          backHref="/dashboard"
          actions={
            <div className="flex flex-wrap items-center gap-2">
              <Link
                href={`/agents/${profile.id}`}
                target="_blank"
                className="inline-flex items-center gap-1.5 rounded-full border border-slate-300 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 shadow-xs transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              >
                <span>View Live Profile</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
              <button
                type="button"
                onClick={handleSave}
                className="inline-flex items-center gap-1.5 rounded-full bg-rose-600 px-4 py-1.5 text-xs font-bold text-white shadow-xs transition hover:bg-rose-700"
              >
                <Save className="h-3.5 w-3.5" />
                <span>Save Draft</span>
              </button>
            </div>
          }
        />

        {/* Verification Status Banner */}
        <div
          className={`rounded-3xl border p-4 sm:p-5 shadow-sm transition-all w-full max-w-full ${
            profile.status === "VERIFIED"
              ? "border-emerald-200 bg-emerald-50/80 dark:border-emerald-900/60 dark:bg-emerald-950/30"
              : profile.status === "PENDING_VERIFICATION"
              ? "border-amber-200 bg-amber-50/80 dark:border-amber-900/60 dark:bg-amber-950/30"
              : profile.status === "REJECTED"
              ? "border-rose-200 bg-rose-50/80 dark:border-rose-900/60 dark:bg-rose-950/30"
              : "border-slate-200 bg-slate-50/80 dark:border-slate-800 dark:bg-slate-900/40"
          }`}
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3 sm:gap-3.5 min-w-0 flex-1">
              <span
                className={`mt-0.5 flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-2xl shadow-inner ${
                  profile.status === "VERIFIED"
                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/80 dark:text-emerald-300"
                    : profile.status === "PENDING_VERIFICATION"
                    ? "bg-amber-100 text-amber-700 dark:bg-amber-900/80 dark:text-amber-300"
                    : profile.status === "REJECTED"
                    ? "bg-rose-100 text-rose-700 dark:bg-rose-900/80 dark:text-rose-300"
                    : "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                }`}
              >
                {profile.status === "VERIFIED" && <ShieldCheck className="h-5 w-5 sm:h-6 sm:w-6" />}
                {profile.status === "PENDING_VERIFICATION" && <Clock className="h-5 w-5 sm:h-6 sm:w-6" />}
                {profile.status === "REJECTED" && <ShieldAlert className="h-5 w-5 sm:h-6 sm:w-6" />}
                {profile.status === "DRAFT" && <FileCheck2 className="h-5 w-5 sm:h-6 sm:w-6" />}
              </span>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-950 dark:text-white break-words">
                    {profile.status === "VERIFIED" && "Government RERA Verified & Awasio Certified Advisor"}
                    {profile.status === "PENDING_VERIFICATION" && "RERA Verification in Progress (Review SLA: < 24 Hours)"}
                    {profile.status === "REJECTED" && "Compliance Verification Needs Attention"}
                    {profile.status === "DRAFT" && "Profile Incomplete - Submit RERA Details to Go Live"}
                  </h3>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider shrink-0 ${
                      profile.status === "VERIFIED"
                        ? "bg-emerald-600 text-white"
                        : profile.status === "PENDING_VERIFICATION"
                        ? "bg-amber-500 text-white"
                        : profile.status === "REJECTED"
                        ? "bg-rose-600 text-white"
                        : "bg-slate-600 text-white"
                    }`}
                  >
                    {profile.status.replace("_", " ")}
                  </span>
                </div>

                <p className="mt-1 text-xs text-slate-600 dark:text-slate-400 break-words">
                  {profile.status === "VERIFIED" &&
                    `Your profile is live on the public /agents directory and homepage. Visitors can book private site visits directly to your CRM leads.`}
                  {profile.status === "PENDING_VERIFICATION" &&
                    `Our compliance desk is currently validating your RERA Registration number (${profile.reraId}) against the state registry. You will receive an SMS and email notification upon approval.`}
                  {profile.status === "REJECTED" &&
                    (profile.rejectionReason || "Please review your RERA license number and ensure the uploaded PDF matches your full name.")}
                  {profile.status === "DRAFT" &&
                    "Provide your RERA credentials and operating areas below to receive verified visitor leads and direct walkthrough bookings."}
                </p>
              </div>
            </div>

            {profile.status !== "VERIFIED" && (
              <button
                type="button"
                onClick={handleSubmitVerification}
                className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-full bg-slate-900 px-5 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-slate-800 dark:bg-rose-600 dark:hover:bg-rose-700"
              >
                <Send className="h-3.5 w-3.5" />
                <span>Submit for Verification</span>
              </button>
            )}
          </div>
        </div>

        {/* Tier & Homepage Spotlight Placement Section */}
        <div className="rounded-3xl border border-slate-200/90 bg-white/90 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/90 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-4 dark:border-slate-800">
            <div className="min-w-0 flex-1">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                <Crown className="h-3.5 w-3.5" />
                <span>Placement & Visibility Tiers</span>
              </div>
              <h2 className="mt-1 text-base font-bold text-slate-950 dark:text-white break-words">
                Homepage Featured Carousel & Lead Monetization
              </h2>
              <p className="mt-0.5 text-xs text-slate-500 break-words">
                Free verified listing includes directory search. Upgrade to City Spotlight or Pro Advisor to be featured on the homepage carousel.
              </p>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
              <span className="text-xs font-semibold text-slate-500">Current Plan:</span>
              <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-bold text-white dark:bg-rose-600">
                {profile.subscriptionTier === "PRO_ADVISOR"
                  ? "👑 Pro Advisor"
                  : profile.subscriptionTier === "CITY_SPOTLIGHT"
                  ? "⭐ City Spotlight"
                  : "Free Verified"}
              </span>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3 pt-2">
            {/* Tier 1: Free Verified */}
            <div
              className={`rounded-2xl border p-5 flex flex-col justify-between transition ${
                profile.subscriptionTier === "FREE_VERIFIED"
                  ? "border-slate-900 bg-slate-50/80 ring-2 ring-slate-900/10 dark:border-slate-100 dark:bg-slate-800/80"
                  : "border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900"
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Free Tier</span>
                  <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                    Standard
                  </span>
                </div>
                <h3 className="mt-2 text-lg font-extrabold text-slate-950 dark:text-white">Directory Only</h3>
                <p className="mt-0.5 text-2xl font-black text-slate-900 dark:text-white">₹0</p>
                <p className="text-[11px] text-slate-400">Free forever for RERA-registered agents</p>

                <ul className="mt-4 space-y-2 text-xs text-slate-600 dark:text-slate-300">
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
                  <li className="flex items-center gap-2 text-slate-400 line-through">
                    <X className="h-3.5 w-3.5 text-slate-300 shrink-0" />
                    <span>Top-Pinned Directory Ranking</span>
                  </li>
                </ul>
              </div>

              <button
                type="button"
                onClick={() => handleSelectTier("FREE_VERIFIED")}
                className={`mt-6 w-full rounded-xl py-2 text-xs font-bold transition ${
                  profile.subscriptionTier === "FREE_VERIFIED"
                    ? "bg-slate-200 text-slate-700 cursor-default dark:bg-slate-800 dark:text-slate-300"
                    : "border border-slate-300 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300"
                }`}
              >
                {profile.subscriptionTier === "FREE_VERIFIED" ? "Current Plan" : "Switch to Free"}
              </button>
            </div>

            {/* Tier 2: City Spotlight */}
            <div
              className={`rounded-2xl border p-5 flex flex-col justify-between relative transition ${
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
                  <span className="rounded-full bg-rose-100 px-2.5 py-0.5 text-[10px] font-bold text-rose-700 dark:bg-rose-900/60 dark:text-rose-300">
                    Popular
                  </span>
                </div>
                <h3 className="mt-2 text-lg font-extrabold text-slate-950 dark:text-white">Homepage Feature</h3>
                <p className="mt-0.5 text-2xl font-black text-rose-600 dark:text-rose-400">₹4,999<span className="text-xs font-normal text-slate-500">/mo</span></p>
                <p className="text-[11px] text-slate-400">Billed monthly or quarterly</p>

                <ul className="mt-4 space-y-2 text-xs text-slate-700 dark:text-slate-200 font-medium">
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
                    <span>Direct Visitor Site Visits to CRM</span>
                  </li>
                  <li className="flex items-center gap-2 text-slate-400 line-through">
                    <X className="h-3.5 w-3.5 text-slate-300 shrink-0" />
                    <span>Multi-City Cross Promotion</span>
                  </li>
                </ul>
              </div>

              <button
                type="button"
                onClick={() => handleSelectTier("CITY_SPOTLIGHT")}
                className={`mt-6 w-full rounded-xl py-2 text-xs font-bold transition shadow-xs ${
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
              className={`rounded-2xl border p-5 flex flex-col justify-between relative transition ${
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
                  <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-bold text-amber-800 dark:bg-amber-900/60 dark:text-amber-300">
                    Maximum Leads
                  </span>
                </div>
                <h3 className="mt-2 text-lg font-extrabold text-slate-950 dark:text-white">Elite Showcase</h3>
                <p className="mt-0.5 text-2xl font-black text-amber-600 dark:text-amber-400">₹9,999<span className="text-xs font-normal text-slate-500">/mo</span></p>
                <p className="text-[11px] text-slate-400">Includes all VIP partner perks</p>

                <ul className="mt-4 space-y-2 text-xs text-slate-700 dark:text-slate-200 font-medium">
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
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                    <span>Dedicated Awasio Account Manager</span>
                  </li>
                </ul>
              </div>

              <button
                type="button"
                onClick={() => handleSelectTier("PRO_ADVISOR")}
                className={`mt-6 w-full rounded-xl py-2 text-xs font-bold transition shadow-xs ${
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

        {/* Form Body */}
        <form onSubmit={handleSubmitVerification} className="space-y-6">
          {/* Section 1: Professional & Agency Details */}
          <div className="rounded-3xl border border-slate-200/90 bg-white/90 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/90">
            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-4 dark:border-slate-800">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400">
                <User className="h-4 w-4" />
              </span>
              <div>
                <h2 className="text-sm font-bold text-slate-950 dark:text-white">1. Identity & Brokerage Firm</h2>
                <p className="text-xs text-slate-500">Your public identity displayed to property buyers and investors.</p>
              </div>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Full Name *</label>
                <input
                  type="text"
                  required
                  value={profile.name}
                  onChange={(e) => handleFieldChange("name", e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-900 focus:border-rose-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  placeholder="e.g. Aarav Kapoor"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Designation / Role *</label>
                <input
                  type="text"
                  required
                  value={profile.role}
                  onChange={(e) => handleFieldChange("role", e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-900 focus:border-rose-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  placeholder="e.g. Senior Property Advisor"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Agency / Brokerage Firm *</label>
                <div className="relative mt-1.5">
                  <Building2 className="absolute left-3.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={profile.agency}
                    onChange={(e) => handleFieldChange("agency", e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3.5 py-2 text-xs text-slate-900 focus:border-rose-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    placeholder="e.g. Urban Nest Realty"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Direct Phone (Site Visit WhatsApp) *</label>
                <div className="relative mt-1.5">
                  <Phone className="absolute left-3.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="tel"
                    required
                    value={profile.phone}
                    onChange={(e) => handleFieldChange("phone", e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3.5 py-2 text-xs text-slate-900 focus:border-rose-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    placeholder="+91 98101 24590"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Profile Headshot Photo</label>
                <div className="mt-2 flex items-center gap-4">
                  <img
                    src={profile.avatar}
                    alt={profile.name}
                    className="h-16 w-16 rounded-full object-cover ring-2 ring-rose-200 dark:ring-slate-700 shadow-sm"
                  />
                  <div className="flex-1 space-y-1.5">
                    <input
                      type="url"
                      value={profile.avatar}
                      onChange={(e) => handleFieldChange("avatar", e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-xs text-slate-900 focus:border-rose-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      placeholder="Image URL or pick sample below"
                    />
                    <div className="flex flex-wrap gap-2 text-[11px] text-slate-500">
                      <span>Quick avatars:</span>
                      {SAMPLE_AVATARS.map((s, idx) => (
                        <button
                          key={s.label}
                          type="button"
                          onClick={() => handleFieldChange("avatar", s.url)}
                          className="rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 hover:border-rose-300 dark:border-slate-700 dark:bg-slate-800"
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

          {/* Section 2: RERA Legal Compliance & Document Upload */}
          <div className="rounded-3xl border border-slate-200/90 bg-white/90 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/90">
            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-4 dark:border-slate-800">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
                <ShieldCheck className="h-4 w-4" />
              </span>
              <div>
                <h2 className="text-sm font-bold text-slate-950 dark:text-white">2. Government RERA Legal Compliance</h2>
                <p className="text-xs text-slate-500">Mandatory under Real Estate (Regulation and Development) Act for certified advisory.</p>
              </div>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">RERA Registration Authority State *</label>
                <select
                  value={profile.reraState || profile.city}
                  onChange={(e) => handleFieldChange("reraState", e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-900 focus:border-rose-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  {INDIAN_STATES.map((st) => (
                    <option key={st} value={st}>
                      {st} RERA
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  RERA Agent Registration Number *
                </label>
                <div className="relative mt-1.5">
                  <IdCard className="absolute left-3.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={profile.reraId}
                    onChange={(e) => handleFieldChange("reraId", e.target.value.toUpperCase())}
                    className="w-full uppercase tracking-wider rounded-xl border border-slate-200 bg-white pl-9 pr-3.5 py-2 text-xs font-semibold text-slate-900 focus:border-rose-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    placeholder="e.g. DLRERA2021A0042"
                  />
                </div>
                <p className="mt-1 text-[11px] text-slate-400">
                  Must match the license number on your state RERA certificate.
                </p>
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Upload RERA Certificate Document (PDF / JPG)
                </label>
                <div className="mt-2 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/70 p-6 text-center transition hover:border-rose-300 dark:border-slate-700 dark:bg-slate-800/40">
                  {profile.reraDocumentName ? (
                    <div className="flex items-center gap-3 rounded-xl bg-white p-3 shadow-xs dark:bg-slate-800">
                      <FileText className="h-6 w-6 text-emerald-600" />
                      <div className="text-left">
                        <p className="text-xs font-bold text-slate-900 dark:text-white">{profile.reraDocumentName}</p>
                        <p className="text-[10px] text-emerald-600 font-medium flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" /> Document attached & ready for audit
                        </p>
                      </div>
                      <label className="ml-3 cursor-pointer text-xs font-semibold text-rose-600 hover:underline">
                        Replace
                        <input type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={handleMockUpload} />
                      </label>
                    </div>
                  ) : (
                    <label className="cursor-pointer">
                      <Upload className="mx-auto h-8 w-8 text-slate-400" />
                      <p className="mt-2 text-xs font-bold text-slate-800 dark:text-slate-200">
                        {isUploading ? "Uploading certificate..." : "Click to select or drag and drop RERA Certificate"}
                      </p>
                      <p className="mt-1 text-[11px] text-slate-400">PDF, JPG, PNG up to 10MB</p>
                      <input type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={handleMockUpload} />
                    </label>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Operating Zones, Experience & Languages */}
          <div className="rounded-3xl border border-slate-200/90 bg-white/90 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/90">
            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-4 dark:border-slate-800">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400">
                <MapPin className="h-4 w-4" />
              </span>
              <div>
                <h2 className="text-sm font-bold text-slate-950 dark:text-white">3. Operating Territory & Specialization</h2>
                <p className="text-xs text-slate-500">Specify the neighborhoods and property segments where you conduct in-person tours.</p>
              </div>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Primary City *</label>
                <select
                  value={profile.city}
                  onChange={(e) => handleFieldChange("city", e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-900 focus:border-rose-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  {CITIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Years of Real Estate Experience *</label>
                <div className="mt-1.5 flex items-center gap-3">
                  <input
                    type="range"
                    min={1}
                    max={25}
                    value={profile.experienceYears}
                    onChange={(e) => handleFieldChange("experienceYears", parseInt(e.target.value))}
                    className="flex-1 accent-rose-600"
                  />
                  <span className="min-w-[70px] rounded-lg bg-rose-50 px-2 py-1 text-center text-xs font-bold text-rose-700 dark:bg-rose-950/50 dark:text-rose-300">
                    {profile.experienceYears}+ years
                  </span>
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Key Localities / Operating Neighborhoods
                </label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {localitiesList.map((loc) => (
                    <span
                      key={loc}
                      className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-800 dark:bg-slate-800 dark:text-slate-200"
                    >
                      <MapPin className="h-3 w-3 text-rose-500" />
                      <span>{loc}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveArea(loc)}
                        className="rounded-full hover:text-rose-600"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>

                <div className="mt-2 flex gap-2">
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
                    placeholder="Add neighborhood (e.g. Vasant Kunj, Golf Course Rd)"
                    className="flex-1 rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-xs text-slate-900 focus:border-rose-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={handleAddLocality}
                    className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                  >
                    Add
                  </button>
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Languages Spoken</label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {ALL_LANGUAGES.map((lang) => {
                    const isSelected = (profile.languages || []).includes(lang);
                    return (
                      <button
                        key={lang}
                        type="button"
                        onClick={() => toggleLanguage(lang)}
                        className={`rounded-full px-3 py-1 text-xs font-medium transition ${
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
          <div className="rounded-3xl border border-slate-200/90 bg-white/90 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/90">
            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-4 dark:border-slate-800">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-sky-50 text-sky-600 dark:bg-sky-950/60 dark:text-sky-400">
                <Globe2 className="h-4 w-4" />
              </span>
              <div>
                <h2 className="text-sm font-bold text-slate-950 dark:text-white">4. Services & About You</h2>
                <p className="text-xs text-slate-500">Highlight the on-ground services you provide to buyers during site visits.</p>
              </div>
            </div>

            <div className="mt-5 space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Select Services Offered</label>
                <div className="mt-2 grid gap-2.5 sm:grid-cols-2">
                  {AVAILABLE_SERVICES.map((srv) => {
                    const active = (profile.services || []).includes(srv);
                    return (
                      <label
                        key={srv}
                        onClick={() => toggleService(srv)}
                        className={`flex cursor-pointer items-center gap-2.5 rounded-xl border p-3 text-xs font-medium transition ${
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
                        <span>{srv}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Professional Bio / About *
                </label>
                <textarea
                  rows={4}
                  required
                  value={profile.bio}
                  onChange={(e) => handleFieldChange("bio", e.target.value)}
                  className="mt-1.5 w-full rounded-2xl border border-slate-200 bg-white p-3.5 text-xs leading-relaxed text-slate-900 focus:border-rose-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  placeholder="Describe your background, deals handled, and in-person walkthrough assistance..."
                />
              </div>
            </div>
          </div>

          {/* Form Submit Footer */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-3xl border border-slate-200 bg-white/90 p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Dashboard</span>
            </Link>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleSave}
                className="rounded-full border border-slate-200 bg-white px-5 py-2.5 text-xs font-bold text-slate-700 shadow-xs transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              >
                Save Draft
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-full bg-rose-600 px-6 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-rose-700"
              >
                <Send className="h-3.5 w-3.5" />
                <span>Submit for RERA Verification</span>
              </button>
            </div>
          </div>
        </form>

        {/* Admin Simulation & Testing Toolbar */}
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/60">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-400">
              <BadgeCheck className="h-4 w-4 text-rose-500" />
              <span>Admin / Compliance Audit Simulation:</span>
              <span className="font-normal text-slate-500">
                (Simulate how the ops team verifies state RERA credentials)
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Status:</span>
              <button
                type="button"
                onClick={handleSimulateApproval}
                className="rounded-lg bg-emerald-600 px-2.5 py-1 text-[11px] font-bold text-white transition hover:bg-emerald-700 shadow-xs"
              >
                ✓ Verify
              </button>
              <button
                type="button"
                onClick={handleSimulateReject}
                className="rounded-lg bg-rose-600 px-2.5 py-1 text-[11px] font-bold text-white transition hover:bg-rose-700 shadow-xs"
              >
                ✕ Reject
              </button>
              <button
                type="button"
                onClick={handleSimulateReset}
                className="rounded-lg border border-slate-300 bg-white px-2 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
              >
                Draft
              </button>

              <span className="text-[10px] font-bold text-slate-400 uppercase ml-2">Tier:</span>
              <button
                type="button"
                onClick={() => handleSelectTier("FREE_VERIFIED")}
                className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold transition ${
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
                className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition ${
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
                className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition ${
                  profile.subscriptionTier === "PRO_ADVISOR"
                    ? "bg-amber-600 text-white shadow-xs"
                    : "border border-amber-300 bg-white text-amber-800 hover:bg-amber-50 dark:border-amber-800 dark:bg-slate-800 dark:text-amber-400"
                }`}
              >
                Pro
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
