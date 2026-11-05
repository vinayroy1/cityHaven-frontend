import type { StepConfig } from "@/lib/listingEngine/types";
import { preset } from "@/lib/listingEngine/conditions";
import { ACCEPTING_OPTIONS, LEAD_PREFERENCE_OPTIONS, WORKING_DAY_OPTIONS } from "../options";

/** Step 9: contact, availability, readiness review and publish. Section key "contact". */
export const contactStep: StepConfig = {
  id: "contact",
  label: "Review & publish",
  title: "Review and go live",
  caption: "Trust & publish · Review",
  phase: "Trust & publish",
  description: "Tell clients how to reach you, then review and submit.",
  icon: "send",
  kind: "config",
  visibleWhen: preset("hasProviderType"),
  sections: [
    {
      id: "contactDetails",
      title: "How should clients reach you?",
      badge: "SUBMIT",
      fields: [
        { id: "contact.contactName", label: "Contact person", type: "text", placeholder: "Who answers enquiries" },
        {
          id: "contact.phone",
          label: "Phone",
          type: "tel",
          required: true,
          placeholder: "Mobile number",
          helpText: "Mobile number in your business country (India, Nepal, Bangladesh or Sri Lanka).",
          meta: { suggestFromUser: true },
        },
        { id: "contact.whatsappSameAsPhone", label: "WhatsApp on the same number", type: "toggle", weight: 0 },
        { id: "contact.whatsapp", label: "WhatsApp number", type: "tel", visibleWhen: preset("whatsappDifferent"), placeholder: "Mobile number" },
        { id: "contact.email", label: "Email", type: "email", placeholder: "you@studio.com" },
        { id: "contact.showPhonePublicly", label: "Show phone on public profile", type: "toggle", weight: 0, helpText: "Off: clients reach you through enquiries only." },
        { id: "contact.isEmailPublic", label: "Show email on public profile", type: "toggle", weight: 0 },
        { id: "contact.leadPreference", label: "Preferred way to receive leads", type: "chip-radio", options: LEAD_PREFERENCE_OPTIONS },
      ],
    },
    {
      id: "availability",
      title: "When are you available?",
      fields: [
        { id: "contact.workingDays", label: "Working days", type: "chip-multi", options: WORKING_DAY_OPTIONS, meta: { presets: [{ label: "Mon–Sat", value: ["MON", "TUE", "WED", "THU", "FRI", "SAT"] }] } },
        { id: "contact.workingHours.open", label: "Opens at", type: "time" },
        { id: "contact.workingHours.close", label: "Closes at", type: "time" },
        { id: "contact.acceptingNewProjects", label: "Accepting new projects?", type: "chip-radio", options: ACCEPTING_OPTIONS },
        { id: "contact.nextAvailableFrom", label: "Available again from", type: "date", visibleWhen: preset("notAcceptingProjects") },
      ],
    },
    {
      id: "readiness",
      title: "Ready to go live?",
      kind: "custom",
      component: "ReadinessChecklist",
      weight: 0,
      fields: [],
    },
    {
      id: "preview",
      title: "Preview as a homeowner",
      kind: "custom",
      component: "PublicPreview",
      weight: 0,
      fields: [],
    },
  ],
};
