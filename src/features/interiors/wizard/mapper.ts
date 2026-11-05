// Wizard form tree <-> persisted InteriorProfile.
//
// - `formToProfilePayload(section, values)` builds the body `data` for
//   PATCH /interiors/me/sections/:section (CONTRACT.md §5 "Section PATCH payload mapping").
//   It also derives the legacy flat columns so older readers keep working.
// - `profileToForm(profile)` hydrates the wizard; v2 JSON columns win over legacy ones.
// - Repeater entities (branches, packages, projects, team, documents) persist via
//   their own endpoints; use the *DraftToPayload / *ToDraft helpers for those.
//
// Nothing is invented: unknown/empty values map to "", null or [].

import type {
  ConsultationOption,
  ContactAvailability,
  CredentialDocument,
  InteriorBranch,
  InteriorBranchDraft,
  InteriorConsultationType,
  InteriorPackage,
  InteriorPackageDraft,
  InteriorProfile,
  InteriorProject,
  InteriorProjectDraft,
  InteriorTeamMember,
  InteriorTeamMemberDraft,
  InteriorWizardSection,
  InteriorWizardValues,
  LeadPreference,
  MaterialCategory,
  MaterialSpecRow,
  RoomGallery,
  WarrantyCategory,
  WarrantyRow,
} from "@/types/interior.types";
import { createInteriorInitialValues } from "./initialValues";
import { interiorSteps } from "./steps";

/** Section keys in wizard order (follows `interiorSteps`, so reordering steps needs no change here). */
export const INTERIOR_SECTIONS: InteriorWizardSection[] = interiorSteps.map((s) => s.id as InteriorWizardSection);

/** 1-based wizardStep for a section id. */
export const sectionToWizardStep = (section: InteriorWizardSection) => INTERIOR_SECTIONS.indexOf(section) + 1;

type Payload = Partial<InteriorProfile>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const asPayload = (o: Record<string, any>) => o as Payload;

const str = (v: unknown): string => (typeof v === "string" ? v : v == null ? "" : String(v));
const nul = (v: string | null | undefined): string | null => (v && v.trim() ? v : null);
const num = (v: unknown): number | null => {
  if (v === null || v === undefined || v === "") return null;
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : null;
};
const arr = <T>(v: T[] | null | undefined): T[] => (Array.isArray(v) ? [...v] : []);
const uniq = (xs: (string | undefined | null)[]) => Array.from(new Set(xs.filter((x): x is string => !!x && !!x.trim())));

// ---------------------------------------------------------------------------
// Materials: derived legacy columns
// ---------------------------------------------------------------------------

const byCat = (rows: MaterialSpecRow[], ...cats: MaterialCategory[]) => rows.filter((r) => cats.includes(r.category));

export function deriveLegacyMaterials(rows: MaterialSpecRow[]) {
  return {
    boardMaterials: uniq(byCat(rows, "BOARD").map((r) => r.material)),
    boardBrands: uniq(byCat(rows, "BOARD").map((r) => r.brand)),
    surfaceFinishes: uniq(byCat(rows, "SURFACE_FINISH").map((r) => r.material)),
    finishBrands: uniq(byCat(rows, "SURFACE_FINISH").map((r) => r.brand)),
    hardwareFittings: uniq(byCat(rows, "HARDWARE").map((r) => r.material)),
    hardwareBrands: uniq(byCat(rows, "HARDWARE").map((r) => r.brand)),
    countertops: uniq(byCat(rows, "COUNTERTOP").map((r) => r.material)),
    flooringAndWalls: uniq(byCat(rows, "FLOORING", "WALL_FINISH").map((r) => r.material)),
  };
}

/** Legacy profiles (no materialSpecs): one row per listed material; brands paired by position only. */
function legacyMaterialRows(p: InteriorProfile): MaterialSpecRow[] {
  const rows: MaterialSpecRow[] = [];
  const add = (category: MaterialCategory, materials: string[] = [], brands: string[] = []) => {
    materials.forEach((material, i) => {
      rows.push({ id: `legacy-${category.toLowerCase()}-${i}`, category, material, brand: brands[i] ?? undefined });
    });
  };
  add("BOARD", p.boardMaterials, p.boardBrands);
  add("SURFACE_FINISH", p.surfaceFinishes, p.finishBrands);
  add("HARDWARE", p.hardwareFittings, p.hardwareBrands);
  add("COUNTERTOP", p.countertops);
  add("FLOORING", p.flooringAndWalls);
  return rows;
}

