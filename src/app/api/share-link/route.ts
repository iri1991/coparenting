import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { auth } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";
import { getActiveFamily } from "@/lib/family";
import { canUseExportPdf } from "@/lib/plan";
import crypto from "crypto";

/** GET: returnează URL-ul de partajare dacă există (Pro/Family+). */
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
  }
  if (!session.user.familyId) {
    return NextResponse.json({ shareUrl: null });
  }
  const db = await getDb();
  let familyId: ObjectId;
  try {
    familyId = new ObjectId(session.user.familyId);
  } catch {
    return NextResponse.json({ shareUrl: null });
  }
  const family = await getActiveFamily(db, familyId);
  if (!family) {
    return NextResponse.json({ shareUrl: null });
  }
  const plan = (family.plan === "pro" || family.plan === "family" ? family.plan : "free") as "free" | "pro" | "family";
  if (!canUseExportPdf(plan)) {
    return NextResponse.json({ shareUrl: null });
  }
  const token = (family as { shareToken?: string }).shareToken;
  const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
  const shareUrl = token ? `${baseUrl}/share/${token}` : null;
  return NextResponse.json({ shareUrl });
}

/** POST: creează sau regenerează linkul de partajare (Pro/Family+). Body: { regenerate?: boolean } */
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
  }
  if (!session.user.familyId) {
    return NextResponse.json({ error: "Nu aparțineți unei familii." }, { status: 400 });
  }
  const db = await getDb();
  let familyId: ObjectId;
  try {
    familyId = new ObjectId(session.user.familyId);
  } catch {
    return NextResponse.json({ error: "ID familie invalid." }, { status: 400 });
  }
  const family = await getActiveFamily(db, familyId);
  if (!family) {
    return NextResponse.json(
      { error: "Familia nu există sau a fost dezactivată." },
      { status: 403 }
    );
  }
  const plan = (family.plan === "pro" || family.plan === "family" ? family.plan : "free") as "free" | "pro" | "family";
  if (!canUseExportPdf(plan)) {
    return NextResponse.json(
      { error: "Export PDF și partajare link sunt disponibile în planul Pro sau Family+." },
      { status: 403 }
    );
  }
  const body = await request.json().catch(() => ({}));
  const regenerate = body.regenerate === true;
  const existingToken = (family as { shareToken?: string }).shareToken;
  let token: string;
  if (existingToken && !regenerate) {
    token = existingToken;
  } else {
    token = crypto.randomBytes(24).toString("base64url");
    await db.collection("families").updateOne(
      { _id: familyId },
      { $set: { shareToken: token, shareCreatedAt: new Date(), updatedAt: new Date() } }
    );
  }
  const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
  const shareUrl = `${baseUrl}/share/${token}`;
  return NextResponse.json({ shareUrl });
}
