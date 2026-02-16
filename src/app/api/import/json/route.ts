import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { auth } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";
import type { ParentType, LocationType } from "@/types/events";

const PARENTS: ParentType[] = ["tata", "mama", "together"];
const LOCATIONS: LocationType[] = ["tunari", "otopeni", "other"];

function isValidParent(p: unknown): p is ParentType {
  return typeof p === "string" && PARENTS.includes(p as ParentType);
}
function isValidLocation(l: unknown): l is LocationType {
  return typeof l === "string" && LOCATIONS.includes(l as LocationType);
}

function parseEvent(raw: unknown): {
  date: string;
  parent: ParentType;
  location: LocationType;
  locationLabel?: string;
  title?: string;
  notes?: string;
  startTime?: string;
  endTime?: string;
} | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const date = typeof o.date === "string" ? o.date.slice(0, 10) : null;
  const parent = isValidParent(o.parent) ? o.parent : null;
  const location = isValidLocation(o.location) ? o.location : null;
  if (!date || !parent || !location || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;
  return {
    date,
    parent,
    location,
    locationLabel: typeof o.locationLabel === "string" ? o.locationLabel.trim() || undefined : undefined,
    title: typeof o.title === "string" ? o.title.trim() || undefined : undefined,
    notes: typeof o.notes === "string" ? o.notes.trim() || undefined : undefined,
    startTime: typeof o.startTime === "string" ? o.startTime.trim() || undefined : undefined,
    endTime: typeof o.endTime === "string" ? o.endTime.trim() || undefined : undefined,
  };
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

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON invalid." }, { status: 400 });
  }
  const arr = Array.isArray(body) ? body : [body];
  const events = arr.map(parseEvent).filter((e): e is NonNullable<typeof e> => e !== null);
  if (events.length === 0) {
    return NextResponse.json(
      { error: "Nu s-au găsit evenimente valide (date, parent, location obligatorii)." },
      { status: 400 }
    );
  }

  const db = await getDb();
  const familyId = new ObjectId(session.user.familyId);
  const now = new Date();

  for (const ev of events) {
    await db.collection("schedule_events").insertOne({
      familyId,
      date: ev.date,
      parent: ev.parent,
      location: ev.location,
      locationLabel: ev.locationLabel ?? null,
      title: ev.title ?? null,
      notes: ev.notes ?? null,
      startTime: ev.startTime ?? null,
      endTime: ev.endTime ?? null,
      created_by: session.user.id,
      created_at: now,
    });
  }

  return NextResponse.json({
    imported: events.length,
    message: `Au fost importate ${events.length} evenimente.`,
  });
}
