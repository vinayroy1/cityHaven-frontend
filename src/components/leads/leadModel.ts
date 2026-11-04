/**
 * Unified lead model for the owner's Leads inbox. Property leads, property visits, flatmate
 * requests and interior enquiries keep their own statuses and access rules; this maps each
 * onto three shared buckets (New / In progress / Closed) so the owner works one list.
 */
import type { ApiLead, ApiPropertyVisit } from "@/features/leads/api";
import type { FlatmateInterest } from "@/types/flatmate.types";
import type { InteriorInquiry } from "@/types/interior.types";

export type LeadKind = "property" | "visit" | "flatmate" | "interior";
export type LeadBucket = "new" | "active" | "closed";

export type StatusOption = { value: string; label: string };

export interface InboxLead {
  key: string;
  kind: LeadKind;
  id: number;
  bucket: LeadBucket;
  status: string;
  statusLabel: string;
  name: string;
  listing: string;
  listingHref?: string;
  place?: string;
  message?: string | null;
  details: string[];
  createdAt: string;
  /** Visible phone (undefined when hidden or locked). */
  phone?: string;
  email?: string | null;
  /** Interior leads: contact hidden until unlocked with credits. */
  locked?: boolean;
  /** Masked phone shown on locked interior leads. */
  maskedPhone?: string;
  /** Visit date for visits. */
  scheduledAt?: string;
  /** Pipeline statuses the owner can move this lead to. */
  statusOptions: StatusOption[];
  /** Suggested next step: one tap from the card. */
  next?: StatusOption;
  /** Kind used by the shared workflow endpoints (notes, follow-ups, reply tracking); visits have none. */
  workflowKind?: "property" | "flatmate" | "interior";
  ownerNote?: string | null;
  followUpAt?: string | null;
}

const inr = (n?: number | string | null) => {
  const v = Number(n);
  if (!v) return null;
  if (v >= 1e7) return `₹${Number((v / 1e7).toFixed(2))} Cr`;
  if (v >= 1e5) return `₹${Number((v / 1e5).toFixed(2))} L`;
  return `₹${v.toLocaleString("en-IN")}`;
};
const place = (locality?: string | null, city?: string | null) => [locality, city].filter(Boolean).join(", ") || undefined;
const opt = (value: string, label: string): StatusOption => ({ value, label });

// ---------- property leads ----------
const PROPERTY_STATUS: Record<string, { label: string; bucket: LeadBucket }> = {
  NEW: { label: "New", bucket: "new" },
  CONTACTED: { label: "Contacted", bucket: "active" },
  VISIT_SCHEDULED: { label: "Visit scheduled", bucket: "active" },
  OFFER_MADE: { label: "Negotiating", bucket: "active" },
  CLOSED_WON: { label: "Deal done", bucket: "closed" },
  CLOSED_LOST: { label: "Not interested", bucket: "closed" },
};
const PROPERTY_OPTIONS = Object.entries(PROPERTY_STATUS).map(([v, s]) => opt(v, s.label));
const PROPERTY_NEXT: Record<string, string> = {
  NEW: "CONTACTED",
  CONTACTED: "VISIT_SCHEDULED",
  VISIT_SCHEDULED: "OFFER_MADE",
  OFFER_MADE: "CLOSED_WON",
};