// ---------------------------------------------------------------------------
// Warranty
// ---------------------------------------------------------------------------

const yearsFor = (rows: WarrantyRow[], cat: WarrantyCategory) => rows.find((r) => r.category === cat)?.years ?? null;

function ensureSeedWarranties(rows: WarrantyRow[]): WarrantyRow[] {
  const seeds = createInteriorInitialValues().warranty.warranties;
  const out = [...rows];
  for (const seed of seeds) if (!out.some((r) => r.category === seed.category)) out.push(seed);
  return out;
}

// ---------------------------------------------------------------------------
// Consultation (legacy single-type derivation)
// ---------------------------------------------------------------------------

function legacyConsultationType(o: ConsultationOption): InteriorConsultationType | null {
  if (!o.type) return null;
  if (o.type === "ONLINE") return o.isFree ? "FREE_ONLINE" : "PAID_ONLINE";
  return o.isFree ? "FREE_SITE_VISIT" : "PAID_SITE_VISIT";
}

// ---------------------------------------------------------------------------
// Section payloads
// ---------------------------------------------------------------------------

export function formToProfilePayload(section: InteriorWizardSection, values: InteriorWizardValues): Payload {
  switch (section) {
    case "identity": {
      const i = values.identity;
      return asPayload({
        providerType: i.providerType || undefined,
        fullName: i.fullName,
        displayName: i.displayName,
        businessName: i.businessName,
        legalName: i.legalName,
        tagline: i.tagline,
        about: i.about,
        experienceYears: i.experienceYears,
        yearEstablished: i.yearEstablished,
        teamSizeRange: i.teamSizeRange || null,
        logo: nul(i.logo),
        coverBanner: nul(i.coverBanner),
        slug: i.slug.trim() || undefined,
        website: nul(i.website),
        instagram: nul(i.instagram),
        facebook: nul(i.facebook),
        linkedin: nul(i.linkedin),
        youtube: nul(i.youtube),
      });
    }
    case "location": {
      const l = values.location;
      return asPayload({
        countryCode: l.countryCode || "IN",
        primaryCity: l.primaryCity,
        primaryState: l.primaryState,
        primaryLocality: l.primaryLocality,
        primaryAddress: l.primaryAddress,
        primaryPincode: l.primaryPincode,
        primaryLat: l.primaryLat,
        primaryLng: l.primaryLng,
        serviceCities: arr(l.serviceCities),
        serviceLocalities: arr(l.serviceLocalities),
        servesOutstation: l.servesOutstation,
        siteVisitRadiusKm: l.siteVisitRadiusKm,
      });
    }
    case "services": {
      const s = values.services;
      const cap = s.areaCapacity;
      return asPayload({
        servicesOffered: arr(s.servicesOffered),
        commercialServices: arr(s.commercialServices),
        propertyTypesHandled: arr(s.propertyTypesHandled),
        budgetSegments: arr(s.budgetSegments),
        designStyles: arr(s.designStyles),
        executionCapabilities: arr(s.executionCapabilities),
        areaCapacity: { minSqft: cap.minSqft, maxSqft: cap.maxSqft, maxConcurrentProjects: cap.maxConcurrentProjects },
        minProjectAreaSqft: cap.minSqft,
        maxProjectAreaSqft: cap.maxSqft,
      });
    }
    case "materials": {
      const rows = arr(values.materials.materialSpecs);
      return asPayload({ materialSpecs: rows, ...deriveLegacyMaterials(rows) });
    }
    case "pricing": {
      const p = values.pricing;
      const quoteOnly = p.priceMode === "QUOTE_ONLY";
      const consult = arr(p.consultationOptions);
      const first = consult[0];
      const out: Record<string, unknown> = {
        isCustomQuotationOnly: quoteOnly,
        startingRateMin: quoteOnly ? null : p.startingRateMin,
        startingRateMax: quoteOnly ? null : p.startingRateMax,
        pricingUnit: p.pricingUnit || undefined,
        startingRateMaterialIncluded: p.startingRateMaterialIncluded,
        startingRateLaborIncluded: p.startingRateLaborIncluded,
        startingRateDesignIncluded: p.startingRateDesignIncluded,
        startingRateGstIncluded: p.startingRateGstIncluded,
        roomPricing: arr(p.roomPricing),
        consultationOptions: consult,
        branchPricingOverrides: arr(p.branchOverrides),
      };
      if (first && legacyConsultationType(first)) {
        out.consultationType = legacyConsultationType(first);
        out.consultationFee = first.isFree ? 0 : first.fee;
        out.consultationDurationMins = first.durationMins ?? null;
      }
      return asPayload(out);
    }
    case "portfolio":
      return {};
    case "team": {
      const t = values.team;
      return asPayload({
        qualification: t.qualification,
        institute: t.institute,
        coaRegistrationNumber: t.coaRegistrationNumber,
        iiidMembershipNumber: t.iiidMembershipNumber,
        awards: arr(t.awards),
        certifications: arr(t.certifications),
        gstin: nul(t.gstin.trim().toUpperCase()),
        panNumber: nul(t.panNumber.trim().toUpperCase()),
        cinNumber: nul(t.cinNumber.trim().toUpperCase()),
      });
    }
    case "warranty": {
      const w = values.warranty;
      const rows = arr(w.warranties);
      return asPayload({
        warranties: rows,
        support: {
          freeMaintenanceMonths: w.support.freeMaintenanceMonths,
          responseTimeHours: w.support.responseTimeHours,
          channels: arr(w.support.channels),
          afterSalesNote: w.support.afterSalesNote,
        },
        woodworkWarrantyYears: yearsFor(rows, "WOODWORK"),
        hardwareWarrantyYears: yearsFor(rows, "HARDWARE"),
        civilWarrantyYears: yearsFor(rows, "CIVIL"),
        freeMaintenanceMonths: w.support.freeMaintenanceMonths,
      });
    }
    case "contact": {
      const c = values.contact;
      const whatsapp = c.whatsappSameAsPhone ? c.phone : c.whatsapp;
      const contact = {
        contactName: c.contactName,
        phone: c.phone,
        whatsapp,
        email: c.email,
        showPhonePublicly: c.showPhonePublicly,
        workingDays: arr(c.workingDays),
        workingHours: { open: c.workingHours.open, close: c.workingHours.close },
        // null = not answered yet; kept as-is (no invented default)
        acceptingNewProjects: typeof c.acceptingNewProjects === "boolean" ? c.acceptingNewProjects : null,
        nextAvailableFrom: c.nextAvailableFrom || null,
        leadPreference: c.leadPreference,
      } as unknown as ContactAvailability;
      const out: Record<string, unknown> = {
        contact,
        contactPerson: nul(c.contactName),
        primaryPhone: nul(c.phone),
        whatsappPhone: nul(whatsapp),
        businessEmail: nul(c.email),
        isPhonePublic: c.showPhonePublicly,
        isEmailPublic: c.isEmailPublic,
      };
      if (c.leadPreference) out.preferredContactMethod = c.leadPreference;
      if (typeof c.acceptingNewProjects === "boolean") out.isAcceptingProjects = c.acceptingNewProjects;
      return asPayload(out);
    }
  }
}

