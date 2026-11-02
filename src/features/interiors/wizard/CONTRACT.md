# Interior wizard v2 — shared contract

Source of truth for every chunk (engine UI, data layer, wizard screens, dashboard, backend).
Code wins over this doc if they ever drift: `src/lib/listingEngine/types.ts`, `src/types/interior.types.ts`,
`src/features/interiors/wizard/steps/*`. Regenerate the step tables from `interiorSteps` if config changes.

## 1. Engine types (`@/lib/listingEngine/types`)

Key rules:
- Field `id`s are dotted paths into `InteriorWizardValues` (RHF registers them directly).
- `visibleWhen` / `requiredWhen` / `disabledIf` are `Condition`s; `{ preset: "name" }` looks up `VerticalConfig.predicates`.
- A field is mandatory when `required` or `requiredWhen` holds. `requiredFor: "PUBLISH"` marks a field that is **not** blocking Next but is a publish-readiness item (badge only). Readiness is decided by `ReadinessRule`s, not by field flags.
- Sections with `kind: "custom"` have `fields: []`, render `customComponents[component]`, enforce `requires[]` on Next, and score via `scorePaths` + `weight`.
- `repeater` fields: `meta.itemFields: FieldConfig[]` whose ids are **relative to the row**; their `visibleWhen` conditions use row-relative paths too (e.g. `{ field: "isFree", notEquals: true }`). `meta.newItem` is the empty row (the renderer adds `id: \`${meta.idPrefix}-${uuid}\``), `meta.addLabel`, `meta.emptyText`.
- `upload`: `meta.category` ("interiors"), `meta.subFolder` (`profile|cover|projects/<id>|docs`), `meta.accept`, `meta.aspect` ("square"|"wide"). Value is a URL string.
- `gallery`: string[]; `meta.subFolder`, `maxItems`, `meta.withCaptions`.
- `price`: `unitField`, `unitOptions`, `meta.showWords` (Indian number words via `numberToWords`).
- `number`: `meta.suffix` (e.g. "km"). `text`: `meta.uppercase`. `chip-multi`: `meta.grouped` (group by `Option.group`), `meta.presets: {label, value[]}[]` one-tap fills, `maxItems`.
- `radio`: `meta.variant: "cards"` renders big option cards with `Option.description`.
- `tel`: `meta.suggestFromUser` → show "Use my number" button (from `getStoredUserContact`), never auto-fill.
- slug text field: `meta.slugPreview`, `meta.prefix`, `meta.cityField`, `meta.sourceFields`.

