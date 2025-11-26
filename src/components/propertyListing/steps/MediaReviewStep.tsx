import React from "react";
import { Card } from "@/components/ui/card";
import type { StepProps } from "./StepCommon";

export function MediaReviewStep({ form }: StepProps) {
  const mediaIds = form.watch("media.mediaIds") ?? [];
  const documentIds = form.watch("media.documentIds") ?? [];
  const summary = form.watch();

  const listingTitle = summary.meta.title || "Add a title";
  const price = summary.pricing.price ? `₹${summary.pricing.price.toLocaleString("en-IN")}` : "Set price";
  const location =
    summary.location.locality || summary.location.cityName
      ? `${summary.location.locality || ""}${summary.location.locality && summary.location.cityName ? ", " : ""}${summary.location.cityName || ""}`
      : "Add location";
  const area = summary.details.carpetArea ? `${summary.details.carpetArea} ${summary.details.carpetAreaUnit || "sq ft"}` : "Area TBD";
  const bedrooms = summary.details.bedrooms ?? "—";
  const bathrooms = summary.details.bathrooms ?? "—";
  const parking = summary.amenities.noOfParkings ?? "—";
  const furnishing = summary.amenities.furnishing || "Not set";
  const listingType = summary.context.listingType || "Set type";
  const subType = summary.context.propertySubTypeId || "Select subtype";
  const resCom = summary.context.resCom || "Category";

  return (
    <div className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">
        <Card className="border border-slate-100 bg-white p-5 shadow-xl">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-600">{listingType}</span>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">{resCom}</span>
            </div>
            <div className="text-right">
              <p className="text-2xl font-semibold text-slate-900">{price}</p>
              <p className="text-xs text-slate-500">Set price / sq ft if needed</p>
            </div>
          </div>

          <div className="mt-3">
            <p className="text-lg font-semibold text-slate-900">{listingTitle}</p>
            <p className="text-sm text-slate-600">{location}</p>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3 rounded-2xl border border-slate-100 bg-slate-50/80 p-3 text-center sm:grid-cols-4">
            <div>
              <p className="text-sm font-semibold text-slate-900">{area}</p>
              <p className="text-xs text-slate-600">Carpet area</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">{bedrooms}</p>
              <p className="text-xs text-slate-600">Bedrooms</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">{bathrooms}</p>
              <p className="text-xs text-slate-600">Bathrooms</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">{parking}</p>
              <p className="text-xs text-slate-600">Parking</p>
            </div>
          </div>
        </Card>

        <Card className="border border-slate-100 bg-white p-5 shadow-xl">
          <p className="text-sm font-semibold text-slate-800">Quick review</p>
          <div className="mt-3 space-y-2 text-sm text-slate-700">
            <ReviewRow label="Sub-type" value={subType} />
            <ReviewRow label="Furnishing" value={furnishing} />
            <ReviewRow label="Availability" value={summary.availability.availabilityStatus || "Set availability"} />
            <ReviewRow label="Media" value={mediaIds.length ? `${mediaIds.length} selected` : "Add photos/videos"} />
            <ReviewRow label="Documents" value={documentIds.length ? `${documentIds.length} added` : "Optional"} />
          </div>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="border border-slate-100 bg-white p-5 shadow-xl">
          <p className="text-sm font-semibold text-slate-800">Publish status</p>
          <div className="mt-3 flex flex-col gap-2 rounded-2xl border border-slate-100 bg-slate-50/80 p-3 text-sm text-slate-700">
            <ReviewRow label="Status" value={summary.publishOptions.status || "Draft"} />
            <ReviewRow label="QC" value={summary.publishOptions.qcRequired ? "Required" : "Skip QC"} />
            <ReviewRow label="Description" value={summary.meta.description ? "Added" : "Add details in property step"} />
          </div>
        </Card>

        <Card className="border border-slate-100 bg-white p-5 shadow-xl">
          <p className="text-sm font-semibold text-slate-800">Media & documents</p>
          <div className="mt-3 flex flex-col gap-2 rounded-2xl border border-slate-100 bg-slate-50/80 p-3 text-sm text-slate-700">
            <ReviewRow label="Photos/Videos" value={mediaIds.length ? `${mediaIds.length} selected` : "Add media in details step"} />
            <ReviewRow label="Documents" value={documentIds.length ? `${documentIds.length} added` : "Optional"} />
          </div>
        </Card>
      </div>
    </div>
  );
}

const ReviewRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-2">
    <span className="text-[11px] uppercase tracking-[0.15em] text-slate-500">{label}</span>
    <span className="truncate text-sm font-semibold text-slate-900">{value}</span>
  </div>
);
