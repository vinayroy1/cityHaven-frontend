"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { triggerSafeBack } from "./backNavigation";

/**
 * Universal safe back navigation hook.
 * Seamlessly handles:
 * - Closing open modals/sheets first if active
 * - Stepping back in browser history if internal history exists
 * - Graceful fallback to `fallbackHref` if landing directly from deep link / notification
 * - Communication with Expo React Native WebView on Android & iOS
 */
export function useSafeBack(fallbackHref: string = "/") {
  const router = useRouter();

  const goBack = useCallback(
    (customFallback?: string) => {
      triggerSafeBack(router, customFallback || fallbackHref);
    },
    [router, fallbackHref]
  );

  return { goBack };
}
