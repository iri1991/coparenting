import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { auth } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";
import { getActiveFamily } from "@/lib/family";
import { getFamilyPlan, canUseWeeklyProposal } from "@/lib/plan";
import { format } from "date-fns";
import { ro } from "date-fns/locale";
import { logFamilyActivity } from "@/lib/activity";
import { getParentDisplayName } from "@/lib/parent-display-name";

type EditableDay = { date: string; parent: "tata" | "mama" | "together"; location: "tunari" | "otopeni" | "other" };

export async function PATCH(request: Request) {
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

  const body = await request.json().catch(() => ({}));
  const incomingDays = body.days as EditableDay[] | undefined;
  if (!Array.isArray(incomingDays) || incomingDays.length === 0) {
    return NextResponse.json({ error: "Trimite days pentru actualizare." }, { status: 400 });
  }

  const proposal = await db
    .collection("schedule_proposals")
    .findOne({ familyId, status: "pending" }, { sort: { createdAt: -1 } });
  if (!proposal) {
    return NextResponse.json({ error: "Nu există o propunere pending de modificat." }, { status: 404 });
  }

  const p = proposal as {
    _id: ObjectId;
    days: { date: string; parent: string; location: string }[];
  };

  // Acceptăm update doar pentru aceleași date din propunerea existentă.
  const existingDates = new Set(p.days.map((d) => d.date));
  const incomingDates = new Set(incomingDays.map((d) => d.date));
  if (existingDates.size !== incomingDates.size) {
    return NextResponse.json({ error: "Setul de zile nu corespunde propunerii curente." }, { status: 400 });
  }
  for (const d of existingDates) {
    if (!incomingDates.has(d)) {
      return NextResponse.json({ error: "Setul de zile nu corespunde propunerii curente." }, { status: 400 });
    }
  }

  const sanitizedDays: EditableDay[] = incomingDays.map((d) => {
    const parent = d.parent === "mama" || d.parent === "together" ? d.parent : "tata";
    // Pentru consistență: location implicit după parent.
    const location: EditableDay["location"] =
      parent === "tata" ? "tunari" : parent === "mama" ? "otopeni" : "other";
    return { date: d.date, parent, location };
  });

  await db.collection("schedule_proposals").updateOne(
    { _id: p._id },
    {
      $set: {
        days: sanitizedDays,
        approvedBy: {},
        updatedAt: new Date(),
        updatedBy: session.user.id,
      },
    }
  );

  const weekStart = sanitizedDays[0]?.date ?? "";
  const weekEnd = sanitizedDays[sanitizedDays.length - 1]?.date ?? weekStart;
  const weekLabel =
    weekStart && weekEnd
      ? `${format(new Date(weekStart + "T12:00:00"), "d MMM", { locale: ro })} – ${format(new Date(weekEnd + "T12:00:00"), "d MMM yyyy", { locale: ro })}`
      : undefined;
  const displayName = await getParentDisplayName(db, familyId, session.user.id, session.user.parentType ?? undefined);
  await logFamilyActivity(db, familyId, session.user.id, displayName, "proposal_updated", { weekLabel });

  return NextResponse.json({ ok: true });
}

