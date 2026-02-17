import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";
import { getActiveFamily } from "@/lib/family";
import { getStripe, isStripeConfigured } from "@/lib/stripe";
import { ObjectId } from "mongodb";

export async function POST() {
  if (!isStripeConfigured()) {
    return NextResponse.json({ error: "Stripe nu este configurat." }, { status: 503 });
  }
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
  }

  const db = await getDb();
  const user = await db.collection("users").findOne(
    { _id: new ObjectId(session.user.id) },
    { projection: { familyId: 1 } }
  );
  const familyId = (user as { familyId?: unknown })?.familyId;
  if (!familyId) {
    return NextResponse.json({ error: "Nu aparțineți unei familii." }, { status: 400 });
  }

  const family = await getActiveFamily(db, new ObjectId(String(familyId)));
  if (!family) {
    return NextResponse.json({ error: "Familia nu există sau este dezactivată." }, { status: 403 });
  }

  const stripeCustomerId = (family as { stripeCustomerId?: string }).stripeCustomerId;
  if (!stripeCustomerId) {
    return NextResponse.json(
      { error: "Nu aveți un abonament plătit. Alegeți un plan pentru a vă gestiona abonamentul." },
      { status: 400 }
    );
  }

  const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
  const returnUrl = `${baseUrl}/account`;

  const stripe = getStripe();
  const portalSession = await stripe.billingPortal.sessions.create({
    customer: stripeCustomerId,
    return_url: returnUrl,
  });

  if (!portalSession.url) {
    return NextResponse.json({ error: "Nu s-a putut crea sesiunea portal." }, { status: 500 });
  }

  return NextResponse.json({ url: portalSession.url });
}
