"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { AlertCircle, RotateCcw, Home } from "lucide-react";
import * as Sentry from "@sentry/nextjs";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error cleanly for developers and debugging
    console.error("[App Root ErrorBoundary caught]:", error);
    try {
      Sentry.captureException(error);
    } catch {
      // ignore
    }

    // Auto-recover from ChunkLoadError when a new deployment has replaced hashed JS chunks
    const isChunkError =
      error?.name === "ChunkLoadError" ||
      error?.message?.includes("Loading chunk") ||
      error?.message?.includes("failed to fetch dynamically imported module");

    if (isChunkError && typeof window !== "undefined") {
      const hasReloaded = sessionStorage.getItem("awasio_chunk_reload_lock");
      if (!hasReloaded) {
        sessionStorage.setItem("awasio_chunk_reload_lock", "true");
        window.location.reload();
      }
    }
  }, [error]);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 py-12 text-center bg-white dark:bg-slate-950">
      <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-xl">
        <div className="w-12 h-12 mx-auto rounded-2xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-4">
          <AlertCircle className="w-6 h-6" />
        </div>

        <h1 className="text-xl font-bold text-slate-900 dark:text-white">
          Something went wrong
        </h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
          We encountered an unexpected error while loading this page. Our engineering team has been notified.
        </p>

        {process.env.NODE_ENV !== "production" && error?.message && (
          <div className="mt-4 p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-left text-xs font-mono text-rose-600 dark:text-rose-400 overflow-x-auto max-h-32">
            {error.message}
          </div>
        )}

        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => {
              if (typeof window !== "undefined") {
                sessionStorage.removeItem("awasio_chunk_reload_lock");
              }
              reset();
            }}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-rose-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-rose-700 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            Try again
          </button>
          <Link
            href="/"
            onClick={() => {
              if (typeof window !== "undefined") {
                sessionStorage.removeItem("awasio_chunk_reload_lock");
              }
            }}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-5 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-300 transition hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
          >
            <Home className="w-4 h-4" />
            Go to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
}

