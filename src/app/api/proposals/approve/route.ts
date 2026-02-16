import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { auth } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";
import { getActiveFamily } from "@/lib/family";
import { getFamilyPlan, canUseWeeklyProposal } from "@/lib/plan";
import { format } from "date-fns";
import { ro } from "date-fns/locale";
import {
  sendProposalApprovedByOtherNotification,
  sendProposalAppliedNotification,
} from "@/lib/notify";

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
  }
  if (!session.user.familyId) {
    return NextResponse.json({ error: "Nu aparțineți unei familii." }, { status: 400 });
  }

  const db = await getDb();
  const familyId = new ObjectId(session.user.familyId);
  const family = await getActiveFamily(db, familyId);
  if (!family) {
    return NextResponse.json(
      { error: "Familia nu există sau a fost dezactivată. Contactați suportul." },
      { status: 403 }
    );
  }
  const memberIds = family.memberIds ?? [];
  if (!memberIds.includes(session.user.id)) {
    return NextResponse.json({ error: "Nu sunteți membru al acestei familii." }, { status: 403 });
  }

  const plan = await getFamilyPlan(db, familyId);
  if (!canUseWeeklyProposal(plan)) {
    return NextResponse.json(
      { error: "Propunerea automată de program este disponibilă în planul Pro. Faceți upgrade pentru a o folosi." },
      { status: 403 }
    );
  }
  const proposal = await db
    .collection("schedule_proposals")
    .findOne({ familyId, status: "pending" }, { sort: { createdAt: -1 } });
  if (!proposal) {
    return NextResponse.json({ error: "Nu există o propunere de aprobat." }, { status: 404 });
  }

  const p = proposal as {
    _id: ObjectId;
    weekStart: string;
    days: { date: string; parent: string; location: string }[];
    approvedBy: Record<string, string>;
  };
  const approvedBy = { ...(p.approvedBy || {}), [session.user.id]: new Date().toISOString() };
  const approvedUserIds = Object.keys(approvedBy);
  const bothApproved = memberIds.every((id) => approvedUserIds.includes(id));

  if (bothApproved) {
    const now = new Date();
    const createdBy = memberIds[0];
    for (const day of p.days) {
      await db.collection("schedule_events").deleteMany({ familyId, date: day.date });
      await db.collection("schedule_events").insertOne({
        familyId,
        date: day.date,
        parent: day.parent,
        location: day.location,
        locationLabel: null,
        title: null,
        notes: null,
        startTime: null,
        endTime: null,
        created_by: createdBy,
        created_at: now,
      });
    }
    await db.collection("schedule_proposals").updateOne(
      { _id: p._id },
      { $set: { status: "approved", approvedBy, updatedAt: now } }
    );
    const weekEnd = p.days.length > 0 ? p.days[p.days.length - 1].date : p.weekStart;
    const weekLabel = `${format(new Date(p.weekStart + "T12:00:00"), "d MMM", { locale: ro })} – ${format(new Date(weekEnd + "T12:00:00"), "d MMM yyyy", { locale: ro })}`;
    sendProposalAppliedNotification(memberIds, weekLabel).catch((e) => console.error("[proposals] notify applied", e));
    return NextResponse.json({ ok: true, applied: true });
  }

  await db.collection("schedule_proposals").updateOne(
    { _id: p._id },
    { $set: { approvedBy, updatedAt: new Date() } }
  );

  const otherUserId = memberIds.find((id) => id !== session.user.id);
  if (otherUserId) {
    const parent1Name = (family as { parent1Name?: string }).parent1Name?.trim() || "Părinte 1";
    const parent2Name = (family as { parent2Name?: string }).parent2Name?.trim() || "Părinte 2";
    const approverLabel =
      session.user.parentType === "tata"
        ? parent1Name
        : session.user.parentType === "mama"
          ? parent2Name
          : "Celălalt părinte";
    const weekEnd = p.days.length > 0 ? p.days[p.days.length - 1].date : p.weekStart;
    const weekLabel = `${format(new Date(p.weekStart + "T12:00:00"), "d MMM", { locale: ro })} – ${format(new Date(weekEnd + "T12:00:00"), "d MMM yyyy", { locale: ro })}`;
    sendProposalApprovedByOtherNotification(otherUserId, approverLabel, weekLabel).catch((e) =>
      console.error("[proposals] notify approved", e)
    );
  }

  return NextResponse.json({ ok: true, applied: false });
}
