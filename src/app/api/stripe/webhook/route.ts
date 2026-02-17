import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";
import { getStripe, stripePriceIdToPlan, isStripeConfigured } from "@/lib/stripe";
import Stripe from "stripe";

export async function POST(request: Request) {
  if (!isStripeConfigured()) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 503 });
  }
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;
  let event: Stripe.Event;
  const body = await request.text();
  const sig = request.headers.get("stripe-signature");
  if (!sig) {
    return NextResponse.json({ error: "Missing stripe-signature" }, { status: 400 });
  }
  try {
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: `Webhook signature verification failed: ${message}` }, { status: 400 });
  }

  const db = await getDb();

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.mode !== "subscription" || !session.subscription) break;
      const familyId = session.metadata?.familyId;
      if (!familyId) break;
      const stripe = getStripe();
      const subscription = await stripe.subscriptions.retrieve(session.subscription as string, {
        expand: ["items.data.price"],
      }) as Stripe.Subscription & { current_period_end?: number };
      const item = subscription.items.data[0];
      const priceId = item?.price?.id;
      const plan = priceId ? stripePriceIdToPlan(priceId) : null;
      const status = subscription.status;
      const currentPeriodEnd = subscription.current_period_end
        ? new Date(subscription.current_period_end * 1000).toISOString()
        : undefined;

      await db.collection("families").updateOne(
        { _id: new ObjectId(familyId) },
        {
          $set: {
            stripeCustomerId: session.customer as string,
            stripeSubscriptionId: subscription.id,
            stripePriceId: priceId ?? undefined,
            subscriptionStatus: status,
            currentPeriodEnd: currentPeriodEnd ?? undefined,
            plan: plan ?? undefined,
            updatedAt: new Date(),
          },
        }
      );
      break;
    }

    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription & { current_period_end?: number };
      const familyDoc = await db.collection("families").findOne({ stripeSubscriptionId: subscription.id });
      if (!familyDoc) break;

      const item = subscription.items.data[0];
      const priceId = item?.price?.id;
      const plan = priceId ? stripePriceIdToPlan(priceId) : null;
      const status = subscription.status;
      const currentPeriodEnd = subscription.current_period_end
        ? new Date(subscription.current_period_end * 1000).toISOString()
        : undefined;

      const update: Record<string, unknown> = {
        subscriptionStatus: status,
        currentPeriodEnd: currentPeriodEnd ?? undefined,
        stripePriceId: priceId ?? undefined,
        updatedAt: new Date(),
      };
      if (event.type === "customer.subscription.deleted" || status === "canceled" || status === "unpaid") {
        update.plan = "free";
        update.stripeSubscriptionId = null;
      } else if (plan) {
        update.plan = plan;
      }

      await db.collection("families").updateOne(
        { _id: familyDoc._id },
        { $set: update }
      );
      break;
    }

    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice & { subscription?: string | { id?: string } | null };
      const sub = invoice.subscription;
      const subscriptionId = typeof sub === "string" ? sub : sub?.id ?? null;
      if (!subscriptionId) break;
      const familyDoc = await db.collection("families").findOne({ stripeSubscriptionId: subscriptionId });
      if (!familyDoc) break;
      await db.collection("families").updateOne(
        { _id: familyDoc._id },
        { $set: { subscriptionStatus: "past_due", updatedAt: new Date() } }
      );
      break;
    }

    default:
      break;
  }

  return NextResponse.json({ received: true });
}
