import { NextResponse } from "next/server";
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
  const name = formData.get("name");
  const file = formData.get("file");
  if (typeof childIdRaw !== "string" || typeof name !== "string" || !(file instanceof File)) {
    return NextResponse.json({ error: "childId, name și file sunt obligatorii." }, { status: 400 });
  }
  const childId = await ensureChildInFamily(ctx.db, ctx.familyId, childIdRaw);
  if (!childId) return NextResponse.json({ error: "Copil invalid." }, { status: 400 });
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
    name: title,
    contentType: file.type,
    content,
    createdAt: now,
    createdByUserId: session.user.id,
  });
  const created = await ctx.db.collection("child_medical_reports").findOne({ _id: insertedId });
  return NextResponse.json({ report: toMedicalReport(created as Parameters<typeof toMedicalReport>[0]) });
}
