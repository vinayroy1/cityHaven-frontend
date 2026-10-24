import { APP_CONFIG } from "@/constants/app-config";

type FetchParams = {
  url: string;
  params?: Record<string, any>;
  init?: RequestInit;
};

export function resolveClientUrl(rawUrl: string): string {
  if (typeof window === "undefined") return rawUrl;
  try {
    const currentHost = window.location.hostname;
    const parsed = new URL(rawUrl, window.location.origin);
    // When running in the browser on localhost or 127.0.0.1, guarantee that API calls target the local backend on port 4000
    if (currentHost === "localhost" || currentHost === "127.0.0.1") {
      if (parsed.hostname !== "localhost" && parsed.hostname !== "127.0.0.1") {
        parsed.protocol = "http:";
        parsed.hostname = "localhost";
        parsed.port = "4000";
        return parsed.toString();
      }
    } else if (currentHost) {
      if (parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1" || parsed.hostname.includes("onrender.com")) {
        parsed.hostname = currentHost;
        parsed.protocol = window.location.protocol;
        parsed.port = window.location.port;
        return parsed.toString();
      }
    }
  } catch {
    // fallback
  }
  return rawUrl;
}

// Basic fetcher that attaches bearer token if present and returns unwrapped data
export async function apiFetch<T = any>({ url, params, init }: FetchParams): Promise<T> {
  const search = params
    ? Object.entries(params).reduce((acc, [key, value]) => {
        if (value === undefined || value === null || value === "") return acc;
        acc.append(key, String(value));
        return acc;
      }, new URLSearchParams())
    : null;

  const targetUrl = resolveClientUrl(url);
  const token = typeof window !== "undefined" ? localStorage.getItem(APP_CONFIG.AUTH.TOKEN_KEY) : null;
  const res = await fetch(search ? `${targetUrl}?${search.toString()}` : targetUrl, {
    credentials: "include",
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
