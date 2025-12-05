"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MapPin, RefreshCw, Trash2, Edit3, Eye, Plus } from "lucide-react";
import { useDeletePropertyMutation, useMyPropertiesQuery } from "@/features/propertyListing/api";

type ListingStatus = "ACTIVE" | "DRAFT" | "UNDER_REVIEW" | "REJECTED" | string;

const statusLabels: Record<ListingStatus, string> = {
  ACTIVE: "Active",
  DRAFT: "Draft",
  UNDER_REVIEW: "Under review",
  REJECTED: "Needs changes",
};

const statusColors: Record<ListingStatus, string> = {
  ACTIVE: "bg-emerald-50 text-emerald-700 border-emerald-200",
  DRAFT: "bg-slate-50 text-slate-700 border-slate-200",
  UNDER_REVIEW: "bg-amber-50 text-amber-700 border-amber-200",
  REJECTED: "bg-rose-50 text-rose-700 border-rose-200",
};

export default function DashboardPropertiesPage() {
  const router = useRouter();
  const { data: listings = [], isFetching, refetch } = useMyPropertiesQuery();
  const [deleteProperty] = useDeletePropertyMutation();
  const [statusFilter, setStatusFilter] = useState<ListingStatus | "ALL">("ALL");

  const filtered = useMemo(() => {
    if (statusFilter === "ALL") return listings;
    return listings.filter((item: any) => item.status === statusFilter);
  }, [listings, statusFilter]);

  const handleDelete = async (id: number | string) => {
    if (!confirm("Are you sure you want to delete this listing?")) return;
    await deleteProperty(id);
    refetch();
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">My listings</p>
            <h1 className="text-2xl font-semibold">Manage properties</h1>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => refetch()}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 shadow-sm"
            >
              <RefreshCw className="h-4 w-4" /> Refresh
            </button>
            <Link
              href="/propertyListing"
              className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm"
            >
              <Plus className="h-4 w-4" /> Create listing
            </Link>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 text-sm font-semibold">
          {(["ALL", "ACTIVE", "DRAFT", "UNDER_REVIEW", "REJECTED"] as const).map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setStatusFilter(status)}
              className={`rounded-full border px-3 py-1.5 transition ${
                statusFilter === status ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 bg-white text-slate-800"
              }`}
            >
              {status === "ALL" ? "All" : statusLabels[status] ?? status}
            </button>
          ))}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          {isFetching ? (
            <div className="p-6 text-sm text-slate-600">Loading your listings…</div>
          ) : filtered.length === 0 ? (
            <div className="p-6 text-sm text-slate-600">No listings found. Create your first property to get started.</div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filtered.map((item: any) => {
                const badgeColor = statusColors[item.status as ListingStatus] || "bg-slate-50 text-slate-700 border-slate-200";
                return (
                  <div key={item.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-base font-semibold text-slate-900">{item.title || "Untitled property"}</p>
                        <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${badgeColor}`}>
                          {statusLabels[item.status as ListingStatus] ?? item.status ?? "Draft"}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
                        {item.cityName && (
                          <span className="inline-flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5" />
                            {item.cityName}
                          </span>
                        )}
                        {item.price ? <span>₹{item.price?.toLocaleString?.() || item.price}</span> : null}
                        {item.updatedAt ? <span>Updated {new Date(item.updatedAt).toLocaleDateString()}</span> : null}
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-sm">
                      <button
                        type="button"
                        onClick={() => router.push(`/dashboard/properties/${item.id}`)}
                        className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-3 py-1.5 text-slate-800 transition hover:-translate-y-0.5"
                      >
                        <Eye className="h-4 w-4" /> View
                      </button>
                      <button
                        type="button"
                        onClick={() => router.push(`/propertyListing?id=${item.id}`)}
                        className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-3 py-1.5 text-slate-800 transition hover:-translate-y-0.5"
                      >
                        <Edit3 className="h-4 w-4" /> Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(item.id)}
                        className="inline-flex items-center gap-1 rounded-full border border-rose-200 bg-rose-50 px-3 py-1.5 text-rose-700 transition hover:-translate-y-0.5"
                      >
                        <Trash2 className="h-4 w-4" /> Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
