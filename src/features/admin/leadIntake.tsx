"use client";

/**
 * Call intake for sourcing leads: the type-specific questions sales ask the owner, saved on the lead
 * (SourcingLead.intake) so whoever creates the listing later has everything in one place.
 */
import React, { useState } from "react";
import { CheckSquare, ClipboardList, Loader2, Square } from "lucide-react";
import type { LeadType } from "./api";

export type LeadIntake = Record<string, string | boolean>;

type Field = {
  key: string;
  label: string;
  placeholder?: string;
  long?: boolean;
  check?: boolean;
  /** Quick-pick single choice, rendered as chips. */
  options?: string[];
  /** Starts a new titled group in the form. */
  section?: string;
  /** Only ask when an earlier quick-pick has one of these answers (e.g. rent-only questions). */
  showIf?: { key: string; in: string[] };
};

const R = { key: "category", in: ["Residential"] };
const C = { key: "category", in: ["Commercial"] };
const RENT = { key: "purpose", in: ["Rent"] };
const SELL = { key: "purpose", in: ["Sell"] };

const COMMON_END: Field[] = [
  { key: "address", label: "Full address", long: true, section: "Location & confirmation" },
  { key: "photosReceived", label: "Photos received on WhatsApp", check: true },
  { key: "consent", label: "Owner agreed to free listing", check: true },
];

