import type { PropertyListingFormValues } from "@/types/propertyListing.types";

const STORAGE_KEY = "propertyListingLocalDraft";

export type PersistedListingDraft = {
  form: PropertyListingFormValues;
  step?: number;
};

export const loadPersistedDraft = (): PersistedListingDraft | null => {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PersistedListingDraft;
    if (parsed?.form) return parsed;
  } catch {
    // ignore
  }
  return null;
};

export const persistDraft = (data: PersistedListingDraft) => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // ignore
  }
};

export const clearPersistedDraft = () => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
};
