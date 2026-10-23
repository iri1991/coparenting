import * as SecureStore from "expo-secure-store";
import { API_URL } from "@/lib/config";

const TOKEN_KEY = "homesplit.token";

export async function getToken(): Promise<string | null> {
  return SecureStore.getItemAsync(TOKEN_KEY);
}

export async function setToken(token: string | null): Promise<void> {
  if (token) await SecureStore.setItemAsync(TOKEN_KEY, token);
  else await SecureStore.deleteItemAsync(TOKEN_KEY);
}

export class ApiError extends Error {
  constructor(public status: number, message: string, public code?: string) {
    super(message);
  }
}

/**
 * Limitele de plan se afișează neutru în aplicație: fără îndemn la upgrade sau cumpărare în afara
 * store-ului (regulile App Store / Google Play). Abonamentele se gestionează pe site.
 */
export const PLAN_LIMIT_MESSAGE = "Această funcție nu este inclusă în planul actual al familiei.";

/** Ascultător pentru 401 (sesiune expirată / invalidată) — setat de SessionProvider. */
let onUnauthorized: (() => void) | null = null;
export function setUnauthorizedHandler(handler: (() => void) | null) {
  onUnauthorized = handler;
}

/** Cerere către API-ul HomeSplit, cu tokenul aplicației în `Authorization: Bearer`. */
export async function api<T>(path: string, init: { method?: string; body?: unknown } = {}): Promise<T> {
  const token = await getToken();
  const res = await fetch(`${API_URL}${path}`, {
    method: init.method ?? "GET",
    headers: {
      Accept: "application/json",
      ...(init.body !== undefined ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: init.body !== undefined ? JSON.stringify(init.body) : undefined,
  });
  const data = (await res.json().catch(() => ({}))) as T & { error?: string };
  if (!res.ok) {
    if (res.status === 401 && token) onUnauthorized?.();
    const code = (data as { code?: string }).code;
    const message = code === "plan_limit" ? PLAN_LIMIT_MESSAGE : (data as { error?: string }).error || "A apărut o eroare. Încearcă din nou.";
    throw new ApiError(res.status, message, code);
  }
  return data;
}
