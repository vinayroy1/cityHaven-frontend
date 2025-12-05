"use client";

import React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Edit3, MapPin, Trash2 } from "lucide-react";
import { useDeletePropertyMutation, useGetPropertyQuery } from "@/features/propertyListing/api";

export default function ManagePropertyPage() {
  const params = useParams();
  const router = useRouter();
  const propertyId = params?.id as string;
  const { data, isFetching } = useGetPropertyQuery(propertyId, { skip: !propertyId });
  const [deleteProperty] = useDeletePropertyMutation();

  const handleDelete = async () => {
    if (!confirm("Delete this listing? This cannot be undone.")) return;
    await deleteProperty(propertyId);
    router.push("/dashboard/properties");
  };

  const item = data || {};

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-8 sm:px-6">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 shadow-sm"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
          <div className="flex gap-2">
            <Link
              href={`/propertyListing?id=${propertyId}`}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 shadow-sm"
            >
              <Edit3 className="h-4 w-4" /> Edit
            </Link>
            <button
              type="button"
              onClick={handleDelete}
              className="inline-flex items-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700 shadow-sm"
            >
              <Trash2 className="h-4 w-4" /> Delete
            </button>
          </div>
        </div>

        {isFetching ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm">Loading property…</div>
        ) : (
          <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-xl font-semibold">{item.title || "Untitled property"}</h1>
              {item.status && <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">{item.status}</span>}
            </div>
            <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
              {item.cityName && (
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-4 w-4" /> {item.cityName}
                </span>
              )}
              {item.updatedAt && <span>Updated {new Date(item.updatedAt).toLocaleDateString()}</span>}
              {item.listingType && <span>{item.listingType}</span>}
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 text-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Pricing</p>
                <p className="mt-1 text-base font-semibold text-slate-900">{item.price ? `₹${item.price?.toLocaleString?.() || item.price}` : "—"}</p>
                {item.deposit ? <p className="text-xs text-slate-600">Deposit ₹{item.deposit}</p> : null}
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 text-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Location</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">{item.locality || item.subLocality || "—"}</p>
                <p className="text-xs text-slate-600">{item.address || ""}</p>
              </div>
            </div>
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 text-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Meta</p>
              <p className="text-sm text-slate-700">
                Bedrooms: {item.bedrooms ?? "—"} · Bathrooms: {item.bathrooms ?? "—"} · Area: {item.carpetArea ?? item.builtUpArea ?? "—"}{" "}
                {item.areaUnit || item.carpetAreaUnit || ""}
              </p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