```ts
export type Condition =
  | { field: string; equals: Primitive }
  | { field: string; notEquals: Primitive }
  | { field: string; in: Primitive[] }
  | { field: string; gt: number }
  | { field: string; gte: number }
  | { field: string; lt: number }
  | { field: string; lte: number }
  | { field: string; exists: boolean }
  /** array length >= n (missing / non-array counts as 0). */
  | { field: string; minItems: number }
  | { and: Condition[] }
  | { or: Condition[] }
  | { not: Condition }
  | { preset: string };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type FormValues = Record<string, any>;

/** Named predicates referenced by `{ preset: "name" }`. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Predicate<V extends FormValues = any> = (values: V) => boolean;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type PredicateRegistry<V extends FormValues = any> = Record<string, Predicate<V>>;

export type FieldType =
  // ---- ported from the property engine ----
  | "text"
  | "textarea"
  | "number"
  | "date"
  | "month-year"
  | "counter"
  | "select"
  | "radio"
  | "chip-radio"
  | "chip-multi"
  | "chip-add"
  | "toggle"
  | "checkbox"
  | "measure"
  | "dimension"
  | "price"
  | "media"
  // ---- new generic types ----
  | "email"
  | "tel"
  | "url"
  | "time"
  /** SearchableSelect with optional free-text entry (meta.allowCustom). */
  | "searchable-select"
  /** PropertyListingCitySelector; meta.stateField / latField / lngField name sibling paths. */
  | "city-select"
  /** PropertyListingLocalitySelector; meta.cityField names the city path. */
  | "locality-select"
  /** multi-value searchable picker (e.g. service cities). */
  | "multi-select"
  /** free-text tag list (string[]) — inclusions, awards ... */
  | "tags"
  /** useFieldArray; row sub-fields in meta.itemFields (FieldConfig[] with ids relative to the row). */
  | "repeater"
  /** single file via presign; meta.category, meta.subFolder, meta.accept. Value = URL string. */
  | "upload"
  /** multi image (string[]); meta.subFolder, meta.maxItems, meta.withCaptions. */
  | "gallery"
  /** field-level custom component; `component` names a key in VerticalConfig.customComponents. */
  | "custom";

export type Option = {
  value: string | number | boolean;
  label: string;
  icon?: string;
  /** optional short hint under the chip/card label. */
  description?: string;
  /** chips are grouped under this heading when present. */
  group?: string;
  /** optional thumbnail (e.g. design style images). */
  image?: string;
  visibleWhen?: Condition;
  disabledIf?: Condition;
};

export type FieldConfig = {
  id: string;
  label: string;
  type: FieldType;
  rows?: number;
  placeholder?: string;
  helpText?: string;
  required?: boolean;
  requiredWhen?: Condition;
  visibleWhen?: Condition;
  disabledIf?: Condition;
  options?: Option[];
  min?: number;
  max?: number;
  step?: number;
  /** text/textarea length limits — shown as a counter. */
  minLength?: number;
  maxLength?: number;
  /** chip-multi / multi-select / tags / gallery: maximum selections. */
  maxItems?: number;
  /** measure/dimension/price: sibling path holding the unit value. */
  unitField?: string;
  unitOptions?: Option[];
  perUnitField?: string;
  /** custom: key in VerticalConfig.customComponents. */
  component?: string;
  /** scoring weight; defaults to 3 for required, 1 for optional. */
  weight?: number;
  /** clear the value when `visibleWhen` becomes false. Default true. */
  resetOnHide?: boolean;
  /** Which readiness level makes this field mandatory — drives badges. Default "SUBMIT" when required. */
  requiredFor?: ReadinessLevel;
  /** free-form renderer hints (see CONTRACT.md for per-type keys). */
  meta?: Record<string, unknown>;
};

/** A required path that a custom section enforces (custom sections have no fields to inspect). */
export type CustomRequirement = {
  path: string;
  label: string;
  when?: Condition;
  /** array value must have at least this many items (default: non-empty). */
  minItems?: number;
};

export type SectionConfig = {
  id: string;
  title?: string;
  description?: string;
  /** "config" (default) renders `fields`; "custom" renders `component`. */
  kind?: "config" | "custom";
  /** custom: key in VerticalConfig.customComponents. */
  component?: string;
  /** custom: static props passed through as `CustomStepProps.props`. */
  props?: Record<string, unknown>;
  /** custom: what Next/validation must enforce for this section. */
  requires?: CustomRequirement[];
  /** custom: scoring weight + the paths whose fill state counts. */
  weight?: number;
  scorePaths?: string[];
  mobileColumns?: 2;
  requiredHint?: string;
  /** badge "Required to submit" / "Required for publish". */
  badge?: ReadinessLevel;
  visibleWhen?: Condition;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  /** manage mode: show "Changes go live after review". */
  moderated?: boolean;
  fields: FieldConfig[];
};

export type StepConfig = {
  id: string;
  label: string;
  title?: string;
  caption?: string;
  description?: string;
  /** icon keyword for the step rail (lucide name). */
  icon?: string;
  /** "config" renders `sections`; "custom" delegates the whole step to `component`. */
  kind?: "config" | "custom";
  component?: string;
  sections?: SectionConfig[];
  /** custom steps: required paths / scoring (mirrors SectionConfig). */
  requires?: CustomRequirement[];
  weight?: number;
  scorePaths?: string[];
  /** the step is shown only when this holds. */
  visibleWhen?: Condition;
};

export type ReadinessLevel = "SUBMIT" | "PUBLISH";

export interface ReadinessItem {
  id: string;
  stepId: string;
  label: string;
  level: ReadinessLevel;
  done: boolean;
  fieldPath?: string;
}

export interface ReadinessReport {
  canSubmit: boolean;
  canPublish: boolean;
  items: ReadinessItem[];
  pct: number;
}

export type ReadinessRule<V extends FormValues = FormValues> = {
  id: string;
  stepId: string;
  label: string;
  /** levels this rule gates; one ReadinessItem is emitted per level. */
  levels: ReadinessLevel[];
  fieldPath?: string;
  /** rule applies only when true (e.g. company-only). Default: always. */
  appliesWhen?: (values: V) => boolean;
  check: (values: V) => boolean;
};

export type WizardMode = "wizard" | "manage";

export type CustomStepProps<V extends FormValues = FormValues> = {
  values: V;
  form: UseFormReturn<V>;
  mode: WizardMode;
  /** the section (or a synthetic one for custom steps) being rendered. */
  section?: SectionConfig;
  /** static props from SectionConfig.props / FieldConfig.meta. */
  props?: Record<string, unknown>;
  /** custom fields: the field config + its path. */
  field?: FieldConfig;
  /** navigate to a step (and optionally focus a field path). */
  goToStep?: (stepId: string, fieldPath?: string) => void;
  readiness?: ReadinessReport;
};

export type VerticalConfig<V extends FormValues> = {
  id: string;
  steps: StepConfig[];
  initialValues: V;
  predicates: PredicateRegistry<V>;
  customComponents: Record<string, ComponentType<CustomStepProps<V>>>;
  stepSchemas?: Record<string, ZodType>;
  readinessRules: ReadinessRule<V>[];
  storageKey: string;
  load: () => { data?: V; isLoading: boolean; updatedAt?: string | null; wizardStep?: number | null };
  saveSection: (stepId: string, values: V) => Promise<void>;
  submit: (values: V) => Promise<void>;
  publish: (values: V) => Promise<void>;
};
```

Engine functions (`@/lib/listingEngine`): `getValue`, `evaluateCondition(values, cond, predicates)`, `preset(name)`,
`getRequiredFieldsForStep`, `requiredPathsForStep`, `allRequiredPaths`, `missingRequiredForStep`, `isFieldFilled(values, path, minItems?)`,
`isSectionVisible`, `isStepVisible`, `computeScore(steps, values, {predicates})`, `computeReadiness(rules, values)`,
`stepReadinessStatus(report, stepId, level?)`, `createDraftStorage<T>(key, {sanitize})`, `isLocalNewer(local, serverUpdatedAt)`.
Chunk A adds `useAutosave` (`lib/listingEngine/useAutosave.ts`) and all UI in `components/listingEngine/*`.

## 2. Interior vertical (`features/interiors/wizard`)

- `vertical.ts`: `createInteriorVertical(deps: Partial<InteriorVerticalDeps>)` and static `interiorVertical`; `INTERIOR_STORAGE_KEY = "interiorWizardDraft:v2"`.
  `InteriorVerticalDeps = { load, saveSection(section, values), submit, publish, customComponents?, readinessRules?, stepSchemas? }`.
  Chunk B wires these in `useInteriorWizard.ts`: load ← `useGetMyInteriorProfileQuery`+`profileToForm`; saveSection ← `usePatchMyInteriorSectionMutation`; submit ← `useSubmitMyInteriorProfileMutation`; publish ← `usePublishMyInteriorProfileMutation`. Chunk B supplies `interiorReadinessRules` (readiness.ts) and `stepSchemas` (schema.ts, keyed by step id).
