import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { auth } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";
import { getActiveFamily } from "@/lib/family";

/** POST: acceptă invitația prin token. Body: { token }. Userul curent este adăugat în familie. */
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Trebuie să fii autentificat pentru a accepta invitația." }, { status: 401 });
  }
  const body = await request.json().catch(() => ({}));
  const token = typeof body.token === "string" ? body.token.trim() : "";
  if (!token) {
    return NextResponse.json({ error: "Token lipsă." }, { status: 400 });
  }
  const db = await getDb();
  const inv = await db.collection("invitations").findOne({
    token,
    status: "pending",
  });
  if (!inv) {
    return NextResponse.json({ error: "Invitație invalidă sau deja folosită." }, { status: 400 });
  }
  const invDoc = inv as unknown as { expiresAt: Date; familyId: ObjectId; email: string };
  if (new Date() > new Date(invDoc.expiresAt)) {
    await db.collection("invitations").updateOne(
      { _id: inv._id },
      { $set: { status: "expired", updatedAt: new Date() } }
    );
    return NextResponse.json({ error: "Invitația a expirat." }, { status: 400 });
  }
  const familyId = invDoc.familyId;
  const family = await getActiveFamily(db, familyId);
  if (!family) {
    return NextResponse.json(
      { error: "Familia nu există sau a fost dezactivată. Nu se poate accepta invitația." },
      { status: 403 }
    );
  }
  const memberIds = family.memberIds || [];
  if (memberIds.includes(session.user.id)) {
    await db.collection("invitations").updateOne(
      { _id: inv._id },
      { $set: { status: "accepted", acceptedAt: new Date(), updatedAt: new Date() } }
    );
    return NextResponse.json({ ok: true, alreadyMember: true });
  }
  if (memberIds.length >= 2) {
    return NextResponse.json({ error: "Familia are deja doi membri." }, { status: 400 });
  }
  const now = new Date();
  await db.collection("families").updateOne(
    { _id: familyId },
    { $set: { memberIds: [...memberIds, session.user.id], updatedAt: now } }
  );
  await db.collection("users").updateOne(
    { _id: new ObjectId(session.user.id) },
    { $set: { familyId, updatedAt: now } }
  );
  await db.collection("invitations").updateOne(
    { _id: inv._id },
    { $set: { status: "accepted", acceptedAt: now, updatedAt: now } }
  );
  return NextResponse.json({ ok: true });
}
