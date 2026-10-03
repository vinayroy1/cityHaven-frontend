import { APP_CONFIG } from "@/constants/app-config";

type FetchParams = {
  url: string;
  params?: Record<string, any>;
  init?: RequestInit;
};

// Basic fetcher that attaches bearer token if present and returns unwrapped data
export async function apiFetch<T = any>({ url, params, init }: FetchParams): Promise<T> {
  const search = params
    ? Object.entries(params).reduce((acc, [key, value]) => {
        if (value === undefined || value === null || value === "") return acc;
        acc.append(key, String(value));
        return acc;
      }, new URLSearchParams())
    : null;

  const token = typeof window !== "undefined" ? localStorage.getItem(APP_CONFIG.AUTH.TOKEN_KEY) : null;
  const res = await fetch(search ? `${url}?${search.toString()}` : url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers ?? {}),
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Request failed with status ${res.status}`);
  }

  const json = await res.json();
  return (json?.data as T) ?? (json as T);
}
