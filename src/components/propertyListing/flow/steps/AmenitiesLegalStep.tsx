import React from "react";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { cn } from "@/components/ui/utils";
import { amenityCategories, amenityOptions } from "@/features/propertyListing";
import type { StepProps } from "./StepCommon";
import { useWatch } from "react-hook-form";

export function AmenitiesLegalStep({ form }: StepProps) {
  const amenityIds = useWatch({ control: form.control, name: "amenities.amenityIds" }) ?? [];

  const toggleAmenity = (id: number) => {
    const next = amenityIds.includes(id) ? amenityIds.filter((a) => a !== id) : [...amenityIds, id];
    form.setValue("amenities.amenityIds", next, { shouldDirty: true, shouldValidate: false, shouldTouch: true });
  };

  return (
    <div className="space-y-4">
      <Card className="border border-slate-200 bg-white p-5 shadow-xl">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-slate-800">Amenities</p>
        </div>

        <FormField
          control={form.control}
          name="amenities.parkingAvailable"
          render={({ field }) => (
            <FormItem className="mb-4 mt-3 flex flex-row items-center gap-2 space-y-0 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2">
              <FormControl>
                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
              <FormLabel className="text-sm text-slate-800">Private parking available</FormLabel>
            </FormItem>
          )}
        />

        <p className="text-xs uppercase tracking-wide text-slate-500">Amenity groups</p>
        <div className="mt-2 grid gap-3 lg:grid-cols-2">
          {amenityCategories
            .map((category) => ({
              ...category,
              items: amenityOptions.filter((opt) => opt.categoryId === category.id),
            }))
            .filter((category) => category.items.length)
            .map((category) => (
              <div key={category.id} className="rounded-xl border border-slate-200/80 bg-slate-50 p-3">
                <p className="text-sm font-semibold text-slate-800">{category.name}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {category.items.map((amenity) => (
                    <button
                      type="button"
                      key={amenity.id}
                      onClick={() => toggleAmenity(amenity.id)}
                      className={cn(
                        "rounded-full border px-3 py-1.5 text-sm transition-all",
                        amenityIds.includes(amenity.id)
                          ? "border-sky-500 bg-sky-50 text-sky-700 shadow-sky-100"
                          : "border-slate-200 text-slate-700 hover:border-sky-200",
                      )}
                    >
                      {amenity.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
        </div>
      </Card>
    </div>
  );
}
