import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { auth } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";
import { addDays } from "date-fns";
import { sendBlockedDayAttemptNotification, sendNewEventNotification, sendEventUpdatedNotification } from "@/lib/notify";
import { logFamilyActivity } from "@/lib/activity";
import { getParentDisplayName } from "@/lib/parent-display-name";
import type { ScheduleEvent, ParentType, LocationType } from "@/types/events";
import { PARENT_LABELS } from "@/types/events";
import { getEventDisplayLabel } from "@/types/events";
import { LOCATION_LABELS } from "@/types/events";

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

function displayLocation(location: LocationType, locationLabel?: string | null): string {
  if (location === "other" && locationLabel?.trim()) return locationLabel.trim();
  return LOCATION_LABELS[location] ?? location;
}

function computeEventChanges(before: ScheduleEvent, after: ScheduleEvent): string[] {
  const changes: string[] = [];
  if (before.date !== after.date) changes.push(`Data: ${before.date} → ${after.date}`);
  if (before.parent !== after.parent) {
    changes.push(
      `Cu cine: ${PARENT_LABELS[before.parent] ?? before.parent} → ${PARENT_LABELS[after.parent] ?? after.parent}`
    );
  }
  const oldLocation = displayLocation(before.location, before.locationLabel);
  const newLocation = displayLocation(after.location, after.locationLabel);
  if (oldLocation !== newLocation) changes.push(`Locație: ${oldLocation} → ${newLocation}`);
  if ((before.title ?? "") !== (after.title ?? "")) {
    changes.push(`Titlu: ${before.title?.trim() || "—"} → ${after.title?.trim() || "—"}`);
  }
  if ((before.startTime ?? "") !== (after.startTime ?? "") || (before.endTime ?? "") !== (after.endTime ?? "")) {
    const oldTime = [before.startTime, before.endTime].filter(Boolean).join(" – ") || "—";
    const newTime = [after.startTime, after.endTime].filter(Boolean).join(" – ") || "—";
    changes.push(`Orar: ${oldTime} → ${newTime}`);
  }
  if ((before.notes ?? "") !== (after.notes ?? "")) {
    changes.push("Note actualizate");
  }
  return changes;
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
  }
  if (!session.user.familyId) {
    return NextResponse.json({ events: [] });
  }
  const db = await getDb();
  const familyId = new ObjectId(session.user.familyId);
  const docs = await db
    .collection("schedule_events")
    .find({ familyId })
    .sort({ date: 1 })
    .toArray();
  const events = docs.map((d) => toEvent(d as Parameters<typeof toEvent>[0]));
  return NextResponse.json(events);
}

function isDateInBlock(dateStr: string, startDate: string, endDate: string): boolean {
  return dateStr >= startDate && dateStr <= endDate;
}