- `steps/index.ts`: `interiorSteps` (order below), `INTERIOR_CUSTOM_COMPONENT_NAMES`, `InteriorCustomComponentName`.
- `predicates.ts` (`interiorPredicates`): `isIndividual, isCompany, hasProviderType, isQuoteOnly, showsStartingPrice, hasBranches, hasBranchOverrides, offersConsultation, whatsappDifferent, notAcceptingProjects`.
- `initialValues.ts`: `createInteriorInitialValues()` / `interiorInitialValues` — empty; warranty pre-seeded with empty WOODWORK/HARDWARE/CIVIL rows (`id: "seed-woodwork"` etc.).
- `options.ts`: all option lists + `PACKAGE_PRESETS`, `MATERIAL_CATEGORIES` (with per-category materials/brands), `MATERIAL_QUICK_ADD`, `BRANCH_TYPES`, `ROOM_TYPES`, `WARRANTY_CATEGORIES`, `SUPPORT_CHANNELS`, `CREDENTIAL_DOC_TYPES` (with `for`), `GSTIN_REGEX`, `PAN_REGEX`, `INDIAN_PHONE_REGEX`, `MAX_DESIGN_STYLES = 8`.

Step ids == section keys == `InteriorWizardSection` == `:section` in `PATCH /interiors/me/sections/:section`:
`identity, location, services, materials, pricing, portfolio, team, warranty, contact` (wizardStep 1..9 in that order).

### Step `identity` — Business identity

| Section | Kind / component | Badge | Visible when | Fields / requires |
|---|---|---|---|---|
| `providerType` | custom `ProviderTypeCards` | SUBMIT |  | requires: `identity.providerType`; props: - |
| `individualBasics` | config | SUBMIT | {"preset":"isIndividual"} | `identity.fullName` (text, required)<br>`identity.displayName` (text, required)<br>`identity.experienceYears` (number) |
| `companyBasics` | config | SUBMIT | {"preset":"isCompany"} | `identity.businessName` (text, required)<br>`identity.legalName` (text)<br>`identity.yearEstablished` (number)<br>`identity.teamSizeRange` (chip-radio) |
| `pitch` | config | PUBLISH | {"preset":"hasProviderType"} | `identity.tagline` (text)<br>`identity.about` (textarea, requiredFor PUBLISH) |
| `branding` | config | PUBLISH | {"preset":"hasProviderType"} | `identity.logo` (upload, requiredFor PUBLISH)<br>`identity.coverBanner` (upload) |
| `links` | config |  | {"preset":"hasProviderType"} | `identity.website` (url)<br>`identity.instagram` (url)<br>`identity.facebook` (url)<br>`identity.linkedin` (url)<br>`identity.youtube` (url)<br>`identity.slug` (text) |

### Step `location` — Location & branches  (visibleWhen {"preset":"hasProviderType"})

| Section | Kind / component | Badge | Visible when | Fields / requires |
|---|---|---|---|---|
| `primaryLocation` | custom `PrimaryLocationEditor` | SUBMIT |  | requires: `location.primaryCity`, `location.primaryLocality`; props: `{"cityField":"location.primaryCity","stateField":"location.primaryState","localityField":"location.primaryLocality","addressField":"location.primaryAddress","pincodeField":"location.primaryPincode","latField":"location.primaryLat","lngField":"location.primaryLng","serviceCitiesField":"location.serviceCities","serviceLocalitiesField":"location.serviceLocalities"}` |
| `reach` | config |  |  | `location.siteVisitRadiusKm` (number)<br>`location.servesOutstation` (toggle) |
| `branches` | custom `BranchManager` | SUBMIT | {"preset":"isCompany"} | requires: `location.branches` when {"preset":"isCompany"}; props: - |

### Step `services` — Services  (visibleWhen {"preset":"hasProviderType"})

| Section | Kind / component | Badge | Visible when | Fields / requires |
|---|---|---|---|---|
| `offerings` | config | SUBMIT |  | `services.servicesOffered` (chip-multi, required)<br>`services.propertyTypesHandled` (chip-multi, required) |
| `segment` | config |  |  | `services.budgetSegments` (chip-multi)<br>`services.areaCapacity.minSqft` (number)<br>`services.areaCapacity.maxSqft` (number)<br>`services.areaCapacity.maxConcurrentProjects` (number) |
| `styles` | config | PUBLISH |  | `services.designStyles` (chip-multi, requiredFor PUBLISH) |
| `execution` | config |  |  | `services.executionCapabilities` (chip-multi) |

### Step `materials` — Materials & brands  (visibleWhen {"preset":"hasProviderType"})

| Section | Kind / component | Badge | Visible when | Fields / requires |
|---|---|---|---|---|
| `materialSpecs` | custom `MaterialSpecTable` | PUBLISH |  | requires: -; props: `{"field":"materials.materialSpecs"}` |

### Step `pricing` — Pricing & packages  (visibleWhen {"preset":"hasProviderType"})

