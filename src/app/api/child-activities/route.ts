import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { auth } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";
import { getActiveFamily } from "@/lib/family";

async function getCurrentFamilyContext(userId: string) {
  const db = await getDb();
  const user = await db.collection("users").findOne(
    { _id: new ObjectId(userId) },
    { projection: { familyId: 1, parentType: 1 } }
  );
  const familyIdRaw = (user as { familyId?: unknown })?.familyId;
  if (!familyIdRaw) return { db, familyId: null, parentType: null };
  const familyId = new ObjectId(String(familyIdRaw));
  const family = await getActiveFamily(db, familyId);
  if (!family) return { db, familyId: null, parentType: null };
  const memberIds = (family.memberIds ?? []).map(String);
  if (!memberIds.includes(userId)) return { db, familyId: null, parentType: null };
  const parentType = (user as { parentType?: string })?.parentType;
  return {
    db,
    familyId,
    parentType: parentType === "tata" || parentType === "mama" ? parentType : null,
  };
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
  }

  const ctx = await getCurrentFamilyContext(session.user.id);
  if (!ctx.familyId) {
    return NextResponse.json({ entries: [], activityCatalog: [] });
  }

  const [entries, catalog] = await Promise.all([
    ctx.db.collection("child_activities").find({ familyId: ctx.familyId }).sort({ createdAt: -1 }).toArray(),
    ctx.db.collection("activity_catalog").find({ familyId: ctx.familyId }).sort({ name: 1 }).toArray(),
  ]);

  return NextResponse.json({
    entries: (entries as { _id: unknown; userId: string; parentType: "tata" | "mama"; activityName: string; notes?: string; periodEndDate: string; createdAt: Date }[]).map((e) => ({
      id: String(e._id),
      userId: e.userId,
      parentType: e.parentType,
      activityName: e.activityName,
      notes: e.notes ?? "",
      periodEndDate: e.periodEndDate,
      createdAt: e.createdAt.toISOString(),
    })),
    activityCatalog: (catalog as unknown as { name?: string }[])
      .map((x) => (typeof x.name === "string" ? x.name : ""))
      .filter(Boolean),
  });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
  }
  const ctx = await getCurrentFamilyContext(session.user.id);
  if (!ctx.familyId || !ctx.parentType) {
    return NextResponse.json({ error: "Context familie invalid." }, { status: 400 });
  }

  const body = await request.json().catch(() => ({}));
  const activityName = typeof body.activityName === "string" ? body.activityName.trim() : "";
  const notes = typeof body.notes === "string" ? body.notes.trim() : "";
  const periodEndDate = typeof body.periodEndDate === "string" ? body.periodEndDate : "";
  if (!activityName) {
    return NextResponse.json({ error: "Completează activitatea." }, { status: 400 });
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(periodEndDate)) {
    return NextResponse.json({ error: "periodEndDate invalid." }, { status: 400 });
  }

  const now = new Date();
  await ctx.db.collection("child_activities").insertOne({
    familyId: ctx.familyId,
    userId: session.user.id,
    parentType: ctx.parentType,
    activityName,
    notes: notes || null,
    periodEndDate,
    createdAt: now,
    updatedAt: now,
  });
  await ctx.db.collection("activity_catalog").updateOne(
    { familyId: ctx.familyId, name: activityName },
    { $setOnInsert: { familyId: ctx.familyId, name: activityName, createdAt: now } },
    { upsert: true }
  );

  return NextResponse.json({ ok: true });
}

