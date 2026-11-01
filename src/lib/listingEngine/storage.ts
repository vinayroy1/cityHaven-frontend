// localStorage shadow copy for unsaved wizard values. Every access is guarded
// (private mode / SSR / quota).

export type DraftEnvelope<T> = { values: T; step: number; updatedAt: string };

export type DraftStorage<T> = {
  load: () => DraftEnvelope<T> | null;
  persist: (values: T, step: number) => void;
  clear: () => void;
};

export function createDraftStorage<T>(
  key: string,
  opts: { sanitize?: (values: T) => T } = {},
): DraftStorage<T> {
  const ls = (): Storage | null => {
    try {
      return typeof window !== "undefined" ? window.localStorage : null;
    } catch {
      return null;
    }
  };
  return {
    load() {
      try {
        const raw = ls()?.getItem(key);
        if (!raw) return null;
        const parsed = JSON.parse(raw) as DraftEnvelope<T>;
        if (!parsed || typeof parsed !== "object" || !("values" in parsed)) return null;
        return parsed;
      } catch {
        return null;
      }
    },
    persist(values, step) {
      try {
        const clean = opts.sanitize ? opts.sanitize(values) : values;
        const env: DraftEnvelope<T> = { values: clean, step, updatedAt: new Date().toISOString() };
        ls()?.setItem(key, JSON.stringify(env));
      } catch {
        /* ignore quota / privacy errors */
      }
    },
    clear() {
      try {
        ls()?.removeItem(key);
      } catch {
        /* ignore */
      }
    },
  };
}

/** True when the local shadow is newer than the server copy. */
export function isLocalNewer(local: { updatedAt: string } | null, serverUpdatedAt?: string | null): boolean {
  if (!local) return false;
  if (!serverUpdatedAt) return true;
  return new Date(local.updatedAt).getTime() > new Date(serverUpdatedAt).getTime();
}
