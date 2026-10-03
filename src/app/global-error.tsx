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
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-6 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
        <div className="max-w-md text-center">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Something went wrong
          </h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            An unexpected error has been captured and reported to our engineering team.
          </p>
          <button
            type="button"
            onClick={() => reset()}
            className="mt-6 inline-flex items-center rounded-xl bg-rose-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-rose-700"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
