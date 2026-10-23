import { getActiveFamily } from "@/lib/family";
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { auth } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";
import { addDays } from "date-fns";
import { sendBlockedDayAttemptNotification, sendNewEventNotification, sendEventUpdatedNotification } from "@/lib/notify";
import { logFamilyActivity } from "@/lib/activity";
import { getParentDisplayName } from "@/lib/parent-display-name";
import type { ScheduleEvent, ParentType, LocationType } from "@/types/events";
import { getFamilyEventLabels, formatEventLabel, locationName, type FamilyEventLabels } from "@/lib/family-labels";
import { ensureEventResidenceIds, getFamilyResidences } from "@/lib/event-residences";

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
  caretakerLabel?: string | null;
  residenceId?: string | null;
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
    caretakerLabel: doc.caretakerLabel ?? undefined,
    residenceId: doc.residenceId ?? undefined,
    created_by: doc.created_by ?? "",
    created_at: doc.created_at.toISOString(),
  };
}

const PARENTS: ParentType[] = ["tata", "mama", "together", "other"];
const LOCATIONS: LocationType[] = ["tunari", "otopeni", "other"];

/**
 * Normalizează locația trimisă de client. Cu `residenceId` (locuință a familiei) salvăm
 * location "other" + numele locuinței ca rezervă + ID-ul stabil. Fără el, locația e text liber.
 */
async function resolveLocationInput(
  db: Awaited<ReturnType<typeof getDb>>,
  familyId: ObjectId,
  input: { location?: unknown; locationLabel?: unknown; residenceId?: unknown }
): Promise<{ location: LocationType; locationLabel: string | null; residenceId: string | null } | { error: string }> {
  if (typeof input.residenceId === "string" && input.residenceId) {
    const residences = await getFamilyResidences(db, familyId);
    const res = residences.find((r) => r.id === input.residenceId);
    if (!res) return { error: "Locuința nu aparține familiei." };
    return { location: "other", locationLabel: res.name, residenceId: res.id };
  }
  if (!LOCATIONS.includes(input.location as LocationType)) return { error: "Locație invalidă." };
  const label = typeof input.locationLabel === "string" ? input.locationLabel.trim().slice(0, 120) || null : null;
  return { location: input.location as LocationType, locationLabel: label, residenceId: null };
}

function computeEventChanges(before: ScheduleEvent, after: ScheduleEvent, labels: FamilyEventLabels): string[] {
  const changes: string[] = [];
  if (before.date !== after.date) changes.push(`Data: ${before.date} → ${after.date}`);
  if (before.parent !== after.parent) {
    changes.push(
      `Cu cine: ${labels.parentLabels[before.parent] ?? before.parent} → ${labels.parentLabels[after.parent] ?? after.parent}`
    );
  }
  const oldLocation = locationName(before.location, before.locationLabel, labels, before.residenceId);
  const newLocation = locationName(after.location, after.locationLabel, labels, after.residenceId);
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
  if (!(await getActiveFamily(db, familyId))) {
    return NextResponse.json({ error: "Familia nu există sau a fost dezactivată." }, { status: 403 });
  }
  await ensureEventResidenceIds(db, familyId);
  const docs = await db
    .collection("schedule_events")
    .find({ familyId })
    .sort({ date: 1 })
    .toArray();
  const events = docs.map((d) => toEvent(d as Parameters<typeof toEvent>[0]));
  return NextResponse.json(events);
}

/**
 * Returns true if an event (eventDate, optional eventStartTime/endTime) overlaps
 * with a blocked period that has optional startTime/endTime.
 *
 * Rules:
 * - Interior days (strictly between start and end dates) → always blocked.
 * - Start day: if blockStartTime is set, only block when the event overlaps
 *   [blockStartTime, ∞). Full-day events (no time) on a partial start day
 *   are NOT blocked so the user can still schedule morning time.
 * - End day: if blockEndTime is set, only block when the event overlaps
 *   [0:00, blockEndTime). Full-day events on a partial end day are NOT blocked.
 * - If both dates coincide (single-day partial block), apply both constraints.
 */
