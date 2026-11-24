import { API_ENDPOINTS } from "@/constants/api-endpoints";

/**
 * Asks the backend to clear the HttpOnly login cookies (awasio_token / awasio_refresh_token).
 * Clearing localStorage alone leaves those cookies valid, so the API would still treat the visitor
 * as logged in. Fire-and-forget: logout must never be blocked by a network error.
 */
export function serverLogout(): Promise<void> {
  return fetch(API_ENDPOINTS.auth.logout, { method: "POST", credentials: "include" })
    .then(() => undefined)
    .catch(() => undefined);
}
