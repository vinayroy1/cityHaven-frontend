"use client";

import React, { useEffect, useState } from "react";
import { FieldPath, useForm, useWatch } from "react-hook-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { Progress } from "@/components/ui/progress";
import { FieldRenderer } from "./components/FieldRenderer";
import { evaluateCondition } from "./components/condition";
import type { FieldConfig, FormValues, SectionConfig, StepConfig } from "./config/types";

type Props = {
  steps: StepConfig[];
};

export function PropertyListingNewProcessor({ steps }: Props) {
  const [currentStep, setCurrentStep] = useState(0);
  const form = useForm<FormValues>({
    mode: "onChange",
    defaultValues: {},
  });
  const watchedValues = useWatch<FormValues>({ control: form.control }) ?? {};
  const listingType = watchedValues?.listingType;
  const propertyUsage = watchedValues?.propertyUsage;

  useEffect(() => {
    if (listingType === "PG") {
      if (propertyUsage !== "pg") {
        form.setValue("propertyUsage", "pg", { shouldDirty: true });
      }
      form.setValue("residentialTypeSellRent", undefined);
      form.setValue("commercialKind", undefined);
      form.setValue("officeType", undefined);
      form.setValue("retailType", undefined);
      form.setValue("locatedInside", undefined);
      form.setValue("commercialLandType", undefined);
    } else if (propertyUsage === "pg") {
      form.setValue("propertyUsage", "residential", { shouldDirty: true });
      form.setValue("pgType", undefined);
    }
  }, [form, listingType, propertyUsage]);

  if (steps.length === 0) return null;

  const safeStepIndex = Math.min(currentStep, steps.length - 1);
  const activeStep = steps[safeStepIndex];
  const totalSteps = steps.length;
  const progress = Math.round(((safeStepIndex + 1) / totalSteps) * 100);

  const isSectionVisible = (section: SectionConfig) => evaluateCondition(watchedValues, section.visibleWhen);
  const isFieldVisible = (field: FieldConfig) => evaluateCondition(watchedValues, field.visibleWhen);

  const visibleSections = activeStep.sections.filter((section) => isSectionVisible(section));

  const validateCurrentStep = async () => {
    const requiredFields = visibleSections
      .flatMap((section) => section.fields)
      .filter((field) => isFieldVisible(field))
      .filter((field) => field.required || (field.requiredWhen && evaluateCondition(watchedValues, field.requiredWhen)))
      .map((field) => field.id as FieldPath<FormValues>);

    if (requiredFields.length === 0) return true;
    return form.trigger(requiredFields, { shouldFocus: true });
  };

  const handleNext = async () => {
    const valid = await validateCurrentStep();
    if (!valid) return;
    setCurrentStep((step) => Math.min(step + 1, totalSteps - 1));
  };

  const handlePrevious = () => setCurrentStep((step) => Math.max(step - 1, 0));

  const handleSubmit = async (data: FormValues) => {
    const valid = await form.trigger(undefined, { shouldFocus: true });
    if (!valid) return;
    // TODO: connect to submission API once available
    console.log("Property listing payload", data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="mx-auto flex max-w-6xl flex-col gap-6">
        <Card className="relative overflow-hidden border-slate-200 bg-white/80 shadow-xl shadow-blue-100">
          <div className="absolute inset-0 bg-gradient-to-r from-sky-50 via-white to-emerald-50" />
          <CardHeader className="relative">
            <CardTitle className="flex flex-col gap-2 text-2xl font-semibold text-slate-900 sm:flex-row sm:items-center sm:justify-between">
              <span>
                Create your listing
                <span className="ml-2 text-base font-normal text-slate-600">
                  Step {safeStepIndex + 1} of {totalSteps}
                </span>
              </span>
              <Badge variant="secondary" className="w-fit rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide">
                Guided form
              </Badge>
            </CardTitle>
            <CardDescription className="text-slate-600">
              Answer a few quick questions so we can tailor the listing to your property type.
            </CardDescription>
          </CardHeader>
          <CardFooter className="relative flex items-center gap-3">
            <Progress value={progress} className="h-2 w-full" />
            <span className="text-xs font-semibold text-slate-600">{progress}%</span>
          </CardFooter>
        </Card>

        <Card className="border-slate-200 bg-white/90 shadow-lg shadow-slate-100">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-slate-900">{activeStep.title}</CardTitle>
            {activeStep.description && <CardDescription className="text-slate-600">{activeStep.description}</CardDescription>}
          </CardHeader>
          <CardContent className="space-y-6">
            {visibleSections.map((section) => {
              const visibleFields = section.fields.filter((field) => isFieldVisible(field));
              if (visibleFields.length === 0) return null;
              return (
                <div key={section.id} className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4 shadow-sm">
                  <div className="mb-3">
                    <h3 className="text-lg font-semibold text-slate-900">{section.title}</h3>
                    {section.description && <p className="text-sm text-slate-600">{section.description}</p>}
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    {visibleFields.map((field) => (
                      <FieldRenderer key={field.id} field={field} form={form} values={watchedValues} />
                    ))}
                  </div>
                </div>
              );
            })}
          </CardContent>
          <CardFooter className="flex flex-col gap-3 border-t border-dashed border-slate-200/80 pt-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-slate-600">Save progress as you go; you can always adjust before publishing.</div>
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="outline" onClick={handlePrevious} disabled={safeStepIndex === 0}>
                Back
              </Button>
              {safeStepIndex < totalSteps - 1 ? (
                <Button type="button" onClick={handleNext}>
                  Next
                </Button>
              ) : (
                <Button type="submit">Publish listing</Button>
              )}
            </div>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
}
