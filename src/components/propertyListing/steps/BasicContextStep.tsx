import React, { useMemo } from "react";
import { Building2, Sparkles } from "lucide-react";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/components/ui/utils";
import { propertyTypeCatalog } from "@/features/propertyListing";
import { FieldShell } from "./StepCommon";
import type { StepProps } from "./StepCommon";

export function BasicContextStep({ form }: StepProps) {
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
