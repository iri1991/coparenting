import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";
import { requireAdminApi, logAdminAction, isAdminEmail } from "@/lib/admin";
import { removeUserFromFamily } from "@/lib/admin-actions";
import { createPasswordResetAndSend } from "@/lib/password-reset";
import { getSubscriptionsForUsers, isPushConfigured, sendPushToSubscriptions } from "@/lib/push";

type UserDoc = { _id: ObjectId; email?: string; name?: string; familyId?: ObjectId | null };

async function loadUser(id: string): Promise<UserDoc | null> {
  if (!ObjectId.isValid(id)) return null;
  const db = await getDb();
  return (await db.collection("users").findOne({ _id: new ObjectId(id) }, { projection: { email: 1, name: 1, familyId: 1 } })) as UserDoc | null;
}

/**
 * POST: acțiuni pe un utilizator.
 * body.action: "reset-password" | "test-push" | "remove-from-family"
 */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdminApi();
  if (session instanceof NextResponse) return session;
  const { id } = await params;
  const user = await loadUser(id);
  if (!user) return NextResponse.json({ error: "Utilizator negăsit." }, { status: 404 });

  const body = await request.json().catch(() => ({}));
  const action = body.action;

  if (action === "reset-password") {
    if (!user.email) return NextResponse.json({ error: "Utilizatorul nu are email." }, { status: 400 });
    // Link valabil 24h ca adminul să-l poată trimite și manual.
    const { resetUrl, sent } = await createPasswordResetAndSend(user.email, 24);
    await logAdminAction(session, "Link resetare parolă generat", { type: "user", id }, { email: user.email, emailSent: sent });
    return NextResponse.json({ ok: true, resetUrl, emailSent: sent });
  }

  if (action === "test-push") {
    if (!isPushConfigured()) return NextResponse.json({ error: "Push nu este configurat (VAPID)." }, { status: 400 });
    const subs = await getSubscriptionsForUsers([id]);
    if (subs.length === 0) return NextResponse.json({ error: "Utilizatorul nu are dispozitive abonate la notificări." }, { status: 400 });
    const title = typeof body.title === "string" && body.title.trim() ? body.title.trim().slice(0, 80) : "Test HomeSplit";
    const text = typeof body.body === "string" && body.body.trim() ? body.body.trim().slice(0, 200) : "Aceasta este o notificare de test trimisă de echipa HomeSplit.";
    await sendPushToSubscriptions(subs, { title, body: text, url: "/app" });
    await logAdminAction(session, "Notificare push trimisă", { type: "user", id }, { email: user.email, title, devices: subs.length });
    return NextResponse.json({ ok: true, devices: subs.length });
  }

  if (action === "remove-from-family") {
    if (!user.familyId) return NextResponse.json({ error: "Utilizatorul nu face parte dintr-o familie." }, { status: 400 });
    const familyId = new ObjectId(String(user.familyId));
    const result = await removeUserFromFamily(id, familyId);
    await logAdminAction(session, "Utilizator scos din familie", { type: "family", id: String(familyId) }, { userId: id, email: user.email, ...result });
    return NextResponse.json({ ok: true, ...result });
  }

  return NextResponse.json({ error: "Acțiune necunoscută." }, { status: 400 });
}

/** DELETE: șterge contul. Necesită body.confirmEmail egal cu emailul utilizatorului. */
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdminApi();
  if (session instanceof NextResponse) return session;
  const { id } = await params;
  const user = await loadUser(id);
  if (!user) return NextResponse.json({ error: "Utilizator negăsit." }, { status: 404 });

  const body = await request.json().catch(() => ({}));
  const confirmEmail = typeof body.confirmEmail === "string" ? body.confirmEmail.toLowerCase().trim() : "";
  if (!user.email || confirmEmail !== user.email.toLowerCase()) {
    return NextResponse.json({ error: "Confirmă scriind exact emailul utilizatorului." }, { status: 400 });
  }
  if (id === session.user.id || isAdminEmail(user.email)) {
    return NextResponse.json({ error: "Nu poți șterge un cont de admin." }, { status: 400 });
  }

  const db = await getDb();
  let familyDeactivated = false;
  if (user.familyId) {
    ({ familyDeactivated } = await removeUserFromFamily(id, new ObjectId(String(user.familyId))));
  }
  await Promise.all([
    db.collection("push_subscriptions").deleteMany({ userId: id }),
    db.collection("password_reset_tokens").deleteMany({ email: user.email }),
    db.collection("users").deleteOne({ _id: user._id }),
  ]);
  await logAdminAction(
    session,
    "Cont șters",
    { type: "user", id },
    { email: user.email, familyId: user.familyId ? String(user.familyId) : null, familyDeactivated }
  );
  return NextResponse.json({ ok: true, familyDeactivated });
}