/** Every section merged (no relations) — used by preview and the PATCH-404 fallback. */
export function formToProfileFields(values: InteriorWizardValues): Payload {
  return INTERIOR_SECTIONS.reduce<Payload>((acc, s) => ({ ...acc, ...formToProfilePayload(s, values) }), {});
}

/** Full profile-shaped object incl. relations (preview / tests). Server-controlled fields are not set. */
export function formToFullProfile(values: InteriorWizardValues): Partial<InteriorProfile> {
  return {
    ...formToProfileFields(values),
    wizardStep: values.wizardStep,
    branches: values.location.branches.map((b) => ({ ...(branchDraftToPayload(b) as InteriorBranch), id: b.serverId ?? 0 })),
    packages: values.pricing.packages.map((p) => ({ ...(packageDraftToPayload(p) as InteriorPackage), id: p.serverId ?? 0 })),
    projects: values.portfolio.projects.map((p) => ({ ...(projectDraftToPayload(p) as InteriorProject), id: p.serverId ?? 0 })),
    teamMembers: values.team.members.map((m) => ({ ...(memberDraftToPayload(m) as InteriorTeamMember), id: m.serverId ?? 0 })),
    credentials: values.team.credentials.map((d) => ({ ...d })),
  };
}

// ---------------------------------------------------------------------------
// Relations: draft <-> entity
// ---------------------------------------------------------------------------

