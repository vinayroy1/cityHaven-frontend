/**
 * Human-readable message from an API error (RTK Query error or unwrap() rejection).
 * The backend's validation responses say only "Validation failed" and put the actual reason in
 * `errors[]`; surface that reason (e.g. "OTP must be 6 digits") instead of the generic text.
 */
export function getApiErrorMessage(err: unknown, fallback = "Something went wrong. Please try again."): string {
  const e = err as { data?: unknown; message?: string } | null | undefined;
  const data = e?.data as { message?: string; error?: string; errors?: { message?: string }[] } | string | undefined;
  if (typeof data === "string" && data.trim()) return data;
  if (data && typeof data === "object") {
    const firstDetail = Array.isArray(data.errors) ? data.errors.find((x) => x?.message)?.message : undefined;
    if (data.message === "Validation failed" && firstDetail) return firstDetail;
    if (data.message) return data.message;
    if (data.error) return data.error;
    if (firstDetail) return firstDetail;
  }
  return e?.message || fallback;
}
