import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { auth } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";
import { getActiveFamily } from "@/lib/family";
import { logFamilyActivity } from "@/lib/activity";
import { getParentDisplayName } from "@/lib/parent-display-name";
import { sendSpecialDayAddedNotification } from "@/lib/notify";
import { SPECIAL_DAY_EMOJIS, type SpecialDay, type SpecialDayAssignment, type SpecialDayRecurrence } from "@/types/special-day";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const ASSIGNMENTS: SpecialDayAssignment[] = ["tata", "mama", "together", "alternate"];

function clampStr(v: unknown, max = 150): string | null {
  if (typeof v !== "string") return null;
  const t = v.trim();
  if (!t) return null;
  return t.slice(0, max);
}

function toDay(doc: {
  _id: unknown;
  title: string;
  emoji?: string;
  recurrence: string;
  month?: number | null;
  day?: number | null;
  date?: string | null;
  assignment: string;
  alternateAnchorYear?: number | null;
  alternateAnchorParent?: string | null;
  note?: string | null;
  order?: number;
  createdAt: Date;
  updatedAt: Date;
}): SpecialDay {
  return {
    id: String(doc._id),
    title: doc.title,
    emoji: typeof doc.emoji === "string" && doc.emoji ? doc.emoji : "🗓️",
    recurrence: doc.recurrence === "oneoff" ? "oneoff" : "annual",
    month: typeof doc.month === "number" ? doc.month : undefined,
    day: typeof doc.day === "number" ? doc.day : undefined,
    date: doc.date ?? undefined,
    assignment: ASSIGNMENTS.includes(doc.assignment as SpecialDayAssignment)
      ? (doc.assignment as SpecialDayAssignment)
      : "together",
    alternateAnchorYear: typeof doc.alternateAnchorYear === "number" ? doc.alternateAnchorYear : undefined,
    alternateAnchorParent:
      doc.alternateAnchorParent === "tata" || doc.alternateAnchorParent === "mama"
        ? doc.alternateAnchorParent
        : undefined,
    note: doc.note ?? undefined,
    order: Number.isFinite(doc.order) ? Number(doc.order) : 0,
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

/** Validează și normalizează câmpurile de recurență/dată; întoarce un set de update sau o eroare. */
function buildScheduleFields(body: Record<string, unknown>): { fields: Record<string, unknown> } | { error: string } {
  const recurrence: SpecialDayRecurrence = body.recurrence === "oneoff" ? "oneoff" : "annual";
  if (recurrence === "oneoff") {
    const date = typeof body.date === "string" && DATE_RE.test(body.date) ? body.date : null;
    if (!date) return { error: "Dată invalidă (YYYY-MM-DD)." };
    return { fields: { recurrence, date, month: null, day: null } };
  }
  const month = Number(body.month);
  const day = Number(body.day);
  if (!Number.isInteger(month) || month < 1 || month > 12) return { error: "Lună invalidă (1–12)." };
  if (!Number.isInteger(day) || day < 1 || day > 31) return { error: "Zi invalidă (1–31)." };
  return { fields: { recurrence, month, day, date: null } };
}

/** GET: zilele speciale ale familiei. */
export async function GET() {
  const session = await auth();
  const ctx = await requireFamily(session);
  if (ctx.error) return ctx.error;
  const { db, familyId } = ctx;

  const docs = await db
    .collection("special_days")
    .find({ familyId })
    .sort({ order: 1, createdAt: 1 })
    .toArray();
  return NextResponse.json({ days: (docs as Parameters<typeof toDay>[0][]).map(toDay) });
}

/** POST: adaugă o zi specială. */
export async function POST(request: Request) {
  const session = await auth();
  const ctx = await requireFamily(session);
  if (ctx.error) return ctx.error;
  const { db, familyId } = ctx;

  const body = await request.json().catch(() => ({}));
  const title = clampStr(body.title, 150);
  if (!title) return NextResponse.json({ error: "Titlul zilei speciale este obligatoriu." }, { status: 400 });

  const sched = buildScheduleFields(body);
  if ("error" in sched) return NextResponse.json({ error: sched.error }, { status: 400 });

  const assignment: SpecialDayAssignment = ASSIGNMENTS.includes(body.assignment) ? body.assignment : "together";
  const emoji = typeof body.emoji === "string" && SPECIAL_DAY_EMOJIS.includes(body.emoji) ? body.emoji : "🗓️";

  const alternateAnchorYear =
    assignment === "alternate"
      ? Number.isInteger(body.alternateAnchorYear)
        ? Number(body.alternateAnchorYear)
        : new Date().getFullYear()
      : null;
  const alternateAnchorParent =
    assignment === "alternate"
      ? body.alternateAnchorParent === "mama"
        ? "mama"
        : "tata"
      : null;

  const maxDoc = await db.collection("special_days").find({ familyId }).sort({ order: -1 }).limit(1).toArray();
  const nextOrder = Number((maxDoc[0] as { order?: number } | undefined)?.order ?? -1) + 1;

  const now = new Date();
  const { insertedId } = await db.collection("special_days").insertOne({
    familyId,
    title,
    emoji,
    ...sched.fields,
    assignment,
    alternateAnchorYear,
    alternateAnchorParent,
    note: clampStr(body.note, 500),
    order: nextOrder,
    createdAt: now,
    updatedAt: now,
  });
  const created = await db.collection("special_days").findOne({ _id: insertedId });

  const displayName = await getParentDisplayName(db, familyId, session!.user!.id, session!.user!.parentType ?? undefined);
  await logFamilyActivity(db, familyId, session!.user!.id, displayName, "special_day_added", { label: title });
  try {
    await sendSpecialDayAddedNotification(db, familyId, session!.user!.id, displayName, title);
  } catch {
    // notificarea nu blochează răspunsul
  }
  return NextResponse.json({ day: toDay(created as Parameters<typeof toDay>[0]) });
}

/** PATCH: editează o zi specială. */
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
  if ("title" in body) {
    const t = clampStr(body.title, 150);
    if (!t) return NextResponse.json({ error: "Titlul nu poate fi gol." }, { status: 400 });
    update.title = t;
  }
  if ("emoji" in body && typeof body.emoji === "string" && SPECIAL_DAY_EMOJIS.includes(body.emoji)) {
    update.emoji = body.emoji;
  }
  if ("recurrence" in body || "month" in body || "day" in body || "date" in body) {
    const sched = buildScheduleFields(body);
    if ("error" in sched) return NextResponse.json({ error: sched.error }, { status: 400 });
    Object.assign(update, sched.fields);
  }
  if ("assignment" in body && ASSIGNMENTS.includes(body.assignment)) {
    update.assignment = body.assignment;
    if (body.assignment === "alternate") {
      update.alternateAnchorYear = Number.isInteger(body.alternateAnchorYear)
        ? Number(body.alternateAnchorYear)
        : new Date().getFullYear();
      update.alternateAnchorParent = body.alternateAnchorParent === "mama" ? "mama" : "tata";
    } else {
      update.alternateAnchorYear = null;
      update.alternateAnchorParent = null;
    }
  }
  if ("note" in body) update.note = clampStr(body.note, 500);

  const result = await db.collection("special_days").updateOne({ _id: oid, familyId }, { $set: update });
  if (result.matchedCount === 0) {
    return NextResponse.json({ error: "Zi specială negăsită." }, { status: 404 });
  }
  const updated = await db.collection("special_days").findOne({ _id: oid, familyId });
  return NextResponse.json({ day: toDay(updated as Parameters<typeof toDay>[0]) });
}

/** DELETE: șterge o zi specială. */
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
  const result = await db.collection("special_days").deleteOne({ _id: oid, familyId });
  if (result.deletedCount === 0) {
    return NextResponse.json({ error: "Zi specială negăsită." }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