export function branchDraftToPayload(b: InteriorBranchDraft): Partial<InteriorBranch> {
  return {
    branchName: b.branchName,
    branchType: (b.branchType || undefined) as InteriorBranch["branchType"],
    city: b.city,
    state: b.state || null,
    locality: b.locality,
    address: b.address,
    pincode: b.pincode,
    latitude: b.lat,
    longitude: b.lng,
    phone: b.phone || null,
    contactNumber: b.phone,
    managerName: b.managerName || null,
    branchManagerName: b.managerName,
    workingHours: b.workingHours,
    overridesCompanyPricing: b.overridesCompanyPricing,
    isActive: b.isActive,
  };
}

export function branchToDraft(b: InteriorBranch): InteriorBranchDraft {
  return {
    id: `branch-${b.id}`,
    serverId: b.id,
    branchName: str(b.branchName),
    branchType: b.branchType ?? "",
    city: str(b.city),
    state: str(b.state),
    locality: str(b.locality),
    address: str(b.address),
    pincode: str(b.pincode),
    lat: num(b.latitude),
    lng: num(b.longitude),
    phone: str(b.phone ?? b.contactNumber),
    managerName: str(b.managerName ?? b.branchManagerName),
    workingHours: str(b.workingHours),
    overridesCompanyPricing: !!b.overridesCompanyPricing,
    isActive: b.isActive ?? true,
  };
}

const specLine = (specs: InteriorPackageDraft["materialSpecs"], cat: MaterialCategory) => {
  const s = specs.find((x) => x.category === cat);
  if (!s || !s.spec) return null;
  return s.brand ? `${s.spec} (${s.brand})` : s.spec;
};

export function packageDraftToPayload(p: InteriorPackageDraft): Partial<InteriorPackage> {
  const specs = arr(p.materialSpecs);
  return {
    packageName: p.packageName,
    packageCategory: p.packageCategory,
    description: p.description || null,
    coverImage: p.coverImage || null,
    pricingMode: p.pricingMode || undefined,
    priceMin: p.priceMin as number,
    priceMax: p.pricingMode === "RANGE" ? p.priceMax : p.priceMax ?? null,
    pricingUnit: (p.pricingUnit || undefined) as InteriorPackage["pricingUnit"],
    applicablePropertyTypes: arr(p.applicablePropertyTypes),
    applicableBhk: arr(p.applicableBhk),
    inclusions: arr(p.inclusions),
    exclusions: arr(p.exclusions),
    materialSpecs: specs,
    warranty: { ...p.warranty },
    conditions: arr(p.conditions),
    branchIds: arr(p.branchIds),
    isActive: p.isActive,
    orderIndex: p.orderIndex,
    // legacy derived
    boardMaterialAndBrand: specLine(specs, "BOARD"),
    finishAndBrand: specLine(specs, "SURFACE_FINISH"),
    hardwareAndBrand: specLine(specs, "HARDWARE"),
    countertopSpec: specLine(specs, "COUNTERTOP"),
    flooringSpec: specLine(specs, "FLOORING"),
    lightingSpec: specLine(specs, "LIGHTING"),
    woodworkWarrantyYears: p.warranty?.woodworkYears ?? null,
    hardwareWarrantyYears: p.warranty?.hardwareYears ?? null,
    civilWarrantyYears: p.warranty?.civilYears ?? null,
  };
}

