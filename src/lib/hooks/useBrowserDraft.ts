"use client";

import { useEffect, useRef } from "react";

type Setters<T> = { [K in keyof T]: (value: T[K]) => void };

/**
 * Keeps a form's values in localStorage so a logged-out visitor can fill it, go through login / signup
 * (or get bounced there by a 401 on upload or submit) and come back with everything restored.
 * Same idea as the property listing draft. Restores once after hydration; saves on every change.
 */
export function useBrowserDraft<T extends Record<string, unknown>>(
  key: string,
  values: T,
  setters: Setters<T>,
  enabled = true,
) {
  const skipFirstSave = useRef(true);
  const json = JSON.stringify(values);

  useEffect(() => {
    if (!enabled) return;
    try {
      const raw = window.localStorage.getItem(key);
      if (!raw) return;
      const saved = JSON.parse(raw) as Partial<T>;
      for (const k of Object.keys(saved) as (keyof T)[]) {
        const v = saved[k];
        // eslint-disable-next-line react-hooks/set-state-in-effect -- browser-only draft, restored after hydration
        if (v !== undefined && setters[k]) setters[k](v as T[keyof T]);
      }
    } catch {
      /* corrupt draft: ignore */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- restore once on mount
  }, []);

  useEffect(() => {
    // The first run happens in the same commit as the restore, with the defaults: don't overwrite the draft.
    if (skipFirstSave.current) {
      skipFirstSave.current = false;
      return;
    }
    if (!enabled) return;
    try {
      window.localStorage.setItem(key, json);
    } catch {
      /* storage full / disabled */
    }
  }, [key, json, enabled]);

  return {
    /** Write now (e.g. right before redirecting to login). */
    save: () => {
      try {
        window.localStorage.setItem(key, JSON.stringify(values));
      } catch {
        /* ignore */
      }
    },
    clear: () => {
      try {
        window.localStorage.removeItem(key);
      } catch {
        /* ignore */
      }
    },
  };
}
