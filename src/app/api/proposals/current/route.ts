import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { auth } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";
import { getActiveFamily } from "@/lib/family";
import { getFamilyPlan, canUseWeeklyProposal } from "@/lib/plan";
import { format } from "date-fns";
import { ro } from "date-fns/locale";
import type { WeekProposal } from "@/types/proposal";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
  }
  if (!session.user.familyId) {
    return NextResponse.json({ proposal: null, plan: "free" });
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
  const plan = await getFamilyPlan(db, familyId);
  if (!canUseWeeklyProposal(plan)) {
    return NextResponse.json({ proposal: null, plan, upgradeMessage: "Propunerea automată de program este disponibilă în planul Pro." });
  }
  const doc = await db
    .collection("schedule_proposals")
    .findOne({ familyId, status: "pending" }, { sort: { createdAt: -1 } });

  if (!doc) {
    return NextResponse.json({ proposal: null, plan });
  }

  const d = doc as {
    _id: unknown;
    familyId: ObjectId;
    weekStart: string;
    days: { date: string; parent: string; location: string }[];
    approvedBy: Record<string, string>;
    status: string;
    createdAt: Date;
  };

  const memberIds = family.memberIds ?? [];
  const parent1Name = (family as { parent1Name?: string }).parent1Name?.trim() || "Părinte 1";
  const parent2Name = (family as { parent2Name?: string }).parent2Name?.trim() || "Părinte 2";

  const weekEnd = d.days.length > 0 ? d.days[d.days.length - 1].date : d.weekStart;
  const weekLabel = `${format(new Date(d.weekStart + "T12:00:00"), "d MMM", { locale: ro })} – ${format(new Date(weekEnd + "T12:00:00"), "d MMM yyyy", { locale: ro })}`;

  const proposal: WeekProposal & { weekLabel: string; myApproved: boolean; otherApproved: boolean; parentLabels: Record<string, string> } = {
    id: String(d._id),
    familyId: String(d.familyId),
    weekStart: d.weekStart,
    days: d.days.map((day) => ({
      date: day.date,
      parent: day.parent as WeekProposal["days"][0]["parent"],
      location: day.location as WeekProposal["days"][0]["location"],
    })),
    approvedBy: d.approvedBy || {},
    status: d.status as "pending" | "approved",
    createdAt: d.createdAt.toISOString(),
    weekLabel,
    myApproved: Object.prototype.hasOwnProperty.call(d.approvedBy || {}, session.user.id!),
    otherApproved: memberIds.some((id) => id !== session.user.id && Object.prototype.hasOwnProperty.call(d.approvedBy || {}, id)),
    parentLabels: { tata: parent1Name, mama: parent2Name, together: "Cu toții" },
  };

  return NextResponse.json({ proposal, plan });
}