| Section | Kind / component | Badge | Visible when | Fields / requires |
|---|---|---|---|---|
| `startingPrice` | config | SUBMIT |  | `pricing.priceMode` (radio, required)<br>`pricing.startingRateMin` (price, requiredWhen {"preset":"showsStartingPrice"}, visibleWhen {"preset":"showsStartingPrice"})<br>`pricing.startingRateMax` (price, visibleWhen {"preset":"showsStartingPrice"})<br>`pricing.pricingUnit` (select, requiredWhen {"preset":"showsStartingPrice"}, visibleWhen {"preset":"showsStartingPrice"})<br>`pricing.startingRateMaterialIncluded` (checkbox, visibleWhen {"preset":"showsStartingPrice"})<br>`pricing.startingRateLaborIncluded` (checkbox, visibleWhen {"preset":"showsStartingPrice"})<br>`pricing.startingRateDesignIncluded` (checkbox, visibleWhen {"preset":"showsStartingPrice"})<br>`pricing.startingRateGstIncluded` (checkbox, visibleWhen {"preset":"showsStartingPrice"}) |
| `packages` | custom `PackageManager` | PUBLISH |  | requires: -; props: `{"field":"pricing.packages","materialSpecsField":"materials.materialSpecs"}` |
| `roomPricing` | custom `RoomPricingTable` |  |  | requires: -; props: `{"field":"pricing.roomPricing"}` |
| `consultation` | config |  |  | `pricing.consultationOptions` (repeater) |
| `branchOverrides` | custom `BranchPricingOverrides` |  | {"preset":"hasBranchOverrides"} | requires: -; props: `{"field":"pricing.branchOverrides","branchesField":"location.branches","packagesField":"pricing.packages"}` |

### Step `portfolio` — Portfolio  (visibleWhen {"preset":"hasProviderType"})

| Section | Kind / component | Badge | Visible when | Fields / requires |
|---|---|---|---|---|
| `projects` | custom `PortfolioManager` | PUBLISH |  | requires: -; props: `{"field":"portfolio.projects","materialSpecsField":"materials.materialSpecs","branchesField":"location.branches","minImages":3}` |

### Step `team` — Team & credentials  (visibleWhen {"preset":"hasProviderType"})

| Section | Kind / component | Badge | Visible when | Fields / requires |
|---|---|---|---|---|
| `individualCredentials` | config |  | {"preset":"isIndividual"} | `team.qualification` (text)<br>`team.institute` (text)<br>`team.coaRegistrationNumber` (text)<br>`team.iiidMembershipNumber` (text)<br>`team.awards` (tags)<br>`team.certifications` (tags) |
| `companyRegistration` | config |  | {"preset":"isCompany"} | `team.gstin` (text)<br>`team.panNumber` (text)<br>`team.cinNumber` (text)<br>`team.awards` (tags) |
| `members` | custom `TeamManager` |  | {"preset":"isCompany"} | requires: -; props: `{"field":"team.members","branchesField":"location.branches"}` |
| `documents` | custom `DocumentUploader` | SUBMIT |  | requires: `team.credentials`; props: `{"field":"team.credentials"}` |

### Step `warranty` — Warranty & support  (visibleWhen {"preset":"hasProviderType"})

| Section | Kind / component | Badge | Visible when | Fields / requires |
|---|---|---|---|---|
| `warranties` | custom `WarrantyMatrix` | PUBLISH |  | requires: -; props: `{"field":"warranty.warranties"}` |
| `support` | config |  |  | `warranty.support.freeMaintenanceMonths` (number)<br>`warranty.support.responseTimeHours` (number)<br>`warranty.support.channels` (chip-multi)<br>`warranty.support.afterSalesNote` (textarea) |

### Step `contact` — Contact & publish  (visibleWhen {"preset":"hasProviderType"})

| Section | Kind / component | Badge | Visible when | Fields / requires |
|---|---|---|---|---|
| `contactDetails` | config | SUBMIT |  | `contact.contactName` (text)<br>`contact.phone` (tel, required)<br>`contact.whatsappSameAsPhone` (toggle)<br>`contact.whatsapp` (tel, visibleWhen {"preset":"whatsappDifferent"})<br>`contact.email` (email)<br>`contact.showPhonePublicly` (toggle)<br>`contact.isEmailPublic` (toggle)<br>`contact.leadPreference` (chip-radio) |
| `availability` | config |  |  | `contact.workingDays` (chip-multi)<br>`contact.workingHours.open` (time)<br>`contact.workingHours.close` (time)<br>`contact.acceptingNewProjects` (chip-radio)<br>`contact.nextAvailableFrom` (date, visibleWhen {"preset":"notAcceptingProjects"}) |
| `readiness` | custom `ReadinessChecklist` |  |  | requires: -; props: - |
| `preview` | custom `PublicPreview` |  |  | requires: -; props: - |

## 3. Custom components (Chunk C, registered as `interiorCustomComponents` in `components/interiors/wizard/index.ts`)

All receive `CustomStepProps<InteriorWizardValues>`:
`{ values, form: UseFormReturn<InteriorWizardValues>, mode: "wizard"|"manage", section?, props?, field?, goToStep?(stepId, fieldPath?), readiness? }` — `props` is `SectionConfig.props`.
Write through `form.setValue(path, v, { shouldDirty: true, shouldValidate: true })` so autosave sees it.

| Name | Owns path(s) | Notes |
|---|---|---|
| `ProviderTypeCards` | `identity.providerType` | Two big cards; AlertDialog confirm when switching with data present. |
| `PrimaryLocationEditor` | `location.primary*`, `serviceCities`, `serviceLocalities` | Paths come in `props.*Field`. City/Locality selectors, "Serve all of my state" chip. |
| `BranchManager` | `location.branches` | Cards + Sheet/Drawer; add/update/delete mutations immediately; sets `serverId`; one HEAD_OFFICE. |
| `MaterialSpecTable` | `materials.materialSpecs` | Accordions per `MaterialCategory`, quick-add chips, custom material/brand (`isCustom`). |
| `PackageManager` | `pricing.packages` | Presets prefill `materialSpecs` from step 4; save via `useSaveInteriorPackageMutation`; reorder/delete/duplicate/toggle. Price optional when quote-only. |
| `RoomPricingTable` | `pricing.roomPricing` | Rows of `RoomPricingRow`. |
| `BranchPricingOverrides` | `pricing.branchOverrides` | Only branches with `overridesCompanyPricing` and a `serverId`. |
| `PortfolioManager` | `portfolio.projects` | Grid + multi-section editor (basics, room galleries, before/after, materials used, services+description). `props.minImages = 3`. |
| `TeamManager` | `team.members` | Manual add/edit only (no property Organization import). |
| `DocumentUploader` | `team.credentials` | Doc types filtered by provider (`CREDENTIAL_DOC_TYPES[].for`); status chips. |
| `WarrantyMatrix` | `warranty.warranties` | One row per `WarrantyCategory`; add more categories. |
| `ReadinessChecklist` | — | `readiness` matrix Submit × Publish; item click → `goToStep(stepId, fieldPath)`. |
| `PublicPreview` | — | Directory card + condensed profile from mapped values. |

