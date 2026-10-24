"use client";

import React, { useState } from "react";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { HeaderNav } from "@/app/homePage/components/HeaderNav";
import {
  useGetMyFlatmateListingsQuery,
  useGetMyFlatmateInterestsQuery,
  useUpdateFlatmateInterestStatusMutation,
  useArchiveFlatmateListingMutation,
} from "@/features/flatmates/api";
import type { FlatmateInterestStatus } from "@/types/flatmate.types";
import { CreditBoostButton } from "@/components/billing/CreditBoostButton";

export default function DashboardFlatmatesPage() {
  const [activeTab, setActiveTab] = useState<"listings" | "received" | "sent">("listings");

  const { data: listings = [], isLoading: isLoadingListings, refetch: refetchListings } = useGetMyFlatmateListingsQuery();
  const { data: interestsData, isLoading: isLoadingInterests, refetch: refetchInterests } = useGetMyFlatmateInterestsQuery();

  const [archiveListing, { isLoading: isArchiving }] = useArchiveFlatmateListingMutation();
  const [updateInterestStatus, { isLoading: isUpdatingStatus }] = useUpdateFlatmateInterestStatusMutation();

  const receivedInterests = interestsData?.received || [];
  const sentInterests = interestsData?.sent || [];

  const handleArchive = async (id: number) => {
    if (!confirm("Are you sure you want to archive this flatmate listing?")) return;
    try {
      await archiveListing(id).unwrap();
      toast.success("Listing archived successfully");
      refetchListings();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to archive listing");
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
                <span>Roommate Hub</span>
              </div>
              <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                My Flatmate Listings & Inquiries
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Manage your posted room requirements and connect directly with interested roommates.
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
              My Listings ({listings.length})
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

          {/* TAB 1: My Listings */}
          {activeTab === "listings" && (
            <div className="space-y-4">
              {isLoadingListings ? (
                <div className="p-8 text-center text-slate-500 flex flex-col items-center gap-2">
                  <Loader2 className="w-6 h-6 animate-spin text-rose-500" />
                  <span className="text-xs">Loading your listings...</span>
                </div>
              ) : listings.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {listings.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-3xl border border-slate-200/90 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between space-y-4"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Badge
                            className={
                              item.status === "ACTIVE"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300"
                                : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                            }
                          >
                            {item.status}
                          </Badge>
                          <span className="text-xs font-bold text-slate-900 dark:text-white">
                            {item.mode === "HAVE_ROOM"
                              ? `Rent: ₹${(item.rent ?? 0).toLocaleString("en-IN")}/mo`
                              : `Budget: ₹${(item.budgetMax ?? 0).toLocaleString("en-IN")}`}
                          </span>
                        </div>

                        <Link href={`/flatmates/${item.slug}`} className="block group">
                          <h3 className="font-bold text-base text-slate-900 group-hover:text-rose-600 dark:text-white line-clamp-1 transition">
                            {item.title}
                          </h3>
                        </Link>

                        <div className="flex items-center gap-1.5 text-xs text-slate-500">
                          <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                          <span>{item.locality ? `${item.locality}, ${item.cityName}` : item.cityName}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-3">
                        {item.status === "ACTIVE" && <CreditBoostButton targetType="FLATMATE" targetId={item.id} />}
                        <Link
                          href={`/flatmates/${item.slug}`}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 hover:text-rose-700"
                        >
                          <span>View Public Page</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>

                        <button
                          type="button"
                          onClick={() => handleArchive(item.id)}
                          className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-rose-600 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Archive</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center mx-auto">
                    <Home className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">
                    You haven&apos;t posted any flatmate listings yet
                  </h3>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    Whether you have an extra room in your flat or need to find roommates in your city, post for free.
                  </p>
                  <div className="pt-2">
                    <Link
                      href="/flatmates/post"
                      className="inline-flex items-center gap-1.5 rounded-full bg-rose-600 px-5 py-2 text-xs font-bold text-white shadow-md shadow-rose-600/20"
                    >
                      <PlusCircle className="w-4 h-4" /> Post Flatmate Requirement
                    </Link>
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
                      className="rounded-3xl border border-slate-200/90 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
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
                <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-2">
                  <HeartHandshake className="w-10 h-10 text-slate-400 mx-auto" />
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">
                    No inquiries received yet
                  </h3>
                  <p className="text-xs text-slate-500">
                    When room seekers connect with your listing, their messages will appear here.
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
                      className="rounded-3xl border border-slate-200/90 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
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
                <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-2">
                  <MessageSquare className="w-10 h-10 text-slate-400 mx-auto" />
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">
                    You haven&apos;t sent any roomie inquiries yet
                  </h3>
                  <p className="text-xs text-slate-500">
                    Browse active flatmate listings and introduce yourself to potential roommates.
                  </p>
                  <div className="pt-2">
                    <Link
                      href="/flatmate"
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
    </div>
  );
}
