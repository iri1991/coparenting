import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { auth } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";
import { getActiveFamily } from "@/lib/family";
import { sendEmail } from "@/lib/email";
import type { Invitation } from "@/types/family";
import crypto from "crypto";

const TOKEN_BYTES = 24;
const EXPIRY_DAYS = 14;

function toInvitation(doc: {
  _id: unknown;
  familyId: string;
  email: string;
  invitedByUserId: string;
  token: string;
  status: string;
  expiresAt: Date;
  acceptedAt?: Date | null;
  createdAt: Date;
}): Invitation {
  return {
    id: String(doc._id),
    familyId: String(doc.familyId),
    email: doc.email,
    invitedByUserId: doc.invitedByUserId,
    token: doc.token,
    status: doc.status as Invitation["status"],
    expiresAt: doc.expiresAt.toISOString(),
    acceptedAt: doc.acceptedAt?.toISOString(),
    createdAt: doc.createdAt.toISOString(),
  };
}

async function getFamilyIdForUser(db: Awaited<ReturnType<typeof getDb>>, userId: string): Promise<ObjectId | null> {
  const user = await db.collection("users").findOne(
    { _id: new ObjectId(userId) },
    { projection: { familyId: 1 } }
  );
  const fid = (user as { familyId?: unknown })?.familyId;
  if (!fid) return null;
  try {
    return new ObjectId(String(fid));
  } catch {
    return null;
  }
}

/** POST: creează o invitație (email + link). Doar creatorul familiei sau celălalt membru. */
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
  }
  const db = await getDb();
  const familyId = await getFamilyIdForUser(db, session.user.id);
  if (!familyId) {
    return NextResponse.json({ error: "Nu aparțineți unei familii." }, { status: 400 });
  }
  const family = await getActiveFamily(db, familyId);
  if (!family) {
    return NextResponse.json(
      { error: "Familia nu există sau a fost dezactivată. Contactați suportul." },
      { status: 403 }
    );
  }
  const memberIds = family.memberIds || [];
  if (memberIds.length >= 2) {
    return NextResponse.json(
      { error: "Familia are deja doi membri. Nu se mai pot trimite invitații." },
      { status: 400 }
    );
  }
  const body = await request.json().catch(() => ({}));
  const email = typeof body.email === "string" ? body.email.toLowerCase().trim() : "";
  if (!email) {
    return NextResponse.json({ error: "Email-ul este obligatoriu." }, { status: 400 });
  }
  const existingMember = await db.collection("users").findOne(
    { email, familyId },
    { projection: { _id: 1 } }
  );
  if (existingMember) {
    return NextResponse.json({ error: "Acest utilizator face deja parte din familie." }, { status: 400 });
  }
  const token = crypto.randomBytes(TOKEN_BYTES).toString("base64url");
  const now = new Date();
  const expiresAt = new Date(now);
  expiresAt.setDate(expiresAt.getDate() + EXPIRY_DAYS);
  const { insertedId } = await db.collection("invitations").insertOne({
    familyId,
    email,
    invitedByUserId: session.user.id,
    token,
    status: "pending",
    expiresAt,
    createdAt: now,
  });
  const doc = await db.collection("invitations").findOne({ _id: insertedId });
  const inv = toInvitation(doc as Parameters<typeof toInvitation>[0]);
  const baseUrl = process.env.NEXTAUTH_URL || request.url.replace(/\/api\/invitations\/?$/, "");
  const joinUrl = `${baseUrl}/join?token=${encodeURIComponent(token)}`;

  let emailSent = false;
  try {
    emailSent = await sendEmail({
      to: email,
      subject: "Invitație HomeSplit – alătură-te familiei",
      html: `
        <p>Ai fost invitat(ă) să te alături unei familii pe HomeSplit.</p>
        <p><strong><a href="${joinUrl}">Acceptă invitația</a></strong></p>
        <p>Link direct: ${joinUrl}</p>
        <p>Linkul expiră în ${EXPIRY_DAYS} zile.</p>
      `,
      text: `Invitație HomeSplit. Acceptă aici: ${joinUrl} (expiră în ${EXPIRY_DAYS} zile.)`,
    });
  } catch (_) {
    // răspunsul nu depinde de email
  }

  return NextResponse.json({ invitation: inv, joinUrl, emailSent });
}
