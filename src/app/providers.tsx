"use client";

import { useEffect, useState } from "react";
import { ThemeProvider } from "next-themes";
import type { PropsWithChildren } from "react";
import { StoreProvider } from "@/store/Providers";
import { requestLocationPermissionOnce } from "@/lib/permissions";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { Toaster } from "@/components/ui/sonner";
import { NavigationBridgeProvider } from "@/components/navigation/NavigationBridgeProvider";

export function Providers({ children }: PropsWithChildren) {
  const [queryClient] = useState(() => new QueryClient());

  useEffect(() => {
    void requestLocationPermissionOnce({ storageKey: "globalLocationPermissionAsked" });
  }, []);

  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <QueryClientProvider client={queryClient}>
        <StoreProvider>
          <NavigationBridgeProvider>
            {children}
            <Toaster position="top-center" richColors closeButton duration={4000} />
          </NavigationBridgeProvider>
        </StoreProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
