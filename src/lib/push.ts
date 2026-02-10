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
 * Returnează toate abonamentele push pentru utilizatorii dați (sau toți dacă userIds e gol).
 */
export async function getSubscriptionsForUsers(userIds: string[]): Promise<PushSubscriptionDoc[]> {
  const db = await getDb();
  const filter = userIds.length > 0 ? { userId: { $in: userIds } } : {};
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
