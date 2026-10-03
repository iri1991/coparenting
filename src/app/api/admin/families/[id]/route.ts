import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";
import { requireAdminApi, logAdminAction } from "@/lib/admin";
import type { PlanType } from "@/types/plan";

/** PATCH: schimbă planul și/sau statusul unei familii (doar admin). */
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdminApi();
  if (session instanceof NextResponse) return session;

  const { id } = await params;
  if (!ObjectId.isValid(id)) {
    return NextResponse.json({ error: "ID familie invalid." }, { status: 400 });
  }
  const familyId = new ObjectId(id);

  const body = await request.json().catch(() => ({}));
  const plan = body.plan;
  const active = body.active;

  const updates: Record<string, unknown> = { updatedAt: new Date() };
  if (plan === "free" || plan === "pro" || plan === "family") {
    updates.plan = plan as PlanType;
  }
  if (typeof active === "boolean") {
    updates.active = active;
  }
  if (Object.keys(updates).length <= 1) {
    return NextResponse.json({ error: "Trimite plan (free/pro/family) și/sau active (true/false)." }, { status: 400 });
  }

  const db = await getDb();
  const before = await db.collection("families").findOne({ _id: familyId }, { projection: { plan: 1, active: 1 } });
  if (!before) {
    return NextResponse.json({ error: "Familie negăsită." }, { status: 404 });
  }
  await db.collection("families").updateOne({ _id: familyId }, { $set: updates });

  const prev = before as { plan?: string; active?: boolean };
  if (updates.plan !== undefined && updates.plan !== (prev.plan ?? "free")) {
    await logAdminAction(session, "Plan schimbat", { type: "family", id }, { from: prev.plan ?? "free", to: updates.plan });
  }
  if (updates.active !== undefined && updates.active !== (prev.active !== false)) {
    await logAdminAction(session, updates.active ? "Familie reactivată" : "Familie dezactivată", { type: "family", id });
  }

  return NextResponse.json({
    ok: true,
    ...(updates.plan !== undefined && { plan: updates.plan }),
    ...(updates.active !== undefined && { active: updates.active }),
  });
}
