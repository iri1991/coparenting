import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";
import { requireAdminApi, logAdminAction } from "@/lib/admin";
import { getSubscriptionsForUsers, isPushConfigured, sendPushToSubscriptions } from "@/lib/push";

/** POST { title, body }: trimite o notificare push tuturor membrilor familiei. */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdminApi();
  if (session instanceof NextResponse) return session;
  const { id } = await params;
  if (!ObjectId.isValid(id)) return NextResponse.json({ error: "ID invalid." }, { status: 400 });
  if (!isPushConfigured()) return NextResponse.json({ error: "Push nu este configurat (VAPID)." }, { status: 400 });

  const body = await request.json().catch(() => ({}));
  const title = typeof body.title === "string" ? body.title.trim().slice(0, 80) : "";
  const text = typeof body.body === "string" ? body.body.trim().slice(0, 200) : "";
  if (!title) return NextResponse.json({ error: "Titlul este obligatoriu." }, { status: 400 });

  const db = await getDb();
  const family = await db.collection("families").findOne({ _id: new ObjectId(id) }, { projection: { memberIds: 1 } });
  const memberIds = ((family as { memberIds?: string[] } | null)?.memberIds ?? []).filter(Boolean);
  if (memberIds.length === 0) return NextResponse.json({ error: "Familia nu are membri." }, { status: 400 });

  const subs = await getSubscriptionsForUsers(memberIds);
  if (subs.length === 0) return NextResponse.json({ error: "Niciun membru nu are notificările activate." }, { status: 400 });
  await sendPushToSubscriptions(subs, { title, body: text || undefined, url: "/app" });
  await logAdminAction(session, "Notificare push către familie", { type: "family", id }, { title, devices: subs.length });
  return NextResponse.json({ ok: true, devices: subs.length });
}
