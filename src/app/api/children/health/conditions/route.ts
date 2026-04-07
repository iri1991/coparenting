import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { ensureChildInFamily, getHealthContext, isValidYmd, toCondition } from "@/lib/health";

export async function POST(request: Request) {
  const { auth } = await import("@/lib/auth");
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
  const ctx = await getHealthContext(session.user.id);
  if (!ctx) return NextResponse.json({ error: "Context familie invalid." }, { status: 400 });
  const body = await request.json().catch(() => ({}));
  const childIdRaw = typeof body.childId === "string" ? body.childId : "";
  const childId = await ensureChildInFamily(ctx.db, ctx.familyId, childIdRaw);
  if (!childId) return NextResponse.json({ error: "Copil invalid." }, { status: 400 });
  const title = typeof body.title === "string" ? body.title.trim() : "";
  if (!title) return NextResponse.json({ error: "Titlul este obligatoriu." }, { status: 400 });
  const diagnosedAt = typeof body.diagnosedAt === "string" && isValidYmd(body.diagnosedAt) ? body.diagnosedAt : null;
  const status = body.status === "resolved" ? "resolved" : "active";
  const notes = typeof body.notes === "string" ? body.notes.trim() : "";
  const now = new Date();
  const { insertedId } = await ctx.db.collection("child_health_conditions").insertOne({
    familyId: ctx.familyId,
    childId,
    title,
    diagnosedAt,
    status,
    notes: notes || null,
    createdAt: now,
    updatedAt: now,
  });
  const created = await ctx.db.collection("child_health_conditions").findOne({ _id: insertedId });
  return NextResponse.json({ condition: toCondition(created as Parameters<typeof toCondition>[0]) });
}

export async function PATCH(request: Request) {
  const { auth } = await import("@/lib/auth");
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
  const ctx = await getHealthContext(session.user.id);
  if (!ctx) return NextResponse.json({ error: "Context familie invalid." }, { status: 400 });
  const body = await request.json().catch(() => ({}));
  const idRaw = typeof body.id === "string" ? body.id : "";
  let id: ObjectId;
  try {
    id = new ObjectId(idRaw);
  } catch {
    return NextResponse.json({ error: "ID invalid." }, { status: 400 });
  }
  const update: Record<string, unknown> = { updatedAt: new Date() };
  if (typeof body.title === "string") {
    const title = body.title.trim();
    if (!title) return NextResponse.json({ error: "Titlu invalid." }, { status: 400 });
    update.title = title;
  }
  if ("diagnosedAt" in body) {
    if (body.diagnosedAt === null || body.diagnosedAt === "") update.diagnosedAt = null;
    else if (typeof body.diagnosedAt === "string" && isValidYmd(body.diagnosedAt)) update.diagnosedAt = body.diagnosedAt;
    else return NextResponse.json({ error: "Data diagnostic invalidă." }, { status: 400 });
  }
  if ("status" in body) update.status = body.status === "resolved" ? "resolved" : "active";
  if ("notes" in body) update.notes = typeof body.notes === "string" ? body.notes.trim() || null : null;
  await ctx.db.collection("child_health_conditions").updateOne({ _id: id, familyId: ctx.familyId }, { $set: update });
  const updated = await ctx.db.collection("child_health_conditions").findOne({ _id: id, familyId: ctx.familyId });
  if (!updated) return NextResponse.json({ error: "Afecțiune negăsită." }, { status: 404 });
  return NextResponse.json({ condition: toCondition(updated as Parameters<typeof toCondition>[0]) });
}

export async function DELETE(request: Request) {
  const { auth } = await import("@/lib/auth");
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
  const ctx = await getHealthContext(session.user.id);
  if (!ctx) return NextResponse.json({ error: "Context familie invalid." }, { status: 400 });
  const { searchParams } = new URL(request.url);
  const idRaw = searchParams.get("id") || "";
  let id: ObjectId;
  try {
    id = new ObjectId(idRaw);
  } catch {
    return NextResponse.json({ error: "ID invalid." }, { status: 400 });
  }
  await ctx.db.collection("child_health_conditions").deleteOne({ _id: id, familyId: ctx.familyId });
  await ctx.db.collection("child_treatment_plans").updateMany({ familyId: ctx.familyId, conditionId: id }, { $set: { conditionId: null } });
  return NextResponse.json({ ok: true });
}
