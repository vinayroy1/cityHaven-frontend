import {
  PROPERTY_SUBTYPES,
  PROPERTY_SUBCATEGORIES,
  LOCATED_INSIDE_OPTIONS,
} from "@/constants/backend-schema";
import type { Option, StepConfig } from "../types";
import { preset } from "../conditions";

const subtypesFor = (typeSlug: "residential" | "commercial" | "pg"): Option[] =>
  PROPERTY_SUBTYPES.filter((s) => s.propertyTypeSlug === typeSlug).map((s) => ({
    value: s.slug,
    label: s.name,
  }));

const subCategoryOptions: Option[] = PROPERTY_SUBCATEGORIES.map((c) => ({
  value: c.slug,
  label: c.name,
  visibleWhen: { field: "context.propertySubTypeSlug", equals: c.propertySubTypeSlug },
}));

// LOCATED_INSIDE_OPTIONS duplicates the same 10 entries for office & retail.
const seenLocated = new Set<string>();
const locatedInsideOptions: Option[] = LOCATED_INSIDE_OPTIONS.filter((o) => {
  if (seenLocated.has(o.slug)) return false;
  seenLocated.add(o.slug);
  return true;
}).map((o) => ({ value: o.slug, label: o.name }));

export const basicDetailsStep: StepConfig = {
  id: "basic",
  label: "Basic Details",
  title: "Tell us what you're listing",
  caption: "Listing type & classification",
  kind: "config",
  sections: [
    {
      id: "intent",
      fields: [
        {
          id: "context.listingType",
          label: "I want to list my property for",
          type: "chip-radio",
          required: true,
          options: [
            { value: "SELL", label: "Sell" },
            { value: "RENT", label: "Rent / Lease" },
            { value: "PG", label: "PG / Hostel / Lodge" },
          ],
        },
        {
          // Buyers filter on this first: it changes taxes (GST on new bookings) and
          // charges (society transfer on resale), and what documents to check.
          id: "context.saleType",
          label: "Is this a resale or a new booking?",
          type: "chip-radio",
          visibleWhen: preset("isSell"),
          requiredWhen: preset("isSell"),
          helpText: "New booking = bought directly from the builder. Resale = owned before, sold by its current owner.",
          options: [
            { value: "RESALE", label: "Resale" },
            { value: "NEW_BOOKING", label: "New booking" },
          ],
        },
      ],
    },
    {
      id: "classification",
      title: "What kind of property is it?",
      fields: [
        {
          id: "context.resCom",
          label: "Property category",
          type: "chip-radio",
          required: true,
          visibleWhen: { field: "context.listingType", notEquals: "PG" },
          options: [
            { value: "RESIDENTIAL", label: "Residential" },
            { value: "COMMERCIAL", label: "Commercial" },
          ],
        },
        {
          id: "context.propertySubTypeSlug",
          label: "Property type",
          type: "chip-radio",
          required: true,
          options: [
            ...subtypesFor("residential").map((o) => ({
              ...o,
              visibleWhen: {
                and: [
                  { field: "context.listingType", notEquals: "PG" },
                  { field: "context.resCom", equals: "RESIDENTIAL" },
                ],
              },
            })),
            ...subtypesFor("commercial").map((o) => ({
              ...o,
              visibleWhen: { field: "context.resCom", equals: "COMMERCIAL" },
            })),
            ...subtypesFor("pg").map((o) => ({
              ...o,
              visibleWhen: { field: "context.listingType", equals: "PG" },
            })),
          ],
        },
        {
          id: "context.propertySubCategorySlug",
          label: "Sub-category",
          type: "chip-radio",
          requiredWhen: { field: "context.propertySubTypeSlug", in: ["office", "retail"] },
          visibleWhen: { field: "context.propertySubTypeSlug", in: ["office", "retail"] },
          options: subCategoryOptions,
        },
        {
          id: "context.locatedInsideSlug",
          label: "Located inside",
          type: "chip-radio",
          visibleWhen: { field: "context.propertySubTypeSlug", in: ["office", "retail"] },
          options: locatedInsideOptions,
        },
      ],
    },
    {
      // Asked after the property type so the right options (e.g. Co-working operator) are already shown.
      // It records whose behalf the listing is on: it sets the card badge, the "Posted by" filter and
      // whether brokerage terms are asked, so staff pick the business they work for, not "agent".
      id: "listedBy",
      fields: [
        {
          id: "context.postedAs",
          label: "Who are you listing for?",
          helpText: "Listing as an employee or family member? Choose who you're listing for.",
          type: "chip-radio",
          required: true,
          options: [
            { value: "OWNER", label: "Owner (or owner's family / staff)" },
            { value: "AGENT", label: "Broker / Agent" },
            { value: "BUILDER", label: "Builder / Developer (or sales team)" },
            // Co-working centres are usually listed by the operator who runs them, not the building owner.
            { value: "OPERATOR", label: "Co-working operator (or centre staff)", visibleWhen: preset("isCoworking") },
          ],
        },
      ],
    },
  ],
};
