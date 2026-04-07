import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getHealthContext, ensureChildInFamily, toMedicalReport } from "@/lib/health";

const MAX_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ["application/pdf", "image/jpeg", "image/png", "image/webp"];

export async function POST(request: Request) {
  const { auth } = await import("@/lib/auth");
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
  const ctx = await getHealthContext(session.user.id);
  if (!ctx) return NextResponse.json({ error: "Context familie invalid." }, { status: 400 });
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Date invalide." }, { status: 400 });
  }
  const childIdRaw = formData.get("childId");
  const conditionIdRaw = formData.get("conditionId");
  const name = formData.get("name");
  const file = formData.get("file");
  if (typeof childIdRaw !== "string" || typeof name !== "string" || !(file instanceof File)) {
    return NextResponse.json({ error: "childId, name și file sunt obligatorii." }, { status: 400 });
  }
  const childId = await ensureChildInFamily(ctx.db, ctx.familyId, childIdRaw);
  if (!childId) return NextResponse.json({ error: "Copil invalid." }, { status: 400 });
  let conditionId: ObjectId | null = null;
  if (typeof conditionIdRaw === "string" && conditionIdRaw.trim()) {
    try {
      conditionId = new ObjectId(conditionIdRaw);
    } catch {
      return NextResponse.json({ error: "Afecțiune invalidă." }, { status: 400 });
    }
    const cond = await ctx.db.collection("child_health_conditions").findOne({
      _id: conditionId,
      familyId: ctx.familyId,
      childId,
    });
    if (!cond) return NextResponse.json({ error: "Afecțiunea selectată nu există." }, { status: 400 });
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: "Fișier neacceptat (PDF/JPEG/PNG/WebP)." }, { status: 400 });
  }
  if (file.size > MAX_SIZE) return NextResponse.json({ error: "Fișier prea mare (max 10MB)." }, { status: 400 });
  const title = name.trim().slice(0, 220) || "Raport medical";
  const content = Buffer.from(await file.arrayBuffer());
  const now = new Date();
  const { insertedId } = await ctx.db.collection("child_medical_reports").insertOne({
    familyId: ctx.familyId,
    childId,
    conditionId,
    name: title,
    contentType: file.type,
    content,
    createdAt: now,
    createdByUserId: session.user.id,
  });
  const created = await ctx.db.collection("child_medical_reports").findOne({ _id: insertedId });
  return NextResponse.json({ report: toMedicalReport(created as Parameters<typeof toMedicalReport>[0]) });
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
  const update: Record<string, unknown> = {};
  if ("conditionId" in body) {
    if (body.conditionId === null || body.conditionId === "") {
      update.conditionId = null;
    } else if (typeof body.conditionId === "string") {
      let conditionId: ObjectId;
      try {
        conditionId = new ObjectId(body.conditionId);
      } catch {
        return NextResponse.json({ error: "Afecțiune invalidă." }, { status: 400 });
      }
      const cond = await ctx.db.collection("child_health_conditions").findOne({ _id: conditionId, familyId: ctx.familyId });
      if (!cond) return NextResponse.json({ error: "Afecțiunea selectată nu există." }, { status: 400 });
      update.conditionId = conditionId;
    }
  }
  if (Object.keys(update).length === 0) return NextResponse.json({ error: "Nimic de actualizat." }, { status: 400 });
  await ctx.db.collection("child_medical_reports").updateOne({ _id: id, familyId: ctx.familyId }, { $set: update });
  const updated = await ctx.db.collection("child_medical_reports").findOne({ _id: id, familyId: ctx.familyId });
  if (!updated) return NextResponse.json({ error: "Raport negăsit." }, { status: 404 });
  return NextResponse.json({ report: toMedicalReport(updated as Parameters<typeof toMedicalReport>[0]) });
}
