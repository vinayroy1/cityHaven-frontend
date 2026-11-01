import type { StepConfig } from "@/lib/listingEngine/types";
import { preset } from "@/lib/listingEngine/conditions";

export const materialsStep: StepConfig = {
  id: "materials",
  label: "Materials & brands",
  title: "Materials you build with",
  caption: "Show your work · Materials",
  phase: "Show your work",
  description: "Clients compare quotes by board, finish and hardware. Be specific — brand names help.",
  icon: "layers",
  kind: "config",
  visibleWhen: preset("hasProviderType"),
  sections: [
    {
      id: "materialSpecs",
      title: "Material specifications",
      description: "Add rows per category. Use the quick-add chips or enter your own brand.",
      kind: "custom",
      component: "MaterialSpecTable",
      badge: "PUBLISH",
      props: { field: "materials.materialSpecs" },
      scorePaths: ["materials.materialSpecs"],
      weight: 6,
      fields: [],
    },
  ],
};
