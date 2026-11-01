import type { StepConfig } from "@/lib/listingEngine/types";
import { preset } from "@/lib/listingEngine/conditions";

export const locationStep: StepConfig = {
  id: "location",
  label: "Location & branches",
  title: "Where do you work?",
  caption: "About your studio · Location",
  phase: "About your studio",
  description: "Clients search by city and locality. Add every city you take projects in.",
  icon: "map-pin",
  kind: "config",
  visibleWhen: preset("hasProviderType"),
  sections: [
    {
      id: "primaryLocation",
      title: "Where is your studio?",
      description: "Your studio address. Companies: this is your head office.",
      kind: "custom",
      component: "PrimaryLocationEditor",
      badge: "SUBMIT",
      requires: [
        { path: "location.primaryCity", label: "Primary city" },
        { path: "location.primaryLocality", label: "Primary locality" },
      ],
      scorePaths: ["location.primaryCity", "location.primaryLocality", "location.primaryAddress", "location.primaryPincode", "location.serviceCities"],
      weight: 6,
      // Paths PrimaryLocationEditor owns (for the component author).
      props: {
        cityField: "location.primaryCity",
        stateField: "location.primaryState",
        localityField: "location.primaryLocality",
        addressField: "location.primaryAddress",
        pincodeField: "location.primaryPincode",
        latField: "location.primaryLat",
        lngField: "location.primaryLng",
        serviceCitiesField: "location.serviceCities",
        serviceLocalitiesField: "location.serviceLocalities",
      },
      fields: [],
    },
    {
      id: "reach",
      title: "How far do you travel?",
      fields: [
        {
          id: "location.siteVisitRadiusKm",
          label: "Site-visit radius",
          type: "number",
          min: 0,
          max: 500,
          placeholder: "e.g. 25",
          helpText: "How far (km) from your studio you'll visit sites.",
          meta: { suffix: "km" },
        },
        { id: "location.servesOutstation", label: "I take outstation projects", type: "toggle", weight: 0 },
      ],
    },
    {
      id: "branches",
      title: "Any other branches?",
      description: "Company accounts only. Add now or later — each branch saves as soon as you tap Save.",
      kind: "custom",
      component: "BranchManager",
      badge: "SUBMIT",
      visibleWhen: preset("isCompany"),
      scorePaths: ["location.branches"],
      weight: 3,
      fields: [],
    },
  ],
};
