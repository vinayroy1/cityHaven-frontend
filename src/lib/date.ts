/**
 * Convert a string or Date to ISO 8601 string if valid; otherwise return undefined.
 * Uses native Date parser without heavy external libraries.
 */
export const toIsoStringOrUndefined = (value?: string | Date | null) => {
  if (!value) return undefined;
  if (typeof value === "object" && !(value instanceof Date)) return undefined;
  if (typeof value === "string" && !value.trim()) return undefined;
  const d = new Date(value);
  return !isNaN(d.getTime()) ? d.toISOString() : undefined;
};

export const toIsoStringOrNull = (value?: string | Date | null) => {
  if (!value) return null;
  if (typeof value === "object" && !(value instanceof Date)) return null;
  if (typeof value === "string" && !value.trim()) return null;
  const d = new Date(value);
  return !isNaN(d.getTime()) ? d.toISOString() : null;
};
