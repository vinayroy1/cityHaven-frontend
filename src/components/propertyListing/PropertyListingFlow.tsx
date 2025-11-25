"use client";

import React, { useEffect, useMemo, useState, type ReactNode } from "react";
import { useForm, type UseFormReturn } from "react-hook-form";
import { Stepper } from "@/components/propertyListing/Stepper";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Sparkles, Building2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/components/ui/utils";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  amenityOptions,
  authorityOptions,
  cityOptions,
  furnishingItems,
  localityOptions,
  projectOptions,
  propertyTypeCatalog,
  stepList,
  stepValidations,
  initialPropertyListingFormValues,
  resetDraft,
  saveDraft,
  useSubmitPropertyMutation,
} from "@/features/propertyListing";
import { selectPropertyListing } from "@/store/store";
import type { PropertyListingFormValues } from "@/types/propertyListing.types";

type StepProps = { form: UseFormReturn<PropertyListingFormValues> };

const GlassPanel = ({ children }: { children: ReactNode }) => (
  <div className="relative overflow-hidden rounded-[28px] border border-slate-200/70 bg-white/80 p-6 shadow-2xl shadow-sky-100 backdrop-blur">
    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(14,165,233,0.12),transparent_35%),radial-gradient(circle_at_80%_0%,rgba(94,234,212,0.16),transparent_32%)]" />
    <div className="relative">{children}</div>
  </div>
);

