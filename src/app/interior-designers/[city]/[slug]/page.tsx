"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Building2,
  User,
  ShieldCheck,
  Star,
  MapPin,
  Clock,
  Award,
  Layers,
  Sparkles,
  Phone,
  Mail,
  CheckCircle2,
  Calendar,
  Camera,
} from "lucide-react";
import { useGetInteriorProfileDetailQuery } from "@/features/interiors/api";
import { InteriorInquiryModal } from "../../components/InteriorInquiryModal";

export default function InteriorProfileDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const [isInquiryOpen, setIsInquiryOpen] = useState(false);
  const [activePhotoTab, setActivePhotoTab] = useState<string>("ALL");

  const { data: profile, isLoading, error } = useGetInteriorProfileDetailQuery(slug, {
    skip: !slug,
  });

  if (isLoading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-16 text-center">
        <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-rose-600 border-t-transparent" />
        <p className="mt-4 text-sm text-slate-500">Loading designer profile & portfolio...</p>
      </div>
    );
  }

  if (!profile || error) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Designer Profile Not Found</h2>
        <p className="mt-2 text-sm text-slate-500">
          The interior designer or studio you are looking for is either unpublished or does not exist.
        </p>
        <Link
          href="/interior-designers"
          className="mt-6 inline-flex rounded-xl bg-rose-600 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-rose-700"
        >
          Back to Interior Directory
        </Link>
      </div>
    );
  }

  const isCompany = profile.providerType === "COMPANY";

  return (
    <div className="min-h-screen bg-slate-50/50 pb-16 dark:bg-slate-950">
      {/* 1. Header Banner & Profile Strip (In PRD Section 13 sequence) */}
      <div className="relative border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        {/* Cover Banner */}
        <div className="h-48 sm:h-64 w-full bg-slate-200 dark:bg-slate-800 overflow-hidden relative">
          {profile.coverBanner ? (
            <img src={profile.coverBanner} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="h-full w-full bg-gradient-to-r from-slate-900 via-rose-950 to-slate-900" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
        </div>

        {/* Profile Card Header */}
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="relative -mt-16 sm:-mt-20 flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6">
            <div className="flex items-end gap-4">
              <div className="h-24 w-24 sm:h-28 sm:w-28 rounded-2xl border-4 border-white bg-white shadow-xl dark:border-slate-900 dark:bg-slate-800 overflow-hidden shrink-0">
                {profile.logo ? (
                  <img src={profile.logo} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-slate-100 text-slate-400 dark:bg-slate-800">
                    {isCompany ? <Building2 className="h-10 w-10" /> : <User className="h-10 w-10" />}
                  </div>
                )}
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                      isCompany
                        ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-400"
                        : "bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400"
                    }`}
                  >
                    {isCompany ? <Building2 className="h-3 w-3" /> : <User className="h-3 w-3" />}
                    {isCompany ? "Interior Design Firm" : "Independent Architect"}
                  </span>

                  {profile.isVerified && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400">
                      <ShieldCheck className="h-3 w-3" />
                      Verified Pro
                    </span>
                  )}
                </div>

                <h1 className="mt-1 text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                  {profile.businessName}
                </h1>
                {profile.tagline && (
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">{profile.tagline}</p>
                )}

                <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-rose-500" />
                    {profile.primaryLocality ? `${profile.primaryLocality}, ` : ""}
                    {profile.primaryCity}
                  </span>
                  <span>•</span>
                  <span>{profile.experienceYears} Years Experience</span>
                  <span>•</span>
                  <span className="flex items-center gap-1 font-bold text-amber-500">
                    <Star className="h-3.5 w-3.5 fill-current" />
                    {Number(profile.rating || 4.9).toFixed(1)} ({profile.reviewCount || 12} reviews)
                  </span>
                </div>
              </div>
            </div>

            {/* Sticky/Primary CTA Button */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setIsInquiryOpen(true)}
                className="rounded-xl bg-rose-600 px-6 py-2.5 text-xs font-bold text-white shadow-md transition hover:bg-rose-700 active:scale-98 dark:bg-rose-600 dark:hover:bg-rose-500"
              >
                Get Free Estimate & Quote
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Detail Sequence Content */}
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Left Column: Deep Information & Portfolio (2 cols) */}
        <div className="lg:col-span-2 space-y-8">
          {/* Section 1: About Company / Designer */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">About the Studio</h2>
            <div className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300 whitespace-pre-line">
              {profile.about}
            </div>

            {/* Specializations & Categories */}
            {profile.specializations?.length > 0 && (
              <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Specializations</span>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {profile.specializations.map((spec, i) => (
                    <span
                      key={i}
                      className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                    >
                      {spec}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* Section 2: Material & Quality Matrix */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-rose-600" />
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Material & Craftsmanship Standards</h2>
            </div>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Transparent specifications of substrates, finishes, and branded hardware partners used for woodwork.
            </p>

            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3.5 dark:border-slate-800 dark:bg-slate-800/40">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Core Boards & Ply</span>
                <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">
                  {profile.boardMaterials?.join(", ") || "BWP Marine Ply (IS 710)"}
                </p>
                <span className="text-xs text-slate-500">Brands: {profile.boardBrands?.join(", ") || "CenturyPly, Greenply"}</span>
              </div>

              <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3.5 dark:border-slate-800 dark:bg-slate-800/40">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Hardware & Fittings</span>
                <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">
                  {profile.hardwareFittings?.join(", ") || "Soft-close Hinges & Tandem Boxes"}
                </p>
                <span className="text-xs text-slate-500">Brands: {profile.hardwareBrands?.join(", ") || "Hettich, Hafele, Blum"}</span>
              </div>

              <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3.5 dark:border-slate-800 dark:bg-slate-800/40">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Surface Finishes</span>
                <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">
                  {profile.surfaceFinishes?.join(", ") || "1mm Anti-fingerprint Laminate & Acrylic"}
                </p>
              </div>

              <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3.5 dark:border-slate-800 dark:bg-slate-800/40">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Warranty Protection</span>
                <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">
                  {profile.woodworkWarrantyYears || 10} Yrs Woodwork · {profile.hardwareWarrantyYears || 10} Yrs Hardware
                </p>
              </div>
            </div>
          </section>

          {/* Section 3: Material-Based Pricing Packages (Essential, Premium, Luxury) */}
          {profile.packages && profile.packages.length > 0 && (
            <section className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-7 shadow-xs dark:border-slate-800 dark:bg-slate-900">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <h2 className="text-lg font-black text-slate-900 dark:text-white">
                    {profile.businessName} – Pricing Packages
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Choose from standard turnkey packages with transparent material and hardware commitments.
                  </p>
                </div>
                <span className="self-start sm:self-auto rounded-full bg-rose-50 px-3 py-1 text-xs font-bold text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">
                  {profile.packages.length} {profile.packages.length === 1 ? "Package" : "Packages"} Available
                </span>
              </div>

              <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-3">
                {profile.packages.map((pkg) => {
                  const isEssential = pkg.packageName?.toLowerCase().includes("essential");
                  const isLuxury = pkg.packageName?.toLowerCase().includes("lux");
                  const isPremium = !isEssential && !isLuxury;

                  return (
                    <div
                      key={pkg.id}
                      className={`relative flex flex-col justify-between rounded-3xl border p-5 sm:p-6 transition-all duration-200 hover:shadow-lg ${
                        isPremium
                          ? "border-rose-400 bg-gradient-to-b from-rose-50/50 to-white shadow-sm ring-2 ring-rose-500/20 dark:border-rose-800 dark:from-rose-950/20 dark:to-slate-900"
                          : "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
                      }`}
                    >
                      {isPremium && (
                        <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-rose-600 px-3 py-0.5 text-[10px] font-black uppercase tracking-wider text-white shadow-xs">
                          Most Popular
                        </span>
                      )}

                      <div>
                        <div className="flex items-center justify-between">
                          <h3 className="text-base font-black text-slate-900 dark:text-white">
                            {pkg.packageName}
                          </h3>
                          <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                            {pkg.packageCategory || "Turnkey"}
                          </span>
                        </div>

                        {/* Price headline: e.g. ₹1,400 /sq.ft. or ₹1,900 /sq.ft. */}
                        <div className="mt-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                          <div className="flex items-baseline gap-1">
                            <span className="text-3xl font-black text-slate-950 dark:text-white tracking-tight">
                              ₹{pkg.priceMin?.toLocaleString("en-IN")}
                            </span>
                            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                              {pkg.pricingUnit === "PER_SQFT" ? "/sq.ft." : "fixed package"}
                            </span>
                          </div>
                          {pkg.priceMax && (
                            <p className="text-[11px] text-slate-400 mt-0.5">
                              Up to ₹{pkg.priceMax.toLocaleString("en-IN")}/sq.ft. depending on finishes
                            </p>
                          )}
                        </div>

                        {/* Material Specifications */}
                        <div className="mt-4 space-y-2.5 text-xs">
                          {pkg.boardMaterialAndBrand && (
                            <div className="flex items-start gap-2">
                              <span className="h-1.5 w-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                              <span className="text-slate-700 dark:text-slate-300">
                                <strong>Core Board:</strong> {pkg.boardMaterialAndBrand}
                              </span>
                            </div>
                          )}

                          {pkg.finishAndBrand && (
                            <div className="flex items-start gap-2">
                              <span className="h-1.5 w-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                              <span className="text-slate-700 dark:text-slate-300">
                                <strong>Finish:</strong> {pkg.finishAndBrand}
                              </span>
                            </div>
                          )}

                          {pkg.hardwareAndBrand && (
                            <div className="flex items-start gap-2">
                              <span className="h-1.5 w-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                              <span className="text-slate-700 dark:text-slate-300">
                                <strong>Hardware:</strong> {pkg.hardwareAndBrand}
                              </span>
                            </div>
                          )}

                          <div className="flex items-start gap-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                            <span className="text-slate-700 dark:text-slate-300">
                              <strong>Warranty:</strong> {pkg.woodworkWarrantyYears || 10} Years on Modular Woodwork
                            </span>
                          </div>
                        </div>

                        {/* Inclusions Tags */}
                        {pkg.inclusions && pkg.inclusions.length > 0 && (
                          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                              Deliverables Included:
                            </span>
                            <div className="flex flex-wrap gap-1">
                              {pkg.inclusions.map((inc, i) => (
                                <span
                                  key={i}
                                  className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                                >
                                  {inc}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="mt-6 pt-3">
                        <button
                          type="button"
                          onClick={() => setIsInquiryOpen(true)}
                          className={`w-full rounded-2xl py-2.5 text-center text-xs font-bold transition active:scale-98 ${
                            isPremium
                              ? "bg-rose-600 text-white shadow-md hover:bg-rose-700"
                              : "border border-slate-200 bg-slate-50 text-slate-800 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                          }`}
                        >
                          Book {pkg.packageName} Estimate
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Section 4: Completed Portfolio Albums */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Completed Projects & Portfolios</h2>
                <p className="text-xs text-slate-500">Real homes transformed by {profile.businessName}</p>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold dark:bg-slate-800">
                {profile.projects?.length || 0} Projects
              </span>
            </div>

            <div className="mt-6 space-y-6">
              {profile.projects?.map((project) => (
                <div
                  key={project.id}
                  className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20"
                >
                  <div className="aspect-[16/9] w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                    <img src={project.coverImage} alt={project.title} className="h-full w-full object-cover" />
                  </div>
                  <div className="p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                        {project.propertyConfig} · {project.designStyle}
                      </span>
                      {project.projectBudget && (
                        <span className="text-sm font-bold text-slate-900 dark:text-white">
                          ₹{(project.projectBudget / 100000).toFixed(2)} Lakhs Total
                        </span>
                      )}
                    </div>
                    <h3 className="mt-1 text-base font-bold text-slate-900 dark:text-white">{project.title}</h3>
                    <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">{project.description}</p>

                    {/* Additional Project Photos */}
                    {project.images && project.images.length > 0 && (
                      <div className="mt-3 flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                        {project.images.map((img, i) => (
                          <img
                            key={i}
                            src={img}
                            alt=""
                            className="h-20 w-28 rounded-lg object-cover shrink-0 border border-slate-200 dark:border-slate-700"
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Right Sidebar: Contact & Quick Estimator Card */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-rose-200 bg-white p-5 shadow-sm dark:border-rose-950 dark:bg-slate-900">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Book a Design Consultation</h3>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Connect directly with the designer or request an in-person site inspection.
            </p>

            <div className="mt-4 space-y-2.5 text-xs text-slate-700 dark:text-slate-300">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-slate-400" />
                <span>Working: {profile.workingHours || "Mon - Sat (10:00 AM - 7:00 PM)"}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <span>Status: {profile.isAcceptingProjects ? "Accepting New Projects" : "Busy"}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-rose-500" />
                <span>Consultation: {profile.consultationType.replace(/_/g, " ")}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsInquiryOpen(true)}
              className="mt-5 w-full rounded-xl bg-rose-600 py-3 text-center text-xs font-bold text-white shadow-md transition hover:bg-rose-700 active:scale-98"
            >
              Request Free Estimate
            </button>
          </div>

          {/* Company Branches list if applicable */}
          {isCompany && profile.branches && profile.branches.length > 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Studios & Branches</h3>
              <div className="mt-3 space-y-3">
                {profile.branches.map((b) => (
                  <div key={b.id} className="border-t border-slate-100 pt-2.5 text-xs dark:border-slate-800">
                    <p className="font-bold text-slate-900 dark:text-white">{b.branchName}</p>
                    <p className="text-slate-500">{b.address}, {b.city}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Manager: {b.branchManagerName} ({b.contactNumber})</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <InteriorInquiryModal
        profile={profile}
        isOpen={isInquiryOpen}
        onClose={() => setIsInquiryOpen(false)}
      />
    </div>
  );
}

