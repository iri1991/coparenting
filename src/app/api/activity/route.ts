import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { auth } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";
import { getFamilyActivity } from "@/lib/activity";

/** GET: istoric activități familie (pentru tab-ul Istoric din Cont). */
export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
  }
  if (!session.user.familyId) {
    return NextResponse.json({ entries: [] });
  }
  const { searchParams } = new URL(request.url);
  const limit = Math.min(100, Math.max(10, parseInt(searchParams.get("limit") ?? "80", 10) || 80));
  const db = await getDb();
  const familyId = new ObjectId(session.user.familyId);
  const entries = await getFamilyActivity(db, familyId, limit);
  return NextResponse.json({ entries });
}