## 4. Wizard form values & persisted types (`@/types/interior.types`)

```ts
export enum InteriorListingStatus {
  DRAFT = "DRAFT",
  SUBMITTED = "SUBMITTED",
  IN_REVIEW = "IN_REVIEW",
  CHANGES_REQUESTED = "CHANGES_REQUESTED",
  PUBLISHED = "PUBLISHED",
  PAUSED = "PAUSED",
  TEMP_UNAVAILABLE = "TEMP_UNAVAILABLE",
  ARCHIVED = "ARCHIVED",
  REJECTED = "REJECTED",
}

export type MaterialCategory =
  | "BOARD"
  | "SURFACE_FINISH"
  | "HARDWARE"
  | "COUNTERTOP"
  | "FLOORING"
  | "WALL_FINISH"
  | "LIGHTING"
  | "SANITARY"
  | "OTHER";

export interface MaterialSpecRow {
  id: string;
  category: MaterialCategory;
  material: string;
  brand?: string;
  grade?: string;
  thicknessMm?: number | null;
  finish?: string;
  isCustom?: boolean;
  notes?: string;
}

export type DesignStyle = string;

export interface AreaCapacity {
  minSqft?: number | null;
  maxSqft?: number | null;
  maxConcurrentProjects?: number | null;
}

export type RoomType =
  | "LIVING"
  | "KITCHEN"
  | "MASTER_BEDROOM"
  | "BEDROOM"
  | "KIDS_ROOM"
  | "BATHROOM"
  | "DINING"
  | "POOJA"
  | "STUDY"
  | "BALCONY"
  | "FOYER"
  | "OTHER";

export interface RoomPricingRow {
  id: string;
  room: RoomType | "";
  customLabel?: string;
  /** null while the row is being filled in the wizard. */
  priceMin: number | null;
  priceMax?: number | null;
  unit: InteriorPricingUnit | "";
  inclusions?: string[];
}

/** Consultation mode for v2 consultation options (legacy InteriorConsultationType is kept). */
export type ConsultationMode = "ONLINE" | "IN_PERSON" | "SITE_VISIT";

export interface ConsultationOption {
  id: string;
  type: ConsultationMode | "";
  fee: number | null;
  isFree: boolean;
  durationMins?: number | null;
  adjustableAgainstProject?: boolean;
}

export type InteriorPackagePricingMode = "FIXED" | "RANGE" | "PER_UNIT";

export interface PackageMaterialSpec {
  category: MaterialCategory;
  spec: string;
  brand?: string;
}

export interface PackageWarranty {
  woodworkYears?: number | null;
  hardwareYears?: number | null;
  civilYears?: number | null;
}

export interface BranchPricingOverride {
  branchId: number;
  startingRateMin?: number | null;
  startingRateMax?: number | null;
  pricingUnit?: InteriorPricingUnit;
  packageOverrides?: { packageId: number; priceMin: number; priceMax?: number | null }[];
}

export interface RoomGallery {
  room: RoomType;
  customLabel?: string;
  images: string[];
}

export type WarrantyCategory =
  | "WOODWORK"
  | "HARDWARE"
  | "CIVIL"
  | "ELECTRICAL"
  | "PLUMBING"
  | "PAINT"
  | "APPLIANCES"
  | "OTHER";

export interface WarrantyRow {
  id: string;
  category: WarrantyCategory;
  /** null = not filled yet (wizard pre-seeds empty WOODWORK/HARDWARE/CIVIL rows). */
  years: number | null;
  months?: number | null;
  coverage?: string;
  exclusions?: string;
}

export type SupportChannel = "PHONE" | "WHATSAPP" | "EMAIL" | "IN_APP" | "SITE_VISIT";

export interface SupportPolicy {
  freeMaintenanceMonths?: number | null;
  responseTimeHours?: number | null;
  channels: SupportChannel[];
  afterSalesNote?: string;
}

export type CredentialDocType =
  | "GST_CERT"
  | "PAN"
  | "COI"
  | "MSME"
  | "TRADE_LICENSE"
  | "COA_REG"
  | "IIID_MEMBERSHIP"
  | "DEGREE"
  | "ID_PROOF"
  | "OTHER";

/** Per-document review status (mirrors moderation outcomes). */
export type CredentialStatus = "PENDING" | "VERIFIED" | "REJECTED";

export interface CredentialDocument {
  id: string;
  type: CredentialDocType;
  fileUrl: string;
  number?: string;
  status: CredentialStatus;
  rejectionReason?: string;
  uploadedAt?: string;
}

export type LeadPreference = "CALL" | "WHATSAPP" | "EMAIL" | "ANY";

export interface ContactAvailability {
  contactName: string;
  phone: string;
  whatsapp?: string;
  email?: string;
  showPhonePublicly: boolean;
  workingDays: string[];
  workingHours: { open: string; close: string };
  acceptingNewProjects: boolean;
  nextAvailableFrom?: string | null;
  leadPreference: LeadPreference;
}

export type { ReadinessLevel, ReadinessItem, ReadinessReport } from "@/lib/listingEngine/types";

export type InteriorTeamSizeRange = "1-5" | "6-15" | "16-50" | "51-200" | "200+";
export type InteriorBudgetSegment = "ECONOMY" | "MID_RANGE" | "PREMIUM" | "LUXURY";
export type InteriorPriceMode = "STARTING_PRICE" | "QUOTE_ONLY";

// ---- Wizard form tree -------------------------------------------------------
// Repeater rows carry a client `id` (string uuid) and, once persisted, the
// server numeric id in `serverId`.

export interface InteriorBranchDraft {
  id: string;
  serverId?: number | null;
  branchName: string;
  branchType: InteriorBranchType | "";
  city: string;
  state: string;
  locality: string;
  address: string;
  pincode: string;
  lat: number | null;
  lng: number | null;
  phone: string;
  managerName: string;
  workingHours: string;
  overridesCompanyPricing: boolean;
  isActive: boolean;
}

export interface InteriorPackageDraft {
  id: string;
  serverId?: number | null;
  packageName: string;
  packageCategory: string;
  description: string;
  pricingMode: InteriorPackagePricingMode | "";
  priceMin: number | null;
  priceMax: number | null;
  pricingUnit: InteriorPricingUnit | "";
  applicablePropertyTypes: string[];
  applicableBhk: string[];
  inclusions: string[];
  exclusions: string[];
  materialSpecs: PackageMaterialSpec[];
  warranty: PackageWarranty;
  conditions: string[];
  coverImage: string;
  branchIds: number[];
  isActive: boolean;
  orderIndex: number;
}

export interface InteriorProjectDraft {
  id: string;
  serverId?: number | null;
  title: string;
  propertyType: string;
  bhk: string;
  areaSqft: number | null;
  city: string;
  locality: string;
  branchId: number | null;
  budgetRange: string;
  durationDays: number | null;
  /** "YYYY-MM", user entered. */
  completionDate: string;
  designStyle: string;
  coverImage: string;
  roomGalleries: RoomGallery[];
  beforeImages: string[];
  afterImages: string[];
  materialsUsed: MaterialSpecRow[];
  servicesPerformed: string[];
  description: string;
  isFeatured: boolean;
}

export interface InteriorTeamMemberDraft {
  id: string;
  serverId?: number | null;
  name: string;
  designation: string;
  qualification: string;
  experienceYears: number | null;
  photo: string;
  branchId: number | null;
  orgMemberId: number | null;
  isPublic: boolean;
}

export interface InteriorWizardValues {
  /** 1-based index of the furthest step reached (server: profile.wizardStep). */
  wizardStep: number;
  identity: {
    providerType: InteriorProviderType | "";
    fullName: string;
    displayName: string;
    businessName: string;
    legalName: string;
    tagline: string;
    about: string;
    experienceYears: number | null;
    yearEstablished: number | null;
    teamSizeRange: InteriorTeamSizeRange | "";
    logo: string;
    coverBanner: string;
    slug: string;
    website: string;
    instagram: string;
    facebook: string;
    linkedin: string;
    youtube: string;
  };
  location: {
    primaryCity: string;
    primaryState: string;
    primaryLocality: string;
    primaryAddress: string;
    primaryPincode: string;
    primaryLat: number | null;
    primaryLng: number | null;
    serviceCities: string[];
    serviceLocalities: string[];
    servesOutstation: boolean;
    siteVisitRadiusKm: number | null;
    branches: InteriorBranchDraft[];
  };
  services: {
    servicesOffered: string[];
    commercialServices: string[];
    propertyTypesHandled: string[];
    budgetSegments: InteriorBudgetSegment[];
    designStyles: string[];
    executionCapabilities: string[];
    areaCapacity: { minSqft: number | null; maxSqft: number | null; maxConcurrentProjects: number | null };
  };
  materials: {
    materialSpecs: MaterialSpecRow[];
  };
  pricing: {
    priceMode: InteriorPriceMode | "";
    startingRateMin: number | null;
    startingRateMax: number | null;
    pricingUnit: InteriorPricingUnit | "";
    startingRateMaterialIncluded: boolean;
    startingRateLaborIncluded: boolean;
    startingRateDesignIncluded: boolean;
    startingRateGstIncluded: boolean;
    packages: InteriorPackageDraft[];
    roomPricing: RoomPricingRow[];
    consultationOptions: ConsultationOption[];
    branchOverrides: BranchPricingOverride[];
  };
  portfolio: {
    projects: InteriorProjectDraft[];
  };
  team: {
    qualification: string;
    institute: string;
    coaRegistrationNumber: string;
    iiidMembershipNumber: string;
    awards: string[];
    certifications: string[];
    gstin: string;
    panNumber: string;
    cinNumber: string;
    members: InteriorTeamMemberDraft[];
    credentials: CredentialDocument[];
  };
  warranty: {
    warranties: WarrantyRow[];
    support: {
      freeMaintenanceMonths: number | null;
      responseTimeHours: number | null;
      channels: SupportChannel[];
      afterSalesNote: string;
    };
  };
  contact: {
    contactName: string;
    phone: string;
    whatsappSameAsPhone: boolean;
    whatsapp: string;
    email: string;
    showPhonePublicly: boolean;
    isEmailPublic: boolean;
    leadPreference: LeadPreference | "";
    workingDays: string[];
    workingHours: { open: string; close: string };
    /** null until the provider answers. */
    acceptingNewProjects: boolean | null;
    nextAvailableFrom: string;
  };
}

export type InteriorWizardSection =
  | "identity"
  | "location"
  | "services"
  | "materials"
  | "pricing"
  | "portfolio"
  | "team"
  | "warranty"
  | "contact";
```