export function fromPropertyLead(l: ApiLead): InboxLead {
  const status = String(l.status || "NEW");
  const s = PROPERTY_STATUS[status] ?? PROPERTY_STATUS.NEW;
  const nextKey = PROPERTY_NEXT[status];
  return {
    key: `property-${l.id}`,
    kind: "property",
    id: l.id,
    bucket: s.bucket,
    status,
    statusLabel: s.label,
    name: l.buyer?.name || l.guestName || "Interested buyer",
    listing: l.property?.title || "Your property",
    listingHref: l.property?.id ? `/properties/${l.property.id}` : undefined,
    place: place(l.property?.locality, l.property?.cityName),
    message: l.message,
    details: [l.property?.listingType === "RENT" ? "Rent" : l.property?.listingType ? "Sale" : null, inr(l.property?.price)].filter(
      Boolean,
    ) as string[],
    createdAt: l.createdAt || l.updatedAt || new Date(0).toISOString(),
    phone: l.buyer?.mobileNumber || l.guestContact || undefined,
    email: l.buyer?.email,
    statusOptions: PROPERTY_OPTIONS,
    next: nextKey ? opt(nextKey, PROPERTY_STATUS[nextKey].label) : undefined,
    workflowKind: "property",
    ownerNote: l.ownerNote,
    followUpAt: l.followUpAt,
  };
}

// ---------- property visits ----------
const VISIT_STATUS: Record<string, { label: string; bucket: LeadBucket }> = {
  SCHEDULED: { label: "Visit booked", bucket: "new" },
  COMPLETED: { label: "Visited", bucket: "closed" },
  NO_SHOW: { label: "Didn't come", bucket: "closed" },
  CANCELLED: { label: "Cancelled", bucket: "closed" },
};
const VISIT_OPTIONS = Object.entries(VISIT_STATUS).map(([v, s]) => opt(v, s.label));

export function fromVisit(v: ApiPropertyVisit): InboxLead {
  const status = String(v.status || "SCHEDULED");
  const s = VISIT_STATUS[status] ?? VISIT_STATUS.SCHEDULED;
  // A booked visit whose date has passed still needs the owner to record what happened.
  return {
    key: `visit-${v.id}`,
    kind: "visit",
    id: v.id,
    bucket: s.bucket,
    status,
    statusLabel: s.label,
    name: v.buyer?.name || "Visitor",
    listing: v.property?.title || "Your property",
    listingHref: v.property?.id ? `/properties/${v.property.id}` : undefined,
    place: place(v.property?.locality, v.property?.cityName),
    message: v.notes,
    details: [inr(v.property?.price)].filter(Boolean) as string[],
    createdAt: v.createdAt || v.scheduledAt,
    scheduledAt: v.scheduledAt,
    phone: v.buyer?.mobileNumber || undefined,
    email: v.buyer?.email,
    statusOptions: VISIT_OPTIONS,
    next: status === "SCHEDULED" ? opt("COMPLETED", "Visited") : undefined,
  };
}

// ---------- flatmate requests ----------
const FLATMATE_STATUS: Record<string, { label: string; bucket: LeadBucket }> = {
  PENDING: { label: "Wants to connect", bucket: "new" },
  ACCEPTED: { label: "Accepted", bucket: "active" },
  DECLINED: { label: "Declined", bucket: "closed" },
  WITHDRAWN: { label: "Withdrawn", bucket: "closed" },
};

export function fromFlatmate(i: FlatmateInterest): InboxLead {
  const status = String(i.status || "PENDING");
  const s = FLATMATE_STATUS[status] ?? FLATMATE_STATUS.PENDING;
  const l = i.listing as (FlatmateInterest["listing"] & { rent?: number | null; budgetMax?: number | null }) | undefined;
  return {
    key: `flatmate-${i.id}`,
    kind: "flatmate",
    id: i.id,
    bucket: s.bucket,
    status,
    statusLabel: s.label,
    name: i.sender?.name || "Room seeker",
    listing: l?.title || "Your room",
    listingHref: l?.slug ? `/flatmates/${l.slug}` : undefined,
    place: place(l?.locality, l?.cityName),
    message: i.message,
    details: [l?.rent ? `${inr(l.rent)}/mo` : null].filter(Boolean) as string[],
    createdAt: i.createdAt,
    phone: i.sender?.mobileNumber || undefined,
    email: i.sender?.email,
    statusOptions: [],
    workflowKind: "flatmate",
    ownerNote: i.ownerNote,
    followUpAt: i.followUpAt,
  };
}

