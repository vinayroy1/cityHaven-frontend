"use client";

import { useEffect } from "react";
import { ThemeProvider } from "next-themes";
import type { PropsWithChildren } from "react";
import { StoreProvider } from "@/store/Providers";
import { requestLocationPermissionOnce } from "@/lib/permissions";

export function Providers({ children }: PropsWithChildren) {
  useEffect(() => {
    void requestLocationPermissionOnce({ storageKey: "globalLocationPermissionAsked" });
  }, []);

  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <StoreProvider>{children}</StoreProvider>
    </ThemeProvider>
  );
}
