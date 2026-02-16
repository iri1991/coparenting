import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { addDays, format } from "date-fns";
import { ro } from "date-fns/locale";
import { getDb } from "@/lib/mongodb";
import { getNextMonday } from "@/lib/proposal";
import { generateProposalForWeek } from "@/lib/proposal";
import { sendWeeklyProposalCreatedNotification } from "@/lib/notify";

/**
 * Cron: rulează duminica (ex. 20:00 Romania).
 * Pentru fiecare familie cu 2 membri: generează propunerea pentru săptămâna următoare,
 * o salvează și notifică ambii părinți să o aprobe.
 * Protejat cu CRON_SECRET.
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");
  const { searchParams } = new URL(request.url);
  const querySecret = searchParams.get("secret");
  const ok = secret && (authHeader === `Bearer ${secret}` || querySecret === secret);
  if (!ok) {
    return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
  }

  const nextMonday = getNextMonday();
  const weekStart = format(nextMonday, "yyyy-MM-dd");
  const weekEnd = format(addDays(nextMonday, 6), "yyyy-MM-dd");
  const weekLabel = `${format(nextMonday, "d MMM", { locale: ro })} – ${format(new Date(weekEnd + "T12:00:00"), "d MMM yyyy", { locale: ro })}`;

  const db = await getDb();
  const families = await db
    .collection("families")
    .find({})
    .project({ _id: 1, memberIds: 1, plan: 1 })
    .toArray();

  let created = 0;
  for (const fam of families as { _id: ObjectId; memberIds?: string[]; plan?: string }[]) {
    const memberIds = fam.memberIds ?? [];
    if (memberIds.length < 2) continue;
    const plan = fam.plan === "pro" || fam.plan === "family" ? fam.plan : "free";
    if (plan === "free") continue;

    const familyId = fam._id;
    const existing = await db
      .collection("schedule_proposals")
      .findOne({ familyId, weekStart, status: "pending" });
    if (existing) continue;

    const days = await generateProposalForWeek(familyId, weekStart);
    if (days.length === 0) continue;

    const now = new Date();
    await db.collection("schedule_proposals").insertOne({
      familyId,
      weekStart,
      days,
      approvedBy: {},
      status: "pending",
      createdAt: now,
      updatedAt: now,
    });
    created++;
    sendWeeklyProposalCreatedNotification(memberIds, weekLabel).catch((e) =>
      console.error("[cron weekly-proposal] notify", e)
    );
  }

  return NextResponse.json({
    ok: true,
    weekStart,
    weekLabel,
    familiesProcessed: families.length,
    proposalsCreated: created,
  });
}
