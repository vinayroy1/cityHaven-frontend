"use client";

import React, { Suspense, useEffect, useMemo, useState, useRef } from "react";
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
  AlertCircle,
  CheckCircle2,
  Clock,
  XCircle,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  User,
  ShieldCheck,
  Zap,
  PowerOff,
  AlertTriangle,
  Sparkles,
  Lock,
  ArrowRight,
  Check,
} from "lucide-react";
import {
  useDeletePropertyMutation,
  useMyPropertiesQuery,
  useUpdatePropertyStatusMutation,
} from "@/features/propertyListing/api";
import { useOrgListingsInfinite } from "@/features/propertyListing/useQueries";
import { useOrganizationPropertiesQuery, useMyOrganizationsQuery } from "@/features/organizations/api";
import { useGetBillingSummaryQuery } from "@/features/contactVerify/api";
import { HeaderNav } from "@/app/homePage/components/HeaderNav";

import { APP_CONFIG } from "@/constants/app-config";

type ListingStatus = "ACTIVE" | "INACTIVE" | "DRAFT" | "UNDER_REVIEW" | "REJECTED" | string;

const statusConfig: Record<
  string,
  { label: string; bg: string; text: string; border: string; icon: React.ComponentType<{ className?: string }> }
> = {
  ACTIVE: {
    label: "Active (Live)",
    bg: "bg-emerald-50 dark:bg-emerald-950/60",
    text: "text-emerald-700 dark:text-emerald-300",
    border: "border-emerald-200 dark:border-emerald-800",
    icon: CheckCircle2,
  },
  INACTIVE: {
    label: "Inactive",
    bg: "bg-slate-100 dark:bg-slate-800/80",
    text: "text-slate-600 dark:text-slate-400",
    border: "border-slate-300 dark:border-slate-700",
    icon: XCircle,
  },
  DRAFT: {
    label: "Draft",
    bg: "bg-slate-50 dark:bg-slate-800",
    text: "text-slate-700 dark:text-slate-300",
    border: "border-slate-200 dark:border-slate-700",
    icon: Clock,
  },
  UNDER_REVIEW: {
    label: "Under Review",
    bg: "bg-amber-50 dark:bg-amber-950/60",
    text: "text-amber-700 dark:text-amber-300",
    border: "border-amber-200 dark:border-amber-800",
    icon: Clock,
  },
  REJECTED: {
    label: "Needs Changes",
    bg: "bg-rose-50 dark:bg-rose-950/60",
    text: "text-rose-700 dark:text-rose-300",
    border: "border-rose-200 dark:border-rose-800",
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
  const orgId = searchParams.get("orgId") || undefined;
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

  const { data: myData, isLoading: isMyLoading, isFetching: isMyFetching, refetch } = useMyPropertiesQuery(
    undefined,
    { skip: hasToken !== true }
  );

  const { data: myOrganizations = [] } = useMyOrganizationsQuery(undefined, { skip: hasToken !== true });
  const effectiveOrgId = orgId ? Number(orgId) : myOrganizations[0]?.id;

  const {
    data: orgProperties = [],
    isLoading: isOrgPropertiesLoading,
    isFetching: isOrgPropertiesFetching,
    refetch: refetchOrgProperties,
  } = useOrganizationPropertiesQuery(effectiveOrgId ?? 0, {
    skip: hasToken !== true || scope !== "org" || !effectiveOrgId,
  });

  const orgQuery = useOrgListingsInfinite({ orgId: effectiveOrgId, assignedToMe: false });
  const [deleteProperty, { isLoading: isDeleting }] = useDeletePropertyMutation();
  const [updatePropertyStatus, { isLoading: isUpdatingStatus }] = useUpdatePropertyStatusMutation();

  const { data: billingSummaryData, refetch: refetchBillingSummary } = useGetBillingSummaryQuery(
    { target: scope === "org" ? "ORG" : "USER", organizationId: effectiveOrgId },
    { skip: hasToken !== true }
  );
  const billingSummary = billingSummaryData?.data;

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<ListingStatus | "ALL">("ALL");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | string | null>(null);

  // Activation & Deactivation Modal states
  const [activationItem, setActivationItem] = useState<any | null>(null);
  const [deactivateItem, setDeactivateItem] = useState<any | null>(null);
  const [creditsExhaustedModalOpen, setCreditsExhaustedModalOpen] = useState(false);
  const [subscriptionExpiredModalOpen, setSubscriptionExpiredModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Auto-dismiss toast
  useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(() => setToastMessage(null), 6000);
    return () => clearTimeout(timer);
  }, [toastMessage]);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);

  const rawList = useMemo(() => {
    if (scope === "org") {
      if (orgProperties && orgProperties.length > 0) return orgProperties;
      return orgQuery.items || [];
    }
    if (Array.isArray(myData)) return myData;
    if (myData && Array.isArray((myData as any).items)) return (myData as any).items;
    return [];
  }, [scope, orgProperties, orgQuery.items, myData]);

  // Subscription expiration detection
  const activeSub = billingSummary?.activeSubscription;
  const isSubscriptionExpired = Boolean(
    (activeSub && activeSub.status === "EXPIRED") ||
    (activeSub && activeSub.endsAt && new Date(activeSub.endsAt).getTime() <= Date.now()) ||
    (billingSummaryData?.success && !activeSub && rawList.length > 0)
  );

  // Automatic deactivation of active properties if subscription is expired
  const hasAutoDeactivatedRef = useRef(false);
  useEffect(() => {
    if (isSubscriptionExpired && !hasAutoDeactivatedRef.current && rawList.length > 0) {
      const activeItems = rawList.filter((item: any) => item.status === "ACTIVE");
      if (activeItems.length > 0) {
        hasAutoDeactivatedRef.current = true;
        Promise.all(
          activeItems.map((item: any) =>
            updatePropertyStatus({ id: item.id, status: "INACTIVE" }).unwrap().catch(() => {})
          )
        ).then(() => {
          if (scope === "org") {
            orgQuery.refetch();
            refetchOrgProperties();
          } else {
            refetch();
          }
        });
      }
    }
  }, [isSubscriptionExpired, rawList, scope, updatePropertyStatus, orgQuery, refetchOrgProperties, refetch]);

  // Credit Deduction & "No Swapping Allowed" Tracking:
  // When user purchases a subscription (e.g. 5 listings), total package credits = packageListingLimit.
  // Each property that is activated consumes 1 credit permanently.
  // We record consumed property IDs under the current subscription key.
  const packageListingLimit =
    activeSub?.plan?.features?.maxActiveListings ??
    billingSummary?.allowances?.listings?.limit ??
    (scope === "org" ? 5 : 2);

  const subKey = activeSub?.id ? `sub_${activeSub.id}` : "default_sub";
  const storageKey = `awasio_${scope}_${subKey}_consumed_listing_ids`;

  const [consumedPropertyIds, setConsumedPropertyIds] = useState<number[]>([]);
  const activePropertyIdsKey = (rawList as Array<{ id: number | string; status?: string }>)
    .filter((item) => item.status === "ACTIVE")
    .map((item) => Number(item.id))
    .filter(Number.isFinite)
    .sort((a: number, b: number) => a - b)
    .join(",");

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem(storageKey);
      const stored = raw ? JSON.parse(raw) : [];
      const parsed = Array.isArray(stored)
        ? stored.map(Number).filter(Number.isFinite)
        : [];
      // Any property currently ACTIVE is guaranteed to have consumed a credit
      const activeIds = activePropertyIdsKey
        ? activePropertyIdsKey.split(",").map(Number).filter(Number.isFinite)
        : [];
      const merged = Array.from(new Set([...parsed, ...activeIds])).sort((a, b) => a - b);
      const serialized = JSON.stringify(merged);

      setConsumedPropertyIds((current) => {
        if (current.length === merged.length && current.every((id, index) => id === merged[index])) {
          return current;
        }
        return merged;
      });

      if (raw !== serialized) {
        localStorage.setItem(storageKey, serialized);
      }
    } catch (e) {
      console.error("Error loading consumed listing IDs", e);
    }
  }, [storageKey, activePropertyIdsKey]);

  // Available listing credits remaining in purchased package
  const consumedCredits = consumedPropertyIds.length;
  const availableCredits = Math.max(0, packageListingLimit - consumedCredits);

  // Stats calculation
  const stats = useMemo(() => {
    const total = rawList.length;
    const active = rawList.filter((item: any) => item.status === "ACTIVE").length;
    const inactive = rawList.filter((item: any) => item.status === "INACTIVE").length;
    const underReview = rawList.filter((item: any) => item.status === "UNDER_REVIEW").length;
    const drafts = rawList.filter((item: any) => item.status === "DRAFT" || !item.status).length;
    return { total, active, inactive, underReview, drafts };
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
        refetchOrgProperties();
      } else {
        refetch();
      }
    } catch (err) {
      console.error("Failed to delete property", err);
    }
  };

  // Activation handler (Triggered when user clicks "Activate (1 Credit)")
  const handleActivateClick = (item: any) => {
    if (isSubscriptionExpired) {
      setSubscriptionExpiredModalOpen(true);
      return;
    }
    const itemId = Number(item.id);
    const isAlreadyConsumed = consumedPropertyIds.includes(itemId);
    // If package has 0 credits remaining and this property didn't already consume a credit:
    if (availableCredits <= 0 && !isAlreadyConsumed) {
      setCreditsExhaustedModalOpen(true);
      return;
    }
    setActivationItem(item);
  };

  // Confirm activation & permanently consume 1 listing credit
  const confirmActivate = async () => {
    if (!activationItem) return;
    try {
      await updatePropertyStatus({ id: activationItem.id, status: "ACTIVE" }).unwrap();
      const itemId = Number(activationItem.id);
      const updatedConsumed = Array.from(new Set([...consumedPropertyIds, itemId]));
      setConsumedPropertyIds(updatedConsumed);
      localStorage.setItem(storageKey, JSON.stringify(updatedConsumed));

      const newRemaining = Math.max(0, packageListingLimit - updatedConsumed.length);
      setToastMessage(
        `⚡ Property "${activationItem.title || `#${activationItem.id}`}" activated successfully! 1 listing credit consumed. (${newRemaining} remaining)`
      );
      setActivationItem(null);

      // Refresh listings & billing status
      if (scope === "org") {
        orgQuery.refetch();
        refetchOrgProperties();
      } else {
        refetch();
      }
      refetchBillingSummary();
    } catch (err: any) {
      console.error("Failed to activate property", err);
      alert(err?.data?.message || "Failed to activate property listing. Please try again.");
    }
  };

  // Confirm deactivation (Strict Rule: Credit remains consumed, NO SWAPPING ALLOWED)
  const confirmDeactivate = async () => {
    if (!deactivateItem) return;
    try {
      await updatePropertyStatus({ id: deactivateItem.id, status: "INACTIVE" }).unwrap();
      // NOTE: We DO NOT remove the ID from consumedPropertyIds!
      // This strictly enforces: NO SLOT SWAPPING! The credit is permanently consumed for this listing.
      setToastMessage(
        `Property "${deactivateItem.title || `#${deactivateItem.id}`}" is now Inactive. Policy Reminder: Listing credit remains consumed (no slot swapping allowed).`
      );
      setDeactivateItem(null);

      if (scope === "org") {
        orgQuery.refetch();
        refetchOrgProperties();
      } else {
        refetch();
      }
      refetchBillingSummary();
    } catch (err: any) {
      console.error("Failed to deactivate property", err);
      alert(err?.data?.message || "Failed to deactivate property listing.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 flex flex-col transition-colors duration-150">
      <HeaderNav />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 flex max-w-md items-center gap-3 rounded-2xl border border-emerald-500/30 bg-white p-4 shadow-2xl backdrop-blur-md dark:bg-slate-900">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-500 text-white">
            <Check className="h-4 w-4" />
          </div>
          <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">{toastMessage}</p>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="ml-auto text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            ✕
          </button>
        </div>
      )}

      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-3 sm:px-6 py-3 sm:py-8">
          {/* Header Banner */}
          <div className="mb-3 sm:mb-6 flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-1.5 text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                <Building2 className="h-3.5 w-3.5" />
                <span>Inventory & Billing Scope</span>
              </div>
              <h1 className="mt-0.5 text-xl font-black tracking-tight text-slate-950 dark:text-white sm:text-3xl">
                {scope === "org" ? "Organization Listings" : "My Personal Properties"}
              </h1>
              <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-400 hidden sm:block">
                {scope === "org"
                  ? "Properties listed under your active organization workspace. Publishing charges the organization package."
                  : "Properties owned personally. Publishing charges your personal subscription package."}
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between sm:justify-end gap-2">
              {/* Scope Switcher */}
              <div className="flex rounded-full border border-slate-200 bg-white p-0.5 sm:p-1 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
                <button
                  type="button"
                  onClick={() => router.push("/dashboard/properties")}
                  className={`flex items-center gap-1 rounded-full px-2.5 sm:px-3.5 py-1 sm:py-1.5 text-xs font-bold transition ${
                    scope !== "org" ? "bg-slate-900 text-white shadow-xs dark:bg-slate-100 dark:text-slate-900" : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
                  }`}
                >
                  <User className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                  <span>Personal</span>
                </button>
                <button
                  type="button"
                  onClick={() => router.push("/dashboard/properties?scope=org")}
                  className={`flex items-center gap-1 rounded-full px-2.5 sm:px-3.5 py-1 sm:py-1.5 text-xs font-bold transition ${
                    scope === "org" ? "bg-slate-900 text-white shadow-xs dark:bg-slate-100 dark:text-slate-900" : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
                  }`}
                >
                  <Building2 className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                  <span>Organization</span>
                </button>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => (scope === "org" ? (orgQuery.refetch(), refetchOrgProperties()) : refetch())}
                  disabled={isMyFetching || orgQuery.isFetching || isOrgPropertiesFetching}
                  className="inline-flex items-center justify-center h-8 w-8 sm:h-auto sm:w-auto sm:gap-2 rounded-full border border-slate-200 bg-white sm:px-3.5 sm:py-2 text-xs font-bold text-slate-700 shadow-2xs transition hover:bg-slate-50 disabled:opacity-60 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                  title="Refresh listings"
                  aria-label="Refresh listings"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${(isMyFetching || orgQuery.isFetching || isOrgPropertiesFetching) ? "animate-spin text-rose-600 dark:text-rose-400" : ""}`} />
                  <span className="hidden sm:inline">Refresh</span>
                </button>

                <Link
                  href={scope === "org" ? `/propertyListing?scope=org${orgId ? `&orgId=${orgId}` : ""}` : "/propertyListing"}
                  className="inline-flex items-center gap-1.5 rounded-full bg-rose-600 px-3 sm:px-4 py-1.5 sm:py-2 text-xs font-bold text-white shadow-sm shadow-rose-200 transition hover:bg-rose-700 hover:shadow-md active:scale-95 dark:shadow-none shrink-0"
                >
                  <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  <span>Post Property</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Subscription Expiry / Package Listing Credit Banner */}
          {isSubscriptionExpired ? (
            <div className="mb-3 sm:mb-6 flex flex-col gap-2.5 sm:gap-3 rounded-2xl border border-rose-300 bg-gradient-to-r from-rose-50 via-rose-100/60 to-amber-50 p-3 sm:p-5 shadow-2xs sm:flex-row sm:items-center sm:justify-between dark:border-rose-900/60 dark:from-rose-950/40 dark:via-rose-950/20 dark:to-slate-900">
              <div className="flex items-start gap-2.5 sm:gap-3.5">
                <div className="flex h-9 w-9 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-xl sm:rounded-2xl bg-rose-600 text-white shadow-xs sm:shadow-md shadow-rose-300 dark:shadow-none">
                  <AlertCircle className="h-5 w-5 sm:h-6 sm:w-6" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="rounded-md bg-rose-600 px-1.5 py-0.5 text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-white">
                      Expired
                    </span>
                    <span className="text-[11px] sm:text-xs font-bold text-rose-800 dark:text-rose-300">Properties inactive</span>
                  </div>
                  <h3 className="mt-0.5 text-xs sm:text-base font-black text-slate-900 dark:text-white">
                    Listing package expired
                  </h3>
                  <p className="mt-0.5 text-[11px] sm:text-xs text-slate-600 dark:text-slate-400 hidden sm:block">
                    All your properties are currently <strong>Inactive</strong> and hidden from buyers. Purchase or renew a package to receive listing credits.
                  </p>
                </div>
              </div>
              <Link
                href="/pricing"
                className="inline-flex items-center justify-center gap-1.5 rounded-full bg-rose-600 px-3.5 sm:px-5 py-1.5 sm:py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-rose-700 active:scale-95 whitespace-nowrap self-start sm:self-auto"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>Renew Package</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          ) : (
            <div className="mb-3 sm:mb-6 rounded-2xl border border-slate-200 bg-white p-3 sm:p-5 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
                  <div className="flex h-8 w-8 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-xl sm:rounded-2xl bg-emerald-600 text-white shadow-xs sm:shadow-md shadow-emerald-200 dark:shadow-none">
                    <Zap className="h-4 w-4 sm:h-6 sm:w-6" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                      <span className="rounded-md bg-emerald-100 px-1.5 py-0.5 text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300">
                        {activeSub?.plan?.name || "Active Package"}
                      </span>
                      {activeSub?.endsAt && (
                        <span className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400">
                          Valid until {new Date(activeSub.endsAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                      Credits:{" "}
                      <span className="text-emerald-600 font-black dark:text-emerald-400">
                        {availableCredits}
                      </span>{" "}
                      / {packageListingLimit} remaining
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Link
                    href="/pricing"
                    className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2.5 sm:px-4 py-1.5 sm:py-2 text-[11px] sm:text-xs font-bold text-slate-800 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 whitespace-nowrap"
                  >
                    <Plus className="h-3 w-3 text-rose-600" />
                    <span>Buy Credits</span>
                  </Link>
                </div>
              </div>

              <p className="mt-2 text-[11px] text-slate-500 dark:text-slate-400 hidden sm:flex items-center gap-1.5">
                <Lock className="h-3 w-3 text-slate-400" />
                <span>Strict Policy: 1 credit consumed permanently per activation. No slot swapping permitted.</span>
              </p>
            </div>
          )}

          {/* Quick Metrics Bar - Horizontal Scrollable on Mobile, Grid on Desktop */}
          <div className="mb-3 sm:mb-6 flex gap-2 overflow-x-auto pb-1 no-scrollbar sm:grid sm:grid-cols-5 sm:gap-3">
            <button
              type="button"
              onClick={() => setStatusFilter("ALL")}
              className={`flex flex-col items-start rounded-xl sm:rounded-2xl border p-2 sm:p-4 text-left transition shadow-2xs min-w-[75px] sm:min-w-0 shrink-0 sm:shrink ${
                statusFilter === "ALL" ? "border-slate-900 bg-white ring-2 ring-slate-900/10 dark:border-slate-100 dark:bg-slate-900 dark:ring-slate-100/10" : "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
              }`}
            >
              <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Total</span>
              <span className="mt-0.5 sm:mt-1 text-base sm:text-2xl font-black text-slate-900 dark:text-white">{stats.total}</span>
              <span className="hidden sm:block mt-1 text-[11px] text-slate-400 dark:text-slate-500">All inventory</span>
            </button>

            <button
              type="button"
              onClick={() => setStatusFilter("ACTIVE")}
              className={`flex flex-col items-start rounded-xl sm:rounded-2xl border p-2 sm:p-4 text-left transition shadow-2xs min-w-[75px] sm:min-w-0 shrink-0 sm:shrink ${
                statusFilter === "ACTIVE" ? "border-emerald-500 bg-emerald-50/50 ring-2 ring-emerald-500/20 dark:border-emerald-600 dark:bg-emerald-950/40" : "border-emerald-200 bg-emerald-50/20 dark:border-emerald-900/60 dark:bg-emerald-950/20"
              }`}
            >
              <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">Active</span>
              <span className="mt-0.5 sm:mt-1 text-base sm:text-2xl font-black text-emerald-800 dark:text-emerald-300">{stats.active}</span>
              <span className="hidden sm:block mt-1 text-[11px] text-emerald-600 dark:text-emerald-500">Visible to buyers</span>
            </button>

            <button
              type="button"
              onClick={() => setStatusFilter("INACTIVE")}
              className={`flex flex-col items-start rounded-xl sm:rounded-2xl border p-2 sm:p-4 text-left transition shadow-2xs min-w-[75px] sm:min-w-0 shrink-0 sm:shrink ${
                statusFilter === "INACTIVE" ? "border-slate-700 bg-slate-100 ring-2 ring-slate-700/20 dark:border-slate-500 dark:bg-slate-800" : "border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900"
              }`}
            >
              <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">Inactive</span>
              <span className="mt-0.5 sm:mt-1 text-base sm:text-2xl font-black text-slate-800 dark:text-slate-200">{stats.inactive}</span>
              <span className="hidden sm:block mt-1 text-[11px] text-slate-500 dark:text-slate-400">Needs activation</span>
            </button>

            <button
              type="button"
              onClick={() => setStatusFilter("UNDER_REVIEW")}
              className={`flex flex-col items-start rounded-xl sm:rounded-2xl border p-2 sm:p-4 text-left transition shadow-2xs min-w-[75px] sm:min-w-0 shrink-0 sm:shrink ${
                statusFilter === "UNDER_REVIEW" ? "border-amber-500 bg-amber-50/50 ring-2 ring-amber-500/20 dark:border-amber-600 dark:bg-amber-950/40" : "border-amber-200 bg-amber-50/20 dark:border-amber-900/60 dark:bg-amber-950/20"
              }`}
            >
              <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">Review</span>
              <span className="mt-0.5 sm:mt-1 text-base sm:text-2xl font-black text-amber-800 dark:text-amber-300">{stats.underReview}</span>
              <span className="hidden sm:block mt-1 text-[11px] text-amber-600 dark:text-amber-500">Verification</span>
            </button>

            <button
              type="button"
              onClick={() => setStatusFilter("DRAFT")}
              className={`flex flex-col items-start rounded-xl sm:rounded-2xl border p-2 sm:p-4 text-left transition shadow-2xs min-w-[75px] sm:min-w-0 shrink-0 sm:shrink ${
                statusFilter === "DRAFT" ? "border-slate-500 bg-slate-100 ring-2 ring-slate-500/20 dark:border-slate-600 dark:bg-slate-800" : "border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900"
              }`}
            >
              <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">Drafts</span>
              <span className="mt-0.5 sm:mt-1 text-base sm:text-2xl font-black text-slate-800 dark:text-slate-200">{stats.drafts}</span>
              <span className="hidden sm:block mt-1 text-[11px] text-slate-500 dark:text-slate-400">Unpublished</span>
            </button>
          </div>

          {/* Search, Filter Tabs & View Mode Switcher */}
          <div className="mb-4 sm:mb-6 flex flex-col gap-2.5 rounded-2xl border border-slate-200 bg-white p-2.5 sm:p-3.5 shadow-2xs sm:flex-row sm:items-center sm:justify-between dark:border-slate-800 dark:bg-slate-900">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by title, city, locality, or property ID..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2 sm:py-2.5 pl-9 sm:pl-10 pr-4 text-xs sm:text-sm text-slate-900 outline-none transition focus:border-rose-400 focus:bg-white focus:ring-2 focus:ring-rose-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:border-rose-500 dark:focus:bg-slate-800 dark:focus:ring-rose-500/20"
              />
            </div>

            {/* Status Filter Tabs & Layout switcher */}
            <div className="flex items-center justify-between gap-2 overflow-x-auto pb-0.5 no-scrollbar sm:justify-end">
              <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
                {(
                  [
                    { key: "ALL", label: "All" },
                    { key: "ACTIVE", label: "Active" },
                    { key: "INACTIVE", label: "Inactive" },
                    { key: "UNDER_REVIEW", label: "In Review" },
                    { key: "DRAFT", label: "Drafts" },
                    { key: "REJECTED", label: "Changes Needed" },
                  ] as const
                ).map((tab) => (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setStatusFilter(tab.key)}
                    className={`rounded-full px-2.5 sm:px-3 py-1 sm:py-1.5 text-[11px] sm:text-xs font-bold transition whitespace-nowrap ${
                      statusFilter === tab.key
                        ? "bg-slate-900 text-white shadow-xs dark:bg-slate-100 dark:text-slate-900"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-slate-200"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* View Toggle */}
              <div className="flex rounded-xl border border-slate-200 bg-slate-100 p-1 dark:border-slate-800 dark:bg-slate-800">
                <button
                  type="button"
                  title="Grid view"
                  onClick={() => setViewMode("grid")}
                  className={`rounded-lg p-1.5 transition ${viewMode === "grid" ? "bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-white" : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"}`}
                >
                  <LayoutGrid className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  title="Table view"
                  onClick={() => setViewMode("table")}
                  className={`rounded-lg p-1.5 transition ${viewMode === "table" ? "bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-white" : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"}`}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Listings Presentation */}
          {isInitialLoading ? (
            <div className="flex min-h-[360px] flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-white p-12 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <RefreshCw className="h-8 w-8 animate-spin text-rose-500" />
              <p className="mt-3 text-sm font-semibold text-slate-800 dark:text-slate-200">Loading your properties...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex min-h-[380px] flex-col items-center justify-center rounded-3xl border border-slate-200/80 bg-white p-10 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-rose-50 text-rose-600 shadow-inner dark:bg-rose-950/50 dark:text-rose-400">
                <Building2 className="h-8 w-8 text-rose-500 dark:text-rose-400" />
              </div>
              <h3 className="mt-4 text-lg font-bold text-slate-900 dark:text-white">
                {searchTerm || statusFilter !== "ALL" ? "No matching properties found" : "No properties listed yet"}
              </h3>
              <p className="mt-1.5 max-w-md text-sm text-slate-500 dark:text-slate-400">
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
                    className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-800 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                  >
                    Clear filters
                  </button>
                ) : (
                  <Link
                    href={scope === "org" ? `/propertyListing?scope=org${orgId ? `&orgId=${orgId}` : ""}` : "/propertyListing"}
                    className="inline-flex items-center gap-2 rounded-full bg-rose-600 px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-rose-200 transition hover:bg-rose-700 hover:shadow-lg dark:shadow-none"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Create your first listing</span>
                  </Link>
                )}
              </div>
            </div>
          ) : viewMode === "grid" ? (
            /* Grid View */
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {paginatedItems.map((item: any) => {
                const effectiveStatus = isSubscriptionExpired && item.status === "ACTIVE" ? "INACTIVE" : item.status;
                const cfg = statusConfig[effectiveStatus] || statusConfig.DRAFT;
                const StatusIcon = cfg.icon;
                const coverImage = item.media?.[0]?.url || "/placeholder-property.jpg";
                const locationStr = [item.locality, item.subLocality, item.cityName].filter(Boolean).join(", ");
                const isOrgProperty = Boolean(item.organizationId);
                const isItemActive = effectiveStatus === "ACTIVE";
                const canActivate = effectiveStatus === "INACTIVE" || effectiveStatus === "DRAFT";

                return (
                  <div
                    key={item.id}
                    className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:border-slate-300 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700"
                  >
                    {/* Media Thumbnail */}
                    <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
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

                      {/* Ownership Scope Tag */}
                      <span className="absolute bottom-3 left-3 flex items-center gap-1 rounded-md bg-slate-950/80 px-2 py-0.5 text-[11px] font-semibold text-white backdrop-blur-sm">
                        {isOrgProperty ? <Building2 className="h-3 w-3 text-rose-400" /> : <User className="h-3 w-3 text-sky-400" />}
                        {isOrgProperty ? "Organization" : "Personal"}
                      </span>
                    </div>

                    {/* Card Content */}
                    <div className="flex flex-1 flex-col p-3">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="line-clamp-1 text-base font-bold text-slate-950 dark:text-white group-hover:text-rose-600 dark:group-hover:text-rose-400">
                          {item.title || "Untitled property"}
                        </h3>
                      </div>

                      {locationStr && (
                        <p className="mt-1 flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                          <MapPin className="h-3.5 w-3.5 shrink-0 text-slate-400 dark:text-slate-500" />
                          <span className="truncate">{locationStr}</span>
                        </p>
                      )}

                      <p className="mt-1.5 text-base font-extrabold text-slate-900 dark:text-white">{formatPrice(item.price)}</p>

                      {/* Key Specs */}
                      <div className="mt-2 flex items-center gap-2 overflow-hidden rounded-lg bg-slate-50 px-2 py-1.5 text-[11px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                        {item.bedrooms ? (
                          <span className="inline-flex shrink-0 items-center gap-1 whitespace-nowrap">
                            <BedDouble className="h-3.5 w-3.5 text-slate-400" />
                            {item.bedrooms} BHK
                          </span>
                        ) : null}
                        {item.bathrooms ? (
                          <span className="inline-flex shrink-0 items-center gap-1 whitespace-nowrap border-l border-slate-200 pl-2 dark:border-slate-700">
                            <Bath className="h-3.5 w-3.5 text-slate-400" />
                            {item.bathrooms} Bath
                          </span>
                        ) : null}
                        {item.builtUpArea || item.carpetArea ? (
                          <span className="inline-flex min-w-0 items-center gap-1 whitespace-nowrap border-l border-slate-200 pl-2 dark:border-slate-700">
                            <Ruler className="h-3.5 w-3.5 text-slate-400" />
                            {item.builtUpArea || item.carpetArea} sq.ft
                          </span>
                        ) : null}
                      </div>

                      {/* Activate Action Prompt for Inactive/Draft Properties */}
                      {canActivate && (
                        <div className="mt-2 rounded-xl border border-emerald-500/20 bg-emerald-50/50 p-2 dark:border-emerald-500/20 dark:bg-emerald-950/20">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1">
                              <Zap className="h-3.5 w-3.5 text-emerald-600" />
                              Ready to Go Live
                            </span>
                            <button
                              type="button"
                              onClick={() => handleActivateClick(item)}
                              disabled={isUpdatingStatus}
                              className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600 px-3 py-1 text-xs font-black text-white shadow-sm transition hover:bg-emerald-700 active:scale-95 disabled:opacity-50"
                            >
                              <Zap className="h-3 w-3" />
                              <span>Activate (1 Credit)</span>
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Footer Actions */}
                      <div className="mt-2 flex items-center justify-between gap-2 border-t border-slate-100 pt-2 text-xs dark:border-slate-800">
                        <span className="text-[11px] text-slate-400 dark:text-slate-500">
                          {item.updatedAt ? `Updated ${new Date(item.updatedAt).toLocaleDateString()}` : `ID: #${item.id}`}
                        </span>

                        <div className="flex items-center gap-1.5">
                          <Link
                            href={`/properties/${item.id}`}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-50 hover:text-rose-600 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-rose-400"
                            title="View public page"
                          >
                            <Eye className="h-4 w-4" />
                          </Link>

                          <Link
                            href={`/propertyListing?id=${item.id}`}
                            className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-1.5 font-bold text-slate-800 shadow-sm transition hover:bg-slate-50 hover:text-rose-600 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 dark:hover:text-rose-400"
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                            <span>Edit</span>
                          </Link>

                          {/* Pause / Deactivate Button for Active Properties */}
                          {isItemActive && (
                            <button
                              type="button"
                              onClick={() => setDeactivateItem(item)}
                              title="Deactivate listing (Credit remains consumed, no slot swapping)"
                              className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-100 px-2.5 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-200 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-white"
                            >
                              <PowerOff className="h-3 w-3 text-slate-500" />
                              <span>Deactivate</span>
                            </button>
                          )}

                          {scope !== "org" && (
                            <button
                              type="button"
                              onClick={() => setDeleteConfirmId(item.id)}
                              className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-rose-100 bg-rose-50 text-rose-600 shadow-sm transition hover:bg-rose-100 hover:text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/50 dark:text-rose-400 dark:hover:bg-rose-900/60"
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
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-700 dark:text-slate-300">
                  <thead className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:bg-slate-800/80 dark:text-slate-400">
                    <tr>
                      <th className="px-4 py-3.5">Property</th>
                      <th className="px-4 py-3.5">Ownership Scope</th>
                      <th className="px-4 py-3.5">Location</th>
                      <th className="px-4 py-3.5">Price</th>
                      <th className="px-4 py-3.5">Status</th>
                      <th className="px-4 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {paginatedItems.map((item: any) => {
                      const effectiveStatus = isSubscriptionExpired && item.status === "ACTIVE" ? "INACTIVE" : item.status;
                      const cfg = statusConfig[effectiveStatus] || statusConfig.DRAFT;
                      const StatusIcon = cfg.icon;
                      const coverImage = item.media?.[0]?.url || "/placeholder-property.jpg";
                      const isOrgProperty = Boolean(item.organizationId);
                      const isItemActive = effectiveStatus === "ACTIVE";
                      const canActivate = effectiveStatus === "INACTIVE" || effectiveStatus === "DRAFT";

                      return (
                        <tr key={item.id} className="transition hover:bg-slate-50/60 dark:hover:bg-slate-800/50">
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
                                <p className="font-bold text-slate-900 dark:text-white line-clamp-1">{item.title || "Untitled property"}</p>
                                <p className="text-xs text-slate-400 dark:text-slate-500">ID: #{item.id}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3.5 text-xs font-semibold">
                            <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-1 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                              {isOrgProperty ? <Building2 className="h-3 w-3 text-rose-600 dark:text-rose-400" /> : <User className="h-3 w-3 text-sky-600 dark:text-sky-400" />}
                              {isOrgProperty ? "Organization" : "Personal"}
                            </span>
                          </td>
                          <td className="px-4 py-3.5 text-xs text-slate-600 dark:text-slate-400">
                            {[item.locality, item.cityName].filter(Boolean).join(", ") || "—"}
                          </td>
                          <td className="px-4 py-3.5 font-bold text-slate-900 dark:text-white">{formatPrice(item.price)}</td>
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
                              {/* Activate Listing Button in Table */}
                              {canActivate && (
                                <button
                                  type="button"
                                  onClick={() => handleActivateClick(item)}
                                  disabled={isUpdatingStatus}
                                  className="inline-flex items-center gap-1 rounded-full bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm transition hover:bg-emerald-700 active:scale-95 disabled:opacity-50"
                                >
                                  <Zap className="h-3 w-3" />
                                  <span>Activate (1 Credit)</span>
                                </button>
                              )}

                              {isItemActive && (
                                <button
                                  type="button"
                                  onClick={() => setDeactivateItem(item)}
                                  title="Deactivate listing (Credit remains consumed, no slot swapping)"
                                  className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600 transition hover:bg-slate-200 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400"
                                >
                                  <PowerOff className="h-3 w-3" />
                                  <span>Deactivate</span>
                                </button>
                              )}

                              <Link
                                href={`/properties/${item.id}`}
                                className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-50 hover:text-rose-600 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-rose-400"
                                title="View public page"
                              >
                                <Eye className="h-4 w-4" />
                              </Link>
                              <Link
                                href={`/propertyListing?id=${item.id}`}
                                className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-800 shadow-sm transition hover:bg-slate-50 hover:text-rose-600 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 dark:hover:text-rose-400"
                              >
                                <Edit3 className="h-3.5 w-3.5" />
                                <span>Edit</span>
                              </Link>
                              {scope !== "org" && (
                                <button
                                  type="button"
                                  onClick={() => setDeleteConfirmId(item.id)}
                                  className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-rose-100 bg-rose-50 text-rose-600 shadow-sm transition hover:bg-rose-100 hover:text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/50 dark:text-rose-400 dark:hover:bg-rose-900/60"
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
            <div className="mt-6 flex flex-col items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <span>
                  Showing <strong className="text-slate-800 dark:text-slate-200">{(currentPage - 1) * pageSize + 1}</strong> to{" "}
                  <strong className="text-slate-800 dark:text-slate-200">{Math.min(currentPage * pageSize, totalFilteredCount)}</strong> of{" "}
                  <strong className="text-slate-800 dark:text-slate-200">{totalFilteredCount}</strong> properties
                </span>
              </div>

              <div className="flex items-center gap-3">
                {/* Page Size Selector */}
                <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                  <span>Per page:</span>
                  <select
                    value={pageSize}
                    onChange={(e) => setPageSize(Number(e.target.value))}
                    className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-bold text-slate-800 outline-none focus:border-rose-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:focus:border-rose-500"
                  >
                    <option value={6} className="dark:bg-slate-800">6</option>
                    <option value={12} className="dark:bg-slate-800">12</option>
                    <option value={24} className="dark:bg-slate-800">24</option>
                  </select>
                </div>

                {/* Page Navigator */}
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-50 disabled:opacity-40 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                    title="First page"
                  >
                    <ChevronsLeft className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-50 disabled:opacity-40 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                    title="Previous page"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>

                  <span className="px-3 text-xs font-bold text-slate-800 dark:text-slate-200">
                    Page {currentPage} of {totalPages}
                  </span>

                  <button
                    type="button"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-50 disabled:opacity-40 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                    title="Next page"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={currentPage === totalPages}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-50 disabled:opacity-40 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
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

      {/* 1. Property Activation Confirmation Modal */}
      {activationItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl border border-slate-100 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 shadow-inner dark:bg-emerald-950/60 dark:text-emerald-400">
              <Zap className="h-6 w-6" />
            </div>

            <h3 className="mt-4 text-xl font-black text-slate-950 dark:text-white">
              Activate Property Listing
            </h3>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              You are about to activate: <strong className="text-slate-900 dark:text-white">{activationItem.title || `#${activationItem.id}`}</strong>
            </p>

            {/* Credit Cost Summary */}
            <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/60">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-300">
                <span>Active Package:</span>
                <span className="font-bold text-slate-900 dark:text-white">{activeSub?.plan?.name || "Listing Package"}</span>
              </div>
              <div className="mt-2 flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-300">
                <span>Deduction:</span>
                <span className="font-black text-rose-600 dark:text-rose-400">-1 Listing Credit</span>
              </div>
              <div className="mt-2 flex items-center justify-between border-t border-slate-200 pt-2 text-xs font-semibold text-slate-600 dark:border-slate-700 dark:text-slate-300">
                <span>Remaining Credits After:</span>
                <span className="font-black text-emerald-600 dark:text-emerald-400">
                  {Math.max(0, availableCredits - 1)} / {packageListingLimit}
                </span>
              </div>
            </div>

            {/* Strict Policy Alert (No Swapping) */}
            <div className="mt-4 flex items-start gap-3 rounded-2xl border border-amber-300 bg-amber-50/80 p-3.5 text-xs text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-300">
              <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
              <div>
                <p className="font-black">Strict Rule: No Slot Swapping Allowed</p>
                <p className="mt-0.5 leading-relaxed text-[11px] opacity-90">
                  Activating this property permanently consumes 1 listing credit from your package. If this property is later deactivated, rented, or marked sold, this credit <strong>cannot be refunded or swapped</strong> to another property.
                </p>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setActivationItem(null)}
                disabled={isUpdatingStatus}
                className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmActivate}
                disabled={isUpdatingStatus}
                className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-5 py-2 text-xs font-bold text-white shadow-md shadow-emerald-200 transition hover:bg-emerald-700 disabled:opacity-60 dark:shadow-none"
              >
                {isUpdatingStatus ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Zap className="h-3.5 w-3.5" />}
                <span>Confirm & Deduct 1 Credit</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Deactivation Warning Modal (Explains no credit refund / no swapping) */}
      {deactivateItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl border border-slate-100 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 shadow-inner dark:bg-amber-950/60 dark:text-amber-400">
              <PowerOff className="h-6 w-6" />
            </div>

            <h3 className="mt-4 text-xl font-black text-slate-950 dark:text-white">
              Deactivate Property Listing?
            </h3>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              Deactivating <strong className="text-slate-900 dark:text-white">{deactivateItem.title || `#${deactivateItem.id}`}</strong> will remove it from public search and buyer enquiries.
            </p>

            {/* Strict Notice */}
            <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-900 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300">
              <p className="font-black flex items-center gap-1.5">
                <AlertCircle className="h-4 w-4 text-rose-600" />
                No Slot Swapping & No Credit Refunds
              </p>
              <p className="mt-1 leading-relaxed text-[11px] opacity-90">
                The listing credit consumed when activating this property will <strong>NOT</strong> be refunded to your package balance. You cannot reuse this credit to activate a different property slot.
              </p>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeactivateItem(null)}
                disabled={isUpdatingStatus}
                className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
              >
                Keep Active
              </button>
              <button
                type="button"
                onClick={confirmDeactivate}
                disabled={isUpdatingStatus}
                className="inline-flex items-center gap-2 rounded-full bg-amber-600 px-5 py-2 text-xs font-bold text-white shadow-md shadow-amber-200 transition hover:bg-amber-700 disabled:opacity-60 dark:shadow-none"
              >
                {isUpdatingStatus ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <PowerOff className="h-3.5 w-3.5" />}
                <span>Deactivate Property</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Credits Exhausted Modal (Triggered when available credits = 0) */}
      {creditsExhaustedModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-slate-100 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 shadow-inner dark:bg-amber-950/60 dark:text-amber-400">
              <Lock className="h-7 w-7" />
            </div>

            <h3 className="mt-4 text-xl font-black text-slate-950 dark:text-white">
              Listing Credits Exhausted
            </h3>
            <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
              You have used all <strong>{packageListingLimit} listing credits</strong> included in your current package.
            </p>

            <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50/70 p-3.5 text-left text-xs text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-300">
              <p className="font-bold flex items-center gap-1.5">
                <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
                Slot Swapping Not Permitted
              </p>
              <p className="mt-0.5 text-[11px] leading-relaxed">
                Deactivating other properties does not refund credits. To activate additional properties, please upgrade or purchase a new listing package.
              </p>
            </div>

            <div className="mt-6 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setCreditsExhaustedModalOpen(false)}
                className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
              >
                Close
              </button>
              <Link
                href="/pricing"
                className="inline-flex items-center gap-2 rounded-full bg-rose-600 px-5 py-2 text-xs font-bold text-white shadow-md shadow-rose-200 transition hover:bg-rose-700 dark:shadow-none"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>View Packages & Pricing</span>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* 4. Subscription Expired Modal */}
      {subscriptionExpiredModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-slate-100 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 shadow-inner dark:bg-rose-950/60 dark:text-rose-400">
              <AlertCircle className="h-7 w-7" />
            </div>

            <h3 className="mt-4 text-xl font-black text-slate-950 dark:text-white">
              Subscription Expired
            </h3>
            <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
              Your subscription has expired. All properties are currently Inactive. Purchase a new package to receive listing credits and activate your properties.
            </p>

            <div className="mt-6 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setSubscriptionExpiredModalOpen(false)}
                className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
              >
                Cancel
              </button>
              <Link
                href="/pricing"
                className="inline-flex items-center gap-2 rounded-full bg-rose-600 px-5 py-2 text-xs font-bold text-white shadow-md shadow-rose-200 transition hover:bg-rose-700 dark:shadow-none"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>Renew Subscription</span>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* 5. Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-slate-100 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 shadow-inner dark:bg-rose-950/60 dark:text-rose-400">
              <Trash2 className="h-6 w-6" />
            </div>
            <h3 className="mt-4 text-lg font-bold text-slate-950 dark:text-white">Delete Property Listing?</h3>
            <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-400">
              Are you sure you want to delete this listing? This action cannot be undone and will permanently remove it from search and buyer shortlists.
            </p>
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                disabled={isDeleting}
                className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={isDeleting}
                className="inline-flex items-center gap-2 rounded-full bg-rose-600 px-5 py-2 text-xs font-bold text-white shadow-md shadow-rose-200 transition hover:bg-rose-700 disabled:opacity-60 dark:shadow-none"
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
    <Suspense fallback={<div className="min-h-screen bg-slate-50 p-8 text-center text-sm text-slate-500 dark:bg-slate-950 dark:text-slate-400">Loading properties...</div>}>
      <PropertiesContent />
    </Suspense>
  );
}