export function packageToDraft(p: InteriorPackage): InteriorPackageDraft {
  const legacySpecs: InteriorPackageDraft["materialSpecs"] = [];
  if (!p.materialSpecs?.length) {
    const push = (category: MaterialCategory, spec?: string | null) => spec && legacySpecs.push({ category, spec });
    push("BOARD", p.boardMaterialAndBrand);
    push("SURFACE_FINISH", p.finishAndBrand);
    push("HARDWARE", p.hardwareAndBrand);
    push("COUNTERTOP", p.countertopSpec);
    push("FLOORING", p.flooringSpec);
    push("LIGHTING", p.lightingSpec);
  }
  return {
    id: `package-${p.id}`,
    serverId: p.id,
    packageName: str(p.packageName),
    packageCategory: str(p.packageCategory),
    description: str(p.description),
    pricingMode: p.pricingMode ?? "",
    priceMin: num(p.priceMin),
    priceMax: num(p.priceMax),
    pricingUnit: p.pricingUnit ?? "",
    applicablePropertyTypes: arr(p.applicablePropertyTypes),
    applicableBhk: arr(p.applicableBhk),
    inclusions: arr(p.inclusions),
    exclusions: arr(p.exclusions),
    materialSpecs: p.materialSpecs?.length ? p.materialSpecs.map((s) => ({ ...s })) : legacySpecs,
    warranty: p.warranty
      ? { ...p.warranty }
      : { woodworkYears: p.woodworkWarrantyYears ?? null, hardwareYears: p.hardwareWarrantyYears ?? null, civilYears: p.civilWarrantyYears ?? null },
    conditions: arr(p.conditions),
    coverImage: str(p.coverImage),
    branchIds: p.branchIds ? [...p.branchIds] : (p.packageBranches ?? []).map((pb) => pb.branch.id),
    isActive: p.isActive ?? true,
    orderIndex: p.orderIndex ?? 0,
  };
}

export function projectDraftToPayload(p: InteriorProjectDraft): Partial<InteriorProject> {
  const galleries = arr(p.roomGalleries);
  const legacyRooms: Record<string, string[]> = {};
  for (const g of galleries) legacyRooms[g.customLabel || g.room] = [...g.images];
  const allImages = uniq([...galleries.flatMap((g) => g.images), ...arr(p.afterImages)]);
  return {
    title: p.title,
    propertyType: p.propertyType || null,
    projectCategory: p.propertyType,
    bhk: p.bhk || null,
    propertyConfig: p.bhk,
    areaSqft: p.areaSqft,
    carpetAreaSqft: p.areaSqft,
    cityName: p.city,
    locality: p.locality || null,
    branchId: p.branchId,
    budgetRange: p.budgetRange || null,
    durationDays: p.durationDays,
    executionDurationDays: p.durationDays,
    completionDate: p.completionDate,
    designStyle: p.designStyle,
    coverImage: p.coverImage || allImages[0] || "",
    roomGalleriesV2: galleries.map((g) => ({ ...g, images: [...g.images] })),
    roomGalleries: legacyRooms,
    beforeImages: arr(p.beforeImages),
    afterImages: arr(p.afterImages),
    images: allImages,
    materialsUsed: arr(p.materialsUsed),
    servicesPerformed: arr(p.servicesPerformed),
    description: p.description,
    isFeatured: p.isFeatured,
  };
}

export function projectToDraft(p: InteriorProject): InteriorProjectDraft {
  let galleries: RoomGallery[] = arr(p.roomGalleriesV2);
  if (!galleries.length && p.roomGalleries) {
    galleries = Object.entries(p.roomGalleries).map(([k, images]) => ({ room: "OTHER" as const, customLabel: k, images: arr(images) }));
  }
  return {
    id: `project-${p.id}`,
    serverId: p.id,
    title: str(p.title),
    propertyType: str(p.propertyType ?? p.projectCategory),
    bhk: str(p.bhk ?? p.propertyConfig),
    areaSqft: num(p.areaSqft ?? p.carpetAreaSqft),
    city: str(p.cityName),
    locality: str(p.locality),
    branchId: p.branchId ?? null,
    budgetRange: str(p.budgetRange),
    durationDays: num(p.durationDays ?? p.executionDurationDays),
    completionDate: str(p.completionDate).slice(0, 7),
    designStyle: str(p.designStyle),
    coverImage: str(p.coverImage),
    roomGalleries: galleries,
    beforeImages: arr(p.beforeImages),
    afterImages: arr(p.afterImages),
    materialsUsed: arr(p.materialsUsed),
    servicesPerformed: arr(p.servicesPerformed),
    description: str(p.description),
    isFeatured: !!p.isFeatured,
  };
}

/** Total images in a project draft (rooms + after + cover if not already counted). */
export function projectImageCount(p: Pick<InteriorProjectDraft, "roomGalleries" | "afterImages" | "coverImage">): number {
  return uniq([p.coverImage, ...arr(p.roomGalleries).flatMap((g) => g.images), ...arr(p.afterImages)]).length;
}

