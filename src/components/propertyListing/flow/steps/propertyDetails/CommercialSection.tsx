import React from "react";
import { Card } from "@/components/ui/card";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/components/ui/utils";
import { NumberInput } from "../StepCommon";
import type { StepProps } from "../StepCommon";
import { locatedNearOptions, shopBusinessTypes } from "./constants";
import { StepperInput } from "./StepperInput";
import type { PropertyDetailsVisibility } from "./visibility";

type CommercialSectionProps = StepProps & {
  visibility: PropertyDetailsVisibility["commercial"];
};

const washroomOptions = [
  { value: "NONE", label: "None" },
  { value: "SHARED", label: "Shared" },
  { value: "1", label: "1" },
  { value: "2", label: "2" },
  { value: "3", label: "3" },
  { value: "4", label: "4" },
  { value: "MORE_THAN_3", label: "More than 3" },
  { value: "OTHER", label: "Add other" },
];

const measurementUnitOptions = [
  { value: "FEET", label: "Feet" },
  { value: "METER", label: "Meter" },
];

export const CommercialSection: React.FC<CommercialSectionProps> = ({ form, visibility }) => {
  if (!visibility.showSection) return null;

  const washroomSelection = (() => {
    const type = form.watch("details.washroomType");
    const count = form.watch("details.washrooms");
    if (type === "SHARED" || type === "NONE" || type === "MORE_THAN_3" || type === "OTHER") return type;
    if (typeof count === "number") {
      if (count === 0) return "NONE";
      if (count >= 1 && count <= 4) return String(count);
      if (count > 4) return "MORE_THAN_3";
    }
    return "";
  })();

  const toggleArrayValue = (path: "details.suitableForBussinessType" | "details.locatedNear", value: string) => {
    const current = form.getValues(path) ?? [];
    const next = current.includes(value) ? current.filter((item: string) => item !== value) : [...current, value];
    form.setValue(path, next);
  };

  const setWashroomOption = (value: string) => {
    switch (value) {
      case "NONE":
        form.setValue("details.washroomType", "NONE");
        form.setValue("details.washrooms", 0);
        break;
      case "SHARED":
        form.setValue("details.washroomType", "SHARED");
        form.setValue("details.washrooms", null);
        break;
      case "MORE_THAN_3":
        form.setValue("details.washroomType", "MORE_THAN_3");
        form.setValue("details.washrooms", 5);
        break;
      case "OTHER":
        form.setValue("details.washroomType", "OTHER");
        form.setValue("details.washrooms", null);
        break;
      default: {
        const numeric = Number(value);
        form.setValue("details.washroomType", "");
        form.setValue("details.washrooms", Number.isNaN(numeric) ? null : numeric);
        break;
      }
    }
  };

  const renderBusinessTypeChips = (values: string[], path: "details.suitableForBussinessType" | "details.locatedNear", options: string[]) => (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        const active = values.includes(option);
        return (
          <button
            type="button"
            key={option}
            onClick={() => toggleArrayValue(path, option)}
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
  );

  const shopBusinessSelected = form.watch("details.suitableForBussinessType") ?? [];
  const locatedNear = form.watch("details.locatedNear") ?? [];

  return (
    <Card className="border border-slate-100 bg-white p-5 shadow-xl">
      <p className="mb-3 text-sm font-semibold text-slate-800">Commercial specifics</p>
      <div className="space-y-5">
        {visibility.showOfficeFields && (
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase text-slate-500">Office setup</p>
            <div className="grid gap-3 sm:grid-cols-2">
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

              {visibility.showOfficeSeats && (
                <FormField
                  control={form.control}
                  name="details.minNoOfSeats"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Min. no. of seats</FormLabel>
                      <StepperInput field={field} min={0} max={999} />
                    </FormItem>
                  )}
                />
              )}

              {visibility.showOfficeSeats && (
                <FormField
                  control={form.control}
                  name="details.maxNoOfSeats"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Max. seats (optional)</FormLabel>
                      <StepperInput field={field} min={0} max={999} />
                    </FormItem>
                  )}
                />
              )}

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
                      <FormLabel>No. of cabins</FormLabel>
                      <StepperInput field={field} min={0} max={99} />
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

              {visibility.showOfficeWashroomAvailability && (
                <FormField
                  control={form.control}
                  name="details.washRoomAvailable"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Washroom availability</FormLabel>
                      <Select onValueChange={(val) => field.onChange(val === "true")} value={field.value ? "true" : "false"}>
                        <SelectTrigger>
                          <SelectValue placeholder="Available / Not available" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="true">Available</SelectItem>
                          <SelectItem value="false">Not available</SelectItem>
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

              {visibility.showOfficeReception && (
                <FormField
                  control={form.control}
                  name="amenities.receptionArea"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-2xl border border-slate-200 bg-white px-3 py-2">
                      <FormLabel className="text-sm text-slate-800">Reception area</FormLabel>
                      <FormControl>
                        <Switch checked={!!field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              )}

              {visibility.showPantry && (
                <FormField
                  control={form.control}
                  name="amenities.pantryType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pantry type</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value ?? ""}>
                        <SelectTrigger>
                          <SelectValue placeholder="Private / Shared / None" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PRIVATE">Private</SelectItem>
                          <SelectItem value="SHARED">Shared</SelectItem>
                          <SelectItem value="NONE">Not available</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
              )}

              {visibility.showOfficeFacilities && (
                <FormField
                  control={form.control}
                  name="amenities.furnishing"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Furnishing</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value ?? ""}>
                        <SelectTrigger>
                          <SelectValue placeholder="Furnished / Semi / Un-furnished" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="FULLY_FURNISHED">Furnished</SelectItem>
                          <SelectItem value="SEMI_FURNISHED">Semi-furnished</SelectItem>
                          <SelectItem value="UNFURNISHED">Un-furnished</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
              )}

              {visibility.showOfficeFacilities && (
                <FormField
                  control={form.control}
                  name="amenities.centralAirConditioning"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-2xl border border-slate-200 bg-white px-3 py-2">
                      <FormLabel className="text-sm text-slate-800">Central Air Conditioning</FormLabel>
                      <FormControl>
                        <Switch checked={!!field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              )}

              {visibility.showOfficeFacilities && (
                <FormField
                  control={form.control}
                  name="amenities.oxygenDuct"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-2xl border border-slate-200 bg-white px-3 py-2">
                      <FormLabel className="text-sm text-slate-800">Oxygen Duct</FormLabel>
                      <FormControl>
                        <Switch checked={!!field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              )}

              {visibility.showOfficeFacilities && (
                <FormField
                  control={form.control}
                  name="amenities.ups"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-2xl border border-slate-200 bg-white px-3 py-2">
                      <FormLabel className="text-sm text-slate-800">UPS</FormLabel>
                      <FormControl>
                        <Switch checked={!!field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              )}
            </div>
          </div>
        )}

        {visibility.showRetailFields && (
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase text-slate-500">Retail / shop details</p>
            <div className="grid gap-3 sm:grid-cols-2">
              {visibility.showShopFacade && (
                <FormField
                  control={form.control}
                  name="details.shopFacadeSize"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Shop facade size</FormLabel>
                      <NumberInput field={field} placeholder="12" />
                    </FormItem>
                  )}
                />
              )}

              {visibility.showShopFacade && (
                <FormField
                  control={form.control}
                  name="details.shopFacadeSizeUnit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Facade unit</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value ?? ""}>
                        <SelectTrigger>
                          <SelectValue placeholder="Feet / Meter" />
                        </SelectTrigger>
                        <SelectContent>
                          {measurementUnitOptions.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
              )}

              {visibility.showRetailEntranceWidth && (
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
              )}

              {visibility.showRetailEntranceWidth && (
                <FormField
                  control={form.control}
                  name="details.entranceWidthUnit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Entrance width unit</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value ?? ""}>
                        <SelectTrigger>
                          <SelectValue placeholder="Feet / Meter" />
                        </SelectTrigger>
                        <SelectContent>
                          {measurementUnitOptions.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
              )}

              {(visibility.showRetailCeilingHeight || visibility.showCeilingHeight) && (
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

              {(visibility.showRetailCeilingHeight || visibility.showCeilingHeight) && (
                <FormField
                  control={form.control}
                  name="details.ceilingHeightUnit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ceiling height unit</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value ?? ""}>
                        <SelectTrigger>
                          <SelectValue placeholder="Feet / Meter" />
                        </SelectTrigger>
                        <SelectContent>
                          {measurementUnitOptions.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
              )}

              {visibility.showRetailWashroomType && (
                <FormField
                  control={form.control}
                  name="details.washroomType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Washrooms</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value ?? ""}>
                        <SelectTrigger>
                          <SelectValue placeholder="Private / Public" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PRIVATE">Private</SelectItem>
                          <SelectItem value="PUBLIC">Public</SelectItem>
                          <SelectItem value="NONE">Not available</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
              )}

              {visibility.showRetailLocatedNear && (
                <FormField
                  control={form.control}
                  name="details.locatedNear"
                  render={() => (
                    <FormItem>
                      <FormLabel>Located near (optional)</FormLabel>
                      {renderBusinessTypeChips(locatedNear, "details.locatedNear", locatedNearOptions)}
                    </FormItem>
                  )}
                />
              )}

              {visibility.showRetailBusinessType && (
                <FormField
                  control={form.control}
                  name="details.suitableForBussinessType"
                  render={() => (
                    <FormItem>
                      <FormLabel>Business type</FormLabel>
                      {renderBusinessTypeChips(shopBusinessSelected, "details.suitableForBussinessType", shopBusinessTypes)}
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>
          </div>
        )}

        {visibility.showWarehouseFields && (
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase text-slate-500">Warehouse room details</p>
            <div className="grid gap-3 sm:grid-cols-2">
              {visibility.showWarehouseWashrooms && (
                <FormField
                  control={form.control}
                  name="details.washrooms"
                  render={() => (
                    <FormItem>
                      <FormLabel>No. of washrooms</FormLabel>
                      <Select onValueChange={setWashroomOption} value={washroomSelection}>
                        <SelectTrigger>
                          <SelectValue placeholder="None / Shared / Count" />
                        </SelectTrigger>
                        <SelectContent>
                          {washroomOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
              )}
              {washroomSelection === "OTHER" && (
                <FormField
                  control={form.control}
                  name="details.washrooms"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Custom washrooms</FormLabel>
                      <NumberInput field={field} placeholder="5" />
                    </FormItem>
                  )}
                />
              )}
            </div>
          </div>
        )}

        {(visibility.showTotalRooms || visibility.showHospitalityQualityRating) && (
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase text-slate-500">Hospitality</p>
            <div className="grid gap-3 sm:grid-cols-2">
              {visibility.showTotalRooms && (
                <FormField
                  control={form.control}
                  name="details.totalRooms"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Total no. of rooms</FormLabel>
                      <StepperInput field={field} min={0} max={500} />
                    </FormItem>
                  )}
                />
              )}
              {visibility.showHospitalityQualityRating && (
                <FormField
                  control={form.control}
                  name="details.qualityRating"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quality rating</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value ?? ""}>
                        <SelectTrigger>
                          <SelectValue placeholder="No rating / 1-7 star" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="NO_RATING">No rating</SelectItem>
                          {["1", "2", "3", "4", "5", "6", "7"].map((star) => (
                            <SelectItem key={star} value={`${star}_STAR`}>
                              {star} Star
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
              )}
            </div>
          </div>
        )}

        {visibility.showCeilingHeight && !visibility.showRetailFields && (
          <div className="grid gap-3 sm:grid-cols-2">
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
          </div>
        )}
      </div>
    </Card>
  );
};
