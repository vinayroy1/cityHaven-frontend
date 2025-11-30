import React from "react";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { NumberInput } from "./StepCommon";
import type { StepProps } from "./StepCommon";

export function PricingAvailabilityStep({ form }: StepProps) {
  const listingType = form.watch("context.listingType");
  return (
    <div className="space-y-6">
      <Card className="mx-auto w-full max-w-6xl border border-slate-200 bg-white p-6 shadow-xl">
        <p className="mb-4 text-sm font-semibold text-slate-800">Pricing & financials</p>

        <div className="grid gap-4 md:grid-cols-3">
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
          <FormField
            control={form.control}
            name="pricing.pricePerSqFt"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price per sq.ft</FormLabel>
                <NumberInput field={field} placeholder="4000" />
              </FormItem>
            )}
          />
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <FormField
            control={form.control}
            name="pricing.minPrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Min price (range)</FormLabel>
                <NumberInput field={field} placeholder="5000000" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="pricing.maxPrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Max price (range)</FormLabel>
                <NumberInput field={field} placeholder="7500000" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="pricing.priceRangeText"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Range note</FormLabel>
                <Input value={field.value ?? ""} onChange={(e) => field.onChange(e.target.value)} placeholder="5cr - 7.5cr negotiable" />
              </FormItem>
            )}
          />
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-3">
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

        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <FormField
            control={form.control}
            name="pricing.priceNegotiable"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center gap-2 space-y-0 rounded-2xl border border-slate-200 bg-slate-50 p-3">
                <FormControl>
                  <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
                <FormLabel className="text-sm text-slate-800">Price negotiable</FormLabel>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="pricing.priceInWords"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price in words</FormLabel>
                <Input value={field.value ?? ""} onChange={(e) => field.onChange(e.target.value)} placeholder="Five crore only" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="pricing.expectedRental"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Expected rental</FormLabel>
                <NumberInput field={field} placeholder="45000" />
              </FormItem>
            )}
          />
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-3">
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
          <FormField
            control={form.control}
            name="pricing.brokerageNegotiable"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center gap-2 space-y-0 rounded-2xl border border-slate-200 bg-slate-50 p-3">
                <FormControl>
                  <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
                <FormLabel className="text-sm text-slate-800">Brokerage negotiable</FormLabel>
              </FormItem>
            )}
          />
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <FormField
            control={form.control}
            name="pricing.expectedAnnualReturns"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Expected annual returns (%)</FormLabel>
                <NumberInput field={field} placeholder="6" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="pricing.bookingAmount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Booking amount</FormLabel>
                <NumberInput field={field} placeholder="100000" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="pricing.annualDuesPayable"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Annual dues payable</FormLabel>
                <NumberInput field={field} placeholder="12000" />
              </FormItem>
            )}
          />
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <FormField
            control={form.control}
            name="pricing.allInclusivePrice"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center gap-2 space-y-0 rounded-2xl border border-slate-200 bg-slate-50 p-3">
                <FormControl>
                  <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
                <FormLabel className="text-sm text-slate-800">All inclusive price</FormLabel>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="pricing.inclusive"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Inclusive of</FormLabel>
                <Input value={field.value ?? ""} onChange={(e) => field.onChange(e.target.value)} placeholder="Car parking, PLC" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="pricing.taxAndGovtExcluded"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center gap-2 space-y-0 rounded-2xl border border-slate-200 bg-slate-50 p-3">
                <FormControl>
                  <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
                <FormLabel className="text-sm text-slate-800">Tax/Govt charges excluded</FormLabel>
              </FormItem>
            )}
          />
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <FormField
            control={form.control}
            name="pricing.taxGovtCharges"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tax/Govt charges</FormLabel>
                <NumberInput field={field} placeholder="0" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="pricing.membershipCharge"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Membership charge</FormLabel>
                <NumberInput field={field} placeholder="50000" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="pricing.priceRangeText"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price range note</FormLabel>
                <Input value={field.value ?? ""} onChange={(e) => field.onChange(e.target.value)} placeholder="Discuss on visit" />
              </FormItem>
            )}
          />
        </div>
      </Card>
    </div>
  );
}
