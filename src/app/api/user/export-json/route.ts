import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { auth } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";

/** GET: exportă evenimentele familiei curente ca JSON (backup). */
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
  }
  if (!session.user.familyId) {
    return NextResponse.json({ error: "Nu ai o familie asociată." }, { status: 400 });
  }
  const db = await getDb();
  const familyId = new ObjectId(session.user.familyId);
  const events = await db
    .collection("schedule_events")
    .find({ familyId })
    .sort({ date: 1 })
    .toArray();
  const list = (events as unknown[]).map((doc: Record<string, unknown>) => ({
    id: String(doc._id),
    date: doc.date,
    parent: doc.parent,
    location: doc.location,
    locationLabel: doc.locationLabel ?? undefined,
    title: doc.title ?? undefined,
    notes: doc.notes ?? undefined,
    startTime: doc.startTime ?? undefined,
    endTime: doc.endTime ?? undefined,
    created_by: doc.created_by ?? undefined,
    created_at: doc.created_at instanceof Date ? doc.created_at.toISOString() : doc.created_at,
  }));
  return new NextResponse(JSON.stringify(list, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": 'attachment; filename="homesplit-events.json"',
    },
  });
}
