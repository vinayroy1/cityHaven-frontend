import React from "react";
import { Card } from "@/components/ui/card";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { NumberInput } from "../StepCommon";
import type { StepProps } from "../StepCommon";
import { StepperInput } from "./StepperInput";
import type { PropertyDetailsVisibility } from "./visibility";

type RoomsLayoutSectionProps = StepProps & {
  visibility: PropertyDetailsVisibility["rooms"];
  canShowMultiFloorSelect: boolean;
};

export const RoomsLayoutSection: React.FC<RoomsLayoutSectionProps> = ({ form, visibility, canShowMultiFloorSelect }) => (
  <Card className="border border-slate-100 bg-white p-5 shadow-xl">
    <p className="mb-3 text-sm font-semibold text-slate-800">Rooms & layout</p>
    <div className="grid gap-4 md:grid-cols-2">
      {(visibility.showBedrooms || visibility.showBathrooms) && (
        <>
          {visibility.showBedrooms && (
            <FormField
              control={form.control}
              name="details.bedrooms"
              rules={{ required: "Bedrooms required" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bedrooms</FormLabel>
                  <StepperInput field={field} min={0} max={12} />
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
          {visibility.showBathrooms && (
            <FormField
              control={form.control}
              name="details.bathrooms"
              rules={{ required: "Bathrooms required" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bathrooms</FormLabel>
                  <StepperInput field={field} min={0} max={12} />
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </>
      )}

      {visibility.showBalconies && (
        <FormField
          control={form.control}
          name="details.balconies"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Balconies</FormLabel>
              <StepperInput field={field} min={0} max={8} />
            </FormItem>
          )}
        />
      )}

      {visibility.showKitchenType && (
        <FormField
          control={form.control}
          name="details.kitchenType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Kitchen type</FormLabel>
              <Select onValueChange={field.onChange} value={field.value ?? ""}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Modular / Semi / Normal" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="MODULAR">Modular</SelectItem>
                  <SelectItem value="SEMI_MODULAR">Semi modular</SelectItem>
                  <SelectItem value="NORMAL">Normal</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />
      )}

      {visibility.showFloorNumber && (
        <>
          <FormField
            control={form.control}
            name="details.floorNumber"
            rules={visibility.floorNumberRequired ? { required: "Floor number required" } : undefined}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Floor number</FormLabel>
                <NumberInput field={{ value: field.value ? Number(field.value) : null, onChange: (val) => field.onChange(val) }} placeholder="2" />
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="details.totalFloors"
            rules={visibility.totalFloorsRequired ? { required: "Total floors required" } : undefined}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Total floors</FormLabel>
                <NumberInput field={field} placeholder="5" />
                <FormMessage />
              </FormItem>
            )}
          />
        </>
      )}

      {visibility.showFloorsAllowed && (
        <FormField
          control={form.control}
          name="details.floorsAllowed"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Floors allowed</FormLabel>
              <NumberInput field={field} placeholder="3" />
            </FormItem>
          )}
        />
      )}

      {visibility.allowMultiFloorSelect && canShowMultiFloorSelect && (
        <>
          <FormField
            control={form.control}
            name="details.multiFloorSelect"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-2xl border border-slate-200 bg-white px-3 py-2">
                <FormLabel className="text-sm text-slate-800">Multi-floor listing</FormLabel>
                <FormControl>
                  <Switch checked={!!field.value} onCheckedChange={field.onChange} />
                </FormControl>
              </FormItem>
            )}
          />
          {form.watch("details.multiFloorSelect") && canShowMultiFloorSelect && (
            <FormField
              control={form.control}
              name="details.multiFloorNum"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>No. of floors offered</FormLabel>
                  <NumberInput field={field} placeholder="2" />
                </FormItem>
              )}
            />
          )}
        </>
      )}

      {visibility.showOpenSides && (
        <>
          <FormField
            control={form.control}
            name="details.openSides"
            render={({ field }) => (
              <FormItem>
              <FormLabel>Open sides</FormLabel>
              <NumberInput field={field} placeholder="2" />
            </FormItem>
          )}
          />
        </>
      )}

      {visibility.showStaircases && (
        <FormField
          control={form.control}
          name="details.staircases"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Staircases</FormLabel>
              <NumberInput field={field} placeholder="1" />
            </FormItem>
          )}
        />
      )}

      {visibility.showCeilingWidth && (
        <>
          <FormField
            control={form.control}
            name="details.ceilingWidth"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ceiling width</FormLabel>
                <NumberInput field={field} placeholder="12" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="details.ceilingWidthUnit"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ceiling width unit</FormLabel>
                <Select onValueChange={field.onChange} value={field.value ?? ""}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Feet / Meter" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="FEET">Feet</SelectItem>
                    <SelectItem value="METER">Meter</SelectItem>
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />
        </>
      )}

      {visibility.showEntranceWidth && (
        <>
          <FormField
            control={form.control}
            name="details.entranceWidth"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Entrance width</FormLabel>
                <NumberInput field={field} placeholder="5" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="details.entranceWidthUnit"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Entrance width unit</FormLabel>
                <Select onValueChange={field.onChange} value={field.value ?? ""}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Feet / Meter" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="FEET">Feet</SelectItem>
                    <SelectItem value="METER">Meter</SelectItem>
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />
        </>
      )}

      {visibility.showPropertyFacing && (
        <FormField
          control={form.control}
          name="details.propertyFacing"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Property facing</FormLabel>
              <Select onValueChange={field.onChange} value={field.value ?? ""}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Direction" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {["EAST", "WEST", "NORTH", "SOUTH", "NORTH_EAST", "NORTH_WEST", "SOUTH_EAST", "SOUTH_WEST"].map((option) => (
                    <SelectItem key={option} value={option}>
                      {option.replace("_", " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />
      )}

      {visibility.showWidthOfFacingRoad && (
        <>
          <FormField
            control={form.control}
            name="details.widthOfFacingRoad"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Width of facing road</FormLabel>
                <NumberInput field={field} placeholder="30" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="details.widthUnit"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Facing road unit</FormLabel>
                <Select onValueChange={field.onChange} value={field.value ?? ""}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Feet / Meter" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="FEET">Feet</SelectItem>
                    <SelectItem value="METER">Meter</SelectItem>
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />
        </>
      )}
    </div>
  </Card>
);
