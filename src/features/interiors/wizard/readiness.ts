// Submission vs publication readiness (plan §3 readiness matrix).
// The server's GET /interiors/me/readiness is authoritative; this is the client fallback.

import type { ReadinessRule } from "@/lib/listingEngine/types";
import type { InteriorWizardValues } from "@/types/interior.types";
import { INDIAN_PHONE_REGEX } from "./options";
import { isValidPhone } from "@/lib/money";

type V = InteriorWizardValues;

const filled = (s: unknown) => typeof s === "string" && s.trim().length > 0;
const isCompany = (v: V) => v.identity.providerType === "COMPANY";
const isIndividual = (v: V) => v.identity.providerType === "INDIVIDUAL";
const isQuoteOnly = (v: V) => v.pricing.priceMode === "QUOTE_ONLY";
const normPhone = (p: string) => p.replace(/[\s()-]/g, "");

export const MIN_ABOUT_CHARS = 80;
export const MIN_PROJECT_IMAGES = 3;
/** ID / GST documents optional for now (same flag in the backend interior.readiness.ts). */
export const DOCUMENTS_REQUIRED = false;

const ID_DOCS_INDIVIDUAL = ["ID_PROOF", "PAN"]; // mirrors backend interior.readiness.ts
const ID_DOCS_COMPANY = ["GST_CERT", "COI"];
const idDocTypes = (v: V) => (isCompany(v) ? ID_DOCS_COMPANY : ID_DOCS_INDIVIDUAL);

export const interiorReadinessRules: ReadinessRule<V>[] = [
  {
    id: "providerType",
    stepId: "identity",
    label: "Choose individual designer or company",
    levels: ["SUBMIT", "PUBLISH"],
    fieldPath: "identity.providerType",
    check: (v) => isIndividual(v) || isCompany(v),
  },
  {
    id: "name",
    stepId: "identity",
    label: "Add your display / business name",
    levels: ["SUBMIT", "PUBLISH"],
    fieldPath: "identity.displayName",
    check: (v) => (isCompany(v) ? filled(v.identity.businessName) : filled(v.identity.displayName) && filled(v.identity.fullName)),
  },
  {
    id: "about",
    stepId: "identity",
    label: `Write an "About" of at least ${MIN_ABOUT_CHARS} characters`,
    levels: ["PUBLISH"],
    fieldPath: "identity.about",
    check: (v) => v.identity.about.trim().length >= MIN_ABOUT_CHARS,
  },
  {
    id: "logo",
    stepId: "identity",
    label: "Upload a logo or profile photo",
    levels: ["PUBLISH"],
    fieldPath: "identity.logo",
    check: (v) => filled(v.identity.logo),
  },
  {
    id: "primaryLocation",
    stepId: "location",
    label: "Set your primary city and locality",
    levels: ["SUBMIT", "PUBLISH"],
    fieldPath: "location.primaryCity",
    check: (v) => filled(v.location.primaryCity) && filled(v.location.primaryLocality),
  },
  {
    id: "headOffice",
    stepId: "location",
    label: "Add your Head Office branch",
    levels: ["SUBMIT", "PUBLISH"],
    fieldPath: "location.branches",
    appliesWhen: isCompany,
    check: (v) => v.location.branches.some((b) => b.branchType === "HEAD_OFFICE"),
  },
  {
    id: "services",
    stepId: "services",
    label: "Pick at least one service",
    levels: ["SUBMIT", "PUBLISH"],
    fieldPath: "services.servicesOffered",
    check: (v) => v.services.servicesOffered.length > 0 || v.services.commercialServices.length > 0,
  },
  {
    id: "propertyTypes",
    stepId: "services",
    label: "Pick at least one property type",
    levels: ["SUBMIT", "PUBLISH"],
    fieldPath: "services.propertyTypesHandled",
    check: (v) => v.services.propertyTypesHandled.length > 0,
  },
  {
    id: "designStyles",
    stepId: "services",
    label: "Pick at least one design style",
    levels: ["PUBLISH"],
    fieldPath: "services.designStyles",
    check: (v) => v.services.designStyles.length > 0,
  },
  {
    id: "materialsBoardHardware",
    stepId: "materials",
    label: "Add at least one board and one hardware spec",
    levels: ["PUBLISH"],
    fieldPath: "materials.materialSpecs",
    check: (v) => {
      const rows = v.materials.materialSpecs.filter((r) => filled(r.material));
      return rows.some((r) => r.category === "BOARD") && rows.some((r) => r.category === "HARDWARE");
    },
  },
  {
    id: "startingPrice",
    stepId: "pricing",
    label: "Add a starting price or choose quote-only",
    levels: ["SUBMIT", "PUBLISH"],
    fieldPath: "pricing.priceMode",
    check: (v) =>
      isQuoteOnly(v) ||
      (v.pricing.priceMode === "STARTING_PRICE" && (v.pricing.startingRateMin ?? 0) > 0 && !!v.pricing.pricingUnit),
  },
  {
    id: "activePackage",
    stepId: "pricing",
    label: "Add at least one active package",
    levels: ["PUBLISH"],
    fieldPath: "pricing.packages",
    appliesWhen: (v) => !isQuoteOnly(v),
    check: (v) => v.pricing.packages.some((p) => p.isActive && filled(p.packageName)),
  },
  {
    id: "idDocument",
    stepId: "team",
    label: "Upload ID proof (individual) or GST / incorporation certificate (company)",
    levels: ["SUBMIT"],
    fieldPath: "team.credentials",
    appliesWhen: (v) => DOCUMENTS_REQUIRED && (isIndividual(v) || isCompany(v)),
    check: (v) => v.team.credentials.some((d) => idDocTypes(v).includes(d.type) && filled(d.fileUrl) && d.status !== "REJECTED"),
  },
  {
    id: "documentVerified",
    stepId: "team",
    label: "At least one document verified by Awasio",
    levels: ["PUBLISH"],
    fieldPath: "team.credentials",
    appliesWhen: () => DOCUMENTS_REQUIRED,
    check: (v) => v.team.credentials.some((d) => idDocTypes(v).includes(d.type) && d.status === "VERIFIED"),
  },
  {
    id: "woodworkWarranty",
    stepId: "warranty",
    label: "Fill in your woodwork warranty",
    levels: ["PUBLISH"],
    fieldPath: "warranty.warranties",
    check: (v) =>
      v.warranty.warranties.some((w) => w.category === "WOODWORK" && ((w.years ?? 0) > 0 || (w.months ?? 0) > 0)),
  },
  {
    id: "contactPhone",
    stepId: "contact",
    label: "Add a valid contact phone",
    levels: ["SUBMIT", "PUBLISH"],
    fieldPath: "contact.phone",
    check: (v) => INDIAN_PHONE_REGEX.test(normPhone(v.contact.phone)) || isValidPhone(v.contact.phone, v.location?.countryCode),
  },
];
