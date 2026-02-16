import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { auth } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";
import { getActiveFamily } from "@/lib/family";
import { getFamilyPlan, getMaxChildren, isWithinLimit } from "@/lib/plan";
import { notifyFamilyConfigUpdated } from "@/lib/email";
import type { Child, TravelDocumentRef } from "@/types/family";

function toChild(doc: {
  _id: unknown;
  familyId: string;
  name: string;
  allergies?: string | null;
  travelDocuments?: TravelDocumentRef[] | { id: string; name: string }[] | string | null;
  notes?: string | null;
  createdAt: Date;
  updatedAt: Date;
}): Child {
  const raw = doc.travelDocuments;
  const travelDocuments: TravelDocumentRef[] | undefined = Array.isArray(raw)
    ? raw.map((t) => (typeof t === "object" && t && "id" in t && "name" in t ? { id: String(t.id), name: String(t.name) } : null)).filter(Boolean) as TravelDocumentRef[]
    : undefined;
  return {
    id: String(doc._id),
    familyId: String(doc.familyId),
    name: doc.name,
    allergies: doc.allergies ?? undefined,
    travelDocuments: travelDocuments?.length ? travelDocuments : undefined,
    notes: doc.notes ?? undefined,
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

/** GET: copiii din familia utilizatorului. */
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
  }
  const db = await getDb();
  const familyId = await getFamilyIdForUser(db, session.user.id);
  if (!familyId) {
    return NextResponse.json({ children: [] });
  }
  const family = await getActiveFamily(db, familyId);
  if (!family) {
    return NextResponse.json(
      { error: "Familia nu există sau a fost dezactivată. Contactați suportul." },
      { status: 403 }
    );
  }
  const docs = await db
    .collection("children")
    .find({ familyId })
    .sort({ createdAt: 1 })
    .toArray();
  const children = docs.map((d) => toChild(d as Parameters<typeof toChild>[0]));
  return NextResponse.json({ children });
}

/** POST: adaugă un copil. */
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
  const currentCount = await db.collection("children").countDocuments({ familyId });
  if (!isWithinLimit(plan, "maxChildren", currentCount)) {
    const max = getMaxChildren(plan);
    return NextResponse.json(
      { error: `Planul Free permite maxim ${max} copil. Treceți la Pro pentru până la 3 copii.` },
      { status: 403 }
    );
  }
  const body = await request.json().catch(() => ({}));
  const name = typeof body.name === "string" ? body.name.trim() : "";
  if (!name) {
    return NextResponse.json({ error: "Numele copilului este obligatoriu." }, { status: 400 });
  }
  const now = new Date();
  const { insertedId } = await db.collection("children").insertOne({
    familyId,
    name,
    allergies: null,
    travelDocuments: [],
    notes: null,
    createdAt: now,
    updatedAt: now,
  });
  const doc = await db.collection("children").findOne({ _id: insertedId });
  const d = doc as unknown as Parameters<typeof toChild>[0];
  try {
    const updatedByName = session.user.name?.trim() || session.user.email?.split("@")[0] || null;
    await notifyFamilyConfigUpdated(db, familyId, updatedByName);
  } catch (_) {}
  return NextResponse.json(toChild(d));
}

/** DELETE: șterge un copil (doar din familia userului). */
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
  const result = await db.collection("children").deleteOne({ _id: oid, familyId });
  if (result.deletedCount === 0) {
    return NextResponse.json({ error: "Copil negăsit sau nu vă aparține." }, { status: 404 });
  }
  try {
    const updatedByName = session.user.name?.trim() || session.user.email?.split("@")[0] || null;
    await notifyFamilyConfigUpdated(db, familyId, updatedByName);
  } catch (_) {}
  return NextResponse.json({ ok: true });
}

/** PATCH: actualizează un copil (nume, alergii, documente călătorie, note). */
export async function PATCH(request: Request) {
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
  const body = await request.json().catch(() => ({}));
  const update: Record<string, unknown> = { updatedAt: new Date() };
  if (typeof body.name === "string") update.name = body.name.trim();
  if (typeof body.allergies === "string") update.allergies = body.allergies.trim() || null;
  if (typeof body.notes === "string") update.notes = body.notes.trim() || null;
  if (Object.keys(update).length <= 1) {
    return NextResponse.json({ error: "Trimite cel puțin un câmp de actualizat (name, allergies, notes)." }, { status: 400 });
  }
  const result = await db.collection("children").updateOne({ _id: oid, familyId }, { $set: update });
  if (result.matchedCount === 0) {
    return NextResponse.json({ error: "Copil negăsit sau nu vă aparține." }, { status: 404 });
  }
  const doc = await db.collection("children").findOne({ _id: oid });
  const d = doc as unknown as Parameters<typeof toChild>[0];
  try {
    const updatedByName = session.user.name?.trim() || session.user.email?.split("@")[0] || null;
    await notifyFamilyConfigUpdated(db, familyId, updatedByName);
  } catch (_) {}
  return NextResponse.json(toChild(d));
}
