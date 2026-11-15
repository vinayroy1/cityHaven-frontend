/**
 * Unfinished listing forms kept in this browser (they hold the owner's name, phone and address).
 * Removed on logout so the next person on the same device never gets them offered back.
 */
const EXACT_KEYS = ["propertyListingLocalDraft", "adminPropertySourcingDraft"];
const PREFIXES = ["interiorWizardDraft"];

export function clearListingDrafts() {
  if (typeof window === "undefined") return;
  try {
    const ls = window.localStorage;
    EXACT_KEYS.forEach((k) => ls.removeItem(k));
    for (let i = ls.length - 1; i >= 0; i--) {
      const k = ls.key(i);
      if (k && PREFIXES.some((p) => k.startsWith(p))) ls.removeItem(k);
    }
    // Wizard "furthest step reached" markers live in sessionStorage.
    const ss = window.sessionStorage;
    for (let i = ss.length - 1; i >= 0; i--) {
      const k = ss.key(i);
      if (k && PREFIXES.some((p) => k.startsWith(p))) ss.removeItem(k);
    }
  } catch {
    /* storage unavailable */
  }
}
