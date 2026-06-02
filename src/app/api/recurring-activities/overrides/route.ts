import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { auth } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";
import { getActiveFamily } from "@/lib/family";
import { inferReplacesDate } from "@/lib/recurring-activity";
import type { RecurringActivityOverride, Weekday } from "@/types/recurring-activity";
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

function toOverride(doc: {
  _id: unknown;
  activityId: unknown;
  date: string;
  timeLabel?: string | null;
  skipped?: boolean;
  replacesDate?: string | null;
  createdAt: Date;
  updatedAt: Date;
}): RecurringActivityOverride {
  return {
    id: String(doc._id),
    activityId: String(doc.activityId),
    date: doc.date,
    timeLabel: doc.timeLabel?.trim() || "",
    skipped: doc.skipped === true,
    replacesDate: doc.replacesDate?.trim() || undefined,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
}

async function getActivityForFamily(
  db: Awaited<ReturnType<typeof getDb>>,
  familyId: ObjectId,
  activityId: string
): Promise<{ _id: ObjectId; weekday: Weekday; timeLabel: string } | null> {
  let oid: ObjectId;
  try {
    oid = new ObjectId(activityId);
  } catch {
    return null;
  }
  const doc = await db.collection("family_recurring_activities").findOne({
    _id: oid,
    familyId,
  });
  if (!doc) return null;
  const weekdayRaw = (doc as { weekday?: string }).weekday;
  const weekday: Weekday = isWeekday(weekdayRaw) ? weekdayRaw : "mon";
  return {
    _id: oid,
    weekday,
    timeLabel: String((doc as { timeLabel?: string }).timeLabel ?? "").trim(),
  };
}

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Neautorizat" }, { status: 401 });

  const ctx = await getFamilyContext(session.user.id);
  if (!ctx.familyId) return NextResponse.json({ overrides: [] });

  const { searchParams } = new URL(request.url);
  const from = searchParams.get("from") || "";
  const to = searchParams.get("to") || "";
  const activityId = searchParams.get("activityId") || "";

  const filter: Record<string, unknown> = { familyId: ctx.familyId };
  if (activityId) {
    try {
      filter.activityId = new ObjectId(activityId);
    } catch {
      return NextResponse.json({ error: "ID activitate invalid." }, { status: 400 });
    }
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(from) && /^\d{4}-\d{2}-\d{2}$/.test(to)) {
    filter.date = { $gte: from, $lte: to };
  }

  const docs = await ctx.db
    .collection("family_recurring_activity_overrides")
    .find(filter)
    .sort({ date: 1 })
    .toArray();

  return NextResponse.json({
    overrides: (docs as Parameters<typeof toOverride>[0][]).map((d) => toOverride(d)),
  });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
  const ctx = await getFamilyContext(session.user.id);
  if (!ctx.familyId) return NextResponse.json({ error: "Context familie invalid." }, { status: 400 });

  const body = await request.json().catch(() => ({}));
  const activityId = typeof body.activityId === "string" ? body.activityId : "";
  const date = typeof body.date === "string" ? body.date.trim() : "";
  const skipped = body.skipped === true;
  const timeLabel = typeof body.timeLabel === "string" ? body.timeLabel.trim() : "";

  if (!activityId || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: "Activitate și dată obligatorii." }, { status: 400 });
  }

  const activity = await getActivityForFamily(ctx.db, ctx.familyId, activityId);
  if (!activity) return NextResponse.json({ error: "Activitate negăsită." }, { status: 404 });

  if (!skipped) {
    const t = timeLabel || activity.timeLabel;
    if (!t || !/^\d{2}:\d{2}$/.test(t)) {
      return NextResponse.json({ error: "Ora trebuie în format HH:mm." }, { status: 400 });
    }
  }

  let replacesDate =
    typeof body.replacesDate === "string" && /^\d{4}-\d{2}-\d{2}$/.test(body.replacesDate.trim())
      ? body.replacesDate.trim()
      : undefined;
  if (!skipped && !replacesDate) {
    replacesDate = inferReplacesDate(activity.weekday, date);
  }

  const now = new Date();
  const finalTime = skipped ? activity.timeLabel : timeLabel || activity.timeLabel;

  const existing = await ctx.db.collection("family_recurring_activity_overrides").findOne({
    familyId: ctx.familyId,
    activityId: activity._id,
    date,
  });

  if (existing) {
    await ctx.db.collection("family_recurring_activity_overrides").updateOne(
      { _id: existing._id },
      {
        $set: {
          timeLabel: finalTime,
          skipped,
          replacesDate: replacesDate ?? null,
          updatedAt: now,
        },
      }
    );
    const updated = await ctx.db.collection("family_recurring_activity_overrides").findOne({ _id: existing._id });
    if (!updated) return NextResponse.json({ error: "Eroare la salvare." }, { status: 500 });
    return NextResponse.json({ override: toOverride(updated as Parameters<typeof toOverride>[0]) });
  }

  const result = await ctx.db.collection("family_recurring_activity_overrides").insertOne({
    familyId: ctx.familyId,
    activityId: activity._id,
    date,
    timeLabel: finalTime,
    skipped,
    replacesDate: replacesDate ?? null,
    createdAt: now,
    updatedAt: now,
  });
  const created = await ctx.db.collection("family_recurring_activity_overrides").findOne({ _id: result.insertedId });
  if (!created) return NextResponse.json({ error: "Eroare la creare." }, { status: 500 });
  return NextResponse.json({ override: toOverride(created as Parameters<typeof toOverride>[0]) });
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

  const existing = await ctx.db.collection("family_recurring_activity_overrides").findOne({
    _id: oid,
    familyId: ctx.familyId,
  });
  if (!existing) return NextResponse.json({ error: "Excepție negăsită." }, { status: 404 });

  const update: Record<string, unknown> = { updatedAt: new Date() };
  if ("date" in body) {
    const d = typeof body.date === "string" ? body.date.trim() : "";
    if (!/^\d{4}-\d{2}-\d{2}$/.test(d)) return NextResponse.json({ error: "Dată invalidă." }, { status: 400 });
    update.date = d;
  }
  if ("skipped" in body) update.skipped = body.skipped === true;
  if ("timeLabel" in body) {
    const t = typeof body.timeLabel === "string" ? body.timeLabel.trim() : "";
    if (t && !/^\d{2}:\d{2}$/.test(t)) {
      return NextResponse.json({ error: "Ora trebuie în format HH:mm." }, { status: 400 });
    }
    update.timeLabel = t;
  }
  if ("replacesDate" in body) {
    if (body.replacesDate === null) update.replacesDate = null;
    else if (typeof body.replacesDate === "string" && /^\d{4}-\d{2}-\d{2}$/.test(body.replacesDate.trim())) {
      update.replacesDate = body.replacesDate.trim();
    }
  }

  await ctx.db.collection("family_recurring_activity_overrides").updateOne({ _id: oid }, { $set: update });
  const updated = await ctx.db.collection("family_recurring_activity_overrides").findOne({ _id: oid });
  if (!updated) return NextResponse.json({ error: "Excepție negăsită." }, { status: 404 });
  return NextResponse.json({ override: toOverride(updated as Parameters<typeof toOverride>[0]) });
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
  await ctx.db.collection("family_recurring_activity_overrides").deleteOne({ _id: oid, familyId: ctx.familyId });
  return NextResponse.json({ ok: true });
}
