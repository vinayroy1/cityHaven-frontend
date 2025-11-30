import React, { type ReactNode } from "react";
import { Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import type { UseFormReturn } from "react-hook-form";
import type { PropertyListingFormValues } from "@/types/propertyListing.types";

export type StepProps = { form: UseFormReturn<PropertyListingFormValues> };

export const FieldShell = ({ title, description, icon: Icon }: { title: string; description?: string; icon?: typeof Sparkles }) => (
  <div className="flex items-start gap-3 pb-4">
    {Icon && (
      <div className="mt-1 flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500/20 to-indigo-500/20 text-sky-700 shadow-inner">
        <Icon className="h-5 w-5" />
      </div>
    )}
    <div>
      <p className="text-lg font-semibold text-slate-900">{title}</p>
      {description && <p className="text-sm text-slate-600">{description}</p>}
    </div>
  </div>
);

export const NumberInput = ({
  field,
  placeholder,
}: {
  field: { value: number | null | undefined; onChange: (value: number | null) => void };
  placeholder?: string;
}) => (
  <Input
    type="number"
    value={field.value ?? ""}
    placeholder={placeholder}
    onChange={(e) => field.onChange(e.target.value === "" ? null : Number(e.target.value))}
  />
);
