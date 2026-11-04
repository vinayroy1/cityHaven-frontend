"use client";
/**
 * Final review for the listing wizard.
 *  1. "How buyers will see it": a preview card shaped like the real search result.
 *  2. "Before you post": live completeness score plus actionable fixes (each jumps to its step).
 *  3. Compact summary rows per section with a working Edit link.
 */
import React, { useState } from "react";
import {
  AlertCircle,
  Bath,
  BedDouble,
  Building2,
  Camera,
  CheckCircle2,
  ChevronDown,
  FileText,
  Home,
  IndianRupee,
  Layers,
  Lock,
  MapPin,
  Maximize2,
  Pencil,
  Sofa,
  Sparkles,
} from "lucide-react";
import { cn } from "@/components/ui/utils";
import { PROPERTY_SUBTYPES } from "@/constants/backend-schema";
import { getBrokerageDisplay } from "@/lib/propertyListing/formatBrokerage";
import { amenityOptions } from "@/features/propertyListing/constants";

/** Wizard step ids (see formConfig/steps). */
export type ReviewStepId = "basic" | "location" | "profile" | "features" | "pricing" | "media";

type Photo = { localId?: string; preview?: string; uploadedUrl?: string; url?: string; type?: string; uploading?: boolean };

const inr = (n?: number | null) => {
  if (!n) return null;
  if (n >= 1e7) return `₹${Number((n / 1e7).toFixed(2))} Cr`;
  if (n >= 1e5) return `₹${Number((n / 1e5).toFixed(2))} L`;
  return `₹${n.toLocaleString("en-IN")}`;
};
const pretty = (s?: string | null) =>
  s ? s.replace(/[_-]/g, " ").toLowerCase().replace(/(^|\s)\S/g, (c) => c.toUpperCase()) : undefined;

