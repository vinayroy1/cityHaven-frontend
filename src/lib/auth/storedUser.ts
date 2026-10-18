import { APP_CONFIG } from "@/constants/app-config";

export type StoredUserContact = { name: string; mobileNumber: string; email: string };

export function getStoredUserContact(): StoredUserContact | null {
  if (typeof window === "undefined") return null;
  if (!window.localStorage.getItem(APP_CONFIG.AUTH.TOKEN_KEY)) return null;
  try {
    const raw = window.localStorage.getItem(APP_CONFIG.AUTH.USER_KEY);
    if (!raw) return null;
    const user = JSON.parse(raw) as Record<string, unknown>;
    const firstName = typeof user.firstName === "string" ? user.firstName : "";
    const lastName = typeof user.lastName === "string" ? user.lastName : "";
    const name =
      (typeof user.name === "string" && user.name) ||
      (typeof user.displayName === "string" && user.displayName) ||
      [firstName, lastName].filter(Boolean).join(" ");
    const mobile =
      (typeof user.mobileNumber === "string" && user.mobileNumber) ||
      (typeof user.phoneNumber === "string" && user.phoneNumber) ||
      (typeof user.phone === "string" && user.phone) ||
      "";
    return {
      name: name.trim(),
      mobileNumber: mobile.replace(/\D/g, "").slice(-10),
      email: typeof user.email === "string" ? user.email.trim() : "",
    };
  } catch {
    return null;
  }
}