`InteriorProfile` / `InteriorBranch` / `InteriorPackage` / `InteriorProject` / `InteriorTeamMember` gained the `// ---- v2 additions ----` fields listed in `interior.types.ts` (all optional on the client).

## 5. Backend API contract

Envelope: success `{ success: true, data }`; error `{ success: false, message, fieldErrors?: Record<dottedFormPath, string> }` (`fieldErrors` keys use the wizard paths above, e.g. `"identity.about"`; the client calls `form.setError`).
Auth: every `/interiors/me/**` route requires a logged-in user and acts **only** on the caller's own profile (resolve profile by `req.user.id`; child resources must belong to that profile → 404 otherwise). Base: `${BASE}` = API prefix already used by `API_ENDPOINTS`.

| Hook | Method & path | Body | Response `data` |
|---|---|---|---|
| `useGetMyInteriorProfileQuery` (existing) | GET `/interiors/me` | — | `InteriorProfile \| null` incl. branches, packages, projects, teamMembers, credentials, v2 fields |
| `useSaveMyInteriorProfileMutation` (existing) | PUT/POST `/interiors/me` | `Partial<InteriorProfile>` | `InteriorProfile` |
| `usePatchMyInteriorSectionMutation` | PATCH `/interiors/me/sections/:section` | `{ data: Partial<InteriorProfile>, wizardStep?: number }` | `InteriorProfile` (creates the DRAFT profile on first call if none) |
| `useGetMyInteriorReadinessQuery` | GET `/interiors/me/readiness` | — | `ReadinessReport` |
| `useSubmitMyInteriorProfileMutation` | POST `/interiors/me/submit` | `{}` | `InteriorProfile` (status → SUBMITTED, `lastSubmittedAt`) ; 422 with `fieldErrors` if submit readiness fails |
| `usePublishMyInteriorProfileMutation` (existing) | POST `/interiors/me/publish` | — | `InteriorProfile`; 422 unless publish readiness passes **and** ≥1 approved project **and** verified doc |
| `useUpdateMyInteriorStatusMutation` | POST `/interiors/me/status` | `{ status: "PAUSED"\|"TEMP_UNAVAILABLE"\|"ARCHIVED"\|"PUBLISHED", until?: ISOString\|null, reason?: string }` | `InteriorProfile`. `PUBLISHED` = resume; only allowed from PAUSED/TEMP_UNAVAILABLE/ARCHIVED when previously published. |
| `useAddCompanyBranchMutation` (existing) | POST `/interiors/me/branches` | `Partial<InteriorBranch>` | `InteriorBranch` |
| `useUpdateCompanyBranchMutation` | PUT `/interiors/me/branches/:id` | `Partial<InteriorBranch>` | `InteriorBranch` |
| `useDeleteCompanyBranchMutation` | DELETE `/interiors/me/branches/:id` | — | `{ id }` |
| `useSaveInteriorPackageMutation` (existing) | POST `/interiors/me/packages` · PUT `/interiors/me/packages/:id` | `Partial<InteriorPackage>` | `InteriorPackage` |
| `useDeleteInteriorPackageMutation` | DELETE `/interiors/me/packages/:id` | — | `{ id }` |
| `useReorderInteriorPackagesMutation` | PUT `/interiors/me/packages/order` | `{ ids: number[] }` | `InteriorPackage[]` |
| `useSavePortfolioProjectMutation` (existing) | POST `/interiors/me/projects` · PUT `/interiors/me/projects/:id` | `Partial<InteriorProject>` | `InteriorProject` (`isApproved` server-controlled) |
| `useDeletePortfolioProjectMutation` | DELETE `/interiors/me/projects/:id` | — | `{ id }` |
| `useListInteriorTeamQuery` | GET `/interiors/me/team` | — | `InteriorTeamMember[]` |
| `useSaveInteriorTeamMemberMutation` | POST `/interiors/me/team` · PUT `/interiors/me/team/:id` | `Partial<InteriorTeamMember>` | `InteriorTeamMember` |
| `useDeleteInteriorTeamMemberMutation` | DELETE `/interiors/me/team/:id` | — | `{ id }` |
| `useUploadInteriorDocumentMutation` | POST `/interiors/me/documents` | `{ type: CredentialDocType, fileKey: string, number?: string }` (key from POST `/interiors/me/documents/presign-upload`; view via GET `/interiors/me/documents/:id/url`) | `CredentialDocument` (status PENDING) |
| `useDeleteInteriorDocumentMutation` | DELETE `/interiors/me/documents/:id` | — | `{ id }` |
| `useGetMyInteriorInquiriesQuery` | GET `/interiors/me/inquiries?status=&page=` | — | `{ items: InteriorInquiry[], pagination }` |
| `useUnlockInteriorInquiryMutation` (existing) | POST `/interiors/me/inquiries/:id/unlock` | — | `InteriorInquiry` |

