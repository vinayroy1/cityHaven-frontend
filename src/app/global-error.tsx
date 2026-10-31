"use client";

import * as Sentry from "@sentry/nextjs";
import React, { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Next.js Global Root Error]:", error);
    try {
      Sentry.captureException(error);
    } catch {
      // ignore
    }

    // Auto-recover from ChunkLoadError when a new production build replaced JS hashes
    const isChunkError =
      error?.name === "ChunkLoadError" ||
      error?.message?.includes("Loading chunk") ||
      error?.message?.includes("failed to fetch dynamically imported module");

    if (isChunkError && typeof window !== "undefined") {
      const hasReloaded = sessionStorage.getItem("awasio_global_chunk_reload_lock");
      if (!hasReloaded) {
        sessionStorage.setItem("awasio_global_chunk_reload_lock", "true");
        window.location.reload();
      }
    }
  }, [error]);

  const handleRetry = () => {
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("awasio_global_chunk_reload_lock");
      // If reset fails or error is persistent, reload window
      try {
        reset();
      } catch {
        window.location.reload();
      }
    }
  };

  const handleGoHome = () => {
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("awasio_global_chunk_reload_lock");
      window.location.href = "/";
    }
  };

  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-6 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
        <div className="max-w-md text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-xl">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-4 text-2xl font-bold">
            !
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Something went wrong
          </h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            An unexpected error has been captured and reported to our engineering team.
          </p>

          {process.env.NODE_ENV !== "production" && error?.message && (
            <div className="mt-4 p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-left text-xs font-mono text-rose-600 dark:text-rose-400 overflow-x-auto max-h-32">
              {error.message}
            </div>
          )}

          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              onClick={handleRetry}
              className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl bg-rose-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-rose-700 cursor-pointer"
            >
              Try again
            </button>
            <button
              type="button"
              onClick={handleGoHome}
              className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-5 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-300 transition hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
            >
              Reload Page
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
