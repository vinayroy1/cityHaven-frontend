// types/shared.ts

export type Condition =
  | { field: string; equals: any }
  | { field: string; notEquals: any }
  | { field: string; in: any[] }
  | { and: Condition[] }
  | { or: Condition[] };

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
  options?: Option[];
  min?: number;
  max?: number;
  step?: number;
  meta?: Record<string, any>;
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
  sections: SectionConfig[];
};
