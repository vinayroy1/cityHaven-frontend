import type { CountryCode } from "@/config/countries";

export interface AgreementParty {
  name: string;
  /** "S/o, D/o, W/o" in South Asia; company/representative name elsewhere. */
  relation?: string;
  address: string;
  phone?: string;
  email?: string;
  /** Optional ID reference (PAN / Aadhaar last 4 / passport / Emirates ID …). */
  idNumber?: string;
}

export type PropertyType = "APARTMENT" | "HOUSE" | "ROOM" | "SHOP" | "OFFICE";
export type Furnishing = "UNFURNISHED" | "SEMI" | "FULL";
export type Maintenance = "INCLUDED" | "TENANT" | "NONE";
export type Utilities = "TENANT" | "LANDLORD" | "SHARED";
export type PaymentMethod = "BANK" | "UPI" | "CHEQUE" | "CASH" | "ANY";

export interface AgreementInput {
  country: CountryCode;
  region: string;
  city: string;
  agreementDate: string; // yyyy-mm-dd
  landlords: AgreementParty[];
  tenants: AgreementParty[];

  propertyAddress: string;
  propertyType: PropertyType;
  configuration: string; // "2 BHK", "Studio", "Shop 12" …
  areaSqft: string;
  furnishing: Furnishing;
  parking: boolean;
  use: "RESIDENTIAL" | "COMMERCIAL";

  rent: number;
  rentDueDay: number;
  deposit: number;
  maintenance: Maintenance;
  maintenanceAmount: number;
  paymentMethod: PaymentMethod;
  startDate: string; // yyyy-mm-dd
  durationMonths: number;
  escalationPct: number;

  noticeMonths: number;
  lockInMonths: number;
  utilities: Utilities;
  petsAllowed: boolean;
  smokingAllowed: boolean;
  sublettingAllowed: boolean;
  fixtures: string[];
  extraClauses: string[];
  witnesses: boolean;
}

/** Rendered document: the single source for both the on-screen preview and the PDF. */
export interface AgreementDoc {
  title: string;
  subtitle?: string;
  preamble: string[];
  clauses: { heading: string; body: string[] }[];
  schedule?: { heading: string; items: string[] };
  signatures: { label: string; name: string }[];
  witnesses: boolean;
  footnote: string;
}
