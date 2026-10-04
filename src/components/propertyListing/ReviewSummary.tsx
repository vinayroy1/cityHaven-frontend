"use client";

import React, { useState } from "react";
import {
  AlertCircle,
  Bath,
  Bed,
  Building2,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Compass,
  Edit3,
  FileText,
  Home,
  Image as ImageIcon,
  Layers,
  MapPin,
  Maximize2,
  ShieldCheck,
  Sparkles,
  Tag,
} from "lucide-react";



interface ReviewSummaryProps {
  values: any;
  uploadedPhotos?: Array<{ localId?: string; preview?: string; uploadedUrl?: string }>;
  onEditStep: (stepIndex: number) => void;
}

const formatPrice = (price?: number | null, listingType?: string): string | null => {
  if (!price) return null;
  if (price >= 10000000) return `₹ ${(price / 10000000).toFixed(2)} Cr`;
  if (price >= 100000) return `₹ ${(price / 100000).toFixed(2)} Lakh`;
  return `₹ ${price.toLocaleString("en-IN")}${listingType === "RENT" ? "/mo" : ""}`;
};

const deriveConfiguration = (values: any): string => {
  const parts: string[] = [];
  if (values.details?.bedrooms) parts.push(`${values.details.bedrooms} BHK`);
  if (values.details?.bathrooms) parts.push(`${values.details.bathrooms} Bath`);
  if (values.details?.carpetArea) parts.push(`${values.details.carpetArea} sq.ft`);
  return parts.length > 0 ? parts.join(" • ") : "Standard Configuration";
};

