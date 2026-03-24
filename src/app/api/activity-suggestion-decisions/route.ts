import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { auth } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";
import { getActiveFamily } from "@/lib/family";
import { normalizeSuggestionTitleKey } from "@/lib/suggestion-title";

async function getFamilyIdForUser(userId: string): Promise<ObjectId | null> {
  const db = await getDb();
  const user = await db.collection("users").findOne(
    { _id: new ObjectId(userId) },
    { projection: { familyId: 1 } }
  );
  const raw = (user as { familyId?: unknown })?.familyId;
  if (!raw) return null;
  try {
    return new ObjectId(String(raw));
  } catch {
    return null;
  }
}

/** Decizii accept/refuz pentru sugestiile AI (per utilizator, per zi calendaristică RO). */
export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
  }
  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date");
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: "Parametru date invalid (YYYY-MM-DD)." }, { status: 400 });
  }
  const familyId = await getFamilyIdForUser(session.user.id);
  if (!familyId) {
    return NextResponse.json({ decisions: {} as Record<string, "accepted" | "rejected"> });
  }
  const family = await getActiveFamily(await getDb(), familyId);
  if (!family) {
    return NextResponse.json({ error: "Familie inactivă." }, { status: 403 });
  }

  const db = await getDb();
  const docs = await db
    .collection("activity_suggestion_decisions")
    .find({ familyId, userId: session.user.id, date })
    .toArray();

  const decisions: Record<string, "accepted" | "rejected"> = {};
  for (const d of docs as { titleNorm?: string; status?: string }[]) {
    if (d.titleNorm && (d.status === "accepted" || d.status === "rejected")) {
      decisions[d.titleNorm] = d.status;
    }
  }
  return NextResponse.json({ decisions });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
  }
  const body = await request.json().catch(() => ({}));
  const date = typeof body.date === "string" ? body.date : "";
  const title = typeof body.title === "string" ? body.title : "";
  const status = body.status;
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: "date invalid (YYYY-MM-DD)." }, { status: 400 });
  }
  if (!title.trim()) {
    return NextResponse.json({ error: "Titlul lipsește." }, { status: 400 });
  }
  if (status !== "accepted" && status !== "rejected") {
    return NextResponse.json({ error: "status trebuie accepted sau rejected." }, { status: 400 });
  }

  const familyId = await getFamilyIdForUser(session.user.id);
  if (!familyId) {
    return NextResponse.json({ error: "Nu aveți familie." }, { status: 400 });
  }
  const family = await getActiveFamily(await getDb(), familyId);
  if (!family) {
    return NextResponse.json({ error: "Familie inactivă." }, { status: 403 });
  }

  const titleNorm = normalizeSuggestionTitleKey(title);
  const now = new Date();
  const db = await getDb();
  await db.collection("activity_suggestion_decisions").updateOne(
    { familyId, userId: session.user.id, date, titleNorm },
    {
      $set: {
        familyId,
        userId: session.user.id,
        date,
        title: title.trim(),
        titleNorm,
        status,
        updatedAt: now,
      },
      $setOnInsert: { createdAt: now },
    },
    { upsert: true }
  );

  return NextResponse.json({ ok: true });
}
