import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { auth } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";
import { getActiveFamily } from "@/lib/family";
import { getTodayDateStringEuropeBucharest } from "@/lib/date-bucharest";

async function getFamilyContext(userId: string) {
  const db = await getDb();
  const user = await db.collection("users").findOne(
    { _id: new ObjectId(userId) },
    { projection: { familyId: 1 } }
  );
  const raw = (user as { familyId?: unknown })?.familyId;
  if (!raw) return { db, familyId: null as ObjectId | null };
  let familyId: ObjectId;
  try {
    familyId = new ObjectId(String(raw));
  } catch {
    return { db, familyId: null as ObjectId | null };
  }
  const family = await getActiveFamily(db, familyId);
  if (!family) return { db, familyId: null as ObjectId | null };
  const memberIds = (family.memberIds ?? []).map(String);
  if (!memberIds.includes(userId)) return { db, familyId: null as ObjectId | null };
  return { db, familyId };
}

function isValidDateYmd(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
  const ctx = await getFamilyContext(session.user.id);
  if (!ctx.familyId) return NextResponse.json({ checkins: {} as Record<string, string> });

  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date") || getTodayDateStringEuropeBucharest();
  if (!isValidDateYmd(date)) return NextResponse.json({ error: "Date invalid." }, { status: 400 });

  const docs = await ctx.db
    .collection("family_ritual_checkins")
    .find({ familyId: ctx.familyId, date })
    .toArray();

  const checkins: Record<string, string> = {};
  for (const d of docs as { ritualId?: ObjectId; completedByUserId?: string }[]) {
    if (d.ritualId) checkins[String(d.ritualId)] = d.completedByUserId ?? "";
  }
  return NextResponse.json({ checkins });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
  const ctx = await getFamilyContext(session.user.id);
  if (!ctx.familyId) return NextResponse.json({ error: "Context familie invalid." }, { status: 400 });

  const body = await request.json().catch(() => ({}));
  const ritualIdRaw = typeof body.ritualId === "string" ? body.ritualId : "";
  const date = typeof body.date === "string" ? body.date : getTodayDateStringEuropeBucharest();
  if (!ritualIdRaw) return NextResponse.json({ error: "ritualId lipsă." }, { status: 400 });
  if (!isValidDateYmd(date)) return NextResponse.json({ error: "Date invalid." }, { status: 400 });
  let ritualId: ObjectId;
  try {
    ritualId = new ObjectId(ritualIdRaw);
  } catch {
    return NextResponse.json({ error: "ritualId invalid." }, { status: 400 });
  }

  const ritual = await ctx.db.collection("family_rituals").findOne({ _id: ritualId, familyId: ctx.familyId, active: { $ne: false } });
  if (!ritual) return NextResponse.json({ error: "Ritual negăsit." }, { status: 404 });

  const now = new Date();
  await ctx.db.collection("family_ritual_checkins").updateOne(
    { familyId: ctx.familyId, ritualId, date },
    {
      $set: {
        familyId: ctx.familyId,
        ritualId,
        date,
        completedByUserId: session.user.id,
        updatedAt: now,
      },
      $setOnInsert: { createdAt: now },
    },
    { upsert: true }
  );
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
  const ctx = await getFamilyContext(session.user.id);
  if (!ctx.familyId) return NextResponse.json({ error: "Context familie invalid." }, { status: 400 });

  const { searchParams } = new URL(request.url);
  const ritualIdRaw = searchParams.get("ritualId") || "";
  const date = searchParams.get("date") || getTodayDateStringEuropeBucharest();
  if (!ritualIdRaw) return NextResponse.json({ error: "ritualId lipsă." }, { status: 400 });
  if (!isValidDateYmd(date)) return NextResponse.json({ error: "Date invalid." }, { status: 400 });

  let ritualId: ObjectId;
  try {
    ritualId = new ObjectId(ritualIdRaw);
  } catch {
    return NextResponse.json({ error: "ritualId invalid." }, { status: 400 });
  }
  await ctx.db.collection("family_ritual_checkins").deleteOne({ familyId: ctx.familyId, ritualId, date });
  return NextResponse.json({ ok: true });
}