function isEventBlockedByPeriod(
  eventDate: string,
  eventStartTime: string | null | undefined,
  eventEndTime: string | null | undefined,
  blockStartDate: string,
  blockEndDate: string,
  blockStartTime: string | null | undefined,
  blockEndTime: string | null | undefined,
): boolean {
  if (eventDate < blockStartDate || eventDate > blockEndDate) return false;

  const isStartDay = eventDate === blockStartDate;
  const isEndDay = eventDate === blockEndDate;
  const isInterior = !isStartDay && !isEndDay;

  if (isInterior) return true;

  const hasBlockStart = !!blockStartTime;
  const hasBlockEnd = !!blockEndTime;
  const hasEventTime = !!eventStartTime || !!eventEndTime;

  // Single-day partial block
  if (isStartDay && isEndDay) {
    if (!hasBlockStart && !hasBlockEnd) return true;
    if (!hasEventTime) return false; // full-day event → allow on partial-day block
    const evS = eventStartTime ?? "00:00";
    const evE = eventEndTime ?? "23:59";
    const blS = blockStartTime ?? "00:00";
    const blE = blockEndTime ?? "23:59";
    return evS < blE && evE > blS;
  }

  // Start day only (multi-day block)
  if (isStartDay) {
    if (!hasBlockStart) return true;
    if (!hasEventTime) return false;
    const evE = eventEndTime ?? "23:59";
    return evE > blockStartTime!;
  }

  // End day only (multi-day block)
  if (isEndDay) {
    if (!hasBlockEnd) return true;
    if (!hasEventTime) return false;
    const evS = eventStartTime ?? "00:00";
    return evS < blockEndTime!;
  }

  return false;
}

