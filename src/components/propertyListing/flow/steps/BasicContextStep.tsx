import React, { useEffect, useMemo } from "react";
import { Building2, Sparkles } from "lucide-react";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/components/ui/utils";
import { getAllowedPropertyTypes, getSubTypesForSelection, propertyTypes } from "@/features/propertyListing";
import { FieldShell } from "./StepCommon";
import type { StepProps } from "./StepCommon";

export function BasicContextStep({ form }: StepProps) {
  const listingType = form.watch("context.listingType");
  const propertyTypeId = `${form.watch("context.propertyTypeId") ?? ""}`;
  const propertySubTypeId = `${form.watch("context.propertySubTypeId") ?? ""}`;

  const allowedPropertyTypes = useMemo(() => getAllowedPropertyTypes(listingType), [listingType]);

  const selectedPropertyType = allowedPropertyTypes.find((p) => p.id === propertyTypeId);

  const availableSubTypes = useMemo(
    () => (selectedPropertyType ? getSubTypesForSelection(listingType, selectedPropertyType.id) : []),
    [listingType, selectedPropertyType?.id],
  );
  const selectedSubType = availableSubTypes.find((s) => s.id === propertySubTypeId);
  const showSubCategory = selectedPropertyType?.resCom === "COMMERCIAL" && Boolean(selectedSubType?.categories?.length);
  const showLocatedInside =
    selectedPropertyType?.resCom === "COMMERCIAL" &&
    (selectedSubType?.slug === "office" || selectedSubType?.slug === "retail") &&
    Boolean(selectedSubType?.locatedInsideOptions?.length);
  const subTypeGridCols = showSubCategory ? "sm:grid-cols-2" : "sm:grid-cols-1";
  const locatedGridCols = showLocatedInside ? "sm:grid-cols-2" : "sm:grid-cols-1";

  useEffect(() => {
    if (listingType === "PG") {
      if (propertyTypeId !== "1") {
        form.setValue("context.propertyTypeId", "1");
        form.setValue("context.resCom", "RESIDENTIAL");
        form.setValue("context.propertySubTypeId", "");
        form.setValue("context.propertySubCategoryId", "");
        form.setValue("context.locatedInsideId", "");
      }
      return;
    }
    if (propertyTypeId === "3") {
      form.setValue("context.propertyTypeId", "");
      form.setValue("context.propertySubTypeId", "");
      form.setValue("context.propertySubCategoryId", "");
      form.setValue("context.locatedInsideId", "");
      form.setValue("context.resCom", "RESIDENTIAL");
    }
  }, [form, listingType, propertyTypeId]);

  useEffect(() => {
    if (selectedPropertyType) {
      form.setValue("context.resCom", selectedPropertyType.resCom);
    }
  }, [form, selectedPropertyType]);

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
                    const nextAllowedTypes = getAllowedPropertyTypes(value);
                    const currentAllowed = nextAllowedTypes.find((t) => t.id === propertyTypeId);
                    const nextType = currentAllowed ?? nextAllowedTypes[0];
                    if (value === "PG") {
                      form.setValue("context.propertyTypeId", nextType?.id ?? "");
                      form.setValue("context.propertySubTypeId", "");
                      form.setValue("context.propertySubCategoryId", "");
                      form.setValue("context.locatedInsideId", "");
                      form.setValue("context.resCom", "RESIDENTIAL");
                    } else {
                      form.setValue("context.propertyTypeId", nextType?.id ?? "");
                      form.setValue("context.propertySubTypeId", "");
                      form.setValue("context.propertySubCategoryId", "");
                      form.setValue("context.locatedInsideId", "");
                      form.setValue("context.resCom", nextType?.resCom ?? "RESIDENTIAL");
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
                  {allowedPropertyTypes.map((type) => {
                    const Icon = type.icon;
                    const isActive = `${field.value ?? ""}` === type.id;
                    return (
                      <button
                        key={type.id}
                        type="button"
                        onClick={() => {
                          field.onChange(type.id);
                          form.setValue("context.propertySubTypeId", "");
                          form.setValue("context.propertySubCategoryId", "");
                          form.setValue("context.locatedInsideId", "");
                          form.setValue("context.resCom", type.resCom);
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

          <div className={cn("grid gap-4", subTypeGridCols)}>
            <FormField
              control={form.control}
              name="context.propertySubTypeId"
              rules={{ required: "Select a sub-type" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Property sub-type</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                      form.setValue("context.propertySubCategoryId", "");
                      form.setValue("context.locatedInsideId", "");
                    }}
                    value={field.value ?? ""}
                    disabled={!selectedPropertyType || !availableSubTypes.length}
                  >
                    <FormControl>
                      <SelectTrigger data-testid="property-sub-type-trigger">
                        <SelectValue placeholder="Apartment, Office, Retail, PG beds..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {availableSubTypes.map((sub) => (
                        <SelectItem key={sub.slug} value={sub.id}>
                          {sub.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            {showSubCategory && (
              <FormField
                control={form.control}
                name="context.propertySubCategoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Property sub-category</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value ?? ""} disabled={!showSubCategory}>
                      <FormControl>
                        <SelectTrigger data-testid="property-sub-category-trigger">
                          <SelectValue placeholder="Ready to move, bare shell..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {(selectedSubType?.categories ?? []).map((cat) => (
                          <SelectItem key={cat.slug} value={cat.id}>
                            {cat.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
            )}
          </div>

          <div className={cn("grid gap-4", locatedGridCols)}>
            {showLocatedInside && (
              <FormField
                control={form.control}
                name="context.locatedInsideId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Located inside</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value ?? ""} disabled={!showLocatedInside}>
                      <FormControl>
                        <SelectTrigger data-testid="located-inside-trigger">
                          <SelectValue placeholder="Mall, Tech Park, Business tower" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {(selectedSubType?.locatedInsideOptions ?? []).map((option) => (
                          <SelectItem key={option.slug} value={option.id}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
            )}

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
