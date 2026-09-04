// Config-driven property-listing form engine — schema types.
//
// Field `id`s are dotted paths into the nested `PropertyListingFormValues`
// tree (e.g. "details.carpetArea", "amenities.furnishing"). React-Hook-Form
// registers dotted names natively, and `getValue` in ./conditions resolves
// them for visibility checks.

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
  | { and: Condition[] }
  | { or: Condition[] }
  | { not: Condition }
  | { preset: string };

// Loose by design: the engine walks arbitrary nested form trees (both the
// generic Record shape and the typed PropertyListingFormValues).
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type FormValues = Record<string, any>;

export type FieldType =
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
  | "media";

export type Option = {
  value: string | number | boolean;
  label: string;
  icon?: string;
  visibleWhen?: Condition;
  disabledIf?: Condition;
};

export type FieldConfig = {
  id: string;
  label: string;
  type: FieldType;
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
  /** measure/dimension/price: the sibling path holding the unit value. */
  unitField?: string;
  /** measure/dimension: options for the unit dropdown (defaults to area units). */
  unitOptions?: Option[];
  /** price: sibling path for the derived per-unit-area amount. */
  perUnitField?: string;
  /** scoring weight; defaults to 2 for required, 1 for optional. */
  weight?: number;
  /** clear the value when `visibleWhen` becomes false. Default true. */
  resetOnHide?: boolean;
  /** chip-add: label shown on the add pill ("Pooja Room" -> "+ Pooja Room"). */
  meta?: Record<string, unknown>;
};

export type SectionConfig = {
  id: string;
  title?: string;
  description?: string;
  /** small red hint under the title, e.g. "At least one area is mandatory". */
  requiredHint?: string;
  visibleWhen?: Condition;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  fields: FieldConfig[];
};

export type StepConfig = {
  id: string;
  label: string;
  /** heading shown above the step body. */
  title?: string;
  caption?: string;
  description?: string;
  /** "config" renders `sections`; "custom" delegates to a bespoke component. */
  kind?: "config" | "custom";
  component?: "location";
  sections?: SectionConfig[];
};
