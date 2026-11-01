"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Paintbrush,
  Plus,
  Building2,
  MapPin,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Layers,
  ArrowRight,
  ShieldCheck,
  Briefcase,
  AlertCircle,
  Loader2,
  Calendar,
} from "lucide-react";
import { useGetMyInteriorListingsQuery, useCreateInteriorListingMutation } from "@/features/interiors/api";
import { StatusBadge } from "@/components/interiors/manage/StatusBadge";
import { InteriorListingStatus, InteriorProfile } from "@/types/interior.types";

export default function MyInteriorListingsPage() {
  const router = useRouter();
  const { data: listings = [], isLoading, isError, refetch } = useGetMyInteriorListingsQuery();
  const [createListing, { isLoading: isCreating }] = useCreateInteriorListingMutation();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [businessName, setBusinessName] = useState("");
  const [primaryCity, setPrimaryCity] = useState("");
  const [providerType, setProviderType] = useState<"INDIVIDUAL" | "COMPANY">("COMPANY");

  const handleCreateNew = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName.trim() || !primaryCity.trim()) return;
    try {
      const res = await createListing({
        businessName: businessName.trim(),
        displayName: businessName.trim(),
        primaryCity: primaryCity.trim(),
        providerType,
      }).unwrap();
      setShowCreateModal(false);
      setBusinessName("");
      setPrimaryCity("");
      router.push(`/dashboard/interior-profile/setup?profileId=${res.id}`);
    } catch (err) {
      console.error("Failed to create interior listing", err);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-purple-600 dark:text-purple-400">
            <Paintbrush className="h-4 w-4" />
            <span>Interior Business Marketplace</span>
          </div>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
            My Interior Listings
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Manage your interior design businesses, studios, and individual portfolios.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-purple-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-purple-700 active:scale-[0.99]"
        >
          <Plus className="h-4 w-4" />
          <span>Add Interior Business / Studio</span>
        </button>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="flex min-h-[300px] flex-col items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white p-8 text-center dark:border-slate-800 dark:bg-slate-900">
          <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
          <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Loading your interior listings…</p>
        </div>
      )}

      {/* Error state */}
      {isError && (
        <div className="flex min-h-[250px] flex-col items-center justify-center gap-3 rounded-2xl border border-rose-200 bg-rose-50/50 p-8 text-center dark:border-rose-900/50 dark:bg-rose-950/20">
          <AlertCircle className="h-8 w-8 text-rose-600 dark:text-rose-400" />
          <p className="text-sm font-medium text-rose-700 dark:text-rose-300">Failed to load listings. Please try again.</p>
          <button
            onClick={() => refetch()}
            className="rounded-lg bg-rose-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow hover:bg-rose-700"
          >
            Retry
          </button>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !isError && listings.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50/60 p-12 text-center dark:border-slate-700 dark:bg-slate-900/40">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-100 text-purple-600 dark:bg-purple-950/50 dark:text-purple-400">
            <Building2 className="h-8 w-8" />
          </div>
          <h2 className="mt-4 text-lg font-bold text-slate-900 dark:text-white">No interior listings found</h2>
          <p className="mt-1.5 max-w-md text-sm text-slate-500 dark:text-slate-400">
            You haven't listed any interior design studio, architecture firm, or freelance profile yet. Create your first listing to showcase your packages and receive client leads.
          </p>
          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-purple-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-purple-700"
          >
            <Plus className="h-4 w-4" />
            <span>Create Your First Listing</span>
          </button>
        </div>
      )}

      {/* Listing Cards */}
      {!isLoading && !isError && listings.length > 0 && (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {listings.map((item) => {
            const isDraft = item.status === InteriorListingStatus.DRAFT;
            const targetUrl = isDraft
              ? `/dashboard/interior-profile/setup?profileId=${item.id}`
              : `/dashboard/interior-profile/manage?profileId=${item.id}`;

            return (
              <div
                key={item.id}
                className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-purple-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-purple-700"
              >
                <div>
                  {/* Top Bar: Type + Status */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                      {item.providerType === "COMPANY" ? (
                        <>
                          <Building2 className="h-3 w-3" /> Company
                        </>
                      ) : (
                        <>
                          <Briefcase className="h-3 w-3" /> Individual
                        </>
                      )}
                    </span>
                    <StatusBadge profile={item} />
                  </div>

                  {/* Title & Location */}
                  <div className="mt-3.5">
                    <h3 className="line-clamp-1 text-base font-bold text-slate-900 group-hover:text-purple-600 dark:text-white dark:group-hover:text-purple-400">
                      {item.businessName || item.displayName || "Untitled Listing"}
                    </h3>
                    <p className="mt-1 flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                      <MapPin className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                      <span>{item.primaryCity || "Location unset"}</span>
                      {item.primaryLocality && <span>• {item.primaryLocality}</span>}
                    </p>
                  </div>

                  {/* Metrics / Counters */}
                  <div className="mt-4 grid grid-cols-3 gap-2 border-t border-slate-100 pt-3 text-center text-xs dark:border-slate-800">
                    <div className="rounded-lg bg-slate-50 p-1.5 dark:bg-slate-800/60">
                      <span className="block font-bold text-slate-800 dark:text-white">
                        {(item as any)._count?.projects ?? item.projects?.length ?? 0}
                      </span>
                      <span className="text-[10px] text-slate-500">Projects</span>
                    </div>
                    <div className="rounded-lg bg-slate-50 p-1.5 dark:bg-slate-800/60">
                      <span className="block font-bold text-slate-800 dark:text-white">
                        {(item as any)._count?.packages ?? item.packages?.length ?? 0}
                      </span>
                      <span className="text-[10px] text-slate-500">Packages</span>
                    </div>
                    <div className="rounded-lg bg-slate-50 p-1.5 dark:bg-slate-800/60">
                      <span className="block font-bold text-purple-600 dark:text-purple-400">
                        {(item as any)._count?.inquiries ?? 0}
                      </span>
                      <span className="text-[10px] text-slate-500">Leads</span>
                    </div>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-3.5 dark:border-slate-800">
                  {item.isPublished && item.slug ? (
                    <Link
                      href={`/interior-designers/${item.primaryCity?.toLowerCase() || "india"}/${item.slug}`}
                      target="_blank"
                      className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      <span>View Live</span>
                    </Link>
                  ) : (
                    <span className="text-xs text-slate-400">
                      Step {item.wizardStep ?? 1} of 9
                    </span>
                  )}

                  <Link
                    href={targetUrl}
                    className="inline-flex items-center gap-1 rounded-lg bg-purple-50 px-3 py-1.5 text-xs font-bold text-purple-700 transition-colors hover:bg-purple-100 dark:bg-purple-950/60 dark:text-purple-300 dark:hover:bg-purple-900/60"
                  >
                    <span>{isDraft ? "Continue Setup" : "Manage"}</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal to create a new interior listing */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Add New Interior Business / Studio
            </h2>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Create an independent business listing for your design firm or portfolio.
            </p>

            <form onSubmit={handleCreateNew} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Business / Studio Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Aura Spaces Studio or Rohan Varma Designs"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-purple-600 focus:outline-none focus:ring-1 focus:ring-purple-600 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Primary Operating City *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mumbai, Bengaluru, Delhi NCR"
                  value={primaryCity}
                  onChange={(e) => setPrimaryCity(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-purple-600 focus:outline-none focus:ring-1 focus:ring-purple-600 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Listing Type
                </label>
                <div className="mt-1.5 grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setProviderType("COMPANY")}
                    className={`rounded-xl border p-2.5 text-center text-xs font-medium transition-all ${
                      providerType === "COMPANY"
                        ? "border-purple-600 bg-purple-50 text-purple-700 dark:border-purple-500 dark:bg-purple-950/50 dark:text-purple-300"
                        : "border-slate-200 text-slate-600 hover:border-slate-300 dark:border-slate-700 dark:text-slate-400"
                    }`}
                  >
                    🏢 Company / Studio
                  </button>
                  <button
                    type="button"
                    onClick={() => setProviderType("INDIVIDUAL")}
                    className={`rounded-xl border p-2.5 text-center text-xs font-medium transition-all ${
                      providerType === "INDIVIDUAL"
                        ? "border-purple-600 bg-purple-50 text-purple-700 dark:border-purple-500 dark:bg-purple-950/50 dark:text-purple-300"
                        : "border-slate-200 text-slate-600 hover:border-slate-300 dark:border-slate-700 dark:text-slate-400"
                    }`}
                  >
                    👤 Freelance Designer
                  </button>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating || !businessName.trim() || !primaryCity.trim()}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-purple-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-purple-700 disabled:opacity-60"
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" /> Creating…
                    </>
                  ) : (
                    <>
                      <span>Continue to Wizard</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
