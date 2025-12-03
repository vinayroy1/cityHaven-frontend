import moment from "moment";

/**
 * Convert a string or Date to ISO 8601 string if valid; otherwise return undefined.
 * Keeps time zone info intact using moment's parsing rules.
 */
export const toIsoStringOrUndefined = (value?: string | Date | null) => {
  if (!value) return undefined;
  if (typeof value === "string" && !value.trim()) return undefined;
  const m = moment(value);
  return m.isValid() ? m.toISOString() : undefined;
};
