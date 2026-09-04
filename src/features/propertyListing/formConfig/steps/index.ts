import type { StepConfig } from "../types";
import { basicDetailsStep } from "./basicDetails";
import { propertyProfileStep } from "./propertyProfile";
import { pricingAmenitiesStep } from "./pricingAmenities";
import { mediaReviewStep } from "./mediaReview";

export const locationStep: StepConfig = {
  id: "location",
  label: "Location",
  title: "Where is the property?",
  caption: "City, locality & address",
  kind: "custom",
  component: "location",
};

export const listingSteps: StepConfig[] = [
  basicDetailsStep,
  locationStep,
  propertyProfileStep,
  pricingAmenitiesStep,
  mediaReviewStep,
];

export {
  basicDetailsStep,
  propertyProfileStep,
  pricingAmenitiesStep,
  mediaReviewStep,
};
