"use client";

import { useEffect, useRef } from "react";
import { registerBackHandler, updateNativeCanGoBack } from "./backNavigation";

interface UseModalBackHandlerOptions {
  isOpen: boolean;
  onClose: () => void;
  /**
   * If true, pushes a synthetic history state so that hardware Back / swipe
   * in Expo WebView or mobile browsers closes this modal instead of navigating away.
   * Defaults to true.
   */
  pushHistoryState?: boolean;
  /**
   * Unique name/tag for debugging.
   */
  name?: string;
}

/**
 * Hook to bind modal/sheet/drawer/lightbox lifecycle to the back navigation stack
 * and browser/Expo WebView history.
 */
export function useModalBackHandler({
  isOpen,
  onClose,
  pushHistoryState = true,
  name,
}: UseModalBackHandlerOptions) {
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  const statePushedRef = useRef(false);
  const closingFromPopRef = useRef(false);

  useEffect(() => {
    if (!isOpen) return;

    const modalId = `modal_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    // 1. Push history state if enabled so WebView goBack() closes the modal
    if (pushHistoryState && typeof window !== "undefined") {
      try {
        window.history.pushState(
          { awasioModalId: modalId, name: name || "modal" },
          ""
        );
        statePushedRef.current = true;
      } catch (err) {
        console.warn("[useModalBackHandler] pushState error:", err);
      }
    }

    // 2. Popstate listener: catches Android hardware back or swipe back
    const handlePopState = (e: PopStateEvent) => {
      if (statePushedRef.current) {
        statePushedRef.current = false;
        closingFromPopRef.current = true;
        onCloseRef.current();
        updateNativeCanGoBack();
      }
    };

    window.addEventListener("popstate", handlePopState);

    // 3. Register with our LIFO BackHandler stack (catches in-app BackButton or postMessage from Expo)
    const unregister = registerBackHandler(() => {
      if (statePushedRef.current) {
        statePushedRef.current = false;
        // Revert the pushed state in history
        try {
          window.history.back();
        } catch {}
      }
      onCloseRef.current();
      return true; // marked as handled
    });

    return () => {
      unregister();
      window.removeEventListener("popstate", handlePopState);

      // If closed programmatically (not via popstate), clean up the pushed history entry
      if (statePushedRef.current && !closingFromPopRef.current) {
        statePushedRef.current = false;
        try {
          window.history.back();
        } catch {}
      }
      closingFromPopRef.current = false;
    };
  }, [isOpen, pushHistoryState, name]);
}
