import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { auth } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";
import { getActiveFamily } from "@/lib/family";
import { getTodayDateStringEuropeBucharest, addDaysToDateString } from "@/lib/date-bucharest";
import type { ParentType } from "@/types/events";
import type { RitualResponsibleParent } from "@/types/ritual";
import {
  buildRitualReport,
  iterateDateRangeInclusive,
  RITUAL_REPORT_MAX_RANGE_DAYS,
  type RitualReportInputRitual,
} from "@/lib/ritual-report";

function deriveFromType(type: string): { parent: ParentType } {
  switch (type) {
    case "tunari":
      return { parent: "tata" };
    case "otopeni":
      return { parent: "mama" };
    case "together":
      return { parent: "together" };
    default:
      return { parent: "tata" };
  }
}

function eventParentFromDoc(doc: {
  type?: string | null;
  parent?: string | null;
}): ParentType | null {
  const hasNew = doc.parent != null;
  if (hasNew) {
    const p = doc.parent;
    if (p === "tata" || p === "mama" || p === "together") return p;
    return null;
  }
  return deriveFromType(doc.type ?? "other").parent;
}

function isValidYmd(s: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(s);
}

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Neautorizat" }, { status: 401 });

  const db = await getDb();
  const user = await db.collection("users").findOne(
    { _id: new ObjectId(session.user.id) },
    { projection: { familyId: 1 } }
  );
  const raw = (user as { familyId?: unknown })?.familyId;
  if (!raw) return NextResponse.json({ rows: [], from: "", to: "", note: "no_family" });

  let familyId: ObjectId;
  try {
    familyId = new ObjectId(String(raw));
  } catch {
    return NextResponse.json({ rows: [], from: "", to: "", note: "no_family" });
  }

  const family = await getActiveFamily(db, familyId);
  if (!family) return NextResponse.json({ rows: [], from: "", to: "", note: "no_family" });
  const memberIds = (family.memberIds ?? []).map(String);
  if (!memberIds.includes(session.user.id)) {
    return NextResponse.json({ rows: [], from: "", to: "", note: "no_family" });
  }

  const { searchParams } = new URL(request.url);
  const today = getTodayDateStringEuropeBucharest();
  let from = searchParams.get("from") || addDaysToDateString(today, -29);
  let to = searchParams.get("to") || today;

  if (!isValidYmd(from) || !isValidYmd(to)) {
    return NextResponse.json({ error: "Parametrii from și to trebuie YYYY-MM-DD." }, { status: 400 });
  }
  if (from > to) {
    const t = from;
    from = to;
    to = t;
  }

  const days = iterateDateRangeInclusive(from, to);
  if (days.length > RITUAL_REPORT_MAX_RANGE_DAYS) {
    return NextResponse.json(
      { error: `Intervalul maxim este ${RITUAL_REPORT_MAX_RANGE_DAYS} zile.` },
      { status: 400 }
    );
  }

  const [ritualDocs, eventDocs, checkinDocs] = await Promise.all([
    db
      .collection("family_rituals")
      .find({ familyId })
      .project({ title: 1, responsibleParent: 1, active: 1, order: 1, createdAt: 1 })
      .sort({ order: 1, createdAt: 1 })
      .toArray(),
    db
      .collection("schedule_events")
      .find({ familyId, date: { $gte: from, $lte: to } })
      .project({ date: 1, parent: 1, type: 1 })
      .toArray(),
    db
      .collection("family_ritual_checkins")
      .find({ familyId, date: { $gte: from, $lte: to } })
      .project({ ritualId: 1, date: 1 })
      .toArray(),
  ]);

  const eventsByDate = new Map<string, ParentType>();
  for (const ev of eventDocs as { date?: string; parent?: string | null; type?: string | null }[]) {
    if (!ev.date || ev.date < from || ev.date > to) continue;
    const p = eventParentFromDoc(ev);
    if (p) eventsByDate.set(ev.date, p);
  }

  const checkinKeys = new Set<string>();
  for (const c of checkinDocs as { ritualId?: ObjectId; date?: string }[]) {
    if (!c.ritualId || !c.date) continue;
    checkinKeys.add(`${String(c.ritualId)}|${c.date}`);
  }

  const rituals: RitualReportInputRitual[] = (ritualDocs as {
    _id: ObjectId;
    title: string;
    responsibleParent?: string | null;
    active?: boolean;
  }[]).map((d) => ({
    id: String(d._id),
    title: d.title,
    responsibleParent:
      d.responsibleParent === "tata" || d.responsibleParent === "mama" || d.responsibleParent === "both"
        ? (d.responsibleParent as RitualResponsibleParent)
        : "both",
    active: d.active !== false,
  }));

  const rows = buildRitualReport(rituals, eventsByDate, checkinKeys);

  return NextResponse.json({
    from,
    to,
    daysInRange: days.length,
    daysWithSchedule: eventsByDate.size,
    rows,
  });
}
