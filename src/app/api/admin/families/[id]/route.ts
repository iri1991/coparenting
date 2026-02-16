import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { auth } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";
import type { PlanType } from "@/types/plan";

const ADMIN_EMAIL = "me@irinelnicoara.ro";

/** PATCH: schimbă planul unei familii (doar admin). */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
  }
  const isAdmin = (session.user.email ?? "").toLowerCase() === ADMIN_EMAIL;
  if (!isAdmin) {
    return NextResponse.json({ error: "Doar admin." }, { status: 403 });
  }

  const { id } = await params;
  let familyId: ObjectId;
  try {
    familyId = new ObjectId(id);
  } catch {
    return NextResponse.json({ error: "ID familie invalid." }, { status: 400 });
  }

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
    return NextResponse.json(
      { error: "Trimite plan (free/pro/family) și/sau active (true/false)." },
      { status: 400 }
    );
  }

  const db = await getDb();
  const result = await db.collection("families").updateOne(
    { _id: familyId },
    { $set: updates }
  );
  if (result.matchedCount === 0) {
    return NextResponse.json({ error: "Familie negăsită." }, { status: 404 });
  }
  return NextResponse.json({
    ok: true,
    ...(updates.plan !== undefined && { plan: updates.plan }),
    ...(updates.active !== undefined && { active: updates.active }),
  });
}
