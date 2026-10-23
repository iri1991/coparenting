import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { auth } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";
import { getActiveFamily } from "@/lib/family";
import { ensureEventResidenceIds, getFamilyResidences } from "@/lib/event-residences";

/**
 * GET (Bearer): tot ce îi trebuie aplicației mobile la pornire — utilizatorul, familia,
 * copiii, locuințele și planul. (Pe web, aceste date vin din paginile randate pe server.)
 */
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
  }
  const user = {
    id: session.user.id,
    email: session.user.email ?? null,
    name: session.user.name ?? null,
    parentType: session.user.parentType ?? null,
  };
  if (!session.user.familyId) {
    return NextResponse.json({ user, family: null, needsSetup: true });
  }
  const db = await getDb();
  const familyId = new ObjectId(session.user.familyId);
  const family = await getActiveFamily(db, familyId);
  if (!family) {
    return NextResponse.json({ user, family: null, familyDeactivated: true });
  }
  await ensureEventResidenceIds(db, familyId);
  const [children, residences] = await Promise.all([
    db.collection("children").find({ familyId }).sort({ createdAt: 1 }).project({ name: 1, birthDate: 1 }).toArray(),
    getFamilyResidences(db, familyId),
  ]);
  const f = family as { parent1Name?: string; parent2Name?: string; name?: string; plan?: string; memberIds?: string[] };
  const memberIds = (f.memberIds ?? []).map(String);
  const myIndex = memberIds.indexOf(session.user.id);
  return NextResponse.json({
    user,
    needsSetup: children.length === 0 || residences.length === 0,
    family: {
      id: String(familyId),
      name: f.name ?? null,
      parent1Name: f.parent1Name?.trim() || "Părinte 1",
      parent2Name: f.parent2Name?.trim() || "Părinte 2",
      plan: f.plan === "pro" || f.plan === "family" ? f.plan : "free",
      memberCount: memberIds.length,
      /** Al câtelea părinte e utilizatorul (0 = părinte 1, 1 = părinte 2). */
      myParentIndex: myIndex,
      children: children.map((c) => ({ id: String(c._id), name: (c as { name?: string }).name ?? "", birthDate: (c as { birthDate?: string }).birthDate ?? null })),
      residences,
    },
  });
}
