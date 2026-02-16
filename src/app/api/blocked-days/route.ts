import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { auth } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";
import { getActiveFamily } from "@/lib/family";
import { getFamilyPlan, canAddBlockedDayThisMonth } from "@/lib/plan";
import { logFamilyActivity } from "@/lib/activity";
import type { BlockedPeriod } from "@/types/blocked";
import type { ParentType } from "@/types/events";

function toBlock(doc: {
  _id: unknown;
  userId: string;
  parentType: string;
  startDate: string;
  endDate: string;
  note?: string | null;
  createdAt: Date;
}): BlockedPeriod {
  return {
    id: String(doc._id),
    userId: String(doc.userId),
    parentType: doc.parentType as ParentType,
    startDate: doc.startDate,
    endDate: doc.endDate,
    note: doc.note ?? undefined,
    createdAt: doc.createdAt.toISOString(),
  };
}

/** GET: toate perioadele blocate (pentru calendar). Opțional ?mine=1 doar ale mele. Doar din familia userului. */
export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
  }
  const db = await getDb();
  const filter: { userId?: string; familyId?: ObjectId } = {};
  if (session.user.familyId) {
    const familyId = new ObjectId(session.user.familyId);
    const family = await getActiveFamily(db, familyId);
    if (!family) {
      return NextResponse.json(
        { error: "Familia nu există sau a fost dezactivată. Contactați suportul." },
        { status: 403 }
      );
    }
    filter.familyId = familyId;
  }
  const { searchParams } = new URL(request.url);
  const mineOnly = searchParams.get("mine") === "1";
  if (mineOnly) filter.userId = session.user.id;
  const docs = await db
    .collection("blocked_periods")
    .find(filter)
    .sort({ startDate: 1 })
    .toArray();
  const list = docs.map((d) => toBlock(d as Parameters<typeof toBlock>[0]));
  return NextResponse.json(list);
}

/** POST: adaugă o perioadă blocată (doar pentru userul curent, în familia sa). */
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
  }
  if (!session.user.familyId) {
    return NextResponse.json(
      { error: "Creați sau aderați la o familie mai întâi." },
      { status: 400 }
    );
  }
  const parentType = session.user.parentType;
  if (!parentType || (parentType !== "tata" && parentType !== "mama")) {
    return NextResponse.json(
      { error: "Setează în Configurare rolul tău (numele primului sau al doilea părinte)." },
      { status: 400 }
    );
  }
  const body = await request.json();
  const { startDate, endDate, note } = body;
  const start = typeof startDate === "string" ? startDate.slice(0, 10) : "";
  const end = typeof endDate === "string" ? endDate.slice(0, 10) : "";
  if (!start || !end || start > end) {
    return NextResponse.json(
      { error: "Perioada invalidă: startDate și endDate (YYYY-MM-DD) cu start <= end." },
      { status: 400 }
    );
  }
  const db = await getDb();
  const familyId = new ObjectId(session.user.familyId!);
  const family = await getActiveFamily(db, familyId);
  if (!family) {
    return NextResponse.json(
      { error: "Familia nu există sau a fost dezactivată. Contactați suportul." },
      { status: 403 }
    );
  }
  const plan = await getFamilyPlan(db, familyId);
  const monthStart = start.slice(0, 7) + "-01";
  const monthEnd = start.slice(0, 7) + "-31";
  const countThisMonth = await db.collection("blocked_periods").countDocuments({
    familyId,
    userId: session.user.id,
    startDate: { $lte: monthEnd },
    endDate: { $gte: monthStart },
  });
  if (!canAddBlockedDayThisMonth(plan, countThisMonth)) {
    return NextResponse.json(
      { error: "Planul Free permite maxim 5 zile blocate pe lună. Treci la Pro pentru zile nelimitate." },
      { status: 403 }
    );
  }
  const now = new Date();
  const { insertedId } = await db.collection("blocked_periods").insertOne({
    familyId: new ObjectId(session.user.familyId),
    userId: session.user.id,
    parentType,
    startDate: start,
    endDate: end,
    note: note ?? null,
    createdAt: now,
  });
  const doc = await db.collection("blocked_periods").findOne({ _id: insertedId });
  const userLabel =
    session.user.parentType === "tata" ? "Tata" : session.user.parentType === "mama" ? "Mama" : session.user.name?.trim() || session.user.email?.split("@")[0] || "Utilizator";
  await logFamilyActivity(db, familyId, session.user.id, userLabel, "blocked_period_added", {
    startDate: start,
    endDate: end,
  });
  return NextResponse.json(toBlock(doc as Parameters<typeof toBlock>[0]));
}

/** DELETE: șterge o perioadă blocată (doar propriile). */
export async function DELETE(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
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
  const db = await getDb();
  if (session.user.familyId) {
    const family = await getActiveFamily(db, new ObjectId(session.user.familyId));
    if (!family) {
      return NextResponse.json(
        { error: "Familia nu există sau a fost dezactivată. Contactați suportul." },
        { status: 403 }
      );
    }
  }
  const filter: { _id: ObjectId; userId: string; familyId?: ObjectId } = { _id: oid, userId: session.user.id };
  if (session.user.familyId) filter.familyId = new ObjectId(session.user.familyId);
  const result = await db.collection("blocked_periods").deleteOne(filter);
  if (result.deletedCount === 0) {
    return NextResponse.json({ error: "Perioadă negăsită sau nu ți se aparține." }, { status: 404 });
  }
  if (session.user.familyId) {
    const familyId = new ObjectId(session.user.familyId);
    const userLabel =
      session.user.parentType === "tata" ? "Tata" : session.user.parentType === "mama" ? "Mama" : session.user.name?.trim() || session.user.email?.split("@")[0] || "Utilizator";
    await logFamilyActivity(db, familyId, session.user.id, userLabel, "blocked_period_deleted", {});
  }
  return NextResponse.json({ ok: true });
}
