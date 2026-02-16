import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { auth } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";
import { getActiveFamily } from "@/lib/family";
import { notifyFamilyConfigUpdated } from "@/lib/email";
import { logFamilyActivity } from "@/lib/activity";
import type { Family } from "@/types/family";

function toFamily(doc: { _id: unknown; createdByUserId: string; memberIds: string[]; parent1Name?: string | null; parent2Name?: string | null; name?: string | null; plan?: string | null; active?: boolean; createdAt: Date; updatedAt: Date }): Family {
  const plan = doc.plan === "pro" || doc.plan === "family" ? doc.plan : undefined;
  return {
    id: String(doc._id),
    name: doc.name ?? undefined,
    createdByUserId: String(doc.createdByUserId),
    memberIds: (doc.memberIds || []).map(String),
    parent1Name: doc.parent1Name ?? undefined,
    parent2Name: doc.parent2Name ?? undefined,
    plan: plan ?? "free",
    active: doc.active !== false,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
}

/** GET: familia utilizatorului curent (user.familyId). */
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
  }
  const db = await getDb();
  const user = await db.collection("users").findOne(
    { _id: new ObjectId(session.user.id) },
    { projection: { familyId: 1 } }
  );
  const familyId = (user as { familyId?: unknown })?.familyId;
  if (!familyId) {
    return NextResponse.json({ family: null });
  }
  let oid: ObjectId;
  try {
    oid = new ObjectId(String(familyId));
  } catch {
    return NextResponse.json({ family: null });
  }
  const doc = await getActiveFamily(db, oid);
  if (!doc) {
    return NextResponse.json(
      { error: "Familia nu există sau a fost dezactivată. Contactați suportul." },
      { status: 403 }
    );
  }
  const d = doc as unknown as Parameters<typeof toFamily>[0];
  return NextResponse.json({ family: toFamily(d) });
}

/** POST: creează o familie nouă și leagă userul curent. */
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
  }
  const db = await getDb();
  const user = await db.collection("users").findOne(
    { _id: new ObjectId(session.user.id) },
    { projection: { familyId: 1 } }
  );
  if ((user as { familyId?: unknown })?.familyId) {
    return NextResponse.json(
      { error: "Aparțineți deja unei familii." },
      { status: 400 }
    );
  }
  const body = await request.json().catch(() => ({}));
  const { parent1Name, parent2Name, name } = body;
  const now = new Date();
  const { insertedId } = await db.collection("families").insertOne({
    createdByUserId: session.user.id,
    memberIds: [session.user.id],
    parent1Name: typeof parent1Name === "string" ? parent1Name.trim() || null : null,
    parent2Name: typeof parent2Name === "string" ? parent2Name.trim() || null : null,
    name: typeof name === "string" ? name.trim() || null : null,
    plan: "free",
    active: true,
    createdAt: now,
    updatedAt: now,
  });
  await db.collection("users").updateOne(
    { _id: new ObjectId(session.user.id) },
    { $set: { familyId: insertedId, updatedAt: now } }
  );
  const doc = await db.collection("families").findOne({ _id: insertedId });
  if (!doc) {
    return NextResponse.json({ error: "Eroare la creare" }, { status: 500 });
  }
  const d = doc as unknown as Parameters<typeof toFamily>[0];
  return NextResponse.json({ family: toFamily(d) });
}

/** PATCH: actualizează familia (nume părinți, nume familie). Doar membri. */
export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
  }
  const db = await getDb();
  const user = await db.collection("users").findOne(
    { _id: new ObjectId(session.user.id) },
    { projection: { familyId: 1 } }
  );
  const familyId = (user as { familyId?: unknown })?.familyId;
  if (!familyId) {
    return NextResponse.json({ error: "Nu aparțineți unei familii." }, { status: 400 });
  }
  let oid: ObjectId;
  try {
    oid = new ObjectId(String(familyId));
  } catch {
    return NextResponse.json({ error: "ID familie invalid." }, { status: 400 });
  }
  const family = await getActiveFamily(db, oid);
  if (!family) {
    return NextResponse.json(
      { error: "Familia nu există sau a fost dezactivată. Contactați suportul." },
      { status: 403 }
    );
  }
  const memberIds = (family.memberIds || []).map(String);
  if (!memberIds.includes(session.user.id)) {
    return NextResponse.json({ error: "Nu sunteți membru." }, { status: 403 });
  }
  const body = await request.json().catch(() => ({}));
  const update: Record<string, unknown> = { updatedAt: new Date() };
  if (typeof body.parent1Name === "string") update.parent1Name = body.parent1Name.trim() || null;
  if (typeof body.parent2Name === "string") update.parent2Name = body.parent2Name.trim() || null;
  if (typeof body.name === "string") update.name = body.name.trim() || null;
  await db.collection("families").updateOne({ _id: oid }, { $set: update });
  try {
    const updatedByName = session.user.name?.trim() || session.user.email?.split("@")[0] || null;
    await notifyFamilyConfigUpdated(db, oid, updatedByName);
  } catch (_) {}
  const userLabel =
    session.user.parentType === "tata" ? "Tata" : session.user.parentType === "mama" ? "Mama" : session.user.name?.trim() || session.user.email?.split("@")[0] || "Utilizator";
  await logFamilyActivity(db, oid, session.user.id, userLabel, "family_updated", {});
  const doc = await db.collection("families").findOne({ _id: oid });
  const d = doc as unknown as Parameters<typeof toFamily>[0];
  return NextResponse.json({ family: toFamily(d) });
}
