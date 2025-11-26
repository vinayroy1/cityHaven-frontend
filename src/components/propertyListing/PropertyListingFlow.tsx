"use client";

import React, { useEffect, useMemo, useState, type ReactNode } from "react";
import { useForm } from "react-hook-form";
import { ShieldCheck } from "lucide-react";
import { Stepper } from "@/components/propertyListing/Stepper";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { toast } from "sonner";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  initialPropertyListingFormValues,
  propertyTypeCatalog,
  resetDraft,
  saveDraft,
  stepList,
  stepValidations,
  useSubmitPropertyMutation,
} from "@/features/propertyListing";
import { selectPropertyListing } from "@/store/store";
import type { PropertyListingFormValues } from "@/types/propertyListing.types";
import { AmenitiesLegalStep } from "./steps/AmenitiesLegalStep";
import { BasicContextStep } from "./steps/BasicContextStep";
import { LocationProjectStep } from "./steps/LocationProjectStep";
import { MediaReviewStep } from "./steps/MediaReviewStep";
import { PricingAvailabilityStep } from "./steps/PricingAvailabilityStep";
import { PropertyDetailsStep } from "./steps/PropertyDetailsStep";

const GlassPanel = ({ children }: { children: ReactNode }) => (
  <div className="relative overflow-hidden rounded-[28px] border border-slate-200/70 bg-white/90 p-6 shadow-2xl shadow-red-100/70 backdrop-blur">
    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(244,63,94,0.14),transparent_35%),radial-gradient(circle_at_80%_0%,rgba(79,70,229,0.16),transparent_32%)]" />
    <div className="relative">{children}</div>
  </div>
);

export const PropertyListingFlow: React.FC = () => {
  const dispatch = useAppDispatch();
  const { draft, status } = useAppSelector(selectPropertyListing);
  const [submitProperty, { isLoading: submitting, isSuccess: submitted }] = useSubmitPropertyMutation();
  const [currentStep, setCurrentStep] = useState(1);

  const form = useForm<PropertyListingFormValues>({
    mode: "onChange",
    defaultValues: draft ?? initialPropertyListingFormValues,
  });

  const listingType = form.watch("context.listingType");
  const propertyTypeId = form.watch("context.propertyTypeId");

  const selectedPropertyType = useMemo(
    () => propertyTypeCatalog.find((p) => p.id === propertyTypeId) ?? propertyTypeCatalog[0],
    [propertyTypeId],
  );

  useEffect(() => {
    if (listingType === "PG") {
      form.setValue("context.propertyTypeId", "pg");
      form.setValue("context.resCom", "RESIDENTIAL");
      form.setValue("context.propertySubTypeId", "");
      return;
    }

    // Default to residential for Sell/Rent when nothing selected to avoid empty dropdowns.
    if (!form.getValues("context.propertyTypeId")) {
      form.setValue("context.propertyTypeId", "residential");
      form.setValue("context.resCom", "RESIDENTIAL");
    }
  }, [listingType, form]);

  useEffect(() => {
    if (selectedPropertyType) {
      form.setValue("context.resCom", selectedPropertyType.resCom);
    }
  }, [selectedPropertyType, form]);

  useEffect(() => {
    form.reset(draft ?? initialPropertyListingFormValues);
  }, [draft, form]);

  const handleNext = async () => {
    const fields = stepValidations[currentStep];
    const triggerTargets = fields as Parameters<typeof form.trigger>[0];
    const valid = fields ? await form.trigger(triggerTargets, { shouldFocus: true }) : true;
    if (!valid) {
      toast.error("Complete the highlighted fields to continue.");
      return;
    }
    dispatch(saveDraft(form.getValues()));
    setCurrentStep((s) => Math.min(stepList.length, s + 1));
    toast.success("Draft captured for this step.");
  };

  const handleBack = () => {
    dispatch(saveDraft(form.getValues()));
    setCurrentStep((s) => Math.max(1, s - 1));
  };

  const handlePublish = async () => {
    const valid = await form.trigger(undefined, { shouldFocus: true });
    if (!valid) {
      toast.error("Fix validation issues before publishing.");
      return;
    }
    const values = form.getValues();
    dispatch(saveDraft(values));
    try {
      await submitProperty(values).unwrap();
      toast.success("Listing payload staged for submission.");
      setCurrentStep(stepList.length);
    } catch {
      toast.error("Unable to submit right now.");
    }
  };

  const handleReset = () => {
    dispatch(resetDraft());
    form.reset(initialPropertyListingFormValues);
    setCurrentStep(1);
    toast.success("Wizard reset to a clean slate.");
  };

  return (
    <GlassPanel>
      <Stepper steps={stepList} currentStep={currentStep} onNavigate={(step) => setCurrentStep(step)} />

      <Form {...form}>
        <form onSubmit={(e) => e.preventDefault()} className="mt-6 space-y-6">
          {currentStep === 1 && <BasicContextStep form={form} />}
          {currentStep === 2 && <LocationProjectStep form={form} />}
          {currentStep === 3 && <PropertyDetailsStep form={form} />}
          {currentStep === 4 && <PricingAvailabilityStep form={form} />}
          {currentStep === 5 && <AmenitiesLegalStep form={form} />}
          {currentStep === 6 && <MediaReviewStep form={form} />}

          <div className="flex flex-col gap-3 border-t border-dashed border-slate-200/80 pt-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <span>
                {submitting
                  ? "Submitting to API..."
                  : submitted
                  ? "Payload submitted to API."
                  : "Progress auto-saves as draft."}
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="ghost" onClick={handleReset}>
                Reset
              </Button>
              <Button type="button" variant="outline" onClick={() => dispatch(saveDraft(form.getValues()))}>
                Save Draft
              </Button>
              {currentStep > 1 && (
                <Button type="button" variant="outline" onClick={handleBack}>
                  Back
                </Button>
              )}
              {currentStep < stepList.length && (
                <Button type="button" onClick={handleNext}>
                  Save & Continue
                </Button>
              )}
              {currentStep === stepList.length && (
                <Button type="button" className="bg-gradient-to-r from-sky-600 to-indigo-600 text-white" onClick={handlePublish} disabled={status === "submitting"}>
                  Publish / Submit
                </Button>
              )}
            </div>
          </div>
        </form>
      </Form>
    </GlassPanel>
  );
};

PropertyListingFlow.displayName = "PropertyListingFlow";
