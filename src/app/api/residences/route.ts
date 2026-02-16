import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { auth } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";
import { getActiveFamily } from "@/lib/family";
import { getFamilyPlan, isWithinLimit } from "@/lib/plan";
import { notifyFamilyConfigUpdated } from "@/lib/email";
import type { Residence } from "@/types/family";

function toResidence(doc: { _id: unknown; familyId: string; name: string; order?: number | null; createdAt: Date; updatedAt: Date }): Residence {
  return {
    id: String(doc._id),
    familyId: String(doc.familyId),
    name: doc.name,
    order: doc.order ?? undefined,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
}

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

/** GET: locuințele din familia utilizatorului. */
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
  }
  const db = await getDb();
  const familyId = await getFamilyIdForUser(db, session.user.id);
  if (!familyId) {
    return NextResponse.json({ residences: [] });
  }
  const family = await getActiveFamily(db, familyId);
  if (!family) {
    return NextResponse.json(
      { error: "Familia nu există sau a fost dezactivată. Contactați suportul." },
      { status: 403 }
    );
  }
  const docs = await db
    .collection("residences")
    .find({ familyId })
    .sort({ order: 1, createdAt: 1 })
    .toArray();
  const residences = docs.map((d) => toResidence(d as Parameters<typeof toResidence>[0]));
  return NextResponse.json({ residences });
}

/** POST: adaugă o locuință. */
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
  }
  const db = await getDb();
  const familyId = await getFamilyIdForUser(db, session.user.id);
  if (!familyId) {
    return NextResponse.json({ error: "Nu aparțineți unei familii. Creați mai întâi familia." }, { status: 400 });
  }
  const family = await getActiveFamily(db, familyId);
  if (!family) {
    return NextResponse.json(
      { error: "Familia nu există sau a fost dezactivată. Contactați suportul." },
      { status: 403 }
    );
  }
  const plan = await getFamilyPlan(db, familyId);
  const currentCount = await db.collection("residences").countDocuments({ familyId });
  if (!isWithinLimit(plan, "maxResidences", currentCount)) {
    const max = getMaxResidences(plan);
    return NextResponse.json(
      { error: `Planul Free permite o singură locație. Treci la Pro pentru locații multiple.` },
      { status: 403 }
    );
  }
  const body = await request.json().catch(() => ({}));
  const name = typeof body.name === "string" ? body.name.trim() : "";
  if (!name) {
    return NextResponse.json({ error: "Numele locuinței este obligatoriu." }, { status: 400 });
  }
  const now = new Date();
  const { insertedId } = await db.collection("residences").insertOne({
    familyId,
    name,
    order: typeof body.order === "number" ? body.order : undefined,
    createdAt: now,
    updatedAt: now,
  });
  const doc = await db.collection("residences").findOne({ _id: insertedId });
  const d = doc as unknown as Parameters<typeof toResidence>[0];
  try {
    const updatedByName = session.user.name?.trim() || session.user.email?.split("@")[0] || null;
    await notifyFamilyConfigUpdated(db, familyId, updatedByName);
  } catch (_) {}
  return NextResponse.json(toResidence(d));
}

/** DELETE: șterge o locuință (doar din familia userului). */
export async function DELETE(request: Request) {
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
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "ID lipsă." }, { status: 400 });
  }
  let oid: ObjectId;
  try {
    oid = new ObjectId(id);
  } catch {
    return NextResponse.json({ error: "ID invalid." }, { status: 400 });
  }
  const result = await db.collection("residences").deleteOne({ _id: oid, familyId });
  if (result.deletedCount === 0) {
    return NextResponse.json({ error: "Locuință negăsită sau nu vă aparține." }, { status: 404 });
  }
  try {
    const updatedByName = session.user.name?.trim() || session.user.email?.split("@")[0] || null;
    await notifyFamilyConfigUpdated(db, familyId, updatedByName);
  } catch (_) {}
  return NextResponse.json({ ok: true });
}