Client fallback: if PATCH sections returns 404 the client uses PUT/POST `/interiors/me` with the merged profile.

### Server-controlled fields (must be ignored/stripped when sent by the provider)
`isVerified, verifiedAt, verificationStatus, verificationNotes, isFeatured (profile), featuredOrder, rating, reviewCount, isPublished, publishedAt, status (except via /status, /submit, /publish), lastSubmittedAt, reviewNotes, isApproved (project), credentials[].status, credentials[].rejectionReason, userId, slug uniqueness`.

### Search
Public `GET /interiors` and `GET /interiors/detail/:slugOrId` return only `status = PUBLISHED` (and legacy `isPublished = true`) profiles; detail of a non-published profile → 404 (except to its owner via `/me`).

### New persisted fields & enums (exact names)

Enums:
- `InteriorListingStatus`: `DRAFT, SUBMITTED, IN_REVIEW, CHANGES_REQUESTED, PUBLISHED, PAUSED, TEMP_UNAVAILABLE, ARCHIVED, REJECTED` (default DRAFT; legacy rows with `isPublished=true` → PUBLISHED).
- `InteriorBranchType` add: `BRANCH, EXPERIENCE_CENTER, FACTORY, WAREHOUSE` (keep existing values).
- `MaterialCategory`: `BOARD, SURFACE_FINISH, HARDWARE, COUNTERTOP, FLOORING, WALL_FINISH, LIGHTING, SANITARY, OTHER`.
- `RoomType`: `LIVING, KITCHEN, MASTER_BEDROOM, BEDROOM, KIDS_ROOM, BATHROOM, DINING, POOJA, STUDY, BALCONY, FOYER, OTHER`.
- `ConsultationMode`: `ONLINE, IN_PERSON, SITE_VISIT`.
- `InteriorPackagePricingMode`: `FIXED, RANGE, PER_UNIT`.
- `WarrantyCategory`: `WOODWORK, HARDWARE, CIVIL, ELECTRICAL, PLUMBING, PAINT, APPLIANCES, OTHER`.
- `SupportChannel`: `PHONE, WHATSAPP, EMAIL, IN_APP, SITE_VISIT`.
- `CredentialDocType`: `GST_CERT, PAN, COI, MSME, TRADE_LICENSE, COA_REG, IIID_MEMBERSHIP, DEGREE, ID_PROOF, OTHER`; `CredentialStatus`: `PENDING, VERIFIED, REJECTED`.
- `LeadPreference`: `CALL, WHATSAPP, EMAIL, ANY`. `InteriorTeamSizeRange`: `1-5, 6-15, 16-50, 51-200, 200+`. `InteriorBudgetSegment`: `ECONOMY, MID_RANGE, PREMIUM, LUXURY`.

