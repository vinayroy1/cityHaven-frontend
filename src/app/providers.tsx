"use client";

import { useEffect, useState } from "react";
import { ThemeProvider } from "next-themes";
import type { PropsWithChildren } from "react";
import { StoreProvider } from "@/store/Providers";
import { requestLocationPermissionOnce } from "@/lib/permissions";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

export function Providers({ children }: PropsWithChildren) {
  const [queryClient] = useState(() => new QueryClient());

  useEffect(() => {
    void requestLocationPermissionOnce({ storageKey: "globalLocationPermissionAsked" });
  }, []);

  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <QueryClientProvider client={queryClient}>
        <StoreProvider>{children}</StoreProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
