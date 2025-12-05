"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { Heart, MapPin, MessageCircle, PhoneCall, RefreshCw } from "lucide-react";
import { useFavoritesInfinite, useEnquiriesInfinite, useVisitsInfinite } from "@/features/propertyListing/useQueries";

export default function EnquiriesPage() {
  const [filter, setFilter] = useState<"saved" | "enquiries" | "visits">("saved");
  const favQuery = useFavoritesInfinite();
  const enquiriesQuery = useEnquiriesInfinite();
  const visitsQuery = useVisitsInfinite();

  const savedItems = useMemo(() => favQuery.items ?? [], [favQuery.items]);
  const enquiryItems = useMemo(() => enquiriesQuery.items ?? [], [enquiriesQuery.items]);
  const visitItems = useMemo(() => visitsQuery.items ?? [], [visitsQuery.items]);

  const isLoading =
    (filter === "saved" && favQuery.isFetching) || (filter === "enquiries" && enquiriesQuery.isFetching) || (filter === "visits" && visitsQuery.isFetching);

  const renderSaved = () => {
    if (isLoading) return <div className="p-6 text-sm text-slate-600">Loading saved homes…</div>;
    if (!savedItems.length) return <div className="p-6 text-sm text-slate-600">No saved homes yet. Start browsing and tap the heart to save.</div>;
    return (
      <div className="divide-y divide-slate-100">
        {savedItems.map((item: any) => (
          <div key={item.id} className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Heart className="h-4 w-4 text-rose-500" />
                <p className="text-base font-semibold text-slate-900">{item.title || "Untitled property"}</p>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
                {item.cityName && (
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" />
                    {item.cityName}
                  </span>
                )}
                {item.status && <span>{item.status}</span>}
                {item.price ? <span>₹{item.price.toLocaleString()}</span> : null}
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <Link
                href={`/properties/${item.id}`}
                className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-3 py-1.5 text-slate-800 transition hover:-translate-y-0.5"
              >
                View
              </Link>
              <button
                type="button"
                className="inline-flex items-center gap-1 rounded-full border border-rose-200 bg-rose-50 px-3 py-1.5 text-rose-700 transition hover:-translate-y-0.5"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderEnquiries = () => {
    if (isLoading) return <div className="p-6 text-sm text-slate-600">Loading enquiries…</div>;
    if (!enquiryItems.length) return <div className="p-6 text-sm text-slate-600">No enquiries yet. Contact a property to see it here.</div>;
    return (
      <div className="divide-y divide-slate-100">
        {enquiryItems.map((item: any) => (
          <div key={item.id} className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4 text-sky-600" />
                <p className="text-base font-semibold text-slate-900">{item.property?.title || "Property enquiry"}</p>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
                {item.property?.cityName && (
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" />
                    {item.property.cityName}
                  </span>
                )}
                <span className="font-semibold text-slate-800">{item.status ?? "Awaiting response"}</span>
                {item.updatedAt ? <span>Updated {new Date(item.updatedAt).toLocaleDateString()}</span> : null}
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <Link
                href={`/properties/${item.propertyId ?? item.id}`}
                className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-3 py-1.5 text-slate-800 transition hover:-translate-y-0.5"
              >
                View
              </Link>
              <button
                type="button"
                className="inline-flex items-center gap-1 rounded-full border border-sky-200 bg-sky-50 px-3 py-1.5 text-sky-700 transition hover:-translate-y-0.5"
              >
                Follow up
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderVisits = () => {
    if (isLoading) return <div className="p-6 text-sm text-slate-600">Loading visits…</div>;
    if (!visitItems.length) return <div className="p-6 text-sm text-slate-600">No visits scheduled yet.</div>;
    return (
      <div className="divide-y divide-slate-100">
        {visitItems.map((item: any) => (
          <div key={item.id} className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4 text-emerald-600" />
                <p className="text-base font-semibold text-slate-900">{item.property?.title || "Property visit"}</p>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
                {item.property?.cityName && (
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" />
                    {item.property.cityName}
                  </span>
                )}
                {item.scheduledAt ? <span>Scheduled {new Date(item.scheduledAt).toLocaleString()}</span> : null}
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <Link
                href={`/properties/${item.propertyId ?? item.id}`}
                className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-3 py-1.5 text-slate-800 transition hover:-translate-y-0.5"
              >
                View
              </Link>
              <button
                type="button"
                className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-emerald-700 transition hover:-translate-y-0.5"
              >
                Call back <PhoneCall className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Customer workspace</p>
            <h1 className="text-2xl font-semibold">Saved homes, enquiries, and visits</h1>
          </div>
          <button
            type="button"
            onClick={() => {
              if (filter === "saved") favQuery.refetch();
              if (filter === "enquiries") enquiriesQuery.refetch();
              if (filter === "visits") visitsQuery.refetch();
            }}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 shadow-sm"
          >
            <RefreshCw className="h-4 w-4" /> Refresh
          </button>
        </div>

        <div className="flex flex-wrap gap-2 text-sm font-semibold">
          <button
            type="button"
            onClick={() => setFilter("saved")}
            className={`rounded-full border px-3 py-1.5 transition ${filter === "saved" ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 bg-white text-slate-800"}`}
          >
            Saved
          </button>
          <button
            type="button"
            onClick={() => setFilter("enquiries")}
            className={`rounded-full border px-3 py-1.5 transition ${filter === "enquiries" ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 bg-white text-slate-800"}`}
          >
            Enquiries
          </button>
          <button
            type="button"
            onClick={() => setFilter("visits")}
            className={`rounded-full border px-3 py-1.5 transition ${filter === "visits" ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 bg-white text-slate-800"}`}
          >
            Visits
          </button>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          {filter === "saved" && renderSaved()}
          {filter === "enquiries" && renderEnquiries()}
          {filter === "visits" && renderVisits()}
        </div>
      </div>
    </main>
  );
}