const FieldShell = ({ title, description, icon: Icon }: { title: string; description?: string; icon?: typeof Sparkles }) => (
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

const NumberInput = ({
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

function BasicContextStep({ form }: StepProps) {
  const listingType = form.watch("context.listingType");
  const propertyTypeId = form.watch("context.propertyTypeId");
  const propertySubTypeId = form.watch("context.propertySubTypeId");

  const filteredPropertyTypes = useMemo(() => {
    if (listingType === "PG") return propertyTypeCatalog.filter((t) => t.id === "pg");
    return propertyTypeCatalog.filter((t) => t.id !== "pg");
  }, [listingType]);

  const selectedPropertyType = filteredPropertyTypes.find((p) => p.id === propertyTypeId);
  const selectedSubType = selectedPropertyType?.subTypes.find((s) => s.id === propertySubTypeId);

  return (
    <div className="space-y-5">
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-5 rounded-3xl border border-slate-200/80 bg-white p-4 shadow-sm">
          <FieldShell title="Listing type" description="Rent, sell, or PG/Co-living" icon={Sparkles} />
          <FormField
            control={form.control}
            name="context.listingType"
            rules={{ required: "Pick a listing type" }}
            render={({ field }) => (
              <FormItem>
                <RadioGroup
                  className="grid gap-3 sm:grid-cols-3"
                  value={field.value}
                  onValueChange={(value) => {
                    field.onChange(value);
                    if (value === "PG") {
                      form.setValue("context.propertyTypeId", "pg");
                      form.setValue("context.propertySubTypeId", "");
                      form.setValue("context.resCom", "RESIDENTIAL");
                    } else if (!form.getValues("context.propertyTypeId") || form.getValues("context.propertyTypeId") === "pg") {
                      form.setValue("context.propertyTypeId", "residential");
                      form.setValue("context.resCom", "RESIDENTIAL");
                    }
                  }}
                >
                  {["SELL", "RENT", "PG"].map((option) => (
                    <label
                      key={option}
                      className={cn(
                        "cursor-pointer rounded-2xl border p-3 shadow-sm transition-all",
                        field.value === option ? "border-sky-500 bg-sky-50 shadow-sky-100" : "border-slate-200 hover:border-sky-200",
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <RadioGroupItem value={option} />
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{option}</p>
                          <p className="text-xs text-slate-500">
                            {option === "SELL" ? "One-time sale" : option === "RENT" ? "Recurring rent" : "Beds / rooms"}
                          </p>
                        </div>
                      </div>
                    </label>
                  ))}
                </RadioGroup>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="context.postedAs"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Posted as</FormLabel>
                <Select onValueChange={field.onChange} value={field.value ?? ""}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Owner / Agent / Builder" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="OWNER">Owner</SelectItem>
                    <SelectItem value="AGENT">Agent</SelectItem>
                    <SelectItem value="BUILDER">Builder</SelectItem>
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-5 rounded-3xl border border-slate-200/80 bg-white p-4 shadow-sm">
          <FieldShell title="Property classification" description="Type, sub-type, and building context" icon={Building2} />

          <FormField
            control={form.control}
            name="context.propertyTypeId"
            rules={{ required: "Pick a property type" }}
            render={({ field }) => (
              <FormItem>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {filteredPropertyTypes.map((type) => {
                    const Icon = type.icon;
                    const isActive = field.value === type.id;
                    return (
                      <button
                        key={type.id}
                        type="button"
                        onClick={() => {
                          field.onChange(type.id);
                          form.setValue("context.propertySubTypeId", "");
                          form.setValue("context.propertySubCategoryId", "");
                          form.setValue("context.locatedInsideId", "");
                        }}
                        className={cn(
                          "flex items-center gap-3 rounded-2xl border p-3 text-left transition-all",
                          isActive ? "border-sky-500 bg-sky-50 shadow-sky-100" : "border-slate-200 hover:border-sky-200",
                        )}
                      >
                        <div className={cn("rounded-xl bg-gradient-to-br p-2 text-white shadow-md", `from-white/0 to-white/0`)}>
                          <Icon className="h-6 w-6 text-sky-600" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{type.label}</p>
                          <p className="text-xs text-slate-500">{type.resCom} category</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="context.propertySubTypeId"
              rules={{ required: "Select a sub-type" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Property sub-type</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value ?? ""} disabled={!selectedPropertyType}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Apartment, Office, Retail..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {selectedPropertyType?.subTypes.map((sub) => (
                        <SelectItem key={sub.id} value={sub.id}>
                          {sub.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="context.propertySubCategoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sub-category (if any)</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value ?? ""}
                    disabled={!selectedSubType?.categories?.length}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Ready to move, bare shell..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {(selectedSubType?.categories ?? []).map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="context.locatedInsideId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Located inside</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value ?? ""}
                    disabled={!selectedSubType?.locatedInsideOptions?.length}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Mall, Tech Park, Business tower" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {(selectedSubType?.locatedInsideOptions ?? []).map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="context.organizationId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Organization (if agent/builder)</FormLabel>
                  <Input value={field.value ?? ""} onChange={(e) => field.onChange(e.target.value)} placeholder="Org / brokerage name" />
                </FormItem>
              )}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function LocationProjectStep({ form }: StepProps) {
  const cityId = form.watch("location.cityId");
  const currentLocalities = localityOptions[cityId] ?? [];
  const filteredProjects = projectOptions.filter((p) => p.cityId === cityId);
  const propertySubType = form.watch("context.propertySubTypeId");
  const showMall = propertySubType === "retail" || propertySubType === "hospitality";

  return (
    <div className="space-y-6">
      <div className="grid gap-5 lg:grid-cols-2">
        <Card className="border-0 bg-white/80 p-5 shadow-xl">
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="location.cityId"
              rules={{ required: "Choose a city" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>City *</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                      form.setValue("location.localityId", "");
                      form.setValue("location.projectId", "");
                    }}
                    value={field.value ?? ""}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select city" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {cityOptions.map((city) => (
                        <SelectItem key={city.id} value={city.id}>
                          {city.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="location.localityId"
              rules={{ required: "Choose a locality" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Locality *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value ?? ""} disabled={!cityId}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select locality" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {currentLocalities.map((loc) => (
                        <SelectItem key={loc.id} value={loc.id}>
                          {loc.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="location.subLocality"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sub Locality</FormLabel>
                  <Input value={field.value ?? ""} onChange={(e) => field.onChange(e.target.value)} placeholder="Sector, pocket, block" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="location.address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <Input value={field.value ?? ""} onChange={(e) => field.onChange(e.target.value)} placeholder="Street / landmark" />
                </FormItem>
              )}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <FormField
              control={form.control}
              name="location.houseNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>House / Flat no.</FormLabel>
                  <Input value={field.value ?? ""} onChange={(e) => field.onChange(e.target.value)} placeholder="203" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="location.plotNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Plot no.</FormLabel>
                  <Input value={field.value ?? ""} onChange={(e) => field.onChange(e.target.value)} placeholder="Plot 21" />
                </FormItem>
              )}
            />
            {showMall && (
              <FormField
                control={form.control}
                name="location.mall"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mall / Retail hub</FormLabel>
                    <Input value={field.value ?? ""} onChange={(e) => field.onChange(e.target.value)} placeholder="Phoenix Mall" />
                  </FormItem>
                )}
              />
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="location.latitude"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Latitude</FormLabel>
                  <NumberInput field={field} placeholder="12.97" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="location.longitude"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Longitude</FormLabel>
                  <NumberInput field={field} placeholder="77.59" />
                </FormItem>
              )}
            />
          </div>
        </Card>

        <Card className="border border-slate-100 bg-gradient-to-br from-white via-slate-50 to-white p-5 text-slate-900 shadow-xl">
          <FieldShell title="Projects & societies" description="Map to a known project or add your own society label" icon={Building2} />
          <FormField
            control={form.control}
            name="location.projectId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Project (from master)</FormLabel>
                <Select onValueChange={field.onChange} value={field.value ?? ""} disabled={!cityId}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select project" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {filteredProjects.map((proj) => (
                      <SelectItem key={proj.id} value={proj.id}>
                        {proj.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />

          <Separator className="my-4 border-slate-200" />

          <FormField
            control={form.control}
            name="location.societyOrProjectName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Society / Project name (free text)</FormLabel>
                <Input
                  className="bg-white text-slate-900 placeholder:text-slate-400"
                  value={field.value ?? ""}
                  onChange={(e) => field.onChange(e.target.value)}
                  placeholder="Green View Residency"
                />
                <FormDescription className="text-xs text-slate-500">
                  Required if no project is selected from master.
                </FormDescription>
              </FormItem>
            )}
          />

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <p className="text-sm text-slate-600">Locality integrity</p>
              <p className="text-lg font-semibold text-slate-900">
                {cityId ? `${currentLocalities.length} areas found` : "Select city"}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <p className="text-sm text-slate-600">Project match</p>
              <p className="text-lg font-semibold text-slate-900">
                {filteredProjects.length ? `${filteredProjects.length} matches` : "Add society name"}
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

function PropertyDetailsStep({ form }: StepProps) {
  const listingType = form.watch("context.listingType");
  const resCom = form.watch("context.resCom");

  return (
    <div className="space-y-6">
      <div className="grid gap-5 lg:grid-cols-2">
        <Card className="border-0 bg-white/85 p-5 shadow-xl">
          <p className="mb-3 text-sm font-semibold text-slate-700">Dimensions</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="details.carpetArea"
              rules={{ required: "Enter carpet area" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Carpet area</FormLabel>
                  <NumberInput field={field} placeholder="950" />
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="details.carpetAreaUnit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Carpet unit</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value ?? ""}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sq.ft / Sq.m" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="SQ_FT">Sq.ft</SelectItem>
                      <SelectItem value="SQ_M">Sq.m</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="details.builtUpArea"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Built-up area</FormLabel>
                  <NumberInput field={field} placeholder="1100" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="details.superBuiltUpArea"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Super built-up area</FormLabel>
                  <NumberInput field={field} placeholder="1200" />
                </FormItem>
              )}
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="details.plotArea"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Plot area (for plots)</FormLabel>
                  <NumberInput field={field} placeholder="2400" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="details.widthOfFacingRoad"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Width of facing road</FormLabel>
                  <NumberInput field={field} placeholder="30" />
                </FormItem>
              )}
            />
          </div>
        </Card>

        <Card className="border border-slate-100 bg-gradient-to-br from-white via-slate-50 to-white p-5 text-slate-900 shadow-xl">
          <p className="mb-3 text-sm font-semibold text-slate-800">Configuration</p>
          <div className="grid gap-3 sm:grid-cols-2">
            {resCom === "RESIDENTIAL" && listingType !== "PG" && (
              <>
                <FormField
                  control={form.control}
                  name="details.bedrooms"
                  rules={{ required: "Bedrooms required" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bedrooms</FormLabel>
                      <NumberInput field={field} placeholder="2" />
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="details.bathrooms"
                  rules={{ required: "Bathrooms required" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bathrooms</FormLabel>
                      <NumberInput field={field} placeholder="2" />
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="details.balconies"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Balconies</FormLabel>
                      <NumberInput field={field} placeholder="1" />
                    </FormItem>
                  )}
                />
              </>
            )}

            {listingType === "PG" && (
              <>
                <FormField
                  control={form.control}
                  name="details.roomType"
                  rules={{ required: "Select room type" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Room type</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value ?? ""}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Private / Shared / Bed" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="PRIVATE_ROOM">Private Room</SelectItem>
                          <SelectItem value="SHARED_ROOM">Shared Room</SelectItem>
                          <SelectItem value="BED">Bed / Dorm</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="details.availableBeds"
                  rules={{ required: "Beds available required" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Available beds</FormLabel>
                      <NumberInput field={field} placeholder="4" />
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            {resCom === "COMMERCIAL" && (
              <>
                <FormField
                  control={form.control}
                  name="details.washrooms"
                  rules={{ required: "Washroom count required" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Washrooms</FormLabel>
                      <NumberInput field={field} placeholder="2" />
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="details.totalRooms"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cabins / Rooms</FormLabel>
                      <NumberInput field={field} placeholder="3" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="details.multiFloorNum"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Floors offered (if multi-floor)</FormLabel>
                      <NumberInput field={field} placeholder="2" />
                    </FormItem>
                  )}
                />
              </>
            )}

            <FormField
              control={form.control}
              name="details.totalFloors"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Total floors in building</FormLabel>
                  <NumberInput field={field} placeholder="5" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="details.floorNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Floor number</FormLabel>
                  <Input value={field.value ?? ""} onChange={(e) => field.onChange(e.target.value)} placeholder="FLOOR_2" />
                </FormItem>
              )}
            />
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <FormField
              control={form.control}
              name="details.lift"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center gap-2 space-y-0 rounded-2xl border border-slate-200 bg-white p-3">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <FormLabel className="text-sm text-slate-800">Lift available</FormLabel>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="details.propertyFacing"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Facing</FormLabel>
                  <Input value={field.value ?? ""} onChange={(e) => field.onChange(e.target.value)} placeholder="East / West" className="bg-white/10 text-white" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="details.ageOfProperty"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Age of property</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value ?? ""}>
                    <FormControl>
                      <SelectTrigger className="bg-white/10 text-white">
                        <SelectValue placeholder="Select age" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="text-slate-900">
                      <SelectItem value="NEW">New</SelectItem>
                      <SelectItem value="ONE_TO_FIVE">1 - 5 years</SelectItem>
                      <SelectItem value="FIVE_TO_TEN">5 - 10 years</SelectItem>
                      <SelectItem value="ABOVE_TEN">10+ years</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
          </div>
        </Card>
      </div>
    </div>
  );
}

function PricingAvailabilityStep({ form }: StepProps) {
  const listingType = form.watch("context.listingType");
  return (
    <div className="space-y-6">
      <div className="grid gap-5 lg:grid-cols-2">
        <Card className="border-0 bg-white p-5 shadow-xl">
          <p className="mb-3 text-sm font-semibold text-slate-700">Pricing & Financials</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="pricing.price"
              rules={{ required: "Price required" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{listingType === "SELL" ? "Total price" : listingType === "PG" ? "Price per bed/room" : "Monthly rent"}</FormLabel>
                  <NumberInput field={field} placeholder="35000" />
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="pricing.priceType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price type</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value ?? ""}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Monthly / Total / Per bed" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="MONTHLY">Monthly</SelectItem>
                      <SelectItem value="TOTAL">Total</SelectItem>
                      <SelectItem value="PER_BED">Per bed</SelectItem>
                      <SelectItem value="PER_ROOM">Per room</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <FormField
              control={form.control}
              name="pricing.deposit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Deposit</FormLabel>
                  <NumberInput field={field} placeholder="100000" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="pricing.maintenance"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Maintenance</FormLabel>
                  <NumberInput field={field} placeholder="2000" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="pricing.maintenancePaymentPeriod"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Maintenance frequency</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value ?? ""}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Monthly / Quarterly" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="MONTHLY">Monthly</SelectItem>
                      <SelectItem value="QUARTERLY">Quarterly</SelectItem>
                      <SelectItem value="YEARLY">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <FormField
              control={form.control}
              name="pricing.priceNegotiable"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center gap-2 space-y-0 rounded-2xl border border-slate-200 p-3">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <FormLabel className="text-sm text-slate-800">Price negotiable</FormLabel>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="pricing.brokerage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Brokerage</FormLabel>
                  <NumberInput field={field} placeholder="0" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="pricing.brokerageType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Brokerage type</FormLabel>
                  <Input value={field.value ?? ""} onChange={(e) => field.onChange(e.target.value)} placeholder="Percentage / Fixed" />
                </FormItem>
              )}
            />
          </div>
        </Card>

        <Card className="border border-slate-100 bg-gradient-to-br from-white via-slate-50 to-white p-5 text-slate-900 shadow-xl">
          <p className="mb-3 text-sm font-semibold text-slate-800">Availability & possession</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="availability.availabilityStatus"
              rules={{ required: "Availability required" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Availability</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value ?? ""}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Ready, UC, soon" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="READY_TO_MOVE">Ready to move</SelectItem>
                      <SelectItem value="UNDER_CONSTRUCTION">Under construction</SelectItem>
                      <SelectItem value="POSSESSION_SOON">Possession soon</SelectItem>
                      <SelectItem value="NEW_LAUNCH">New launch</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="availability.availableFrom"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Available from</FormLabel>
                  <Input type="date" value={field.value ?? ""} onChange={(e) => field.onChange(e.target.value)} />
                </FormItem>
              )}
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="availability.possessionStatus"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Possession status</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value ?? ""}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Ready / UC / Launch" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="READY_TO_MOVE">Ready to move</SelectItem>
                      <SelectItem value="UNDER_CONSTRUCTION">Under construction</SelectItem>
                      <SelectItem value="LAUNCH">Launch</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="availability.constructionDone"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center gap-2 space-y-0 rounded-2xl border border-slate-200 bg-white p-3">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <FormLabel className="text-sm text-slate-800">Construction complete</FormLabel>
                </FormItem>
              )}
            />
          </div>

          <Separator className="my-4 border-slate-200" />
          <FormField
            control={form.control}
            name="availability.possessionBy"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Possession timeline</FormLabel>
                <Input
                  className="bg-white text-slate-900"
                  value={field.value ?? ""}
                  onChange={(e) => field.onChange(e.target.value)}
                  placeholder="Within 3 months / 2025-Q2"
                />
              </FormItem>
            )}
          />
        </Card>
      </div>
    </div>
  );
}

function AmenitiesLegalStep({ form }: StepProps) {
  const amenityIds = form.watch("amenities.amenityIds") ?? [];

  const toggleAmenity = (id: number) => {
    const next = amenityIds.includes(id) ? amenityIds.filter((a) => a !== id) : [...amenityIds, id];
    form.setValue("amenities.amenityIds", next);
  };

  const authorityIds = form.watch("amenities.authorityIds") ?? [];

  const toggleAuthority = (id: number) => {
    const next = authorityIds.includes(id) ? authorityIds.filter((a) => a !== id) : [...authorityIds, id];
    form.setValue("amenities.authorityIds", next);
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-5 lg:grid-cols-2">
        <Card className="border-0 bg-white p-5 shadow-xl">
          <p className="mb-3 text-sm font-semibold text-slate-700">Furnishing & Facilities</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="amenities.furnishing"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Furnishing</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value ?? ""}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Unfurnished / Semi / Full" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="UNFURNISHED">Unfurnished</SelectItem>
                      <SelectItem value="SEMI_FURNISHED">Semi furnished</SelectItem>
                      <SelectItem value="FULLY_FURNISHED">Fully furnished</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="amenities.parkingAvailable"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center gap-2 space-y-0 rounded-2xl border border-slate-200 p-3">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <FormLabel className="text-sm text-slate-800">Private parking available</FormLabel>
                </FormItem>
              )}
            />
          </div>

          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {furnishingItems.map((item) => (
              <FormField
                key={item}
                control={form.control}
                name={`amenities.furnishingDetails.${item}` as const}
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center gap-2 space-y-0 rounded-xl border border-slate-200 p-3">
                    <FormControl>
                      <Checkbox checked={!!field.value} onCheckedChange={(checked) => field.onChange(Boolean(checked))} />
                    </FormControl>
                    <FormLabel className="text-sm text-slate-800">{item}</FormLabel>
                  </FormItem>
                )}
              />
            ))}
          </div>

          <Separator className="my-4" />
          <p className="text-sm font-semibold text-slate-700">Amenities</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {amenityOptions.map((amenity) => (
              <button
                type="button"
                key={amenity.id}
                onClick={() => toggleAmenity(amenity.id)}
                className={cn(
                  "rounded-full border px-3 py-2 text-sm transition-all",
                  amenityIds.includes(amenity.id)
                    ? "border-sky-500 bg-sky-50 text-sky-700 shadow-sky-100"
                    : "border-slate-200 text-slate-700 hover:border-sky-200",
                )}
              >
                {amenity.label}
              </button>
            ))}
          </div>
        </Card>

        <Card className="border border-slate-100 bg-gradient-to-br from-white via-slate-50 to-white p-5 text-slate-900 shadow-xl">
          <p className="mb-3 text-sm font-semibold text-slate-800">Ownership & Legal</p>
          <FormField
            control={form.control}
            name="amenities.ownershipType"
            rules={{ required: "Ownership required" }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ownership type</FormLabel>
                <Select onValueChange={field.onChange} value={field.value ?? ""}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Freehold / Leasehold / Co-operative" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="FREEHOLD">Freehold</SelectItem>
                    <SelectItem value="LEASEHOLD">Leasehold</SelectItem>
                    <SelectItem value="CO_OPERATIVE">Co-operative</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {authorityOptions.map((authority) => (
              <FormItem
                key={authority.id}
                className="flex flex-row items-center gap-2 space-y-0 rounded-2xl border border-slate-200 bg-white p-3"
              >
                <FormControl>
                  <Checkbox checked={authorityIds.includes(authority.id)} onCheckedChange={() => toggleAuthority(authority.id)} />
                </FormControl>
                <FormLabel className="text-sm text-slate-800">{authority.label}</FormLabel>
              </FormItem>
            ))}
          </div>

          <Separator className="my-4 border-slate-200" />
          <div className="grid gap-3 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="amenities.boundaryWall"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center gap-2 space-y-0 rounded-2xl border border-slate-200 bg-white p-3">
                  <FormControl>
                    <Checkbox checked={!!field.value} onCheckedChange={(checked) => field.onChange(Boolean(checked))} />
                  </FormControl>
                  <FormLabel className="text-sm text-slate-800">Boundary wall</FormLabel>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="amenities.fireNoc"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center gap-2 space-y-0 rounded-2xl border border-slate-200 bg-white p-3">
                  <FormControl>
                    <Checkbox checked={!!field.value} onCheckedChange={(checked) => field.onChange(Boolean(checked))} />
                  </FormControl>
                  <FormLabel className="text-sm text-slate-800">Fire NOC</FormLabel>
                </FormItem>
              )}
            />
          </div>
        </Card>
      </div>
    </div>
  );
}

function MediaReviewStep({ form }: StepProps) {
  const mediaIds = form.watch("media.mediaIds") ?? [];
  const documentIds = form.watch("media.documentIds") ?? [];
  const summary = form.watch();

  const updateNumberArray = (value: string, path: "media.mediaIds" | "media.documentIds") => {
    const parsed = value
      .split(",")
      .map((v) => v.trim())
      .filter(Boolean)
      .map((v) => Number(v))
      .filter((v) => !Number.isNaN(v));
    form.setValue(path, parsed);
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-5 lg:grid-cols-2">
        <Card className="border-0 bg-white p-5 shadow-xl">
          <p className="mb-3 text-sm font-semibold text-slate-700">Media</p>
          <div className="grid gap-4">
            <FormField
              control={form.control}
              name="media.mediaIds"
              render={() => (
                <FormItem>
                  <FormLabel>Image IDs</FormLabel>
                  <Input
                    value={mediaIds.join(", ")}
                    onChange={(e) => updateNumberArray(e.target.value, "media.mediaIds")}
                    placeholder="101, 102, 103"
                  />
                  <FormDescription className="text-xs text-slate-500">Require at least one image before publish.</FormDescription>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="media.documentIds"
              render={() => (
                <FormItem>
                  <FormLabel>Document IDs (floorplans, agreements)</FormLabel>
                  <Input
                    value={documentIds.join(", ")}
                    onChange={(e) => updateNumberArray(e.target.value, "media.documentIds")}
                    placeholder="201, 202"
                  />
                </FormItem>
              )}
            />
          </div>

          <Separator className="my-4" />
          <FormField
            control={form.control}
            name="meta.title"
            rules={{ required: "Title required" }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <Input value={field.value ?? ""} onChange={(e) => field.onChange(e.target.value)} placeholder="2 BHK Apartment for Rent in HSR Layout" />
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="meta.description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <Textarea
                  value={field.value ?? ""}
                  onChange={(e) => field.onChange(e.target.value)}
                  placeholder="Spacious semi furnished 2 BHK with parking..."
                  rows={5}
                />
              </FormItem>
            )}
          />
        </Card>

        <Card className="border border-slate-100 bg-gradient-to-br from-white via-slate-50 to-white p-5 text-slate-900 shadow-xl">
          <p className="mb-3 text-sm font-semibold text-slate-800">Publish options & quick review</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="publishOptions.status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Publish status</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value ?? ""}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Draft / Active" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="DRAFT">Draft</SelectItem>
                      <SelectItem value="ACTIVE">Active</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="publishOptions.qcRequired"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center gap-2 space-y-0 rounded-2xl border border-slate-200 bg-white p-3">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <FormLabel className="text-sm text-slate-800">QC required</FormLabel>
                </FormItem>
              )}
            />
          </div>

          <Separator className="my-4 border-slate-200" />

          <div className="space-y-3">
            <ReviewRow label="Listing type" value={`${summary.context.listingType} · ${summary.context.resCom}`} />
            <ReviewRow label="Property" value={`${summary.context.propertyTypeId || "—"} / ${summary.context.propertySubTypeId || "—"}`} />
            <ReviewRow label="Location" value={`${summary.location.localityId || "Locality"} · ${summary.location.cityId || "City"}`} />
            <ReviewRow label="Price" value={summary.pricing.price ? `₹${summary.pricing.price}` : "Add price"} />
            <ReviewRow label="Availability" value={summary.availability.availabilityStatus || "Set availability"} />
          </div>
        </Card>
      </div>
    </div>
  );
}

const ReviewRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-3 py-2">
    <span className="text-xs uppercase tracking-[0.2em] text-slate-500">{label}</span>
    <span className="text-sm font-semibold text-slate-900">{value}</span>
  </div>
);
