import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { auth } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";
import { getActiveFamily } from "@/lib/family";
import { logFamilyActivity } from "@/lib/activity";
import { getParentDisplayName } from "@/lib/parent-display-name";
import { MOOD_LEVEL_ORDER, type MoodLevel, type ChildMoodEntry } from "@/types/child-mood";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function clampStr(v: unknown, max = 300): string | null {
  if (typeof v !== "string") return null;
  const t = v.trim();
  if (!t) return null;
  return t.slice(0, max);
}

function toEntry(doc: {
  _id: unknown;
  childId?: unknown;
  date: string;
  mood: string;
  note?: string | null;
  loggedByUserId: string;
  loggedByParentType: string;
  createdAt: Date;
  updatedAt: Date;
}): ChildMoodEntry {
  return {
    id: String(doc._id),
    childId: doc.childId ? String(doc.childId) : undefined,
    date: doc.date,
    mood: MOOD_LEVEL_ORDER.includes(doc.mood as MoodLevel) ? (doc.mood as MoodLevel) : "neutral",
    note: doc.note ?? undefined,
    loggedByUserId: String(doc.loggedByUserId),
    loggedByParentType: doc.loggedByParentType === "tata" ? "tata" : "mama",
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
}

async function requireFamily(session: Awaited<ReturnType<typeof auth>>) {
  if (!session?.user?.id) return { error: NextResponse.json({ error: "Neautorizat" }, { status: 401 }) };
  if (!session.user.familyId) {
    return { error: NextResponse.json({ error: "Creați sau aderați la o familie mai întâi." }, { status: 400 }) };
  }
  const db = await getDb();
  const familyId = new ObjectId(session.user.familyId);
  const family = await getActiveFamily(db, familyId);
  if (!family) {
    return { error: NextResponse.json({ error: "Familia nu există sau a fost dezactivată." }, { status: 403 }) };
  }
  return { db, familyId, family };
}

/** GET: înregistrările de stare ale familiei (cele mai recente întâi). ?childId= filtrează. */
export async function GET(request: Request) {
  const session = await auth();
  const ctx = await requireFamily(session);
  if (ctx.error) return ctx.error;
  const { db, familyId } = ctx;

  const { searchParams } = new URL(request.url);
  const childId = searchParams.get("childId");
  const limit = Math.min(Math.max(Number(searchParams.get("limit")) || 30, 1), 100);

  const filter: Record<string, unknown> = { familyId };
  if (childId) filter.childId = childId;

  const docs = await db
    .collection("child_mood_entries")
    .find(filter)
    .sort({ date: -1, createdAt: -1 })
    .limit(limit)
    .toArray();

  return NextResponse.json({ entries: (docs as Parameters<typeof toEntry>[0][]).map(toEntry) });
}

/** POST: înregistrează o stare. */
export async function POST(request: Request) {
  const session = await auth();
  const ctx = await requireFamily(session);
  if (ctx.error) return ctx.error;
  const { db, familyId } = ctx;

  const loggedByParentType = session!.user!.parentType;
  if (loggedByParentType !== "tata" && loggedByParentType !== "mama") {
    return NextResponse.json(
      { error: "Setează în Configurare rolul tău (primul sau al doilea părinte)." },
      { status: 400 }
    );
  }

  const body = await request.json().catch(() => ({}));
  const mood: MoodLevel | null = MOOD_LEVEL_ORDER.includes(body.mood) ? body.mood : null;
  if (!mood) return NextResponse.json({ error: "Selectează o stare validă." }, { status: 400 });
  const date = typeof body.date === "string" && DATE_RE.test(body.date) ? body.date : new Date().toISOString().slice(0, 10);
  const childId = clampStr(body.childId, 64);

  const now = new Date();
  const { insertedId } = await db.collection("child_mood_entries").insertOne({
    familyId,
    childId: childId ?? null,
    date,
    mood,
    note: clampStr(body.note, 300),
    loggedByUserId: session!.user!.id,
    loggedByParentType,
    createdAt: now,
    updatedAt: now,
  });
  const created = await db.collection("child_mood_entries").findOne({ _id: insertedId });

  const displayName = await getParentDisplayName(db, familyId, session!.user!.id, loggedByParentType);
  await logFamilyActivity(db, familyId, session!.user!.id, displayName, "child_mood_logged", { date });
  return NextResponse.json({ entry: toEntry(created as Parameters<typeof toEntry>[0]) });
}

/** PATCH: editează o înregistrare proprie. */
export async function PATCH(request: Request) {
  const session = await auth();
  const ctx = await requireFamily(session);
  if (ctx.error) return ctx.error;
  const { db, familyId } = ctx;

  const body = await request.json().catch(() => ({}));
  const id = typeof body.id === "string" ? body.id : "";
  let oid: ObjectId;
  try {
    oid = new ObjectId(id);
  } catch {
    return NextResponse.json({ error: "ID invalid." }, { status: 400 });
  }

  const update: Record<string, unknown> = { updatedAt: new Date() };
  if ("mood" in body) {
    if (!MOOD_LEVEL_ORDER.includes(body.mood)) {
      return NextResponse.json({ error: "Stare invalidă." }, { status: 400 });
    }
    update.mood = body.mood;
  }
  if ("note" in body) update.note = clampStr(body.note, 300);

  const result = await db
    .collection("child_mood_entries")
    .updateOne({ _id: oid, familyId, loggedByUserId: session!.user!.id }, { $set: update });
  if (result.matchedCount === 0) {
    return NextResponse.json({ error: "Înregistrare negăsită sau nu îți aparține." }, { status: 404 });
  }
  const updated = await db.collection("child_mood_entries").findOne({ _id: oid, familyId });
  return NextResponse.json({ entry: toEntry(updated as Parameters<typeof toEntry>[0]) });
}

/** DELETE: șterge o înregistrare proprie. */
export async function DELETE(request: Request) {
  const session = await auth();
  const ctx = await requireFamily(session);
  if (ctx.error) return ctx.error;
  const { db, familyId } = ctx;

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id") || "";
  let oid: ObjectId;
  try {
    oid = new ObjectId(id);
  } catch {
    return NextResponse.json({ error: "ID invalid." }, { status: 400 });
  }
  const result = await db
    .collection("child_mood_entries")
    .deleteOne({ _id: oid, familyId, loggedByUserId: session!.user!.id });
  if (result.deletedCount === 0) {
    return NextResponse.json({ error: "Înregistrare negăsită sau nu îți aparține." }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
