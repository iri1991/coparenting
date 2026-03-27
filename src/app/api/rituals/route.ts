import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { auth } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";
import { getActiveFamily } from "@/lib/family";
import type { FamilyRitual, RitualResponsibleParent } from "@/types/ritual";

type FamilyContext =
  | { db: Awaited<ReturnType<typeof getDb>>; familyId: ObjectId }
  | { db: Awaited<ReturnType<typeof getDb>>; familyId: null };

async function getFamilyContext(userId: string): Promise<FamilyContext> {
  const db = await getDb();
  const user = await db.collection("users").findOne(
    { _id: new ObjectId(userId) },
    { projection: { familyId: 1 } }
  );
  const raw = (user as { familyId?: unknown })?.familyId;
  if (!raw) return { db, familyId: null };
  let familyId: ObjectId;
  try {
    familyId = new ObjectId(String(raw));
  } catch {
    return { db, familyId: null };
  }
  const family = await getActiveFamily(db, familyId);
  if (!family) return { db, familyId: null };
  const memberIds = (family.memberIds ?? []).map(String);
  if (!memberIds.includes(userId)) return { db, familyId: null };
  return { db, familyId };
}

function toRitual(doc: {
  _id: unknown;
  title: string;
  timeLabel?: string | null;
  reminderLeadMinutes?: number | null;
  responsibleParent?: string | null;
  active?: boolean;
  order?: number;
  createdAt: Date;
  updatedAt: Date;
}): FamilyRitual {
  return {
    id: String(doc._id),
    title: doc.title,
    timeLabel: doc.timeLabel?.trim() || undefined,
    reminderLeadMinutes:
      typeof doc.reminderLeadMinutes === "number" && Number.isFinite(doc.reminderLeadMinutes)
        ? Math.max(0, Math.floor(doc.reminderLeadMinutes))
        : 0,
    responsibleParent:
      doc.responsibleParent === "tata" || doc.responsibleParent === "mama" || doc.responsibleParent === "both"
        ? doc.responsibleParent
        : "both",
    active: doc.active !== false,
    order: Number.isFinite(doc.order) ? Number(doc.order) : 0,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Neautorizat" }, { status: 401 });

  const ctx = await getFamilyContext(session.user.id);
  if (!ctx.familyId) return NextResponse.json({ rituals: [] });

  const docs = await ctx.db
    .collection("family_rituals")
    .find({ familyId: ctx.familyId })
    .sort({ order: 1, createdAt: 1 })
    .toArray();

  return NextResponse.json({
    rituals: (docs as Parameters<typeof toRitual>[0][]).map((d) => toRitual(d)),
  });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
  const ctx = await getFamilyContext(session.user.id);
  if (!ctx.familyId) return NextResponse.json({ error: "Context familie invalid." }, { status: 400 });

  const body = await request.json().catch(() => ({}));
  const title = typeof body.title === "string" ? body.title.trim() : "";
  const timeLabel = typeof body.timeLabel === "string" ? body.timeLabel.trim() : "";
  const reminderLeadMinutes =
    typeof body.reminderLeadMinutes === "number" && Number.isFinite(body.reminderLeadMinutes)
      ? Math.max(0, Math.floor(body.reminderLeadMinutes))
      : 0;
  const responsibleParent: RitualResponsibleParent =
    body.responsibleParent === "tata" || body.responsibleParent === "mama" || body.responsibleParent === "both"
      ? body.responsibleParent
      : "both";
  if (!title) return NextResponse.json({ error: "Titlul ritualului este obligatoriu." }, { status: 400 });
  if (timeLabel && !/^\d{2}:\d{2}$/.test(timeLabel)) {
    return NextResponse.json({ error: "Ora trebuie în format HH:mm." }, { status: 400 });
  }
  if (reminderLeadMinutes > 120) {
    return NextResponse.json({ error: "Lead time prea mare (max 120 min)." }, { status: 400 });
  }

  const now = new Date();
  const maxOrderDoc = await ctx.db
    .collection("family_rituals")
    .find({ familyId: ctx.familyId })
    .sort({ order: -1 })
    .limit(1)
    .toArray();
  const nextOrder = Number((maxOrderDoc[0] as { order?: number } | undefined)?.order ?? -1) + 1;

  const result = await ctx.db.collection("family_rituals").insertOne({
    familyId: ctx.familyId,
    title,
    timeLabel: timeLabel || null,
    reminderLeadMinutes,
    responsibleParent,
    active: true,
    order: nextOrder,
    createdAt: now,
    updatedAt: now,
  });
  const created = await ctx.db.collection("family_rituals").findOne({ _id: result.insertedId });
  if (!created) return NextResponse.json({ error: "Eroare la creare." }, { status: 500 });
  return NextResponse.json({ ritual: toRitual(created as Parameters<typeof toRitual>[0]) });
}

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
  const ctx = await getFamilyContext(session.user.id);
  if (!ctx.familyId) return NextResponse.json({ error: "Context familie invalid." }, { status: 400 });

  const body = await request.json().catch(() => ({}));
  const id = typeof body.id === "string" ? body.id : "";
  if (!id) return NextResponse.json({ error: "ID lipsă." }, { status: 400 });
  let oid: ObjectId;
  try {
    oid = new ObjectId(id);
  } catch {
    return NextResponse.json({ error: "ID invalid." }, { status: 400 });
  }

  const update: Record<string, unknown> = { updatedAt: new Date() };
  if (typeof body.title === "string") {
    const t = body.title.trim();
    if (!t) return NextResponse.json({ error: "Titlul nu poate fi gol." }, { status: 400 });
    update.title = t;
  }
  if ("timeLabel" in body) {
    if (body.timeLabel === null) update.timeLabel = null;
    else if (typeof body.timeLabel === "string") {
      const v = body.timeLabel.trim();
      if (v && !/^\d{2}:\d{2}$/.test(v)) {
        return NextResponse.json({ error: "Ora trebuie în format HH:mm." }, { status: 400 });
      }
      update.timeLabel = v || null;
    }
  }
  if ("reminderLeadMinutes" in body) {
    if (typeof body.reminderLeadMinutes !== "number" || !Number.isFinite(body.reminderLeadMinutes)) {
      return NextResponse.json({ error: "reminderLeadMinutes invalid." }, { status: 400 });
    }
    const lead = Math.max(0, Math.floor(body.reminderLeadMinutes));
    if (lead > 120) return NextResponse.json({ error: "Lead time prea mare (max 120 min)." }, { status: 400 });
    update.reminderLeadMinutes = lead;
  }
  if (
    body.responsibleParent === "tata" ||
    body.responsibleParent === "mama" ||
    body.responsibleParent === "both"
  ) {
    update.responsibleParent = body.responsibleParent;
  }
  if (typeof body.active === "boolean") update.active = body.active;
  if (typeof body.order === "number" && Number.isFinite(body.order)) update.order = Math.max(0, Math.floor(body.order));

  await ctx.db.collection("family_rituals").updateOne({ _id: oid, familyId: ctx.familyId }, { $set: update });
  const updated = await ctx.db.collection("family_rituals").findOne({ _id: oid, familyId: ctx.familyId });
  if (!updated) return NextResponse.json({ error: "Ritual negăsit." }, { status: 404 });
  return NextResponse.json({ ritual: toRitual(updated as Parameters<typeof toRitual>[0]) });
}

export async function DELETE(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
  const ctx = await getFamilyContext(session.user.id);
  if (!ctx.familyId) return NextResponse.json({ error: "Context familie invalid." }, { status: 400 });

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id") || "";
  let oid: ObjectId;
  try {
    oid = new ObjectId(id);
  } catch {
    return NextResponse.json({ error: "ID invalid." }, { status: 400 });
  }
  await ctx.db.collection("family_rituals").deleteOne({ _id: oid, familyId: ctx.familyId });
  await ctx.db.collection("family_ritual_checkins").deleteMany({ ritualId: oid, familyId: ctx.familyId });
  return NextResponse.json({ ok: true });
}

