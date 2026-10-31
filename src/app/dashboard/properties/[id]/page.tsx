"use client";

import React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Edit3, MapPin, Trash2, FileSignature, ExternalLink, Plus } from "lucide-react";
import { BackButton } from "@/components/common/BackButton";
import { useDeletePropertyMutation, useGetPropertyQuery } from "@/features/propertyListing/api";
import { useGetMyDocumentsQuery } from "@/features/documents/api";
import { HeaderNav } from "@/app/homePage/components/HeaderNav";

export default function ManagePropertyPage() {
  const params = useParams();
  const router = useRouter();
  const propertyId = params?.id as string;
  const { data, isFetching } = useGetPropertyQuery(propertyId, { skip: !propertyId });
  const { data: propertyDocs = [] } = useGetMyDocumentsQuery(
    { propertyId: Number(propertyId) },
    { skip: !propertyId }
  );
  const [deleteProperty] = useDeletePropertyMutation();

  const handleDelete = async () => {
    if (!confirm("Delete this listing? This cannot be undone.")) return;
    await deleteProperty(propertyId);
    router.push("/dashboard/properties");
  };

  const item = data || {};

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 transition-colors duration-150">
      <HeaderNav />
      <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-8 sm:px-6">
        <div className="flex items-center justify-between">
          <BackButton fallbackHref="/dashboard/properties" label="Back" variant="pill" />
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

            {/* Documents & Verification Records */}
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 text-sm space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Property Documents & Title Proofs
                  </p>
                  <p className="text-xs text-slate-600 mt-0.5">
                    {propertyDocs.length} document{propertyDocs.length === 1 ? "" : "s"} attached to this property
                  </p>
                </div>
                <Link
                  href={`/dashboard/documents?propertyId=${propertyId}`}
                  className="inline-flex items-center gap-1.5 rounded-full bg-slate-900 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-rose-600 transition"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Manage / Upload</span>
                </Link>
              </div>

              {propertyDocs.length > 0 ? (
                <div className="space-y-2 pt-1">
                  {propertyDocs.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between rounded-xl bg-white p-3 border border-slate-200/80 shadow-2xs"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <FileSignature className="h-4 w-4 text-emerald-600 shrink-0" />
                        <span className="text-xs font-semibold text-slate-900 truncate">
                          {doc.meta?.title || doc.type}
                        </span>
                        <span className="text-[10px] rounded-full bg-slate-100 px-2 py-0.5 text-slate-600">
                          {doc.type}
                        </span>
                      </div>
                      <a
                        href={doc.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-semibold text-rose-600 hover:text-rose-700 shrink-0 inline-flex items-center gap-1"
                      >
                        <span>View</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic">
                  No title deeds or NOCs attached yet. Linking ownership proof helps speed up verification and buyer trust.
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
