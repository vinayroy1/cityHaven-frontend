import type { StepConfig } from "@/lib/listingEngine/types";
import { preset } from "@/lib/listingEngine/conditions";
import { SUPPORT_CHANNEL_OPTIONS } from "../options";

export const warrantyStep: StepConfig = {
  id: "warranty",
  label: "Warranty & process",
  title: "What do you guarantee after handover?",
  caption: "Trust & publish · Warranty",
  phase: "Trust & publish",
  description: "Clients look for clear warranty terms before shortlisting.",
  icon: "shield",
  kind: "config",
  visibleWhen: preset("hasProviderType"),
  sections: [
    {
      id: "warranties",
      title: "How long is each part covered?",
      description: "One row per component, with a short scope note. Woodwork is required to publish.",
      kind: "custom",
      component: "WarrantyMatrix",
      badge: "PUBLISH",
      props: { field: "warranty.warranties" },
      scorePaths: ["warranty.warranties"],
      weight: 3,
      fields: [],
    },
    {
      id: "process",
      title: "How does a project run with you?",
      description: "Pick the steps you follow, typical delivery time and post-handover check.",
      kind: "custom",
      component: "ProcessTimeline",
      props: { field: "warranty.support.afterSalesNote" },
      scorePaths: ["warranty.support.afterSalesNote"],
      weight: 1,
      fields: [],
    },
    {
      id: "support",
      title: "What support do you offer after handover?",
      collapsible: true,
      fields: [
        { id: "warranty.support.freeMaintenanceMonths", label: "Free maintenance (months)", type: "number", min: 0, max: 120, placeholder: "e.g. 12" },
        { id: "warranty.support.responseTimeHours", label: "Response time (hours)", type: "number", min: 1, max: 720, placeholder: "e.g. 48" },
        { id: "warranty.support.channels", label: "Support channels", type: "chip-multi", options: SUPPORT_CHANNEL_OPTIONS },
      ],
    },
  ],
};
