export type Primitive = string | number | boolean | null | undefined;
export type Condition =
  | { field: string; equals: Primitive }
  | { field: string; notEquals: Primitive }
  | { field: string; in: Primitive[] }
  | { and: Condition[] }
  | { or: Condition[] };

export type FormValues = Record<string, unknown>;

export type FieldType =
  | "text"
  | "textarea"
  | "number"
  | "counter"
  | "select"
  | "radio"
  | "chip-radio"
  | "chip-multi"
  | "toggle"
  | "checkbox";

export type Option = {
  value: string | number | boolean;
  label: string;
  icon?: string; // 👈 icon key for your Icon component
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
  meta?: Record<string, unknown>;
};

export type SectionConfig = {
  id: string;
  title: string;
  description?: string;
  visibleWhen?: Condition;
  fields: FieldConfig[];
};

export type StepConfig = {
  id: string;
  title: string;
  description?: string;
  sections: SectionConfig[];
};
