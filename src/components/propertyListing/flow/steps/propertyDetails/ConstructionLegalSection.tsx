import React from "react";
import { Card } from "@/components/ui/card";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/components/ui/utils";
import type { StepProps } from "../StepCommon";
import { fireSafetyOptions, businessUseOptions } from "./constants";

type ConstructionLegalSectionProps = StepProps & {
  isResidential: boolean;
  isCommercial: boolean;
  isPlot: boolean;
};

export const ConstructionLegalSection: React.FC<ConstructionLegalSectionProps> = ({ form, isResidential, isCommercial, isPlot }) => {
  const toggleRecord = (path: "amenities.fireSafety", key: string) => {
    const current = form.getValues(path) ?? {};
    const next = { ...current };
    if (next[key]) {
      delete next[key];
    } else {
      next[key] = true;
    }
    form.setValue(path, next);
  };

  if (isPlot) return null;

  return (
    <Card className="border border-slate-100 bg-white p-5 shadow-xl">
      <p className="mb-3 text-sm font-semibold text-slate-800">Construction & legal</p>
      {(isResidential || isCommercial) && (
        <div className="grid gap-3 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="availability.constructionDone"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-2xl border border-slate-200 bg-white px-3 py-2">
                <FormLabel className="text-sm text-slate-800">Construction done</FormLabel>
                <FormControl>
                  <Switch checked={!!field.value} onCheckedChange={field.onChange} />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="availability.constructionType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Construction type</FormLabel>
                <Select onValueChange={field.onChange} value={field.value ?? ""}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="RCC / Steel / Other" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="RCC">RCC</SelectItem>
                    <SelectItem value="STEEL">Steel</SelectItem>
                    <SelectItem value="PRECAST">Precast</SelectItem>
                    <SelectItem value="OTHER">Other</SelectItem>
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />
        </div>
      )}

      {isResidential && (
        <FormField
          control={form.control}
          name="amenities.boundaryWall"
          render={({ field }) => (
            <FormItem className="mt-3 flex flex-row items-center justify-between rounded-2xl border border-slate-200 bg-white px-3 py-2">
              <FormLabel className="text-sm text-slate-800">Boundary wall</FormLabel>
              <FormControl>
                <Switch checked={!!field.value} onCheckedChange={field.onChange} />
              </FormControl>
            </FormItem>
          )}
        />
      )}

      {(isResidential || isCommercial) && (
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="details.ageOfProperty"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Age of property</FormLabel>
                <Select onValueChange={field.onChange} value={field.value ?? ""}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select age" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="0_1">0-1 year</SelectItem>
                    <SelectItem value="1_5">1-5 years</SelectItem>
                    <SelectItem value="5_10">5-10 years</SelectItem>
                    <SelectItem value="10_PLUS">10+ years</SelectItem>
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />

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
                      <SelectValue placeholder="Freehold / Leasehold / Co-op" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="FREEHOLD">Freehold</SelectItem>
                    <SelectItem value="LEASEHOLD">Leasehold</SelectItem>
                    <SelectItem value="CO_OPERATIVE">Co-operative</SelectItem>
                    <SelectItem value="POWER_OF_ATTORNEY">Power of Attorney</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      )}

      {(isResidential || isCommercial) && (
        <FormField
          control={form.control}
          name="amenities.approvedBy"
          render={() => (
            <FormItem className="mt-3">
              <FormLabel>Approved by</FormLabel>
              <Select
                onValueChange={(value) => {
                  const selected = value ? { [value]: true } : {};
                  form.setValue("amenities.approvedBy", selected);
                }}
                value={Object.keys(form.watch("amenities.approvedBy") ?? {})[0] ?? ""}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Authority" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="RERA">RERA</SelectItem>
                  <SelectItem value="LOCAL_AUTHORITY">Local authority</SelectItem>
                  <SelectItem value="FIRE_DEPARTMENT">Fire department</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />
      )}

      {isCommercial && (
        <>
          <div className="mt-4">
            <p className="text-sm font-semibold text-slate-800">Fire safety</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {fireSafetyOptions.map((option) => {
                const current = form.watch("amenities.fireSafety") ?? {};
                const active = !!current[option];
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => toggleRecord("amenities.fireSafety", option)}
                    className={cn(
                      "rounded-full border px-3 py-1 text-sm",
                      active ? "border-sky-500 bg-sky-50 text-sky-700" : "border-slate-200 text-slate-700",
                    )}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="amenities.fireNoc"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-2xl border border-slate-200 bg-white px-3 py-2">
                  <FormLabel className="text-sm text-slate-800">Fire NOC</FormLabel>
                  <FormControl>
                    <Switch checked={!!field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="details.suitableForBussinessType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Approved for business type</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value ?? ""}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select use case" />
                      </SelectTrigger>
                    </FormControl>
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
        </>
      )}
    </Card>
  );
};
