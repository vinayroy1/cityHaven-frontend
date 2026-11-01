import type { StepConfig } from "@/lib/listingEngine/types";
import { preset } from "@/lib/listingEngine/conditions";

export const portfolioStep: StepConfig = {
  id: "portfolio",
  label: "Portfolio",
  title: "Show your best work",
  caption: "Show your work · Portfolio",
  phase: "Show your work",
  description: "Projects with room-wise photos convert best. You can submit without one, but need one to publish.",
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
  ],
};
