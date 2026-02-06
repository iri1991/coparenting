import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { auth } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";
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

/** GET: toate perioadele blocate (pentru calendar). Opțional ?mine=1 doar ale mele. */
export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
  }
  const { searchParams } = new URL(request.url);
  const mineOnly = searchParams.get("mine") === "1";
  const db = await getDb();
  const filter = mineOnly ? { userId: session.user.id } : {};
  const docs = await db
    .collection("blocked_periods")
    .find(filter)
    .sort({ startDate: 1 })
    .toArray();
  const list = docs.map((d) => toBlock(d as Parameters<typeof toBlock>[0]));
  return NextResponse.json(list);
}

/** POST: adaugă o perioadă blocată (doar pentru userul curent). */
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
  }
  const parentType = session.user.parentType;
  if (!parentType || (parentType !== "tata" && parentType !== "mama")) {
    return NextResponse.json(
      { error: "Setează mai întâi dacă ești Irinel sau Andreea (profil)." },
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
  const now = new Date();
  const { insertedId } = await db.collection("blocked_periods").insertOne({
    userId: session.user.id,
    parentType,
    startDate: start,
    endDate: end,
    note: note ?? null,
    createdAt: now,
  });
  const doc = await db.collection("blocked_periods").findOne({ _id: insertedId });
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
  const result = await db.collection("blocked_periods").deleteOne({
    _id: oid,
    userId: session.user.id,
  });
  if (result.deletedCount === 0) {
    return NextResponse.json({ error: "Perioadă negăsită sau nu ți se aparține." }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