export const INTAKE_FIELDS: Record<LeadType, Field[]> = {
  PG: [
    { key: "accommodationType", label: "Category", options: ["PG", "Hostel", "Co-living", "Student hostel"], section: "About the PG" },
    { key: "gender", label: "Available for", options: ["Boys", "Girls", "Co-ed"] },
    { key: "tenant", label: "Preferred tenant", options: ["Students", "Working professionals", "Anyone"] },
    { key: "totalBeds", label: "Total rooms / beds", placeholder: "e.g. 12 rooms, 30 beds" },
    { key: "vacancy", label: "Beds vacant now", placeholder: "e.g. 4" },
    { key: "branches", label: "Other branches (more leads)", placeholder: "e.g. 2 more in Saket" },
    { key: "pricingBasis", label: "Rent charged", options: ["Per bed", "Per room"], section: "Rooms & rent" },
    { key: "sharingRent", label: "Sharing options & rent", placeholder: "Single ₹12k (AC), Double ₹8k, Triple ₹6k", long: true },
    { key: "deposit", label: "Security deposit", placeholder: "e.g. 1 month / ₹10,000" },
    { key: "noticeLockIn", label: "Notice period / lock-in", placeholder: "30 days notice, 3 months lock-in" },
    { key: "electricity", label: "Electricity", options: ["Included", "Sub-meter", "Fixed extra"] },
    { key: "extraCharges", label: "Other charges", placeholder: "Maintenance ₹500, AC ₹1,000 extra" },
    { key: "food", label: "Food", options: ["Included", "Optional mess", "No food"], section: "Food" },
    { key: "foodType", label: "Veg / non-veg", options: ["Veg only", "Veg & non-veg"] },
    { key: "meals", label: "Meals included", placeholder: "Breakfast, dinner; lunch on Sundays" },
    { key: "attachedBathroom", label: "Attached washroom", check: true, section: "In the room" },
    { key: "ac", label: "AC / cooler", check: true },
    { key: "studyTable", label: "Study table & chair", check: true },
    { key: "wardrobe", label: "Wardrobe / cupboard", check: true },
    { key: "geyser", label: "Geyser / hot water", check: true },
    { key: "balcony", label: "Balcony / window", check: true },
    { key: "wifi", label: "Wi-Fi", check: true, section: "Building facilities" },
    { key: "roWater", label: "RO drinking water", check: true },
    { key: "powerBackup", label: "Power backup", check: true },
    { key: "housekeeping", label: "Housekeeping", check: true },
    { key: "laundry", label: "Laundry / washing machine", check: true },
    { key: "cctv", label: "CCTV / security guard", check: true },
    { key: "parking", label: "Two-wheeler parking", check: true },
    { key: "fridgeTv", label: "Fridge / TV in common area", check: true },
    { key: "otherAmenities", label: "Other amenities", placeholder: "Gym, lift, terrace…" },
    { key: "gateTime", label: "Gate closing time", placeholder: "e.g. 10:30 pm", section: "House rules" },
    { key: "visitors", label: "Visitors", options: ["Allowed", "Day time only", "Not allowed"] },
    { key: "smokingDrinking", label: "Smoking / drinking", options: ["Allowed", "Not allowed"] },
    { key: "otherRules", label: "Other rules", placeholder: "No non-veg cooking, ID proof mandatory" },
    { key: "landmark", label: "Landmark / nearby", placeholder: "Near metro station, 5 min to college", section: "Contact" },
    { key: "caretaker", label: "Caretaker / manager name & phone", placeholder: "For visits, if different from owner" },
    { key: "visitTime", label: "Best time for visits / photos" },
  ],
  STAY: [
    { key: "rooms", label: "Room types & price/night", placeholder: "Deluxe ₹1800, Standard ₹1200", long: true },
    { key: "roomCount", label: "Number of rooms" },
    { key: "checkTimes", label: "Check-in / check-out", placeholder: "12pm / 11am" },
    { key: "amenities", label: "Amenities", placeholder: "AC, parking, breakfast", long: true },
    { key: "policy", label: "ID & couple policy" },
    { key: "gst", label: "GST number (optional)" },
  ],
  RENTAL: [
    { key: "purpose", label: "Listing for", options: ["Rent", "Sell"], section: "What they're listing" },
    { key: "category", label: "Property category", options: ["Residential", "Commercial"] },
    { key: "relation", label: "They are the", options: ["Owner", "Agent", "Builder"] },
    { key: "resType", label: "Property type", options: ["Apartment / flat", "Independent house / villa", "Builder floor", "Studio / 1 RK", "Plot"], showIf: R },
    { key: "comType", label: "Property type", options: ["Office", "Shop / showroom", "Warehouse / godown", "Co-working", "Industrial", "Commercial land"], showIf: C },
    { key: "saleType", label: "Resale or new booking", options: ["Resale", "New booking"], showIf: SELL },
    { key: "units", label: "Other properties they have (more leads)", placeholder: "e.g. 3 more flats in same society" },
    { key: "bhk", label: "BHK", options: ["1 RK", "1 BHK", "2 BHK", "3 BHK", "4 BHK", "5+ BHK"], showIf: R, section: "Size & layout" },
    { key: "area", label: "Area", placeholder: "Carpet 850 / built-up 1,050 sq ft" },
    { key: "bathBalcony", label: "Bathrooms / balconies", placeholder: "2 bath, 1 balcony", showIf: R },
    { key: "floor", label: "Floor / total floors", placeholder: "3rd of 7" },
    { key: "facing", label: "Facing", placeholder: "East, park facing" },
    { key: "furnishing", label: "Furnishing", options: ["Unfurnished", "Semi-furnished", "Fully furnished"] },
    { key: "furnishingItems", label: "What's included", placeholder: "Beds, wardrobes, AC ×2, fridge, sofa" },
    { key: "rent", label: "Monthly rent", placeholder: "₹25,000", showIf: RENT, section: "Price" },
    { key: "deposit", label: "Security deposit", placeholder: "₹75,000 / 3 months", showIf: RENT },
    { key: "price", label: "Expected price", placeholder: "₹85 lakh", showIf: SELL },
    { key: "maintenance", label: "Maintenance", placeholder: "₹3,000/month" },
    { key: "negotiable", label: "Negotiable", options: ["Yes", "No"] },
    { key: "brokerage", label: "Brokerage (if agent)", options: ["None", "15 days", "1 month", "1%", "2%"] },
    { key: "tenants", label: "Preferred tenants", options: ["Family", "Bachelors", "Company lease", "Anyone"], showIf: RENT, section: "Tenants & availability" },
    { key: "pets", label: "Pets", options: ["Allowed", "Not allowed"], showIf: RENT },
    { key: "foodPref", label: "Non-veg allowed", options: ["Yes", "No"], showIf: RENT },
    { key: "status", label: "Availability", options: ["Ready to move", "Under construction"] },
    { key: "availableFrom", label: "Available / possession from", placeholder: "e.g. 1 December" },
    { key: "age", label: "Age of property", options: ["0–1 yr", "1–5 yrs", "5–10 yrs", "10+ yrs"] },
    { key: "ownership", label: "Ownership", options: ["Freehold", "Leasehold", "Co-op society", "Power of attorney"], showIf: SELL },
    { key: "approvals", label: "RERA / approved by", placeholder: "RERA no., DDA/municipal approval", showIf: SELL },
    { key: "washroom", label: "Washroom", options: ["Private", "Shared", "None"], showIf: C, section: "Commercial details" },
    { key: "suitableFor", label: "Suitable for", placeholder: "Clinic, café, IT office, retail", showIf: C },
    { key: "frontage", label: "Entrance / frontage width", placeholder: "e.g. 15 ft on main road", showIf: C },
    { key: "pantry", label: "Pantry / cafeteria", check: true, showIf: C },
    { key: "fireSafety", label: "Fire safety / NOC", check: true, showIf: C },
    { key: "carParking", label: "Car parking", check: true, section: "Building facilities" },
    { key: "lift", label: "Lift", check: true },
    { key: "powerBackup", label: "Power backup", check: true },
    { key: "security", label: "Security / CCTV", check: true },
    { key: "gated", label: "Gated society", check: true, showIf: R },
    { key: "water", label: "24×7 water", check: true },
    { key: "gymPool", label: "Gym / pool / clubhouse", check: true, showIf: R },
    { key: "otherAmenities", label: "Other amenities", placeholder: "Park, kids play area…" },
    { key: "landmark", label: "Landmark / nearby", placeholder: "Near metro, 2 km to IT park", section: "Contact" },
    { key: "keys", label: "Keys with / visit contact", placeholder: "Caretaker name & phone" },
    { key: "visitTime", label: "Best time for visits / photos" },
  ],
  PROJECT: [
    { key: "projectName", label: "Project name" },
    { key: "rera", label: "RERA number" },
    { key: "configs", label: "Configurations, size & price", placeholder: "2 BHK 1050 sqft ₹85L–95L", long: true },
    { key: "possession", label: "Possession date" },
    { key: "amenities", label: "Amenities", long: true },
    { key: "siteContact", label: "Site visit contact" },
    { key: "brochureReceived", label: "Brochure & floor plans received", check: true },
  ],
  BUILDER: [
    { key: "company", label: "Company name" },
    { key: "projects", label: "Projects (ongoing / completed)", long: true },
    { key: "rera", label: "RERA number(s)" },
    { key: "configs", label: "Configurations & price range", long: true },
    { key: "possession", label: "Possession dates" },
    { key: "siteContact", label: "Site visit contact" },
    { key: "brochureReceived", label: "Brochures & floor plans received", check: true },
  ],
  AGENT: [
    { key: "agency", label: "Agency name" },
    { key: "experience", label: "Years of experience" },
    { key: "areas", label: "Areas covered", long: true },
    { key: "dealsIn", label: "Deals in", placeholder: "Rent, sale, commercial" },
    { key: "rera", label: "RERA agent number" },
    { key: "activeListings", label: "Active listings count" },
  ],
  INTERIOR: [
    { key: "firm", label: "Firm name" },
    { key: "services", label: "Services", placeholder: "Full home, modular kitchen, wardrobes", long: true },
    { key: "price", label: "Price range", placeholder: "₹1,500/sq ft or ₹4L per project" },
    { key: "experience", label: "Years of experience" },
    { key: "cities", label: "Cities served" },
  ],
};