// ---------- interior enquiries ----------
const INTERIOR_STATUS: Record<string, { label: string; bucket: LeadBucket }> = {
  NEW: { label: "New", bucket: "new" },
  CONTACTED: { label: "Contacted", bucket: "active" },
  MEETING_FIXED: { label: "Meeting fixed", bucket: "active" },
  QUOTATION_SENT: { label: "Quote sent", bucket: "active" },
  CONVERTED: { label: "Project won", bucket: "closed" },
  LOST: { label: "Lost", bucket: "closed" },
};
const INTERIOR_OPTIONS = Object.entries(INTERIOR_STATUS).map(([v, s]) => opt(v, s.label));
const INTERIOR_NEXT: Record<string, string> = { CONTACTED: "MEETING_FIXED", MEETING_FIXED: "QUOTATION_SENT", QUOTATION_SENT: "CONVERTED" };

export function fromInterior(q: InteriorInquiry): InboxLead {
  const status = String(q.status || "NEW");
  const s = INTERIOR_STATUS[status] ?? INTERIOR_STATUS.NEW;
  const budget =
    q.budgetMin || q.budgetMax ? [inr(q.budgetMin), inr(q.budgetMax)].filter(Boolean).join("–") : null;
  const nextKey = q.isUnlocked ? INTERIOR_NEXT[status] : undefined;
  return {
    key: `interior-${q.id}`,
    kind: "interior",
    id: q.id,
    bucket: s.bucket,
    status,
    statusLabel: s.label,
    name: q.clientName || "Homeowner",
    listing: q.profile?.businessName || q.profile?.displayName || "Your interior listing",
    place: place(q.locality, q.cityName),
    message: q.notes,
    details: [
      q.bhkType,
      q.projectScope?.replace(/_/g, " ").toLowerCase(),
      budget,
      q.siteVisitRequested ? "Site visit requested" : null,
    ].filter(Boolean) as string[],
    createdAt: q.createdAt,
    locked: !q.isUnlocked,
    phone: q.isUnlocked ? q.clientPhone || undefined : undefined,
    maskedPhone: q.isUnlocked ? undefined : q.clientPhone,
    email: q.isUnlocked ? q.clientEmail : null,
    statusOptions: q.isUnlocked ? INTERIOR_OPTIONS : [],
    next: nextKey ? opt(nextKey, INTERIOR_STATUS[nextKey].label) : undefined,
    workflowKind: "interior",
    ownerNote: q.ownerNote,
    followUpAt: q.followUpAt,
  };
}

export const KIND_META: Record<LeadKind, { label: string; emoji: string; tone: string }> = {
  property: { label: "Property", emoji: "🏠", tone: "bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300" },
  visit: { label: "Site visit", emoji: "📅", tone: "bg-violet-50 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300" },
  flatmate: { label: "Flatmate", emoji: "🛏️", tone: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300" },
  interior: { label: "Interior", emoji: "🎨", tone: "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300" },
};

/** "2h ago", "3d ago" … */
export function ago(iso?: string) {
  if (!iso) return "";
  const mins = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const h = Math.round(mins / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.round(h / 24);
  if (d < 30) return `${d}d ago`;
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

/** 10-digit Indian mobile → wa.me / tel friendly number. */
export function dialable(phone?: string) {
  const digits = (phone || "").replace(/\D/g, "");
  if (digits.length < 10) return null;
  const ten = digits.slice(-10);
  return { tel: `+91${ten}`, wa: `91${ten}` };
}

/** "Usually replies in ~2h" style summary of the owner's median reply time. */
export function replySpeed(medianMinutes: number | null) {
  if (medianMinutes === null) return null;
  if (medianMinutes < 60) return `${Math.max(1, medianMinutes)} min`;
  const h = medianMinutes / 60;
  if (h < 24) return `${Math.round(h)}h`;
  return `${Math.round(h / 24)}d`;
}
