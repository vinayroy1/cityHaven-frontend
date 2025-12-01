import React, { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { NumberInput } from "./StepCommon";
import type { StepProps } from "./StepCommon";

export function PricingAvailabilityStep({ form }: StepProps) {
  const listingType = form.watch("context.listingType");
  const resCom = form.watch("context.resCom");
  const isSell = listingType === "SELL";
  const isRent = listingType === "RENT";
  const isPg = listingType === "PG";
  const isCommercial = resCom === "COMMERCIAL";

  const priceLabel = isSell ? "Total price" : isPg ? "Price per bed/room" : "Monthly rent";
  const priceTypeLabel = isSell ? "Total" : "Monthly";

  const sectionHasFields = useMemo(
    () => ({
      base: true,
      depositExtras: isRent || isPg || isSell,
      maintenance: isRent || isSell,
      brokerage: !isPg,
      returns: isSell && (isCommercial || true),
      inclusive: isSell,
      tax: isSell,
    }),
    [isRent, isPg, isSell, isCommercial],
  );

  return (
    <div className="space-y-6">
      <Card className="mx-auto w-full max-w-6xl border border-slate-200 bg-white p-6 shadow-xl">
        <p className="mb-4 text-sm font-semibold text-slate-800">Pricing & financials</p>

        {/* Base price */}
        <div className="grid gap-4 md:grid-cols-3">
          <FormField
            control={form.control}
            name="pricing.price"
            rules={{ required: "Price required" }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{priceLabel}</FormLabel>
                <NumberInput field={field} placeholder="35000" />
                <FormMessage />
              </FormItem>
            )}
          />
          <FormItem>
            <FormLabel>Price type</FormLabel>
            <Input value={priceTypeLabel} readOnly />
          </FormItem>
          {isSell && (
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
          )}
        </div>

        {sectionHasFields.depositExtras && (
          <div className="mt-6 space-y-3">
            <p className="text-xs uppercase tracking-wide text-slate-500">Deposits & extras</p>
            <div className="grid gap-4 md:grid-cols-3">
              {(isRent || isPg) && (
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
              )}
              {isSell && (
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
              )}
              {isSell && (
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
              )}
              {isSell && (
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
              )}
            </div>
          </div>
        )}

        {sectionHasFields.maintenance && (
          <div className="mt-6 space-y-3">
            <p className="text-xs uppercase tracking-wide text-slate-500">Maintenance</p>
            <div className="grid gap-4 md:grid-cols-3">
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
                    <Input value={field.value ?? ""} onChange={(e) => field.onChange(e.target.value)} placeholder="Monthly / Quarterly" />
                  </FormItem>
                )}
              />
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
            </div>
          </div>
        )}

        {sectionHasFields.base && (
          <div className="mt-6 space-y-3">
            <p className="text-xs uppercase tracking-wide text-slate-500">Potential & notes</p>
            <div className="grid gap-4 md:grid-cols-3">
              {isSell && (
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
              )}
              {isSell && (
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
              )}
              {isSell && isCommercial && (
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
              )}
            </div>
          </div>
        )}

        {sectionHasFields.brokerage && (
          <div className="mt-6 space-y-3">
            <p className="text-xs uppercase tracking-wide text-slate-500">Brokerage</p>
            <div className="grid gap-4 md:grid-cols-3">
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
          </div>
        )}

        {sectionHasFields.inclusive && (
          <div className="mt-6 space-y-3">
            <p className="text-xs uppercase tracking-wide text-slate-500">Inclusive</p>
            <div className="grid gap-4 md:grid-cols-3">
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
            </div>
          </div>
        )}

        {sectionHasFields.tax && (
          <div className="mt-6 space-y-3">
            <p className="text-xs uppercase tracking-wide text-slate-500">Taxes & charges</p>
            <div className="grid gap-4 md:grid-cols-3">
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
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
