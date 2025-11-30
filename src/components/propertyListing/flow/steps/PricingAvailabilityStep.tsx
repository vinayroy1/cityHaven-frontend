import React from "react";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { NumberInput } from "./StepCommon";
import type { StepProps } from "./StepCommon";

export function PricingAvailabilityStep({ form }: StepProps) {
  const listingType = form.watch("context.listingType");
  return (
    <div className="space-y-6">
      <div className="grid gap-5 lg:grid-cols-2">
        <Card className="border-0 bg-white p-5 shadow-xl">
          <p className="mb-3 text-sm font-semibold text-slate-700">Pricing & Financials</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="pricing.price"
              rules={{ required: "Price required" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{listingType === "SELL" ? "Total price" : listingType === "PG" ? "Price per bed/room" : "Monthly rent"}</FormLabel>
                  <NumberInput field={field} placeholder="35000" />
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="pricing.priceType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price type</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value ?? ""}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Monthly / Total / Per bed" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="MONTHLY">Monthly</SelectItem>
                      <SelectItem value="TOTAL">Total</SelectItem>
                      <SelectItem value="PER_BED">Per bed</SelectItem>
                      <SelectItem value="PER_ROOM">Per room</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <FormField
              control={form.control}
              name="pricing.deposit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Deposit</FormLabel>
                  <NumberInput field={field} placeholder="100000" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="pricing.maintenance"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Maintenance</FormLabel>
                  <NumberInput field={field} placeholder="2000" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="pricing.maintenancePaymentPeriod"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Maintenance frequency</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value ?? ""}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Monthly / Quarterly" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="MONTHLY">Monthly</SelectItem>
                      <SelectItem value="QUARTERLY">Quarterly</SelectItem>
                      <SelectItem value="YEARLY">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <FormField
              control={form.control}
              name="pricing.priceNegotiable"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center gap-2 space-y-0 rounded-2xl border border-slate-200 p-3">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <FormLabel className="text-sm text-slate-800">Price negotiable</FormLabel>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="pricing.brokerage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Brokerage</FormLabel>
                  <NumberInput field={field} placeholder="0" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="pricing.brokerageType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Brokerage type</FormLabel>
                  <Input value={field.value ?? ""} onChange={(e) => field.onChange(e.target.value)} placeholder="Percentage / Fixed" />
                </FormItem>
              )}
            />
          </div>
        </Card>

        <Card className="border border-slate-100 bg-gradient-to-br from-white via-slate-50 to-white p-5 text-slate-900 shadow-xl">
          <p className="mb-3 text-sm font-semibold text-slate-800">Availability & possession</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="availability.availabilityStatus"
              rules={{ required: "Availability required" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Availability</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value ?? ""}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Ready, UC, soon" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="READY_TO_MOVE">Ready to move</SelectItem>
                      <SelectItem value="UNDER_CONSTRUCTION">Under construction</SelectItem>
                      <SelectItem value="POSSESSION_SOON">Possession soon</SelectItem>
                      <SelectItem value="NEW_LAUNCH">New launch</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="availability.availableFrom"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Available from</FormLabel>
                  <Input type="date" value={field.value ?? ""} onChange={(e) => field.onChange(e.target.value)} />
                </FormItem>
              )}
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="availability.possessionStatus"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Possession status</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value ?? ""}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Ready / UC / Launch" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="READY_TO_MOVE">Ready to move</SelectItem>
                      <SelectItem value="UNDER_CONSTRUCTION">Under construction</SelectItem>
                      <SelectItem value="LAUNCH">Launch</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="availability.constructionDone"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center gap-2 space-y-0 rounded-2xl border border-slate-200 bg-white p-3">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <FormLabel className="text-sm text-slate-800">Construction complete</FormLabel>
                </FormItem>
              )}
            />
          </div>

          <Separator className="my-4 border-slate-200" />
          <FormField
            control={form.control}
            name="availability.possessionBy"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Possession timeline</FormLabel>
                <Input
                  className="bg-white text-slate-900"
                  value={field.value ?? ""}
                  onChange={(e) => field.onChange(e.target.value)}
                  placeholder="Within 3 months / 2025-Q2"
                />
              </FormItem>
            )}
          />
        </Card>
      </div>
    </div>
  );
}
