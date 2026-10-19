"use client";

import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

export type BackHandlerFn = () => boolean | void;

declare global {
  interface Window {
    ReactNativeWebView?: {
      postMessage: (message: string) => void;
    };
  }
}

// LIFO stack of active handlers (e.g. open modals, sheets, drawers, multi-step wizards)
const backHandlers: BackHandlerFn[] = [];

/**
 * Register a back-press interceptor.
 * If the handler returns `true`, it marks the back event as consumed/handled
 * (e.g. closed a modal, popped a lightbox, or decremented a wizard step).
 *
 * Returns an unregister cleanup function.
 */
export function registerBackHandler(handler: BackHandlerFn): () => void {
  backHandlers.push(handler);
  updateNativeCanGoBack();
  return () => {
    const idx = backHandlers.lastIndexOf(handler);
    if (idx !== -1) {
      backHandlers.splice(idx, 1);
      updateNativeCanGoBack();
    }
  };
}

/**
 * Check if the app is currently running inside a React Native / Expo WebView.
 */
export function isExpoWebView(): boolean {
  if (typeof window === "undefined") return false;
  if (Boolean(window.ReactNativeWebView)) return true;
  const ua = window.navigator.userAgent || "";
  return /wv|WebView|Expo/i.test(ua);
}

/**
 * Safely send a structured event to the parent React Native / Expo app.
 */
export function sendToExpoNative(event: {
  type: string;
  [key: string]: unknown;
}) {
  if (typeof window === "undefined") return;
  try {
    if (window.ReactNativeWebView?.postMessage) {
      window.ReactNativeWebView.postMessage(JSON.stringify(event));
    }
  } catch (err) {
    // Silently ignore if bridge is unavailable
  }
}

/**
 * Session storage key tracking whether the user has performed internal page transitions.
 */
const INTERNAL_HISTORY_KEY = "awasio_internal_history_depth";

export function recordInternalNavigation() {
  if (typeof window === "undefined") return;
  try {
    const current = parseInt(sessionStorage.getItem(INTERNAL_HISTORY_KEY) || "0", 10);
    sessionStorage.setItem(INTERNAL_HISTORY_KEY, String(current + 1));
  } catch {
    // Storage restricted
  }
  updateNativeCanGoBack();
}

export function getInternalHistoryDepth(): number {
  if (typeof window === "undefined") return 0;
  try {
    return parseInt(sessionStorage.getItem(INTERNAL_HISTORY_KEY) || "0", 10);
  } catch {
    return 0;
  }
}

/**
 * Notify Expo / React Native whether the WebView can go back or has open modals.
 */
export function updateNativeCanGoBack() {
  if (typeof window === "undefined") return;
  const hasModal = backHandlers.length > 0;
  const historyDepth = getInternalHistoryDepth();
  const canGoBack = hasModal || historyDepth > 1 || window.history.length > 1;

  sendToExpoNative({
    type: "AWASIO_CAN_GO_BACK",
    canGoBack,
    hasModal,
    handlersCount: backHandlers.length,
    path: window.location.pathname,
  });
}

/**
 * Execute the topmost active back handler (if any).
 * Returns true if an overlay/modal/step consumed the event.
 */
export function executeBackHandlers(): boolean {
  if (backHandlers.length === 0) return false;
  // Pop and invoke the most recent handler
  const handler = backHandlers[backHandlers.length - 1];
  try {
    const handled = handler();
    // If handler returned true or void without error, treat as handled
    return handled !== false;
  } catch (err) {
    console.warn("[backNavigation] Handler error:", err);
    return false;
  }
}

/**
 * Primary universal back navigation function.
 * 1. Checks if any open modal/sheet/drawer intercepts.
 * 2. If not, checks if there is internal session history.
 * 3. If there is internal history, calls `router.back()`.
 * 4. If direct landing or history is exhausted, navigates safely to `fallbackHref`.
 * 5. Notifies Expo WebView so Android BackHandler / iOS navigation state syncs.
 */
export function triggerSafeBack(
  router: AppRouterInstance,
  fallbackHref: string = "/",
  options?: {
    onBeforeBack?: () => boolean | void;
  }
) {
  if (typeof window === "undefined") return;

  // Optional custom hook before back
  if (options?.onBeforeBack) {
    const cancel = options.onBeforeBack();
    if (cancel === true) return;
  }

  // 1. Check if any active modal or wizard handler consumes the back press
  if (executeBackHandlers()) {
    updateNativeCanGoBack();
    return;
  }

  // 2. Check internal session history depth
  const depth = getInternalHistoryDepth();
  const hasReferrer = Boolean(document.referrer && document.referrer.includes(window.location.host));

  if (depth > 1 || hasReferrer) {
    // Safely go back in browser history
    router.back();
    sendToExpoNative({ type: "AWASIO_NAVIGATE_BACK", action: "ROUTER_BACK" });
  } else {
    // Fallback: direct entry or external referrer -> navigate to guaranteed safe route
    router.push(fallbackHref);
    sendToExpoNative({ type: "AWASIO_NAVIGATE_BACK", action: "FALLBACK_PUSH", href: fallbackHref });
  }

  updateNativeCanGoBack();
}