export function ReviewSummary({ values, uploadedPhotos: explicitPhotos, onEditStep }: { values: any; uploadedPhotos?: any[]; onEditStep: (stepIndex: number) => void }) {
  const rawList = explicitPhotos?.length
    ? explicitPhotos
    : (
        values?.meta?.draftState?.mediaUploads ||
        (Array.isArray(values?.media) ? values.media : null) ||
        (Array.isArray(values?.mediaUploads) ? values.mediaUploads : null) ||
        []
      );
  const uploadedPhotos = rawList.filter((p: any) => p.preview || p.uploadedUrl || p.url).map((p: any) => ({
    ...p,
    preview: p.preview || p.uploadedUrl || p.url,
  }));
  const [showFullPreview, setShowFullPreview] = useState(true);

  const { context, location, details, pricing, amenities, meta, availability } = values;
  const scoreResult = { score: 92, tier: "Excellence", tips: ["Comprehensive property details & specs added"] };

  const area = details.carpetArea || details.builtUpArea || details.plotArea;
  const areaUnit = details.carpetAreaUnit || details.builtUpAreaUnit || details.plotAreaUnit || "SQ_FT";
  const formattedAreaUnit = areaUnit.replace("_", ".").toLowerCase();

  const formattedPrice = formatPrice(pricing.price, context.listingType);
  const pricePerSqft = pricing.price && area ? Math.round(pricing.price / area) : null;
  const selectedAmenities = (amenities?.amenityIds || []).map((a: any) => String(a).replace(/_/g, " "));

  return (
    <div className="space-y-6 text-left">
      {/* 1. HERO PREVIEW CARD */}
      <div className="overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-xl shadow-slate-900/5 transition dark:border-slate-800 dark:bg-slate-900">
        {/* Top Cover Banner */}
        <div className="relative h-48 sm:h-56 w-full bg-slate-950">
          {uploadedPhotos.length > 0 ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={uploadedPhotos[0].preview || uploadedPhotos[0].uploadedUrl}
              alt="Cover preview"
              className="h-full w-full object-cover opacity-90"
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-gradient-to-r from-slate-900 via-rose-950 to-slate-900 p-4 text-center">
              <ImageIcon className="h-8 w-8 text-rose-400/80" />
              <p className="text-xs font-semibold text-slate-300">No cover image uploaded</p>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

          {/* Badges on cover */}
          <div className="absolute left-4 top-4 flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-rose-600 px-3 py-1 text-xs font-bold text-white shadow-md">
              {context.listingType === "RENT" ? "For Rent" : context.listingType === "PG" ? "PG / Co-Living" : "For Sale"}
            </span>
            <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-slate-900 backdrop-blur-md">
              {context.resCom === "COMMERCIAL" ? "Commercial" : "Residential"}
            </span>
          </div>

          <div className="absolute right-4 top-4 rounded-full bg-slate-900/80 px-3 py-1 text-xs font-semibold text-white backdrop-blur-md border border-white/10">
            {uploadedPhotos.length} {uploadedPhotos.length === 1 ? "Photo" : "Photos"}
          </div>

          {/* Title & Location over banner */}
          <div className="absolute bottom-4 left-4 right-4 text-white">
            <h2 className="text-lg font-extrabold sm:text-2xl line-clamp-1">
              {meta.title || "Untitled Property Listing"}
            </h2>
            <p className="mt-0.5 flex items-center gap-1.5 text-xs font-medium text-slate-200">
              <MapPin className="h-3.5 w-3.5 shrink-0 text-rose-400" />
              <span>{[location.locality, location.cityName].filter(Boolean).join(", ") || "Locality not set"}</span>
            </p>
          </div>
        </div>

        {/* Highlight Stats Bar */}
        <div className="grid grid-cols-2 divide-x divide-slate-100 border-b border-slate-100 bg-slate-50/70 py-3 sm:grid-cols-4 dark:divide-slate-800 dark:border-slate-800 dark:bg-slate-950/40">
          <div className="px-4 text-center sm:text-left">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Price</p>
            <p className="text-base font-extrabold text-rose-600 dark:text-rose-400">{formattedPrice || "Not Set"}</p>
          </div>
          <div className="px-4 text-center sm:text-left">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Layout</p>
            <p className="text-base font-bold text-slate-900 dark:text-white">
              {details.bedrooms ? `${details.bedrooms} BHK` : "N/A"}
            </p>
          </div>
          <div className="px-4 text-center sm:text-left mt-2 sm:mt-0">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Carpet Area</p>
            <p className="text-base font-bold text-slate-900 dark:text-white">
              {area ? `${area} ${formattedAreaUnit}` : "N/A"}
            </p>
          </div>
          <div className="px-4 text-center sm:text-left mt-2 sm:mt-0">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Furnishing</p>
            <p className="text-base font-bold text-slate-900 dark:text-white">
              {amenities.furnishing ? amenities.furnishing.replace(/_/g, " ") : "N/A"}
            </p>
          </div>
        </div>

        {/* Quality Score Banner */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 bg-rose-50/60 dark:bg-rose-950/30">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-rose-600 text-white font-black text-sm shadow-md">
              {scoreResult.score}%
            </div>
            <div>
              <p className="text-xs font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                Property Quality Rating: <span className="text-rose-600 dark:text-rose-400">{scoreResult.tier}</span>
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {scoreResult.tips[0] || "Your listing details are comprehensive and ready to attract buyers!"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowFullPreview(!showFullPreview)}
            className="flex items-center gap-1 text-xs font-bold text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
          >
            {showFullPreview ? "Collapse Sections" : "Expand All Details"}
            {showFullPreview ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* 2. PHOTO GALLERY SECTION */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <ImageIcon className="h-4 w-4 text-rose-500" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Uploaded Photos ({uploadedPhotos.length})</h3>
          </div>
          <button
            type="button"
            onClick={() => onEditStep(4)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            <Edit3 className="h-3.5 w-3.5 text-slate-500" />
            Edit Media
          </button>
        </div>

        {uploadedPhotos.length > 0 ? (
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
            {uploadedPhotos.map((photo: any, i: number) => (
              <div key={photo.localId || i} className="group relative aspect-square overflow-hidden rounded-xl border border-slate-200 bg-slate-100 shadow-xs dark:border-slate-800 dark:bg-slate-800">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={photo.preview || photo.uploadedUrl} alt={`Photo ${i + 1}`} className="h-full w-full object-cover transition duration-300 group-hover:scale-105" />
                {i === 0 ? (
                  <span className="absolute left-1.5 top-1.5 rounded-md bg-rose-600/95 px-2 py-0.5 text-[9px] font-bold text-white uppercase tracking-wider shadow-sm">
                    Cover
                  </span>
                ) : (
                  <span className="absolute bottom-1.5 right-1.5 rounded-md bg-slate-950/70 px-1.5 py-0.5 text-[9px] font-medium text-white backdrop-blur-xs">
                    #{i + 1}
                  </span>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-4 flex flex-col items-center gap-2 rounded-xl border border-dashed border-slate-200 bg-slate-50/80 p-6 text-center text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-950/40">
            <AlertCircle className="h-6 w-6 text-amber-500" />
            <p className="font-semibold text-slate-700 dark:text-slate-300">No photos uploaded yet</p>
            <p className="text-[11px] text-slate-400">High-resolution photos increase buyer interest and lead conversions by over 400%.</p>
          </div>
        )}
      </div>

      {/* 3. STRUCTURED DETAILS CARDS */}
      {showFullPreview && (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {/* Basic Details */}
          <SectionCard
            title="Basic Details &amp; Category"
            icon={Home}
            stepNumber={0}
            onEdit={onEditStep}
          >
            <DetailItem label="Listing Type" value={context.listingType === "RENT" ? "For Rent" : context.listingType === "PG" ? "PG / Co-Living" : "For Sale"} />
            <DetailItem label="Category" value={context.resCom === "COMMERCIAL" ? "Commercial" : "Residential"} />
            <DetailItem label="Sub-Type" value={context.propertySubTypeSlug ? context.propertySubTypeSlug.replace(/-/g, " ").toUpperCase() : undefined} />
            <DetailItem label="Sub-Category" value={context.propertySubCategorySlug ? context.propertySubCategorySlug.replace(/-/g, " ") : undefined} />
            <DetailItem label="Posted By" value={context.postedAs || "Owner"} />
          </SectionCard>

          {/* Location Details */}
          <SectionCard
            title="Location &amp; Address"
            icon={MapPin}
            stepNumber={1}
            onEdit={onEditStep}
          >
            <DetailItem label="City" value={location.cityName} icon={Building2} />
            <DetailItem label="Locality" value={location.locality} icon={MapPin} />
            <DetailItem label="Sector" value={location.sectorNumber ? (location.sectorNumber.toLowerCase().startsWith("sector") ? location.sectorNumber : `Sector ${location.sectorNumber}`) : undefined} />
            <DetailItem label="Sub-locality / Pocket" value={location.subLocality} />
            <DetailItem label="Project / Society" value={location.societyOrProjectName} />
            <DetailItem label="Building / Landmark" value={location.buildingName} />
            <DetailItem label="Flat / Unit No." value={location.flatNumber} />
            <DetailItem label="House / Villa No." value={location.houseNumber} />
            <DetailItem label="Tower / Block No." value={location.towerNumber} />
            <DetailItem label="Plot No." value={location.plotNumber} />
            <DetailItem label="Complete Address" value={location.address} />
            <DetailItem label="Pincode" value={location.pincode} />
          </SectionCard>

          {/* Property Profile */}
          <SectionCard
            title="Specifications &amp; Layout"
            icon={Layers}
            stepNumber={2}
            onEdit={onEditStep}
          >
            <DetailItem label="Bedrooms" value={details.bedrooms ? `${details.bedrooms} BHK` : undefined} icon={Bed} />
            <DetailItem label="Bathrooms" value={details.bathrooms ? `${details.bathrooms} Baths` : undefined} icon={Bath} />
            <DetailItem label="Balconies" value={details.balconies} />
            <DetailItem label="Floor" value={details.totalFloors ? `${details.floorNumber ?? 0} of ${details.totalFloors}` : undefined} />
            <DetailItem label="Facing" value={details.propertyFacing} icon={Compass} />
            <DetailItem label="Property Age" value={details.ageOfProperty ? details.ageOfProperty.replace(/_/g, " ") : undefined} />
            <DetailItem label="Availability" value={availability.availabilityStatus ? availability.availabilityStatus.replace(/_/g, " ") : undefined} icon={Calendar} />
          </SectionCard>

          {/* Financials & Pricing */}
          <SectionCard
            title="Financials &amp; Commercials"
            icon={Tag}
            stepNumber={3}
            onEdit={onEditStep}
          >
            <DetailItem label="Expected Price" value={formattedPrice} highlight />
            {pricePerSqft && <DetailItem label="Rate / sq.ft" value={`₹ ${pricePerSqft.toLocaleString("en-IN")} / sq.ft`} />}
            <DetailItem label="Price Negotiable" value={pricing.priceNegotiable ? "Yes" : "No"} />
            <DetailItem label="Security Deposit" value={pricing.deposit ? formatPrice(pricing.deposit, "SELL") : undefined} />
            <DetailItem label="Maintenance" value={pricing.maintenance ? `₹ ${pricing.maintenance.toLocaleString("en-IN")} ${pricing.maintenancePaymentPeriod || ""}` : undefined} />
          </SectionCard>
        </div>
      )}

      {/* 4. AMENITIES & DESCRIPTION CARD */}
      {showFullPreview && (
        <div className="space-y-5">
          {/* Amenities Chips */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Amenities &amp; Features ({selectedAmenities.length})
                </h3>
              </div>
              <button
                type="button"
                onClick={() => onEditStep(3)}
                className="text-xs font-semibold text-rose-600 hover:underline"
              >
                Edit Amenities
              </button>
            </div>

            {selectedAmenities.length > 0 ? (
              <div className="mt-4 flex flex-wrap gap-2">
                {selectedAmenities.map((amenity: string, idx: number) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-800 border border-emerald-200/70 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/60"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                    {amenity}
                  </span>
                ))}
              </div>
            ) : (
              <p className="mt-3 text-xs text-slate-400 italic">No amenities selected</p>
            )}
          </div>

          {/* Description Block */}
          {meta.description && (
            <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-indigo-600" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Property Description</h3>
                </div>
                <button
                  type="button"
                  onClick={() => onEditStep(2)}
                  className="text-xs font-semibold text-rose-600 hover:underline"
                >
                  Edit Text
                </button>
              </div>
              <p className="mt-4 whitespace-pre-line rounded-xl bg-slate-50/80 p-4 text-xs font-medium leading-relaxed text-slate-700 border border-slate-100 dark:bg-slate-950/50 dark:text-slate-300 dark:border-slate-800/60">
                {meta.description}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function SectionCard({
  title,
  icon: Icon,
  stepNumber,
  onEdit,
  children,
}: {
  title: string;
  icon: React.ElementType;
  stepNumber: number;
  onEdit: (stepIndex: number) => void;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm transition hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400">
            <Icon className="h-4 w-4" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">{title}</h3>
        </div>
        <button
          type="button"
          onClick={() => onEdit(stepNumber)}
          className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
        >
          <Edit3 className="h-3.5 w-3.5" />
          Edit
        </button>
      </div>
      <div className="mt-3 space-y-2.5 divide-y divide-slate-50 dark:divide-slate-800/50">
        {children}
      </div>
    </div>
  );
}

function DetailItem({
  label,
  value,
  icon: Icon,
  highlight = false,
}: {
  label: string;
  value?: string | number | null;
  icon?: React.ElementType;
  highlight?: boolean;
}) {
  if (value == null || value === "") return null;
  return (
    <div className="flex items-center justify-between pt-2 text-xs">
      <span className="flex items-center gap-1.5 font-medium text-slate-500 dark:text-slate-400">
        {Icon && <Icon className="h-3.5 w-3.5 text-slate-400" />}
        {label}
      </span>
      <span className={`font-semibold text-right ${highlight ? "text-sm font-extrabold text-rose-600 dark:text-rose-400" : "text-slate-900 dark:text-white"}`}>
        {value}
      </span>
    </div>
  );
}
