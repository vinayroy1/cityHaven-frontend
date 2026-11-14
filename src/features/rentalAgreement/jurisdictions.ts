import { COUNTRIES, type CountryCode } from "@/config/countries";

/**
 * How a rental agreement is formalised in each country. The same wizard serves everyone;
 * this pack decides defaults, wording and the "how to make it valid" guidance.
 *
 * - "generate":  a self-drafted agreement is normal (India, Nepal, Singapore …).
 * - "guided":    self-drafted is allowed, but statutory terms/registration apply (UK, Ireland).
 * - "official":  a government standard form is required (Dubai Ejari, Australian states, NZ);
 *                our document becomes a terms summary / addendum to that form.
 *
 * Guidance is general information, not legal advice; it is shown with a review date.
 */
export type AgreementMode = "generate" | "guided" | "official";

export interface JurisdictionPack {
  mode: AgreementMode;
  /** Currency text used inside the document/PDF (core PDF fonts lack ₹, ৳ …). */
  money: string;
  /** Lakh/crore wording for amounts in words. */
  indianWords: boolean;
  defaults: { durationMonths: number; noticeMonths: number; depositMonths: number; escalationPct: number; lockInMonths: number };
  regions: string[];
  regionLabel: string;
  relationLabel: string;
  idLabel: string;
  /** Steps shown after download. */
  validity: string[];
  lastReviewed: string;
}

export const INDIA_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana",
  "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya",
  "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
  "Uttar Pradesh", "Uttarakhand", "West Bengal", "Andaman and Nicobar Islands", "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry",
];

const REVIEWED = "November 2026";

const BASE: Omit<JurisdictionPack, "money" | "regions" | "regionLabel"> = {
  mode: "generate",
  indianWords: false,
  defaults: { durationMonths: 12, noticeMonths: 1, depositMonths: 1, escalationPct: 0, lockInMonths: 0 },
  relationLabel: "Father's / guardian's name (optional)",
  idLabel: "ID number (optional)",
  validity: [
    "Read the full draft together and correct anything that does not match your deal.",
    "Both parties sign every page; keep a signed copy each.",
    "Check local rules on stamping, notarisation or registration before you hand over keys.",
  ],
  lastReviewed: REVIEWED,
};

const OVERRIDES: Partial<Record<CountryCode, Partial<JurisdictionPack>>> = {
  IN: {
    money: "Rs.",
    indianWords: true,
    defaults: { durationMonths: 11, noticeMonths: 1, depositMonths: 2, escalationPct: 5, lockInMonths: 0 },
    regions: INDIA_STATES,
    relationLabel: "S/o, D/o or W/o (optional)",
    idLabel: "PAN / Aadhaar (last 4 digits) (optional)",
    validity: [
      "Print the agreement on non-judicial stamp paper, or buy an e-stamp certificate, of the value applicable in your state.",
      "Both parties sign every page in front of two witnesses.",
      "Agreements of 12 months or longer generally must be registered at the Sub-Registrar office; many people keep it at 11 months for this reason.",
      "Keep the landlord's PAN if the annual rent exceeds Rs. 1,00,000 (needed for the tenant's HRA claim).",
    ],
  },
  NP: {
    money: "NPR",
    indianWords: true,
    validity: [
      "Both parties and two witnesses sign every page.",
      "Notarisation or ward-office attestation is commonly used; check what your municipality requires.",
      "Keep the landlord's tax details if the rent is paid by a company.",
    ],
  },
  BD: {
    money: "BDT",
    indianWords: true,
    validity: [
      "Print on non-judicial stamp paper of the required value.",
      "Both parties sign in front of two witnesses; notarisation is commonly used.",
    ],
  },
  LK: {
    money: "LKR",
    validity: [
      "Leases are commonly attested by a notary public; stamp duty may apply.",
      "Both parties sign every page in front of two witnesses.",
    ],
  },
  SG: {
    money: "SGD",
    validity: [
      "Both parties sign the agreement.",
      "Pay stamp duty on the tenancy agreement via IRAS e-Stamping within 14 days of signing.",
      "Keep the stamp certificate with the agreement.",
    ],
  },
  GB: {
    mode: "guided",
    money: "GBP",
    relationLabel: "Representative / company (optional)",
    validity: [
      "Tenancy law differs between England, Scotland, Wales and Northern Ireland, and is being reformed; check gov.uk (or your nation's guidance) that these terms comply.",
      "Protect the deposit in a government-approved scheme within 30 days and give the tenant the prescribed information.",
      "Give the tenant the required documents (e.g. EPC, gas safety certificate, How to Rent guide in England).",
    ],
  },
  IE: {
    mode: "guided",
    money: "EUR",
    relationLabel: "Representative / company (optional)",
    validity: [
      "Register the tenancy with the Residential Tenancies Board (RTB).",
      "Check Rent Pressure Zone limits before agreeing any rent increase.",
    ],
  },
  AE: {
    mode: "official",
    money: "AED",
    relationLabel: "Representative / company (optional)",
    idLabel: "Emirates ID / passport (optional)",
    validity: [
      "In Dubai, the tenancy must be on the standard Unified Tenancy Contract and registered on Ejari; use this document as an addendum for extra terms.",
      "Rent increases at renewal are limited by the RERA rental index; check it before agreeing an increase.",
      "Other emirates have their own registration systems (e.g. Tawtheeq in Abu Dhabi).",
    ],
  },
  AU: {
    mode: "official",
    money: "AUD",
    relationLabel: "Representative / company (optional)",
    validity: [
      "Each state and territory requires its own prescribed residential tenancy agreement form; use this as a summary of agreed extra terms.",
      "Lodge the bond with your state's bond authority within the required time.",
      "Give the tenant the condition report and any information statement your state requires.",
    ],
  },
  NZ: {
    mode: "official",
    money: "NZD",
    relationLabel: "Representative / company (optional)",
    validity: [
      "Use the Tenancy Services standard tenancy agreement; this document can record extra agreed terms.",
      "Lodge the bond with Tenancy Services within 23 working days.",
    ],
  },
};

export function getJurisdiction(code: CountryCode): JurisdictionPack {
  const c = COUNTRIES[code] ?? COUNTRIES.IN;
  const o = OVERRIDES[code] ?? {};
  return {
    ...BASE,
    money: c.currency,
    regions: c.regions ?? [],
    regionLabel: c.regionLabel,
    ...o,
    defaults: { ...BASE.defaults, ...(o.defaults ?? {}) },
  } as JurisdictionPack;
}
