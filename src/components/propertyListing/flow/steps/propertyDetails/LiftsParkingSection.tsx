import React from "react";
import { Card } from "@/components/ui/card";
import { FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { NumberInput } from "../StepCommon";
import type { StepProps } from "../StepCommon";
import type { PropertyDetailsVisibility } from "./visibility";

type LiftsParkingSectionProps = StepProps & {
  visibility: PropertyDetailsVisibility["building"];
};

export const LiftsParkingSection: React.FC<LiftsParkingSectionProps> = ({ form, visibility }) => {
  if (!visibility.showSection) return null;

  const parkingAvailable = form.watch("amenities.parkingAvailable");
  const liftsAvailable = form.watch("details.lift");

  return (
    <Card className="border border-slate-100 bg-white p-5 shadow-xl">
      <p className="mb-3 text-sm font-semibold text-slate-800">Lifts & parking</p>
      <div className="grid gap-3 sm:grid-cols-2">
        {visibility.showLifts && (
          <FormField
            control={form.control}
            name="details.lift"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-2xl border border-slate-200 bg-white px-3 py-2">
                <FormLabel className="text-sm text-slate-800">Lifts available</FormLabel>
                <FormControl>
                  <Switch checked={!!field.value} onCheckedChange={field.onChange} />
                </FormControl>
              </FormItem>
            )}
          />
        )}

        {visibility.showLiftCounts && liftsAvailable && (
          <>
            <FormField
              control={form.control}
              name="details.passengerLifts"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Passenger lifts</FormLabel>
                  <NumberInput field={field} placeholder="2" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="details.serviceLifts"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Service lifts</FormLabel>
                  <NumberInput field={field} placeholder="1" />
                </FormItem>
              )}
            />
          </>
        )}

        {visibility.showParking && (
          <FormField
            control={form.control}
            name="amenities.parkingAvailable"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Parking</FormLabel>
                <Select onValueChange={(val) => field.onChange(val === "true")} value={field.value ? "true" : "false"}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Available / Not available" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="true">Available</SelectItem>
                    <SelectItem value="false">Not available</SelectItem>
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />
        )}

        {visibility.showParkingBreakdown && parkingAvailable && (
          <>
            <FormField
              control={form.control}
              name="amenities.privateParkingBasement"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-2xl border border-slate-200 bg-white px-3 py-2">
                  <FormLabel className="text-sm text-slate-800">Private parking in basement</FormLabel>
                  <FormControl>
                    <Switch checked={!!field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="amenities.privateParkingOutside"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-2xl border border-slate-200 bg-white px-3 py-2">
                  <FormLabel className="text-sm text-slate-800">Private parking outside</FormLabel>
                  <FormControl>
                    <Switch checked={!!field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="amenities.publicParking"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-2xl border border-slate-200 bg-white px-3 py-2">
                  <FormLabel className="text-sm text-slate-800">Public parking</FormLabel>
                  <FormControl>
                    <Switch checked={!!field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />
            {visibility.showMultilevelParking && (
              <FormField
                control={form.control}
                name="amenities.multilevelParking"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-2xl border border-slate-200 bg-white px-3 py-2">
                    <FormLabel className="text-sm text-slate-800">Multilevel parking</FormLabel>
                    <FormControl>
                      <Switch checked={!!field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
            )}
            <FormField
              control={form.control}
              name="amenities.noOfParkings"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>No. of parking slots (optional)</FormLabel>
                  <NumberInput field={field} placeholder="2" />
                </FormItem>
              )}
            />
          </>
        )}
      </div>
    </Card>
  );
};