/** Returnează { userId, parentType } al părintelui care a blocat ziua, sau null. */
function getBlockerForEventDate(
  dateStr: string,
  eventParent: ParentType,
  blocks: {
    userId: string;
    parentType: string;
    startDate: string;
    endDate: string;
    startTime?: string | null;
    endTime?: string | null;
  }[],
  eventStartTime?: string | null,
  eventEndTime?: string | null,
): { userId: string; parentType: ParentType } | null {
  const toCheck: ParentType[] =
    eventParent === "together" ? ["tata", "mama"] : eventParent === "other" ? [] : [eventParent];
  for (const block of blocks) {
    if (
      toCheck.includes(block.parentType as ParentType) &&
      isEventBlockedByPeriod(
        dateStr,
        eventStartTime,
        eventEndTime,
        block.startDate,
        block.endDate,
        block.startTime,
        block.endTime,
      )
    ) {
      return {
        userId: block.userId,
        parentType: block.parentType as ParentType,
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
  const { date, parent, location, locationLabel, residenceId, title, notes, startTime, endTime, caretakerLabel } = body;
  if (!date || parent == null || (location == null && !residenceId)) {
    return NextResponse.json(
      { error: "Data, părintele și locația sunt obligatorii." },
      { status: 400 }
    );
  }
  if (!PARENTS.includes(parent) || !/^\d{4}-\d{2}-\d{2}$/.test(String(date).slice(0, 10))) {
    return NextResponse.json({ error: "Date invalide." }, { status: 400 });
  }
  const caretakerLabelVal =
    parent === "other" && typeof caretakerLabel === "string" ? caretakerLabel.trim() || null : null;
  const dateStr = String(date).slice(0, 10);
  const db = await getDb();
  const familyId = new ObjectId(session.user.familyId);
  if (!(await getActiveFamily(db, familyId))) {
    return NextResponse.json({ error: "Familia nu există sau a fost dezactivată." }, { status: 403 });
  }

  const blocks = await db
    .collection("blocked_periods")
    .find({ familyId })
    .toArray();
  const blockList = (blocks as unknown as { userId: string; parentType: string; startDate: string; endDate: string; startTime?: string | null; endTime?: string | null }[]).map((b) => ({
    userId: String(b.userId),
    parentType: b.parentType,
    startDate: b.startDate,
    endDate: b.endDate,
    startTime: b.startTime ?? null,
    endTime: b.endTime ?? null,
  }));
  const blocker = getBlockerForEventDate(dateStr, parent as ParentType, blockList, startTime ?? null, endTime ?? null);
  if (blocker) {
    try {
      const attemptedBy =
        session.user.parentType && (session.user.parentType === "tata" || session.user.parentType === "mama")
          ? (await getFamilyEventLabels(db, familyId)).parentLabels[session.user.parentType]
          : "Cineva";
      await sendBlockedDayAttemptNotification(blocker.userId, attemptedBy, dateStr);
    } catch (_) {}
    return NextResponse.json(
      { error: `Nu poți adăuga: ${(await getFamilyEventLabels(db, familyId)).parentLabels[blocker.parentType] ?? "celălalt părinte"} are zilele blocate în acea perioadă.` },
      { status: 400 }
    );
  }

  const loc = await resolveLocationInput(db, familyId, { location, locationLabel, residenceId });
  if ("error" in loc) {
    return NextResponse.json({ error: loc.error }, { status: 400 });
  }

  const now = new Date();
  const { insertedId } = await db.collection("schedule_events").insertOne({
    familyId,
    date: dateStr,
    parent,
    location: loc.location,
    locationLabel: loc.locationLabel,
    residenceId: loc.residenceId,
    title: title ?? null,
    notes: notes ?? null,
    startTime: startTime ?? null,
    endTime: endTime ?? null,
    caretakerLabel: caretakerLabelVal,
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
    label: formatEventLabel(createdEvent, await getFamilyEventLabels(db, familyId)),
  });
  return NextResponse.json(createdEvent);
}

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
  }
  const body = await request.json();
  const { id, date, parent, location, locationLabel, residenceId, title, notes, startTime, endTime, caretakerLabel, allowPastEdit, pastEditReason } = body;
  if (parent != null && !PARENTS.includes(parent)) {
    return NextResponse.json({ error: "Părinte invalid." }, { status: 400 });
  }
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
  if (!(await getActiveFamily(db, familyId))) {
    return NextResponse.json({ error: "Familia nu există sau a fost dezactivată." }, { status: 403 });
  }
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
  const blockList = (blocks as unknown as { userId: string; parentType: string; startDate: string; endDate: string; startTime?: string | null; endTime?: string | null }[]).map((b) => ({
    userId: String(b.userId),
    parentType: b.parentType,
    startDate: b.startDate,
    endDate: b.endDate,
    startTime: b.startTime ?? null,
    endTime: b.endTime ?? null,
  }));
  const finalStartTime = startTime !== undefined ? startTime : currentEvent.startTime;
  const finalEndTime = endTime !== undefined ? endTime : currentEvent.endTime;
  const blocker = getBlockerForEventDate(finalDate, finalParent, blockList, finalStartTime ?? null, finalEndTime ?? null);
  if (blocker) {
    try {
      const attemptedBy =
        session.user.parentType && (session.user.parentType === "tata" || session.user.parentType === "mama")
          ? (await getFamilyEventLabels(db, familyId)).parentLabels[session.user.parentType]
          : "Cineva";
      await sendBlockedDayAttemptNotification(blocker.userId, attemptedBy, finalDate);
    } catch (_) {}
    return NextResponse.json(
      { error: `Nu poți muta evenimentul: ${(await getFamilyEventLabels(db, familyId)).parentLabels[blocker.parentType] ?? "celălalt părinte"} are zilele blocate în acea perioadă.` },
      { status: 400 }
    );
  }

  const update: Record<string, unknown> = {};
  if (date != null) update.date = String(date).slice(0, 10);
  if (parent != null) update.parent = parent;
  if (location != null || residenceId) {
    const loc = await resolveLocationInput(db, familyId, { location, locationLabel, residenceId });
    if ("error" in loc) {
      return NextResponse.json({ error: loc.error }, { status: 400 });
    }
    update.location = loc.location;
    update.locationLabel = loc.locationLabel;
    update.residenceId = loc.residenceId;
  } else if (locationLabel !== undefined) {
    update.locationLabel = typeof locationLabel === "string" ? locationLabel.trim().slice(0, 120) || null : null;
  }
  if (title !== undefined) update.title = title ?? null;
  if (notes !== undefined) update.notes = notes ?? null;
  if (startTime !== undefined) update.startTime = startTime ?? null;
  if (endTime !== undefined) update.endTime = endTime ?? null;
  if (caretakerLabel !== undefined || parent !== undefined) {
    const effectiveParent = parent != null ? parent : currentEvent.parent;
    update.caretakerLabel =
      effectiveParent === "other" && typeof caretakerLabel === "string"
        ? caretakerLabel.trim() || null
        : effectiveParent === "other"
          ? currentEvent.caretakerLabel ?? null
          : null;
  }

  const result = await db.collection("schedule_events").findOneAndUpdate(
    { _id: oid, familyId },
    { $set: update },
    { returnDocument: "after" }
  );
  if (!result) {
    return NextResponse.json({ error: "Eveniment negăsit." }, { status: 404 });
  }
  const updatedEvent = toEvent(result as Parameters<typeof toEvent>[0]);
  const familyLabels = await getFamilyEventLabels(db, familyId);
  const changeSummary = computeEventChanges(currentEvent, updatedEvent, familyLabels);
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
    label: formatEventLabel(updatedEvent, familyLabels),
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
  if (!(await getActiveFamily(db, familyId))) {
    return NextResponse.json({ error: "Familia nu există sau a fost dezactivată." }, { status: 403 });
  }
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
