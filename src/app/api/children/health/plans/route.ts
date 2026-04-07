import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { ensureChildInFamily, getHealthContext, isValidHhMm, isValidYmd, toPlan } from "@/lib/health";

function sanitizeTimes(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  const unique = new Set(
    raw
      .filter((t) => typeof t === "string")
      .map((t) => t.trim())
      .filter((t) => isValidHhMm(t))
  );
  return [...unique].sort((a, b) => a.localeCompare(b));
}

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
  const medicationName = typeof body.medicationName === "string" ? body.medicationName.trim() : "";
  const dosage = typeof body.dosage === "string" ? body.dosage.trim() : "";
  if (!medicationName || !dosage) return NextResponse.json({ error: "Medicamentul și doza sunt obligatorii." }, { status: 400 });
  const startDate = typeof body.startDate === "string" && isValidYmd(body.startDate) ? body.startDate : "";
  if (!startDate) return NextResponse.json({ error: "Data de start este invalidă." }, { status: 400 });
  const endDate = typeof body.endDate === "string" && isValidYmd(body.endDate) ? body.endDate : null;
  const times = sanitizeTimes(body.times);
  if (times.length === 0) return NextResponse.json({ error: "Adaugă cel puțin o oră (HH:mm)." }, { status: 400 });
  const lead =
    typeof body.reminderLeadMinutes === "number" && Number.isFinite(body.reminderLeadMinutes)
      ? Math.max(0, Math.min(240, Math.floor(body.reminderLeadMinutes)))
      : 0;
  const responsibleParent = body.responsibleParent === "tata" || body.responsibleParent === "mama" ? body.responsibleParent : "both";
  const instructions = typeof body.instructions === "string" ? body.instructions.trim() : "";
  let conditionId: ObjectId | null = null;
  if (typeof body.conditionId === "string" && body.conditionId) {
    try {
      conditionId = new ObjectId(body.conditionId);
    } catch {
      conditionId = null;
    }
  }
  const now = new Date();
  const { insertedId } = await ctx.db.collection("child_treatment_plans").insertOne({
    familyId: ctx.familyId,
    childId,
    conditionId,
    medicationName,
    dosage,
    instructions: instructions || null,
    startDate,
    endDate,
    times,
    reminderLeadMinutes: lead,
    responsibleParent,
    active: true,
    createdAt: now,
    updatedAt: now,
  });
  const created = await ctx.db.collection("child_treatment_plans").findOne({ _id: insertedId });
  return NextResponse.json({ plan: toPlan(created as Parameters<typeof toPlan>[0]) });
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
  if ("medicationName" in body) {
    const v = typeof body.medicationName === "string" ? body.medicationName.trim() : "";
    if (!v) return NextResponse.json({ error: "Medicament invalid." }, { status: 400 });
    update.medicationName = v;
  }
  if ("dosage" in body) {
    const v = typeof body.dosage === "string" ? body.dosage.trim() : "";
    if (!v) return NextResponse.json({ error: "Doză invalidă." }, { status: 400 });
    update.dosage = v;
  }
  if ("instructions" in body) update.instructions = typeof body.instructions === "string" ? body.instructions.trim() || null : null;
  if ("startDate" in body) {
    if (typeof body.startDate !== "string" || !isValidYmd(body.startDate)) return NextResponse.json({ error: "Data start invalidă." }, { status: 400 });
    update.startDate = body.startDate;
  }
  if ("endDate" in body) {
    if (body.endDate === null || body.endDate === "") update.endDate = null;
    else if (typeof body.endDate === "string" && isValidYmd(body.endDate)) update.endDate = body.endDate;
    else return NextResponse.json({ error: "Data final invalidă." }, { status: 400 });
  }
  if ("times" in body) {
    const times = sanitizeTimes(body.times);
    if (times.length === 0) return NextResponse.json({ error: "Ore invalide." }, { status: 400 });
    update.times = times;
  }
  if ("reminderLeadMinutes" in body) {
    const lead =
      typeof body.reminderLeadMinutes === "number" && Number.isFinite(body.reminderLeadMinutes)
        ? Math.max(0, Math.min(240, Math.floor(body.reminderLeadMinutes)))
        : 0;
    update.reminderLeadMinutes = lead;
  }
  if ("responsibleParent" in body) {
    update.responsibleParent = body.responsibleParent === "tata" || body.responsibleParent === "mama" ? body.responsibleParent : "both";
  }
  if ("active" in body) update.active = body.active !== false;
  await ctx.db.collection("child_treatment_plans").updateOne({ _id: id, familyId: ctx.familyId }, { $set: update });
  const updated = await ctx.db.collection("child_treatment_plans").findOne({ _id: id, familyId: ctx.familyId });
  if (!updated) return NextResponse.json({ error: "Plan negăsit." }, { status: 404 });
  return NextResponse.json({ plan: toPlan(updated as Parameters<typeof toPlan>[0]) });
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
  await ctx.db.collection("child_treatment_plans").deleteOne({ _id: id, familyId: ctx.familyId });
  await ctx.db.collection("child_treatment_administrations").deleteMany({ familyId: ctx.familyId, planId: id });
  return NextResponse.json({ ok: true });
}
