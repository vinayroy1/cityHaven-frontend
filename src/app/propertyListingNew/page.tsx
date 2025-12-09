import React from "react";
import { basicDetailsStep } from "./config/basicDetailsConfig";
import { propertyProfileStep } from "./config/propertyDetails";
import { PropertyListingNewProcessor } from "./PropertyListingNewProcessor";

export default function PropertyListingNewPage() {
  return <PropertyListingNewProcessor steps={[basicDetailsStep, propertyProfileStep]} />;
}
