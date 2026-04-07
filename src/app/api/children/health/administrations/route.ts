import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getHealthContext, isValidHhMm, isValidYmd, toAdministration } from "@/lib/health";

export async function POST(request: Request) {
  const { auth } = await import("@/lib/auth");
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
  const ctx = await getHealthContext(session.user.id);
  if (!ctx) return NextResponse.json({ error: "Context familie invalid." }, { status: 400 });
  const body = await request.json().catch(() => ({}));

  const planIdRaw = typeof body.planId === "string" ? body.planId : "";
  let planId: ObjectId;
  try {
    planId = new ObjectId(planIdRaw);
  } catch {
    return NextResponse.json({ error: "Plan invalid." }, { status: 400 });
  }

  const plan = await ctx.db.collection("child_treatment_plans").findOne({ _id: planId, familyId: ctx.familyId });
  if (!plan) return NextResponse.json({ error: "Plan negăsit." }, { status: 404 });
  const childId = (plan as unknown as { childId: ObjectId }).childId;
  const date = typeof body.date === "string" && isValidYmd(body.date) ? body.date : "";
  const timeLabel = typeof body.timeLabel === "string" && isValidHhMm(body.timeLabel) ? body.timeLabel : "";
  if (!date || !timeLabel) return NextResponse.json({ error: "Data/ora invalidă." }, { status: 400 });
  const status = body.status === "skipped" ? "skipped" : "done";
  const notes = typeof body.notes === "string" ? body.notes.trim() : "";
  const now = new Date();
  await ctx.db.collection("child_treatment_administrations").updateOne(
    { familyId: ctx.familyId, childId, planId, date, timeLabel },
    {
      $set: {
        familyId: ctx.familyId,
        childId,
        planId,
        date,
        timeLabel,
        status,
        notes: notes || null,
        administeredByUserId: session.user.id,
        updatedAt: now,
      },
      $setOnInsert: { createdAt: now },
    },
    { upsert: true }
  );
  const saved = await ctx.db
    .collection("child_treatment_administrations")
    .findOne({ familyId: ctx.familyId, childId, planId, date, timeLabel });
  return NextResponse.json({ administration: toAdministration(saved as Parameters<typeof toAdministration>[0]) });
}
