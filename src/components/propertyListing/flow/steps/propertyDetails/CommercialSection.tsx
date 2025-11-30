import React from "react";
import { Card } from "@/components/ui/card";
import { FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { NumberInput } from "../StepCommon";
import type { StepProps } from "../StepCommon";
import { businessUseOptions } from "./constants";
import { StepperInput } from "./StepperInput";

type CommercialSectionProps = StepProps & {
  isCommercial: boolean;
  isPlot: boolean;
  isOffice: boolean;
};

export const CommercialSection: React.FC<CommercialSectionProps> = ({ form, isCommercial, isPlot, isOffice }) => {
  if (!isCommercial || isPlot) return null;

  return (
    <Card className="border border-slate-100 bg-white p-5 shadow-xl">
      <p className="mb-3 text-sm font-semibold text-slate-800">Commercial specifics</p>
      <div className="grid gap-3 sm:grid-cols-2">
        {isOffice && (
          <>
            <FormField
              control={form.control}
              name="details.officeType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Office type</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value ?? ""}>
                    <SelectTrigger>
                      <SelectValue placeholder="Private / Co-working" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PRIVATE">Private</SelectItem>
                      <SelectItem value="CO_WORKING">Co-working</SelectItem>
                      <SelectItem value="MANAGED">Managed / Serviced</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="details.cabinCount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cabin count</FormLabel>
                  <StepperInput field={field} min={0} max={50} />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="details.workstations"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Workstations</FormLabel>
                  <StepperInput field={field} min={0} max={500} />
                </FormItem>
              )}
            />
          </>
        )}
        <FormField
          control={form.control}
          name="details.washroomType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Washroom type</FormLabel>
              <Select onValueChange={field.onChange} value={field.value ?? ""}>
                <SelectTrigger>
                  <SelectValue placeholder="Private / Shared / None" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PRIVATE">Private</SelectItem>
                  <SelectItem value="SHARED">Shared</SelectItem>
                  <SelectItem value="NONE">None</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="amenities.pantryType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Pantry type</FormLabel>
              <Select onValueChange={field.onChange} value={field.value ?? ""}>
                <SelectTrigger>
                  <SelectValue placeholder="Dry / Wet / Canteen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NONE">None</SelectItem>
                  <SelectItem value="DRY">Dry</SelectItem>
                  <SelectItem value="WET">Wet</SelectItem>
                  <SelectItem value="CANTEEN">Canteen nearby</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="details.ceilingHeight"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ceiling height</FormLabel>
              <NumberInput field={field} placeholder="12" />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="details.businessApproval"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Approved for business</FormLabel>
              <Select onValueChange={field.onChange} value={field.value ?? ""}>
                <SelectTrigger>
                  <SelectValue placeholder="IT / Retail / Clinic / Warehouse" />
                </SelectTrigger>
                <SelectContent>
                  {businessUseOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />
      </div>
    </Card>
  );
};
