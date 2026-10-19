"use client";

import React, { Suspense, useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  executeBackHandlers,
  getInternalHistoryDepth,
  recordInternalNavigation,
  sendToExpoNative,
  updateNativeCanGoBack,
} from "@/lib/navigation/backNavigation";

function NavigationBridgeInternal() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  // 1. Record route changes to track internal history depth
  useEffect(() => {
    recordInternalNavigation();
    updateNativeCanGoBack();
  }, [pathname, searchParams]);

  // 2. React Native / Expo WebView 2-way message bridge
  useEffect(() => {
    const handleNativeMessage = (event: MessageEvent) => {
      let data: any = event.data;

      // React Native may send stringified JSON
      if (typeof data === "string") {
        try {
          data = JSON.parse(data);
        } catch {
          // Plain string message, ignore
          return;
        }
      }

      if (!data || typeof data !== "object") return;

      const eventType = data.type || data.action;

      if (eventType === "HARDWARE_BACK_PRESS" || eventType === "GO_BACK") {
        // Step A: Check if any active overlay / modal / wizard consumed it
        const handledByOverlay = executeBackHandlers();
        if (handledByOverlay) {
          sendToExpoNative({
            type: "AWASIO_BACK_RESPONSE",
            handled: true,
            reason: "OVERLAY_OR_STEP_CLOSED",
          });
          updateNativeCanGoBack();
          return;
        }

        // Step B: Check history depth
        const depth = getInternalHistoryDepth();
        const canGoBackInBrowser = depth > 1 || window.history.length > 1;

        if (canGoBackInBrowser && pathname !== "/") {
          router.back();
          sendToExpoNative({
            type: "AWASIO_BACK_RESPONSE",
            handled: true,
            reason: "ROUTER_BACK",
          });
        } else {
          // User is at root or direct landing without history: notify Expo
          sendToExpoNative({
            type: "AWASIO_BACK_RESPONSE",
            handled: false,
            reason: "ROOT_REACHED",
            shouldExitApp: true,
          });
        }

        updateNativeCanGoBack();
      } else if (eventType === "CHECK_CAN_GO_BACK" || eventType === "SYNC_STATE") {
        updateNativeCanGoBack();
      }
    };

    // Listen on both window and document for full Expo / RN compatibility
    window.addEventListener("message", handleNativeMessage);
    document.addEventListener("message" as any, handleNativeMessage);

    // Initial sync
    updateNativeCanGoBack();

    return () => {
      window.removeEventListener("message", handleNativeMessage);
      document.removeEventListener("message" as any, handleNativeMessage);
    };
  }, [pathname, router]);

  return null;
}

export function NavigationBridgeProvider({
  children,
}: {
  children?: React.ReactNode;
}) {
  return (
    <>
      <Suspense fallback={null}>
        <NavigationBridgeInternal />
      </Suspense>
      {children}
    </>
  );
}

export default NavigationBridgeProvider;
