import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";
import { isAllowedPushEndpoint, isPushConfigured } from "@/lib/push";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
  }
  if (!isPushConfigured()) {
    return NextResponse.json({ error: "Push neconfigurat" }, { status: 503 });
  }
  const body = await request.json().catch(() => ({}));
  const { endpoint, keys } = body;
  if (!endpoint || !keys?.p256dh || !keys?.auth) {
    return NextResponse.json(
      { error: "endpoint și keys (p256dh, auth) sunt obligatorii" },
      { status: 400 }
    );
  }
  if (typeof endpoint !== "string" || !isAllowedPushEndpoint(endpoint) || typeof keys.p256dh !== "string" || typeof keys.auth !== "string") {
    return NextResponse.json({ error: "Abonament push invalid." }, { status: 400 });
  }
  const db = await getDb();
  await db.collection("push_subscriptions").updateOne(
    { endpoint },
    {
      $set: {
        userId: session.user.id,
        endpoint,
        keys: { p256dh: keys.p256dh, auth: keys.auth },
        updatedAt: new Date(),
      },
    },
    { upsert: true }
  );
  return NextResponse.json({ ok: true });
}
