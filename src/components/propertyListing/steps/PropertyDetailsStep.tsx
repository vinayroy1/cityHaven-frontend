import React from "react";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { NumberInput } from "./StepCommon";
import type { StepProps } from "./StepCommon";

export function PropertyDetailsStep({ form }: StepProps) {
  const listingType = form.watch("context.listingType");
  const resCom = form.watch("context.resCom");

  return (
    <div className="space-y-6">
      <div className="grid gap-5 lg:grid-cols-2">
        <Card className="border-0 bg-white/85 p-5 shadow-xl">
          <p className="mb-3 text-sm font-semibold text-slate-700">Dimensions</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="details.carpetArea"
              rules={{ required: "Enter carpet area" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Carpet area</FormLabel>
                  <NumberInput field={field} placeholder="950" />
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="details.carpetAreaUnit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Carpet unit</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value ?? ""}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sq.ft / Sq.m" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="SQ_FT">Sq.ft</SelectItem>
                      <SelectItem value="SQ_M">Sq.m</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="details.builtUpArea"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Built-up area</FormLabel>
                  <NumberInput field={field} placeholder="1100" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="details.superBuiltUpArea"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Super built-up area</FormLabel>
                  <NumberInput field={field} placeholder="1200" />
                </FormItem>
              )}
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="details.plotArea"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Plot area (for plots)</FormLabel>
                  <NumberInput field={field} placeholder="2400" />
                </FormItem>
              )}
            />
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
          </div>
        </Card>

        <Card className="border border-slate-100 bg-gradient-to-br from-white via-slate-50 to-white p-5 text-slate-900 shadow-xl">
          <p className="mb-3 text-sm font-semibold text-slate-800">Configuration</p>
          <div className="grid gap-3 sm:grid-cols-2">
            {resCom === "RESIDENTIAL" && listingType !== "PG" && (
              <>
                <FormField
                  control={form.control}
                  name="details.bedrooms"
                  rules={{ required: "Bedrooms required" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bedrooms</FormLabel>
                      <NumberInput field={field} placeholder="2" />
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="details.bathrooms"
                  rules={{ required: "Bathrooms required" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bathrooms</FormLabel>
                      <NumberInput field={field} placeholder="2" />
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="details.balconies"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Balconies</FormLabel>
                      <NumberInput field={field} placeholder="1" />
                    </FormItem>
                  )}
                />
              </>
            )}

            {listingType === "PG" && (
              <>
                <FormField
                  control={form.control}
                  name="details.roomType"
                  rules={{ required: "Select room type" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Room type</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value ?? ""}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Private / Shared / Bed" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="PRIVATE_ROOM">Private Room</SelectItem>
                          <SelectItem value="SHARED_ROOM">Shared Room</SelectItem>
                          <SelectItem value="BED">Bed / Dorm</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="details.availableBeds"
                  rules={{ required: "Beds available required" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Available beds</FormLabel>
                      <NumberInput field={field} placeholder="4" />
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            {resCom === "COMMERCIAL" && (
              <>
                <FormField
                  control={form.control}
                  name="details.washrooms"
                  rules={{ required: "Washroom count required" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Washrooms</FormLabel>
                      <NumberInput field={field} placeholder="2" />
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="details.totalRooms"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cabins / Rooms</FormLabel>
                      <NumberInput field={field} placeholder="3" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="details.multiFloorNum"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Floors offered (if multi-floor)</FormLabel>
                      <NumberInput field={field} placeholder="2" />
                    </FormItem>
                  )}
                />
              </>
            )}

            <FormField
              control={form.control}
              name="details.totalFloors"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Total floors in building</FormLabel>
                  <NumberInput field={field} placeholder="5" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="details.floorNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Floor number</FormLabel>
                  <Input value={field.value ?? ""} onChange={(e) => field.onChange(e.target.value)} placeholder="FLOOR_2" />
                </FormItem>
              )}
            />
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <FormField
              control={form.control}
              name="details.lift"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center gap-2 space-y-0 rounded-2xl border border-slate-200 bg-white p-3">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <FormLabel className="text-sm text-slate-800">Lift available</FormLabel>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="details.propertyFacing"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Facing</FormLabel>
                  <Input value={field.value ?? ""} onChange={(e) => field.onChange(e.target.value)} placeholder="East / West" className="bg-white/10 text-white" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="details.ageOfProperty"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Age of property</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value ?? ""}>
                    <FormControl>
                      <SelectTrigger className="bg-white/10 text-white">
                        <SelectValue placeholder="Select age" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="text-slate-900">
                      <SelectItem value="NEW">New</SelectItem>
                      <SelectItem value="ONE_TO_FIVE">1 - 5 years</SelectItem>
                      <SelectItem value="FIVE_TO_TEN">5 - 10 years</SelectItem>
                      <SelectItem value="ABOVE_TEN">10+ years</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
          </div>
        </Card>
      </div>
    </div>
  );
}
