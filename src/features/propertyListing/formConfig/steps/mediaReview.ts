import type { StepConfig } from "../types";

export const mediaReviewStep: StepConfig = {
  id: "media",
  label: "Photos & Review",
  title: "Add photos and review your listing",
  caption: "Media & publish",
  kind: "config",
  sections: [
    {
      id: "media",
      title: "Photos & video",
      fields: [
        {
          id: "media.mediaIds",
          label: "Add photos and a video",
          type: "media",
          helpText: "Listings with photos get up to 5× more responses.",
        },
      ],
    },
  ],
};
