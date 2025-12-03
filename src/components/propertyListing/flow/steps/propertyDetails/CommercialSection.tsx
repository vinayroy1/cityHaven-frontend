import React from "react";
import { Card } from "@/components/ui/card";
import { FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { NumberInput } from "../StepCommon";
import type { StepProps } from "../StepCommon";
import { businessUseOptions } from "./constants";
import { StepperInput } from "./StepperInput";
import type { PropertyDetailsVisibility } from "./visibility";

type CommercialSectionProps = StepProps & {
  visibility: PropertyDetailsVisibility["commercial"];
};

export const CommercialSection: React.FC<CommercialSectionProps> = ({ form, visibility }) => {
  if (!visibility.showSection) return null;

  return (
    <Card className="border border-slate-100 bg-white p-5 shadow-xl">
      <p className="mb-3 text-sm font-semibold text-slate-800">Commercial specifics</p>
      <div className="grid gap-3 sm:grid-cols-2">
        {visibility.showOfficeFields && (
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
            {visibility.showMeetingRooms && (
              <FormField
                control={form.control}
                name="details.meetingRooms"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Meeting rooms</FormLabel>
                    <StepperInput field={field} min={0} max={50} />
                  </FormItem>
                )}
              />
            )}
            {visibility.showCabins && (
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
            )}
            {visibility.showWorkstations && (
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
            )}
          </>
        )}

        {visibility.showTotalRooms && (
          <FormField
            control={form.control}
            name="details.totalRooms"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Total rooms</FormLabel>
                <StepperInput field={field} min={0} max={500} />
              </FormItem>
            )}
          />
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

        {visibility.showPantry && (
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
        )}

        {visibility.showConferenceRoom && (
          <FormField
            control={form.control}
            name="amenities.conferenceRoom"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-2xl border border-slate-200 bg-white px-3 py-2">
                <FormLabel className="text-sm text-slate-800">Conference room</FormLabel>
                <FormControl>
                  <Switch checked={!!field.value} onCheckedChange={field.onChange} />
                </FormControl>
              </FormItem>
            )}
          />
        )}

        {visibility.showCeilingHeight && (
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
        )}

        {visibility.showBusinessApproval && (
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
        )}
      </div>
    </Card>
  );
};
