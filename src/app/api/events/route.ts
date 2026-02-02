import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";
import { sendNewEventNotification } from "@/lib/notify";
import type { ScheduleEvent, ParentType, LocationType } from "@/types/events";

function deriveFromType(
  type: string
): { parent: ParentType; location: LocationType } {
  switch (type) {
    case "tunari":
      return { parent: "tata", location: "tunari" };
    case "otopeni":
      return { parent: "mama", location: "otopeni" };
    case "together":
      return { parent: "together", location: "other" };
    default:
      return { parent: "tata", location: "other" };
  }
}

function toEvent(doc: {
  _id: unknown;
  date: string;
  type?: string | null;
  parent?: string | null;
  location?: string | null;
  locationLabel?: string | null;
  title?: string | null;
  notes?: string | null;
  startTime?: string | null;
  endTime?: string | null;
  created_by: string | null;
  created_at: Date;
}): ScheduleEvent {
  const hasNew = doc.parent != null && doc.location != null;
  const parent = (hasNew ? doc.parent : deriveFromType(doc.type ?? "other").parent) as ParentType;
  const location = (hasNew ? doc.location : deriveFromType(doc.type ?? "other").location) as LocationType;
  return {
    id: String(doc._id),
    date: doc.date,
    parent,
    location,
    locationLabel: doc.locationLabel ?? undefined,
    title: doc.title ?? undefined,
    notes: doc.notes ?? undefined,
    startTime: doc.startTime ?? undefined,
    endTime: doc.endTime ?? undefined,
    created_by: doc.created_by ?? "",
    created_at: doc.created_at.toISOString(),
  };
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
  }
  const db = await getDb();
  const docs = await db
    .collection("schedule_events")
    .find({})
    .sort({ date: 1 })
    .toArray();
  const events = docs.map((d) => toEvent(d as Parameters<typeof toEvent>[0]));
  return NextResponse.json(events);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
  }
  const body = await request.json();
  const { date, parent, location, locationLabel, title, notes, startTime, endTime } = body;
  if (!date || parent == null || location == null) {
    return NextResponse.json(
      { error: "Data, părintele și locația sunt obligatorii." },
      { status: 400 }
    );
  }
  const db = await getDb();
  const now = new Date();
  const { insertedId } = await db.collection("schedule_events").insertOne({
    date: String(date).slice(0, 10),
    parent,
    location,
    locationLabel: locationLabel ?? null,
    title: title ?? null,
    notes: notes ?? null,
    startTime: startTime ?? null,
    endTime: endTime ?? null,
    created_by: session.user.id,
    created_at: now,
  });
  const doc = await db.collection("schedule_events").findOne({ _id: insertedId });
  const createdEvent = toEvent(doc as Parameters<typeof toEvent>[0]);
  try {
    await sendNewEventNotification(createdEvent);
  } catch (_) {
    // nu blochează răspunsul dacă notificarea eșuează
  }
  return NextResponse.json(createdEvent);
}

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
  }
  const body = await request.json();
  const { id, date, parent, location, locationLabel, title, notes, startTime, endTime } = body;
  if (!id) {
    return NextResponse.json({ error: "ID lipsă." }, { status: 400 });
  }
  const { ObjectId } = await import("mongodb");
  let oid: import("mongodb").ObjectId;
  try {
    oid = new ObjectId(id);
  } catch {
    return NextResponse.json({ error: "ID invalid." }, { status: 400 });
  }
  const db = await getDb();
  const update: Record<string, unknown> = {};
  if (date != null) update.date = String(date).slice(0, 10);
  if (parent != null) update.parent = parent;
  if (location != null) update.location = location;
  if (locationLabel !== undefined) update.locationLabel = locationLabel ?? null;
  if (title !== undefined) update.title = title ?? null;
  if (notes !== undefined) update.notes = notes ?? null;
  if (startTime !== undefined) update.startTime = startTime ?? null;
  if (endTime !== undefined) update.endTime = endTime ?? null;
  const result = await db.collection("schedule_events").findOneAndUpdate(
    { _id: oid },
    { $set: update },
    { returnDocument: "after" }
  );
  if (!result) {
    return NextResponse.json({ error: "Eveniment negăsit." }, { status: 404 });
  }
  return NextResponse.json(toEvent(result as Parameters<typeof toEvent>[0]));
}

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
  const { ObjectId } = await import("mongodb");
  let oid: import("mongodb").ObjectId;
  try {
    oid = new ObjectId(id);
  } catch {
    return NextResponse.json({ error: "ID invalid." }, { status: 400 });
  }
  const db = await getDb();
  const result = await db.collection("schedule_events").deleteOne({ _id: oid });
  if (result.deletedCount === 0) {
    return NextResponse.json({ error: "Eveniment negăsit." }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
