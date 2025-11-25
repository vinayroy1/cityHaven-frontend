import React from "react";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import type { StepProps } from "./StepCommon";

export function MediaReviewStep({ form }: StepProps) {
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
