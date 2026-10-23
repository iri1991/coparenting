import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";
import { isExpoPushToken } from "@/lib/push";

/** POST { token, platform }: înregistrează dispozitivul pentru notificări (Expo push token). */
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
  const body = await request.json().catch(() => ({}));
  const token = typeof body.token === "string" ? body.token.trim() : "";
  const platform = body.platform === "ios" || body.platform === "android" ? body.platform : "unknown";
  if (!isExpoPushToken(token)) return NextResponse.json({ error: "Token invalid." }, { status: 400 });
  const db = await getDb();
  const now = new Date();
  await db.collection("native_push_tokens").updateOne(
    { token },
    { $set: { token, userId: session.user.id, platform, updatedAt: now }, $setOnInsert: { createdAt: now } },
    { upsert: true }
  );
  return NextResponse.json({ ok: true });
}

/** DELETE { token }: la delogare, dispozitivul nu mai primește notificări. */
export async function DELETE(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
  const body = await request.json().catch(() => ({}));
  const token = typeof body.token === "string" ? body.token.trim() : "";
  if (!token) return NextResponse.json({ error: "Token lipsă." }, { status: 400 });
  const db = await getDb();
  await db.collection("native_push_tokens").deleteOne({ token, userId: session.user.id });
  return NextResponse.json({ ok: true });
}
