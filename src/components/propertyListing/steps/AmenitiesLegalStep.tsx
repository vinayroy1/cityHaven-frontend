import React from "react";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/components/ui/utils";
import { amenityOptions, authorityOptions, furnishingItems } from "@/features/propertyListing";
import type { StepProps } from "./StepCommon";

export function AmenitiesLegalStep({ form }: StepProps) {
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
