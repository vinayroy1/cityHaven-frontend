// Cross-field / format rules per wizard step (zod v4).
//
// "Is it filled?" is decided by the step config (required / requiredWhen / requires);
// these schemas only check values that ARE present: formats, ranges, min <= max,
// the single HEAD_OFFICE rule. Each schema parses the WHOLE form value, so issue
// paths are full dotted form paths ("pricing.startingRateMax") for form.setError.

import { z } from "zod";
import type { InteriorWizardSection, InteriorWizardValues } from "@/types/interior.types";
import { GSTIN_REGEX, INDIAN_PHONE_REGEX, MAX_DESIGN_STYLES, PAN_REGEX } from "./options";

export const CIN_REGEX = /^[LU][0-9]{5}[A-Z]{2}[0-9]{4}[A-Z]{3}[0-9]{6}$/;
export const PINCODE_REGEX = /^[1-9][0-9]{5}$/;
export const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const normPhone = (p: string) => p.replace(/[\s()-]/g, "");
export const isValidIndianPhone = (p: string) => INDIAN_PHONE_REGEX.test(normPhone(p));
export const isValidUrl = (s: string) => {
  try {
    const u = new URL(/^https?:\/\//i.test(s) ? s : `https://${s}`);
    return !!u.hostname && u.hostname.includes(".");
  } catch {
    return false;
  }
};

// ---- primitives (empty allowed) ----
const optText = (max: number, label: string) => z.string().max(max, `${label} must be ${max} characters or fewer`);
const optUrl = (label: string) =>
  z.string().refine((s) => !s.trim() || isValidUrl(s.trim()), { message: `Enter a valid ${label} link` });
const optPattern = (re: RegExp, message: string, upper = false) =>
  z.string().refine((s) => !s.trim() || re.test(upper ? s.trim().toUpperCase() : s.trim()), { message });
const optPhone = (message = "Enter a valid 10-digit Indian mobile number") =>
  z.string().refine((s) => !s.trim() || isValidIndianPhone(s), { message });
const optNum = (min: number, max: number, label: string) =>
  z
    .number({ error: `${label} must be a number` })
    .min(min, `${label} must be at least ${min}`)
    .max(max, `${label} must be at most ${max}`)
    .nullable();
const posPrice = (label: string) => z.number({ error: `${label} must be a number` }).positive(`${label} must be more than 0`).nullable();

/** adds "min must not exceed max" on the max path */
const minMax = (min: number | null | undefined, max: number | null | undefined, ctx: z.RefinementCtx, path: (string | number)[], what = "Maximum") => {
  if (min != null && max != null && max < min) {
    ctx.addIssue({ code: "custom", path, message: `${what} must be greater than or equal to the minimum` });
  }
};

// ---------------------------------------------------------------------------

const currentYear = new Date().getFullYear();

export const identitySchema = z.object({
  fullName: optText(80, "Full name"),
  displayName: optText(80, "Display name"),
  businessName: optText(120, "Business name"),
  legalName: optText(160, "Legal name"),
  tagline: optText(120, "Tagline"),
  about: optText(2000, "About"),
  experienceYears: optNum(0, 70, "Experience"),
  yearEstablished: optNum(1900, currentYear, "Year established"),
  slug: z.string().refine((s) => !s.trim() || SLUG_REGEX.test(s.trim()), {
    message: "Use lowercase letters, numbers and hyphens only",
  }),
  website: optUrl("website"),
  instagram: optUrl("Instagram"),
  facebook: optUrl("Facebook"),
  linkedin: optUrl("LinkedIn"),
  youtube: optUrl("YouTube"),
});

const branchSchema = z.object({
  branchName: optText(120, "Branch name"),
  pincode: optPattern(PINCODE_REGEX, "Enter a valid 6-digit pincode"),
  phone: optPhone(),
});

export const locationSchema = z
  .object({
    primaryPincode: optPattern(PINCODE_REGEX, "Enter a valid 6-digit pincode"),
    primaryAddress: optText(300, "Address"),
    siteVisitRadiusKm: optNum(0, 1000, "Site visit radius"),
    branches: z.array(z.looseObject(branchSchema.shape)),
  })
  .superRefine((loc, ctx) => {
    const heads = loc.branches
      .map((b, i) => ((b as { branchType?: string }).branchType === "HEAD_OFFICE" ? i : -1))
      .filter((i) => i >= 0);
    if (heads.length > 1) {
      for (const i of heads.slice(1)) {
        ctx.addIssue({ code: "custom", path: ["branches", i, "branchType"], message: "Only one branch can be the Head Office" });
      }
    }
  });

export const servicesSchema = z.object({
  designStyles: z.array(z.string()).max(MAX_DESIGN_STYLES, `Pick up to ${MAX_DESIGN_STYLES} design styles`),
  areaCapacity: z
    .object({
      minSqft: optNum(0, 10_000_000, "Minimum area"),
      maxSqft: optNum(0, 10_000_000, "Maximum area"),
      maxConcurrentProjects: optNum(0, 10_000, "Concurrent projects"),
    })
    .superRefine((c, ctx) => minMax(c.minSqft, c.maxSqft, ctx, ["maxSqft"], "Maximum area")),
});

export const materialsSchema = z.object({
  materialSpecs: z.array(
    z.looseObject({
      category: z.string().min(1, "Pick a category"),
      material: z.string().refine((s) => s.trim().length > 0, { message: "Add a material name or remove this row" }),
      thicknessMm: optNum(0, 200, "Thickness").optional(),
    }),
  ),
});

const packageRow = z
  .looseObject({
    packageName: optText(80, "Package name"),
    priceMin: posPrice("Price").optional(),
    priceMax: posPrice("Maximum price").optional(),
  })
  .superRefine((p, ctx) => minMax(p.priceMin, p.priceMax, ctx, ["priceMax"], "Maximum price"));

const roomRow = z
  .looseObject({ priceMin: posPrice("Price"), priceMax: posPrice("Maximum price").optional() })
  .superRefine((r, ctx) => minMax(r.priceMin, r.priceMax, ctx, ["priceMax"], "Maximum price"));

const consultationRow = z
  .looseObject({
    type: z.string(),
    isFree: z.boolean(),
    fee: z.number().min(0, "Fee can't be negative").nullable(),
    durationMins: optNum(5, 600, "Duration").optional(),
  })
  .superRefine((o, ctx) => {
    if (!o.type) ctx.addIssue({ code: "custom", path: ["type"], message: "Choose a consultation type" });
    if (!o.isFree && !(o.fee != null && o.fee > 0)) {
      ctx.addIssue({ code: "custom", path: ["fee"], message: "Enter the fee or mark it as free" });
    }
  });

export const pricingSchema = z
  .object({
    priceMode: z.string(),
    startingRateMin: posPrice("Starting price"),
    startingRateMax: posPrice("Maximum price"),
    packages: z.array(packageRow),
    roomPricing: z.array(roomRow),
    consultationOptions: z.array(consultationRow),
  })
  .superRefine((p, ctx) => {
    if (p.priceMode === "STARTING_PRICE") minMax(p.startingRateMin, p.startingRateMax, ctx, ["startingRateMax"], "Maximum price");
  });

export const portfolioSchema = z.object({
  projects: z.array(
    z.looseObject({
      title: optText(120, "Project title"),
      areaSqft: optNum(1, 10_000_000, "Area").optional(),
      durationDays: optNum(1, 3650, "Duration").optional(),
      completionDate: z
        .string()
        .refine((s) => !s || /^\d{4}-(0[1-9]|1[0-2])$/.test(s), { message: "Use month and year" })
        .optional(),
      description: optText(2000, "Description").optional(),
    }),
  ),
});

export const teamSchema = z.object({
  gstin: optPattern(GSTIN_REGEX, "Enter a valid 15-character GSTIN (e.g. 29ABCDE1234F1Z5)", true),
  panNumber: optPattern(PAN_REGEX, "Enter a valid PAN (e.g. ABCDE1234F)", true),
  cinNumber: optPattern(CIN_REGEX, "Enter a valid 21-character CIN", true),
  coaRegistrationNumber: optText(40, "COA registration number"),
  iiidMembershipNumber: optText(40, "IIID membership number"),
});

export const warrantySchema = z.object({
  warranties: z.array(
    z.looseObject({
      years: optNum(0, 50, "Years"),
      months: optNum(0, 11, "Months").optional(),
    }),
  ),
  support: z.looseObject({
    freeMaintenanceMonths: optNum(0, 120, "Free maintenance"),
    responseTimeHours: optNum(0, 720, "Response time"),
    afterSalesNote: optText(1000, "Note"),
  }),
});

export const contactSchema = z
  .object({
    contactName: optText(80, "Contact name"),
    phone: optPhone(),
    whatsappSameAsPhone: z.boolean(),
    whatsapp: optPhone("Enter a valid 10-digit WhatsApp number"),
    email: z.string().refine((s) => !s.trim() || z.email().safeParse(s.trim()).success, { message: "Enter a valid email address" }),
    workingHours: z.object({ open: z.string(), close: z.string() }),
  })
  .superRefine((c, ctx) => {
    const { open, close } = c.workingHours;
    if (open && close && close <= open) {
      ctx.addIssue({ code: "custom", path: ["workingHours", "close"], message: "Closing time must be after opening time" });
    }
  });

const wrap = <K extends InteriorWizardSection>(key: K, schema: z.ZodType) => z.looseObject({ [key]: schema } as Record<K, z.ZodType>);

/** keyed by step id; each parses the full InteriorWizardValues. */
export const interiorStepSchemas: Record<InteriorWizardSection, z.ZodType> = {
  identity: wrap("identity", z.looseObject(identitySchema.shape)),
  location: wrap("location", locationSchema),
  services: wrap("services", servicesSchema),
  materials: wrap("materials", materialsSchema),
  pricing: wrap("pricing", pricingSchema),
  portfolio: wrap("portfolio", portfolioSchema),
  team: wrap("team", teamSchema),
  warranty: wrap("warranty", warrantySchema),
  contact: wrap("contact", contactSchema),
};

/** `{ "pricing.startingRateMax": "…" }` for one step (empty object = valid). */
export function validateInteriorStep(stepId: InteriorWizardSection, values: InteriorWizardValues): Record<string, string> {
  const schema = interiorStepSchemas[stepId];
  if (!schema) return {};
  const res = schema.safeParse(values);
  if (res.success) return {};
  const out: Record<string, string> = {};
  for (const issue of res.error.issues) {
    const path = issue.path.map(String).join(".");
    if (!(path in out)) out[path] = issue.message;
  }
  return out;
}

/** All steps at once (submit / publish pre-check). */
export function validateInteriorAll(values: InteriorWizardValues): Record<string, string> {
  return (Object.keys(interiorStepSchemas) as InteriorWizardSection[]).reduce(
    (acc, s) => ({ ...acc, ...validateInteriorStep(s, values) }),
    {} as Record<string, string>,
  );
}