export function ReviewSummary({
  values,
  score,
  onEditStep,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  values: any;
  score?: number;
  onEditStep: (step: ReviewStepId) => void;
}) {
  const { context = {}, location = {}, details = {}, pricing = {}, amenities = {}, meta = {}, availability = {} } = values ?? {};
  const photos: Photo[] = ((meta?.draftState?.mediaUploads as Photo[] | undefined) ?? [])
    .map((p) => ({ ...p, preview: p.preview || p.uploadedUrl || p.url }))
    .filter((p) => p.preview);
  const imageCount = photos.filter((p) => !p.type?.startsWith("video")).length;

  const isRent = context.listingType === "RENT";
  const isPg = context.listingType === "PG";
  const area = details.carpetArea || details.builtUpArea || details.plotArea;
  const areaUnit = (details.carpetAreaUnit || details.builtUpAreaUnit || details.plotAreaUnit || "SQ_FT").replace("_", ".").toLowerCase();
  const price = inr(pricing.price);
  const perSqft = pricing.price && area && !isRent && !isPg ? Math.round(pricing.price / area) : null;
  const subType = context.propertySubTypeSlug
    ? (PROPERTY_SUBTYPES.find((s) => s.slug === context.propertySubTypeSlug)?.name ?? pretty(context.propertySubTypeSlug))
    : undefined;
  const amenityLabels: string[] = (amenities?.amenityIds || []).map(
    (a: string) => amenityOptions.find((o) => o.slug === a)?.label ?? pretty(String(a)) ?? String(a),
  );
  const publicPlace = [location.societyOrProjectName, location.locality, location.cityName].filter(Boolean).join(", ");
  const unitBits = [location.flatNumber, location.houseNumber, location.towerNumber, location.plotNumber].filter(Boolean);
  const floor = details.floorNumber
    ? `${pretty(String(details.floorNumber))}${details.totalFloors ? ` of ${details.totalFloors}` : ""}`
    : undefined;
  const pgRoom = isPg
    ? details.pricingBasis === "PER_ROOM"
      ? `${details.maxPersonsInRoom ?? 1}-person room`
      : pretty(details.sharingType) || (details.sharingCapacity ? `${details.sharingCapacity} sharing` : "Shared bed")
    : undefined;

  const quickFacts = [
    isPg ? pgRoom : details.bedrooms ? `${details.bedrooms} BHK` : null,
    area ? `${area} ${areaUnit}` : null,
    pretty(amenities.furnishing),
    floor ? `Floor ${floor}` : null,
  ].filter(Boolean) as string[];

  // Actionable fixes, most valuable first.
  const tips: { text: string; step: ReviewStepId }[] = [];
  if (imageCount === 0) tips.push({ text: "Add photos: listings with photos get up to 5× more enquiries", step: "media" });
  else if (imageCount < 4) tips.push({ text: `Add ${4 - imageCount} more photo${4 - imageCount === 1 ? "" : "s"} (living room, kitchen, bedroom, view)`, step: "media" });
  if (!meta.description || String(meta.description).length < 80) tips.push({ text: "Write a short description (what's nearby, who it suits)", step: "media" });
  if (amenityLabels.length < 3) tips.push({ text: "Select amenities like parking, lift, power backup", step: "pricing" });
  if (!amenities.furnishing && !isPg) tips.push({ text: "Add furnishing status", step: "features" });
  if (isRent && !pricing.deposit) tips.push({ text: "Add the security deposit", step: "pricing" });
  const pct = typeof score === "number" ? score : null;
  const tier = pct === null ? null : pct >= 85 ? "Excellent" : pct >= 65 ? "Good" : "Needs work";

  return (
    <div className="space-y-4 text-left">
      <div className="flex items-center gap-2 pt-2">
        <span className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Final check</span>
        <span className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
      </div>

      {/* 1. Buyer preview */}
      <section>
        <p className="mb-2 text-sm font-bold text-slate-900 dark:text-white">How buyers will see your listing</p>
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <button type="button" onClick={() => onEditStep("media")} className="relative block aspect-[16/10] w-full bg-slate-100 dark:bg-slate-800">
            {photos[0] ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={photos[0].preview} alt="Cover photo" className="h-full w-full object-cover" />
            ) : (
              <span className="flex h-full w-full flex-col items-center justify-center gap-1.5 text-slate-500">
                <Camera className="h-8 w-8" />
                <span className="text-sm font-semibold">Add a cover photo</span>
                <span className="text-xs">Tap to add photos</span>
              </span>
            )}
            <span className="absolute left-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-bold text-slate-900 shadow-sm">
              {isRent ? "For rent" : isPg ? "PG / Co-living" : "For sale"}
            </span>
            {photos.length > 0 && (
              <span className="absolute bottom-3 right-3 inline-flex items-center gap-1 rounded-full bg-black/65 px-2.5 py-1 text-[11px] font-semibold text-white">
                <Camera className="h-3 w-3" /> {photos.length}
              </span>
            )}
          </button>
          {photos.length > 1 && (
            <div className="flex gap-1.5 overflow-x-auto px-3 pt-3 [scrollbar-width:none]">
              {photos.slice(1, 7).map((p, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={p.localId || i} src={p.preview} alt="" className="h-12 w-16 shrink-0 rounded-lg object-cover" />
              ))}
            </div>
          )}
          <div className="p-4">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-slate-950 dark:text-white">{price ?? "Price not set"}</span>
              {price && (isRent || isPg) && <span className="text-sm text-slate-500">/month</span>}
              {perSqft && <span className="text-xs text-slate-500">· ₹{perSqft.toLocaleString("en-IN")}/sq.ft</span>}
            </div>
            <h3 className="mt-1 line-clamp-2 text-base font-bold text-slate-900 dark:text-white">{meta.title || "Your listing title"}</h3>
            <p className="mt-1 flex items-center gap-1 text-sm text-slate-500">
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{publicPlace || "Location not set"}</span>
            </p>
            {quickFacts.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {quickFacts.map((f) => (
                  <span key={f} className="rounded-lg bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                    {f}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 2. Readiness */}
      <section className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-3">
          {pct !== null && <ScoreRing pct={pct} />}
          <div className="min-w-0">
            <p className="text-sm font-bold text-slate-900 dark:text-white">
              {tips.length === 0 ? "Your listing looks great 🎉" : "Before you post"}
            </p>
            <p className="text-xs text-slate-500">
              {tier ? `Listing quality: ${tier}. ` : ""}
              {tips.length === 0 ? "Everything buyers look for is filled in." : "Quick fixes that bring more enquiries:"}
            </p>
          </div>
        </div>
        {tips.length > 0 && (
          <ul className="mt-3 space-y-1.5">
            {tips.slice(0, 4).map((t) => (
              <li key={t.text}>
                <button
                  type="button"
                  onClick={() => onEditStep(t.step)}
                  className="flex w-full items-center gap-2 rounded-xl bg-amber-50 px-3 py-2.5 text-left text-sm text-amber-900 transition hover:bg-amber-100 dark:bg-amber-950/40 dark:text-amber-200"
                >
                  <Sparkles className="h-4 w-4 shrink-0 text-amber-500" />
                  <span className="flex-1">{t.text}</span>
                  <span className="shrink-0 text-xs font-bold">Fix →</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* 3. Details */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <p className="border-b border-slate-100 px-4 py-3 text-sm font-bold text-slate-900 dark:border-slate-800 dark:text-white">Your details</p>

        <Row icon={Home} title="Property type" step="basic" onEdit={onEditStep}
          summary={[isRent ? "For rent" : isPg ? "PG" : "For sale", context.resCom === "COMMERCIAL" ? "Commercial" : "Residential", subType].filter(Boolean).join(" · ")}>
          <Item label="Posted as" value={pretty(context.postedAs) || "Owner"} />
          {context.listingType === "SELL" && (
            <Item label="Transaction" value={context.saleType === "NEW_BOOKING" ? "New booking" : context.saleType === "RESALE" ? "Resale" : undefined} />
          )}
          <Item label="Category" value={pretty(context.propertySubCategorySlug)} />
        </Row>

        <Row icon={MapPin} title="Location" step="location" onEdit={onEditStep} summary={publicPlace || "Not set"}>
          <Item label="Sub-locality" value={location.subLocality} />
          <Item label="Sector" value={location.sectorNumber} />
          <Item label="Building / landmark" value={location.buildingName} />
          <Item label="Pincode" value={location.pincode} />
          {(unitBits.length > 0 || location.address) && (
            <div className="mt-2 rounded-xl bg-slate-50 p-3 dark:bg-slate-800/60">
              <p className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200">
                <Lock className="h-3.5 w-3.5" /> Private: shown only after a buyer unlocks your contact
              </p>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{location.address || unitBits.join(", ")}</p>
            </div>
          )}
        </Row>

        <Row icon={Layers} title={isPg ? "Room & rules" : "Size & layout"} step="profile" onEdit={onEditStep}
          summary={quickFacts.slice(0, 3).join(" · ") || "Not set"}>
          {isPg ? (
            <>
              <Item label="For" value={pretty(details.pgFor)} />
              <Item label="Room" value={pgRoom} />
              <Item label="Beds / rooms free" value={details.availableBeds ?? details.totalRoomsAvailable} />
              <Item label="Food" value={pretty(details.foodOption)} />
              <Item label="Electricity" value={pretty(details.electricityType)} />
              <Item label="Gate closing" value={pretty(details.gateClosingTime)} />
            </>
          ) : (
            <>
              <Item icon={BedDouble} label="Bedrooms" value={details.bedrooms ? `${details.bedrooms} BHK` : undefined} />
              <Item icon={Bath} label="Bathrooms" value={details.bathrooms} />
              <Item label="Balconies" value={details.balconies} />
              <Item icon={Maximize2} label="Area" value={area ? `${area} ${areaUnit}` : undefined} />
              <Item icon={Building2} label="Floor" value={floor} />
            </>
          )}
        </Row>

        <Row icon={Sofa} title="Features" step="features" onEdit={onEditStep}
          summary={[pretty(amenities.furnishing), pretty(availability.availabilityStatus)].filter(Boolean).join(" · ") || "Not set"}>
          <Item label="Availability" value={pretty(availability.availabilityStatus)} />
          <Item label="Available from" value={availability.availableFrom} />
          <Item label="Property age" value={pretty(availability.ageOfProperty)} />
          <Item label="Parking" value={amenities.parkingAvailable ? `Yes${amenities.noOfParkings ? ` (${amenities.noOfParkings})` : ""}` : undefined} />
        </Row>

        <Row icon={IndianRupee} title="Price & amenities" step="pricing" onEdit={onEditStep}
          summary={[price ? `${price}${isRent || isPg ? "/mo" : ""}` : "Price not set", amenityLabels.length ? `${amenityLabels.length} amenities` : null].filter(Boolean).join(" · ")}>
          <Item label="Negotiable" value={pricing.priceNegotiable ? "Yes" : undefined} />
          <Item label="Deposit" value={inr(pricing.deposit)} />
          <Item label="Maintenance" value={pricing.maintenance ? `${inr(pricing.maintenance)} ${pretty(pricing.maintenancePaymentPeriod) ?? ""}`.trim() : undefined} />
          {context.postedAs === "AGENT" && (
            <Item label="Brokerage" value={getBrokerageDisplay(pricing.brokerage, pricing.brokerageType, pricing.brokerageNegotiable).fullText} />
          )}
          {amenityLabels.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {amenityLabels.map((a) => (
                <span key={a} className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
                  <CheckCircle2 className="h-3 w-3" /> {a}
                </span>
              ))}
            </div>
          )}
        </Row>

        <Row icon={FileText} title="Photos & description" step="media" onEdit={onEditStep}
          summary={`${imageCount} photo${imageCount === 1 ? "" : "s"}${meta.description ? " · description added" : " · no description"}`}>
          {meta.description ? (
            <p className="whitespace-pre-line text-sm leading-relaxed text-slate-600 dark:text-slate-300">{meta.description}</p>
          ) : (
            <p className="flex items-center gap-1.5 text-sm text-slate-500">
              <AlertCircle className="h-4 w-4 text-amber-500" /> No description yet
            </p>
          )}
        </Row>
      </section>

      {/* 4. What happens next */}
      <section className="rounded-2xl bg-slate-900 p-4 text-white dark:bg-slate-800">
        <p className="text-sm font-bold">What happens after you post</p>
        <ol className="mt-2 space-y-1.5 text-xs text-slate-300">
          <li>1. We quickly check your listing (usually within a few hours).</li>
          <li>2. It goes live in search. Your phone number and exact address stay private.</li>
          <li>3. Enquiries arrive in your <b className="text-white">Leads</b> inbox. Reply fast to earn a reply-speed badge.</li>
        </ol>
      </section>
    </div>
  );
}

function ScoreRing({ pct }: { pct: number }) {
  const r = 20;
  const c = 2 * Math.PI * r;
  const color = pct >= 85 ? "#059669" : pct >= 65 ? "#d97706" : "#e11d48";
  return (
    <div className="relative h-14 w-14 shrink-0">
      <svg viewBox="0 0 48 48" className="h-14 w-14 -rotate-90">
        <circle cx="24" cy="24" r={r} fill="none" stroke="currentColor" strokeWidth="5" className="text-slate-100 dark:text-slate-800" />
        <circle cx="24" cy="24" r={r} fill="none" stroke={color} strokeWidth="5" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - pct / 100)} />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-sm font-black text-slate-900 dark:text-white">{pct}%</span>
    </div>
  );
}

function Row({
  icon: Icon,
  title,
  summary,
  step,
  onEdit,
  children,
}: {
  icon: React.ElementType;
  title: string;
  summary: string;
  step: ReviewStepId;
  onEdit: (step: ReviewStepId) => void;
  children?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-slate-100 last:border-0 dark:border-slate-800">
      <div className="flex items-center gap-3 px-4 py-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400">
          <Icon className="h-4 w-4" />
        </span>
        <button type="button" onClick={() => setOpen((o) => !o)} className="min-w-0 flex-1 text-left" aria-expanded={open}>
          <span className="block text-sm font-semibold text-slate-900 dark:text-white">{title}</span>
          <span className="block truncate text-xs text-slate-500">{summary}</span>
        </button>
        <button type="button" onClick={() => setOpen((o) => !o)} aria-label={open ? "Hide details" : "Show details"} className="p-1 text-slate-400">
          <ChevronDown className={cn("h-4 w-4 transition", open && "rotate-180")} />
        </button>
        <button
          type="button"
          onClick={() => onEdit(step)}
          className="inline-flex shrink-0 items-center gap-1 rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200"
        >
          <Pencil className="h-3 w-3" /> Edit
        </button>
      </div>
      {open && <div className="space-y-1.5 px-4 pb-4 pl-16">{children}</div>}
    </div>
  );
}

function Item({ label, value, icon: Icon }: { label: string; value?: string | number | null; icon?: React.ElementType }) {
  if (value == null || value === "") return null;
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <span className="flex items-center gap-1.5 text-slate-500">
        {Icon && <Icon className="h-3.5 w-3.5" />}
        {label}
      </span>
      <span className="text-right font-semibold text-slate-900 dark:text-white">{value}</span>
    </div>
  );
}
