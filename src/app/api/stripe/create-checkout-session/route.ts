import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";
import { getActiveFamily } from "@/lib/family";
import { getStripe, getStripePriceIds, stripePriceIdToPlan, isStripeConfigured } from "@/lib/stripe";
import { ObjectId } from "mongodb";

export async function POST(request: Request) {
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
    { projection: { familyId: 1, email: 1 } }
  );
  const familyId = (user as { familyId?: unknown })?.familyId;
  if (!familyId) {
    return NextResponse.json({ error: "Nu aparțineți unei familii." }, { status: 400 });
  }

  const oid = new ObjectId(String(familyId));
  const family = await getActiveFamily(db, oid);
  if (!family) {
    return NextResponse.json({ error: "Familia nu există sau este dezactivată." }, { status: 403 });
  }

  const body = await request.json().catch(() => ({}));
  const priceIds = getStripePriceIds();
  let priceId: string | undefined = body.priceId;

  if (priceId && typeof priceId === "string") {
    const validIds = [priceIds.proMonthly, priceIds.proYearly, priceIds.familyMonthly, priceIds.familyYearly];
    if (!validIds.includes(priceId)) {
      return NextResponse.json({ error: "Price ID invalid." }, { status: 400 });
    }
  } else {
    const plan = body.plan as string | undefined;
    const interval = body.interval as string | undefined;
    if (plan === "pro" && interval === "month") priceId = priceIds.proMonthly;
    else if (plan === "pro" && interval === "year") priceId = priceIds.proYearly;
    else if (plan === "family" && interval === "month") priceId = priceIds.familyMonthly;
    else if (plan === "family" && interval === "year") priceId = priceIds.familyYearly;
    if (!priceId) {
      return NextResponse.json(
        { error: "Trimite priceId sau plan (pro|family) și interval (month|year)." },
        { status: 400 }
      );
    }
  }

  const stripe = getStripe();
  const plan = stripePriceIdToPlan(priceId);
  if (!plan) {
    return NextResponse.json({ error: "Plan invalid." }, { status: 400 });
  }

  let customerId = (family as { stripeCustomerId?: string }).stripeCustomerId;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: (user as { email?: string }).email ?? undefined,
      metadata: { familyId: String(family._id) },
    });
    customerId = customer.id;
    await db.collection("families").updateOne(
      { _id: oid },
      { $set: { stripeCustomerId: customerId, updatedAt: new Date() } }
    );
  }

  const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
  const successUrl = `${baseUrl}/account?stripe=success`;
  const cancelUrl = `${baseUrl}/account?stripe=cancel`;

  const subscriptionData: { trial_period_days?: number } = {};
  if (plan === "pro" && (priceId === priceIds.proMonthly || priceId === priceIds.proYearly)) {
    subscriptionData.trial_period_days = 14;
  }

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    subscription_data: Object.keys(subscriptionData).length > 0 ? subscriptionData : undefined,
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: { familyId: String(family._id) },
    allow_promotion_codes: true,
  });

  if (!checkoutSession.url) {
    return NextResponse.json({ error: "Nu s-a putut crea sesiunea de checkout." }, { status: 500 });
  }

  return NextResponse.json({ url: checkoutSession.url });
}
