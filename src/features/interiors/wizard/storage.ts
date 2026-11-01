import { createDraftStorage } from "@/lib/listingEngine/storage";
import type { InteriorWizardValues } from "@/types/interior.types";
import { INTERIOR_STORAGE_KEY } from "./vertical";

/**
 * localStorage shadow of unsaved wizard values ({ values, step, updatedAt }).
 * Document entries are kept (they reference uploaded URLs only); nothing secret is stored.
 */
export const interiorDraftStorage = createDraftStorage<InteriorWizardValues>(INTERIOR_STORAGE_KEY, {
  sanitize: (values) => JSON.parse(JSON.stringify(values)) as InteriorWizardValues,
});
