import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { requireAdminApi, logAdminAction } from "@/lib/admin";
import { getSubscriptionsForUsers, isPushConfigured, sendPushToSubscriptions } from "@/lib/push";

const SEGMENTS = ["all", "free", "paid", "active30", "inactive30", "noFamily"] as const;
type Segment = (typeof SEGMENTS)[number];

async function userIdsForSegment(segment: Segment): Promise<string[]> {
  const db = await getDb();
  const d30 = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  let filter: Record<string, unknown> = {};
  if (segment === "active30") filter = { lastActiveAt: { $gte: d30 } };
  if (segment === "inactive30") filter = { $or: [{ lastActiveAt: { $lt: d30 } }, { lastActiveAt: { $exists: false } }] };
  if (segment === "noFamily") filter = { familyId: null };
  if (segment === "free" || segment === "paid") {
    const plans = segment === "paid" ? ["pro", "family"] : [];
    const famFilter = segment === "paid" ? { plan: { $in: plans }, active: { $ne: false } } : { plan: { $nin: ["pro", "family"] }, active: { $ne: false } };
    const famIds = await db.collection("families").distinct("_id", famFilter);
    filter = { familyId: { $in: famIds } };
  }
  const users = await db.collection("users").find(filter).project({ _id: 1 }).toArray();
  return users.map((u) => String(u._id));
}

/**
 * POST { segment, title, body, url, dryRun }
 * dryRun=true întoarce doar numărul de utilizatori/dispozitive vizate.
 */
export async function POST(request: Request) {
  const session = await requireAdminApi();
  if (session instanceof NextResponse) return session;
  const body = await request.json().catch(() => ({}));
  const segment = body.segment as Segment;
  if (!SEGMENTS.includes(segment)) return NextResponse.json({ error: "Segment invalid." }, { status: 400 });

  const userIds = await userIdsForSegment(segment);
  // Atenție: getSubscriptionsForUsers([]) întoarce TOATE abonamentele, deci verificăm explicit.
  const subs = userIds.length > 0 ? await getSubscriptionsForUsers(userIds) : [];
  const reachedUsers = new Set(subs.map((s) => s.userId)).size;

  if (body.dryRun) {
    return NextResponse.json({ ok: true, users: userIds.length, reachedUsers, devices: subs.length });
  }

  if (!isPushConfigured()) return NextResponse.json({ error: "Push nu este configurat (VAPID)." }, { status: 400 });
  const title = typeof body.title === "string" ? body.title.trim().slice(0, 80) : "";
  const text = typeof body.body === "string" ? body.body.trim().slice(0, 200) : "";
  const url = typeof body.url === "string" && body.url.startsWith("/") ? body.url : "/app";
  if (!title) return NextResponse.json({ error: "Titlul este obligatoriu." }, { status: 400 });
  if (subs.length === 0) return NextResponse.json({ error: "Niciun dispozitiv în acest segment." }, { status: 400 });

  await sendPushToSubscriptions(subs, { title, body: text || undefined, url });
  await logAdminAction(session, "Notificare push în masă", { type: "system" }, { segment, title, url, reachedUsers, devices: subs.length });
  return NextResponse.json({ ok: true, users: userIds.length, reachedUsers, devices: subs.length });
}
