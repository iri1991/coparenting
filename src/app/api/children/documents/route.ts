import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { auth } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";
import { getActiveFamily } from "@/lib/family";
import { getFamilyPlan, canUseDocuments } from "@/lib/plan";
import { notifyFamilyConfigUpdated } from "@/lib/email";

const MAX_SIZE = 10 * 1024 * 1024; // 10 MB
const ALLOWED_TYPES = ["application/pdf", "image/jpeg", "image/png", "image/webp"];

async function getFamilyIdForUser(db: Awaited<ReturnType<typeof getDb>>, userId: string): Promise<ObjectId | null> {
  const user = await db.collection("users").findOne(
    { _id: new ObjectId(userId) },
    { projection: { familyId: 1 } }
  );
  const fid = (user as { familyId?: unknown })?.familyId;
  if (!fid) return null;
  try {
    return new ObjectId(String(fid));
  } catch {
    return null;
  }
}

/** POST: încarcă un document pentru un copil. FormData: childId, name (nume document), file */
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
  }
  const db = await getDb();
  const familyId = await getFamilyIdForUser(db, session.user.id);
  if (!familyId) {
    return NextResponse.json({ error: "Nu aparțineți unei familii." }, { status: 400 });
  }
  const family = await getActiveFamily(db, familyId);
  if (!family) {
    return NextResponse.json(
      { error: "Familia nu există sau a fost dezactivată. Contactați suportul." },
      { status: 403 }
    );
  }
  const plan = await getFamilyPlan(db, familyId);
  if (!canUseDocuments(plan)) {
    return NextResponse.json(
      { error: "Documentele sunt disponibile în planul Pro. Faceți upgrade pentru a încărca documente." },
      { status: 403 }
    );
  }
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Date invalide." }, { status: 400 });
  }
  const childIdStr = formData.get("childId");
  const name = formData.get("name");
  const file = formData.get("file");
  if (!childIdStr || typeof childIdStr !== "string" || !name || typeof name !== "string" || !(file instanceof File)) {
    return NextResponse.json({ error: "childId, name și file sunt obligatorii." }, { status: 400 });
  }
  const docName = name.trim().slice(0, 200) || "Document";
  let childId: ObjectId;
  try {
    childId = new ObjectId(childIdStr);
  } catch {
    return NextResponse.json({ error: "childId invalid." }, { status: 400 });
  }
  const child = await db.collection("children").findOne({ _id: childId, familyId });
  if (!child) {
    return NextResponse.json({ error: "Copil negăsit." }, { status: 404 });
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: "Tip fișier neacceptat. Folosește PDF sau imagine (JPEG, PNG, WebP)." },
      { status: 400 }
    );
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "Fișierul depășește 10 MB." }, { status: 400 });
  }
  const buffer = Buffer.from(await file.arrayBuffer());
  const now = new Date();
  const { insertedId } = await db.collection("child_documents").insertOne({
    childId,
    familyId,
    name: docName,
    contentType: file.type,
    content: buffer,
    createdAt: now,
  });
  const travelDocuments = ((child as { travelDocuments?: { id: string; name: string }[] }).travelDocuments || []).concat([
    { id: String(insertedId), name: docName },
  ]);
  await db.collection("children").updateOne(
    { _id: childId, familyId },
    { $set: { travelDocuments, updatedAt: now } }
  );
  try {
    const updatedByName = session.user.name?.trim() || session.user.email?.split("@")[0] || null;
    await notifyFamilyConfigUpdated(db, familyId, updatedByName);
  } catch (_) {}
  return NextResponse.json({ id: String(insertedId), name: docName });
}
