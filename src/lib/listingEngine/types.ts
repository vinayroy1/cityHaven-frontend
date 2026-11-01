// Generic, vertical-agnostic listing engine — schema types.
//
// A vertical (interiors, architects, contractors, ...) declares its wizard as a
// `VerticalConfig`. Field `id`s are dotted paths into the vertical's form tree
// (e.g. "identity.displayName"). React-Hook-Form registers dotted names natively.
//
// Forked (copied, not imported) from features/propertyListing/formConfig/types.ts.

import type { ComponentType, ReactNode } from "react";
import type { UseFormReturn } from "react-hook-form";
import type { ZodType } from "zod";

export type Primitive = string | number | boolean | null | undefined;

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
  /** phase label; the rail groups consecutive steps by phase (see VerticalConfig.phases). */
  phase?: string;
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
  /** ordered phase labels for the rail / mobile bar. Default: derived from StepConfig.phase. */
  phases?: readonly string[];
  /** live preview of the listing (pane >=1280px, sheet below). */
  renderPreview?: (values: V) => ReactNode;
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
