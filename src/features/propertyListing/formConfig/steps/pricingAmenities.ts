import { amenityOptions } from "../../constants";
import { preset } from "../conditions";
import { paymentFrequencyOptions } from "../options";
import type { FieldConfig, Option, StepConfig } from "../types";

const money = (id: string, label: string, extra?: Partial<FieldConfig>): FieldConfig => {
  let defaultPlaceholder = "e.g. 10,000";
  if (id.includes("deposit")) defaultPlaceholder = "e.g. 50,000";
  else if (id.includes("maintenance")) defaultPlaceholder = "e.g. 2,500";
  else if (id.includes("bookingAmount")) defaultPlaceholder = "e.g. 1,00,000";
  else if (id.includes("membershipCharge")) defaultPlaceholder = "e.g. 5,000";
  else if (id.includes("annualDuesPayable")) defaultPlaceholder = "e.g. 10,000";
  else if (id.includes("expectedRental")) defaultPlaceholder = "e.g. 25,000";

  return {
    id,
    label,
    placeholder: extra?.placeholder ?? defaultPlaceholder,
    type: "number",
    min: 0,
    ...extra,
  };
};

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
          placeholder: "Expected price (e.g. 50,00,000)",
          type: "price",
          required: true,
          perUnitField: "pricing.pricePerSqFt",
          visibleWhen: preset("priceIsSell"),
        },
        {
          id: "pricing.price",
          label: "Monthly rent (₹)",
          placeholder: "Monthly rent (e.g. 25,000)",
          type: "price",
          required: true,
          visibleWhen: preset("priceIsRent"),
        },
        {
          id: "pricing.price",
          label: "Rent per bed / month (₹)",
          placeholder: "Rent per bed / month (e.g. 8,000)",
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
      defaultCollapsed: false,
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
      title: "Brokerage details",
      description: "Define your transaction fees for clients. Awasio does not charge any platform commission.",
      collapsible: false,
      visibleWhen: preset("showBrokerage"),
      fields: [
        {
          id: "pricing.brokerageBlock",
          label: "Brokerage terms",
          type: "brokerage",
        },
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
