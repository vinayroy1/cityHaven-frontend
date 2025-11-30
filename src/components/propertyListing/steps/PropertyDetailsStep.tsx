import React, { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/components/ui/utils";
import { propertyTypeCatalog } from "@/features/propertyListing";
import { Button } from "@/components/ui/button";
import { NumberInput } from "./StepCommon";
import type { StepProps } from "./StepCommon";
import { MediaSelector } from "../MediaSelector";

const areaUnitOptions = [
  { value: "SQ_FT", label: "Sq.ft" },
  { value: "SQ_YD", label: "Sq.yd" },
  { value: "SQ_M", label: "Sq.m" },
  { value: "ACRE", label: "Acre" },
];

const facingOptions = ["EAST", "WEST", "NORTH", "SOUTH", "NORTH_EAST", "NORTH_WEST", "SOUTH_EAST", "SOUTH_WEST"];

const furnishingItems = [
  { key: "wardrobe", label: "Wardrobe", modes: ["SEMI_FURNISHED", "FULLY_FURNISHED"] },
  { key: "bed", label: "Bed", modes: ["SEMI_FURNISHED", "FULLY_FURNISHED"] },
  { key: "sofa", label: "Sofa", modes: ["FULLY_FURNISHED"] },
  { key: "diningTable", label: "Dining Table", modes: ["FULLY_FURNISHED"] },
  { key: "tv", label: "TV", modes: ["FULLY_FURNISHED"] },
  { key: "refrigerator", label: "Refrigerator", modes: ["SEMI_FURNISHED", "FULLY_FURNISHED"] },
  { key: "washingMachine", label: "Washing Machine", modes: ["FULLY_FURNISHED"] },
  { key: "geyser", label: "Geyser", modes: ["SEMI_FURNISHED", "FULLY_FURNISHED"] },
  { key: "modularKitchen", label: "Modular Kitchen", modes: ["SEMI_FURNISHED", "FULLY_FURNISHED"] },
  { key: "chimney", label: "Chimney", modes: ["SEMI_FURNISHED", "FULLY_FURNISHED"] },
  { key: "curtains", label: "Curtains", modes: ["FULLY_FURNISHED"] },
  { key: "exhaustFan", label: "Exhaust Fan", modes: ["SEMI_FURNISHED", "FULLY_FURNISHED"] },
  { key: "lights", label: "Lights", modes: ["SEMI_FURNISHED", "FULLY_FURNISHED"] },
  { key: "fans", label: "Fans", modes: ["SEMI_FURNISHED", "FULLY_FURNISHED"] },
  { key: "ac", label: "AC", modes: ["SEMI_FURNISHED", "FULLY_FURNISHED"] },
];

const fireSafetyOptions = ["Sprinklers", "Smoke Detectors", "Fire Alarm", "Extinguishers"];
const businessUseOptions = ["IT", "Retail", "Clinic", "Warehouse", "Cafe", "Other"];

const StepperInput = ({
  field,
  min = 0,
  max = 20,
  disabled,
}: {
  field: { value: number | null | undefined; onChange: (value: number) => void };
  min?: number;
  max?: number;
  disabled?: boolean;
}) => {
  const value = typeof field.value === "number" ? field.value : 0;
  return (
    <div className="flex items-center gap-2">
      <Button type="button" variant="outline" size="icon" onClick={() => field.onChange(Math.max(min, value - 1))} disabled={disabled || value <= min}>
        -
      </Button>
      <Input
        type="number"
        min={min}
        max={max}
        value={value}
        onChange={(e) => {
          const next = e.target.value === "" ? min : Number(e.target.value);
          field.onChange(Number.isNaN(next) ? min : Math.min(Math.max(min, next), max));
        }}
        className="w-20 text-center"
        disabled={disabled}
      />
      <Button type="button" variant="outline" size="icon" onClick={() => field.onChange(Math.min(max, value + 1))} disabled={disabled || value >= max}>
        +
      </Button>
    </div>
  );
};

export function PropertyDetailsStep({ form }: StepProps) {
  const listingType = form.watch("context.listingType");
  const resCom = form.watch("context.resCom");
  const propertyTypeId = `${form.watch("context.propertyTypeId") ?? ""}`;
  const propertySubTypeId = `${form.watch("context.propertySubTypeId") ?? ""}`;
  const locatedInsideId = form.watch("context.locatedInsideId");
  const furnishingMode = form.watch("amenities.furnishing") ?? "UNFURNISHED";
  const constructionStatus = form.watch("location.constructionStatus");

  const propertyType = useMemo(() => propertyTypeCatalog.find((p) => p.id === propertyTypeId), [propertyTypeId]);
  const propertySubType = useMemo(
    () => propertyType?.subTypes.find((s) => s.id === propertySubTypeId),
    [propertyType, propertySubTypeId],
  );

  const isResidential = resCom === "RESIDENTIAL";
  const isCommercial = resCom === "COMMERCIAL";
  const isPG = listingType === "PG";
  const isPlot = Boolean(propertySubType?.slug?.includes("plot-land"));
  const isApartment = propertySubType?.slug === "apartment";
  const isOffice = propertySubType?.slug === "office";

  const showBuiltUp = (isResidential || isCommercial) && !isPG;
  const showCarpet = (isResidential || isCommercial) && !isPG;
  const showPlotArea = isPlot;
  const showSuperBuiltUp = isResidential && !isPG && !isPlot;
  const showSocietyDetails = Boolean(locatedInsideId || form.watch("location.projectId") || form.watch("location.societyOrProjectName"));
  const showPossessionDate = constructionStatus === "UNDER_CONSTRUCTION";

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

  return (
    <div className="space-y-6">
      <Card className="border border-slate-100 bg-white p-5 shadow-xl">
        <p className="mb-3 text-sm font-semibold text-slate-800">Property title & description</p>
        <FormField
          control={form.control}
          name="meta.title"
          rules={{ required: "Title required" }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Property title</FormLabel>
              <Input value={field.value ?? ""} onChange={(e) => field.onChange(e.target.value)} placeholder="2 BHK Apartment in HSR Layout" />
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="meta.description"
          render={({ field }) => (
            <FormItem className="mt-3">
              <FormLabel>Property description</FormLabel>
              <Textarea
                value={field.value ?? ""}
                onChange={(e) => field.onChange(e.target.value)}
                placeholder="Highlight layout, light, connectivity, upgrades, and society highlights."
                rows={3}
              />
            </FormItem>
          )}
        />
      </Card>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card className="border-0 bg-white/85 p-5 shadow-xl">
          <p className="mb-3 text-sm font-semibold text-slate-700">Size & area details</p>
          <div className="grid gap-3 sm:grid-cols-2">
            {showBuiltUp && (
              <>
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
                  name="details.builtUpAreaUnit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Built-up area unit</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value ?? ""}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Unit" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {areaUnitOptions.map((unit) => (
                            <SelectItem key={unit.value} value={unit.value}>
                              {unit.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
              </>
            )}
            {showCarpet && (
              <>
                <FormField
                  control={form.control}
                  name="details.carpetArea"
                  rules={showCarpet ? { required: "Enter carpet area" } : undefined}
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
                      <FormLabel>Carpet area unit</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value ?? ""}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Unit" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {areaUnitOptions.map((unit) => (
                            <SelectItem key={unit.value} value={unit.value}>
                              {unit.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
              </>
            )}
            {showPlotArea && (
              <>
                <FormField
                  control={form.control}
                  name="details.plotArea"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Plot area</FormLabel>
                      <NumberInput field={field} placeholder="2400" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="details.plotAreaUnit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Plot area unit</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value ?? ""}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Unit" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {areaUnitOptions.map((unit) => (
                            <SelectItem key={unit.value} value={unit.value}>
                              {unit.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
              </>
            )}
            {showSuperBuiltUp && (
              <>
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
                <FormField
                  control={form.control}
                  name="details.superBuiltUpAreaUnit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Super built-up unit</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value ?? ""}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Unit" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {areaUnitOptions.map((unit) => (
                            <SelectItem key={unit.value} value={unit.value}>
                              {unit.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
              </>
            )}
          </div>
        </Card>

        <Card className="border border-slate-100 bg-gradient-to-br from-white via-slate-50 to-white p-5 text-slate-900 shadow-xl">
          <p className="mb-3 text-sm font-semibold text-slate-800">Rooms & layout</p>
          <div className="grid gap-3 sm:grid-cols-2">
            {(isResidential || isPG) && (
              <>
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
              </>
            )}
            {isResidential && !isPG && (
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
            {isResidential && !isPG && (
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
            {(isResidential || isCommercial) && (
              <>
                <FormField
                  control={form.control}
                  name="details.floorNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Floor number</FormLabel>
                      <NumberInput field={{ value: field.value ? Number(field.value) : null, onChange: (val) => field.onChange(val) }} placeholder="2" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="details.totalFloors"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Total floors</FormLabel>
                      <NumberInput field={field} placeholder="5" />
                    </FormItem>
                  )}
                />
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
              </>
            )}
            {(isResidential || isCommercial) && (
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
                {form.watch("details.multiFloorSelect") && (
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
            {(isResidential || isCommercial) && (
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
              </>
            )}
            {(isResidential || isCommercial) && (
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
                <FormField
                  control={form.control}
                  name="details.ceilingHeight"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ceiling height</FormLabel>
                      <NumberInput field={field} placeholder="10" />
                    </FormItem>
                  )}
                />
              </>
            )}
            {(isResidential || isCommercial) && (
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
            {(isResidential || isCommercial) && (
              <>
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
                          {facingOptions.map((option) => (
                            <SelectItem key={option} value={option}>
                              {option.replace("_", " ")}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
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
      </div>

      <Card className="border border-slate-100 bg-white p-5 shadow-xl">
        <p className="mb-3 text-sm font-semibold text-slate-800">Furnishing & interior</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="amenities.furnishing"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Furnishing status</FormLabel>
                <Select onValueChange={field.onChange} value={field.value ?? ""}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Unfurnished / Semi / Full" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="UNFURNISHED">Unfurnished</SelectItem>
                    <SelectItem value="SEMI_FURNISHED">Semi-furnished</SelectItem>
                    <SelectItem value="FULLY_FURNISHED">Fully furnished</SelectItem>
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="amenities.furnishingDetails"
            render={() => (
              <FormItem>
                <FormLabel className="text-sm text-slate-700">Furnishing items</FormLabel>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {furnishingItems.map((item) => {
                    const isAllowed = item.modes.includes(furnishingMode);
                    return (
                      <FormField
                        key={item.key}
                        control={form.control}
                        name={`amenities.furnishingDetails.${item.key}` as const}
                        render={({ field }) => (
                          <FormItem className={cn("flex flex-col gap-2 rounded-2xl border p-3", isAllowed ? "border-slate-200" : "border-dashed border-slate-200/70")}>
                            <div className="flex items-center justify-between">
                              <FormLabel className="text-sm text-slate-800">{item.label}</FormLabel>
                              {!isAllowed && <span className="text-xs text-slate-400">Only for Semi/Full</span>}
                            </div>
                            <StepperInput field={field} min={0} max={10} disabled={!isAllowed || furnishingMode === "UNFURNISHED"} />
                          </FormItem>
                        )}
                      />
                    );
                  })}
                </div>
              </FormItem>
            )}
          />
        </div>
      </Card>

      <div className="grid gap-5 lg:grid-cols-2">
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

        {isPG && (
          <Card className="border border-slate-100 bg-white p-5 shadow-xl">
            <p className="mb-3 text-sm font-semibold text-slate-800">PG specific</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="details.pgFor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Allowed for</FormLabel>
                    <RadioGroup className="flex flex-wrap gap-3" value={field.value ?? ""} onValueChange={field.onChange}>
                      {["BOYS", "GIRLS", "UNISEX"].map((option) => (
                        <label
                          key={option}
                          className={cn(
                            "flex items-center gap-2 rounded-2xl border px-3 py-2 text-sm",
                            field.value === option ? "border-sky-500 bg-sky-50 text-sky-700" : "border-slate-200 text-slate-700",
                          )}
                        >
                          <RadioGroupItem value={option} />
                          {option}
                        </label>
                      ))}
                    </RadioGroup>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="details.foodIncluded"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-2xl border border-slate-200 bg-white px-3 py-2">
                    <FormLabel className="text-sm text-slate-800">Food included</FormLabel>
                    <FormControl>
                      <Switch checked={!!field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
              {form.watch("details.foodIncluded") && (
                <FormField
                  control={form.control}
                  name="details.mealType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Meal type</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value ?? ""}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Breakfast / Dinner / Both" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="BREAKFAST">Breakfast</SelectItem>
                          <SelectItem value="DINNER">Dinner</SelectItem>
                          <SelectItem value="BOTH">Both</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
              )}
              <FormField
                control={form.control}
                name="details.sharingType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sharing type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value ?? ""}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="1 / 2 / 3 / 4 sharing" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="SINGLE">1 Sharing</SelectItem>
                        <SelectItem value="DOUBLE">2 Sharing</SelectItem>
                        <SelectItem value="TRIPLE">3 Sharing</SelectItem>
                        <SelectItem value="QUAD">4 Sharing</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="details.securityDeposit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Security deposit</FormLabel>
                    <NumberInput field={field} placeholder="10000" />
                  </FormItem>
                )}
              />
            </div>
          </Card>
        )}

        {isCommercial && (
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
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Private / Co-working" />
                            </SelectTrigger>
                          </FormControl>
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
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Private / Shared / None" />
                        </SelectTrigger>
                      </FormControl>
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
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Dry / Wet / Canteen" />
                        </SelectTrigger>
                      </FormControl>
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
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="IT / Retail / Clinic / Warehouse" />
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
          </Card>
        )}
      </div>

      {showSocietyDetails && (
        <Card className="border border-slate-100 bg-white p-5 shadow-xl">
          <p className="mb-3 text-sm font-semibold text-slate-800">Society / project details</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="location.societyOrProjectName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project / Society name</FormLabel>
                  <Input value={field.value ?? ""} onChange={(e) => field.onChange(e.target.value)} placeholder="Green View Residency" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="location.totalTowers"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Total towers</FormLabel>
                  <NumberInput field={field} placeholder="8" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="location.totalUnits"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Total units</FormLabel>
                  <NumberInput field={field} placeholder="120" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="location.constructionStatus"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Construction status</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value ?? ""}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Ready / Under construction" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="READY_TO_MOVE">Ready to move</SelectItem>
                      <SelectItem value="UNDER_CONSTRUCTION">Under construction</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
            {showPossessionDate && (
              <FormField
                control={form.control}
                name="location.possessionDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Possession date</FormLabel>
                    <Input type="date" value={field.value ?? ""} onChange={(e) => field.onChange(e.target.value)} />
                  </FormItem>
                )}
              />
            )}
          </div>
        </Card>
      )}

      <Card className="border border-slate-100 bg-white p-5 shadow-xl">
        <p className="mb-3 text-sm font-semibold text-slate-800">Photos & videos</p>
        <MediaSelector form={form} />
      </Card>
    </div>
  );
}
