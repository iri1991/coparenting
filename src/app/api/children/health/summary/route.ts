import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getHealthContext, ensureChildInFamily, toAdministration, toCondition, toMedicalReport, toPlan } from "@/lib/health";

export async function GET(request: Request) {
  const { auth } = await import("@/lib/auth");
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
  const ctx = await getHealthContext(session.user.id);
  if (!ctx) return NextResponse.json({ error: "Context familie invalid." }, { status: 400 });

  const { searchParams } = new URL(request.url);
  const childIdRaw = searchParams.get("childId") || "";
  const childId = await ensureChildInFamily(ctx.db, ctx.familyId, childIdRaw);
  if (!childId) return NextResponse.json({ error: "Copil invalid." }, { status: 400 });

  const [conditions, plans, administrations, reports] = await Promise.all([
    ctx.db.collection("child_health_conditions").find({ familyId: ctx.familyId, childId }).sort({ createdAt: -1 }).toArray(),
    ctx.db.collection("child_treatment_plans").find({ familyId: ctx.familyId, childId }).sort({ createdAt: -1 }).toArray(),
    ctx.db
      .collection("child_treatment_administrations")
      .find({ familyId: ctx.familyId, childId })
      .sort({ date: -1, timeLabel: -1, createdAt: -1 })
      .limit(120)
      .toArray(),
    ctx.db.collection("child_medical_reports").find({ familyId: ctx.familyId, childId }).sort({ createdAt: -1 }).toArray(),
  ]);

  const validPlanIds = new Set((plans as { _id: ObjectId }[]).map((p) => String(p._id)));
  const recentAdministrations = (administrations as { planId?: ObjectId }[])
    .filter((a) => (a.planId ? validPlanIds.has(String(a.planId)) : false))
    .map((a) => toAdministration(a as Parameters<typeof toAdministration>[0]));

  return NextResponse.json({
    conditions: (conditions as Parameters<typeof toCondition>[0][]).map((d) => toCondition(d)),
    plans: (plans as Parameters<typeof toPlan>[0][]).map((d) => toPlan(d)),
    administrations: recentAdministrations,
    reports: (reports as Parameters<typeof toMedicalReport>[0][]).map((d) => toMedicalReport(d)),
  });
}
