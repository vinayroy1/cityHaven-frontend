"use client";

import React, { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  MapPin,
  RefreshCw,
  Trash2,
  Edit3,
  Eye,
  Plus,
  Search,
  LayoutGrid,
  List,
  Building2,
  BedDouble,
  Bath,
  Ruler,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Clock,
  XCircle,
  ExternalLink,
  SlidersHorizontal,
  Home,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { useDeletePropertyMutation, useMyPropertiesQuery } from "@/features/propertyListing/api";
import { useOrgListingsInfinite } from "@/features/propertyListing/useQueries";
import { HeaderNav } from "@/app/homePage/components/HeaderNav";

import { APP_CONFIG } from "@/constants/app-config";

type ListingStatus = "ACTIVE" | "DRAFT" | "UNDER_REVIEW" | "REJECTED" | string;

const statusConfig: Record<
  string,
  { label: string; bg: string; text: string; border: string; icon: React.ComponentType<{ className?: string }> }
> = {
  ACTIVE: {
    label: "Active",
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
    icon: CheckCircle2,
  },
  DRAFT: {
    label: "Draft",
    bg: "bg-slate-50",
    text: "text-slate-700",
    border: "border-slate-200",
    icon: Clock,
  },
  UNDER_REVIEW: {
    label: "Under Review",
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
    icon: Clock,
  },
  REJECTED: {
    label: "Needs Changes",
    bg: "bg-rose-50",
    text: "text-rose-700",
    border: "border-rose-200",
    icon: XCircle,
  },
};

function formatPrice(val?: number | string | null): string {
  if (!val) return "Price on request";
  const num = typeof val === "string" ? parseFloat(val) : val;
  if (isNaN(num)) return "Price on request";
  if (num >= 10000000) return `₹${(num / 10000000).toFixed(2).replace(/\.00$/, "")} Cr`;
  if (num >= 100000) return `₹${(num / 100000).toFixed(2).replace(/\.00$/, "")} Lac`;
  return `₹${num.toLocaleString("en-IN")}`;
}

function PropertiesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const scope = searchParams.get("scope") || "my";
  const [hasToken, setHasToken] = useState<boolean | null>(null);

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem(APP_CONFIG.AUTH.TOKEN_KEY) : null;
    if (!token) {
      setHasToken(false);
      router.replace("/login?redirect=/dashboard/properties");
    } else {
      setHasToken(true);
    }
  }, [router]);

  const { data: myData, isLoading: isMyLoading, isFetching: isMyFetching, error: myError, refetch } = useMyPropertiesQuery(
    undefined,
    { skip: hasToken === false }
  );
  const orgQuery = useOrgListingsInfinite({ assignedToMe: true });
  const [deleteProperty, { isLoading: isDeleting }] = useDeletePropertyMutation();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<ListingStatus | "ALL">("ALL");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | string | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);

  const rawList = useMemo(() => {
    if (scope === "org") return orgQuery.items || [];
    if (Array.isArray(myData)) return myData;
    if (myData && Array.isArray((myData as any).items)) return (myData as any).items;
    return [];
  }, [scope, orgQuery.items, myData]);

  // Stats calculation
  const stats = useMemo(() => {
    const total = rawList.length;
    const active = rawList.filter((item: any) => item.status === "ACTIVE").length;
    const underReview = rawList.filter((item: any) => item.status === "UNDER_REVIEW").length;
    const drafts = rawList.filter((item: any) => item.status === "DRAFT" || !item.status).length;
    return { total, active, underReview, drafts };
  }, [rawList]);

  // Filtered list
  const filtered = useMemo(() => {
    return rawList.filter((item: any) => {
      if (!item) return false;
      const term = searchTerm.trim().toLowerCase();
      const matchesSearch =
        !term ||
        (item.title && item.title.toLowerCase().includes(term)) ||
        (item.cityName && item.cityName.toLowerCase().includes(term)) ||
        (item.locality && item.locality.toLowerCase().includes(term)) ||
        (item.id && String(item.id).includes(term));

      if (!matchesSearch) return false;

      if (statusFilter === "ALL") return true;
      if (statusFilter === "DRAFT") return item.status === "DRAFT" || !item.status;
      return item.status === statusFilter;
    });
  }, [rawList, searchTerm, statusFilter]);

  // Reset to page 1 on filter/search/pageSize change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, pageSize]);

  const totalFilteredCount = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalFilteredCount / pageSize));
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage, pageSize]);

  const isInitialLoading = scope === "org" ? orgQuery.isLoading : (isMyLoading && rawList.length === 0);

  const confirmDelete = async () => {
    if (!deleteConfirmId) return;
    try {
      await deleteProperty(deleteConfirmId).unwrap();
      setDeleteConfirmId(null);
      if (scope === "org") {
        orgQuery.refetch();
      } else {
        refetch();
      }
    } catch (err) {
      console.error("Failed to delete property", err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      <HeaderNav />

      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
          {/* Header Banner */}
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-rose-600">
                <Building2 className="h-4 w-4" />
                <span>Inventory Control</span>
              </div>
              <h1 className="mt-1 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
                {scope === "org" ? "Organization Listings" : "My Listed Properties"}
              </h1>
              <p className="mt-1 text-sm text-slate-600">
                Track status, review leads, update pricing, or edit your listings anytime.
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Scope Switcher */}
              <div className="flex rounded-full border border-slate-200 bg-white p-1 shadow-sm">
                <button
                  type="button"
                  onClick={() => router.push("/dashboard/properties")}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition ${
                    scope !== "org" ? "bg-slate-900 text-white shadow-sm" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  My Listings
                </button>
                <button
                  type="button"
                  onClick={() => router.push("/dashboard/properties?scope=org")}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition ${
                    scope === "org" ? "bg-slate-900 text-white shadow-sm" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Org Listings
                </button>
              </div>

              <button
                type="button"
                onClick={() => (scope === "org" ? orgQuery.refetch() : refetch())}
                disabled={isMyFetching || orgQuery.isFetching}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-60"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${(isMyFetching || orgQuery.isFetching) ? "animate-spin text-rose-600" : ""}`} />
                <span>Refresh</span>
              </button>

              <Link
                href="/propertyListing"
                className="inline-flex items-center gap-2 rounded-full bg-rose-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-rose-200 transition hover:bg-rose-700 hover:shadow-lg active:scale-95"
              >
                <Plus className="h-4 w-4" />
                <span>Post property</span>
              </Link>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <button
              type="button"
              onClick={() => setStatusFilter("ALL")}
              className={`flex flex-col items-start rounded-2xl border p-4 text-left transition shadow-sm hover:-translate-y-0.5 ${
                statusFilter === "ALL" ? "border-slate-900 bg-white ring-2 ring-slate-900/10" : "border-slate-200 bg-white"
              }`}
            >
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Total Properties</span>
              <span className="mt-1 text-2xl font-black text-slate-900">{stats.total}</span>
              <span className="mt-1 text-[11px] text-slate-400">All inventory</span>
            </button>

            <button
              type="button"
              onClick={() => setStatusFilter("ACTIVE")}
              className={`flex flex-col items-start rounded-2xl border p-4 text-left transition shadow-sm hover:-translate-y-0.5 ${
                statusFilter === "ACTIVE" ? "border-emerald-500 bg-emerald-50/50 ring-2 ring-emerald-500/20" : "border-emerald-200 bg-emerald-50/20"
              }`}
            >
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">Active Live</span>
              <span className="mt-1 text-2xl font-black text-emerald-800">{stats.active}</span>
              <span className="mt-1 text-[11px] text-emerald-600">Visible to buyers</span>
            </button>

            <button
              type="button"
              onClick={() => setStatusFilter("UNDER_REVIEW")}
              className={`flex flex-col items-start rounded-2xl border p-4 text-left transition shadow-sm hover:-translate-y-0.5 ${
                statusFilter === "UNDER_REVIEW" ? "border-amber-500 bg-amber-50/50 ring-2 ring-amber-500/20" : "border-amber-200 bg-amber-50/20"
              }`}
            >
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700">Under Review</span>
              <span className="mt-1 text-2xl font-black text-amber-800">{stats.underReview}</span>
              <span className="mt-1 text-[11px] text-amber-600">Verification in progress</span>
            </button>

            <button
              type="button"
              onClick={() => setStatusFilter("DRAFT")}
              className={`flex flex-col items-start rounded-2xl border p-4 text-left transition shadow-sm hover:-translate-y-0.5 ${
                statusFilter === "DRAFT" ? "border-slate-500 bg-slate-100 ring-2 ring-slate-500/20" : "border-slate-200 bg-slate-50"
              }`}
            >
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">Drafts</span>
              <span className="mt-1 text-2xl font-black text-slate-800">{stats.drafts}</span>
              <span className="mt-1 text-[11px] text-slate-500">Unpublished listings</span>
            </button>
          </div>

          {/* Search, Filter Tabs & View Mode Switcher */}
          <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by title, city, locality, or property ID..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-4 text-sm text-slate-900 outline-none transition focus:border-rose-400 focus:bg-white focus:ring-2 focus:ring-rose-100"
              />
            </div>

            {/* Status Filter Tabs & Layout switcher */}
            <div className="flex flex-wrap items-center justify-between gap-2 sm:justify-end">
              <div className="flex flex-wrap items-center gap-1.5">
                {(
                  [
                    { key: "ALL", label: "All" },
                    { key: "ACTIVE", label: "Active" },
                    { key: "UNDER_REVIEW", label: "In Review" },
                    { key: "DRAFT", label: "Drafts" },
                    { key: "REJECTED", label: "Changes Needed" },
                  ] as const
                ).map((tab) => (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setStatusFilter(tab.key)}
                    className={`rounded-full px-3 py-1.5 text-xs font-bold transition ${
                      statusFilter === tab.key
                        ? "bg-slate-900 text-white shadow-sm"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* View Toggle */}
              <div className="flex rounded-xl border border-slate-200 bg-slate-100 p-1">
                <button
                  type="button"
                  title="Grid view"
                  onClick={() => setViewMode("grid")}
                  className={`rounded-lg p-1.5 transition ${viewMode === "grid" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900"}`}
                >
                  <LayoutGrid className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  title="Table view"
                  onClick={() => setViewMode("table")}
                  className={`rounded-lg p-1.5 transition ${viewMode === "table" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900"}`}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Listings Presentation */}
          {isInitialLoading ? (
            <div className="flex min-h-[360px] flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-white p-12 text-center shadow-sm">
              <RefreshCw className="h-8 w-8 animate-spin text-rose-500" />
              <p className="mt-3 text-sm font-semibold text-slate-800">Loading your properties...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex min-h-[380px] flex-col items-center justify-center rounded-3xl border border-slate-200/80 bg-white p-10 text-center shadow-sm">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-rose-50 text-rose-600 shadow-inner">
                <Home className="h-8 w-8 text-rose-500" />
              </div>
              <h3 className="mt-4 text-lg font-bold text-slate-900">
                {searchTerm || statusFilter !== "ALL" ? "No matching properties found" : "No properties listed yet"}
              </h3>
              <p className="mt-1.5 max-w-md text-sm text-slate-500">
                {searchTerm || statusFilter !== "ALL"
                  ? "Try resetting your search query or choosing a different status filter."
                  : "List your property for Sale, Rent, or Commercial in just 2 minutes and start receiving buyer leads."}
              </p>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                {searchTerm || statusFilter !== "ALL" ? (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchTerm("");
                      setStatusFilter("ALL");
                    }}
                    className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-800 hover:bg-slate-50"
                  >
                    Clear filters
                  </button>
                ) : (
                  <Link
                    href="/propertyListing"
                    className="inline-flex items-center gap-2 rounded-full bg-rose-600 px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-rose-200 transition hover:bg-rose-700 hover:shadow-lg"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Create your first listing</span>
                  </Link>
                )}
              </div>
            </div>
          ) : viewMode === "grid" ? (
            /* Grid View */
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {paginatedItems.map((item: any) => {
                const cfg = statusConfig[item.status] || statusConfig.DRAFT;
                const StatusIcon = cfg.icon;
                const coverImage = item.media?.[0]?.url || "/placeholder-property.jpg";
                const locationStr = [item.locality, item.subLocality, item.cityName].filter(Boolean).join(", ");
                const propertyType = item.propertySubType?.name || item.propertyType?.name || (item.resCom === "COMMERCIAL" ? "Commercial" : "Residential");

                return (
                  <div
                    key={item.id}
                    className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:border-slate-300 hover:shadow-xl"
                  >
                    {/* Media Thumbnail */}
                    <div className="relative h-48 w-full overflow-hidden bg-slate-100">
                      <img
                        src={coverImage}
                        alt={item.title || "Property"}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&auto=format&fit=crop&q=60";
                        }}
                      />
                      {/* Status Badge */}
                      <span
                        className={`absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold shadow-sm backdrop-blur-md ${cfg.bg} ${cfg.text} ${cfg.border}`}
                      >
                        <StatusIcon className="h-3.5 w-3.5" />
                        <span>{cfg.label}</span>
                      </span>

                      {/* Photo count */}
                      {item.media?.length > 0 && (
                        <span className="absolute right-3 top-3 rounded-full bg-slate-900/70 px-2.5 py-0.5 text-[11px] font-semibold text-white backdrop-blur-sm">
                          📷 {item.media.length} {item.media.length === 1 ? "photo" : "photos"}
                        </span>
                      )}

                      {/* Tag pill */}
                      <span className="absolute bottom-3 left-3 rounded-md bg-slate-950/80 px-2 py-0.5 text-[11px] font-semibold text-white backdrop-blur-sm">
                        {item.listingType === "RENT" ? "For Rent" : item.listingType === "SELL" ? "For Sale" : item.resCom || "Property"}
                      </span>
                    </div>

                    {/* Card Content */}
                    <div className="flex flex-1 flex-col p-4">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="line-clamp-1 text-base font-bold text-slate-950 group-hover:text-rose-600">
                          {item.title || "Untitled property"}
                        </h3>
                      </div>

                      {locationStr && (
                        <p className="mt-1 flex items-center gap-1 text-xs text-slate-500 line-clamp-1">
                          <MapPin className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                          <span className="truncate">{locationStr}</span>
                        </p>
                      )}

                      <p className="mt-2 text-lg font-extrabold text-slate-900">{formatPrice(item.price)}</p>

                      {/* Key Specs */}
                      <div className="mt-3 grid grid-cols-2 gap-1.5 text-xs text-slate-600">
                        {item.bedrooms ? (
                          <span className="inline-flex items-center gap-1 rounded-lg bg-slate-50 px-2 py-1">
                            <BedDouble className="h-3.5 w-3.5 text-slate-400" />
                            {item.bedrooms} BHK
                          </span>
                        ) : null}
                        {item.bathrooms ? (
                          <span className="inline-flex items-center gap-1 rounded-lg bg-slate-50 px-2 py-1">
                            <Bath className="h-3.5 w-3.5 text-slate-400" />
                            {item.bathrooms} Bath
                          </span>
                        ) : null}
                        {item.builtUpArea || item.carpetArea ? (
                          <span className="inline-flex items-center gap-1 rounded-lg bg-slate-50 px-2 py-1">
                            <Ruler className="h-3.5 w-3.5 text-slate-400" />
                            {item.builtUpArea || item.carpetArea} sq.ft
                          </span>
                        ) : null}
                        <span className="truncate rounded-lg bg-slate-50 px-2 py-1">{propertyType}</span>
                      </div>

                      {/* Footer Actions */}
                      <div className="mt-auto flex items-center justify-between gap-2 border-t border-slate-100 pt-3 text-xs">
                        <span className="text-[11px] text-slate-400">
                          {item.updatedAt ? `Updated ${new Date(item.updatedAt).toLocaleDateString()}` : `ID: #${item.id}`}
                        </span>

                        <div className="flex items-center gap-1.5">
                          <Link
                            href={`/properties/${item.id}`}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-50 hover:text-rose-600"
                            title="View public page"
                          >
                            <Eye className="h-4 w-4" />
                          </Link>

                          <Link
                            href={`/propertyListing?id=${item.id}`}
                            className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-1.5 font-bold text-slate-800 shadow-sm transition hover:bg-slate-50 hover:text-rose-600"
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                            <span>Edit</span>
                          </Link>

                          {scope !== "org" && (
                            <button
                              type="button"
                              onClick={() => setDeleteConfirmId(item.id)}
                              className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-rose-100 bg-rose-50 text-rose-600 shadow-sm transition hover:bg-rose-100 hover:text-rose-700"
                              title="Delete listing"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Table View */
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-700">
                  <thead className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    <tr>
                      <th className="px-4 py-3.5">Property</th>
                      <th className="px-4 py-3.5">Location</th>
                      <th className="px-4 py-3.5">Price</th>
                      <th className="px-4 py-3.5">Type & Specs</th>
                      <th className="px-4 py-3.5">Status</th>
                      <th className="px-4 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {paginatedItems.map((item: any) => {
                      const cfg = statusConfig[item.status] || statusConfig.DRAFT;
                      const StatusIcon = cfg.icon;
                      const coverImage = item.media?.[0]?.url || "/placeholder-property.jpg";

                      return (
                        <tr key={item.id} className="transition hover:bg-slate-50/60">
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-3">
                              <img
                                src={coverImage}
                                alt={item.title || "Property"}
                                className="h-12 w-12 rounded-xl object-cover shadow-sm"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&auto=format&fit=crop&q=60";
                                }}
                              />
                              <div>
                                <p className="font-bold text-slate-900 line-clamp-1">{item.title || "Untitled property"}</p>
                                <p className="text-xs text-slate-400">ID: #{item.id}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3.5 text-xs text-slate-600">
                            {[item.locality, item.cityName].filter(Boolean).join(", ") || "—"}
                          </td>
                          <td className="px-4 py-3.5 font-bold text-slate-900">{formatPrice(item.price)}</td>
                          <td className="px-4 py-3.5 text-xs text-slate-600">
                            {[
                              item.bedrooms ? `${item.bedrooms} BHK` : null,
                              item.builtUpArea ? `${item.builtUpArea} sqft` : null,
                              item.listingType,
                            ]
                              .filter(Boolean)
                              .join(" · ") || "Residential"}
                          </td>
                          <td className="px-4 py-3.5">
                            <span
                              className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold ${cfg.bg} ${cfg.text} ${cfg.border}`}
                            >
                              <StatusIcon className="h-3.5 w-3.5" />
                              <span>{cfg.label}</span>
                            </span>
                          </td>
                          <td className="px-4 py-3.5 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <Link
                                href={`/properties/${item.id}`}
                                className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-50 hover:text-rose-600"
                                title="View public page"
                              >
                                <Eye className="h-4 w-4" />
                              </Link>
                              <Link
                                href={`/propertyListing?id=${item.id}`}
                                className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-800 shadow-sm transition hover:bg-slate-50 hover:text-rose-600"
                              >
                                <Edit3 className="h-3.5 w-3.5" />
                                <span>Edit</span>
                              </Link>
                              {scope !== "org" && (
                                <button
                                  type="button"
                                  onClick={() => setDeleteConfirmId(item.id)}
                                  className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-rose-100 bg-rose-50 text-rose-600 shadow-sm transition hover:bg-rose-100 hover:text-rose-700"
                                  title="Delete listing"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Pagination Controls */}
          {filtered.length > 0 && (
            <div className="mt-6 flex flex-col items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span>
                  Showing <strong className="text-slate-800">{(currentPage - 1) * pageSize + 1}</strong> to{" "}
                  <strong className="text-slate-800">{Math.min(currentPage * pageSize, totalFilteredCount)}</strong> of{" "}
                  <strong className="text-slate-800">{totalFilteredCount}</strong> properties
                </span>
              </div>

              <div className="flex items-center gap-3">
                {/* Page Size Selector */}
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <span>Per page:</span>
                  <select
                    value={pageSize}
                    onChange={(e) => setPageSize(Number(e.target.value))}
                    className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-bold text-slate-800 outline-none focus:border-rose-400"
                  >
                    <option value={6}>6</option>
                    <option value={12}>12</option>
                    <option value={24}>24</option>
                  </select>
                </div>

                {/* Page Navigator */}
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-50 disabled:opacity-40"
                    title="First page"
                  >
                    <ChevronsLeft className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-50 disabled:opacity-40"
                    title="Previous page"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>

                  <span className="px-3 text-xs font-bold text-slate-800">
                    Page {currentPage} of {totalPages}
                  </span>

                  <button
                    type="button"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-50 disabled:opacity-40"
                    title="Next page"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={currentPage === totalPages}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-50 disabled:opacity-40"
                    title="Last page"
                  >
                    <ChevronsRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-slate-100 bg-white p-6 shadow-2xl">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 shadow-inner">
              <Trash2 className="h-6 w-6" />
            </div>
            <h3 className="mt-4 text-lg font-bold text-slate-950">Delete Property Listing?</h3>
            <p className="mt-1.5 text-sm text-slate-600">
              Are you sure you want to delete this listing? This action cannot be undone and will remove it from search and buyer shortlists.
            </p>
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                disabled={isDeleting}
                className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={isDeleting}
                className="inline-flex items-center gap-2 rounded-full bg-rose-600 px-5 py-2 text-xs font-bold text-white shadow-md shadow-rose-200 transition hover:bg-rose-700 disabled:opacity-60"
              >
                {isDeleting ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : null}
                <span>Delete listing</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function DashboardPropertiesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 p-8 text-center text-sm text-slate-500">Loading properties...</div>}>
      <PropertiesContent />
    </Suspense>
  );
}
