import React from "react";
import { FieldShell } from "@/components/propertyListing/flow/steps/StepCommon";
import { Card } from "@/components/ui/card";
import type { UseFormReturn } from "react-hook-form";
import type { FormValues, SectionConfig, StepConfig } from "../config/types";
import { evaluateCondition } from "./condition";
import { FieldRenderer } from "./FieldRenderer";

type Props = {
  step: StepConfig;
  form: UseFormReturn<FormValues>;
  values: FormValues;
};

export function StepRenderer({ step, form, values }: Props) {
  return (
    <Card className="border-slate-200/80 bg-white/95 p-5 shadow-sm">
      <FieldShell title={step.title} description={step.description} icon={undefined} />
      <div className="space-y-6">
        {step.sections
          .filter((section) => evaluateCondition(values, section.visibleWhen))
          .map((section: SectionConfig) => (
            <div key={section.id} className="space-y-4">
              {section.title && <p className="text-base font-semibold text-slate-900">{section.title}</p>}
              {section.description && <p className="text-sm text-slate-600">{section.description}</p>}
              <div className="grid gap-4 md:grid-cols-2">
                {section.fields.map((field) => (
                  <FieldRenderer key={field.id} field={field} form={form} values={values} />
                ))}
              </div>
            </div>
          ))}
      </div>
    </Card>
  );
}
