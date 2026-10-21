/**
 * Utility to resolve API endpoints when running server-side (Node.js runtime / SSR / SSG).
 *
 * Inside Docker containers in production, requests to the external public domain (e.g. https://awasio.com)
 * fail due to bridge network hairpin NAT restrictions.
 *
 * This function rewrites any public/external API URL or localhost URL to the internal backend container URL
 * (e.g. http://awasio-backend:4000/api) when running on the server.
 */
export function toInternalApiUrl(endpoint: string): string {
  // If running in browser, do not rewrite (browser must use public API URL)
  if (typeof window !== "undefined") {
    return endpoint;
  }

  const internalBase =
    process.env.INTERNAL_API_URL ||
    (process.env.NODE_ENV === "production"
      ? "http://awasio-backend:4000/api"
      : "http://localhost:4000/api");

  const cleanBase = internalBase.replace(/\/+$/, "");

  // Match full URLs like:
  // - https://awasio.com/api/v1/...
  // - http://localhost:4000/api/v1/...
  // - http://127.0.0.1:4000/api/v1/...
  if (/^https?:\/\/[^\/]+\/api(\/.*)?$/i.test(endpoint)) {
    return endpoint.replace(/^https?:\/\/[^\/]+\/api/i, cleanBase);
  }

  // Match relative /api/...
  if (endpoint.startsWith("/api/")) {
    return `${cleanBase.replace(/\/api$/, "")}${endpoint}`;
  }

  // Match relative /v1/...
  if (endpoint.startsWith("/v1/")) {
    return `${cleanBase}${endpoint}`;
  }

  return endpoint;
}
