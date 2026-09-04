import {
  PROPERTY_SUBTYPES,
  PROPERTY_SUBCATEGORIES,
  LOCATED_INSIDE_OPTIONS,
} from "@/constants/backend-schema";
import type { Option, StepConfig } from "../types";

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
          label: "I want to",
          type: "chip-radio",
          required: true,
          options: [
            { value: "SELL", label: "Sell" },
            { value: "RENT", label: "Rent / Lease" },
            { value: "PG", label: "PG / Co-living" },
          ],
        },
        {
          id: "context.postedAs",
          label: "You are",
          type: "chip-radio",
          required: true,
          options: [
            { value: "OWNER", label: "Owner" },
            { value: "AGENT", label: "Agent" },
            { value: "BUILDER", label: "Builder" },
          ],
        },
        {
          id: "context.organizationId",
          label: "Company / agency name",
          type: "text",
          placeholder: "Registered business name",
          visibleWhen: { field: "context.postedAs", in: ["AGENT", "BUILDER"] },
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
  ],
};
