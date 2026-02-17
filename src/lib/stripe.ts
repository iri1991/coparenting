import Stripe from "stripe";
import type { PlanType } from "@/types/plan";

let stripe: Stripe | null = null;

export function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error("STRIPE_SECRET_KEY is not set");
  }
  if (!stripe) {
    stripe = new Stripe(key);
  }
  return stripe;
}

export interface StripePriceIds {
  proMonthly: string;
  proYearly: string;
  familyMonthly: string;
  familyYearly: string;
}

export function getStripePriceIds(): StripePriceIds {
  const proMonthly = process.env.STRIPE_PRICE_PRO_MONTHLY;
  const proYearly = process.env.STRIPE_PRICE_PRO_YEARLY;
  const familyMonthly = process.env.STRIPE_PRICE_FAMILY_MONTHLY;
  const familyYearly = process.env.STRIPE_PRICE_FAMILY_YEARLY;
  if (!proMonthly || !proYearly || !familyMonthly || !familyYearly) {
    throw new Error(
      "Stripe price IDs not set: STRIPE_PRICE_PRO_MONTHLY, STRIPE_PRICE_PRO_YEARLY, STRIPE_PRICE_FAMILY_MONTHLY, STRIPE_PRICE_FAMILY_YEARLY"
    );
  }
  return { proMonthly, proYearly, familyMonthly, familyYearly };
}

/** Mapează un Stripe Price ID la planul nostru (pro | family). */
export function stripePriceIdToPlan(priceId: string): PlanType | null {
  const ids = getStripePriceIds();
  if (priceId === ids.proMonthly || priceId === ids.proYearly) return "pro";
  if (priceId === ids.familyMonthly || priceId === ids.familyYearly) return "family";
  return null;
}

/** Verifică dacă Stripe este configurat (toate env-urile). */
export function isStripeConfigured(): boolean {
  return !!(
    process.env.STRIPE_SECRET_KEY &&
    process.env.STRIPE_WEBHOOK_SECRET &&
    process.env.STRIPE_PRICE_PRO_MONTHLY &&
    process.env.STRIPE_PRICE_PRO_YEARLY &&
    process.env.STRIPE_PRICE_FAMILY_MONTHLY &&
    process.env.STRIPE_PRICE_FAMILY_YEARLY
  );
}