/** Returnează { userId, parentLabel } al părintelui care a blocat ziua, sau null. */
function getBlockerForEventDate(
  dateStr: string,
  eventParent: ParentType,
  blocks: { userId: string; parentType: string; startDate: string; endDate: string }[]
): { userId: string; parentLabel: string } | null {
  const toCheck: ParentType[] =
    eventParent === "together" ? ["tata", "mama"] : [eventParent];
  for (const block of blocks) {
    if (toCheck.includes(block.parentType as ParentType) && isDateInBlock(dateStr, block.startDate, block.endDate)) {
      return {
        userId: block.userId,
        parentLabel: PARENT_LABELS[block.parentType as ParentType],
      };
    }
  }
  return null;
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
  }
  if (!session.user.familyId) {
    return NextResponse.json(
      { error: "Creați sau aderați la o familie mai întâi (Configurare)." },
      { status: 400 }
    );
  }
  const body = await request.json();
  const { date, parent, location, locationLabel, title, notes, startTime, endTime } = body;
  if (!date || parent == null || location == null) {
    return NextResponse.json(
      { error: "Data, părintele și locația sunt obligatorii." },
      { status: 400 }
    );
  }
  const dateStr = String(date).slice(0, 10);
  const db = await getDb();
  const familyId = new ObjectId(session.user.familyId);

  const blocks = await db
    .collection("blocked_periods")
    .find({ familyId })
    .toArray();
  const blockList = (blocks as unknown as { userId: string; parentType: string; startDate: string; endDate: string }[]).map((b) => ({
    userId: String(b.userId),
    parentType: b.parentType,
    startDate: b.startDate,
    endDate: b.endDate,
  }));
  const blocker = getBlockerForEventDate(dateStr, parent as ParentType, blockList);
  if (blocker) {
    try {
      const attemptedBy =
        session.user.parentType && (session.user.parentType === "tata" || session.user.parentType === "mama")
          ? PARENT_LABELS[session.user.parentType]
          : "Cineva";
      await sendBlockedDayAttemptNotification(blocker.userId, attemptedBy, dateStr);
    } catch (_) {}
    return NextResponse.json(
      { error: `Nu poți adăuga: ${blocker.parentLabel} are zilele blocate în acea perioadă.` },
      { status: 400 }
    );
  }

  const now = new Date();
  const { insertedId } = await db.collection("schedule_events").insertOne({
    familyId,
    date: dateStr,
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
    await sendNewEventNotification(db, familyId, session.user.id, createdEvent);
  } catch (_) {
    // nu blochează răspunsul dacă notificarea eșuează
  }
  const userLabel = await getParentDisplayName(db, familyId, session.user.id, session.user.parentType ?? undefined);
  await logFamilyActivity(db, familyId, session.user.id, userLabel, "event_created", {
    date: dateStr,
    label: getEventDisplayLabel(createdEvent),
  });
  return NextResponse.json(createdEvent);
}

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
  }
  const body = await request.json();
  const { id, date, parent, location, locationLabel, title, notes, startTime, endTime, allowPastEdit, pastEditReason } = body;
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
  if (!session.user.familyId) {
    return NextResponse.json({ error: "Neautorizat pentru familie." }, { status: 400 });
  }
  const familyId = new ObjectId(session.user.familyId);
  const current = await db.collection("schedule_events").findOne({ _id: oid, familyId });
  if (!current) {
    return NextResponse.json({ error: "Eveniment negăsit." }, { status: 404 });
  }
  const cur = current as unknown as Parameters<typeof toEvent>[0];
  const currentEvent = toEvent(cur);
  const todayStr = new Date().toISOString().slice(0, 10);
  const isPastEvent = currentEvent.date < todayStr;
  const normalizedPastReason = typeof pastEditReason === "string" ? pastEditReason.trim() : "";
  if (isPastEvent && (!allowPastEdit || normalizedPastReason.length < 8)) {
    return NextResponse.json(
      { error: "Eveniment din trecut: bifează modificarea excepțională și completează motivul (minim 8 caractere)." },
      { status: 403 }
    );
  }
  const finalDate = date != null ? String(date).slice(0, 10) : currentEvent.date;
  const finalParent = (parent != null ? parent : currentEvent.parent) as ParentType;

  const blocks = await db.collection("blocked_periods").find({ familyId }).toArray();
  const blockList = (blocks as unknown as { userId: string; parentType: string; startDate: string; endDate: string }[]).map((b) => ({
    userId: String(b.userId),
    parentType: b.parentType,
    startDate: b.startDate,
    endDate: b.endDate,
  }));
  const blocker = getBlockerForEventDate(finalDate, finalParent, blockList);
  if (blocker) {
    try {
      const attemptedBy =
        session.user.parentType && (session.user.parentType === "tata" || session.user.parentType === "mama")
          ? PARENT_LABELS[session.user.parentType]
          : "Cineva";
      await sendBlockedDayAttemptNotification(blocker.userId, attemptedBy, finalDate);
    } catch (_) {}
    return NextResponse.json(
      { error: `Nu poți muta evenimentul: ${blocker.parentLabel} are zilele blocate în acea perioadă.` },
      { status: 400 }
    );
  }

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
  const updatedEvent = toEvent(result as Parameters<typeof toEvent>[0]);
  const changeSummary = computeEventChanges(currentEvent, updatedEvent);
  const threeDaysLater = addDays(new Date(), 3).toISOString().slice(0, 10);
  const editorLabel = await getParentDisplayName(db, familyId, session.user.id, session.user.parentType ?? undefined);
  if ((finalDate >= todayStr && finalDate <= threeDaysLater) || isPastEvent) {
    try {
      await sendEventUpdatedNotification(db, familyId, updatedEvent, session.user.id, editorLabel, {
        changes: changeSummary,
        isPastEdit: isPastEvent,
        reason: isPastEvent ? normalizedPastReason : null,
      });
    } catch (_) {
      // nu blochează răspunsul
    }
  }
  await logFamilyActivity(db, familyId, session.user.id, editorLabel, "event_updated", {
    date: finalDate,
    label: getEventDisplayLabel(updatedEvent),
    changes: changeSummary,
    wasPastEvent: isPastEvent,
    reason: isPastEvent ? normalizedPastReason : null,
  });
  return NextResponse.json(updatedEvent);
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
  if (!session.user.familyId) {
    return NextResponse.json({ error: "Neautorizat." }, { status: 400 });
  }
  const familyId = new ObjectId(session.user.familyId);
  const existing = await db.collection("schedule_events").findOne({ _id: oid, familyId }, { projection: { date: 1 } });
  if (!existing) {
    return NextResponse.json({ error: "Eveniment negăsit." }, { status: 404 });
  }
  const eventDate = (existing as unknown as { date: string }).date;
  const todayStr = new Date().toISOString().slice(0, 10);
  if (eventDate < todayStr) {
    return NextResponse.json(
      { error: "Evenimentele din trecut nu pot fi șterse." },
      { status: 403 }
    );
  }
  const result = await db.collection("schedule_events").deleteOne({ _id: oid, familyId });
  if (result.deletedCount === 0) {
    return NextResponse.json({ error: "Eveniment negăsit." }, { status: 404 });
  }
  const userLabel = await getParentDisplayName(db, familyId, session.user.id, session.user.parentType ?? undefined);
  await logFamilyActivity(db, familyId, session.user.id, userLabel, "event_deleted", {
    date: eventDate,
  });
  return NextResponse.json({ ok: true });
}
