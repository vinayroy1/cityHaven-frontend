"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Heart,
  MapPin,
  RefreshCw,
  Search,
  Building2,
  Trash2,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  CheckCircle2,
  Filter,
  PhoneCall,
  BedDouble,
  Bath,
  Ruler,
} from "lucide-react";
import {
  useMyFavoritesQuery,
  useRemoveFavoriteMutation,
} from "@/features/propertyListing/api";
import { HeaderNav } from "@/app/homePage/components/HeaderNav";
import { ResultCard } from "@/app/propertySearch/components/ResultCard";

export default function FavoritesPage() {
  const router = useRouter();
  const { data, isLoading, isFetching, refetch } = useMyFavoritesQuery();
  const [removeFavorite, { isLoading: isRemoving }] = useRemoveFavoriteMutation();
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<"ALL" | "BUY" | "RENT" | "COMMERCIAL">("ALL");

  const rawItems = useMemo(() => data?.items ?? [], [data?.items]);

  const filteredItems = useMemo(() => {
    return rawItems.filter((item: any) => {
      if (!item) return false;
      const titleMatch =
        !searchTerm.trim() ||
        (item.title && item.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.cityName && item.cityName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.locality && item.locality.toLowerCase().includes(searchTerm.toLowerCase()));

      if (!titleMatch) return false;

      if (typeFilter === "BUY") return item.listingType === "SELL" || item.listingType === "BUY";
      if (typeFilter === "RENT") return item.listingType === "RENT";
      if (typeFilter === "COMMERCIAL") return item.resCom === "COMMERCIAL";
      return true;
    });
  }, [rawItems, searchTerm, typeFilter]);

  const handleRemove = async (e: React.MouseEvent, id: number) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await removeFavorite(id).unwrap();
    } catch (err) {
      console.error("Failed to remove favorite", err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 flex flex-col transition-colors duration-150">
      <HeaderNav />

      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
          {/* Top Breadcrumb & Header */}
          <div className="mb-4">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Dashboard</span>
            </Link>
          </div>

          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                <Heart className="h-4 w-4 fill-rose-500 text-rose-500" />
                <span>Personal Shortlist</span>
              </div>
              <h1 className="mt-1 text-2xl font-black tracking-tight text-slate-950 dark:text-white sm:text-3xl">
                My Liked Properties
              </h1>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                Keep track of properties you have saved, compare pricing, and contact owners.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => refetch()}
                disabled={isFetching}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-60"
              >
                <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin text-rose-600" : ""}`} />
                <span>Refresh</span>
              </button>
              <Link
                href="/propertySearch"
                className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
              >
                <Search className="h-4 w-4" />
                <span>Explore more</span>
              </Link>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by title, city, or locality in saved homes..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-4 text-sm text-slate-900 outline-none transition focus:border-rose-400 focus:bg-white focus:ring-2 focus:ring-rose-100"
              />
            </div>

            <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto">
              {(
                [
                  { key: "ALL", label: "All Types" },
                  { key: "BUY", label: "For Sale" },
                  { key: "RENT", label: "For Rent" },
                  { key: "COMMERCIAL", label: "Commercial" },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setTypeFilter(tab.key)}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition ${
                    typeFilter === tab.key
                      ? "bg-slate-900 text-white shadow-sm"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Content Area */}
          {isLoading ? (
            <div className="flex min-h-[360px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center shadow-sm">
              <RefreshCw className="h-8 w-8 animate-spin text-rose-500" />
              <p className="mt-3 text-sm font-semibold text-slate-800">Loading your saved properties...</p>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="flex min-h-[380px] flex-col items-center justify-center rounded-3xl border border-slate-200/80 bg-white p-10 text-center shadow-sm">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-rose-50 text-rose-500 shadow-inner">
                <Heart className="h-8 w-8 text-rose-400" />
              </div>
              <h3 className="mt-4 text-lg font-bold text-slate-900">
                {searchTerm ? "No saved homes match your search" : "Your shortlist is empty"}
              </h3>
              <p className="mt-1.5 max-w-md text-sm text-slate-500">
                {searchTerm
                  ? "Try clearing the search query or adjusting your type filter."
                  : "Discover properties you love while browsing, tap the heart icon on any card, and they'll appear right here."}
              </p>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                {searchTerm ? (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchTerm("");
                      setTypeFilter("ALL");
                    }}
                    className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-800 hover:bg-slate-50"
                  >
                    Clear search filter
                  </button>
                ) : (
                  <Link
                    href="/propertySearch"
                    className="inline-flex items-center gap-2 rounded-full bg-rose-600 px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-rose-200 transition hover:bg-rose-700 hover:shadow-lg"
                  >
                    <span>Browse Properties</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                <span>
                  Showing {filteredItems.length} {filteredItems.length === 1 ? "saved property" : "saved properties"}
                </span>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredItems.map((item: any) => (
                  <div key={item.id} className="relative group">
                    <ResultCard
                      id={item.id}
                      title={item.title}
                      subtitle={[item.locality, item.subLocality, item.cityName].filter(Boolean).join(" · ")}
                      price={item.price ? `₹${item.price.toLocaleString("en-IN")}` : "Price on request"}
                      area={
                        item.builtUpArea
                          ? `${item.builtUpArea} ${item.builtUpAreaUnit || "sq.ft"}`
                          : item.carpetArea
                            ? `${item.carpetArea} ${item.carpetAreaUnit || "sq.ft"}`
                            : undefined
                      }
                      owner={item.postedAs || "Owner"}
                      ownerId={item.ownerId ?? item.createdById ?? undefined}
                      bedrooms={item.bedrooms}
                      bathrooms={item.bathrooms}
                      type={item.propertySubType?.name || item.propertyType?.name}
                      listingType={item.listingType}
                      resCom={item.resCom}
                      isNew={false}
                      isVerified={item.isVerified ?? false}
                      posterBadge={item.postedAs}
                      images={item.media?.map((m: any) => m.url).filter(Boolean) ?? []}
                    />
                    {/* Quick remove button */}
                    <button
                      type="button"
                      title="Remove from saved"
                      onClick={(e) => handleRemove(e, item.id)}
                      className="absolute right-12 top-3 z-30 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-slate-600 shadow-md backdrop-blur transition hover:bg-rose-50 hover:text-rose-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
