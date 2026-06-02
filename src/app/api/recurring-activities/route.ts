import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { auth } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";
import { getActiveFamily } from "@/lib/family";
import type { RecurringActivity, Weekday } from "@/types/recurring-activity";
import { WEEKDAYS } from "@/types/recurring-activity";

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

function isWeekday(v: unknown): v is Weekday {
  return typeof v === "string" && (WEEKDAYS as string[]).includes(v);
}

function toActivity(doc: {
  _id: unknown;
  title: string;
  weekday?: string | null;
  timeLabel?: string | null;
  reminderLeadMinutes?: number | null;
  active?: boolean;
  order?: number;
  createdAt: Date;
  updatedAt: Date;
}): RecurringActivity {
  return {
    id: String(doc._id),
    title: doc.title,
    weekday: isWeekday(doc.weekday) ? doc.weekday : "mon",
    timeLabel: doc.timeLabel?.trim() || "",
    reminderLeadMinutes:
      typeof doc.reminderLeadMinutes === "number" && Number.isFinite(doc.reminderLeadMinutes)
        ? Math.max(0, Math.floor(doc.reminderLeadMinutes))
        : 0,
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
  if (!ctx.familyId) return NextResponse.json({ activities: [] });

  const docs = await ctx.db
    .collection("family_recurring_activities")
    .find({ familyId: ctx.familyId })
    .sort({ order: 1, createdAt: 1 })
    .toArray();

  return NextResponse.json({
    activities: (docs as Parameters<typeof toActivity>[0][]).map((d) => toActivity(d)),
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
  const weekday: Weekday = isWeekday(body.weekday) ? body.weekday : "mon";
  const reminderLeadMinutes =
    typeof body.reminderLeadMinutes === "number" && Number.isFinite(body.reminderLeadMinutes)
      ? Math.max(0, Math.floor(body.reminderLeadMinutes))
      : 0;
  if (!title) return NextResponse.json({ error: "Numele activității este obligatoriu." }, { status: 400 });
  if (!timeLabel || !/^\d{2}:\d{2}$/.test(timeLabel)) {
    return NextResponse.json({ error: "Ora trebuie în format HH:mm." }, { status: 400 });
  }
  if (reminderLeadMinutes > 120) {
    return NextResponse.json({ error: "Lead time prea mare (max 120 min)." }, { status: 400 });
  }

  const now = new Date();
  const maxOrderDoc = await ctx.db
    .collection("family_recurring_activities")
    .find({ familyId: ctx.familyId })
    .sort({ order: -1 })
    .limit(1)
    .toArray();
  const nextOrder = Number((maxOrderDoc[0] as { order?: number } | undefined)?.order ?? -1) + 1;

  const result = await ctx.db.collection("family_recurring_activities").insertOne({
    familyId: ctx.familyId,
    title,
    weekday,
    timeLabel,
    reminderLeadMinutes,
    active: true,
    order: nextOrder,
    createdAt: now,
    updatedAt: now,
  });
  const created = await ctx.db.collection("family_recurring_activities").findOne({ _id: result.insertedId });
  if (!created) return NextResponse.json({ error: "Eroare la creare." }, { status: 500 });
  return NextResponse.json({ activity: toActivity(created as Parameters<typeof toActivity>[0]) });
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
    if (!t) return NextResponse.json({ error: "Numele nu poate fi gol." }, { status: 400 });
    update.title = t;
  }
  if ("weekday" in body) {
    if (!isWeekday(body.weekday)) return NextResponse.json({ error: "Zi invalidă." }, { status: 400 });
    update.weekday = body.weekday;
  }
  if ("timeLabel" in body) {
    if (typeof body.timeLabel !== "string" || !/^\d{2}:\d{2}$/.test(body.timeLabel.trim())) {
      return NextResponse.json({ error: "Ora trebuie în format HH:mm." }, { status: 400 });
    }
    update.timeLabel = body.timeLabel.trim();
  }
  if ("reminderLeadMinutes" in body) {
    if (typeof body.reminderLeadMinutes !== "number" || !Number.isFinite(body.reminderLeadMinutes)) {
      return NextResponse.json({ error: "reminderLeadMinutes invalid." }, { status: 400 });
    }
    const lead = Math.max(0, Math.floor(body.reminderLeadMinutes));
    if (lead > 120) return NextResponse.json({ error: "Lead time prea mare (max 120 min)." }, { status: 400 });
    update.reminderLeadMinutes = lead;
  }
  if (typeof body.active === "boolean") update.active = body.active;
  if (typeof body.order === "number" && Number.isFinite(body.order)) update.order = Math.max(0, Math.floor(body.order));

  await ctx.db.collection("family_recurring_activities").updateOne({ _id: oid, familyId: ctx.familyId }, { $set: update });
  const updated = await ctx.db.collection("family_recurring_activities").findOne({ _id: oid, familyId: ctx.familyId });
  if (!updated) return NextResponse.json({ error: "Activitate negăsită." }, { status: 404 });
  return NextResponse.json({ activity: toActivity(updated as Parameters<typeof toActivity>[0]) });
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
  await ctx.db.collection("family_recurring_activities").deleteOne({ _id: oid, familyId: ctx.familyId });
  await ctx.db.collection("family_recurring_activity_overrides").deleteMany({
    familyId: ctx.familyId,
    activityId: oid,
  });
  return NextResponse.json({ ok: true });
}
