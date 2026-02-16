import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { auth } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";
import { getActiveFamily } from "@/lib/family";
import { notifyFamilyConfigUpdated } from "@/lib/email";
import { getParentDisplayName } from "@/lib/parent-display-name";

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

/** GET: descarcă un document (verifică că e din familia userului). */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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
  const { id } = await params;
  let oid: ObjectId;
  try {
    oid = new ObjectId(id);
  } catch {
    return NextResponse.json({ error: "ID invalid." }, { status: 400 });
  }
  const doc = await db.collection("child_documents").findOne({ _id: oid, familyId });
  if (!doc) {
    return NextResponse.json({ error: "Document negăsit." }, { status: 404 });
  }
  const d = doc as unknown as { name: string; contentType: string; content: Buffer };
  const raw = d.content instanceof Buffer ? d.content : Buffer.from(d.content);
  const content = new Uint8Array(raw);
  const ext = d.contentType === "application/pdf" ? "pdf" : d.contentType.startsWith("image/") ? d.contentType.split("/")[1] || "jpg" : "bin";
  const safeName = (d.name || "document").replace(/[^a-zA-Z0-9._\s-]/g, "_").trim().slice(0, 100) || "document";
  const filename = `${safeName}.${ext}`;
  return new NextResponse(content, {
    headers: {
      "Content-Type": d.contentType || "application/octet-stream",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}

/** DELETE: șterge un document și îl scoate din lista copilului. */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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
  const { id } = await params;
  let oid: ObjectId;
  try {
    oid = new ObjectId(id);
  } catch {
    return NextResponse.json({ error: "ID invalid." }, { status: 400 });
  }
  const doc = await db.collection("child_documents").findOne({ _id: oid, familyId });
  if (!doc) {
    return NextResponse.json({ error: "Document negăsit." }, { status: 404 });
  }
  const childId = (doc as unknown as { childId: ObjectId }).childId;
  await db.collection("child_documents").deleteOne({ _id: oid });
  const child = await db.collection("children").findOne({ _id: childId, familyId });
  const docName = (doc as { name?: string }).name ?? "document";
  const childName = child ? (child as { name?: string }).name ?? "copil" : "copil";
  if (child) {
    const list = ((child as { travelDocuments?: { id: string; name: string }[] }).travelDocuments || []).filter(
      (t) => String(t.id) !== id
    );
    await db.collection("children").updateOne(
      { _id: childId, familyId },
      { $set: { travelDocuments: list, updatedAt: new Date() } }
    );
  }
  const displayName = await getParentDisplayName(db, familyId, session.user.id, session.user.parentType ?? undefined);
  try {
    await notifyFamilyConfigUpdated(db, familyId, displayName, `a șters documentul „${docName}" de la copilul ${childName}.`);
  } catch (_) {}
  return NextResponse.json({ ok: true });
}
