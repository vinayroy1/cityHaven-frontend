import type { StepConfig } from "@/lib/listingEngine/types";
import { preset } from "@/lib/listingEngine/conditions";
import { EXECUTION_CAPABILITY_OPTIONS } from "../options";

export const servicesStep: StepConfig = {
  id: "services",
  label: "Services",
  title: "What do you do best?",
  caption: "About your studio · Services",
  phase: "About your studio",
  description: "These power the directory filters — pick what you genuinely deliver.",
  icon: "sparkles",
  kind: "config",
  visibleWhen: preset("hasProviderType"),
  sections: [
    {
      id: "offerings",
      title: "Which services do you offer?",
      description: "Tap every card that applies. Each one opens a few quick details.",
      kind: "custom",
      component: "ServiceCards",
      badge: "SUBMIT",
      requires: [
        { path: "services.servicesOffered", label: "At least one service" },
        { path: "services.propertyTypesHandled", label: "Property types you handle" },
      ],
      scorePaths: [
        "services.servicesOffered",
        "services.propertyTypesHandled",
        "services.budgetSegments",
        "services.areaCapacity.minSqft",
        "services.areaCapacity.maxConcurrentProjects",
      ],
      weight: 6,
      fields: [],
    },
    {
      id: "styles",
      title: "Which styles do you design in?",
      description: "Pick up to 5 — they appear as tags on your card.",
      kind: "custom",
      component: "DesignStyleTiles",
      badge: "PUBLISH",
      props: { field: "services.designStyles", max: 5 },
      scorePaths: ["services.designStyles"],
      weight: 3,
      fields: [],
    },
    {
      id: "execution",
      title: "What do you do in-house?",
      collapsible: true,
      defaultCollapsed: true,
      fields: [{ id: "services.executionCapabilities", label: "In-house capabilities", type: "chip-multi", options: EXECUTION_CAPABILITY_OPTIONS }],
    },
  ],
};