InteriorProfile (new columns; JSON = jsonb):
`status (enum), wizardStep int?, legalName?, fullName?, teamSizeRange?, primaryState?, primaryLat float?, primaryLng float?, siteVisitRadiusKm int?, budgetSegments string[], areaCapacity JSON {minSqft,maxSqft,maxConcurrentProjects}, materialSpecs JSON MaterialSpecRow[], roomPricing JSON RoomPricingRow[], consultationOptions JSON ConsultationOption[], branchPricingOverrides JSON BranchPricingOverride[], warranties JSON WarrantyRow[], support JSON SupportPolicy, contact JSON ContactAvailability, qualification?, institute?, coaRegistrationNumber?, iiidMembershipNumber?, awards string[], certifications string[], pausedUntil timestamp?, statusReason?, lastSubmittedAt timestamp?, reviewNotes?, completenessPct int?`.
Credentials: new table `InteriorCredentialDocument { id, interiorProfileId, type, fileUrl, number?, status (default PENDING), rejectionReason?, uploadedAt, reviewedAt? }`, returned as `profile.credentials` with string `id`.

InteriorBranch add: `isActive bool default true, managerName?, phone?, state?, pricingOverride JSON?` (existing `branchManagerName`, `contactNumber`, `latitude`, `longitude` stay; server should accept both names).
InteriorPackage add: `pricingMode enum?, applicableBhk string[], materialSpecs JSON PackageMaterialSpec[], warranty JSON PackageWarranty, conditions string[], branchIds int[]` (or keep `packageBranches` join and expose `branchIds`).
InteriorProject add: `propertyType?, bhk?, areaSqft int?, budgetRange?, durationDays int?, branchId int?, isFeatured bool default false, roomGalleriesV2 JSON RoomGallery[], afterImages string[], materialsUsed JSON MaterialSpecRow[]`.
InteriorTeamMember add: `branchId int?, orgMemberId int?, isPublic bool default true`.

### Section PATCH payload mapping (data keys per `:section`)
`formToProfilePayload(section, values)` (Chunk B mapper) sends `InteriorProfile` keys; legacy flat fields are derived client-side and should also be accepted:
- `identity`: providerType, fullName, displayName, businessName, legalName, tagline, about, experienceYears, yearEstablished, teamSizeRange, logo, coverBanner, slug, website, instagram, facebook, linkedin, youtube
- `location`: primaryCity, primaryState, primaryLocality, primaryAddress, primaryPincode, primaryLat, primaryLng, serviceCities, serviceLocalities, servesOutstation, siteVisitRadiusKm (branches use own endpoints)
- `services`: servicesOffered, commercialServices, propertyTypesHandled, budgetSegments, designStyles, executionCapabilities, areaCapacity, minProjectAreaSqft, maxProjectAreaSqft
- `materials`: materialSpecs + derived boardMaterials, boardBrands, surfaceFinishes, finishBrands, hardwareFittings, hardwareBrands, countertops, flooringAndWalls
- `pricing`: isCustomQuotationOnly, startingRateMin, startingRateMax, pricingUnit, startingRate*Included, roomPricing, consultationOptions, branchPricingOverrides (packages use own endpoints)
- `portfolio`: none (projects use own endpoints) — PATCH only updates wizardStep
- `team`: qualification, institute, coaRegistrationNumber, iiidMembershipNumber, awards, certifications, gstin, panNumber, cinNumber (members/documents use own endpoints)
- `warranty`: warranties, support + derived woodworkWarrantyYears, hardwareWarrantyYears, civilWarrantyYears, freeMaintenanceMonths
- `contact`: contact (ContactAvailability) + derived contactPerson, primaryPhone, whatsappPhone, businessEmail, isPhonePublic, isEmailPublic, preferredContactMethod, isAcceptingProjects

## Separation from property Organizations

Interior listings are independent of property `Organization`s. Company identity (business/legal name, logo, year established, team size), team members (`InteriorTeamMember`) and verification documents (`InteriorCredentialDocument`, GST/PAN/COI) live entirely on the interior listing. The wizard never reads, writes or requires `organizationId`; the nullable `InteriorProfile.organizationId` column remains in the schema/API type for backward compatibility only and is ignored.
