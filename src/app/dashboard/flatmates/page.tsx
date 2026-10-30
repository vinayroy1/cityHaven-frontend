"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Users,
  PlusCircle,
  Home,
  MessageSquare,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  MapPin,
  Trash2,
  ExternalLink,
  Loader2,
  ArrowRight,
  Phone,
  Mail,
  User,
  HeartHandshake,
  Search,
  PauseCircle,
  PlayCircle,
  Edit3,
  Sparkles,
  AlertTriangle,
  RotateCcw,
  IndianRupee,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";
import { HeaderNav } from "@/app/homePage/components/HeaderNav";
import {
  useGetMyFlatmateListingsQuery,
  useGetMyFlatmateInterestsQuery,
  useUpdateFlatmateInterestStatusMutation,
  useArchiveFlatmateListingMutation,
  flatmatesApi,
} from "@/features/flatmates/api";
import type { FlatmateListing, FlatmateInterestStatus } from "@/types/flatmate.types";
import { CreditBoostButton } from "@/components/billing/CreditBoostButton";
import { FlatmateEditModal } from "@/components/flatmates/FlatmateEditModal";
import { SeekerAvatarPlaceholder } from "@/components/flatmates/SeekerAvatarPlaceholder";
import { isRealUserPhoto } from "@/components/flatmates/FlatmateCard";

