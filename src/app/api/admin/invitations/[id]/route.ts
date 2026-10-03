import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import crypto from "crypto";
import { getDb } from "@/lib/mongodb";
import { requireAdminApi, logAdminAction } from "@/lib/admin";
import { sendFamilyInvitationEmail } from "@/lib/email";

const EXPIRY_DAYS = 14;

/**
 * POST { action: "resend" | "cancel" }
 * resend: prelungește invitația cu 14 zile (token nou dacă a expirat) și retrimite emailul.
 * cancel: marchează invitația ca anulată.
 */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdminApi();
  if (session instanceof NextResponse) return session;
  const { id } = await params;
  if (!ObjectId.isValid(id)) return NextResponse.json({ error: "ID invalid." }, { status: 400 });

  const db = await getDb();
  const inv = (await db.collection("invitations").findOne({ _id: new ObjectId(id) })) as
    | { _id: ObjectId; familyId: ObjectId; email: string; token: string; status: string; expiresAt?: Date }
    | null;
  if (!inv) return NextResponse.json({ error: "Invitație negăsită." }, { status: 404 });

  const body = await request.json().catch(() => ({}));
  const now = new Date();

  if (body.action === "cancel") {
    if (inv.status !== "pending") return NextResponse.json({ error: "Doar invitațiile în așteptare pot fi anulate." }, { status: 400 });
    await db.collection("invitations").updateOne({ _id: inv._id }, { $set: { status: "cancelled", updatedAt: now } });
    await logAdminAction(session, "Invitație anulată", { type: "family", id: String(inv.familyId) }, { email: inv.email });
    return NextResponse.json({ ok: true, status: "cancelled" });
  }

  if (body.action === "resend") {
    if (inv.status === "accepted") return NextResponse.json({ error: "Invitația a fost deja acceptată." }, { status: 400 });
    const expired = !inv.expiresAt || inv.expiresAt < now;
    const token = expired || inv.status !== "pending" ? crypto.randomBytes(24).toString("base64url") : inv.token;
    const expiresAt = new Date(now.getTime() + EXPIRY_DAYS * 24 * 60 * 60 * 1000);
    await db.collection("invitations").updateOne(
      { _id: inv._id },
      { $set: { token, status: "pending", expiresAt, lastReminderSentAt: now, updatedAt: now } }
    );
    const baseUrl = (process.env.NEXTAUTH_URL || "https://homesplit.ro").replace(/\/$/, "");
    const joinUrl = `${baseUrl}/join?token=${encodeURIComponent(token)}`;
    const emailSent = await sendFamilyInvitationEmail(inv.email, joinUrl, EXPIRY_DAYS);
    await logAdminAction(session, "Invitație retrimisă", { type: "family", id: String(inv.familyId) }, { email: inv.email, emailSent });
    return NextResponse.json({ ok: true, status: "pending", joinUrl, emailSent, expiresAt: expiresAt.toISOString() });
  }

  return NextResponse.json({ error: "Acțiune necunoscută." }, { status: 400 });
}
