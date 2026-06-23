import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { auth } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";
import { getActiveFamily } from "@/lib/family";
import { logFamilyActivity } from "@/lib/activity";
import { getParentDisplayName } from "@/lib/parent-display-name";
import { sendGuideUpdatedNotification } from "@/lib/notify";
import { GUIDE_CATEGORY_ORDER, type GuideCategory, type GuideEntry } from "@/types/parenting-guide";

function clampStr(v: unknown, max = 200): string | null {
  if (typeof v !== "string") return null;
  const t = v.trim();
  if (!t) return null;
  return t.slice(0, max);
}

function toEntry(doc: {
  _id: unknown;
  category: string;
  title: string;
  detail?: string | null;
  createdByUserId: string;
  order?: number;
  createdAt: Date;
  updatedAt: Date;
}): GuideEntry {
  return {
    id: String(doc._id),
    category: GUIDE_CATEGORY_ORDER.includes(doc.category as GuideCategory)
      ? (doc.category as GuideCategory)
      : "other",
    title: doc.title,
    detail: doc.detail ?? undefined,
    createdByUserId: String(doc.createdByUserId),
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

/** GET: toate regulile familiei (după categorie, apoi ordine). */
export async function GET() {
  const session = await auth();
  const ctx = await requireFamily(session);
  if (ctx.error) return ctx.error;
  const { db, familyId } = ctx;

  const docs = await db
    .collection("parenting_guide")
    .find({ familyId })
    .sort({ order: 1, createdAt: 1 })
    .toArray();

  return NextResponse.json({ entries: (docs as Parameters<typeof toEntry>[0][]).map(toEntry) });
}

/** POST: adaugă o regulă. Editabilă apoi de oricare părinte. */
export async function POST(request: Request) {
  const session = await auth();
  const ctx = await requireFamily(session);
  if (ctx.error) return ctx.error;
  const { db, familyId } = ctx;

  const body = await request.json().catch(() => ({}));
  const title = clampStr(body.title, 200);
  if (!title) return NextResponse.json({ error: "Textul regulii este obligatoriu." }, { status: 400 });
  const category: GuideCategory = GUIDE_CATEGORY_ORDER.includes(body.category) ? body.category : "other";

  const maxDoc = await db
    .collection("parenting_guide")
    .find({ familyId })
    .sort({ order: -1 })
    .limit(1)
    .toArray();
  const nextOrder = Number((maxDoc[0] as { order?: number } | undefined)?.order ?? -1) + 1;

  const now = new Date();
  const { insertedId } = await db.collection("parenting_guide").insertOne({
    familyId,
    category,
    title,
    detail: clampStr(body.detail, 500),
    createdByUserId: session!.user!.id,
    order: nextOrder,
    createdAt: now,
    updatedAt: now,
  });
  const created = await db.collection("parenting_guide").findOne({ _id: insertedId });

  const displayName = await getParentDisplayName(db, familyId, session!.user!.id, session!.user!.parentType ?? undefined);
  await logFamilyActivity(db, familyId, session!.user!.id, displayName, "parenting_guide_updated", { label: title });
  try {
    await sendGuideUpdatedNotification(db, familyId, session!.user!.id, displayName, title);
  } catch {
    // notificarea nu blochează răspunsul
  }
  return NextResponse.json({ entry: toEntry(created as Parameters<typeof toEntry>[0]) });
}

/** PATCH: editează o regulă (oricare membru al familiei). */
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
    const t = clampStr(body.title, 200);
    if (!t) return NextResponse.json({ error: "Textul regulii nu poate fi gol." }, { status: 400 });
    update.title = t;
  }
  if ("category" in body) {
    update.category = GUIDE_CATEGORY_ORDER.includes(body.category) ? body.category : "other";
  }
  if ("detail" in body) update.detail = clampStr(body.detail, 500);

  const result = await db.collection("parenting_guide").updateOne({ _id: oid, familyId }, { $set: update });
  if (result.matchedCount === 0) {
    return NextResponse.json({ error: "Regulă negăsită." }, { status: 404 });
  }
  const updated = await db.collection("parenting_guide").findOne({ _id: oid, familyId });
  return NextResponse.json({ entry: toEntry(updated as Parameters<typeof toEntry>[0]) });
}

/** DELETE: șterge o regulă (oricare membru al familiei). */
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
  const result = await db.collection("parenting_guide").deleteOne({ _id: oid, familyId });
  if (result.deletedCount === 0) {
    return NextResponse.json({ error: "Regulă negăsită." }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
