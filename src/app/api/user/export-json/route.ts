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
  const list = (events as unknown[]).map((doc: unknown) => {
    const d = doc as Record<string, unknown>;
    return {
      id: String(d._id),
      date: d.date,
      parent: d.parent,
      location: d.location,
      locationLabel: d.locationLabel ?? undefined,
      title: d.title ?? undefined,
      notes: d.notes ?? undefined,
      startTime: d.startTime ?? undefined,
      endTime: d.endTime ?? undefined,
      created_by: d.created_by ?? undefined,
      created_at: d.created_at instanceof Date ? d.created_at.toISOString() : d.created_at,
    };
  });
  return new NextResponse(JSON.stringify(list, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": 'attachment; filename="homesplit-events.json"',
    },
  });
}
