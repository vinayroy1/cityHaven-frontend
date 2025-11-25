"use client";

import { ThemeProvider } from "next-themes";
import type { PropsWithChildren } from "react";
import { StoreProvider } from "@/store/Providers";

export function Providers({ children }: PropsWithChildren) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <StoreProvider>{children}</StoreProvider>
    </ThemeProvider>
  );
}