export default function DashboardFlatmatesPage() {
  const [activeTab, setActiveTab] = useState<"listings" | "received" | "sent">("listings");
  const [modeFilter, setModeFilter] = useState<"ALL" | "NEED_ROOM" | "BUDDY_UP" | "HAVE_ROOM">("ALL");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "PAUSED" | "MATCHED" | "ARCHIVED">("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Edit modal state
  const [editingListing, setEditingListing] = useState<FlatmateListing | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Delete / Archive confirmation modal state
  const [deletingListing, setDeletingListing] = useState<FlatmateListing | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const { data: listings = [], isLoading: isLoadingListings, refetch: refetchListings } = useGetMyFlatmateListingsQuery();
  const { data: interestsData, isLoading: isLoadingInterests, refetch: refetchInterests } = useGetMyFlatmateInterestsQuery();

  const [updateListing, { isLoading: isUpdatingListing }] =
    flatmatesApi.endpoints.updateFlatmateListing.useMutation();
  const [archiveListing, { isLoading: isArchiving }] = useArchiveFlatmateListingMutation();
  const [updateInterestStatus, { isLoading: isUpdatingStatus }] = useUpdateFlatmateInterestStatusMutation();

  const receivedInterests = interestsData?.received || [];
  const sentInterests = interestsData?.sent || [];

  // Summary counts
  const totalCount = listings.length;
  const activeCount = listings.filter((l) => l.status === "ACTIVE").length;
  const pausedCount = listings.filter((l) => l.status === "PAUSED").length;
  const matchedCount = listings.filter((l) => l.status === "MATCHED").length;

  // Filtered listings
  const filteredListings = useMemo(() => {
    return listings.filter((item) => {
      if (modeFilter !== "ALL" && item.mode !== modeFilter) return false;
      if (statusFilter !== "ALL" && item.status !== statusFilter) return false;
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const titleMatch = item.title?.toLowerCase().includes(query);
        const cityMatch = item.cityName?.toLowerCase().includes(query);
        const locMatch = item.locality?.toLowerCase().includes(query);
        if (!titleMatch && !cityMatch && !locMatch) return false;
      }
      return true;
    });
  }, [listings, modeFilter, statusFilter, searchQuery]);

  // Toggle pause vs active status
  const handleToggleStatus = async (id: number, newStatus: "ACTIVE" | "PAUSED" | "MATCHED") => {
    try {
      await updateListing({ id, data: { status: newStatus } }).unwrap();
      const statusLabel =
        newStatus === "ACTIVE"
          ? "Listing is now live on Awasio!"
          : newStatus === "PAUSED"
          ? "Listing paused. It is now hidden from search."
          : "Listing marked as roommate found!";
      toast.success(statusLabel);
      refetchListings();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to update listing status");
    }
  };

  // Perform archive or permanent delete
  const handleConfirmDelete = async (permanent: boolean) => {
    if (!deletingListing) return;
    try {
      await archiveListing({ id: deletingListing.id, permanent }).unwrap();
      toast.success(permanent ? "Listing permanently deleted" : "Listing archived successfully");
      setIsDeleteDialogOpen(false);
      setDeletingListing(null);
      refetchListings();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to delete listing");
    }
  };

  const handleStatusChange = async (id: number, status: FlatmateInterestStatus) => {
    try {
      await updateInterestStatus({ id, status }).unwrap();
      toast.success(`Inquiry marked as ${status.toLowerCase()}`);
      refetchInterests();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to update inquiry status");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 flex flex-col transition-colors duration-150">
      <HeaderNav />

      <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl space-y-6">
          {/* Dashboard Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/80 dark:border-slate-800 pb-5">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-xs font-bold w-fit">
                <Users className="w-3.5 h-3.5" />
                <span>Roommate Hub & Control Center</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                My Flatmates & Co-Living
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Manage your seeker profiles, room postings, edit details, pause or reactivate listings, and connect with interested roommates.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <Link
                href="/flatmates/post"
                className="inline-flex items-center gap-1.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs px-5 py-2.5 shadow-md shadow-rose-600/20 transition active:scale-95"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Post Flatmate Need</span>
              </Link>
            </div>
          </div>

          {/* Quick Summary Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Total Postings</span>
              <p className="mt-1 text-2xl font-black text-slate-900 dark:text-white">{totalCount}</p>
            </div>
            <div className="rounded-2xl border border-emerald-200/80 bg-emerald-50/50 p-4 shadow-2xs dark:border-emerald-900/50 dark:bg-emerald-950/20">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Live / Active
              </span>
              <p className="mt-1 text-2xl font-black text-emerald-700 dark:text-emerald-300">{activeCount}</p>
            </div>
            <div className="rounded-2xl border border-amber-200/80 bg-amber-50/50 p-4 shadow-2xs dark:border-amber-900/50 dark:bg-amber-950/20">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">Paused / Inactive</span>
              <p className="mt-1 text-2xl font-black text-amber-700 dark:text-amber-300">{pausedCount}</p>
            </div>
            <div className="rounded-2xl border border-sky-200/80 bg-sky-50/50 p-4 shadow-2xs dark:border-sky-900/50 dark:bg-sky-950/20">
              <span className="text-[11px] font-bold uppercase tracking-wider text-sky-700 dark:text-sky-400">Inquiries Received</span>
              <p className="mt-1 text-2xl font-black text-sky-700 dark:text-sky-300">{receivedInterests.length}</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800/80 w-fit">
            <button
              type="button"
              onClick={() => setActiveTab("listings")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                activeTab === "listings"
                  ? "bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-white"
                  : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              }`}
            >
              My Postings ({listings.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("received")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === "received"
                  ? "bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-white"
                  : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              }`}
            >
              <span>Received Inquiries</span>
              {receivedInterests.length > 0 && (
                <span className="w-4 h-4 rounded-full bg-rose-600 text-white text-[10px] flex items-center justify-center font-bold">
                  {receivedInterests.length}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("sent")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                activeTab === "sent"
                  ? "bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-white"
                  : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              }`}
            >
              Sent Inquiries ({sentInterests.length})
            </button>
          </div>

          {/* TAB 1: My Listings & Control Panel */}
          {activeTab === "listings" && (
            <div className="space-y-4">
              {/* Filter and Search Toolbar */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-2xs dark:bg-slate-900 dark:border-slate-800">
                {/* Mode Filter Pills */}
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[11px] font-bold text-slate-500 mr-1 hidden sm:inline">Type:</span>
                  {[
                    { key: "ALL", label: "All" },
                    { key: "NEED_ROOM", label: "Seekers" },
                    { key: "BUDDY_UP", label: "Buddy Up" },
                    { key: "HAVE_ROOM", label: "Have Room" },
                  ].map((m) => (
                    <button
                      key={m.key}
                      type="button"
                      onClick={() => setModeFilter(m.key as any)}
                      className={`px-3 py-1 rounded-full text-xs font-bold transition ${
                        modeFilter === m.key
                          ? "bg-rose-600 text-white shadow-xs"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>

                {/* Status Filter & Search */}
                <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as any)}
                    className="rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
                  >
                    <option value="ALL">All Statuses</option>
                    <option value="ACTIVE">Live (Active)</option>
                    <option value="PAUSED">Paused</option>
                    <option value="MATCHED">Matched</option>
                    <option value="ARCHIVED">Archived</option>
                  </select>

                  <div className="relative w-full sm:w-48">
                    <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
                    <Input
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search title, city..."
                      className="rounded-xl pl-8 pr-2.5 py-1 text-xs h-8"
                    />
                  </div>
                </div>
              </div>

              {isLoadingListings ? (
                <div className="p-12 text-center text-slate-500 flex flex-col items-center gap-2">
                  <Loader2 className="w-7 h-7 animate-spin text-rose-500" />
                  <span className="text-xs">Loading your listings...</span>
                </div>
              ) : filteredListings.length > 0 ? (
                <div className="space-y-4">
                  {filteredListings.map((item) => {
                    const isPlace = item.mode === "HAVE_ROOM";
                    const photos = item.photos || [];
                    const hasRealPhoto =
                      photos.some(isRealUserPhoto) || isRealUserPhoto(item.profile?.profilePhoto);
                    const displayPhoto = photos.find(isRealUserPhoto) || (isRealUserPhoto(item.profile?.profilePhoto) ? item.profile?.profilePhoto : null);

                    return (
                      <div
                        key={item.id}
                        className={`rounded-3xl border bg-white p-5 shadow-xs transition dark:bg-slate-900 ${
                          item.isBoosted
                            ? "border-amber-300 ring-2 ring-amber-400/30 dark:border-amber-700/60"
                            : item.status === "ACTIVE"
                            ? "border-slate-200 hover:border-rose-300 dark:border-slate-800"
                            : item.status === "PAUSED"
                            ? "border-amber-200/90 bg-amber-50/20 dark:border-amber-900/40 dark:bg-amber-950/10"
                            : "border-slate-200/80 opacity-80 dark:border-slate-800"
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                          {/* Visual Avatar / Photo + Details */}
                          <div className="flex items-start gap-4">
                            {/* Thumbnail */}
                            <div className="relative w-20 h-24 sm:w-24 sm:h-28 rounded-2xl overflow-hidden border border-slate-100 bg-slate-100 dark:border-slate-800 dark:bg-slate-800 shrink-0">
                              {hasRealPhoto && displayPhoto ? (
                                <img
                                  src={displayPhoto}
                                  alt={item.title}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <SeekerAvatarPlaceholder
                                  displayName={item.profile?.displayName || item.title}
                                  gender={item.profile?.gender}
                                  mode={item.mode}
                                />
                              )}
                              <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded-md bg-slate-950/80 text-white text-[9px] font-bold backdrop-blur-xs">
                                {item.mode === "HAVE_ROOM" ? "Host" : item.mode === "BUDDY_UP" ? "Buddy" : "Seeker"}
                              </span>
                            </div>

                            {/* Info */}
                            <div className="space-y-1.5 flex-1 min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <Badge
                                  className={
                                    item.status === "ACTIVE"
                                      ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 flex items-center gap-1"
                                      : item.status === "PAUSED"
                                      ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300"
                                      : item.status === "MATCHED"
                                      ? "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/60 dark:text-sky-300"
                                      : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                                  }
                                >
                                  {item.status === "ACTIVE" && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />}
                                  {item.status === "ACTIVE"
                                    ? "Live on Awasio"
                                    : item.status === "PAUSED"
                                    ? "Paused (Hidden)"
                                    : item.status === "MATCHED"
                                    ? "Roommate Found"
                                    : item.status}
                                </Badge>

                                {item.isBoosted && (
                                  <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-transparent flex items-center gap-1 shadow-xs font-bold text-[10px]">
                                    <Sparkles className="w-3 h-3 fill-amber-200 stroke-amber-100" />
                                    <span>⚡ Featured Boost</span>
                                  </Badge>
                                )}

                                <span className="text-xs font-black text-rose-600 dark:text-rose-400">
                                  {isPlace
                                    ? `Rent: ₹${(item.rent ?? 0).toLocaleString("en-IN")}/mo`
                                    : item.budgetMin && item.budgetMax
                                    ? `Budget: ₹${item.budgetMin.toLocaleString("en-IN")} - ₹${item.budgetMax.toLocaleString("en-IN")}/mo`
                                    : item.budgetMax
                                    ? `Budget: Up to ₹${item.budgetMax.toLocaleString("en-IN")}/mo`
                                    : "Flexible Budget"}
                                </span>
                              </div>

                              <Link href={`/flatmates/${item.slug}`} className="block group">
                                <h3 className="font-extrabold text-base text-slate-900 group-hover:text-rose-600 dark:text-white line-clamp-1 transition">
                                  {item.title}
                                </h3>
                              </Link>

                              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                                <span className="inline-flex items-center gap-1 font-medium">
                                  <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                                  <span>{item.locality ? `${item.locality}, ${item.cityName}` : item.cityName}</span>
                                </span>

                                {item.roomType && (
                                  <span className="font-medium text-slate-600 dark:text-slate-300">
                                    • {item.roomType}
                                  </span>
                                )}

                                {item.furnishing && (
                                  <span className="text-slate-400">
                                    • {item.furnishing}
                                  </span>
                                )}
                              </div>

                              {/* Badges */}
                              <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[11px]">
                                {item.profile?.diet && (
                                  <span className="rounded-md bg-slate-100 px-2 py-0.5 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                                    {item.profile.diet}
                                  </span>
                                )}
                                {item.petsAllowed && (
                                  <span className="rounded-md bg-emerald-50 text-emerald-700 px-2 py-0.5 dark:bg-emerald-950/40 dark:text-emerald-300">
                                    🐾 Pet Friendly
                                  </span>
                                )}
                                {!item.smokingAllowed && (
                                  <span className="rounded-md bg-slate-100 px-2 py-0.5 text-slate-500 dark:bg-slate-800">
                                    🚭 Non-Smoker
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Top Right Boost Button */}
                          <div className="shrink-0 flex sm:flex-col items-end gap-2">
                            {item.status === "ACTIVE" && (
                              <CreditBoostButton
                                targetType="FLATMATE"
                                targetId={item.id}
                                isBoosted={item.isBoosted}
                                boostEndsAt={item.boostEndsAt}
                                onSuccess={() => refetchListings()}
                              />
                            )}
                          </div>
                        </div>

                        {/* Control Actions Bottom Bar */}
                        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 dark:border-slate-800 pt-3.5 mt-4">
                          <div className="flex flex-wrap items-center gap-2">
                            {/* Pause / Resume Button */}
                            {item.status === "ACTIVE" ? (
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => handleToggleStatus(item.id, "PAUSED")}
                                disabled={isUpdatingListing}
                                className="rounded-full text-xs font-bold border-amber-300 text-amber-700 hover:bg-amber-50 dark:border-amber-800 dark:text-amber-300"
                              >
                                <PauseCircle className="w-3.5 h-3.5 mr-1" />
                                Pause / Deactivate
                              </Button>
                            ) : item.status === "PAUSED" ? (
                              <Button
                                type="button"
                                size="sm"
                                onClick={() => handleToggleStatus(item.id, "ACTIVE")}
                                disabled={isUpdatingListing}
                                className="rounded-full text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white"
                              >
                                <PlayCircle className="w-3.5 h-3.5 mr-1" />
                                Activate / Go Live
                              </Button>
                            ) : null}

                            {/* Edit Listing */}
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setEditingListing(item);
                                setIsEditModalOpen(true);
                              }}
                              className="rounded-full text-xs font-bold border-slate-200 dark:border-slate-700"
                            >
                              <Edit3 className="w-3.5 h-3.5 mr-1" />
                              Edit
                            </Button>

                            {/* Mark as Matched / Roommate Found */}
                            {item.status === "ACTIVE" && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => handleToggleStatus(item.id, "MATCHED")}
                                disabled={isUpdatingListing}
                                className="rounded-full text-xs font-medium text-slate-600 hover:text-emerald-700 dark:text-slate-400"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                                Found Roommate
                              </Button>
                            )}
                          </div>

                          <div className="flex items-center gap-3">
                            <Link
                              href={`/flatmates/${item.slug}`}
                              className="inline-flex items-center gap-1 text-xs font-bold text-rose-600 hover:text-rose-700"
                            >
                              <span>View Public Page</span>
                              <ExternalLink className="w-3.5 h-3.5" />
                            </Link>

                            <button
                              type="button"
                              onClick={() => {
                                setDeletingListing(item);
                                setIsDeleteDialogOpen(true);
                              }}
                              className="inline-flex items-center gap-1 text-xs font-medium text-slate-400 hover:text-rose-600 transition"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Delete</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center mx-auto">
                    <Home className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">
                    {searchQuery || modeFilter !== "ALL" || statusFilter !== "ALL"
                      ? "No flatmate listings match your filters"
                      : "You haven't posted any flatmate listings yet"}
                  </h3>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    {searchQuery || modeFilter !== "ALL" || statusFilter !== "ALL"
                      ? "Try resetting your search query or status filter to see all your posted listings."
                      : "Whether you need a room in a new city or have an extra bedroom to fill, post for free on Awasio."}
                  </p>
                  <div className="pt-2">
                    {searchQuery || modeFilter !== "ALL" || statusFilter !== "ALL" ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSearchQuery("");
                          setModeFilter("ALL");
                          setStatusFilter("ALL");
                        }}
                        className="rounded-full text-xs font-bold"
                      >
                        <RotateCcw className="w-3.5 h-3.5 mr-1" />
                        Reset Filters
                      </Button>
                    ) : (
                      <Link
                        href="/flatmates/post"
                        className="inline-flex items-center gap-1.5 rounded-full bg-rose-600 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-rose-600/20"
                      >
                        <PlusCircle className="w-4 h-4" /> Post Flatmate Requirement
                      </Link>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Received Inquiries */}
          {activeTab === "received" && (
            <div className="space-y-4">
              {isLoadingInterests ? (
                <div className="p-8 text-center text-slate-500 flex flex-col items-center gap-2">
                  <Loader2 className="w-6 h-6 animate-spin text-rose-500" />
                  <span className="text-xs">Loading inquiries...</span>
                </div>
              ) : receivedInterests.length > 0 ? (
                <div className="space-y-3">
                  {receivedInterests.map((interest) => (
                    <div
                      key={interest.id}
                      className="rounded-3xl border border-slate-200/90 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="flex items-start gap-3.5">
                        <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-rose-500 to-amber-500 text-white font-bold flex items-center justify-center shrink-0">
                          {interest.sender?.name ? interest.sender.name[0].toUpperCase() : "U"}
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-slate-900 dark:text-white">
                              {interest.sender?.name || "Room Seeker"}
                            </span>
                            <Badge
                              variant="outline"
                              className={
                                interest.status === "ACCEPTED"
                                  ? "border-emerald-300 text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40"
                                  : interest.status === "DECLINED"
                                  ? "border-rose-300 text-rose-700 bg-rose-50 dark:bg-rose-950/40"
                                  : "border-amber-300 text-amber-700 bg-amber-50 dark:bg-amber-950/40"
                              }
                            >
                              {interest.status}
                            </Badge>
                          </div>

                          {interest.message && (
                            <p className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                              &ldquo;{interest.message}&rdquo;
                            </p>
                          )}

                          {interest.status === "ACCEPTED" && interest.sender?.mobileNumber && (
                            <div className="flex items-center gap-3 pt-1 text-xs font-semibold text-emerald-600">
                              <span className="flex items-center gap-1">
                                <Phone className="w-3.5 h-3.5" /> {interest.sender.mobileNumber}
                              </span>
                              {interest.sender.email && (
                                <span className="flex items-center gap-1 text-slate-600">
                                  <Mail className="w-3.5 h-3.5" /> {interest.sender.email}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Status Action Buttons */}
                      {interest.status === "PENDING" && (
                        <div className="flex items-center gap-2 shrink-0">
                          <Button
                            size="sm"
                            onClick={() => handleStatusChange(interest.id, "ACCEPTED")}
                            className="rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-4"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Accept & Connect
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleStatusChange(interest.id, "DECLINED")}
                            className="rounded-full text-xs text-rose-600 hover:bg-rose-50 border-rose-200"
                          >
                            <XCircle className="w-3.5 h-3.5 mr-1" /> Decline
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-2">
                  <HeartHandshake className="w-10 h-10 text-slate-400 mx-auto" />
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">
                    No inquiries received yet
                  </h3>
                  <p className="text-xs text-slate-500">
                    When room seekers connect with your listing, their messages and contact details will appear here.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Sent Inquiries */}
          {activeTab === "sent" && (
            <div className="space-y-4">
              {isLoadingInterests ? (
                <div className="p-8 text-center text-slate-500 flex flex-col items-center gap-2">
                  <Loader2 className="w-6 h-6 animate-spin text-rose-500" />
                  <span className="text-xs">Loading sent inquiries...</span>
                </div>
              ) : sentInterests.length > 0 ? (
                <div className="space-y-3">
                  {sentInterests.map((interest) => (
                    <div
                      key={interest.id}
                      className="rounded-3xl border border-slate-200/90 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          <Link
                            href={interest.listing?.slug ? `/flatmates/${interest.listing.slug}` : "#"}
                            className="font-bold text-sm text-slate-900 hover:text-rose-600 dark:text-white"
                          >
                            {interest.listing?.title || "Flatmate Listing"}
                          </Link>
                          <Badge variant="outline">{interest.status}</Badge>
                        </div>

                        {interest.message && (
                          <p className="text-xs text-slate-500 italic">
                            Your message: &ldquo;{interest.message}&rdquo;
                          </p>
                        )}

                        {interest.status === "ACCEPTED" && interest.listing?.contact?.mobileNumber && (
                          <div className="flex flex-wrap items-center gap-3 rounded-xl bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                            <span className="flex items-center gap-1"><Phone className="h-3.5 w-3.5" />{interest.listing.contact.mobileNumber}</span>
                            {interest.listing.contact.email && <span className="flex items-center gap-1"><Mail className="h-3.5 w-3.5" />{interest.listing.contact.email}</span>}
                          </div>
                        )}
                      </div>

                      {interest.status === "PENDING" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleStatusChange(interest.id, "WITHDRAWN")}
                          className="rounded-full text-xs"
                        >
                          Withdraw Interest
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-2">
                  <MessageSquare className="w-10 h-10 text-slate-400 mx-auto" />
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">
                    You haven&apos;t sent any roomie inquiries yet
                  </h3>
                  <p className="text-xs text-slate-500">
                    Browse active flatmate listings and introduce yourself to potential roommates.
                  </p>
                  <div className="pt-2">
                    <Link
                      href="/flatmates?mode=NEED_ROOM"
                      className="inline-flex items-center gap-1 rounded-full bg-rose-600 px-5 py-2 text-xs font-bold text-white shadow-md shadow-rose-600/20"
                    >
                      Explore Flatmates
                    </Link>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Edit Listing Modal */}
      <FlatmateEditModal
        listing={editingListing}
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingListing(null);
        }}
        onSuccess={() => refetchListings()}
      />

      {/* Delete / Archive Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={(open) => !open && setIsDeleteDialogOpen(false)}>
        <DialogContent className="max-w-md rounded-3xl p-6">
          <DialogHeader className="space-y-2">
            <div className="w-11 h-11 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <DialogTitle className="text-lg font-extrabold text-slate-900 dark:text-white">
              Remove Flatmate Listing
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              How would you like to handle &ldquo;{deletingListing?.title}&rdquo;?
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-3">
            <button
              type="button"
              onClick={() => handleConfirmDelete(false)}
              disabled={isArchiving}
              className="w-full text-left p-3.5 rounded-2xl border border-slate-200 hover:border-amber-300 hover:bg-amber-50/40 dark:border-slate-800 dark:hover:border-amber-900 transition flex items-start gap-3"
            >
              <PauseCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-white block">
                  Archive Listing (Recommended)
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block leading-tight">
                  Hides the listing from public search. Your inquiries and data are preserved and you can reactivate anytime.
                </span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleConfirmDelete(true)}
              disabled={isArchiving}
              className="w-full text-left p-3.5 rounded-2xl border border-rose-200 hover:border-rose-400 hover:bg-rose-50/40 dark:border-rose-950 dark:hover:border-rose-800 transition flex items-start gap-3"
            >
              <Trash2 className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-bold text-rose-600 dark:text-rose-400 block">
                  Permanently Delete
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block leading-tight">
                  Completely erases this listing and all its inquiries. This action cannot be undone.
                </span>
              </div>
            </button>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              className="rounded-full text-xs w-full"
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
