import { API_ROUTES } from "../constants/apiRoutes";
import type { ApiSuccess } from "../types/auth";

const BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:9090";

let refreshPromise: Promise<boolean> | null = null;

type RequestOptions = RequestInit & { headers?: Record<string, string> };

const resolveUrl = (url: string) => `${BASE_URL}${url}`;
const getCookieValue = (name: string): string | null => {
  if (typeof document === "undefined" || !document.cookie) return null;
  const cookies = document.cookie.split(";").map((c) => c.trim());
  const target = cookies.find((cookie) => cookie.startsWith(`${name}=`));
  return target ? decodeURIComponent(target.split("=")[1]) : null;
};

const tryRefreshSession = async (): Promise<boolean> => {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      const endpoints = [API_ROUTES.auth.refresh, API_ROUTES.auth.fallbackRefresh];
      for (const endpoint of endpoints) {
        const csrfToken = getCookieValue("csrfToken");
        const response = await fetch(resolveUrl(endpoint), {
          method: "POST",
          credentials: "include",
          headers: csrfToken ? { "x-csrf-token": csrfToken } : undefined,
        });

        if (response.ok) return true;
      }
      return false;
    })().finally(() => {
      refreshPromise = null;
    });
  }

  return refreshPromise;
};

export const apiRequest = async <T>(url: string, options: RequestOptions = {}): Promise<T> => {
  const csrfToken = getCookieValue("csrfToken");
  const response = await fetch(resolveUrl(url), {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(csrfToken ? { "x-csrf-token": csrfToken } : {}),
      ...(options.headers || {}),
    },
  });

  if (response.status === 401) {
    const refreshed = await tryRefreshSession();
    if (refreshed) {
      const retryCsrfToken = getCookieValue("csrfToken");
      const retryResponse = await fetch(resolveUrl(url), {
        ...options,
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          ...(retryCsrfToken ? { "x-csrf-token": retryCsrfToken } : {}),
          ...(options.headers || {}),
        },
      });

      if (!retryResponse.ok) {
        throw await retryResponse.json();
      }

      const retryJson = await retryResponse.json();
      return (retryJson as ApiSuccess<T>).data ?? retryJson;
    }
  }

  if (!response.ok) {
    throw await response.json();
  }

  const json = await response.json();
  return (json as ApiSuccess<T>).data ?? json;
};

export { BASE_URL };
