import React from "react";
import { Building2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { cityOptions, localityOptions, projectOptions } from "@/features/propertyListing";
import { FieldShell, NumberInput } from "./StepCommon";
import type { StepProps } from "./StepCommon";

export function LocationProjectStep({ form }: StepProps) {
  const cityId = form.watch("location.cityId");
  const currentLocalities = localityOptions[cityId] ?? [];
  const filteredProjects = projectOptions.filter((p) => p.cityId === cityId);
  const propertySubType = form.watch("context.propertySubTypeId");
  const showMall = propertySubType === "retail" || propertySubType === "hospitality";

  return (
    <div className="space-y-6">
      <div className="grid gap-5 lg:grid-cols-2">
        <Card className="border-0 bg-white/80 p-5 shadow-xl">
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="location.cityId"
              rules={{ required: "Choose a city" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>City *</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                      form.setValue("location.localityId", "");
                      form.setValue("location.projectId", "");
                    }}
                    value={field.value ?? ""}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select city" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {cityOptions.map((city) => (
                        <SelectItem key={city.id} value={city.id}>
                          {city.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="location.localityId"
              rules={{ required: "Choose a locality" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Locality *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value ?? ""} disabled={!cityId}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select locality" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {currentLocalities.map((loc) => (
                        <SelectItem key={loc.id} value={loc.id}>
                          {loc.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="location.subLocality"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sub Locality</FormLabel>
                  <Input value={field.value ?? ""} onChange={(e) => field.onChange(e.target.value)} placeholder="Sector, pocket, block" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="location.address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <Input value={field.value ?? ""} onChange={(e) => field.onChange(e.target.value)} placeholder="Street / landmark" />
                </FormItem>
              )}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <FormField
              control={form.control}
              name="location.houseNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>House / Flat no.</FormLabel>
                  <Input value={field.value ?? ""} onChange={(e) => field.onChange(e.target.value)} placeholder="203" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="location.plotNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Plot no.</FormLabel>
                  <Input value={field.value ?? ""} onChange={(e) => field.onChange(e.target.value)} placeholder="Plot 21" />
                </FormItem>
              )}
            />
            {showMall && (
              <FormField
                control={form.control}
                name="location.mall"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mall / Retail hub</FormLabel>
                    <Input value={field.value ?? ""} onChange={(e) => field.onChange(e.target.value)} placeholder="Phoenix Mall" />
                  </FormItem>
                )}
              />
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="location.latitude"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Latitude</FormLabel>
                  <NumberInput field={field} placeholder="12.97" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="location.longitude"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Longitude</FormLabel>
                  <NumberInput field={field} placeholder="77.59" />
                </FormItem>
              )}
            />
          </div>
        </Card>

        <Card className="border border-slate-100 bg-gradient-to-br from-white via-slate-50 to-white p-5 text-slate-900 shadow-xl">
          <FieldShell title="Projects & societies" description="Map to a known project or add your own society label" icon={Building2} />
          <FormField
            control={form.control}
            name="location.projectId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Project (from master)</FormLabel>
                <Select onValueChange={field.onChange} value={field.value ?? ""} disabled={!cityId}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select project" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {filteredProjects.map((proj) => (
                      <SelectItem key={proj.id} value={proj.id}>
                        {proj.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />

          <Separator className="my-4 border-slate-200" />

          <FormField
            control={form.control}
            name="location.societyOrProjectName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Society / Project name (free text)</FormLabel>
                <Input
                  className="bg-white text-slate-900 placeholder:text-slate-400"
                  value={field.value ?? ""}
                  onChange={(e) => field.onChange(e.target.value)}
                  placeholder="Green View Residency"
                />
                <FormDescription className="text-xs text-slate-500">
                  Required if no project is selected from master.
                </FormDescription>
              </FormItem>
            )}
          />

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <p className="text-sm text-slate-600">Locality integrity</p>
              <p className="text-lg font-semibold text-slate-900">
                {cityId ? `${currentLocalities.length} areas found` : "Select city"}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <p className="text-sm text-slate-600">Project match</p>
              <p className="text-lg font-semibold text-slate-900">
                {filteredProjects.length ? `${filteredProjects.length} matches` : "Add society name"}
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
