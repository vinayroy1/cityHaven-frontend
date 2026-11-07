/**
 * Staff-assisted listing session (admin "create listing on behalf of owner").
 *
 * The backend issues a short-lived token that acts as the owner but may only create/edit
 * listings. While a session is active AND the staff member is on /admin/listings, every API
 * client sends that token instead of the browser's own customer token, so the existing
 * listing forms save straight into the owner's account.
 */
import { APP_CONFIG } from "@/constants/app-config";

export type AssistedOwner = { id: number; name: string | null; email: string | null; mobileNumber: string; isNew: boolean };
export type AssistedSession = { token: string; owner: AssistedOwner; expiresAt: number };

const KEY = "awasio_assisted_session";
export const ASSISTED_PATH_PREFIX = "/admin/listings";

export function getAssistedSession(): AssistedSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return null;
    const s = JSON.parse(raw) as AssistedSession;
    if (!s?.token || Date.now() >= s.expiresAt) {
      sessionStorage.removeItem(KEY);
      return null;
    }
    return s;
  } catch {
    return null;
  }
}

export function setAssistedSession(token: string, owner: AssistedOwner, ttlMs = 2 * 60 * 60 * 1000) {
  // Expire a little early so a request never goes out with a token about to lapse.
  const session: AssistedSession = { token, owner, expiresAt: Date.now() + ttlMs - 60_000 };
  sessionStorage.setItem(KEY, JSON.stringify(session));
  return session;
}

export function clearAssistedSession() {
  if (typeof window !== "undefined") sessionStorage.removeItem(KEY);
}

/** True when API calls should act as the owner (session present and on the assisted pages). */
export function isAssistedActive(): boolean {
  if (typeof window === "undefined") return false;
  return window.location.pathname.startsWith(ASSISTED_PATH_PREFIX) && !!getAssistedSession();
}

/** Token every API client should send: the assisted owner token when active, else the user's own. */
export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  if (isAssistedActive()) return getAssistedSession()!.token;
  return localStorage.getItem(APP_CONFIG.AUTH.TOKEN_KEY);
}
