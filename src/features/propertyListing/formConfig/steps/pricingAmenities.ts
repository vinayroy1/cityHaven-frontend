import { amenityOptions } from "../../constants";
import { preset } from "../conditions";
import { paymentFrequencyOptions } from "../options";
import type { FieldConfig, Option, StepConfig } from "../types";

const money = (id: string, label: string, extra?: Partial<FieldConfig>): FieldConfig => ({
  id,
  label,
  type: "number",
  min: 0,
  ...extra,
});

const amenityChoices: Option[] = amenityOptions.map((a) => ({ value: a.id, label: a.label }));

export const pricingAmenitiesStep: StepConfig = {
  id: "pricing",
  label: "Pricing & Amenities",
  title: "Pricing & other details",
  caption: "Commercials, brokerage & features",
  kind: "config",
  sections: [
    {
      id: "price",
      title: "Price details",
      fields: [
        // one price field per listing type, so the label matches Basic Details
        {
          id: "pricing.price",
          label: "Expected price (₹)",
          type: "price",
          required: true,
          perUnitField: "pricing.pricePerSqFt",
          visibleWhen: preset("priceIsSell"),
        },
        {
          id: "pricing.price",
          label: "Monthly rent (₹)",
          type: "price",
          required: true,
          visibleWhen: preset("priceIsRent"),
        },
        {
          id: "pricing.price",
          label: "Rent per bed / month (₹)",
          type: "price",
          required: true,
          visibleWhen: preset("priceIsPg"),
        },
        { id: "pricing.priceNegotiable", label: "Price negotiable", type: "checkbox" },
        { id: "pricing.allInclusivePrice", label: "All-inclusive price", type: "checkbox", visibleWhen: preset("isSell") },
        {
          id: "pricing.taxAndGovtExcluded",
          label: "Tax & govt charges excluded",
          type: "checkbox",
          visibleWhen: preset("isSell"),
        },
      ],
    },
    {
      id: "deposit",
      title: "Deposit & charges",
      collapsible: true,
      defaultCollapsed: true,
      visibleWhen: {
        or: [preset("showDeposit"), preset("showMaintenance"), preset("showSocietyCharges"), preset("showRentalYield")],
      },
      fields: [
        money("pricing.deposit", "Security deposit (₹)", { visibleWhen: preset("showDeposit") }),
        money("pricing.maintenance", "Maintenance (₹)", { visibleWhen: preset("showMaintenance") }),
        {
          id: "pricing.maintenancePaymentPeriod",
          label: "Maintenance frequency",
          type: "select",
          options: paymentFrequencyOptions,
          visibleWhen: preset("showMaintenance"),
        },
        money("pricing.bookingAmount", "Booking amount (₹)", { visibleWhen: preset("showBookingAmount") }),
        money("pricing.membershipCharge", "Membership charge (₹)", { visibleWhen: preset("showSocietyCharges") }),
        money("pricing.annualDuesPayable", "Annual dues payable (₹)", { visibleWhen: preset("showSocietyCharges") }),
        money("pricing.expectedRental", "Expected monthly rental (₹)", { visibleWhen: preset("showRentalYield") }),
      ],
    },
    {
      id: "brokerage",
      title: "Brokerage",
      collapsible: true,
      defaultCollapsed: true,
      visibleWhen: preset("showBrokerage"),
      fields: [
        money("pricing.brokerage", "Brokerage amount"),
        {
          id: "pricing.brokerageType",
          label: "Brokerage type",
          type: "select",
          options: [
            { value: "PERCENTAGE", label: "Percentage" },
            { value: "FIXED", label: "Fixed" },
          ],
        },
        { id: "pricing.brokerageNegotiable", label: "Brokerage negotiable", type: "checkbox" },
      ],
    },
    {
      id: "amenities",
      title: "Amenities & features",
      description: "Pick everything the property or society offers.",
      fields: [{ id: "amenities.amenityIds", label: "Amenities", type: "chip-multi", options: amenityChoices }],
    },
  ],
};
