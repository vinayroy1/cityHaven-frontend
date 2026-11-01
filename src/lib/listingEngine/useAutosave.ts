"use client";

// Debounced per-section autosave for a react-hook-form instance.
// - Any named value change marks the *current* section dirty and (re)starts the debounce.
// - `flush()` saves every dirty section immediately (call it before changing step / leaving).
// - Failures keep the section dirty; it retries on the next change, on `online`, or on flush.

import { useCallback, useEffect, useRef, useState } from "react";
import type { FieldValues, UseFormReturn } from "react-hook-form";

export type AutosaveStatus = "idle" | "pending" | "saving" | "saved" | "error" | "offline";

export type UseAutosaveOptions<V extends FieldValues> = {
  form: UseFormReturn<V>;
  /** section that edits are attributed to (usually the current step id). */
  sectionKey: string;
  save: (sectionKey: string, values: V) => Promise<void>;
  debounceMs?: number;
  /** false pauses autosave (e.g. while server data is loading or a draft is being restored). */
  enabled?: boolean;
  /** optional hook after each change (e.g. persist a local shadow copy). */
  onChange?: (values: V) => void;
};

export type UseAutosaveResult = {
  status: AutosaveStatus;
  lastSavedAt: Date | null;
  error: string | null;
  /** sections with unsaved edits. */
  dirtySections: string[];
  /** save all dirty sections now. Resolves true when everything saved. */
  flush: () => Promise<boolean>;
  /** mark a section dirty without a form change (e.g. after restoring a draft). */
  markDirty: (sectionKey?: string) => void;
};

const isOffline = () => typeof navigator !== "undefined" && navigator.onLine === false;

export function useAutosave<V extends FieldValues>({
  form,
  sectionKey,
  save,
  debounceMs = 1200,
  enabled = true,
  onChange,
}: UseAutosaveOptions<V>): UseAutosaveResult {
  const [status, setStatus] = useState<AutosaveStatus>("idle");
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dirtySections, setDirtySections] = useState<string[]>([]);

  const dirty = useRef<Set<string>>(new Set());
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inFlight = useRef<Promise<boolean> | null>(null);
  const sectionRef = useRef(sectionKey);
  const saveRef = useRef(save);
  const onChangeRef = useRef(onChange);
  const enabledRef = useRef(enabled);
  sectionRef.current = sectionKey;
  saveRef.current = save;
  onChangeRef.current = onChange;
  enabledRef.current = enabled;

  const syncDirty = () => setDirtySections(Array.from(dirty.current));

  const clearTimer = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
  };

  const runSave = useCallback(async (): Promise<boolean> => {
    clearTimer();
    if (inFlight.current) {
      await inFlight.current;
    }
    if (!dirty.current.size) return true;
    if (isOffline()) {
      setStatus("offline");
      return false;
    }
    const keys = Array.from(dirty.current);
    dirty.current.clear();
    syncDirty();
    setStatus("saving");
    const job = (async () => {
      const failed: string[] = [];
      let lastErr: string | null = null;
      for (const key of keys) {
        try {
          await saveRef.current(key, form.getValues());
        } catch (e) {
          failed.push(key);
          lastErr = e instanceof Error ? e.message : "Could not save";
        }
      }
      failed.forEach((k) => dirty.current.add(k));
      syncDirty();
      if (failed.length) {
        setError(lastErr);
        setStatus(isOffline() ? "offline" : "error");
        return false;
      }
      setError(null);
      setLastSavedAt(new Date());
      // edits that arrived while saving keep the pill on "pending"
      setStatus(dirty.current.size ? "pending" : "saved");
      return true;
    })();
    inFlight.current = job;
    try {
      return await job;
    } finally {
      inFlight.current = null;
    }
  }, [form]);

  const schedule = useCallback(() => {
    clearTimer();
    timer.current = setTimeout(() => {
      void runSave();
    }, debounceMs);
  }, [debounceMs, runSave]);

  const markDirty = useCallback(
    (key?: string) => {
      dirty.current.add(key ?? sectionRef.current);
      syncDirty();
      setStatus("pending");
      if (enabledRef.current) schedule();
    },
    [schedule],
  );

  useEffect(() => {
    const sub = form.watch((values, info) => {
      if (!info?.name) return; // reset() / programmatic bulk loads
      // while paused (e.g. resume banner open) still record the edit; it saves once enabled
      if (enabledRef.current) onChangeRef.current?.(values as V);
      markDirty();
    });
    return () => sub.unsubscribe();
  }, [form, markDirty]);

  // resume when the browser comes back online
  useEffect(() => {
    const onOnline = () => {
      if (dirty.current.size) void runSave();
    };
    window.addEventListener("online", onOnline);
    return () => window.removeEventListener("online", onOnline);
  }, [runSave]);

  // enabling with pending edits schedules a save
  useEffect(() => {
    if (enabled && dirty.current.size) schedule();
  }, [enabled, schedule]);

  useEffect(() => () => clearTimer(), []);

  const flush = useCallback(() => runSave(), [runSave]);

  return { status, lastSavedAt, error, dirtySections, flush, markDirty };
}
