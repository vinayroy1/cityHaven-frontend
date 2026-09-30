"use client";

import React from "react";
import { Pencil } from "lucide-react";
import { deriveConfiguration } from "@/features/propertyListing/formConfig/derive";
import type { PropertyListingFormValues } from "@/types/propertyListing.types";

const Row = ({ label, value }: { label: string; value?: React.ReactNode }) => {
  if (value === undefined || value === null || value === "" || (Array.isArray(value) && !value.length))
    return null;
  return (
    <div className="flex justify-between gap-4 py-1 text-sm">
      <span className="text-slate-500">{label}</span>
      <span className="text-right font-medium text-slate-800">{value}</span>
    </div>
  );
};

const Group = ({
  title,
  onEdit,
  children,
}: {
  title: string;
  onEdit: () => void;
  children: React.ReactNode;
}) => (
  <div className="rounded-2xl border border-slate-200 bg-white/80 p-4">
    <div className="mb-2 flex items-center justify-between">
      <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
      <button
        type="button"
        onClick={onEdit}
        className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
      >
        <Pencil className="h-3 w-3" /> Edit
      </button>
    </div>
    <div className="divide-y divide-slate-100">{children}</div>
  </div>
);

export function ReviewSummary({
  values,
  onEditStep,
}: {
  values: PropertyListingFormValues;
  onEditStep: (index: number) => void;
}) {
  const { context, location, details, pricing, amenities, meta } = values;
  const area =
    details.carpetArea || details.builtUpArea || details.plotArea || details.superBuiltUpArea;
  const areaUnit =
    details.carpetAreaUnit || details.builtUpAreaUnit || details.plotAreaUnit || "SQ_FT";

  return (
    <div className="space-y-3">
      <Group title="Basic details" onEdit={() => onEditStep(0)}>
        <Row label="Listing" value={context.listingType} />
        <Row label="Category" value={context.resCom} />
        <Row label="Type" value={context.propertySubTypeSlug} />
        <Row label="Configuration" value={deriveConfiguration(values)} />
        <Row label="Sub-category" value={context.propertySubCategorySlug} />
        <Row label="Workspace" value={context.organizationId ? `Organization #${context.organizationId}` : "Personal Account"} />
        <Row label="Posted as" value={context.postedAs} />
      </Group>

      <Group title="Location" onEdit={() => onEditStep(1)}>
        <Row label="City" value={location.cityName} />
        <Row label="Locality" value={location.locality} />
        <Row label="Address" value={location.address} />
      </Group>

      <Group title="Property profile" onEdit={() => onEditStep(2)}>
        <Row label="Title" value={meta.title} />
        <Row label="Area" value={area ? `${area} ${areaUnit}` : undefined} />
        <Row label="Bedrooms" value={details.bedrooms ?? undefined} />
        <Row label="Bathrooms" value={details.bathrooms ?? undefined} />
        <Row label="Furnishing" value={amenities.furnishing} />
        <Row label="Availability" value={values.availability.availabilityStatus} />
        <Row label="Ownership" value={amenities.ownershipType} />
      </Group>

      <Group title="Pricing & amenities" onEdit={() => onEditStep(3)}>
        <Row label="Price" value={pricing.price ? `₹ ${pricing.price.toLocaleString("en-IN")}` : undefined} />
        <Row label="Negotiable" value={pricing.priceNegotiable ? "Yes" : undefined} />
        <Row label="Amenities" value={amenities.amenityIds?.length ? `${amenities.amenityIds.length} selected` : undefined} />
      </Group>

      <Group title="Photos" onEdit={() => onEditStep(4)}>
        <Row label="Media" value={values.media.mediaIds?.length ? `${values.media.mediaIds.length} uploaded` : "None yet"} />
      </Group>
    </div>
  );
}
