import React from "react";
import { Card } from "@/components/ui/card";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { NumberInput } from "../StepCommon";
import type { StepProps } from "../StepCommon";
import { areaUnitOptions } from "./constants";

type AreaSectionProps = StepProps & {
  showBuiltUp: boolean;
  showCarpet: boolean;
  carpetAreaRequired: boolean;
  carpetUnitRequired: boolean;
  showPlotArea: boolean;
  showPlotLength: boolean;
  showPlotBreadth: boolean;
  showSuperBuiltUp: boolean;
  showAreaUnit: boolean;
  plotAreaRequired: boolean;
  plotUnitRequired: boolean;
};

export const AreaSection: React.FC<AreaSectionProps> = ({
  form,
  showBuiltUp,
  showCarpet,
  carpetAreaRequired,
  carpetUnitRequired,
  showPlotArea,
  showPlotLength,
  showPlotBreadth,
  showSuperBuiltUp,
  showAreaUnit,
  plotAreaRequired,
  plotUnitRequired,
}) => (
  <Card className="border border-slate-100 bg-white p-5 shadow-xl">
    <p className="mb-3 text-sm font-semibold text-slate-700">Size & area details</p>
    <div className="grid gap-4 sm:grid-cols-2">
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
            rules={carpetAreaRequired ? { required: "Enter carpet area" } : undefined}
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
            rules={carpetUnitRequired ? { required: "Select area unit" } : undefined}
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
          {showPlotLength && (
            <FormField
              control={form.control}
              name="details.plotLength"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Plot length</FormLabel>
                  <NumberInput field={field} placeholder="60" />
                </FormItem>
              )}
            />
          )}
          {showPlotBreadth && (
            <FormField
              control={form.control}
              name="details.plotBreadth"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Plot breadth</FormLabel>
                  <NumberInput field={field} placeholder="40" />
                </FormItem>
              )}
            />
          )}
          <FormField
            control={form.control}
            name="details.plotArea"
            rules={plotAreaRequired ? { required: "Enter plot area" } : undefined}
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
            rules={plotUnitRequired ? { required: "Select area unit" } : undefined}
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
      {showAreaUnit && (
        <FormField
          control={form.control}
          name="details.areaUnit"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Area unit (default)</FormLabel>
              <Select onValueChange={field.onChange} value={field.value ?? ""}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Sq.ft / Sq.yd / Acre / Sq.m" />
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
      )}
    </div>
  </Card>
);