export function intakeFields(type: LeadType, answers?: LeadIntake | null): Field[] {
  return [...INTAKE_FIELDS[type], ...COMMON_END].filter((f) => !f.showIf || f.showIf.in.includes(String(answers?.[f.showIf.key] ?? "")));
}

const input =
  "w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-rose-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100";

/** Editable form shown in the lead drawer. */
export function LeadIntakeForm({ type, value, saving, onSave }: { type: LeadType; value: LeadIntake | null; saving: boolean; onSave: (v: LeadIntake) => void }) {
  const [draft, setDraft] = useState<LeadIntake>(value ?? {});
  const fields = intakeFields(type, draft);
  // Ticks are yes/no answers, so only count the questions that need an answer.
  const questions = fields.filter((f) => !f.check);
  const filled = questions.filter((f) => String(draft[f.key] ?? "").trim()).length;
  const set = (k: string, v: string | boolean) => setDraft({ ...draft, [k]: v });
  const dirty = JSON.stringify(draft) !== JSON.stringify(value ?? {});

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500">
          <ClipboardList className="h-3.5 w-3.5" /> Listing details from call
        </h3>
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
          {filled}/{questions.length} answered
        </span>
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        {fields.map((f) => (
          <React.Fragment key={f.key}>
            {f.section && <h4 className="mt-2 text-[11px] font-bold uppercase tracking-wider text-rose-600 sm:col-span-2">{f.section}</h4>}
            {f.check ? (
              <button
                type="button"
                onClick={() => set(f.key, !draft[f.key])}
                className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                {draft[f.key] ? <CheckSquare className="h-4 w-4 shrink-0 text-emerald-600" /> : <Square className="h-4 w-4 shrink-0 text-slate-400" />}
                {f.label}
              </button>
            ) : f.options ? (
              <div className="sm:col-span-2">
                <span className="mb-1 block text-[11px] font-semibold text-slate-500">{f.label}</span>
                <div className="flex flex-wrap gap-1.5">
                  {f.options.map((o) => (
                    <button
                      key={o}
                      type="button"
                      onClick={() => set(f.key, draft[f.key] === o ? "" : o)}
                      className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
                        draft[f.key] === o ? "border-rose-600 bg-rose-600 text-white" : "border-slate-200 text-slate-600 hover:border-slate-300 dark:border-slate-700 dark:text-slate-300"
                      }`}
                    >
                      {o}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <label className={`block ${f.long ? "sm:col-span-2" : ""}`}>
                <span className="mb-1 block text-[11px] font-semibold text-slate-500">{f.label}</span>
                {f.long ? (
                  <textarea rows={2} value={String(draft[f.key] ?? "")} placeholder={f.placeholder} onChange={(e) => set(f.key, e.target.value)} className={input} />
                ) : (
                  <input value={String(draft[f.key] ?? "")} placeholder={f.placeholder} onChange={(e) => set(f.key, e.target.value)} className={input} />
                )}
              </label>
            )}
          </React.Fragment>
        ))}
      </div>
      <button
        type="button"
        disabled={saving || !dirty}
        onClick={() => {
          const clean: LeadIntake = {};
          for (const f of fields) {
            const v = draft[f.key];
            if (v === true || (typeof v === "string" && v.trim())) clean[f.key] = typeof v === "string" ? v.trim() : v;
          }
          onSave(clean);
        }}
        className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 disabled:opacity-50 dark:bg-slate-100 dark:text-slate-900"
      >
        {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />} Save details
      </button>
    </section>
  );
}

/** Read-only summary shown beside the listing form when creating a listing from a lead. */
export function LeadIntakeSummary({ type, value, notes }: { type: LeadType; value: LeadIntake | null; notes?: string | null }) {
  const all = intakeFields(type, value);
  const rows = all.filter((f) => !f.check && String(value?.[f.key] ?? "").trim());
  const ticked = all.filter((f) => f.check && value?.[f.key] === true).map((f) => f.label);
  if (!rows.length && !ticked.length && !notes) return null;
  return (
    <aside className="rounded-2xl border border-sky-200 bg-sky-50/60 p-4 text-sm dark:border-sky-900 dark:bg-sky-950/30">
      <h3 className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-sky-700 dark:text-sky-300">
        <ClipboardList className="h-3.5 w-3.5" /> Details collected on the call
      </h3>
      <dl className="grid gap-x-4 gap-y-1.5 sm:grid-cols-2">
        {rows.map((f) => (
          <div key={f.key} className={f.long ? "sm:col-span-2" : ""}>
            <dt className="text-[11px] font-semibold text-slate-500">{f.label}</dt>
            <dd className="whitespace-pre-wrap text-slate-800 dark:text-slate-100">{String(value?.[f.key])}</dd>
          </div>
        ))}
        {ticked.length > 0 && (
          <div className="sm:col-span-2">
            <dt className="text-[11px] font-semibold text-slate-500">Confirmed (yes)</dt>
            <dd className="text-slate-800 dark:text-slate-100">{ticked.join(" · ")}</dd>
          </div>
        )}
        {notes && (
          <div className="sm:col-span-2">
            <dt className="text-[11px] font-semibold text-slate-500">Notes</dt>
            <dd className="whitespace-pre-wrap text-slate-800 dark:text-slate-100">{notes}</dd>
          </div>
        )}
      </dl>
    </aside>
  );
}
