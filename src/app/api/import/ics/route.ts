import { getFamilyEventLabels, type FamilyEventLabels } from "@/lib/family-labels";
import { getActiveFamily } from "@/lib/family";
import { ensureEventResidenceIds } from "@/lib/event-residences";
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { auth } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";
import type { ParentType, LocationType } from "@/types/events";

const MAX_IMPORT_EVENTS = 1000;

function unescapeIcs(value: string): string {
  return value
    .replace(/\\n/g, "\n")
    .replace(/\\,/g, ",")
    .replace(/\\;/g, ";")
    .replace(/\\\\/g, "\\")
    .trim();
}

function parseDtStart(line: string): { date: string; startTime?: string; endTime?: string } {
  const raw = line.replace(/^DTSTART(;.*)?:/i, "").trim();
  const dateOnly = raw.includes("VALUE=DATE");
  const part = dateOnly ? raw : raw.split("T")[0];
  const date = part.replace(/(\d{4})(\d{2})(\d{2})/, "$1-$2-$3").slice(0, 10);
  if (!dateOnly && raw.includes("T")) {
    const timePart = raw.split("T")[1]?.slice(0, 6) ?? "";
    const startTime =
      timePart.length >= 4
        ? `${timePart.slice(0, 2)}:${timePart.slice(2, 4)}`
        : undefined;
    return { date, startTime, endTime: startTime };
  }
  return { date };
}

function escapeRegExp(v: string): string {
  return v.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function containsWord(text: string, word: string): boolean {
  const w = word.trim().toLowerCase();
  return w.length > 1 && new RegExp(`(^|[^\\p{L}])${escapeRegExp(w)}($|[^\\p{L}])`, "u").test(text);
}

/** Deduce părintele și locația din titlul evenimentului, folosind numele din familia curentă. */
function inferParentLocation(
  summary: string,
  labels: FamilyEventLabels
): { parent: ParentType; location: LocationType; locationLabel?: string; residenceId?: string } {
  const s = summary.toLowerCase();
  const isParent1 = containsWord(s, "tata") || containsWord(s, "tată") || containsWord(s, labels.parentLabels.tata);
  const isParent2 = containsWord(s, "mama") || containsWord(s, "mamă") || containsWord(s, labels.parentLabels.mama);
  let parent: ParentType = "tata";
  if (isParent2 && !isParent1) parent = "mama";
  else if (/\b(toți|together|cu toții|toate)\b/.test(s)) parent = "together";

  const residence = labels.residences.find((r) => r.name && s.includes(r.name.toLowerCase()));
  if (residence) {
    return { parent, location: "other", locationLabel: residence.name, residenceId: residence.id };
  }
  const match = summary.match(/,\s*([^,]+)$/);
  return { parent, location: "other", locationLabel: match ? match[1].trim() : summary.slice(0, 80) };
}

function parseIcsEvents(icsText: string): Array<{ date: string; startTime?: string; endTime?: string; summary: string; description: string }> {
  const out: Array<{ date: string; startTime?: string; endTime?: string; summary: string; description: string }> = [];
  const blocks = icsText.split(/\r?\nBEGIN:VEVENT\r?\n/i).slice(1);
  for (const block of blocks) {
    const lines = block.split(/\r?\n/);
    let dtStart = "";
    let dtEnd = "";
    let summary = "";
    let description = "";
    for (const line of lines) {
      if (line.startsWith("DTSTART")) dtStart = line;
      else if (line.startsWith("DTEND")) dtEnd = line;
      else if (line.startsWith("SUMMARY")) summary = unescapeIcs(line.replace(/^SUMMARY(;.*)?:/i, ""));
      else if (line.startsWith("DESCRIPTION")) description = unescapeIcs(line.replace(/^DESCRIPTION(;.*)?:/i, ""));
    }
    if (!dtStart) continue;
    const { date, startTime, endTime } = parseDtStart(dtStart);
    if (!date || date.length !== 10) continue;
    out.push({
      date,
      startTime,
      endTime: endTime ?? startTime,
      summary: summary || "Eveniment",
      description,
    });
  }
  return out;
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

  let icsText: string;
  const contentType = request.headers.get("content-type") ?? "";
  if (contentType.includes("multipart/form-data")) {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    if (!file) {
      return NextResponse.json({ error: "Lipsește fișierul (câmp 'file')." }, { status: 400 });
    }
    icsText = await file.text();
  } else {
    icsText = await request.text();
  }
  if (!icsText.trim()) {
    return NextResponse.json({ error: "Conținut ICS gol." }, { status: 400 });
  }

  const events = parseIcsEvents(icsText);
  if (events.length > MAX_IMPORT_EVENTS) {
    return NextResponse.json({ error: `Maxim ${MAX_IMPORT_EVENTS} evenimente per import.` }, { status: 400 });
  }
  if (events.length === 0) {
    return NextResponse.json({ error: "Nu s-au găsit evenimente în fișierul .ics." }, { status: 400 });
  }

  const db = await getDb();
  const familyId = new ObjectId(session.user.familyId);
  if (!(await getActiveFamily(db, familyId))) {
    return NextResponse.json({ error: "Familia nu există sau a fost dezactivată." }, { status: 403 });
  }
  const now = new Date();
  const inserted: string[] = [];

  const labels = await getFamilyEventLabels(db, familyId);
  for (const ev of events) {
    const { parent, location, locationLabel, residenceId } = inferParentLocation(ev.summary, labels);
    const title = ev.summary.length > 200 ? ev.summary.slice(0, 200) : ev.summary;
    const notes = ev.description && ev.description !== ev.summary ? ev.description : undefined;
    const { insertedId } = await db.collection("schedule_events").insertOne({
      familyId,
      date: ev.date,
      parent,
      location,
      locationLabel: locationLabel ?? null,
      residenceId: residenceId ?? null,
      title: title || null,
      notes: notes ?? null,
      startTime: ev.startTime ?? null,
      endTime: ev.endTime ?? null,
      created_by: session.user.id,
      created_at: now,
    });
    inserted.push(String(insertedId));
  }
  await ensureEventResidenceIds(db, familyId);

  return NextResponse.json({
    imported: inserted.length,
    message: `Au fost importate ${inserted.length} evenimente.`,
  });
}
