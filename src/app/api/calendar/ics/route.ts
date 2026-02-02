import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";
import {
  PARENT_LABELS,
  LOCATION_LABELS,
  type ParentType,
  type LocationType,
} from "@/types/events";

function escapeIcs(str: string): string {
  return str.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
}

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

function getSummary(doc: {
  title?: string | null;
  type?: string | null;
  parent?: string | null;
  location?: string | null;
  locationLabel?: string | null;
}): string {
  if (doc.title?.trim()) return doc.title.trim();
  const hasNew = doc.parent != null && doc.location != null;
  const parent = hasNew ? (doc.parent as ParentType) : deriveFromType(doc.type ?? "other").parent;
  const location = hasNew ? (doc.location as LocationType) : deriveFromType(doc.type ?? "other").location;
  const parentStr = PARENT_LABELS[parent];
  const locStr =
    location === "other" && doc.locationLabel?.trim()
      ? doc.locationLabel.trim()
      : LOCATION_LABELS[location];
  return `Eva cu ${parentStr}, ${locStr}`;
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    const url = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
    return NextResponse.redirect(`${url}/login`);
  }
  const db = await getDb();
  const docs = await db
    .collection("schedule_events")
    .find({})
    .sort({ date: 1 })
    .toArray();

  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Eva Coparenting//RO",
    "CALSCALE:GREGORIAN",
    "X-WR-CALNAME:Eva Coparenting",
  ];

  for (const raw of docs) {
    const eventDoc = raw as {
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
    };
    const summary = getSummary(eventDoc);
    const desc = [summary, eventDoc.notes].filter(Boolean).join(" – ");
    const hasTime = eventDoc.startTime || eventDoc.endTime;
    lines.push("BEGIN:VEVENT");
    lines.push(`UID:${String(eventDoc._id)}@evacoparenting`);
    if (hasTime) {
      const start = eventDoc.startTime ?? "00:00";
      const end = eventDoc.endTime ?? "23:59";
      const [sh, sm] = start.split(":").map(Number);
      const [eh, em] = end.split(":").map(Number);
      const dtStart = `${eventDoc.date.replace(/-/g, "")}T${String(sh).padStart(2, "0")}${String(sm).padStart(2, "0")}00`;
      const dtEnd = `${eventDoc.date.replace(/-/g, "")}T${String(eh).padStart(2, "0")}${String(em).padStart(2, "0")}00`;
      lines.push(`DTSTART:${dtStart}`);
      lines.push(`DTEND:${dtEnd}`);
    } else {
      const nextDay = new Date(eventDoc.date);
      nextDay.setDate(nextDay.getDate() + 1);
      const endDate = nextDay.toISOString().slice(0, 10).replace(/-/g, "");
      lines.push(`DTSTART;VALUE=DATE:${eventDoc.date.replace(/-/g, "")}`);
      lines.push(`DTEND;VALUE=DATE:${endDate}`);
    }
    lines.push(`SUMMARY:${escapeIcs(summary)}`);
    if (desc) lines.push(`DESCRIPTION:${escapeIcs(desc)}`);
    lines.push("END:VEVENT");
  }

  lines.push("END:VCALENDAR");
  const ics = lines.join("\r\n");

  return new NextResponse(ics, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'attachment; filename="eva-coparenting.ics"',
      "Cache-Control": "no-store",
    },
  });
}
