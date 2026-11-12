import type { StepConfig } from "@/lib/listingEngine/types";
import { preset } from "@/lib/listingEngine/conditions";
import { TEAM_SIZE_OPTIONS } from "../options";

const currentYear = new Date().getFullYear();

export const identityStep: StepConfig = {
  id: "identity",
  label: "Identity",
  title: "Who is listing?",
  caption: "About your studio · Identity",
  phase: "About your studio",
  description: "This is how you appear in the directory and on your profile page.",
  icon: "badge-check",
  kind: "config",
  sections: [
    {
      id: "providerType",
      title: "How do you work?",
      description: "Pick one. Companies add their business details, branches and team directly on the listing.",
      kind: "custom",
      component: "ProviderTypeCards",
      badge: "SUBMIT",
      requires: [{ path: "identity.providerType", label: "Provider type" }],
      scorePaths: ["identity.providerType"],
      weight: 3,
      fields: [],
    },
    {
      id: "individualBasics",
      title: "About you",
      badge: "SUBMIT",
      moderated: true,
      visibleWhen: preset("isIndividual"),
      fields: [
        { id: "identity.fullName", label: "Full name", type: "text", required: true, placeholder: "As on your ID proof", maxLength: 80 },
        {
          id: "identity.displayName",
          label: "Professional / display name",
          type: "text",
          required: true,
          placeholder: "e.g. Studio Anaya by Anaya Rao",
          helpText: "Shown on your listing card.",
          maxLength: 80,
        },
        { id: "identity.experienceYears", label: "Years of experience", type: "number", min: 0, max: 60, placeholder: "e.g. 6" },
      ],
    },
    {
      id: "companyBasics",
      title: "About the business",
      badge: "SUBMIT",
      moderated: true,
      visibleWhen: preset("isCompany"),
      fields: [
        { id: "identity.businessName", label: "Brand / business name", type: "text", required: true, maxLength: 100, placeholder: "Name clients know you by" },
        { id: "identity.legalName", label: "Registered legal name", type: "text", maxLength: 120, placeholder: "As on GST / incorporation certificate" },
        { id: "identity.yearEstablished", label: "Founding year", type: "number", min: 1900, max: currentYear, placeholder: `e.g. ${currentYear - 8}` },
        { id: "identity.teamSizeRange", label: "Team size", type: "chip-radio", options: TEAM_SIZE_OPTIONS },
      ],
    },
    {
      id: "pitch",
      title: "Your pitch",
      badge: "PUBLISH",
      visibleWhen: preset("hasProviderType"),
      fields: [
        { id: "identity.tagline", label: "Tagline", type: "text", maxLength: 80, placeholder: "e.g. Warm, functional homes for modern families" },
        {
          id: "identity.about",
          label: "About",
          type: "textarea",
          rows: 6,
          maxLength: 1500,
          helpText: "Optional. Leave it empty and we'll write one from your details when you submit; you can edit it anytime.",
        },
      ],
    },
    {
      id: "branding",
      title: "Photos & branding",
      badge: "PUBLISH",
      visibleWhen: preset("hasProviderType"),
      mobileColumns: 2,
      fields: [
        {
          id: "identity.logo",
          label: "Profile photo / logo",
          type: "upload",
          requiredFor: "PUBLISH",
          helpText: "Square image, at least 400×400.",
          meta: { category: "interiors", subFolder: "profile", accept: "image/*", aspect: "square" },
        },
        {
          id: "identity.coverBanner",
          label: "Cover banner",
          type: "upload",
          helpText: "Wide image (16:9) of your best work.",
          meta: { category: "interiors", subFolder: "cover", accept: "image/*", aspect: "wide" },
        },
      ],
    },
    {
      id: "links",
      title: "Website & social",
      description: "Optional, but builds trust.",
      collapsible: true,
      defaultCollapsed: true,
      visibleWhen: preset("hasProviderType"),
      fields: [
        { id: "identity.website", label: "Website", type: "url", placeholder: "https://" },
        { id: "identity.instagram", label: "Instagram", type: "url", placeholder: "https://instagram.com/yourstudio" },
        { id: "identity.facebook", label: "Facebook", type: "url", placeholder: "https://facebook.com/…" },
        { id: "identity.linkedin", label: "LinkedIn", type: "url", placeholder: "https://linkedin.com/…" },
        { id: "identity.youtube", label: "YouTube", type: "url", placeholder: "https://youtube.com/…" },
        {
          id: "identity.slug",
          label: "Profile URL",
          type: "text",
          weight: 0,
          placeholder: "auto-generated from your name",
          helpText: "awasio.com/interior-designers/{city}/{slug}. Lowercase letters, numbers and hyphens.",
          meta: { slugPreview: true, prefix: "awasio.com/interior-designers/", cityField: "location.primaryCity", sourceFields: ["identity.displayName", "identity.businessName"] },
        },
      ],
    },
  ],
};
