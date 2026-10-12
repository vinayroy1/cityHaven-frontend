import type { PropertyListingFormValues } from "@/types/propertyListing.types";

const STORAGE_KEY = "propertyListingLocalDraft";

export type PersistedListingDraft = {
  form: PropertyListingFormValues;
  step?: number;
};

export const loadPersistedDraft = (key: string = STORAGE_KEY): PersistedListingDraft | null => {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PersistedListingDraft;
    if (parsed?.form) {
      // Ensure resCom and subtype consistency: if subtype doesn't belong to the saved resCom, clear subtype
      const subType = parsed.form.context?.propertySubTypeSlug;
      const resCom = parsed.form.context?.resCom;
      if (subType) {
        const commercialSubtypes = ["office", "retail", "plot-land-com", "storage", "industry", "hospitality", "commercial-other"];
        const residentialSubtypes = ["apartment", "independent-house-villa", "independent-builder-floor", "1rk-studio-apartment", "serviced-apartment", "plot-land-res", "farmhouse", "residential-other"];
        if (resCom === "RESIDENTIAL" && commercialSubtypes.includes(subType)) {
          parsed.form.context.propertySubTypeSlug = "";
          parsed.form.context.propertySubCategorySlug = "";
          parsed.form.context.locatedInsideSlug = "";
        } else if (resCom === "COMMERCIAL" && residentialSubtypes.includes(subType)) {
          parsed.form.context.propertySubTypeSlug = "";
          parsed.form.context.propertySubCategorySlug = "";
          parsed.form.context.locatedInsideSlug = "";
        }
      }
      const locatedInside = parsed.form.context?.locatedInsideSlug;
      if (locatedInside) {
        const stripped = locatedInside.replace(/-(office|retail|commercial)$/, "");
        parsed.form.context.locatedInsideSlug = stripped === "retail-complex-building" ? "retail-complex" : stripped;
      }
      return parsed;
    }
  } catch {
    // ignore
  }
  return null;
};

export const persistDraft = (data: PersistedListingDraft, key: string = STORAGE_KEY) => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(data));
  } catch {
    // ignore
  }
};

export const clearPersistedDraft = (key: string = STORAGE_KEY) => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(key);
  } catch {
    // ignore
  }
};
