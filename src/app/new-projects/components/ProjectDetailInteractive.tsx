"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Building2,
  Calendar,
  Check,
  CheckCircle2,
  Copy,
  Download,
  Eye,
  FileCheck2,
  Heart,
  HelpCircle,
  IndianRupee,
  Layers,
  Mail,
  MapPin,
  MessageSquare,
  Navigation,
  PhoneCall,
  Share2,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { CDN_ASSETS } from "@/config/cdn";
import type { ProjectConfiguration, ProjectListing } from "@/types/project.types";
import { useCreateProjectInquiryMutation } from "@/features/projects/api";
import { getStoredUserContact } from "@/lib/auth/storedUser";

function formatPrice(value?: number) {
  if (!value) return "Price on request";
  if (value >= 10000000) return `₹${(value / 10000000).toFixed(2)} Cr`;
  if (value >= 100000) return `₹${(value / 100000).toFixed(2)} L`;
  return `₹${value.toLocaleString("en-IN")}`;
}

const normalizeR2Url = (url?: string | null): string => {
  if (!url) return "";
  return url.replace(/^https:\/\/pub-47ad872a9b3848e190cdf10b7ad7a298\.r2\.dev\//i, "/r2-cdn/");
};

export function ProjectDetailInteractive({ project }: { project: ProjectListing }) {
  const [createInquiry, { isLoading: isSubmittingInquiry }] = useCreateProjectInquiryMutation();
  const [selectedBhkTab, setSelectedBhkTab] = useState<string>("ALL");
  const [inquiryModalOpen, setInquiryModalOpen] = useState(false);
  const [selectedConfigForInquiry, setSelectedConfigForInquiry] = useState<ProjectConfiguration | null>(null);

  // Inquiry Form State
  const [inquiryName, setInquiryName] = useState("");
  const [inquiryPhone, setInquiryPhone] = useState("");
  const [inquiryEmail, setInquiryEmail] = useState("");
  const [inquiryMessage, setInquiryMessage] = useState("");
  const [inquirySubmitted, setInquirySubmitted] = useState(false);
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);

  useEffect(() => {
    if (!inquiryModalOpen) return;
    const user = getStoredUserContact();
    if (user) {
      setInquiryName((current) => current || user.name);
      setInquiryPhone((current) => current || user.mobileNumber);
      setInquiryEmail((current) => current || user.email);
    }
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [inquiryModalOpen]);

  const cityName = typeof project.city === "string" ? project.city : (project.cityName || (project.city as any)?.name || "");
  const availableBhkTypes = Array.from(new Set((project.configurations || []).map((c) => c.bhkType)));

  const filteredConfigs = selectedBhkTab === "ALL"
    ? (project.configurations || [])
    : (project.configurations || []).filter((c) => c.bhkType === selectedBhkTab);

  function handleShare() {
    if (navigator.share) {
      navigator.share({
        title: `${project.name} by ${project.developerName}`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Project link copied to clipboard!");
    }
  }

  function handleOpenInquiry(cfg?: ProjectConfiguration) {
    setSelectedConfigForInquiry(cfg || null);
    setInquiryMessage(cfg ? `Inquiring about ${cfg.bhkType} (${cfg.carpetArea} sq.ft) in ${project.name}` : `Inquiring about ${project.name}`);
    setInquiryModalOpen(true);
  }

  async function handleInquirySubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!inquiryName.trim() || !inquiryPhone.trim()) {
      toast.error("Please enter your name and phone number");
      return;
    }
    try {
      await createInquiry({
        projectId: String(project.id),
        data: {
          name: inquiryName.trim(),
          phone: inquiryPhone.trim(),
          email: inquiryEmail.trim() || undefined,
          message: inquiryMessage.trim() || undefined,
          configurationId: selectedConfigForInquiry ? String(selectedConfigForInquiry.id) : undefined,
          source: "DETAIL_PAGE",
        },
      }).unwrap();
      setInquirySubmitted(true);
      toast.success("Inquiry sent to builder sales desk!");
    } catch {
      // Shared API handling displays the server error.
    }
  }

  return (
    <div className="space-y-8">
      {/* Hero Header & Gallery */}
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="grid gap-2 p-3 lg:grid-cols-12">
          {/* Main Large Image */}
          <div className="relative h-72 sm:h-96 lg:col-span-8 overflow-hidden rounded-2xl bg-slate-100 dark:bg-slate-800">
            <img
              src={normalizeR2Url(project.images?.[0] || CDN_ASSETS.placeholderWebp)}
              alt={project.name}
              className="h-full w-full object-cover"
              fetchPriority="high"
              decoding="async"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

            <div className="absolute top-4 left-4 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/95 backdrop-blur-md px-3 py-1 text-xs font-black text-emerald-700 shadow-sm">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                <span>RERA Verified: {project.reraId || "Registered"}</span>
              </span>
              <span className="rounded-full bg-slate-950/80 backdrop-blur-md px-3 py-1 text-xs font-bold text-white uppercase tracking-wider">
                {project.status?.replace(/_/g, " ") || "NEW LAUNCH"}
              </span>
            </div>

            <div className="absolute bottom-4 left-4 right-4 text-white">
              <div className="text-xs font-bold uppercase tracking-wider text-rose-300">
                By {project.developerName}
              </div>
              <h1 className="text-2xl sm:text-4xl font-black tracking-tight drop-shadow-sm">
                {project.name}
              </h1>
              <div className="mt-1 flex items-center gap-1.5 text-xs sm:text-sm text-slate-200">
                <MapPin className="h-3.5 w-3.5 shrink-0 text-rose-400" />
                <span>{project.siteAddress || [project.locality, cityName].filter(Boolean).join(", ")}</span>
              </div>
            </div>
          </div>

          {/* Secondary Gallery Tiles */}
          <div className="hidden lg:grid lg:col-span-4 grid-rows-2 gap-2">
            <div className="h-48 overflow-hidden rounded-2xl bg-slate-100 dark:bg-slate-800">
              <img
                src={normalizeR2Url(project.images?.[1] || project.images?.[0] || CDN_ASSETS.placeholderWebp)}
                alt="Project View 2"
                className="h-full w-full object-cover"
                loading="lazy"
                decoding="async"
              />
            </div>
            <div className="h-48 overflow-hidden rounded-2xl bg-slate-100 dark:bg-slate-800">
              <img
                src={normalizeR2Url(project.images?.[2] || project.images?.[0] || CDN_ASSETS.placeholderWebp)}
                alt="Project View 3"
                className="h-full w-full object-cover"
                loading="lazy"
                decoding="async"
              />
            </div>
          </div>
        </div>

        {/* Headline Price & Quick Actions Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-t border-slate-100 p-5 dark:border-slate-800">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Price Range
            </span>
            <div className="text-2xl sm:text-3xl font-black text-slate-950 dark:text-white">
              {formatPrice(project.priceMin)} – {formatPrice(project.priceMax)}
            </div>
            {project.pricePerSqFt && (
              <span className="text-xs font-semibold text-slate-500">
                Avg. ₹{project.pricePerSqFt.toLocaleString("en-IN")} / sq.ft
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              <Share2 className="h-3.5 w-3.5" />
              <span>Share</span>
            </button>

            {project.salesPhone && (
              <button
                type="button"
                onClick={() => setContactModalOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-full border border-rose-300 bg-rose-50 px-4 py-2 text-xs font-bold text-rose-800 shadow-sm transition hover:bg-rose-100 dark:border-rose-800 dark:bg-rose-950/60 dark:text-rose-300"
              >
                <PhoneCall className="h-3.5 w-3.5 text-rose-600" />
                <span>View Contact</span>
              </button>
            )}

            <button
              onClick={() => handleOpenInquiry()}
              className="inline-flex items-center gap-2 rounded-full bg-rose-600 px-5 py-2 text-xs font-bold text-white shadow-md shadow-rose-200 transition hover:bg-rose-700 active:scale-95 dark:shadow-none"
            >
              <PhoneCall className="h-3.5 w-3.5" />
              <span>Book Site Visit / Inquire</span>
            </button>
          </div>
        </div>
      </div>

      {/* Quick Specs Grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Total Land Area
          </div>
          <div className="mt-1 text-base font-black text-slate-900 dark:text-white">
            {project.totalLandArea || "Residential Community"}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Total Towers & Units
          </div>
          <div className="mt-1 text-base font-black text-slate-900 dark:text-white">
            {project.totalTowers ? `${project.totalTowers} Towers` : "Gated Society"} • {project.totalUnits ? `${project.totalUnits} Units` : "Multiple Floors"}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Possession Timeline
          </div>
          <div className="mt-1 text-base font-black text-slate-900 dark:text-white">
            {project.possessionDate}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Legal Authority
          </div>
          <div className="mt-1 text-base font-black text-emerald-600 dark:text-emerald-400">
            RERA Approved
          </div>
        </div>
      </div>

      {/* Configurations Matrix Section */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-bold text-xs uppercase tracking-wider">
              <Layers className="h-4 w-4" />
              <span>Unit Floor Plans</span>
            </div>
            <h2 className="mt-1 text-2xl font-black text-slate-950 dark:text-white">
              Configuration & Pricing Matrix
            </h2>
            <p className="text-xs text-slate-500">
              Browse available unit layouts, carpet area specifications, and price brackets.
            </p>
          </div>

          {/* BHK Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setSelectedBhkTab("ALL")}
              className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition shrink-0 ${
                selectedBhkTab === "ALL"
                  ? "bg-rose-600 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
              }`}
            >
              All Types ({project.configurations.length})
            </button>
            {availableBhkTypes.map((bhk) => (
              <button
                key={bhk}
                onClick={() => setSelectedBhkTab(bhk)}
                className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition shrink-0 ${
                  selectedBhkTab === bhk
                    ? "bg-rose-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
                }`}
              >
                {bhk}
              </button>
            ))}
          </div>
        </div>

        {/* Configurations Grid */}
        <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredConfigs.map((cfg) => (
            <div
              key={cfg.id}
              className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-slate-50/70 p-5 transition hover:border-rose-300 hover:bg-white hover:shadow-md dark:border-slate-800 dark:bg-slate-800/40 dark:hover:bg-slate-800"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="rounded-lg bg-rose-100 px-2 py-0.5 text-xs font-black text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                    {cfg.bhkType}
                  </span>
                  <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                    Available
                  </span>
                </div>

                <div className="mt-4 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Carpet Area:</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {cfg.carpetArea} sq.ft
                    </span>
                  </div>

                  {cfg.superBuiltUpArea && (
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">Super Built-up:</span>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {cfg.superBuiltUpArea} sq.ft
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Baths / Balconies:</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {cfg.bathrooms} Baths • {cfg.balconies || 1} Balconies
                    </span>
                  </div>
                </div>

                <div className="mt-5 border-t border-slate-200/80 pt-3 dark:border-slate-700">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Price Range
                  </span>
                  <div className="text-lg font-black text-slate-950 dark:text-white">
                    {formatPrice(cfg.priceMin)} {cfg.priceMax ? `– ${formatPrice(cfg.priceMax)}` : "Onwards"}
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleOpenInquiry(cfg)}
                className="mt-4 w-full rounded-xl bg-slate-900 py-2.5 text-center text-xs font-bold text-white transition hover:bg-rose-600 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-rose-600 dark:hover:text-white"
              >
                Inquire for {cfg.bhkType}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Society Amenities Section */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-bold text-xs uppercase tracking-wider">
          <Sparkles className="h-4 w-4" />
          <span>Lifestyle & Facilities</span>
        </div>
        <h2 className="mt-1 text-2xl font-black text-slate-950 dark:text-white">
          Society Amenities
        </h2>

        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {project.amenities.map((amenity, i) => (
            <div
              key={i}
              className="flex items-center gap-2.5 rounded-2xl border border-slate-100 bg-slate-50 p-3 text-xs font-bold text-slate-800 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-200"
            >
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
              <span>{amenity}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Location & Navigation Section */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-bold text-xs uppercase tracking-wider">
          <MapPin className="h-4 w-4" />
          <span>Neighborhood & Map</span>
        </div>
        <h2 className="mt-1 text-2xl font-black text-slate-950 dark:text-white">
          Location & Site Office
        </h2>

        <div className="mt-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-800/40">
          <div>
            <div className="text-sm font-bold text-slate-900 dark:text-white">
              {project.siteAddress || [project.locality, cityName].filter(Boolean).join(", ")}
            </div>
            {project.landmark && (
              <div className="mt-1 text-xs text-slate-500">
                Landmark: {project.landmark}
              </div>
            )}
            <div className="mt-1 text-xs text-slate-500">
              Site Office Timings: {project.siteVisitTimings || "10:00 AM – 6:30 PM (Daily)"}
            </div>
          </div>

          <a
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
              `${project.name} ${project.siteAddress || project.locality || ""} ${cityName}`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-5 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-slate-800 dark:bg-white dark:text-slate-900"
          >
            <Navigation className="h-3.5 w-3.5" />
            <span>Open in Google Maps</span>
          </a>
        </div>
      </div>

      {/* Inquiry Dialog Modal */}
      {inquiryModalOpen && (
        <div role="dialog" aria-modal="true" aria-label={`Inquire about ${project.name}`} className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-0 backdrop-blur-sm sm:items-center sm:p-4">
          <div className="relative flex max-h-[calc(100dvh-0.5rem)] w-full max-w-lg flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl dark:border dark:border-slate-800 dark:bg-slate-900 sm:max-h-[min(90dvh,720px)] sm:rounded-3xl">
            <button
              onClick={() => {
                setInquiryModalOpen(false);
                setInquirySubmitted(false);
              }}
              className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-slate-100/90 text-slate-500 shadow-sm hover:text-slate-800 dark:bg-slate-800 dark:text-slate-300 sm:right-4 sm:top-4"
            >
              <X className="h-5 w-5" />
            </button>

            {!inquirySubmitted ? (
              <form onSubmit={handleInquirySubmit} className="min-h-0 overflow-y-auto overscroll-contain px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-5 sm:px-8 sm:py-7">
                <div className="pr-10">
                  <div className="flex items-center gap-2 text-rose-600 font-bold text-xs uppercase tracking-wider">
                    <PhoneCall className="h-4 w-4" />
                    <span>Builder Sales Desk</span>
                  </div>
                  <h3 className="mt-1 text-xl font-black text-slate-950 dark:text-white">
                    Inquire about {project.name}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Get official floor plans, price sheet, and schedule a private site visit.
                  </p>
                </div>

                <div className="mt-4">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Your Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={inquiryName}
                    onChange={(e) => setInquiryName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-semibold focus:border-rose-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800"
                  />
                </div>

                <div className="mt-3">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Mobile Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={inquiryPhone}
                    onChange={(e) => setInquiryPhone(e.target.value)}
                    placeholder="+91-XXXXXXXXXX"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-semibold focus:border-rose-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800"
                  />
                </div>

                <div className="mt-3">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Email Address (Optional)
                  </label>
                  <input
                    type="email"
                    value={inquiryEmail}
                    onChange={(e) => setInquiryEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-semibold focus:border-rose-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800"
                  />
                </div>

                <div className="mt-3">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Requirement Notes
                  </label>
                  <textarea
                    rows={3}
                    value={inquiryMessage}
                    onChange={(e) => setInquiryMessage(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-semibold focus:border-rose-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingInquiry}
                  className="sticky bottom-0 mt-4 w-full rounded-xl bg-rose-600 py-3 text-xs font-bold text-white shadow-lg shadow-rose-200 transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60 dark:shadow-none"
                >
                  {isSubmittingInquiry ? "Sending…" : "Send Inquiry to Builder"}
                </button>
              </form>
            ) : (
              <div className="overflow-y-auto px-5 py-10 text-center space-y-3 sm:p-8">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  Inquiry Received!
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Thank you, {inquiryName}. The project sales team for <strong>{project.name}</strong> has received your details and will contact you shortly at {inquiryPhone}.
                </p>
                <button
                  onClick={() => {
                    setInquiryModalOpen(false);
                    setInquirySubmitted(false);
                  }}
                  className="mt-4 rounded-full bg-slate-900 px-6 py-2 text-xs font-bold text-white dark:bg-white dark:text-slate-900"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* View Contact Dialog Modal */}
      {contactModalOpen && (
        <div role="dialog" aria-modal="true" aria-label={`Contact details for ${project.name}`} className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-0 backdrop-blur-sm sm:items-center sm:p-4">
          <div className="relative flex max-h-[calc(100dvh-0.5rem)] w-full max-w-md flex-col overflow-hidden rounded-t-3xl bg-white p-6 shadow-2xl dark:border dark:border-slate-800 dark:bg-slate-900 sm:rounded-3xl">
            <button
              onClick={() => setContactModalOpen(false)}
              className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500 shadow-sm hover:text-slate-800 dark:bg-slate-800 dark:text-slate-300"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-2 text-rose-600 font-bold text-xs uppercase tracking-wider">
              <PhoneCall className="h-4 w-4" />
              <span>Direct Sales Contact</span>
            </div>

            <h3 className="mt-1.5 text-xl font-black text-slate-950 dark:text-white">
              {project.name}
            </h3>
            <p className="text-xs font-semibold text-rose-600 dark:text-rose-400">
              By {project.developerName}
            </p>

            <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/60">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Official Sales Phone
              </span>
              <div className="mt-1 flex items-center justify-between">
                <span className="text-lg font-black text-slate-950 dark:text-white">
                  +91 {(project.salesPhone || "8848510629").replace(/^\+?91\s*[-]?\s*/, "")}
                </span>
                <button
                  onClick={() => {
                    const raw = (project.salesPhone || "8848510629").replace(/^\+?91\s*[-]?\s*/, "");
                    navigator.clipboard.writeText(`+91-${raw}`);
                    setCopiedPhone(true);
                    toast.success("Phone number copied!");
                    setTimeout(() => setCopiedPhone(false), 2000);
                  }}
                  className="rounded-lg bg-white px-2.5 py-1 text-xs font-bold text-slate-700 shadow-sm border border-slate-200 transition hover:bg-slate-50 dark:bg-slate-700 dark:text-slate-200 dark:border-slate-600"
                >
                  {copiedPhone ? "Copied!" : "Copy"}
                </button>
              </div>
              <a
                href={`tel:+91${(project.salesPhone || "").replace(/\D/g, "")}`}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-rose-600 py-2.5 text-xs font-bold text-white shadow-md shadow-rose-200 transition hover:bg-rose-700 active:scale-95 dark:shadow-none"
              >
                <PhoneCall className="h-4 w-4" />
                <span>Call Sales Desk Now</span>
              </a>
            </div>

            {project.salesEmail && (
              <div className="mt-3 rounded-2xl border border-slate-100 bg-slate-50 p-3 text-xs dark:border-slate-800 dark:bg-slate-800/40">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Sales Email
                </span>
                <div className="mt-0.5 font-bold text-slate-800 dark:text-slate-200">
                  <a href={`mailto:${project.salesEmail}`} className="hover:underline">
                    {project.salesEmail}
                  </a>
                </div>
              </div>
            )}

            <div className="mt-3 space-y-1 text-xs text-slate-500">
              <p>📍 {project.siteAddress || [project.locality, cityName].filter(Boolean).join(", ")}</p>
              {project.siteVisitTimings && (
                <p>⏰ Office Timings: {project.siteVisitTimings}</p>
              )}
            </div>

            <button
              onClick={() => {
                setContactModalOpen(false);
                handleOpenInquiry();
              }}
              className="mt-4 w-full rounded-xl border border-slate-200 py-2.5 text-xs font-bold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Or Leave Callback Request / Site Visit
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
