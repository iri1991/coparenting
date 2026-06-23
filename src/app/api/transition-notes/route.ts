import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { auth } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";
import { getActiveFamily } from "@/lib/family";
import { logFamilyActivity } from "@/lib/activity";
import { getParentDisplayName } from "@/lib/parent-display-name";
import { sendTransitionNoteCreatedNotification } from "@/lib/notify";
import type { TransitionNote, TransitionItem, ChildMood } from "@/types/transition-note";
import type { ParentType } from "@/types/events";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const MOODS: ChildMood[] = ["happy", "calm", "tired", "upset", "sick"];

function clampStr(v: unknown, max = 500): string | null {
  if (typeof v !== "string") return null;
  const t = v.trim();
  if (!t) return null;
  return t.slice(0, max);
}

function normalizeItems(v: unknown): TransitionItem[] {
  if (!Array.isArray(v)) return [];
  const out: TransitionItem[] = [];
  for (const raw of v.slice(0, 30)) {
    const label = clampStr((raw as { label?: unknown })?.label, 80);
    if (!label) continue;
    out.push({ label, traveling: (raw as { traveling?: unknown })?.traveling !== false });
  }
  return out;
}

function toNote(doc: {
  _id: unknown;
  fromUserId: string;
  fromParentType: string;
  toParentType: string;
  date: string;
  mood?: string | null;
  moodNote?: string | null;
  sleep?: string | null;
  food?: string | null;
  activities?: string | null;
  medication?: string | null;
  generalNote?: string | null;
  items?: TransitionItem[] | null;
  createdAt: Date;
  updatedAt: Date;
}): TransitionNote {
  return {
    id: String(doc._id),
    fromUserId: String(doc.fromUserId),
    fromParentType: doc.fromParentType as ParentType,
    toParentType: doc.toParentType as ParentType,
    date: doc.date,
    mood: MOODS.includes(doc.mood as ChildMood) ? (doc.mood as ChildMood) : undefined,
    moodNote: doc.moodNote ?? undefined,
    sleep: doc.sleep ?? undefined,
    food: doc.food ?? undefined,
    activities: doc.activities ?? undefined,
    medication: doc.medication ?? undefined,
    generalNote: doc.generalNote ?? undefined,
    items: Array.isArray(doc.items) ? doc.items : [],
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

/** GET: notele de tranziție din familie. ?mine=1 doar scrise de mine; ?inbox=1 doar adresate mie. */
export async function GET(request: Request) {
  const session = await auth();
  const ctx = await requireFamily(session);
  if (ctx.error) return ctx.error;
  const { db, familyId } = ctx;

  const { searchParams } = new URL(request.url);
  const mineOnly = searchParams.get("mine") === "1";
  const inboxOnly = searchParams.get("inbox") === "1";
  const limit = Math.min(Math.max(Number(searchParams.get("limit")) || 50, 1), 100);

  const filter: Record<string, unknown> = { familyId };
  if (mineOnly) filter.fromUserId = session!.user!.id;
  if (inboxOnly && session!.user!.parentType) filter.toParentType = session!.user!.parentType;

  const docs = await db
    .collection("transition_notes")
    .find(filter)
    .sort({ date: -1, createdAt: -1 })
    .limit(limit)
    .toArray();

  return NextResponse.json({ notes: (docs as Parameters<typeof toNote>[0][]).map(toNote) });
}

/** POST: creează o notă de predare. Destinatarul = celălalt părinte. */
export async function POST(request: Request) {
  const session = await auth();
  const ctx = await requireFamily(session);
  if (ctx.error) return ctx.error;
  const { db, familyId } = ctx;

  const fromParentType = session!.user!.parentType;
  if (fromParentType !== "tata" && fromParentType !== "mama") {
    return NextResponse.json(
      { error: "Setează în Configurare rolul tău (primul sau al doilea părinte)." },
      { status: 400 }
    );
  }
  const toParentType: ParentType = fromParentType === "tata" ? "mama" : "tata";

  const body = await request.json().catch(() => ({}));
  const date = typeof body.date === "string" ? body.date.slice(0, 10) : "";
  if (!DATE_RE.test(date)) {
    return NextResponse.json({ error: "Data trebuie în format YYYY-MM-DD." }, { status: 400 });
  }
  const mood = MOODS.includes(body.mood) ? (body.mood as ChildMood) : null;

  const now = new Date();
  const doc = {
    familyId,
    fromUserId: session!.user!.id,
    fromParentType,
    toParentType,
    date,
    mood,
    moodNote: clampStr(body.moodNote),
    sleep: clampStr(body.sleep),
    food: clampStr(body.food),
    activities: clampStr(body.activities),
    medication: clampStr(body.medication),
    generalNote: clampStr(body.generalNote, 1000),
    items: normalizeItems(body.items),
    createdAt: now,
    updatedAt: now,
  };
  const { insertedId } = await db.collection("transition_notes").insertOne(doc);
  const created = await db.collection("transition_notes").findOne({ _id: insertedId });

  const displayName = await getParentDisplayName(db, familyId, session!.user!.id, fromParentType);
  await logFamilyActivity(db, familyId, session!.user!.id, displayName, "transition_note_added", { date });
  try {
    await sendTransitionNoteCreatedNotification(db, familyId, session!.user!.id, displayName, date);
  } catch {
    // notificarea nu blochează răspunsul
  }

  return NextResponse.json({ note: toNote(created as Parameters<typeof toNote>[0]) });
}

/** PATCH: editează o notă proprie. */
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
  if ("mood" in body) update.mood = MOODS.includes(body.mood) ? body.mood : null;
  if ("moodNote" in body) update.moodNote = clampStr(body.moodNote);
  if ("sleep" in body) update.sleep = clampStr(body.sleep);
  if ("food" in body) update.food = clampStr(body.food);
  if ("activities" in body) update.activities = clampStr(body.activities);
  if ("medication" in body) update.medication = clampStr(body.medication);
  if ("generalNote" in body) update.generalNote = clampStr(body.generalNote, 1000);
  if ("items" in body) update.items = normalizeItems(body.items);

  const result = await db
    .collection("transition_notes")
    .updateOne({ _id: oid, familyId, fromUserId: session!.user!.id }, { $set: update });
  if (result.matchedCount === 0) {
    return NextResponse.json({ error: "Notă negăsită sau nu îți aparține." }, { status: 404 });
  }
  const updated = await db.collection("transition_notes").findOne({ _id: oid, familyId });
  return NextResponse.json({ note: toNote(updated as Parameters<typeof toNote>[0]) });
}

/** DELETE: șterge o notă proprie. */
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
    .collection("transition_notes")
    .deleteOne({ _id: oid, familyId, fromUserId: session!.user!.id });
  if (result.deletedCount === 0) {
    return NextResponse.json({ error: "Notă negăsită sau nu îți aparține." }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
