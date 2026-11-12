import type { StepConfig } from "@/lib/listingEngine/types";
import { preset } from "@/lib/listingEngine/conditions";

export const portfolioStep: StepConfig = {
  id: "portfolio",
  label: "Portfolio",
  title: "Show your best work",
  caption: "Show your work · Portfolio",
  phase: "Show your work",
  description: "Add projects with room-wise photos, or just upload photos of your work to the gallery. You need one of the two to publish.",
  icon: "images",
  kind: "config",
  visibleWhen: preset("hasProviderType"),
  sections: [
    {
      id: "projects",
      title: "Add your projects, one at a time",
      kind: "custom",
      component: "PortfolioManager",
      badge: "PUBLISH",
      props: { field: "portfolio.projects", materialSpecsField: "materials.materialSpecs", branchesField: "location.branches", minImages: 3 },
      scorePaths: ["portfolio.projects"],
      weight: 8,
      fields: [],
    },
    {
      id: "gallery",
      title: "Work gallery",
      description: "No project details needed: select many photos of your work at once. 3 or more photos can stand in for a project.",
      fields: [
        {
          id: "portfolio.workGallery",
          label: "Photos of your work",
          type: "gallery",
          maxItems: 40,
          meta: { category: "interiors", subFolder: "gallery", maxItems: 40 },
        },
      ],
    },
  ],
};
