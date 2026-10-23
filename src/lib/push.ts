import webpush from "web-push";
import { getDb } from "@/lib/mongodb";

// Trim chei din .env – newline/space cauzează 403 BadJwtToken la Apple (Safari/iOS)
const vapidPublic = process.env.VAPID_PUBLIC_KEY?.trim();
const vapidPrivate = process.env.VAPID_PRIVATE_KEY?.trim();
const vapidMailto = process.env.VAPID_MAILTO?.trim() || "mailto:support@example.com";

if (vapidPublic && vapidPrivate) {
  webpush.setVapidDetails(vapidMailto, vapidPublic, vapidPrivate);
}

export interface PushSubscriptionDoc {
  userId: string;
  endpoint: string;
  keys: { p256dh: string; auth: string };
  createdAt: Date;
}

export function isPushConfigured(): boolean {
  return Boolean(vapidPublic && vapidPrivate);
}

export function getVapidPublicKey(): string | null {
  return vapidPublic ?? null;
}

/**
 * Trimite o notificare push la toate abonamentele din lista dată.
 * Elimină din DB abonamentele care returnează 410 Gone sau 404.
 */
export async function sendPushToSubscriptions(
  subscriptions: PushSubscriptionDoc[],
  payload: { title: string; body?: string; url?: string }
): Promise<void> {
  const payloadStr = JSON.stringify(payload);
  const db = await getDb();
  const col = db.collection("push_subscriptions");

  for (const sub of subscriptions) {
    if (!isAllowedPushEndpoint(sub.endpoint)) {
      await col.deleteOne({ endpoint: sub.endpoint });
      continue;
    }
    try {
      await webpush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: { p256dh: sub.keys.p256dh, auth: sub.keys.auth },
        },
        payloadStr,
        { TTL: 86400 }
      );
    } catch (e: unknown) {
      const status = e && typeof e === "object" && "statusCode" in e ? (e as { statusCode: number }).statusCode : 0;
      const body = e && typeof e === "object" && "body" in e ? String((e as { body: unknown }).body) : "";
      const isVapidMismatch = status === 400 && body.includes("VapidPkHashMismatch");
      if (status === 410 || status === 404 || isVapidMismatch) {
        await col.deleteOne({ endpoint: sub.endpoint });
        if (isVapidMismatch) {
          console.warn("[push] Abonament invalid (VAPID schimbat), șters. Reabonează-te din app.", sub.endpoint);
        }
      } else {
        console.error("[push] sendNotification failed", sub.endpoint, e);
      }
    }
  }
}

/**
 * Host-urile serviciilor push ale browserelor. Serverul face POST către endpoint-ul abonamentului,
 * deci acceptăm doar aceste servicii (altfel un utilizator ar putea face serverul să trimită cereri
 * către adrese interne — SSRF).
 */
const PUSH_HOST_SUFFIXES = [
  "fcm.googleapis.com",
  "android.googleapis.com",
  "push.apple.com",
  "push.services.mozilla.com",
  "notify.windows.com",
];

export function isAllowedPushEndpoint(endpoint: string): boolean {
  try {
    const url = new URL(endpoint);
    if (url.protocol !== "https:") return false;
    const host = url.hostname.toLowerCase();
    return PUSH_HOST_SUFFIXES.some((suffix) => host === suffix || host.endsWith(`.${suffix}`));
  } catch {
    return false;
  }
}

/**
 * Returnează abonamentele push ale utilizatorilor dați. Listă goală → niciun abonament
 * (nu „toate”), ca o listă de destinatari goală să nu trimită accidental tuturor.
 */
export async function getSubscriptionsForUsers(userIds: string[]): Promise<PushSubscriptionDoc[]> {
  if (userIds.length === 0) return [];
  const db = await getDb();
  const filter = { userId: { $in: userIds } };
  const docs = await db
    .collection("push_subscriptions")
    .find(filter)
    .toArray();
  return docs.map((d) => ({
    userId: String(d.userId),
    endpoint: String(d.endpoint),
    keys: { p256dh: String(d.keys?.p256dh), auth: String(d.keys?.auth) },
    createdAt: d.createdAt instanceof Date ? d.createdAt : new Date(d.createdAt),
  }));
}
