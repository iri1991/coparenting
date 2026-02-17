#!/usr/bin/env node
/**
 * Creează automat în Stripe: produse (Pro, Family+), prețuri (lună/an RON) și webhook endpoint.
 * Afișează variabilele de mediu de adăugat în .env.
 *
 * Usage: node --env-file=.env scripts/setup-stripe.mjs
 * Necesită: STRIPE_SECRET_KEY, NEXTAUTH_URL (pentru URL webhook)
 */

import Stripe from "stripe";

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const NEXTAUTH_URL = process.env.NEXTAUTH_URL || "http://localhost:3000";
/** URL public pentru webhook (opțional). Ex.: https://abc.ngrok.io – dacă e setat, se folosește pentru crearea webhook-ului. */
const STRIPE_WEBHOOK_URL = process.env.STRIPE_WEBHOOK_URL;

const PRODUCTS = [
  { name: "HomeSplit Pro", idKey: "pro" },
  { name: "HomeSplit Family+", idKey: "family" },
];

const PRICES = [
  { productKey: "pro", interval: "month", amountRon: 39, envKey: "STRIPE_PRICE_PRO_MONTHLY" },
  { productKey: "pro", interval: "year", amountRon: 299, envKey: "STRIPE_PRICE_PRO_YEARLY" },
  { productKey: "family", interval: "month", amountRon: 59, envKey: "STRIPE_PRICE_FAMILY_MONTHLY" },
  { productKey: "family", interval: "year", amountRon: 449, envKey: "STRIPE_PRICE_FAMILY_YEARLY" },
];

const WEBHOOK_EVENTS = [
  "checkout.session.completed",
  "customer.subscription.updated",
  "customer.subscription.deleted",
  "invoice.payment_failed",
];

async function main() {
  if (!STRIPE_SECRET_KEY) {
    console.error("STRIPE_SECRET_KEY lipsește. Rulează cu: node --env-file=.env scripts/setup-stripe.mjs");
    process.exit(1);
  }

  const stripe = new Stripe(STRIPE_SECRET_KEY);
  const productIds = {};

  console.log("Creare produse Stripe...\n");

  for (const { name, idKey } of PRODUCTS) {
    const product = await stripe.products.create({
      name,
      description: idKey === "pro" ? "Plan Pro – până la 3 copii, propunere automată, documente, istoric." : "Plan Family+ – copii nelimitat, îngrijitori, export PDF, suport prioritar.",
    });
    productIds[idKey] = product.id;
    console.log(`  ${name} -> ${product.id}`);
  }

  console.log("\nCreare prețuri (RON)...\n");

  const priceIds = {};
  for (const { productKey, interval, amountRon, envKey } of PRICES) {
    const productId = productIds[productKey];
    const unitAmount = Math.round(amountRon * 100); // RON în bani
    const price = await stripe.prices.create({
      product: productId,
      currency: "ron",
      unit_amount: unitAmount,
      recurring: { interval: interval === "month" ? "month" : "year" },
    });
    priceIds[envKey] = price.id;
    console.log(`  ${envKey}: ${amountRon} RON/${interval} -> ${price.id}`);
  }

  const baseForWebhook = STRIPE_WEBHOOK_URL ? STRIPE_WEBHOOK_URL.replace(/\/$/, "") : NEXTAUTH_URL.replace(/\/$/, "");
  const webhookUrl = `${baseForWebhook}/api/stripe/webhook`;
  let isPublicUrl = false;
  try {
    isPublicUrl = !/localhost|127\.0\.0\.1/.test(new URL(webhookUrl).hostname);
  } catch (_) {
    // URL invalid
  }

  let webhookSecret = "";

  if (isPublicUrl) {
    console.log("\nCreare webhook endpoint...\n");
    console.log(`  URL: ${webhookUrl}`);
    try {
      const endpoint = await stripe.webhookEndpoints.create({
        url: webhookUrl,
        description: "HomeSplit – abonamente și checkout",
        enabled_events: WEBHOOK_EVENTS,
      });
      webhookSecret = endpoint.secret || "";
      if (endpoint.secret) {
        console.log(`  Webhook endpoint: ${endpoint.id}`);
        console.log(`  Signing secret: ${endpoint.secret}`);
      }
    } catch (err) {
      if (err.code === "StripeInvalidRequestError" && err.param === "url") {
        console.log("  Stripe nu acceptă acest URL (trebuie să fie public). Sari peste webhook.");
      } else {
        throw err;
      }
    }
  } else {
    console.log("\nWebhook: URL-ul este local – Stripe nu permite webhook pe localhost.");
    console.log("  Pentru development local, folosește Stripe CLI:");
    console.log("  stripe listen --forward-to localhost:3000/api/stripe/webhook");
    console.log("  și pune în .env STRIPE_WEBHOOK_SECRET=whsec_... (secretul afișat de CLI).");
  }

  console.log("\n--- Variabile de mediu de adăugat în .env ---\n");
  console.log("# Stripe (abonamente) – prețuri");
  console.log(`STRIPE_PRICE_PRO_MONTHLY=${priceIds.STRIPE_PRICE_PRO_MONTHLY || ""}`);
  console.log(`STRIPE_PRICE_PRO_YEARLY=${priceIds.STRIPE_PRICE_PRO_YEARLY || ""}`);
  console.log(`STRIPE_PRICE_FAMILY_MONTHLY=${priceIds.STRIPE_PRICE_FAMILY_MONTHLY || ""}`);
  console.log(`STRIPE_PRICE_FAMILY_YEARLY=${priceIds.STRIPE_PRICE_FAMILY_YEARLY || ""}`);
  if (webhookSecret) {
    console.log(`STRIPE_WEBHOOK_SECRET=${webhookSecret}`);
  } else {
    console.log("# STRIPE_WEBHOOK_SECRET=whsec_... (din Dashboard sau din 'stripe listen')");
  }
  console.log("\n# Publishable key: ia din Dashboard (Developers -> API keys):");
  console.log("# NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_... sau pk_live_...");
  console.log("\nGata.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
