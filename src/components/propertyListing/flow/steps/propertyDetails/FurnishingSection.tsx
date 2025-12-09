import React from "react";
import { Card } from "@/components/ui/card";
import { FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/components/ui/utils";
import type { StepProps } from "../StepCommon";
import { furnishingItems } from "./constants";
import { StepperInput } from "./StepperInput";

type FurnishingSectionProps = StepProps & {
  furnishingMode: string;
  allowedItems: typeof furnishingItems;
};

export const FurnishingSection: React.FC<FurnishingSectionProps> = ({ form, furnishingMode, allowedItems }) => {
  const furnishingSelections = form.watch("amenities.furnishingDetails") ?? {};
  const selectedFurnishingCount = Object.values(furnishingSelections).filter((val) => Number(val ?? 0) > 0).length;
  const showMinSelectionReminder = furnishingMode === "FULLY_FURNISHED" && selectedFurnishingCount === 0;

  return (
    <Card className="border border-slate-100 bg-white p-5 shadow-xl">
      <p className="mb-3 text-sm font-semibold text-slate-800">Furnishing & interior</p>
      <div className="space-y-4">
        <FormField
          control={form.control}
          name="amenities.furnishing"
          render={({ field }) => (
            <FormItem className="max-w-xs">
              <FormLabel>Furnishing status</FormLabel>
              <Select onValueChange={field.onChange} value={field.value ?? ""}>
                <SelectTrigger>
                  <SelectValue placeholder="Unfurnished / Semi / Full" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="UNFURNISHED">Unfurnished</SelectItem>
                  <SelectItem value="SEMI_FURNISHED">Semi-furnished</SelectItem>
                  <SelectItem value="FULLY_FURNISHED">Fully furnished</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />

        {furnishingMode !== "UNFURNISHED" && (
          <div className="rounded-2xl border border-slate-200/80 bg-slate-50/40 p-4">
            <div className="mb-2">
              <p className="text-sm font-semibold text-slate-800">Furnishing items</p>
              <p className="text-xs text-slate-500">
                {furnishingMode === "SEMI_FURNISHED" ? "Only items allowed for Semi-furnished." : "Only items allowed for Fully furnished."}
              </p>
            </div>
            <FormField
              control={form.control}
              name="amenities.furnishingDetails"
              render={() => (
                <FormItem>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {allowedItems.map((item) => (
                      <FormField
                        key={item.key}
                        control={form.control}
                        name={`amenities.furnishingDetails.${item.key}` as const}
                        render={({ field }) => (
                          <FormItem className={cn("flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white p-3")}>
                            <FormLabel className="text-sm text-slate-800">{item.label}</FormLabel>
                            <StepperInput field={field} min={0} max={10} />
                          </FormItem>
                        )}
                      />
                    ))}
                  </div>
                  {showMinSelectionReminder && (
                    <p className="mt-3 text-xs text-amber-600">Select at least one furnishing item when marking the property as furnished.</p>
                  )}
                </FormItem>
              )}
            />
          </div>
        )}
      </div>
    </Card>
  );
};
