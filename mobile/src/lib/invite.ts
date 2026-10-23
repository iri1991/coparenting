import * as SecureStore from "expo-secure-store";

const KEY = "homesplit.pendingInvite";

/** Extrage tokenul dintr-un link de invitație (…/join?token=…) sau îl acceptă direct. */
export function parseInviteToken(input: string): string | null {
  const raw = input.trim();
  if (!raw) return null;
  const match = raw.match(/[?&]token=([^&#\s]+)/);
  const token = match ? decodeURIComponent(match[1]) : raw;
  return /^[A-Za-z0-9_-]{16,}$/.test(token) ? token : null;
}

/** Invitație deschisă înainte de conectare: o păstrăm până după login / creare cont. */
export const pendingInvite = {
  get: () => SecureStore.getItemAsync(KEY),
  set: (token: string) => SecureStore.setItemAsync(KEY, token),
  clear: () => SecureStore.deleteItemAsync(KEY),
};