export function memberDraftToPayload(m: InteriorTeamMemberDraft): Partial<InteriorTeamMember> {
  return {
    name: m.name,
    designation: m.designation,
    qualification: m.qualification || null,
    experienceYears: m.experienceYears,
    profilePhoto: m.photo || null,
    branchId: m.branchId,
    interiorBranchId: m.branchId,
    orgMemberId: m.orgMemberId,
    isPublic: m.isPublic,
  };
}

export function memberToDraft(m: InteriorTeamMember): InteriorTeamMemberDraft {
  return {
    id: `member-${m.id}`,
    serverId: m.id,
    name: str(m.name),
    designation: str(m.designation),
    qualification: str(m.qualification),
    experienceYears: num(m.experienceYears),
    photo: str(m.profilePhoto),
    branchId: m.branchId ?? m.interiorBranchId ?? null,
    orgMemberId: m.orgMemberId ?? null,
    isPublic: m.isPublic ?? true,
  };
}

// ---------------------------------------------------------------------------
// Profile -> form
// ---------------------------------------------------------------------------

export function profileToForm(profile: Partial<InteriorProfile> | null | undefined): InteriorWizardValues {
  const v = createInteriorInitialValues();
  if (!profile) return v;
  const p = profile as InteriorProfile;

  v.wizardStep = num(p.wizardStep) ?? 1;

  v.identity = {
    providerType: p.providerType ?? "",
    fullName: str(p.fullName),
    displayName: str(p.displayName),
    businessName: str(p.businessName),
    legalName: str(p.legalName),
    tagline: str(p.tagline),
    about: str(p.about),
    experienceYears: num(p.experienceYears),
    yearEstablished: num(p.yearEstablished),
    teamSizeRange: (p.teamSizeRange as InteriorWizardValues["identity"]["teamSizeRange"]) ?? "",
    logo: str(p.logo),
    coverBanner: str(p.coverBanner),
    slug: str(p.slug),
    website: str(p.website),
    instagram: str(p.instagram),
    facebook: str(p.facebook),
    linkedin: str(p.linkedin),
    youtube: str(p.youtube),
  };

  v.location = {
    countryCode: str(p.countryCode) || "IN",
    primaryCity: str(p.primaryCity),
    primaryState: str(p.primaryState),
    primaryLocality: str(p.primaryLocality),
    primaryAddress: str(p.primaryAddress),
    primaryPincode: str(p.primaryPincode),
    primaryLat: num(p.primaryLat),
    primaryLng: num(p.primaryLng),
    serviceCities: arr(p.serviceCities),
    serviceLocalities: arr(p.serviceLocalities),
    servesOutstation: !!p.servesOutstation,
    siteVisitRadiusKm: num(p.siteVisitRadiusKm),
    branches: arr(p.branches).map(branchToDraft),
  };

  const cap = p.areaCapacity;
  v.services = {
    servicesOffered: arr(p.servicesOffered),
    commercialServices: arr(p.commercialServices),
    propertyTypesHandled: arr(p.propertyTypesHandled),
    budgetSegments: arr(p.budgetSegments) as InteriorWizardValues["services"]["budgetSegments"],
    designStyles: arr(p.designStyles),
    executionCapabilities: arr(p.executionCapabilities),
    areaCapacity: {
      minSqft: num(cap?.minSqft ?? p.minProjectAreaSqft),
      maxSqft: num(cap?.maxSqft ?? p.maxProjectAreaSqft),
      maxConcurrentProjects: num(cap?.maxConcurrentProjects),
    },
  };

  v.materials = {
    materialSpecs: p.materialSpecs?.length ? p.materialSpecs.map((r) => ({ ...r })) : legacyMaterialRows(p),
  };

  const startMin = num(p.startingRateMin);
  const consultation: ConsultationOption[] = p.consultationOptions?.length
    ? p.consultationOptions.map((o) => ({ ...o }))
    : p.consultationType
      ? [
          {
            id: "legacy-consultation",
            type: p.consultationType.endsWith("ONLINE") ? "ONLINE" : p.consultationType.endsWith("SITE_VISIT") ? "SITE_VISIT" : "IN_PERSON",
            isFree: p.consultationType.startsWith("FREE"),
            fee: p.consultationType.startsWith("FREE") ? null : num(p.consultationFee),
            durationMins: num(p.consultationDurationMins),
          },
        ]
      : [];
  v.pricing = {
    priceMode: p.isCustomQuotationOnly ? "QUOTE_ONLY" : startMin !== null ? "STARTING_PRICE" : "",
    startingRateMin: p.isCustomQuotationOnly ? null : startMin,
    startingRateMax: p.isCustomQuotationOnly ? null : num(p.startingRateMax),
    pricingUnit: p.pricingUnit && p.pricingUnit !== "CUSTOM_QUOTATION" ? p.pricingUnit : "",
    startingRateMaterialIncluded: !!p.startingRateMaterialIncluded,
    startingRateLaborIncluded: !!p.startingRateLaborIncluded,
    startingRateDesignIncluded: !!p.startingRateDesignIncluded,
    startingRateGstIncluded: !!p.startingRateGstIncluded,
    packages: arr(p.packages)
      .map(packageToDraft)
      .sort((a, b) => a.orderIndex - b.orderIndex),
    roomPricing: arr(p.roomPricing).map((r) => ({ ...r })),
    consultationOptions: consultation,
    branchOverrides: arr(p.branchPricingOverrides).map((o) => ({ ...o })),
  };

  v.portfolio = { projects: arr(p.projects).map(projectToDraft) };

  v.team = {
    qualification: str(p.qualification ?? p.designQualifications),
    institute: str(p.institute),
    coaRegistrationNumber: str(p.coaRegistrationNumber),
    iiidMembershipNumber: str(p.iiidMembershipNumber),
    awards: arr(p.awards),
    certifications: arr(p.certifications),
    gstin: str(p.gstin),
    panNumber: str(p.panNumber),
    cinNumber: str(p.cinNumber),
    members: arr(p.teamMembers).map(memberToDraft),
    credentials: arr(p.credentials).map((d: CredentialDocument) => ({ ...d, id: String(d.id) })),
  };

  let warranties: WarrantyRow[] = arr(p.warranties).map((r) => ({ ...r }));
  if (!warranties.length) {
    const legacy: [WarrantyCategory, number | null | undefined][] = [
      ["WOODWORK", p.woodworkWarrantyYears],
      ["HARDWARE", p.hardwareWarrantyYears],
      ["CIVIL", p.civilWarrantyYears],
    ];
    warranties = legacy.map(([category, years]) => ({
      id: `seed-${category.toLowerCase()}`,
      category,
      years: num(years),
      months: null,
      coverage: "",
      exclusions: "",
    }));
  }
  v.warranty = {
    warranties: ensureSeedWarranties(warranties),
    support: {
      freeMaintenanceMonths: num(p.support?.freeMaintenanceMonths ?? p.freeMaintenanceMonths),
      responseTimeHours: num(p.support?.responseTimeHours),
      channels: arr(p.support?.channels),
      afterSalesNote: str(p.support?.afterSalesNote),
    },
  };

  const c = p.contact as (Partial<ContactAvailability> & { acceptingNewProjects?: boolean | null }) | null | undefined;
  const phone = str(c?.phone ?? p.primaryPhone);
  const whatsapp = str(c?.whatsapp ?? p.whatsappPhone);
  const same = !!phone && whatsapp === phone;
  // v2 JSON wins (null = unanswered); legacy rows fall back to the flat column.
  const accepting = c ? (c.acceptingNewProjects ?? null) : (p.isAcceptingProjects ?? null);
  const leadPref = (c?.leadPreference || p.preferredContactMethod || "") as LeadPreference | "";
  v.contact = {
    contactName: str(c?.contactName ?? p.contactPerson),
    phone,
    whatsappSameAsPhone: same,
    whatsapp: same ? "" : whatsapp,
    email: str(c?.email ?? p.businessEmail),
    showPhonePublicly: c?.showPhonePublicly ?? !!p.isPhonePublic,
    isEmailPublic: !!p.isEmailPublic,
    leadPreference: (["CALL", "WHATSAPP", "EMAIL", "ANY"] as string[]).includes(leadPref) ? leadPref : "",
    workingDays: arr(c?.workingDays),
    workingHours: { open: str(c?.workingHours?.open), close: str(c?.workingHours?.close) },
    acceptingNewProjects: accepting,
    nextAvailableFrom: str(c?.nextAvailableFrom),
  };

  return v;
}
